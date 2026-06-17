import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { CategoryList } from "@/components/menu/category-list"
import { ProductCard } from "@/components/menu/product-card"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { PlusIcon } from "lucide-react"

export default async function MenuPage() {
  const supabase = await createClient()

  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order"),
    supabase
      .from("products")
      .select("*, categories(*), variants:product_variants(*)")
      .order("name"),
  ])

  const categoryMap = Object.groupBy(products ?? [], (p) => p.category_id ?? "uncategorized")

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Menu</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto">
          <Button asChild size="sm">
            <Link href="/menu/new">
              <PlusIcon className="h-4 w-4 mr-1" />
              New Product
            </Link>
          </Button>
        </div>
      </header>

      <div className="p-6 lg:p-8">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside>
            <CategoryList categories={categories ?? []} />
          </aside>

          <main className="space-y-6">
            {(products ?? []).length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
                <p className="text-muted-foreground mb-4">No products yet</p>
                <Button asChild size="sm">
                  <Link href="/menu/new">Add your first product</Link>
                </Button>
              </div>
            ) : (
              <>
                {(categories ?? []).map((cat) => {
                  const catProducts = categoryMap[cat.id] ?? []
                  if (catProducts.length === 0) return null
                  return (
                    <section key={cat.id}>
                      <h2 className="text-sm font-medium text-muted-foreground mb-3">{cat.name}</h2>
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {catProducts.map((p) => (
                          <ProductCard key={p.id} product={p as Parameters<typeof ProductCard>[0]["product"]} />
                        ))}
                      </div>
                    </section>
                  )
                })}
                {(categoryMap["uncategorized"] ?? []).length > 0 && (
                  <section>
                    <h2 className="text-sm font-medium text-muted-foreground mb-3">Uncategorized</h2>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {(categoryMap["uncategorized"] ?? []).map((p) => (
                        <ProductCard key={p.id} product={p as Parameters<typeof ProductCard>[0]["product"]} />
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </>
  )
}
