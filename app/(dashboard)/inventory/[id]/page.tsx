import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { StockForm } from "@/components/inventory/stock-form"
import { formatDate } from "@/lib/utils"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { Database } from "@/types/supabase"

type InventoryItem = Database["public"]["Tables"]["inventory_items"]["Row"]
type InventoryLog = Database["public"]["Tables"]["inventory_logs"]["Row"]

export default async function InventoryItemPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  let item: InventoryItem | null = null
  let logs: InventoryLog[] | null = null

  if (id !== "new") {
    const [{ data: itemData }, { data: logData }] = await Promise.all([
      supabase.from("inventory_items").select("*").eq("id", id).single(),
      supabase
        .from("inventory_logs")
        .select("*")
        .eq("inventory_item_id", id)
        .order("created_at", { ascending: false })
        .limit(20),
    ])
    if (!itemData) notFound()
    item = itemData
    logs = logData
  }

  const isNew = id === "new"

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/inventory">Inventory</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{isNew ? "New Item" : item?.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="p-6 lg:p-8 space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight mb-6">
            {isNew ? "New Inventory Item" : `Edit — ${item?.name}`}
          </h1>
          <StockForm item={item ?? undefined} />
        </div>

        {!isNew && logs && logs.length > 0 && (
          <div>
            <h2 className="text-base font-semibold mb-3">Stock History</h2>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Change</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">{formatDate(log.created_at)}</TableCell>
                      <TableCell>
                        <Badge variant={log.type === "restock" ? "default" : "secondary"} className="text-xs capitalize">
                          {log.type}
                        </Badge>
                      </TableCell>
                      <TableCell className={`text-right font-mono ${log.quantity_change >= 0 ? "text-green-600" : "text-destructive"}`}>
                        {log.quantity_change >= 0 ? "+" : ""}{log.quantity_change}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{log.notes ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
