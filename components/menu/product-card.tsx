"use client"

import { useTransition } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { toggleProductAvailability, deleteProduct } from "@/actions/products"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { PencilIcon, Trash2Icon } from "lucide-react"
import type { Database } from "@/types/supabase"

type Product = Database["public"]["Tables"]["products"]["Row"] & {
  categories: Database["public"]["Tables"]["categories"]["Row"] | null
  variants: Database["public"]["Tables"]["product_variants"]["Row"][]
}

export const ProductCard = ({ product }: { product: Product }) => {
  const [isPending, startTransition] = useTransition()

  const handleToggle = (checked: boolean) => {
    startTransition(async () => {
      const result = await toggleProductAvailability(product.id, checked)
      if (result.error) toast.error(result.error)
    })
  }

  const handleDelete = () => {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return
    startTransition(async () => {
      const result = await deleteProduct(product.id)
      if (result.error) toast.error(result.error)
      else toast.success("Product deleted")
    })
  }

  return (
    <Card className="flex flex-col">
      <CardContent className="flex-1 pt-4">
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium leading-tight">{product.name}</h3>
            <span className="text-sm font-semibold shrink-0">
              {formatCurrency(product.base_price)}
            </span>
          </div>
          {product.categories && (
            <Badge variant="outline" className="text-xs">{product.categories.name}</Badge>
          )}
          {product.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
          )}
          {product.variants.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {product.variants.map((v) => (
                <Badge key={v.id} variant="secondary" className="text-xs">
                  {v.name}{v.price_modifier !== 0 && ` +${formatCurrency(v.price_modifier)}`}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="gap-2 pt-0">
        <div className="flex items-center gap-2 flex-1">
          <Switch
            checked={product.is_available}
            onCheckedChange={handleToggle}
            disabled={isPending}
            aria-label="Toggle availability"
          />
          <span className="text-xs text-muted-foreground">
            {product.is_available ? "Available" : "Sold out"}
          </span>
        </div>
        <Button size="icon" variant="ghost" className="h-8 w-8" asChild>
          <Link href={`/menu/${product.id}`}>
            <PencilIcon className="h-3.5 w-3.5" />
          </Link>
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={handleDelete}
          disabled={isPending}
        >
          <Trash2Icon className="h-3.5 w-3.5" />
        </Button>
      </CardFooter>
    </Card>
  )
}
