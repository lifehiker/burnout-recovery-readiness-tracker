"use client"
import { useState } from "react"
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

export default function UpgradePage() {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual">("annual")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    <div className="max-w-lg mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900">Upgrade to Premium</h1>
        <p className="text-muted-foreground mt-1">Unlock the full power of your burnout tracker</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card
          className={selectedPlan === "monthly" ? "cursor-pointer border-indigo-600 border-2" : "cursor-pointer hover:border-slate-300"}
          onClick={() => setSelectedPlan("monthly")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Monthly</CardTitle>
            <CardDescription className="text-2xl font-bold text-slate-900">$4.99<span className="text-sm font-normal text-muted-foreground">/mo</span></CardDescription>
          </CardHeader>
        </Card>

        <Card
          className={selectedPlan === "annual" ? "cursor-pointer border-indigo-600 border-2 relative" : "cursor-pointer hover:border-slate-300 relative"}
          onClick={() => setSelectedPlan("annual")}
        >
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">Best Value</div>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Annual</CardTitle>
            <CardDescription className="text-2xl font-bold text-slate-900">$29.99<span className="text-sm font-normal text-muted-foreground">/yr</span></CardDescription>
            <p className="text-xs text-green-600 font-medium">Save 50% vs monthly</p>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-4">
          <h3 className="font-semibold mb-3 text-sm">What you get:</h3>
          <ul className="space-y-2">
            {features.map(f => (
              <li key={f} className="flex items-center gap-2 text-sm">
                <span className="text-green-500">∓</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-red-500 text-center">{error}</p>}

      <Button onClick={handleSubscribe} disabled={isLoading} className="w-full" size="lg">
        {isLoading ? "Processing..." : selectedPlan === "annual" ? "Subscribe Annual ($29.99/yr)" : "Subscribe Monthly ($4.99/mo)"}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Annual plan includes 7-day free trial. Cancel anytime.
      </p>
    </div>
  )
}
