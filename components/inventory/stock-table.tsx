"use client"

import Link from "next/link"
import { useTransition, useState } from "react"
import { toast } from "sonner"
import { restockItem, deleteInventoryItem } from "@/actions/inventory"
import { formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"
import type { InventoryItemWithStatus } from "@/types/inventory"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { TablePagination } from "@/components/ui/table-pagination"
import { PencilIcon, Trash2Icon, PackagePlusIcon, SearchIcon } from "lucide-react"

const PAGE_SIZE = 15

export const StockTable = ({ items }: { items: InventoryItemWithStatus[] }) => {
  const [restockTarget, setRestockTarget] = useState<InventoryItemWithStatus | null>(null)
  const [restockQty, setRestockQty] = useState("")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [isPending, startTransition] = useTransition()

  const filtered = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    (item.supplier ?? "").toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const handleRestock = () => {
    if (!restockTarget) return
    const qty = parseFloat(restockQty)
    if (isNaN(qty) || qty <= 0) {
      toast.error("Enter a valid quantity")
      return
    }
    startTransition(async () => {
      const result = await restockItem(restockTarget.id, { quantity: qty })
      if (result.error) toast.error(result.error)
      else {
        toast.success("Stock restocked")
        setRestockTarget(null)
        setRestockQty("")
      }
    })
  }

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return
    startTransition(async () => {
      const result = await deleteInventoryItem(id)
      if (result.error) toast.error(result.error)
      else toast.success("Item deleted")
    })
  }

  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1 sm:max-w-xs">
          <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            className="h-8 pl-8"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden sm:table-cell">Unit</TableHead>
                <TableHead className="text-right">Current</TableHead>
                <TableHead className="hidden sm:table-cell text-right">Minimum</TableHead>
                <TableHead className="hidden md:table-cell">Cost/Unit</TableHead>
                <TableHead className="hidden lg:table-cell">Supplier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    {search ? "No items match your search" : "No inventory items yet"}
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((item) => (
                  <TableRow key={item.id} className={cn(item.isLowStock && "bg-destructive/5")}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">{item.unit}</TableCell>
                    <TableCell className={cn("text-right font-mono", item.isLowStock && "text-destructive font-semibold")}>
                      {item.current_stock}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-right font-mono text-muted-foreground">
                      {item.minimum_stock}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {item.cost_per_unit != null ? formatCurrency(item.cost_per_unit) : "—"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {item.supplier ?? "—"}
                    </TableCell>
                    <TableCell>
                      {item.isLowStock ? (
                        <Badge variant="destructive" className="text-xs">Low</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">OK</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          title="Restock"
                          onClick={() => { setRestockTarget(item); setRestockQty("") }}
                        >
                          <PackagePlusIcon className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8" asChild>
                          <Link href={`/inventory/${item.id}`}>
                            <PencilIcon className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(item.id, item.name)}
                          disabled={isPending}
                        >
                          <Trash2Icon className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <TablePagination
          page={currentPage}
          totalPages={totalPages}
          totalItems={filtered.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      </div>

      <Dialog open={!!restockTarget} onOpenChange={(o) => !o && setRestockTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Restock — {restockTarget?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Current stock: <strong>{restockTarget?.current_stock} {restockTarget?.unit}</strong>
            </p>
            <div className="space-y-2">
              <Label>Quantity to add ({restockTarget?.unit})</Label>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0"
                value={restockQty}
                onChange={(e) => setRestockQty(e.target.value)}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setRestockTarget(null)}>Cancel</Button>
              <Button onClick={handleRestock} disabled={isPending}>
                {isPending ? "Restocking..." : "Restock"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
