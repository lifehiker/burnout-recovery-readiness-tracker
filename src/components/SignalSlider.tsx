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
    if (effective >= 4) return "text-green-600"
    if (effective >= 3) return "text-yellow-600"
    return "text-red-600"
  }

  const labels = ["", "Very Low", "Low", "Moderate", "High", "Very High"]

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-medium">{label}</span>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        <span className={cn("text-sm font-semibold", getColor(value, inverted))}>
          {value} — {labels[value]}
        </span>
      </div>
      <Slider
        min={1}
        max={5}
        step={1}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>1</span>
        <span>2</span>
        <span>3</span>
        <span>4</span>
        <span>5</span>
      </div>
    </div>
  )
}