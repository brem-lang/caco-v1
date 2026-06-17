import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Status = "pending" | "preparing" | "ready" | "completed" | "cancelled"

const statusConfig: Record<Status, { label: string; className: string }> = {
  pending:   { label: "Pending",   className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  preparing: { label: "Preparing", className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  ready:     { label: "Ready",     className: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
  completed: { label: "Completed", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  cancelled: { label: "Cancelled", className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
}

export const OrderStatusBadge = ({ status }: { status: string }) => {
  const config = statusConfig[status as Status] ?? { label: status, className: "" }
  return (
    <Badge variant="outline" className={cn("text-xs border-0", config.className)}>
      {config.label}
    </Badge>
  )
}
