"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { InventoryItemWithStatus } from "@/types/inventory"

export const useInventory = () => {
  const [items, setItems] = useState<InventoryItemWithStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchItems = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("inventory_items")
        .select("*")
        .order("name")

      if (error) throw new Error(error.message)

      setItems(
        (data ?? []).map((item) => ({
          ...item,
          isLowStock: item.current_stock <= item.minimum_stock,
        }))
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load inventory")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  return { items, loading, error, refetch: fetchItems }
}
