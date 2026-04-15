'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Suspense } from 'react'

function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
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
    <div className='min-h-screen flex bg-white'>
      <div className='hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 flex-col justify-between p-12 text-white relative overflow-hidden'>
        <div className='absolute inset-0 opacity-10'>
          <div className='absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-white/20 blur-3xl'></div>
          <div className='absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-violet-300/30 blur-2xl'></div>
        </div>
        <div className='relative'>
          <div className='flex items-center gap-3 mb-2'>
            <div className='text-3xl'>🧠</div>
            <span className='text-xl font-semibold tracking-tight'>Burnout Tracker</span>
          </div>
        </div>
        <div className='relative space-y-8'>
          <div>
            <h1 className='text-4xl font-bold leading-tight mb-4'>
              Know your limits<br/>before you hit them.
            </h1>
            <p className='text-indigo-100 text-lg leading-relaxed'>
              A 30-second daily check-in that turns your stress, sleep, and energy signals into a clear readiness score.
            </p>
          </div>
          <div className='space-y-4'>
            {[
              { icon: '⚡', label: 'Daily readiness score in 30 seconds' },
              { icon: '📊', label: 'Track burnout risk over time' },
              { icon: '🔒', label: 'Your data stays private & secure' },
            ].map((item) => (
              <div key={item.label} className='flex items-center gap-3'>
                <span className='text-xl'>{item.icon}</span>
                <span className='text-indigo-100'>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className='relative'>
          <p className='text-indigo-300 text-sm'>
            Not medical advice. A self-reporting tool for daily awareness.
          </p>
        </div>
      </div>
      <div className='flex-1 flex flex-col items-center justify-center p-8'>
        <div className='w-full max-w-sm space-y-6'>
          <div className='lg:hidden text-center'>
            <div className='text-5xl mb-3'>🧠</div>
            <h2 className='text-2xl font-bold text-slate-900'>Burnout Tracker</h2>
            <p className='text-slate-500 text-sm mt-1'>Daily readiness check-in</p>
          </div>
          <div className='hidden lg:block'>
            <h2 className='text-2xl font-bold text-slate-900'>Welcome back</h2>
            <p className='text-slate-500 mt-1'>Sign in to your account to continue.</p>
          </div>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input id='email' type='email' placeholder='you@example.com' value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete='email' />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='password'>Password</Label>
              <Input id='password' type='password' placeholder='••••••••' value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete='current-password' />
            </div>
            {error && (
              <p className='text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2'>
                {error}
              </p>
            )}
            <Button type='submit' className='w-full h-11' disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
          <p className='text-center text-sm text-slate-600'>
            Don&apos;t have an account?{' '}
            <Link href='/auth/signup' className='font-medium text-indigo-600 hover:text-indigo-500'>
              Create one
            </Link>
          </p>
          <p className='text-center text-xs text-slate-400'>
            By signing in, you agree this is a self-reporting tool only — not medical advice or a diagnostic tool.
          </p>
        </div>
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
