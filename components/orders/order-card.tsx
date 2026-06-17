import Link from "next/link"
import { formatCurrency, formatDate } from "@/lib/utils"
import { OrderStatusBadge } from "@/components/orders/order-status-badge"
import { Card, CardContent } from "@/components/ui/card"
import type { Database } from "@/types/supabase"

type Order = Database["public"]["Tables"]["orders"]["Row"]

export const OrderCard = ({ order }: { order: Order }) => {
  return (
    <Link href={`/orders/${order.id}`}>
      <Card className="hover:bg-accent transition-colors cursor-pointer">
        <CardContent className="py-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Order #{order.order_number}</p>
            <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold">{formatCurrency(order.total ?? 0)}</p>
            <OrderStatusBadge status={order.status} />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
