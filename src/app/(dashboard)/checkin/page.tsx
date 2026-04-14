"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { SignalSlider } from "@/components/SignalSlider"
import { ScoreCard } from "@/components/ScoreCard"
import { StatusBadge } from "@/components/StatusBadge"
import { calculateReadinessScore, getBurnoutStatus } from "@/lib/scoring"
import type { BurnoutStatus } from "@/types"

const signals = [
  { key: "stress", label: "Stress Level", description: "How stressed do you feel?", inverted: true },
  { key: "energy", label: "Energy Level", description: "How energetic do you feel?", inverted: false },
  { key: "sleep", label: "Sleep Quality", description: "How well did you sleep?", inverted: false },
  { key: "soreness", label: "Soreness / Fatigue", description: "Physical soreness or fatigue level", inverted: true },
  { key: "workload", label: "Workload / Intensity", description: "How heavy is your workload today?", inverted: true },
  { key: "mood", label: "Mood / Focus", description: "How is your mood and mental focus?", inverted: false },
]

export default function CheckInPage() {
  const router = useRouter()
  const today = format(new Date(), "yyyy-MM-dd")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [existingId, setExistingId] = useState<string | null>(null)
  const [values, setValues] = useState({ stress: 3, energy: 3, sleep: 3, soreness: 3, workload: 3, mood: 3 })
  const [note, setNote] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/checkin?date=" + today)
      .then(r => r.json())
      .then(data => {
        if (data.id) {
          setExistingId(data.id)
          setValues({ stress: data.stress, energy: data.energy, sleep: data.sleep, soreness: data.soreness, workload: data.workload, mood: data.mood })
          setNote(data.note ?? "")
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [today])

  const score = calculateReadinessScore(values.stress, values.energy, values.sleep, values.soreness, values.workload, values.mood)
  const status: BurnoutStatus = getBurnoutStatus(score, null, null)

  const handleSubmit = async () => {
    setIsSaving(true)
    setError(null)
    try {
      const url = existingId ? "/api/checkin/" + existingId : "/api/checkin"
      const method = existingId ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, note: note.slice(0, 200) }),
      })
      if (!res.ok) throw new Error("Failed to save")
      router.push("/dashboard")
      router.refresh()
    } catch {
      setError("Failed to save check-in. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center py-16"><div className="text-muted-foreground">Loading...</div></div>
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{existingId ? "Edit Today's Check-In" : "Daily Check-In"}</h1>
        <p className="text-slate-500 text-sm">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
      </div>

      <div className="flex items-center gap-4">
        <ScoreCard score={score} size="lg" />
        <div>
          <p className="text-sm text-muted-foreground mb-1">Readiness Score</p>
          <StatusBadge status={status} />
          <p className="text-xs text-muted-foreground mt-1">Updates as you adjust</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rate Your Signals</CardTitle>
          <CardDescription>Rate each on a scale of 1–5. Takes about 30 seconds.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {signals.map(signal => (
            <SignalSlider
              key={signal.key}
              label={signal.label}
              name={signal.key}
              description={signal.description}
              inverted={signal.inverted}
              value={values[signal.key as keyof typeof values]}
              onChange={v => setValues(prev => ({ ...prev, [signal.key]: v }))}
            />
          ))}
          <div>
            <label className="text-sm font-medium block mb-2">Optional Note</label>
            <Textarea
              placeholder="Anything notable about today? (max 200 characters)"
              value={note}
              onChange={e => setNote(e.target.value.slice(0, 200))}
              rows={2}
            />
            <p className="text-xs text-muted-foreground mt-1">{note.length}/200</p>
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button onClick={handleSubmit} disabled={isSaving} className="w-full" size="lg">
        {isSaving ? "Saving..." : existingId ? "Update Check-In" : "Save Check-In"}
      </Button>
    </div>
  )
}