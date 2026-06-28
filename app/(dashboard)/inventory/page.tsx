import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { StockTable } from "@/components/inventory/stock-table"
import { LowStockAlert } from "@/components/inventory/low-stock-alert"
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
import type { InventoryItemWithStatus } from "@/types/inventory"

export default async function InventoryPage() {
  const supabase = await createClient()
  const { data: items } = await supabase
    .from("inventory_items")
    .select("*")
    .order("name")

  const itemsWithStatus: InventoryItemWithStatus[] = (items ?? []).map((item) => ({
    ...item,
    isLowStock: item.current_stock <= item.minimum_stock,
  }))

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Inventory</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto">
          <Button asChild size="sm">
            <Link href="/inventory/new">
              <PlusIcon className="h-4 w-4 mr-1" />
              New Item
            </Link>
          </Button>
        </div>
      </header>

      <div className="p-4 sm:p-6 lg:p-8 space-y-4">
        <LowStockAlert items={itemsWithStatus} />
        <StockTable items={itemsWithStatus} />
      </div>
    </>
  )
}
