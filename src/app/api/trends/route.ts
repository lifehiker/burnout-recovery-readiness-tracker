import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { format, subDays } from "date-fns"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const days = parseInt(req.nextUrl.searchParams.get("days") ?? "7")
  const validDays = [7, 30, 90].includes(days) ? days : 7
  const subscription = await prisma.subscription.findUnique({ where: { userId: session.user.id } })
  const isPremium = subscription?.status === "active" || subscription?.status === "trialing"
  if (validDays > 7 && !isPremium) {
    return NextResponse.json({ isPremium: false, dates: [], scores: [], signals: [] })
  }
  const startDate = format(subDays(new Date(), validDays), "yyyy-MM-dd")
  const entries = await prisma.checkIn.findMany({
    where: { userId: session.user.id, date: { gte: startDate } },
    orderBy: { date: "asc" },
  })
  const dates = entries.map(e => e.date)
  const scores = entries.map(e => e.readinessScore)
  const signals = entries.map(e => ({
    date: e.date, stress: e.stress, energy: e.energy, sleep: e.sleep,
    soreness: e.soreness, workload: e.workload, mood: e.mood,
  }))
  return NextResponse.json({ isPremium, dates, scores, signals })
}