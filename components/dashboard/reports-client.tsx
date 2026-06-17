"use client"

import { useState, useMemo } from "react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TablePagination } from "@/components/ui/table-pagination"
import { DownloadIcon } from "lucide-react"
import type { Database } from "@/types/supabase"

type Order = Database["public"]["Tables"]["orders"]["Row"] & {
  order_items: Database["public"]["Tables"]["order_items"]["Row"][]
}

const PRODUCT_PAGE_SIZE = 10

export const ReportsClient = ({ orders }: { orders: Order[] }) => {
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    return d.toISOString().split("T")[0]
  })
  const [toDate, setToDate] = useState(() => new Date().toISOString().split("T")[0])
  const [productPage, setProductPage] = useState(1)

  const filtered = useMemo(() => {
    const from = new Date(fromDate)
    const to = new Date(toDate)
    to.setHours(23, 59, 59, 999)
    return orders.filter((o) => {
      const d = new Date(o.created_at)
      return d >= from && d <= to
    })
  }, [orders, fromDate, toDate])

  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, o) => ({
        gross: acc.gross + (o.subtotal ?? 0),
        discount: acc.discount + (o.discount ?? 0),
        tax: acc.tax + (o.tax ?? 0),
        net: acc.net + (o.total ?? 0),
        count: acc.count + 1,
      }),
      { gross: 0, discount: 0, tax: 0, net: 0, count: 0 }
    )
  }, [filtered])

  const productPerformance = useMemo(() => {
    const map = new Map<string, { name: string; quantity: number; revenue: number }>()
    for (const order of filtered) {
      for (const item of order.order_items ?? []) {
        const existing = map.get(item.product_name)
        if (existing) {
          existing.quantity += item.quantity
          existing.revenue += item.subtotal
        } else {
          map.set(item.product_name, {
            name: item.product_name,
            quantity: item.quantity,
            revenue: item.subtotal,
          })
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue)
  }, [filtered])

  const productTotalPages = Math.max(1, Math.ceil(productPerformance.length / PRODUCT_PAGE_SIZE))
  const productCurrentPage = Math.min(productPage, productTotalPages)
  const paginatedProducts = productPerformance.slice(
    (productCurrentPage - 1) * PRODUCT_PAGE_SIZE,
    productCurrentPage * PRODUCT_PAGE_SIZE
  )

  const exportCsv = () => {
    const rows = [
      ["Order #", "Date", "Payment", "Subtotal", "Discount", "Tax", "Total"],
      ...filtered.map((o) => [
        o.order_number,
        formatDate(o.created_at),
        o.payment_method,
        o.subtotal,
        o.discount,
        o.tax,
        o.total,
      ]),
    ]
    const csv = rows.map((r) => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `sales-report-${fromDate}-to-${toDate}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:gap-4">
        <div className="space-y-1">
          <Label className="text-xs">From</Label>
          <Input
            type="date"
            className="h-8 w-full sm:w-36"
            value={fromDate}
            onChange={(e) => { setFromDate(e.target.value); setProductPage(1) }}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">To</Label>
          <Input
            type="date"
            className="h-8 w-full sm:w-36"
            value={toDate}
            onChange={(e) => { setToDate(e.target.value); setProductPage(1) }}
          />
        </div>
        <Button size="sm" variant="outline" onClick={exportCsv} className="h-8 self-end">
          <DownloadIcon className="h-3.5 w-3.5 mr-1" />
          Export CSV
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Orders", value: totals.count.toString() },
          { label: "Gross Sales", value: formatCurrency(totals.gross) },
          { label: "Total Discounts", value: formatCurrency(totals.discount) },
          { label: "Net Revenue", value: formatCurrency(totals.net) },
        ].map(({ label, value }) => (
          <Card key={label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground">{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="text-base font-semibold mb-3">Product Performance</h2>
        <div className="rounded-md border">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Units Sold</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                      No sales in this period
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedProducts.map((product, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="text-right">{product.quantity}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(product.revenue)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <TablePagination
            page={productCurrentPage}
            totalPages={productTotalPages}
            totalItems={productPerformance.length}
            pageSize={PRODUCT_PAGE_SIZE}
            onPageChange={setProductPage}
          />
        </div>
      </div>
    </div>
  )
}
