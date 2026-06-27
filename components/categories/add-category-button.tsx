"use client"

import { useState } from "react"
import { CategoryFormDialog } from "@/components/categories/category-form-dialog"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"

export const AddCategoryButton = () => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <PlusIcon className="h-4 w-4 mr-1" />
        New Category
      </Button>
      <CategoryFormDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
