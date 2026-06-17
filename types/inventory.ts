import type { Database } from "./supabase"

export type InventoryItem = Database["public"]["Tables"]["inventory_items"]["Row"]
export type InventoryLog = Database["public"]["Tables"]["inventory_logs"]["Row"]

export type InventoryItemWithStatus = InventoryItem & {
  isLowStock: boolean
}
