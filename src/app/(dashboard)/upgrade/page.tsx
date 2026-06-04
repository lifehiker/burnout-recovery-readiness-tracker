"use client"
import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const features = [
  "Unlimited history (free tier: 7 days)",
  "30 and 90-day trend charts",
  "Burnout risk trend status",
  "CSV data export",
  "Edit past check-ins",
  "Premium insights & guidance",
]

function UpgradePageInner() {
  const searchParams = useSearchParams()
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual">("annual")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const reason = searchParams?.get("reason")

  const reasonCopy =
    reason === "free-limit"
      ? {
          eyebrow: "Free Plan Limit",
          title: "Keep the ledger continuous.",
          body: "You’ve used your 7 free check-ins. Premium unlocks new daily entries, longer pattern windows, and export when you want the full record.",
        }
      : reason === "edit-history"
        ? {
            eyebrow: "Archive Tools",
            title: "Edit the record, not just today.",
            body: "Past-entry editing is part of Premium so your longer trend lines stay accurate when a day needs correction.",
          }
        : {
            eyebrow: "Premium Access",
            title: "Unlock the full recovery ledger.",
            body: "See the slow drift, clean up your archive, and export the full history when you need to examine the pattern outside the app.",
          }

  const handleSubscribe = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selectedPlan }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error ?? "Failed to start checkout")
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="paper-panel overflow-hidden">
        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-5">
            <div className="eyebrow">{reasonCopy.eyebrow}</div>
            <div>
              <h1 className="text-4xl editorial-title text-slate-900 sm:text-5xl">{reasonCopy.title}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-700 sm:text-base">
                {reasonCopy.body}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {features.map((feature, index) => (
                <div key={feature} className="mesh-card p-4">
                  <p className="metric-kicker">Unlock 0{index + 1}</p>
                  <p className="mt-3 text-lg font-semibold text-slate-900">{feature}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 rounded-[2rem] border border-border/80 bg-[rgba(252,249,244,0.92)] p-6 shadow-[0_24px_80px_rgba(70,58,43,0.12)] backdrop-blur sm:p-7">
            <div className="space-y-2">
              <p className="eyebrow">Choose Plan</p>
              <h2 className="text-3xl editorial-title text-slate-900">Premium pricing</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Annual is the default because this product becomes useful through accumulation, not novelty.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
        <Card
          className={
            selectedPlan === "monthly"
              ? "cursor-pointer border-2 border-[#2b7068] bg-[linear-gradient(135deg,rgba(220,239,232,0.58),rgba(255,255,255,0.94))]"
              : "cursor-pointer border-border/80 bg-white/70 hover:border-slate-300"
          }
          onClick={() => setSelectedPlan("monthly")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Monthly</CardTitle>
            <CardDescription className="text-2xl font-bold text-slate-900">$4.99<span className="text-sm font-normal text-muted-foreground">/mo</span></CardDescription>
            <p className="text-xs text-muted-foreground">Best if you want a shorter commitment.</p>
          </CardHeader>
        </Card>

        <Card
          className={
            selectedPlan === "annual"
              ? "relative cursor-pointer border-2 border-[#2b7068] bg-[linear-gradient(135deg,rgba(220,239,232,0.78),rgba(250,246,239,0.98))]"
              : "relative cursor-pointer border-border/80 bg-white/70 hover:border-slate-300"
          }
          onClick={() => setSelectedPlan("annual")}
        >
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">Best Value</div>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Annual</CardTitle>
            <CardDescription className="text-2xl font-bold text-slate-900">$29.99<span className="text-sm font-normal text-muted-foreground">/yr</span></CardDescription>
            <p className="text-xs font-medium text-[#205951]">Save 50% vs monthly</p>
          </CardHeader>
        </Card>
            </div>

            <Card className="border-[#d2a574] bg-[linear-gradient(135deg,rgba(244,225,203,0.6),rgba(250,246,239,0.96))]">
              <CardContent className="pt-5">
                <h3 className="text-sm font-semibold text-slate-900">Included with Premium</h3>
                <ul className="mt-3 space-y-2">
                  {features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                      <span className="text-[#205951]">◆</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {error && <p className="rounded-[1.1rem] border border-[#d6968e] bg-[#f6d8d2] px-4 py-3 text-sm text-[#8e3d34]">{error}</p>}

            <Button onClick={handleSubscribe} disabled={isLoading} className="w-full" size="lg">
              {isLoading ? "Processing..." : selectedPlan === "annual" ? "Subscribe Annual ($29.99/yr)" : "Subscribe Monthly ($4.99/mo)"}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Annual plan includes a 7-day free trial. Cancel anytime in Stripe.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default function UpgradePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-16"><div className="rounded-full border border-border/70 bg-card/80 px-4 py-2 text-sm text-muted-foreground shadow-sm">Loading...</div></div>}>
      <UpgradePageInner />
    </Suspense>
  )
}
