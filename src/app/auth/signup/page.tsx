'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SignUpPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Sign up failed')
        return
      }
      router.push('/auth/signin?registered=1')
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
              Start tracking<br/>in 30 seconds.
            </h1>
            <p className='text-indigo-100 text-lg leading-relaxed'>
              Six daily signals. One readiness score. Clear trend guidance over time.
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
            <h2 className='text-2xl font-bold text-slate-900'>Create your account</h2>
            <p className='text-slate-500 mt-1'>Start tracking your readiness today.</p>
          </div>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='name'>Name (optional)</Label>
              <Input id='name' type='text' placeholder='Your name' value={name} onChange={(e) => setName(e.target.value)} autoComplete='name' />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input id='email' type='email' placeholder='you@example.com' value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete='email' />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='password'>Password</Label>
              <Input id='password' type='password' placeholder='Min. 8 characters' value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete='new-password' minLength={8} />
            </div>
            {error && (
              <p className='text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2'>
                {error}
              </p>
            )}
            <Button type='submit' className='w-full h-11' disabled={loading}>
              {loading ? 'Creating account…' : 'Create account'}
            </Button>
          </form>
          <p className='text-center text-sm text-slate-600'>
            Already have an account?{' '}
            <Link href='/auth/signin' className='font-medium text-indigo-600 hover:text-indigo-500'>
              Sign in
            </Link>
          </p>
          <p className='text-center text-xs text-slate-400'>
            By creating an account, you agree this is a self-reporting tool only — not medical advice.
          </p>
        </div>
      </div>
    </div>
  )
}
