import { redirect } from "next/navigation"
import { auth } from "@/auth"
import Link from "next/link"
import { signOut } from "@/auth"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) {
    redirect("/auth/signin")
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 px-4 py-3">
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
    </div>
  )
}