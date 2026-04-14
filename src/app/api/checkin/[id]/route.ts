import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { calculateReadinessScore, getBurnoutStatus } from "@/lib/scoring"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const entry = await prisma.checkIn.findFirst({ where: { id, userId: session.user.id } })
  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(entry)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const existing = await prisma.checkIn.findFirst({ where: { id, userId: session.user.id } })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })
  const body = await req.json()
  const { stress, energy, sleep, soreness, workload, mood, note } = body
  const readinessScore = calculateReadinessScore(stress, energy, sleep, soreness, workload, mood)
  const burnoutStatus = getBurnoutStatus(readinessScore, null, null)
  const updated = await prisma.checkIn.update({
    where: { id },
    data: { stress, energy, sleep, soreness, workload, mood, note: note?.slice(0, 200) ?? null, readinessScore, burnoutStatus },
  })
  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const existing = await prisma.checkIn.findFirst({ where: { id, userId: session.user.id } })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })
  await prisma.checkIn.delete({ where: { id } })
  return NextResponse.json({ success: true })
}