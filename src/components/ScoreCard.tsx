import { cn } from "@/lib/utils"

interface ScoreCardProps {
  score: number | null
  size?: "sm" | "lg"
  className?: string
}

export function ScoreCard({ score, size = "lg", className }: ScoreCardProps) {
  const getColor = (s: number) => {
    if (s >= 70) return "text-green-600"
    if (s >= 45) return "text-yellow-600"
    return "text-red-600"
  }

  const getBg = (s: number) => {
    if (s >= 70) return "bg-green-50 border-green-200"
    if (s >= 45) return "bg-yellow-50 border-yellow-200"
    return "bg-red-50 border-red-200"
  }

  if (score === null) {
    return (
      <div className={cn("rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center", size === "lg" ? "h-32 w-32" : "h-16 w-16", className)}>
        <span className="text-muted-foreground text-sm">—</span>
      </div>
    )
  }

  return (
    <div className={cn("rounded-2xl border-2 flex flex-col items-center justify-center", getBg(score), size === "lg" ? "h-32 w-32" : "h-16 w-16", className)}>
      <span className={cn("font-bold", getColor(score), size === "lg" ? "text-4xl" : "text-xl")}>{score}</span>
      {size === "lg" && <span className="text-xs text-muted-foreground mt-1">/ 100</span>}
    </div>
  )
}