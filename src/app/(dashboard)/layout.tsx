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
    <div className="min-h-screen bg-background pb-16 sm:pb-0">
      <nav className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 px-4 py-3 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-xl mr-2">🧠</span>
            <Link href="/dashboard" className="font-semibold text-slate-800 text-sm hidden sm:block">Burnout Tracker</Link>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="hidden sm:flex items-center gap-1">
              <NavLinks />
            </div>
            <form action={async () => { "use server"; await signOut({ redirectTo: "/auth/signin" }) }}>
              <button type="submit" className="px-3 py-2 text-sm text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-colors">Sign out</button>
            </form>
          </div>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-4 py-8">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
