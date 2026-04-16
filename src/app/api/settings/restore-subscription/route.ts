import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"
import { NextResponse } from "next/server"

const ACTIVE_STATUSES = new Set(["active", "trialing", "past_due"])

export async function POST() {
  const session = await auth()
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!stripe) {
    return NextResponse.json({ error: "Payments are not configured for this deployment." }, { status: 503 })
  }

  const existing = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  })

  const customerId =
    existing?.stripeCustomerId ||
    (await stripe.customers.list({ email: session.user.email, limit: 1 })).data[0]?.id

  if (!customerId) {
    return NextResponse.json({ restored: false })
  }

  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 10,
  })

  const latestRelevant = subscriptions.data
    .filter((subscription) => ACTIVE_STATUSES.has(subscription.status))
    .sort((a, b) => b.created - a.created)[0]

  if (!latestRelevant) {
    await prisma.subscription.upsert({
      where: { userId: session.user.id },
      update: {
        stripeCustomerId: customerId,
        status: "free",
        stripeSubscriptionId: null,
        stripePriceId: null,
        stripeCurrentPeriodEnd: null,
      },
      create: {
        userId: session.user.id,
        stripeCustomerId: customerId,
        status: "free",
      },
    })

    return NextResponse.json({ restored: false })
  }

  await prisma.subscription.upsert({
    where: { userId: session.user.id },
    update: {
      stripeCustomerId: customerId,
      stripeSubscriptionId: latestRelevant.id,
      stripePriceId: latestRelevant.items.data[0]?.price.id ?? null,
      stripeCurrentPeriodEnd: new Date(latestRelevant.current_period_end * 1000),
      status: latestRelevant.status,
    },
    create: {
      userId: session.user.id,
      stripeCustomerId: customerId,
      stripeSubscriptionId: latestRelevant.id,
      stripePriceId: latestRelevant.items.data[0]?.price.id ?? null,
      stripeCurrentPeriodEnd: new Date(latestRelevant.current_period_end * 1000),
      status: latestRelevant.status,
    },
  })

  return NextResponse.json({ restored: true, status: latestRelevant.status })
}
