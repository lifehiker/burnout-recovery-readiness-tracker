import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { signOut } from "@/auth"

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
            <Link href="/dashboard" className="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-colors">Home</Link>
            <Link href="/checkin" className="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-colors">Check-In</Link>
            <Link href="/history" className="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-colors hidden sm:block">History</Link>
            <Link href="/trends" className="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-colors hidden sm:block">Trends</Link>
            <Link href="/settings" className="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-colors hidden sm:block">Settings</Link>
            <form action={async () => { "use server"; await signOut({ redirectTo: "/auth/signin" }) }}>
              <button type="submit" className="px-3 py-2 text-sm text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-colors">Sign out</button>
            </form>
          </div>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-4 py-8">
        {children}
      </main>

      {/* Bottom tab bar - mobile only */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50">
        <div className="flex items-stretch">
          <Link href="/dashboard" className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-slate-600 hover:text-indigo-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-[10px] font-medium">Home</span>
          </Link>
          <Link href="/checkin" className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-slate-600 hover:text-indigo-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <span className="text-[10px] font-medium">Check-In</span>
          </Link>
          <Link href="/history" className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-slate-600 hover:text-indigo-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[10px] font-medium">History</span>
          </Link>
          <Link href="/trends" className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-slate-600 hover:text-indigo-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
            <span className="text-[10px] font-medium">Trends</span>
          </Link>
          <Link href="/settings" className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-slate-600 hover:text-indigo-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-[10px] font-medium">Settings</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
