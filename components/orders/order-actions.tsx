"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { deleteOrder, voidOrder } from "@/actions/orders"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { MoreHorizontalIcon, BanIcon, Trash2Icon } from "lucide-react"

type Props = {
  orderId: string
  orderNumber: number
  status: string
}

export const OrderActions = ({ orderId, orderNumber, status }: Props) => {
  const [dialog, setDialog] = useState<"void" | "delete" | null>(null)
  const [isPending, startTransition] = useTransition()

  const canVoid = status !== "cancelled" && status !== "completed"

  const handleVoid = () => {
    startTransition(async () => {
      const result = await voidOrder(orderId)
      if (result.error) toast.error(result.error)
      else toast.success(`Order #${orderNumber} voided`)
      setDialog(null)
    })
  }

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteOrder(orderId)
      if (result.error) toast.error(result.error)
      else toast.success(`Order #${orderNumber} deleted`)
      setDialog(null)
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Order actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            disabled={!canVoid || isPending}
            onClick={(e) => { e.stopPropagation(); setDialog("void") }}
            className="gap-2"
          >
            <BanIcon className="h-3.5 w-3.5" />
            Void order
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={isPending}
            onClick={(e) => { e.stopPropagation(); setDialog("delete") }}
            className="gap-2 text-destructive focus:text-destructive"
          >
            <Trash2Icon className="h-3.5 w-3.5" />
            Delete order
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Void confirmation */}
      <AlertDialog open={dialog === "void"} onOpenChange={(o) => !o && setDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Void Order #{orderNumber}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the order as cancelled. The order record will be kept for history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleVoid} disabled={isPending}>
              {isPending ? "Voiding..." : "Void order"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirmation */}
      <AlertDialog open={dialog === "delete"} onOpenChange={(o) => !o && setDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Order #{orderNumber}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the order and all its items. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? "Deleting..." : "Delete order"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
