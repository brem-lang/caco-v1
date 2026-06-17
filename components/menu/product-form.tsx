"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { createProduct, updateProduct } from "@/actions/products"
import { productSchema, type ProductFormValues } from "@/lib/validations/product"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusIcon, Trash2Icon } from "lucide-react"
import type { Database } from "@/types/supabase"

type Category = Database["public"]["Tables"]["categories"]["Row"]
type Product = Database["public"]["Tables"]["products"]["Row"] & {
  variants: Database["public"]["Tables"]["product_variants"]["Row"][]
}

type Props = {
  categories: Category[]
  product?: Product
}

export const ProductForm = ({ categories, product }: Props) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      category_id: product?.category_id ?? null,
      name: product?.name ?? "",
      description: product?.description ?? "",
      image_url: product?.image_url ?? "",
      base_price: product?.base_price ?? 0,
      is_available: product?.is_available ?? true,
      variants: product?.variants.map((v) => ({
        id: v.id,
        name: v.name,
        price_modifier: v.price_modifier,
        is_available: v.is_available,
      })) ?? [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants",
  })

  const onSubmit = (values: ProductFormValues) => {
    startTransition(async () => {
      const result = product
        ? await updateProduct(product.id, values)
        : await createProduct(values)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(product ? "Product updated" : "Product created")
        router.push("/menu")
      }
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Product Details</CardTitle>
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
              <Label htmlFor="base_price">Base Price (₱) *</Label>
              <Input
                id="base_price"
                type="number"
                min="0"
                step="0.01"
                {...form.register("base_price", { valueAsNumber: true })}
              />
              {form.formState.errors.base_price && (
                <p className="text-xs text-destructive">{form.formState.errors.base_price.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={form.watch("category_id") ?? "none"}
              onValueChange={(v) => form.setValue("category_id", v === "none" ? null : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No category</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={2} {...form.register("description")} />
          </div>

          <div className="flex items-center gap-3">
            <Switch
              checked={form.watch("is_available")}
              onCheckedChange={(v) => form.setValue("is_available", v)}
            />
            <Label>Available for sale</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Variants (optional)</CardTitle>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => append({ name: "", price_modifier: 0, is_available: true })}
          >
            <PlusIcon className="h-3.5 w-3.5 mr-1" />
            Add Variant
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {fields.length === 0 && (
            <p className="text-sm text-muted-foreground">No variants — product has a single size/option.</p>
          )}
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-3 items-end">
              <div className="flex-1 space-y-1">
                <Label className="text-xs">Variant Name</Label>
                <Input
                  placeholder="e.g. Small"
                  {...form.register(`variants.${index}.name`)}
                />
              </div>
              <div className="w-32 space-y-1">
                <Label className="text-xs">Price Modifier (₱)</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...form.register(`variants.${index}.price_modifier`, { valueAsNumber: true })}
                />
              </div>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-9 w-9 text-destructive hover:text-destructive shrink-0"
                onClick={() => remove(index)}
              >
                <Trash2Icon className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={() => router.push("/menu")}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : product ? "Update Product" : "Create Product"}
        </Button>
      </div>
    </form>
  )
}
