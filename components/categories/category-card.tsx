"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { deleteCategory, updateCategory } from "@/actions/products"
import { CategoryFormDialog } from "@/components/categories/category-form-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
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
import { PencilIcon, Trash2Icon, HashIcon } from "lucide-react"
import type { Database } from "@/types/supabase"

type Category = Database["public"]["Tables"]["categories"]["Row"]

type Props = {
  category: Category
  productCount: number
}

export const CategoryCard = ({ category, productCount }: Props) => {
  const [editOpen, setEditOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleToggleActive = () => {
    startTransition(async () => {
      const result = await updateCategory(category.id, {
        name: category.name,
        description: category.description ?? undefined,
        image_url: category.image_url ?? "",
        is_active: !category.is_active,
        sort_order: category.sort_order,
      })
      if (result.error) toast.error(result.error)
      else toast.success(category.is_active ? "Category deactivated" : "Category activated")
    })
  }

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteCategory(category.id)
      if (result.error) toast.error(result.error)
      else toast.success("Category deleted")
    })
  }

  return (
    <>
      <div className="flex flex-col gap-3 rounded-lg border bg-card p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium truncate">{category.name}</span>
              <Badge variant={category.is_active ? "default" : "secondary"} className="text-xs shrink-0">
                {category.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
            {category.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{category.description}</p>
            )}
          </div>

          <div className="flex shrink-0 gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => setEditOpen(true)}
            >
              <PencilIcon className="h-3.5 w-3.5" />
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  disabled={isPending}
                >
                  <Trash2Icon className="h-3.5 w-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete &quot;{category.name}&quot;?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove the category.{" "}
                    {productCount > 0
                      ? `${productCount} product(s) will become uncategorized.`
                      : "No products will be affected."}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={handleDelete}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <HashIcon className="h-3.5 w-3.5" />
              Order: {category.sort_order}
            </span>
            <span>{productCount} product{productCount !== 1 ? "s" : ""}</span>
          </div>

          <Switch
            checked={category.is_active}
            onCheckedChange={handleToggleActive}
            disabled={isPending}
            aria-label="Toggle active"
          />
        </div>
      </div>

      <CategoryFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        category={category}
      />
    </>
  )
}
