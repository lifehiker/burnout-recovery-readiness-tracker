"use client"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { format, parseISO } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { SignalSlider } from "@/components/SignalSlider"
import { ScoreCard } from "@/components/ScoreCard"
import { StatusBadge } from "@/components/StatusBadge"
import { calculateReadinessScore, getBurnoutStatus } from "@/lib/scoring"
import Link from "next/link"
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
  const { id } = useParams<{ id: string }>()!
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [date, setDate] = useState("")
  const [isPastEntry, setIsPastEntry] = useState(false)
  const [isPremium, setIsPremium] = useState<boolean | null>(null)
  const [values, setValues] = useState({ stress: 3, energy: 3, sleep: 3, soreness: 3, workload: 3, mood: 3 })
  const [note, setNote] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0]
    fetch("/api/checkin/" + id)
      .then(async (r) => {
        if (!r.ok) {
          throw new Error("Failed to load entry")
        }
        return r.json()
      })
      .then(data => {
        setDate(data.date)
        setValues({ stress: data.stress, energy: data.energy, sleep: data.sleep, soreness: data.soreness, workload: data.workload, mood: data.mood })
        setNote(data.note ?? "")
        const past = data.date < today
        setIsPastEntry(past)
        if (past) {
          fetch("/api/onboarding/status")
            .then(r => r.json())
            .then(s => setIsPremium(s.isPremium ?? false))
            .catch(() => setIsPremium(false))
        }
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
    setError(null)
    try {
      const response = await fetch("/api/checkin/" + id, { method: "DELETE" })
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload?.error ?? "Failed to delete")
      }
      router.push("/history")
      router.refresh()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete")
    }
  }

  if (isLoading || (isPastEntry && isPremium === null)) {
    return (
      <div className="flex justify-center py-16">
        <div className="rounded-full border border-border/70 bg-card/80 px-4 py-2 text-sm text-muted-foreground shadow-sm">
          Loading entry...
        </div>
      </div>
    )
  }

  if (isPastEntry && !isPremium) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <section className="paper-panel overflow-hidden">
          <div className="flex flex-col gap-4 p-6 sm:p-8">
            <div className="eyebrow">Archive Lock</div>
            <div>
              <h1 className="text-4xl editorial-title text-slate-900">Past entries are part of Premium.</h1>
              {date && <p className="mt-2 text-sm text-muted-foreground">{format(parseISO(date), "EEEE, MMMM d, yyyy")}</p>}
            </div>
          </div>
        </section>
        <Card className="border-[#d2a574] bg-[linear-gradient(135deg,rgba(244,225,203,0.78),rgba(250,246,239,0.98))]">
          <CardContent className="space-y-4 py-8 text-center">
            <div className="text-4xl text-[#87501d]">◆</div>
            <h3 className="text-2xl editorial-title text-slate-900">Premium Feature</h3>
            <p className="mx-auto max-w-lg text-sm leading-relaxed text-slate-700">
              Upgrade to revise older check-ins, clean up your history, and keep long-range trends accurate when a day needs correction.
            </p>
            <Button asChild className="mt-2">
              <Link href="/upgrade?reason=edit-history">Upgrade to Premium</Link>
            </Button>
          </CardContent>
        </Card>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push("/history")} className="flex-1">
            Back to History
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="paper-panel overflow-hidden">
        <div className="flex flex-col gap-8 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <div className="eyebrow">{isPastEntry ? "Archive Edit" : "Today’s Entry"}</div>
            <div>
              <h1 className="text-4xl editorial-title text-slate-900 sm:text-5xl">Refine the record while the detail is still useful.</h1>
              {date && (
                <p className="mt-3 text-sm leading-relaxed text-slate-700">
                  {format(parseISO(date), "EEEE, MMMM d, yyyy")}
                </p>
              )}
            </div>
          </div>
          <div className="mesh-card flex items-center gap-4 p-5 sm:min-w-[18rem]">
            <ScoreCard score={score} size="lg" />
            <div>
              <p className="metric-kicker">Recalculated Score</p>
              <div className="mt-2">
                <StatusBadge status={status} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle>Adjust Signals</CardTitle>
            <CardDescription>Keep ratings consistent with how you score other days so the trend stays credible.</CardDescription>
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
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Context Note</CardTitle>
              <CardDescription>Use the note to explain why the numbers changed.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={note}
                onChange={e => setNote(e.target.value.slice(0, 200))}
                rows={5}
                className="min-h-[140px] resize-none rounded-[1.35rem] bg-white/70"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Optional, but useful when revisiting trend shifts later.</span>
                <span>{note.length}/200</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#d2a574] bg-[linear-gradient(135deg,rgba(244,225,203,0.72),rgba(250,246,239,0.95))]">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">Why edits matter</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed text-slate-800">
              <p>
                A trend line becomes useful only when the source entries stay honest. Correcting a misscored day keeps the longer pattern readable.
              </p>
              <p className="text-muted-foreground">
                For past entries, aim to fix factual mistakes rather than rewriting the day to match how it feels in hindsight.
              </p>
            </CardContent>
          </Card>

          {error && (
            <p className="rounded-[1.1rem] border border-[#d6968e] bg-[#f6d8d2] px-4 py-3 text-sm text-[#8e3d34]">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={isSaving} className="flex-1" size="lg">
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
            <Button variant="destructive" onClick={handleDelete} size="lg">
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
