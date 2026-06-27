"use client"

import { useEffect, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { createCategory, updateCategory } from "@/actions/products"
import { categorySchema, type CategoryFormValues } from "@/lib/validations/product"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Database } from "@/types/supabase"

type Category = Database["public"]["Tables"]["categories"]["Row"]

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: Category | null
}

export const CategoryFormDialog = ({ open, onOpenChange, category }: Props) => {
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
      image_url: "",
      is_active: true,
      sort_order: 0,
    },
  })

  const isActive = watch("is_active")

  useEffect(() => {
    if (open) {
      reset(
        category
          ? {
              name: category.name,
              description: category.description ?? "",
              image_url: category.image_url ?? "",
              is_active: category.is_active,
              sort_order: category.sort_order,
            }
          : { name: "", description: "", image_url: "", is_active: true, sort_order: 0 }
      )
    }
  }, [open, category, reset])

  const onSubmit = (values: CategoryFormValues) => {
    startTransition(async () => {
      const result = category
        ? await updateCategory(category.id, values)
        : await createCategory(values)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(category ? "Category updated" : "Category created")
        onOpenChange(false)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{category ? "Edit Category" : "New Category"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="cat-name">Name</Label>
            <Input id="cat-name" placeholder="e.g. Hot Coffee" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cat-desc">
              Description <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="cat-desc"
              placeholder="Short description of this category"
              rows={2}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cat-order">Sort Order</Label>
            <Input
              id="cat-order"
              type="number"
              min={0}
              placeholder="0"
              {...register("sort_order", { valueAsNumber: true })}
            />
            {errors.sort_order && (
              <p className="text-xs text-destructive">{errors.sort_order.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between rounded-lg border px-3 py-2.5">
            <Label htmlFor="cat-active" className="cursor-pointer">Active</Label>
            <Switch
              id="cat-active"
              checked={isActive}
              onCheckedChange={(val) => setValue("is_active", val)}
            />
          </div>

          <div className="flex gap-2 justify-end pt-1">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
