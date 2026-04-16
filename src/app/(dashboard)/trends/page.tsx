"use client"

import { useEffect, useState } from "react"
import { format, parseISO } from "date-fns"
import Link from "next/link"
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { EmptyState } from "@/components/EmptyState"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TrendData {
  dates: string[]
  scores: (number | null)[]
  signals: {
    date: string
    stress: number | null
    energy: number | null
    sleep: number | null
    soreness: number | null
    workload: number | null
    mood: number | null
  }[]
  isPremium: boolean
}

const SIGNAL_COLORS = {
  energy: "#2f7d70",
  sleep: "#4f6a99",
  mood: "#b46d2f",
  stress: "#c45244",
  soreness: "#cb7d4a",
  workload: "#7f5d91",
}

const SIGNAL_LABELS: Record<string, string> = {
  energy: "Energy",
  sleep: "Sleep",
  mood: "Mood",
  stress: "Stress",
  soreness: "Soreness",
  workload: "Workload",
}

export default function TrendsPage() {
  const [days, setDays] = useState(7)
  const [data, setData] = useState<TrendData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    fetch("/api/trends?days=" + days)
      .then((response) => response.json())
      .then((payload) => setData(payload))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [days])

  const isPremiumRequired = (windowDays: number) => windowDays > 7 && !data?.isPremium

  const chartData =
    data?.dates.map((date, index) => ({
      isoDate: date,
      date: format(parseISO(date), days === 90 ? "MMM d" : "EEE"),
      score: data.scores[index],
    })) ?? []

  const signalData =
    data?.signals.map((entry) => ({
      ...entry,
      isoDate: entry.date,
      date: format(parseISO(entry.date), days === 90 ? "MMM d" : "EEE"),
    })) ?? []

  const completedDays = chartData.filter((entry) => entry.score !== null).length
  const averageScore = completedDays
    ? Math.round(
        chartData
          .filter((entry) => entry.score !== null)
          .reduce((sum, entry) => sum + (entry.score ?? 0), 0) / completedDays
      )
    : null
  const latestScore = [...chartData].reverse().find((entry) => entry.score !== null)?.score ?? null

  return (
    <div className="space-y-6">
      <section className="paper-panel overflow-hidden">
        <div className="flex flex-col gap-6 p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-3">
              <div className="eyebrow">Pattern Reading</div>
              <div>
                <h1 className="text-4xl editorial-title text-slate-900">Trends</h1>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  Watch the tempo, not just the total. Missing days stay visible so drops, rebounds, and slow drift read honestly.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {[7, 30, 90].map((windowDays) => (
                <button
                  key={windowDays}
                  onClick={() => setDays(windowDays)}
                  className={
                    days === windowDays
                      ? "rounded-full border border-[#2b7068] bg-primary px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-foreground shadow-[0_12px_26px_rgba(17,79,75,0.16)]"
                      : "rounded-full border border-border/80 bg-white/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600 transition-colors hover:bg-white hover:text-slate-900"
                  }
                >
                  {windowDays}d
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="mesh-card p-5">
              <p className="metric-kicker">Entries Logged</p>
              <p className="mt-3 text-4xl editorial-title text-slate-900">{completedDays}</p>
              <p className="mt-2 text-xs text-muted-foreground">within the selected window</p>
            </div>
            <div className="mesh-card p-5">
              <p className="metric-kicker">Window Average</p>
              <p className="mt-3 text-4xl editorial-title text-slate-900">{averageScore ?? "—"}</p>
              <p className="mt-2 text-xs text-muted-foreground">readiness across recorded days</p>
            </div>
            <div className="mesh-card p-5">
              <p className="metric-kicker">Latest Reading</p>
              <p className="mt-3 text-4xl editorial-title text-slate-900">{latestScore ?? "—"}</p>
              <p className="mt-2 text-xs text-muted-foreground">most recent completed check-in</p>
            </div>
          </div>
        </div>
      </section>

      {isPremiumRequired(days) ? (
        <Card className="border-[#d2a574] bg-[linear-gradient(135deg,rgba(244,225,203,0.72),rgba(250,246,239,0.96))] text-center p-8">
          <div className="mb-4 text-4xl text-[#87501d]">◆</div>
          <h3 className="mb-2 text-lg font-semibold">Long-range pattern reading is premium</h3>
          <p className="mb-4 text-muted-foreground">Unlock 30 and 90-day views to catch slow drift before it compounds.</p>
          <Button asChild>
            <Link href="/upgrade">Upgrade to Premium</Link>
          </Button>
        </Card>
      ) : isLoading ? (
        <div className="flex justify-center py-16 text-muted-foreground">Loading...</div>
      ) : chartData.filter((entry) => entry.score !== null).length === 0 ? (
        <EmptyState
          title="No data yet"
          description="Complete some check-ins to see your readiness curves and signal mix."
          action={{ label: "Check In", href: "/checkin" }}
        />
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Readiness Score — Last {days} Days</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8dfd3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 18,
                      borderColor: "#d8c8b5",
                      backgroundColor: "rgba(252, 249, 244, 0.95)",
                    }}
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.isoDate ?? ""}
                  />
                  <Line type="monotone" dataKey="score" stroke="#1e6d67" strokeWidth={3} dot={false} connectNulls={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Daily Signals — Last {days} Days</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                Scale: 1 to 5. For stress, soreness, and workload, lower is better.
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={signalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8dfd3" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 18,
                      borderColor: "#d8c8b5",
                      backgroundColor: "rgba(252, 249, 244, 0.95)",
                    }}
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.isoDate ?? ""}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  {Object.entries(SIGNAL_COLORS).map(([key, color]) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      name={SIGNAL_LABELS[key]}
                      stroke={color}
                      strokeWidth={1.5}
                      dot={false}
                      connectNulls={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
