import { Button } from "@/components/ui/button"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

interface TablePaginationProps {
  page: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
}

export const TablePagination = ({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: TablePaginationProps) => {
  if (totalPages <= 1) return null
  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, totalItems)

  return (
    <div className="flex flex-col gap-2 px-4 py-3 border-t sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground text-center sm:text-left">
        Showing {start}–{end} of {totalItems}
      </p>
      <div className="flex items-center justify-center gap-1">
        <Button
          size="sm"
          variant="outline"
          className="h-8"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
        >
          <ChevronLeftIcon className="h-4 w-4" />
          <span className="hidden sm:inline ml-1">Previous</span>
        </Button>
        <span className="text-sm px-3 font-medium tabular-nums">
          {page} / {totalPages}
        </span>
        <Button
          size="sm"
          variant="outline"
          className="h-8"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
        >
          <span className="hidden sm:inline mr-1">Next</span>
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
