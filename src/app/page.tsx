import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function Home() {
  const session = await auth()
  if (session?.user) {
    redirect("/dashboard")
  }

  return (
    <div className="ambient-stage min-h-screen flex items-center justify-center px-4">
      <div className="ambient-orb ambient-orb-a" />
      <div className="ambient-orb ambient-orb-b" />
      <div className="text-center space-y-6 max-w-lg">
        <div className="eyebrow">Recovery Ready</div>
        <h1 className="text-5xl editorial-title text-slate-900">
          See the drift before the crash announces itself.
        </h1>
        <p className="text-base leading-relaxed text-slate-700">
          A compact daily ledger for stress, sleep, workload, energy, soreness, and focus.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/auth/signin"
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-primary px-8 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Sign In
          </Link>
          <Link
            href="/auth/signup"
            className="inline-flex h-12 items-center justify-center rounded-2xl border border-border/80 px-8 text-sm font-semibold text-slate-700 transition-colors hover:bg-white/70"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  )
}
