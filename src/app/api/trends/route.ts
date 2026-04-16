import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { format, subDays } from "date-fns"
import type { CheckInEntry } from "@/types"

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
  const startDate = format(subDays(new Date(), validDays - 1), "yyyy-MM-dd")
  const entries = await prisma.checkIn.findMany({
    where: { userId: session.user.id, date: { gte: startDate } },
    orderBy: { date: "asc" },
  })
  const typedEntries = entries as CheckInEntry[]
  const entryMap = new Map(typedEntries.map((entry) => [entry.date, entry]))

  const dates = Array.from({ length: validDays }, (_, index) =>
    format(subDays(new Date(), validDays - 1 - index), "yyyy-MM-dd")
  )

  const scores = dates.map((date) => entryMap.get(date)?.readinessScore ?? null)
  const signals = dates.map((date) => {
    const entry = entryMap.get(date)

    return {
      date,
      stress: entry?.stress ?? null,
      energy: entry?.energy ?? null,
      sleep: entry?.sleep ?? null,
      soreness: entry?.soreness ?? null,
      workload: entry?.workload ?? null,
      mood: entry?.mood ?? null,
    }
  })

  return NextResponse.json({ isPremium, dates, scores, signals })
}
