import { createClient } from "@/lib/supabase/server"
import { CategoryCard } from "@/components/categories/category-card"
import { AddCategoryButton } from "@/components/categories/add-category-button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

export default async function CategoriesPage() {
  const supabase = await createClient()

  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("products").select("id, category_id"),
  ])

  const productCountMap = (products ?? []).reduce<Record<string, number>>((acc, p) => {
    if (p.category_id) acc[p.category_id] = (acc[p.category_id] ?? 0) + 1
    return acc
  }, {})

  const list = categories ?? []
  const activeCount = list.filter((c) => c.is_active).length

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Categories</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto">
          <AddCategoryButton />
        </div>
      </header>

      <div className="p-6 lg:p-8 space-y-6">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{list.length} total</span>
          <span>{activeCount} active</span>
          <span>{list.length - activeCount} inactive</span>
        </div>

        {list.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-20 text-center">
            <p className="text-muted-foreground mb-4">No categories yet</p>
            <AddCategoryButton />
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {list.map((cat) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                productCount={productCountMap[cat.id] ?? 0}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
