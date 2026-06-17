import Link from "next/link"
import type { InventoryItemWithStatus } from "@/types/inventory"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangleIcon } from "lucide-react"

export const LowStockAlert = ({ items }: { items: InventoryItemWithStatus[] }) => {
  const lowItems = items.filter((i) => i.isLowStock)
  if (lowItems.length === 0) return null

  return (
    <Alert variant="destructive">
      <AlertTriangleIcon className="h-4 w-4" />
      <AlertTitle>{lowItems.length} item{lowItems.length > 1 ? "s" : ""} running low</AlertTitle>
      <AlertDescription className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="text-sm">
          {lowItems.map((i) => i.name).join(", ")}
        </span>
        <Button asChild variant="outline" size="sm" className="h-7 text-xs">
          <Link href="/inventory">View Inventory</Link>
        </Button>
      </AlertDescription>
    </Alert>
  )
}
