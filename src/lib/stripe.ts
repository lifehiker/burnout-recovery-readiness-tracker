import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
})

export const STRIPE_PLANS = {
  monthly: {
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID || "",
    name: "Monthly",
    price: 4.99,
    interval: "month" as const,
  },
  annual: {
    priceId: process.env.STRIPE_ANNUAL_PRICE_ID || "",
    name: "Annual",
    price: 29.99,
    interval: "year" as const,
  },
}