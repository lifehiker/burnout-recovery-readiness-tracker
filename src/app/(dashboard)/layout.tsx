import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { signOut } from "@/auth"
import { NavLinks } from "@/components/NavLinks"
import { BottomNav } from "@/components/BottomNav"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) {
    redirect("/auth/signin")
  }

  const settings = await prisma.userSettings.findUnique({
    where: { userId: session.user.id },
  })

  if (!settings?.hasCompletedOnboarding) {
    redirect("/onboarding")
  }

  return (
    <div className="app-shell min-h-screen bg-background pb-24 sm:pb-0">
      <nav className="sticky top-0 z-40 px-4 pt-4">
        <div className="paper-panel mx-auto max-w-5xl px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-border/80 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.95),rgba(197,220,215,0.72)_50%,rgba(30,109,103,0.18))] text-sm font-semibold text-primary shadow-[0_10px_24px_rgba(17,79,75,0.16)]">
                RR
              </div>
              <div className="hidden sm:block">
                <Link href="/dashboard" className="block text-xl editorial-title">
                  Recovery Ready
                </Link>
                <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  Daily Burnout Ledger
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:flex items-center gap-1">
                <NavLinks />
              </div>
              <form action={async () => { "use server"; await signOut({ redirectTo: "/auth/signin" }) }}>
                <button
                  type="submit"
                  className="rounded-full border border-border/80 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600 transition-colors hover:bg-white/70 hover:text-slate-900"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
