"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { createCategory, updateCategory, deleteCategory } from "@/actions/products"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PlusIcon, PencilIcon, Trash2Icon } from "lucide-react"
import type { Database } from "@/types/supabase"

type Category = Database["public"]["Tables"]["categories"]["Row"]

export const CategoryList = ({ categories }: { categories: Category[] }) => {
  const [editing, setEditing] = useState<Category | null>(null)
  const [name, setName] = useState("")
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const openNew = () => {
    setEditing(null)
    setName("")
    setOpen(true)
  }

  const openEdit = (cat: Category) => {
    setEditing(cat)
    setName(cat.name)
    setOpen(true)
  }

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Category name is required")
      return
    }
    startTransition(async () => {
      const result = editing
        ? await updateCategory(editing.id, { name: name.trim(), is_active: true, sort_order: editing.sort_order })
        : await createCategory({ name: name.trim(), is_active: true, sort_order: 0 })

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(editing ? "Category updated" : "Category created")
        setOpen(false)
      }
    })
  }

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteCategory(id)
      if (result.error) toast.error(result.error)
      else toast.success("Category deleted")
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">Categories</h3>
        <Button size="sm" variant="outline" onClick={openNew}>
          <PlusIcon className="h-3.5 w-3.5 mr-1" />
          New
        </Button>
      </div>

      <div className="space-y-1">
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center justify-between rounded-md border px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="text-sm">{cat.name}</span>
              {!cat.is_active && <Badge variant="secondary" className="text-xs">Inactive</Badge>}
            </div>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(cat)}>
                <PencilIcon className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={() => handleDelete(cat.id)}
                disabled={isPending}
              >
                <Trash2Icon className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <p className="text-sm text-muted-foreground py-2 text-center">No categories yet</p>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Category" : "New Category"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Category name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={isPending}>
                {isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
