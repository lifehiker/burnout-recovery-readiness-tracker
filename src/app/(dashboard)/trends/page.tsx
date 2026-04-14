"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmptyState } from "@/components/EmptyState"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend
} from "recharts"

interface TrendData {
  dates: string[]
  scores: (number | null)[]
  signals: { date: string; stress: number; energy: number; sleep: number; soreness: number; workload: number; mood: number }[]
  isPremium: boolean
}

export default function TrendsPage() {
  const [days, setDays] = useState(7)
  const [data, setData] = useState<TrendData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    fetch("/api/trends?days=" + days)
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [days])

  const isPremiumRequired = (d: number) => d > 7 && !data?.isPremium

  const chartData = data?.dates.map((date, i) => ({
    date,
    score: data.scores[i],
  })) ?? []

  const signalData = data?.signals ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Trends</h1>
        <div className="flex gap-2">
          {[7, 30, 90].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={days === d ? "px-3 py-1 text-sm rounded-md bg-indigo-600 text-white" : "px-3 py-1 text-sm rounded-md bg-white text-slate-600 border hover:bg-slate-50"}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {isPremiumRequired(days) ? (
        <Card className="text-center p-8">
          <div className="text-4xl mb-4">🔒</div>
          <h3 className="text-lg font-semibold mb-2">Premium Feature</h3>
          <p className="text-muted-foreground mb-4">30 and 90-day trends are available on the Premium plan.</p>
          <Button asChild><Link href="/upgrade">Upgrade to Premium</Link></Button>
        </Card>
      ) : isLoading ? (
        <div className="flex justify-center py-16 text-muted-foreground">Loading...</div>
      ) : chartData.filter(d => d.score !== null).length === 0 ? (
        <EmptyState title="No data yet" description="Complete some check-ins to see your trends." action={{ label: "Check In", href: "/checkin" }} />
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Readiness Score — Last {days} Days</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} dot={false} connectNulls={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {signalData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Signal Averages</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={signalData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="energy" fill="#22c55e" />
                    <Bar dataKey="sleep" fill="#6366f1" />
                    <Bar dataKey="mood" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}