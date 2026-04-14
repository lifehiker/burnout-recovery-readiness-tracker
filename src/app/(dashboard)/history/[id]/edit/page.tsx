"use client"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { SignalSlider } from "@/components/SignalSlider"
import { ScoreCard } from "@/components/ScoreCard"
import { StatusBadge } from "@/components/StatusBadge"
import { calculateReadinessScore, getBurnoutStatus } from "@/lib/scoring"
import type { BurnoutStatus } from "@/types"

const signals = [
  { key: "stress", label: "Stress Level", description: "How stressed did you feel?", inverted: true },
  { key: "energy", label: "Energy Level", description: "How energetic were you?", inverted: false },
  { key: "sleep", label: "Sleep Quality", description: "How well did you sleep?", inverted: false },
  { key: "soreness", label: "Soreness / Fatigue", description: "Physical soreness or fatigue", inverted: true },
  { key: "workload", label: "Workload / Intensity", description: "Workload or intensity that day", inverted: true },
  { key: "mood", label: "Mood / Focus", description: "Mood and mental focus", inverted: false },
]

export default function EditEntryPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [date, setDate] = useState("")
  const [values, setValues] = useState({ stress: 3, energy: 3, sleep: 3, soreness: 3, workload: 3, mood: 3 })
  const [note, setNote] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/checkin/" + id)
      .then(r => r.json())
      .then(data => {
        setDate(data.date)
        setValues({ stress: data.stress, energy: data.energy, sleep: data.sleep, soreness: data.soreness, workload: data.workload, mood: data.mood })
        setNote(data.note ?? "")
      })
      .catch(() => setError("Failed to load entry"))
      .finally(() => setIsLoading(false))
  }, [id])

  const score = calculateReadinessScore(values.stress, values.energy, values.sleep, values.soreness, values.workload, values.mood)
  const status: BurnoutStatus = getBurnoutStatus(score, null, null)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch("/api/checkin/" + id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, note: note.slice(0, 200) }),
      })
      if (!res.ok) throw new Error()
      router.push("/history")
      router.refresh()
    } catch {
      setError("Failed to save")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Delete this entry?")) return
    await fetch("/api/checkin/" + id, { method: "DELETE" })
    router.push("/history")
    router.refresh()
  }

  if (isLoading) return <div className="flex justify-center py-16 text-muted-foreground">Loading...</div>

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit Check-In</h1>
        {date && <p className="text-slate-500 text-sm">{date}</p>}
      </div>

      <div className="flex items-center gap-4">
        <ScoreCard score={score} size="lg" />
        <div>
          <p className="text-sm text-muted-foreground mb-1">Readiness Score</p>
          <StatusBadge status={status} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Signals</CardTitle>
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
            <label className="text-sm font-medium block mb-2">Note</label>
            <Textarea value={note} onChange={e => setNote(e.target.value.slice(0, 200))} rows={2} />
            <p className="text-xs text-muted-foreground mt-1">{note.length}/200</p>
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={isSaving} className="flex-1">
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
        <Button variant="destructive" onClick={handleDelete}>Delete</Button>
      </div>
    </div>
  )
}