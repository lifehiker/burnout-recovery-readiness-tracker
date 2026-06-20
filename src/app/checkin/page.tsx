"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import Link from "next/link"
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
  const [loadError, setLoadError] = useState<string | null>(null)
  const [limitReached, setLimitReached] = useState(false)

  useEffect(() => {
    fetch("/api/checkin?date=" + today)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to load existing check-in")
        }
        return response.json()
      })
      .then((data) => {
        if (data.id) {
          setExistingId(data.id)
          setValues({ stress: data.stress, energy: data.energy, sleep: data.sleep, soreness: data.soreness, workload: data.workload, mood: data.mood })
          setNote(data.note ?? "")
        }
      })
      .catch(() => {
        setLoadError("We couldn't load today's entry. You can still complete a fresh check-in.")
      })
      .finally(() => setIsLoading(false))
  }, [today])

  const score = calculateReadinessScore(values.stress, values.energy, values.sleep, values.soreness, values.workload, values.mood)
  const status: BurnoutStatus = getBurnoutStatus(score, null, null)

  const handleSubmit = async () => {
    setIsSaving(true)
    setError(null)
    setLimitReached(false)
    try {
      const url = existingId ? "/api/checkin/" + existingId : "/api/checkin"
      const method = existingId ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, note: note.slice(0, 200) }),
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        if (res.status === 403 && payload?.code === "FREE_PLAN_LIMIT_REACHED") {
          setLimitReached(true)
          return
        }
        throw new Error(payload?.message ?? "Failed to save")
      }
      router.push("/dashboard")
      router.refresh()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save check-in. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="rounded-full border border-border/70 bg-card/80 px-4 py-2 text-sm text-muted-foreground shadow-sm">
          Loading today&apos;s check-in...
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="paper-panel overflow-hidden">
        <div className="flex flex-col gap-8 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <div className="eyebrow">{existingId ? "Edit Entry" : "Daily Check-In"}</div>
            <div>
              <h1 className="text-4xl editorial-title text-slate-900 sm:text-5xl">
                {existingId ? "Refine today's reading." : "Capture today before it blurs."}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-700 sm:text-base">
                Rate the six signals, watch the score shift in real time, and leave a short note if something explains the day.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span>{format(new Date(), "EEEE, MMMM d, yyyy")}</span>
              <span className="h-1 w-1 rounded-full bg-border" />
              <span>About 30 seconds</span>
              <span className="h-1 w-1 rounded-full bg-border" />
              <span>Saved to your private history</span>
            </div>
          </div>

          <div className="mesh-card flex items-center gap-4 p-5 sm:min-w-[18rem]">
            <ScoreCard score={score} size="lg" />
            <div className="min-w-0">
              <p className="metric-kicker">Live Readiness</p>
              <div className="mt-2">
                <StatusBadge status={status} />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                Adjust the sliders to see whether today is reading as stable, strained, or overloaded.
              </p>
            </div>
          </div>
        </div>
      </section>

      {loadError && (
        <div className="rounded-[1.35rem] border border-[#d2a574] bg-[linear-gradient(135deg,rgba(244,225,203,0.82),rgba(250,246,239,0.96))] px-5 py-4 text-sm text-slate-800">
          {loadError}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Rate Your Signals</CardTitle>
            <CardDescription>Use the 1-5 scale consistently. Precision matters more than optimism.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {signals.map((signal) => (
              <SignalSlider
                key={signal.key}
                label={signal.label}
                name={signal.key}
                description={signal.description}
                inverted={signal.inverted}
                value={values[signal.key as keyof typeof values]}
                onChange={(value) => setValues((previous) => ({ ...previous, [signal.key]: value }))}
              />
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Context Note</CardTitle>
              <CardDescription>Keep it factual. One sentence is usually enough.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                placeholder="Examples: poor sleep after travel, deadline spike, easier day than expected."
                value={note}
                onChange={(event) => setNote(event.target.value.slice(0, 200))}
                rows={5}
                className="min-h-[140px] resize-none rounded-[1.35rem] bg-white/70"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Optional, but useful when reviewing trend changes later.</span>
                <span>{note.length}/200</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#7eb6aa] bg-[linear-gradient(135deg,rgba(220,239,232,0.72),rgba(250,246,239,0.95))]">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">Reading Guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed text-slate-800">
              <p>
                High readiness usually means your capacity is intact today. Moderate suggests friction but not collapse. Low means the signal mix is skewing toward strain.
              </p>
              <p className="text-muted-foreground">
                The value is most useful when you compare it against your own history, not someone else&apos;s ideal day.
              </p>
            </CardContent>
          </Card>

          {limitReached && (
            <div className="rounded-[1.35rem] border border-[#d2a574] bg-[linear-gradient(135deg,rgba(244,225,203,0.88),rgba(250,246,239,0.98))] px-5 py-4 text-sm text-slate-800">
              <p className="font-semibold text-slate-900">Your 7 free check-ins are already used.</p>
              <p className="mt-1 leading-relaxed text-slate-700">
                Upgrade to keep logging new days, unlock long-range trends, and keep the ledger continuous.
              </p>
              <Button asChild className="mt-4" size="sm">
                <Link href="/upgrade?reason=free-limit">See Premium</Link>
              </Button>
            </div>
          )}

          {error && (
            <p className="rounded-[1.1rem] border border-[#d6968e] bg-[#f6d8d2] px-4 py-3 text-sm text-[#8e3d34]">
              {error}
            </p>
          )}

          <Button onClick={handleSubmit} disabled={isSaving} className="w-full" size="lg">
            {isSaving ? "Saving..." : existingId ? "Update Check-In" : "Save Check-In"}
          </Button>
        </div>
      </div>
    </div>
  )
}
