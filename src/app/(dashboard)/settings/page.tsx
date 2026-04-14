import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { format } from "date-fns"
import { ExportButton } from "@/components/ExportButton"

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/signin")

  const [subscription] = await Promise.all([
    prisma.subscription.findUnique({ where: { userId: session.user.id } }),
  ])

  const isPremium = subscription?.status === "active" || subscription?.status === "trialing"

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
      <Card>
        <CardHeader><CardTitle>Account</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Email</span>
            <span className="text-sm font-medium">{session.user.email}</span>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Subscription</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium capitalize">{subscription?.status ?? "Free"}</span>
              {isPremium && <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">Premium</span>}
            </div>
          </div>
          {!isPremium && (
            <div className="pt-2">
              <Button asChild variant="outline" className="w-full">
                <Link href="/upgrade">Upgrade to Premium</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Data Export</CardTitle></CardHeader>
        <CardContent>
          {isPremium ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Export all your check-in data as a CSV file.</p>
              <ExportButton />
            </div>
          ) : (
            <div>
              <p className="text-sm text-muted-foreground mb-3">CSV export is a premium feature.</p>
              <Button asChild variant="outline" size="sm"><Link href="/upgrade">Upgrade to Export</Link></Button>
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Disclaimer</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Burnout Tracker is a self-reporting tool only. Not medical advice.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Support</CardTitle></CardHeader>
        <CardContent>
          <a href="mailto:support@burnouttracker.app" className="text-sm text-indigo-600 hover:underline">support@burnouttracker.app</a>
        </CardContent>
      </Card>
    </div>
  )
}