import { getStatusLabel, getStatusBgColor } from "@/lib/guidance"
import type { BurnoutStatus } from "@/types"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: BurnoutStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
        getStatusBgColor(status),
        className
      )}
    >
      {getStatusLabel(status)}
    </span>
  )
}
