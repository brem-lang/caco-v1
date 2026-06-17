"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/types/supabase"

type Product = Database["public"]["Tables"]["products"]["Row"] & {
  variants: Database["public"]["Tables"]["product_variants"]["Row"][]
  categories: Database["public"]["Tables"]["categories"]["Row"] | null
}

type Category = Database["public"]["Tables"]["categories"]["Row"]

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        const supabase = createClient()
        const [{ data: products, error: pe }, { data: categories, error: ce }] = await Promise.all([
          supabase
            .from("products")
            .select("*, variants:product_variants(*), categories(*)")
            .eq("is_available", true)
            .order("name"),
          supabase
            .from("categories")
            .select("*")
            .eq("is_active", true)
            .order("sort_order"),
        ])

        if (pe) throw new Error(pe.message)
        if (ce) throw new Error(ce.message)

        setProducts((products as Product[]) ?? [])
        setCategories(categories ?? [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load products")
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [])

  return { products, categories, loading, error }
}
