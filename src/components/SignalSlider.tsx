"use client"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

interface SignalSliderProps {
  label: string
  name: string
  value: number
  onChange: (value: number) => void
  description?: string
  inverted?: boolean
}

export function SignalSlider({ label, name, value, onChange, description, inverted = false }: SignalSliderProps) {
  const getColor = (val: number, inv: boolean) => {
    const effective = inv ? 6 - val : val
    if (effective >= 4) return "text-[#1e6d67]"
    if (effective >= 3) return "text-[#b46d2f]"
    return "text-[#c45244]"
  }

  const labels = ["", "Very Low", "Low", "Moderate", "High", "Very High"]

  return (
    <div className="rounded-[1.35rem] border border-border/70 bg-white/45 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-semibold tracking-[0.02em]">{label}</span>
          {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        </div>
        <span className={cn("text-xs font-semibold uppercase tracking-[0.18em]", getColor(value, inverted))}>
          {value} / 5 {labels[value]}
        </span>
      </div>
      <Slider
        aria-label={name}
        min={1}
        max={5}
        step={1}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
      />
      <div className="flex justify-between text-[11px] text-muted-foreground">
        <span>1</span>
        <span>2</span>
        <span>3</span>
        <span>4</span>
        <span>5</span>
      </div>
    </div>
  )
}
