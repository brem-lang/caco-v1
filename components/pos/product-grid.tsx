"use client"

import { useState } from "react"
import { useCartStore } from "@/stores/cart-store"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Database } from "@/types/supabase"

type Variant = Database["public"]["Tables"]["product_variants"]["Row"]
type Category = Database["public"]["Tables"]["categories"]["Row"]
type Product = Database["public"]["Tables"]["products"]["Row"] & {
  variants: Variant[]
  categories: Category | null
}

export const ProductGrid = ({
  products,
  categories,
}: {
  products: Product[]
  categories: Category[]
}) => {
  const [activeCategory, setActiveCategory] = useState<string>("all")
  const [variantProduct, setVariantProduct] = useState<Product | null>(null)
  const addItem = useCartStore((s) => s.addItem)

  const filtered = activeCategory === "all"
    ? products
    : products.filter((p) => p.category_id === activeCategory)

  const handleSelect = (product: Product) => {
    const availableVariants = product.variants.filter((v) => v.is_available)
    if (availableVariants.length > 0) {
      setVariantProduct(product)
    } else {
      addItem({
        productId: product.id,
        variantId: null,
        productName: product.name,
        variantName: null,
        unitPrice: product.base_price,
        quantity: 1,
      })
    }
  }

  const handleVariantSelect = (product: Product, variant: Variant) => {
    addItem({
      productId: product.id,
      variantId: variant.id,
      productName: product.name,
      variantName: variant.name,
      unitPrice: product.base_price + variant.price_modifier,
      quantity: 1,
    })
    setVariantProduct(null)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b px-4 py-2 overflow-x-auto">
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="h-8">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            {categories.map((cat) => (
              <TabsTrigger key={cat.id} value={cat.id} className="text-xs">
                {cat.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No products in this category</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map((product) => (
              <button
                key={product.id}
                onClick={() => handleSelect(product)}
                className="rounded-lg border p-3 text-left hover:bg-accent hover:border-accent-foreground/20 transition-colors active:scale-95"
              >
                <div className="font-medium text-sm leading-tight mb-1">{product.name}</div>
                {product.categories && (
                  <Badge variant="outline" className="text-xs mb-1">{product.categories.name}</Badge>
                )}
                <div className="text-sm font-semibold text-primary">
                  {formatCurrency(product.base_price)}
                  {product.variants.length > 0 && (
                    <span className="text-xs font-normal text-muted-foreground ml-1">+</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!variantProduct} onOpenChange={(o) => !o && setVariantProduct(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{variantProduct?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Select a size or variant:</p>
            <div className="grid gap-2">
              <Button
                variant="outline"
                className="justify-between h-auto py-3"
                onClick={() => variantProduct && addItem({
                  productId: variantProduct.id,
                  variantId: null,
                  productName: variantProduct.name,
                  variantName: null,
                  unitPrice: variantProduct.base_price,
                  quantity: 1,
                }) && setVariantProduct(null)}
              >
                <span>Regular</span>
                <span className="font-semibold">{variantProduct && formatCurrency(variantProduct.base_price)}</span>
              </Button>
              {variantProduct?.variants.filter((v) => v.is_available).map((variant) => (
                <Button
                  key={variant.id}
                  variant="outline"
                  className="justify-between h-auto py-3"
                  onClick={() => variantProduct && handleVariantSelect(variantProduct, variant)}
                >
                  <span>{variant.name}</span>
                  <span className="font-semibold">
                    {formatCurrency(variantProduct.base_price + variant.price_modifier)}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
