"use client"
import { cn } from "@/lib/utils"

interface ScoreCardProps {
  score: number | null
  size?: "sm" | "lg"
  className?: string
}

function CircularProgress({ score, size }: { score: number; size: "sm" | "lg" }) {
  const isLg = size === "lg"
  const dim = isLg ? 128 : 64
  const strokeWidth = isLg ? 8 : 5
  const r = (dim - strokeWidth) / 2
  const cx = dim / 2
  const cy = dim / 2
  const circumference = 2 * Math.PI * r
  const progress = (score / 100) * circumference
  const gap = circumference - progress

  const color = score >= 70 ? "#16a34a" : score >= 45 ? "#ca8a04" : "#dc2626"
  const trackColor = score >= 70 ? "#dcfce7" : score >= 45 ? "#fef9c3" : "#fee2e2"
  const textColor = score >= 70 ? "text-green-600" : score >= 45 ? "text-yellow-600" : "text-red-600"

  return (
    <div className="relative" style={{ width: dim, height: dim }}>
      <svg width={dim} height={dim} className="-rotate-90" style={{ display: "block" }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
        <circle
          cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={progress + " " + gap} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("font-bold", textColor, isLg ? "text-3xl" : "text-lg")}>{score}</span>
        {isLg && <span className="text-[10px] text-muted-foreground leading-tight">/ 100</span>}
      </div>
    </div>
  )
}

export function ScoreCard({ score, size = "lg", className }: ScoreCardProps) {
  const dim = size === "lg" ? 128 : 64

  if (score === null) {
    return (
      <div
        className={cn("rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center", className)}
        style={{ width: dim, height: dim }}
      >
        <span className="text-muted-foreground text-sm">—</span>
      </div>
    )
  }

  return (
    <div className={cn(className)}>
      <CircularProgress score={score} size={size} />
    </div>
  )
}
