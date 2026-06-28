"use client"

import { useState } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type DataPoint = { date: string; sales: number; orders: number }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formatTooltipValue = (value: any, name: any): [string, string] => {
  const num = typeof value === "number" ? value : 0
  if (name === "sales") return [formatCurrency(num), "Sales"]
  return [String(num), "Orders"]
}

export const SalesChart = ({ data }: { data: DataPoint[] }) => {
  const [metric, setMetric] = useState<"sales" | "orders">("sales")

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 pb-2 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-base">Revenue — Last 7 Days</CardTitle>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant={metric === "sales" ? "default" : "outline"}
            className="h-7 text-xs"
            onClick={() => setMetric("sales")}
          >
            Sales
          </Button>
          <Button
            size="sm"
            variant={metric === "orders" ? "default" : "outline"}
            className="h-7 text-xs"
            onClick={() => setMetric("orders")}
          >
            Orders
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 5, right: 5, left: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
            <YAxis
              tick={{ fontSize: 11 }}
              className="fill-muted-foreground"
              tickFormatter={metric === "sales" ? (v) => `₱${(v / 1000).toFixed(0)}k` : undefined}
            />
            <Tooltip formatter={formatTooltipValue} />
            <Area
              type="monotone"
              dataKey={metric}
              stroke="hsl(var(--primary))"
              fill="url(#colorMetric)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
