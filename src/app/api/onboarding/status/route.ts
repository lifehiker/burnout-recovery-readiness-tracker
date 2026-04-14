import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ hasCompletedOnboarding: false })
  const settings = await prisma.userSettings.findUnique({ where: { userId: session.user.id } })
  return NextResponse.json({ hasCompletedOnboarding: settings?.hasCompletedOnboarding ?? false })
}
