"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { addIngredient, removeIngredient, updateIngredient } from "@/actions/products"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { FlaskConicalIcon, PlusIcon, Trash2Icon, PencilIcon, CheckIcon, XIcon } from "lucide-react"
import type { Database } from "@/types/supabase"

type InventoryItem = Database["public"]["Tables"]["inventory_items"]["Row"]
type Ingredient = Database["public"]["Tables"]["product_ingredients"]["Row"] & {
  inventory_items: Pick<InventoryItem, "name" | "unit">
}

type Props = {
  productId: string
  productName: string
  ingredients: Ingredient[]
  inventoryItems: InventoryItem[]
}

export const RecipeManager = ({ productId, productName, ingredients, inventoryItems }: Props) => {
  const [isPending, startTransition] = useTransition()

  // Add form state
  const [selectedItem, setSelectedItem] = useState("")
  const [quantity, setQuantity] = useState("")

  // Edit state: ingredientId → draft quantity string
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editQty, setEditQty] = useState("")

  const usedItemIds = new Set(ingredients.map((i) => i.inventory_item_id))
  const availableItems = inventoryItems.filter((item) => !usedItemIds.has(item.id))

  const handleAdd = () => {
    const qty = parseFloat(quantity)
    if (!selectedItem || isNaN(qty) || qty <= 0) {
      toast.error("Select an ingredient and enter a valid quantity")
      return
    }
    startTransition(async () => {
      const result = await addIngredient(productId, selectedItem, qty)
      if (result.error) toast.error(result.error)
      else {
        toast.success("Ingredient added")
        setSelectedItem("")
        setQuantity("")
      }
    })
  }

  const handleRemove = (ingredientId: string) => {
    startTransition(async () => {
      const result = await removeIngredient(ingredientId, productId)
      if (result.error) toast.error(result.error)
      else toast.success("Ingredient removed")
    })
  }

  const startEdit = (ingredient: Ingredient) => {
    setEditingId(ingredient.id)
    setEditQty(String(ingredient.quantity_used))
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditQty("")
  }

  const handleUpdate = (ingredientId: string) => {
    const qty = parseFloat(editQty)
    if (isNaN(qty) || qty <= 0) {
      toast.error("Enter a valid quantity")
      return
    }
    startTransition(async () => {
      const result = await updateIngredient(ingredientId, qty, productId)
      if (result.error) toast.error(result.error)
      else {
        toast.success("Quantity updated")
        setEditingId(null)
        setEditQty("")
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FlaskConicalIcon className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold">Recipe / Ingredients</h2>
        <span className="text-xs text-muted-foreground">
          — deducted from inventory each time this product is sold
        </span>
      </div>

      {/* Existing ingredients table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ingredient</TableHead>
              <TableHead className="w-36 text-right">Qty per sale</TableHead>
              <TableHead className="w-14" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {ingredients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-20 text-center text-sm text-muted-foreground">
                  No ingredients yet. Add one below to enable inventory tracking.
                </TableCell>
              </TableRow>
            ) : (
              ingredients.map((ing) => (
                <TableRow key={ing.id}>
                  <TableCell className="font-medium">
                    {ing.inventory_items.name}
                    <span className="ml-1.5 text-xs text-muted-foreground">
                      ({ing.inventory_items.unit})
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {editingId === ing.id ? (
                      <div className="flex items-center justify-end gap-1">
                        <Input
                          type="number"
                          min="0.001"
                          step="0.001"
                          className="h-7 w-24 text-right text-sm"
                          value={editQty}
                          onChange={(e) => setEditQty(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleUpdate(ing.id)
                            if (e.key === "Escape") cancelEdit()
                          }}
                          autoFocus
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          disabled={isPending}
                          onClick={() => handleUpdate(ing.id)}
                        >
                          <CheckIcon className="h-3.5 w-3.5 text-green-600" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={cancelEdit}
                        >
                          <XIcon className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <button
                        className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-sm font-medium hover:bg-muted transition-colors"
                        onClick={() => startEdit(ing)}
                      >
                        {ing.quantity_used}
                        <PencilIcon className="h-3 w-3 text-muted-foreground" />
                      </button>
                    )}
                  </TableCell>
                  <TableCell>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          disabled={isPending}
                        >
                          <Trash2Icon className="h-3.5 w-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove ingredient?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will stop deducting{" "}
                            <strong>{ing.inventory_items.name}</strong> from inventory
                            when <strong>{productName}</strong> is sold.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => handleRemove(ing.id)}
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add ingredient row */}
      {availableItems.length > 0 ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1">
            <p className="text-xs text-muted-foreground">Ingredient</p>
            <Select value={selectedItem} onValueChange={setSelectedItem}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select inventory item…" />
              </SelectTrigger>
              <SelectContent>
                {availableItems.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                    <span className="ml-1.5 text-muted-foreground">({item.unit})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-36 space-y-1">
            <p className="text-xs text-muted-foreground">
              Qty per sale
              {selectedItem && (
                <span className="ml-1 text-foreground font-medium">
                  ({inventoryItems.find((i) => i.id === selectedItem)?.unit})
                </span>
              )}
            </p>
            <Input
              type="number"
              min="0.001"
              step="0.001"
              placeholder="e.g. 18"
              className="h-9"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleAdd() }}
            />
          </div>
          <Button
            className="h-9 gap-1.5 shrink-0"
            disabled={isPending || !selectedItem || !quantity}
            onClick={handleAdd}
          >
            <PlusIcon className="h-4 w-4" />
            Add
          </Button>
        </div>
      ) : ingredients.length > 0 ? (
        <p className="text-xs text-muted-foreground">
          All inventory items have been added to this recipe.
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          No inventory items found.{" "}
          <a href="/inventory" className="text-primary underline underline-offset-2">
            Add inventory items
          </a>{" "}
          first.
        </p>
      )}
    </div>
  )
}
