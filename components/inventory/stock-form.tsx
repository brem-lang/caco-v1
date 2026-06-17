"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { createInventoryItem, updateInventoryItem } from "@/actions/inventory"
import { inventoryItemSchema, type InventoryItemFormValues } from "@/lib/validations/inventory"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Database } from "@/types/supabase"

type InventoryItem = Database["public"]["Tables"]["inventory_items"]["Row"]

export const StockForm = ({ item }: { item?: InventoryItem }) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const form = useForm<InventoryItemFormValues>({
    resolver: zodResolver(inventoryItemSchema),
    defaultValues: {
      name: item?.name ?? "",
      unit: item?.unit ?? "",
      current_stock: item?.current_stock ?? 0,
      minimum_stock: item?.minimum_stock ?? 0,
      cost_per_unit: item?.cost_per_unit ?? undefined,
      supplier: item?.supplier ?? "",
    },
  })

  const onSubmit = (values: InventoryItemFormValues) => {
    startTransition(async () => {
      const result = item
        ? await updateInventoryItem(item.id, values)
        : await createInventoryItem(values)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(item ? "Item updated" : "Item created")
        router.push("/inventory")
      }
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Item Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit *</Label>
              <Input id="unit" placeholder="kg, liters, pcs..." {...form.register("unit")} />
              {form.formState.errors.unit && (
                <p className="text-xs text-destructive">{form.formState.errors.unit.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="current_stock">Current Stock</Label>
              <Input
                id="current_stock"
                type="number"
                min="0"
                step="0.01"
                {...form.register("current_stock", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minimum_stock">Minimum Stock (alert threshold)</Label>
              <Input
                id="minimum_stock"
                type="number"
                min="0"
                step="0.01"
                {...form.register("minimum_stock", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cost_per_unit">Cost per Unit (₱)</Label>
              <Input
                id="cost_per_unit"
                type="number"
                min="0"
                step="0.01"
                {...form.register("cost_per_unit", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Input id="supplier" {...form.register("supplier")} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={() => router.push("/inventory")}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : item ? "Update Item" : "Create Item"}
        </Button>
      </div>
    </form>
  )
}
