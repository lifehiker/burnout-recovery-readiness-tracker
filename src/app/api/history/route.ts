import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const limit = parseInt(req.nextUrl.searchParams.get("limit") ?? "50")
  const offset = parseInt(req.nextUrl.searchParams.get("offset") ?? "0")
  const entries = await prisma.checkIn.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
    take: limit,
    skip: offset,
  })
  return NextResponse.json(entries)
}