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
  const prev7 = recentEntries.filter(e => e.date < sevenDaysAgo).map(e => e.readinessScore)
  const sevenDayAvg = last7.length > 0 ? Math.round(last7.reduce((a, b) => a + b, 0) / last7.length) : null
  const trendDelta = calculateTrendDelta(last7.slice(0, 3), last7.slice(-3))

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
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const date = format(subDays(new Date(), 6 - i), "yyyy-MM-dd")
    const entry = recentEntries.find(e => e.date === date)
    return { date: format(parseISO(date), "MMM d"), score: entry?.readinessScore ?? null }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
        </div>
        <Button asChild>
          <Link href="/checkin">{todayEntry ? "Edit Today" : "Check In Today"}</Link>
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="col-span-2 sm:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Today&apos;s Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <ScoreCard score={todayScore} size="sm" />
                  <div>
                    {burnoutStatus && <StatusBadge status={burnoutStatus} />}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">7-Day Avg</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{sevenDayAvg ?? "—"}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">30-Day Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={["text-3xl font-bold", trendColor].join(" ")}>
                  {thirtyDayTrend ? trendIcon : "—"}
                </div>
                <p className="text-xs text-muted-foreground capitalize">{thirtyDayTrend ?? "No data"}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Streak</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{streak}</div>
                <p className="text-xs text-muted-foreground">days</p>
              </CardContent>
            </Card>
          </div>

          {guidance && (
            <Card className="bg-indigo-50 border-indigo-200">
              <CardContent className="pt-4">
                <p className="text-sm text-indigo-800 font-medium">💡 {guidance}</p>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Last 7 Days</CardTitle>
            </CardHeader>
            <CardContent>
              <MiniScoreChart data={chartData} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}