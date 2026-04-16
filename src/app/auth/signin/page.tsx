'use client'

import { Suspense, useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  const registered = searchParams.get('registered') === '1'

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl,
      })
      if (result?.error) {
        setError('Invalid email or password')
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
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
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="vault-panel hidden lg:flex lg:flex-col lg:justify-between lg:p-10">
          <div className="space-y-8">
            <div className="space-y-3">
              <div className="eyebrow">Recovery Ready</div>
              <h1 className="max-w-2xl text-6xl editorial-title text-slate-900">
                See the drift before the crash announces itself.
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-slate-700">
                A compact daily ledger for stress, sleep, workload, energy, soreness, and focus. No wellness fog. Just a readable pattern.
              </p>
            </div>
            <div className="grid gap-3">
              {[
                ['01', 'Daily readiness score', 'One composite reading built from six short self-reports.'],
                ['02', '7 / 30 / 90-day windows', 'Separate a single bad day from a genuine downward slide.'],
                ['03', 'Premium history tools', 'Edit the record, export it, and inspect longer arcs.'],
              ].map(([index, title, body]) => (
                <div key={title} className="mesh-card p-5">
                  <p className="metric-kicker">{index}</p>
                  <p className="mt-3 text-2xl editorial-title text-slate-900">{title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Not medical advice. Built for fast daily awareness, not diagnosis.
          </p>
        </section>

        <section className="flex items-center">
          <div className="w-full rounded-[2rem] border border-border/80 bg-[rgba(252,249,244,0.92)] p-6 shadow-[0_24px_80px_rgba(70,58,43,0.12)] backdrop-blur sm:p-8">
            <div className="space-y-3">
              <div className="eyebrow">Sign In</div>
              <h2 className="text-4xl editorial-title text-slate-900">Welcome back</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Continue your daily ledger and check whether your system is recovering or accumulating strain.
              </p>
            </div>

            {registered && (
              <div className="mt-6 rounded-[1.35rem] border border-[#7eb6aa] bg-[#dcefe8] px-4 py-3 text-sm text-[#205951]">
                Account created. Sign in to start onboarding.
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  autoComplete="current-password"
                  className="h-12 rounded-2xl bg-white/80"
                />
              </div>
              {error && (
                <p className="rounded-[1.1rem] border border-[#d6968e] bg-[#f6d8d2] px-4 py-3 text-sm text-[#8e3d34]">
                  {error}
                </p>
              )}
              <Button type="submit" className="h-12 w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 space-y-3 text-center">
              <p className="text-sm text-slate-600">
                Don&apos;t have an account?{' '}
                <Link href="/auth/signup" className="font-medium text-primary hover:underline">
                  Create one
                </Link>
              </p>
              <p className="text-xs text-muted-foreground">
                By signing in, you agree this is a self-reporting tool only and not a diagnostic product.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-slate-400 text-sm">Loading...</div></div>}>
      <SignInForm />
    </Suspense>
  )
}
