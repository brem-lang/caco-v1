import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

type TopProduct = { name: string; quantity: number; revenue: number }

export const TopProducts = ({ products }: { products: TopProduct[] }) => {
  const maxQty = Math.max(...products.map((p) => p.quantity), 1)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Top Products Today</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {products.length === 0 ? (
          <p className="text-sm text-muted-foreground">No sales yet today</p>
        ) : (
          products.map((product, i) => (
            <div key={i} className="space-y-1">
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="font-medium truncate min-w-0">{product.name}</span>
                <div className="flex gap-2 shrink-0 text-right">
                  <span className="text-muted-foreground">{product.quantity} sold</span>
                  <span className="font-semibold">{formatCurrency(product.revenue)}</span>
                </div>
              </div>
              <Progress value={(product.quantity / maxQty) * 100} className="h-1.5" />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
