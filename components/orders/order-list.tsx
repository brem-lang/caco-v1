"use client"

import { useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { updateOrderStatus } from "@/actions/orders"
import { formatCurrency, formatDate } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { OrderStatusBadge } from "@/components/orders/order-status-badge"
import { OrderActions } from "@/components/orders/order-actions"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { TablePagination } from "@/components/ui/table-pagination"
import {
  ClockIcon, CheckCircle2Icon, ChefHatIcon, SearchIcon, XIcon, ArrowRightIcon,
} from "lucide-react"
import type { Database } from "@/types/supabase"

type Order = Database["public"]["Tables"]["orders"]["Row"]

const PAGE_SIZE = 10
const PAYMENT_METHODS = ["all", "cash", "card", "gcash", "maya"]

const STATUS_NEXT: Record<string, string> = {
  pending: "preparing",
  preparing: "ready",
  ready: "completed",
}
const STATUS_ACTION_LABEL: Record<string, string> = {
  pending: "Start Preparing",
  preparing: "Mark Ready",
  ready: "Mark Complete",
}
const QUEUE_BORDER: Record<string, string> = {
  pending:   "border-l-amber-400",
  preparing: "border-l-blue-400",
  ready:     "border-l-green-500",
}
const QUEUE_STATUS_STYLES: Record<string, string> = {
  pending:   "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  preparing: "border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  ready:     "border-green-200 bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300",
}
const HISTORY_STATUS_PILLS = [
  { value: "all", label: "All" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
]

const getElapsed = (createdAt: string) => {
  const m = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000)
  if (m < 1) return "just now"
  if (m < 60) return `${m}m`
  return `${Math.floor(m / 60)}h ${m % 60}m`
}
const getElapsedClass = (createdAt: string, status: string) => {
  const m = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000)
  if (status === "ready") return m > 5 ? "text-red-500" : "text-green-600 dark:text-green-400"
  if (m >= 10) return "text-red-500"
  if (m >= 5)  return "text-amber-500"
  return "text-muted-foreground"
}

export const OrderList = ({ orders }: { orders: Order[] }) => {
  const [tab, setTab] = useState<"queue" | "history">("queue")
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())
  const router = useRouter()

  // ── History filters ──
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentFilter, setPaymentFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const resetPage = (fn: () => void) => { fn(); setPage(1) }
  const hasFilters = statusFilter !== "all" || paymentFilter !== "all" || search !== ""
  const clearAll = () => { setStatusFilter("all"); setPaymentFilter("all"); setSearch(""); setPage(1) }

  // ── Queue: active orders sorted FIFO (oldest → newest) ──
  const queue = useMemo(() =>
    orders
      .filter(o => ["pending", "preparing", "ready"].includes(o.status))
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
    [orders]
  )
  const queueCounts = useMemo(() => ({
    pending:   queue.filter(o => o.status === "pending").length,
    preparing: queue.filter(o => o.status === "preparing").length,
    ready:     queue.filter(o => o.status === "ready").length,
  }), [queue])

  // ── History: completed / cancelled ──
  const historyOrders = useMemo(() =>
    orders.filter(o => ["completed", "cancelled"].includes(o.status)),
    [orders]
  )
  const filteredHistory = useMemo(() =>
    historyOrders.filter(o => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false
      if (paymentFilter !== "all" && o.payment_method !== paymentFilter) return false
      if (search) {
        const q = search.toLowerCase()
        if (!String(o.order_number).includes(q) && !(o.customer_name ?? "").toLowerCase().includes(q)) return false
      }
      return true
    }),
    [historyOrders, statusFilter, paymentFilter, search]
  )
  const totalPages = Math.max(1, Math.ceil(filteredHistory.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginated = filteredHistory.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const handleAdvance = useCallback(async (orderId: string, status: string) => {
    const next = STATUS_NEXT[status]
    if (!next || pendingIds.has(orderId)) return
    setPendingIds(prev => new Set(prev).add(orderId))
    try {
      const result = await updateOrderStatus(orderId, { status: next as Parameters<typeof updateOrderStatus>[1]["status"] })
      if (result.error) toast.error(result.error)
      else toast.success(`Marked as ${next}`)
    } finally {
      setPendingIds(prev => { const s = new Set(prev); s.delete(orderId); return s })
    }
  }, [pendingIds])

  return (
    <div className="space-y-5">

      {/* ── Tab switcher ── */}
      <div className="flex items-center gap-1 self-start rounded-lg border bg-muted/40 p-1">
        <button
          onClick={() => setTab("queue")}
          className={cn(
            "flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium transition-all",
            tab === "queue"
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <ChefHatIcon className="h-4 w-4" />
          Queue
          {queue.length > 0 && (
            <span className={cn(
              "rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none",
              tab === "queue" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
              {queue.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("history")}
          className={cn(
            "flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium transition-all",
            tab === "history"
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          History
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] leading-none text-muted-foreground">
            {historyOrders.length}
          </span>
        </button>
      </div>

      {/* ════════════════════════ QUEUE TAB ════════════════════════ */}
      {tab === "queue" && (
        <div className="space-y-4">

          {/* Status summary pills */}
          <div className="flex flex-wrap gap-2">
            {[
              { key: "pending",   label: "Pending",   style: "border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300" },
              { key: "preparing", label: "Preparing", style: "border-blue-300 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300" },
              { key: "ready",     label: "Ready",     style: "border-green-300 bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300" },
            ].map(({ key, label, style }) => (
              <div key={key} className={cn("flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium", style)}>
                {label}
                <span className="font-bold">{queueCounts[key as keyof typeof queueCounts]}</span>
              </div>
            ))}
            <p className="ml-auto self-center text-xs text-muted-foreground">
              Sorted oldest first (FIFO)
            </p>
          </div>

          {/* Empty state */}
          {queue.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-24 text-center">
              <CheckCircle2Icon className="h-12 w-12 text-green-500 mb-3" />
              <p className="text-lg font-semibold">All caught up!</p>
              <p className="text-sm text-muted-foreground mt-1">No active orders in the queue.</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {queue.map((order, index) => (
                <div
                  key={order.id}
                  onClick={() => router.push(`/orders/${order.id}`)}
                  className={cn(
                    "group relative flex flex-col gap-3 rounded-lg border border-l-4 bg-card p-4 cursor-pointer",
                    "hover:shadow-md transition-all duration-150",
                    QUEUE_BORDER[order.status]
                  )}
                >
                  {/* Position badge */}
                  <div className="absolute -top-2.5 -left-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background text-[10px] font-bold shadow">
                    {index + 1}
                  </div>

                  {/* Header: order # + elapsed time */}
                  <div className="flex items-start justify-between gap-2 pt-1">
                    <div>
                      <p className="font-bold text-lg leading-none">#{order.order_number}</p>
                      {order.customer_name
                        ? <p className="text-sm text-muted-foreground mt-0.5">{order.customer_name}</p>
                        : <p className="text-xs text-muted-foreground/50 mt-0.5 italic">Guest</p>
                      }
                    </div>
                    <div className={cn("flex items-center gap-1 shrink-0 text-xs font-medium", getElapsedClass(order.created_at, order.status))}>
                      <ClockIcon className="h-3.5 w-3.5" />
                      {getElapsed(order.created_at)}
                    </div>
                  </div>

                  {/* Status + total */}
                  <div className="flex items-center justify-between">
                    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", QUEUE_STATUS_STYLES[order.status])}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <span className="font-semibold text-sm">{formatCurrency(order.total ?? 0)}</span>
                  </div>

                  {/* Action button */}
                  {STATUS_ACTION_LABEL[order.status] && (
                    <Button
                      size="sm"
                      className="w-full gap-1.5 mt-auto"
                      disabled={pendingIds.has(order.id)}
                      onClick={(e) => { e.stopPropagation(); handleAdvance(order.id, order.status) }}
                    >
                      {STATUS_ACTION_LABEL[order.status]}
                      <ArrowRightIcon className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════ HISTORY TAB ════════════════════════ */}
      {tab === "history" && (
        <div className="space-y-4">

          {/* Filters row */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1 sm:max-w-xs">
              <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search order # or customer..."
                className="h-9 pl-8 pr-8"
                value={search}
                onChange={(e) => resetPage(() => setSearch(e.target.value))}
              />
              {search && (
                <button
                  onClick={() => resetPage(() => setSearch(""))}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <XIcon className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <Select value={paymentFilter} onValueChange={(v) => resetPage(() => setPaymentFilter(v))}>
              <SelectTrigger className="h-9 w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m === "all" ? "All Payments" : m.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasFilters && (
              <Button variant="ghost" size="sm" className="h-9 gap-1.5 text-muted-foreground shrink-0" onClick={clearAll}>
                <XIcon className="h-3.5 w-3.5" />
                Clear
              </Button>
            )}
          </div>

          {/* Status pills */}
          <div className="flex flex-wrap gap-2">
            {HISTORY_STATUS_PILLS.map(({ value, label }) => {
              const count = value === "all"
                ? historyOrders.length
                : historyOrders.filter(o => o.status === value).length
              const isActive = statusFilter === value
              return (
                <button
                  key={value}
                  onClick={() => resetPage(() => setStatusFilter(value))}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all",
                    isActive
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                  )}
                >
                  {label}
                  <span className="rounded-full bg-current/10 px-1.5 py-0.5 text-[10px] font-semibold leading-none">
                    {count}
                  </span>
                </button>
              )
            })}
            <p className="ml-auto self-center text-xs text-muted-foreground">
              {filteredHistory.length === historyOrders.length
                ? `${historyOrders.length} orders`
                : `${filteredHistory.length} of ${historyOrders.length} orders`}
            </p>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead className="hidden sm:table-cell">Customer</TableHead>
                    <TableHead className="hidden sm:table-cell">Date</TableHead>
                    <TableHead className="hidden sm:table-cell">Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <p className="text-muted-foreground">No orders found</p>
                          {hasFilters && (
                            <button onClick={clearAll} className="text-xs text-primary underline underline-offset-2">
                              Clear filters
                            </button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginated.map((order) => (
                      <TableRow
                        key={order.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => router.push(`/orders/${order.id}`)}
                      >
                        <TableCell>
                          <span className="font-medium">#{order.order_number}</span>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                          {order.customer_name ?? <span className="opacity-40">—</span>}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                          {formatDate(order.created_at)}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="outline" className="text-xs uppercase">
                            {order.payment_method}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <OrderStatusBadge status={order.status} />
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(order.total ?? 0)}
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <OrderActions
                            orderId={order.id}
                            orderNumber={order.order_number}
                            status={order.status}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <TablePagination
              page={currentPage}
              totalPages={totalPages}
              totalItems={filteredHistory.length}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </div>
        </div>
      )}
    </div>
  )
}
