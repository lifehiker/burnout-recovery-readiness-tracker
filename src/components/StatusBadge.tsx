import { getStatusLabel, getStatusBgColor } from "@/lib/guidance"
import type { BurnoutStatus } from "@/types"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: BurnoutStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", getStatusBgColor(status), className)}>
      {getStatusLabel(status)}
    </span>
  )
}