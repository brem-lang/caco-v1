import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUpIcon, ShoppingBagIcon, ReceiptIcon, PackageIcon } from "lucide-react"

type Props = {
  todaySales: number
  todayOrders: number
  avgOrderValue: number
  lowStockCount: number
}

export const StatsCards = ({ todaySales, todayOrders, avgOrderValue, lowStockCount }: Props) => {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Today&apos;s Sales</CardTitle>
          <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatCurrency(todaySales)}</p>
          <p className="text-xs text-muted-foreground mt-1">From {todayOrders} order{todayOrders !== 1 ? "s" : ""}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Orders Today</CardTitle>
          <ShoppingBagIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{todayOrders}</p>
          <p className="text-xs text-muted-foreground mt-1">Completed orders</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Order Value</CardTitle>
          <ReceiptIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatCurrency(avgOrderValue)}</p>
          <p className="text-xs text-muted-foreground mt-1">Per order today</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock Items</CardTitle>
          <PackageIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className={`text-2xl font-bold ${lowStockCount > 0 ? "text-destructive" : ""}`}>
            {lowStockCount}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {lowStockCount === 0 ? "All stocks sufficient" : "Need restocking"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
