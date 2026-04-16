'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SignUpPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          name: name.trim() || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error ?? 'Unable to create your account.')
        return
      }

      router.push('/auth/signin?registered=1')
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ambient-stage min-h-screen px-4 py-8 sm:px-6">
      <div className="ambient-orb ambient-orb-a" />
      <div className="ambient-orb ambient-orb-b" />
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl gap-6 lg:grid-cols-[0.94fr_1.06fr]">
        <section className="flex items-center order-2 lg:order-1">
          <div className="w-full rounded-[2rem] border border-border/80 bg-[rgba(252,249,244,0.92)] p-6 shadow-[0_24px_80px_rgba(70,58,43,0.12)] backdrop-blur sm:p-8">
            <div className="space-y-3">
              <div className="eyebrow">Create Account</div>
              <h1 className="text-4xl editorial-title text-slate-900">Start the ledger</h1>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Set up your account to begin daily readiness tracking and keep a clean record of recovery drift over time.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Optional"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                  className="h-12 rounded-2xl bg-white/80"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoComplete="email"
                  className="h-12 rounded-2xl bg-white/80"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="h-12 rounded-2xl bg-white/80"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="h-12 rounded-2xl bg-white/80"
                  />
                </div>
              </div>

              <div className="rounded-[1.2rem] border border-border/70 bg-white/55 px-4 py-3 text-xs leading-relaxed text-slate-600">
                Use a password you do not reuse elsewhere. This app stores your account locally for credential sign-in.
              </div>

              {error && (
                <p className="rounded-[1.1rem] border border-[#d6968e] bg-[#f6d8d2] px-4 py-3 text-sm text-[#8e3d34]">
                  {error}
                </p>
              )}

              <Button type="submit" className="h-12 w-full" disabled={loading}>
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 space-y-3 text-center">
              <p className="text-sm text-slate-600">
                Already have an account?{' '}
                <Link href="/auth/signin" className="font-medium text-primary hover:underline">
                  Sign in
                </Link>
              </p>
              <p className="text-xs text-muted-foreground">
                After signup, you&apos;ll land in onboarding to set your reminder and first check-in.
              </p>
            </div>
          </div>
        </section>

        <section className="vault-panel order-1 flex flex-col justify-between p-8 sm:p-10 lg:order-2">
          <div className="space-y-8">
            <div className="space-y-3">
              <div className="eyebrow">Recovery Ready</div>
              <h2 className="max-w-2xl text-5xl editorial-title text-slate-900 sm:text-6xl">
                Keep your evidence before your memory edits the week.
              </h2>
              <p className="max-w-xl text-sm leading-relaxed text-slate-700 sm:text-base">
                Small daily observations become useful only when they stay consistent. This account gives you the running record, trend windows, and export path.
              </p>
            </div>

            <div className="grid gap-3">
              {[
                ['Daily signal set', 'Stress, energy, sleep, soreness, workload, and mood in one pass.'],
                ['Readable score', 'A readiness number that moves with your inputs instead of hiding the math.'],
                ['History that matters', 'Premium unlocks editing, longer trend windows, and export when you need the full record.'],
              ].map(([title, body], index) => (
                <div key={title} className="mesh-card p-5">
                  <p className="metric-kicker">Track 0{index + 1}</p>
                  <p className="mt-3 text-2xl editorial-title text-slate-900">{title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-8 text-sm text-muted-foreground">
            Built for awareness and habit consistency, not diagnosis or acute care decisions.
          </p>
        </section>
      </div>
    </div>
  )
}
