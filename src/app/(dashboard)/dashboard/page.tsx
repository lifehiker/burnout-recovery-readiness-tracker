import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { format, subDays, parseISO } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScoreCard } from "@/components/ScoreCard"
import { StatusBadge } from "@/components/StatusBadge"
import { EmptyState } from "@/components/EmptyState"
import { MiniScoreChart } from "@/components/MiniScoreChart"
import { UpgradedBanner } from "@/components/UpgradedBanner"
import { Suspense } from "react"
import { getGuidanceMessage } from "@/lib/guidance"
import { getBurnoutStatus, calculateTrendDelta } from "@/lib/scoring"
import type { BurnoutStatus } from "@/types"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/signin")

  const today = format(new Date(), "yyyy-MM-dd")
  const sevenDaysAgo = format(subDays(new Date(), 7), "yyyy-MM-dd")
  const thirtyDaysAgo = format(subDays(new Date(), 30), "yyyy-MM-dd")

  const [todayEntry, recentEntries, subscription] = await Promise.all([
    prisma.checkIn.findUnique({ where: { userId_date: { userId: session.user.id, date: today } } }),
    prisma.checkIn.findMany({
      where: { userId: session.user.id, date: { gte: thirtyDaysAgo } },
      orderBy: { date: "desc" },
      take: 30,
    }),
    prisma.subscription.findUnique({ where: { userId: session.user.id } }),
  ])

  const isPremium = subscription?.status === "active" || subscription?.status === "trialing"

  const last7 = recentEntries.filter(e => e.date >= sevenDaysAgo).map(e => e.readinessScore)
  const sevenDayAvg = last7.length > 0 ? Math.round(last7.reduce((a, b) => a + b, 0) / last7.length) : null

  // Safe trend delta: only calculate when we have enough data points on each side
  const firstHalf = last7.slice(Math.ceil(last7.length / 2))
  const secondHalf = last7.slice(0, Math.floor(last7.length / 2))
  const trendDelta = firstHalf.length > 0 && secondHalf.length > 0
    ? calculateTrendDelta(secondHalf, firstHalf)
    : null

  let streak = 0
  const sortedDates = recentEntries.map(e => e.date).sort().reverse()
  let checkDate = today
  for (const date of sortedDates) {
    if (date === checkDate) {
      streak++
      const d = parseISO(checkDate)
      checkDate = format(subDays(d, 1), "yyyy-MM-dd")
    } else break
  }

  const todayScore = todayEntry?.readinessScore ?? null
  const burnoutStatus = todayEntry ? (todayEntry.burnoutStatus as BurnoutStatus) :
    sevenDayAvg ? getBurnoutStatus(sevenDayAvg, sevenDayAvg, trendDelta) : null
  const guidance = burnoutStatus ? getGuidanceMessage(burnoutStatus, todayScore ?? sevenDayAvg ?? 50) : null

  const thirtyDayTrend = trendDelta === null ? null : trendDelta > 5 ? "up" : trendDelta < -5 ? "down" : "stable"
  const trendIcon = thirtyDayTrend === "up" ? "↑" : thirtyDayTrend === "down" ? "↓" : "→"
  const trendColor = thirtyDayTrend === "up" ? "text-green-600" : thirtyDayTrend === "down" ? "text-red-600" : "text-yellow-600"
  const trendBg = thirtyDayTrend === "up" ? "bg-green-50" : thirtyDayTrend === "down" ? "bg-red-50" : "bg-yellow-50"

  const chartData = Array.from({ length: 7 }, (_, i) => {
    const date = format(subDays(new Date(), 6 - i), "yyyy-MM-dd")
    const entry = recentEntries.find(e => e.date === date)
    return { date: format(parseISO(date), "MMM d"), score: entry?.readinessScore ?? null }
  })

  const userName = session.user.name ? session.user.name.split(" ")[0] : null

  return (
    <div className="space-y-6">
      <Suspense fallback={null}><UpgradedBanner /></Suspense>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {userName ? `Hey, ${userName}` : "Dashboard"}
          </h1>
          <p className="text-slate-500 text-sm">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
        </div>
        <Button asChild size="sm">
          <Link href="/checkin">{todayEntry ? "Edit Today" : "Check In"}</Link>
        </Button>
      </div>

      {recentEntries.length === 0 ? (
        <EmptyState
          title="No check-ins yet"
          description="Complete your first daily check-in to start tracking your burnout risk and readiness score."
          action={{ label: "Start First Check-In", href: "/checkin" }}
        />
      ) : (
        <>
          {/* Hero score card */}
          <Card className="border-slate-200">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center gap-6">
                <ScoreCard score={todayScore} size="lg" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-500 mb-1">
                    {todayEntry ? "Today's Readiness" : "No check-in yet today"}
                  </p>
                  {burnoutStatus && (
                    <div className="mb-2">
                      <StatusBadge status={burnoutStatus} />
                    </div>
                  )}
                  {!todayEntry && (
                    <p className="text-xs text-muted-foreground">Log your check-in to see today's score</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardHeader className="pb-1 pt-4 px-4">
                <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-wide">7-Day Avg</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-2xl font-bold text-slate-900">{sevenDayAvg ?? "—"}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-1 pt-4 px-4">
                <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-wide">Trend</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className={["text-2xl font-bold", trendColor].join(" ")}>
                  {thirtyDayTrend ? trendIcon : "—"}
                </div>
                <p className="text-xs text-muted-foreground capitalize">{thirtyDayTrend ?? "No data"}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-1 pt-4 px-4">
                <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-wide">Streak</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-2xl font-bold text-slate-900">{streak}</div>
                <p className="text-xs text-muted-foreground">days</p>
              </CardContent>
            </Card>
          </div>

          {/* Guidance banner */}
          {guidance && (
            <div className={["rounded-xl border px-4 py-3 flex items-start gap-3",
              burnoutStatus === "low" ? "bg-green-50 border-green-200" :
              burnoutStatus === "elevated" ? "bg-red-50 border-red-200" :
              "bg-amber-50 border-amber-200"
            ].join(" ")}>
              <span className="text-lg shrink-0 mt-0.5">
                {burnoutStatus === "low" ? "✅" : burnoutStatus === "elevated" ? "⚠️" : "💛"}
              </span>
              <p className={["text-sm font-medium",
                burnoutStatus === "low" ? "text-green-800" :
                burnoutStatus === "elevated" ? "text-red-800" :
                "text-amber-800"
              ].join(" ")}>{guidance}</p>
            </div>
          )}

          {/* Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">Last 7 Days</CardTitle>
            </CardHeader>
            <CardContent>
              <MiniScoreChart data={chartData} />
            </CardContent>
          </Card>

          {/* Premium CTA if free */}
          {!isPremium && recentEntries.length >= 5 && (
            <Card className="border-indigo-200 bg-gradient-to-r from-indigo-50 to-violet-50">
              <CardContent className="pt-4 pb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-indigo-900">Unlock 30/90-day insights</p>
                  <p className="text-xs text-indigo-700 mt-0.5">See long-term trends, edit history, and export your data.</p>
                </div>
                <Button asChild size="sm" className="shrink-0">
                  <Link href="/upgrade">Upgrade</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
