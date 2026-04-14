"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

const SIGNALS = [
  { name: "Stress", description: "How stressed or overwhelmed you feel" },
  { name: "Energy", description: "Your physical and mental energy level" },
  { name: "Sleep", description: "Quality and quantity of your sleep" },
  { name: "Soreness", description: "Physical tension or body soreness" },
  { name: "Workload", description: "Your perceived workload and demands" },
  { name: "Mood", description: "Your overall emotional state" },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  
  // Redirect to dashboard if already onboarded
  useEffect(() => {
    fetch('/api/auth/session')
      .then(r => r.json())
      .then(async (session) => {
        if (session?.user) {
          const settingsRes = await fetch('/api/onboarding/status')
          if (settingsRes.ok) {
            const data = await settingsRes.json()
            if (data.hasCompletedOnboarding) {
              router.push('/dashboard')
            }
          }
        }
      })
      .catch(() => {})
  }, [])
  const [acknowledged, setAcknowledged] = useState(false)
  const [reminderEnabled, setReminderEnabled] = useState(false)
  const [reminderTime, setReminderTime] = useState("08:00")
  const [isLoading, setIsLoading] = useState(false)

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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={"h-2 rounded-full transition-all " + (s === step ? "w-8 bg-indigo-600" : s < step ? "w-2 bg-indigo-300" : "w-2 bg-slate-200")}
            />
          ))}
        </div>

        {step === 1 && (
          <Card>
            <CardContent className="pt-8 pb-8 space-y-6 text-center">
              <div className="text-5xl">🧠</div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Track burnout in 30 seconds</h1>
                <p className="text-muted-foreground mt-2">
                  A daily check-in that helps you see your burnout risk before it becomes a crisis.
                </p>
              </div>
              <div className="text-left space-y-3 bg-slate-50 rounded-lg p-4">
                <p className="text-sm font-medium text-slate-700 mb-2">6 signals tracked daily:</p>
                {SIGNALS.map((signal) => (
                  <div key={signal.name} className="flex items-start gap-3">
                    <span className="text-green-500 font-bold text-sm mt-0.5">✓</span>
                    <div>
                      <span className="text-sm font-medium text-slate-800">{signal.name}</span>
                      <span className="text-sm text-muted-foreground"> — {signal.description}</span>
                    </div>
                  </div>
                ))}
              </div>
              <Button onClick={() => setStep(2)} className="w-full" size="lg">
                Get Started
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardContent className="pt-8 pb-8 space-y-6">
              <div className="text-center">
                <div className="text-4xl mb-3">⚠️</div>
                <h2 className="text-xl font-bold text-slate-900">Important Disclaimer</h2>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
                <p className="text-sm font-semibold text-amber-900">This is not medical advice.</p>
                <p className="text-sm text-amber-800">
                  Burnout Tracker is a self-reporting tool only. It does not diagnose, treat, or prevent any
                  medical condition. If you are experiencing a mental health crisis, please contact a healthcare
                  professional or crisis line.
                </p>
              </div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acknowledged}
                  onChange={(e) => setAcknowledged(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 cursor-pointer"
                />
                <span className="text-sm text-slate-700">
                  I understand this is a self-reporting tool only and not a substitute for professional medical advice.
                </span>
              </label>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
                <Button onClick={() => setStep(3)} disabled={!acknowledged} className="flex-1">
                  I Understand
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardContent className="pt-8 pb-8 space-y-6">
              <div className="text-center">
                <div className="text-4xl mb-3">⏰</div>
                <h2 className="text-xl font-bold text-slate-900">Set a Daily Reminder</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  A gentle nudge helps build the habit. You can change this anytime in Settings.
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Enable daily reminder</p>
                    <p className="text-xs text-muted-foreground">Get reminded to do your check-in</p>
                  </div>
                  <Switch
                    checked={reminderEnabled}
                    onCheckedChange={setReminderEnabled}
                  />
                </div>
                {reminderEnabled && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Reminder time</label>
                    <input
                      type="time"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                      className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">Back</Button>
                <Button onClick={handleComplete} disabled={isLoading} className="flex-1">
                  {isLoading ? "Setting up..." : "Start Tracking"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
