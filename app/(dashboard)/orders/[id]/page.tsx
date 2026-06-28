import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { updateOrderStatus } from "@/actions/orders"
import { formatCurrency, formatDate } from "@/lib/utils"
import { OrderStatusBadge } from "@/components/orders/order-status-badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .single()

  if (!order) notFound()

  const statuses = ["pending", "preparing", "ready", "completed", "cancelled"] as const

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/orders">Orders</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>#{order.order_number}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-3xl">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">Order #{order.order_number}</h1>
          <OrderStatusBadge status={order.status} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground">Date</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">{formatDate(order.created_at)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground">Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">{order.customer_name ?? "—"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground">Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="outline" className="uppercase">{order.payment_method}</Badge>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold">{formatCurrency(order.total ?? 0)}</p>
            </CardContent>
          </Card>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.order_items?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <p className="font-medium">{item.product_name}</p>
                    {item.variant_name && (
                      <p className="text-xs text-muted-foreground">{item.variant_name}</p>
                    )}
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(item.subtotal)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-end">
          <div className="w-56 space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotal ?? 0)}</span>
            </div>
            {(order.discount ?? 0) > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-{formatCurrency(order.discount ?? 0)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>{formatCurrency(order.total ?? 0)}</span>
            </div>
          </div>
        </div>

        {order.status !== "completed" && order.status !== "cancelled" && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Update Status</p>
            <form className="flex flex-wrap gap-2">
              {statuses
                .filter((s) => s !== order.status && s !== "cancelled")
                .map((status) => (
                  <button
                    key={status}
                    formAction={async () => {
                      "use server"
                      await updateOrderStatus(id, { status })
                    }}
                    className="rounded-md border px-3 py-1.5 text-sm font-medium capitalize hover:bg-accent transition-colors"
                  >
                    Mark as {status}
                  </button>
                ))}
              <button
                formAction={async () => {
                  "use server"
                  await updateOrderStatus(id, { status: "cancelled" })
                }}
                className="rounded-md border border-destructive px-3 py-1.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
              >
                Cancel Order
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  )
}
