import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProductForm } from "@/components/menu/product-form"
import { RecipeManager } from "@/components/menu/recipe-manager"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default async function MenuItemPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order")

  const isNew = id === "new"

  let product = null
  let ingredients = null
  let inventoryItems = null

  if (!isNew) {
    const [{ data: productData }, { data: ingredientData }, { data: inventoryData }] =
      await Promise.all([
        supabase
          .from("products")
          .select("*, variants:product_variants(*)")
          .eq("id", id)
          .single(),
        supabase
          .from("product_ingredients")
          .select("*, inventory_items(name, unit)")
          .eq("product_id", id)
          .order("created_at" as never),
        supabase
          .from("inventory_items")
          .select("*")
          .order("name"),
      ])

    if (!productData) notFound()
    product = productData
    ingredients = ingredientData ?? []
    inventoryItems = inventoryData ?? []
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/menu">Menu</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{isNew ? "New Product" : product?.name ?? "Edit Product"}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl space-y-10">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight mb-6">
            {isNew ? "New Product" : "Edit Product"}
          </h1>
          <ProductForm
            categories={categories ?? []}
            product={product as Parameters<typeof ProductForm>[0]["product"]}
          />
        </div>

        {!isNew && ingredients !== null && inventoryItems !== null && (
          <>
            <Separator />
            <RecipeManager
              productId={id}
              productName={product?.name ?? ""}
              ingredients={ingredients as Parameters<typeof RecipeManager>[0]["ingredients"]}
              inventoryItems={inventoryItems}
            />
          </>
        )}
      </div>
    </>
  )
}
