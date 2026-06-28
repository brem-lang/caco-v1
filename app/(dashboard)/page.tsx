import { createClient } from "@/lib/supabase/server"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { SalesChart } from "@/components/dashboard/sales-chart"
import { TopProducts } from "@/components/dashboard/top-products"
import { OrderCard } from "@/components/orders/order-card"
import { LowStockAlert } from "@/components/inventory/low-stock-alert"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import type { InventoryItemWithStatus } from "@/types/inventory"

export default async function DashboardPage() {
  const supabase = await createClient()

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayISO = todayStart.toISOString()

  const [
    { data: todayOrders },
    { data: recentOrders },
    { data: inventoryItems },
    { data: sevenDayOrders },
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("total, order_items(product_name, quantity, subtotal)")
      .eq("status", "completed")
      .gte("created_at", todayISO),
    supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("inventory_items").select("*"),
    supabase
      .from("orders")
      .select("created_at, total")
      .eq("status", "completed")
      .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order("created_at"),
  ])

  const todaySales = todayOrders?.reduce((sum, o) => sum + (o.total ?? 0), 0) ?? 0
  const todayOrderCount = todayOrders?.length ?? 0
  const avgOrderValue = todayOrderCount > 0 ? todaySales / todayOrderCount : 0

  const inventoryWithStatus: InventoryItemWithStatus[] = (inventoryItems ?? []).map((item) => ({
    ...item,
    isLowStock: item.current_stock <= item.minimum_stock,
  }))
  const lowStockCount = inventoryWithStatus.filter((i) => i.isLowStock).length

  const salesByDay = new Map<string, { sales: number; orders: number }>()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    const key = d.toLocaleDateString("en-PH", { month: "short", day: "numeric" })
    salesByDay.set(key, { sales: 0, orders: 0 })
  }
  for (const order of sevenDayOrders ?? []) {
    const key = new Date(order.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric" })
    const existing = salesByDay.get(key)
    if (existing) {
      existing.sales += order.total ?? 0
      existing.orders += 1
    }
  }
  const chartData = Array.from(salesByDay.entries()).map(([date, v]) => ({ date, ...v }))

  const productMap = new Map<string, { name: string; quantity: number; revenue: number }>()
  for (const order of todayOrders ?? []) {
    for (const item of (order as { order_items?: { product_name: string; quantity: number; subtotal: number }[] }).order_items ?? []) {
      const existing = productMap.get(item.product_name)
      if (existing) {
        existing.quantity += item.quantity
        existing.revenue += item.subtotal
      } else {
        productMap.set(item.product_name, {
          name: item.product_name,
          quantity: item.quantity,
          revenue: item.subtotal,
        })
      }
    }
  }
  const topProducts = Array.from(productMap.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Dashboard</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </header>

      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        {lowStockCount > 0 && <LowStockAlert items={inventoryWithStatus} />}

        <StatsCards
          todaySales={todaySales}
          todayOrders={todayOrderCount}
          avgOrderValue={avgOrderValue}
          lowStockCount={lowStockCount}
        />

        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <SalesChart data={chartData} />
          <TopProducts products={topProducts} />
        </div>

        <div>
          <h2 className="text-base font-semibold mb-3">Recent Orders</h2>
          {(recentOrders ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders yet</p>
          ) : (
            <div className="space-y-2">
              {(recentOrders ?? []).map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
