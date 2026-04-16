"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"

const SIGNALS = [
  { name: "Stress", description: "How loaded or overdrawn you feel" },
  { name: "Energy", description: "Your current physical and mental charge" },
  { name: "Sleep", description: "How restorative last night actually felt" },
  { name: "Soreness", description: "Body tension, fatigue, or residual wear" },
  { name: "Workload", description: "The amount of demand pressing on today" },
  { name: "Mood", description: "Your emotional steadiness and focus" },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [acknowledged, setAcknowledged] = useState(false)
  const [reminderEnabled, setReminderEnabled] = useState(false)
  const [reminderTime, setReminderTime] = useState("08:00")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetch("/api/auth/session")
      .then((response) => response.json())
      .then(async (session) => {
        if (session?.user) {
          const settingsRes = await fetch("/api/onboarding/status")
          if (settingsRes.ok) {
            const data = await settingsRes.json()
            if (data.hasCompletedOnboarding) {
              router.push("/dashboard")
            }
          }
        }
      })
      .catch(() => {})
  }, [router])

  const handleComplete = async () => {
    setIsLoading(true)
    try {
      await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reminderEnabled, reminderTime }),
      })
      router.push("/checkin")
    } catch {
      setIsLoading(false)
    }
  }

  return (
    <div className="ambient-stage min-h-screen px-4 py-10 sm:px-6">
      <div className="ambient-orb ambient-orb-a" />
      <div className="ambient-orb ambient-orb-b" />
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="vault-panel flex flex-col justify-between p-8 sm:p-10">
          <div className="space-y-8">
            <div className="space-y-3">
              <div className="eyebrow">Recovery Ready</div>
              <div>
                <h1 className="max-w-3xl text-5xl editorial-title text-slate-900 sm:text-6xl">
                  Build a daily ledger before strain gets a head start.
                </h1>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-700 sm:text-base">
                  This tracker favors clarity over wellness noise: six fast signals, one honest score, and a visible record of whether your system is stabilizing or slipping.
                </p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {SIGNALS.map((signal, index) => (
                <div key={signal.name} className="mesh-card p-4">
                  <p className="metric-kicker">Signal 0{index + 1}</p>
                  <p className="mt-3 text-2xl editorial-title text-slate-900">{signal.name}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{signal.description}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-border/70 pt-6 text-sm text-muted-foreground">
            <span>30-second daily check-in</span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span>Transparent self-report score</span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span>Not medical advice</span>
          </div>
        </section>

        <section className="flex items-center">
          <Card className="w-full overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <div className="mb-6 flex items-center gap-2">
                {[1, 2, 3].map((current) => (
                  <div
                    key={current}
                    className={
                      current === step
                        ? "h-2 w-12 rounded-full bg-primary"
                        : current < step
                          ? "h-2 w-4 rounded-full bg-[#8bb9b1]"
                          : "h-2 w-4 rounded-full bg-border"
                    }
                  />
                ))}
              </div>

              {step === 1 && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="eyebrow">Step 1</div>
                    <h2 className="text-3xl editorial-title text-slate-900">Know what you’ll capture.</h2>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Each daily entry captures internal strain and usable capacity, not vague mood journaling.
                    </p>
                  </div>
                  <div className="space-y-3">
                    {SIGNALS.map((signal) => (
                      <div key={signal.name} className="rounded-[1.35rem] border border-border/70 bg-white/55 px-4 py-3">
                        <p className="text-sm font-semibold text-slate-900">{signal.name}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{signal.description}</p>
                      </div>
                    ))}
                  </div>
                  <Button onClick={() => setStep(2)} className="w-full" size="lg">
                    Continue
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="eyebrow">Step 2</div>
                    <h2 className="text-3xl editorial-title text-slate-900">Use it as a signal, not a diagnosis.</h2>
                  </div>
                  <div className="rounded-[1.5rem] border border-[#d2a574] bg-[linear-gradient(135deg,rgba(244,225,203,0.78),rgba(250,246,239,0.98))] p-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#87501d]">Important</p>
                    <p className="mt-3 text-sm leading-relaxed text-slate-800">
                      Recovery Ready is a self-reporting tool only. It does not diagnose burnout or replace professional support. If you are in crisis or feel unsafe, contact a clinician or local emergency resource immediately.
                    </p>
                  </div>
                  <label className="flex cursor-pointer items-start gap-3 rounded-[1.35rem] border border-border/70 bg-white/55 p-4">
                    <input
                      type="checkbox"
                      checked={acknowledged}
                      onChange={(event) => setAcknowledged(event.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-primary"
                    />
                    <span className="text-sm leading-relaxed text-slate-700">
                      I understand this is a self-observation tool and not medical advice.
                    </span>
                  </label>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                      Back
                    </Button>
                    <Button onClick={() => setStep(3)} disabled={!acknowledged} className="flex-1">
                      Continue
                    </Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="eyebrow">Step 3</div>
                    <h2 className="text-3xl editorial-title text-slate-900">Set the daily cue.</h2>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Choose when you want the check-in habit to surface. You can change this anytime in Settings.
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] border border-border/70 bg-white/55 p-4 space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Enable daily reminder</p>
                        <p className="mt-1 text-xs text-muted-foreground">Stores your preferred reminder time on this account.</p>
                      </div>
                      <Switch checked={reminderEnabled} onCheckedChange={setReminderEnabled} />
                    </div>
                    {reminderEnabled && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Reminder time</label>
                        <input
                          type="time"
                          value={reminderTime}
                          onChange={(event) => setReminderTime(event.target.value)}
                          className="w-full rounded-2xl border border-border/80 bg-background/80 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                      Back
                    </Button>
                    <Button onClick={handleComplete} disabled={isLoading} className="flex-1">
                      {isLoading ? "Setting up..." : "Start Tracking"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
