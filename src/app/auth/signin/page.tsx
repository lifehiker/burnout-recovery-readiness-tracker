import { signIn } from '@/auth'
import { Button } from '@/components/ui/button'

export default function SignInPage() {
  return (
    <div className='min-h-screen flex bg-white'>
      {/* Left panel - brand */}
      <div className='hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 flex-col justify-between p-12 text-white relative overflow-hidden'>
        {/* Background pattern */}
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
              { icon: '🔒', label: 'Your data stays private & local' },
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

      {/* Right panel - sign in */}
      <div className='flex-1 flex flex-col items-center justify-center p-8'>
        <div className='w-full max-w-sm space-y-8'>
          {/* Mobile logo */}
          <div className='lg:hidden text-center'>
            <div className='text-5xl mb-3'>🧠</div>
            <h2 className='text-2xl font-bold text-slate-900'>Burnout Tracker</h2>
            <p className='text-slate-500 text-sm mt-1'>Daily readiness check-in</p>
          </div>

          {/* Desktop welcome */}
          <div className='hidden lg:block'>
            <h2 className='text-2xl font-bold text-slate-900'>Welcome back</h2>
            <p className='text-slate-500 mt-1'>Sign in to your account to continue.</p>
          </div>

          <form
            action={async () => {
              'use server'
              await signIn('google', { redirectTo: '/dashboard' })
            }}
          >
            <Button type='submit' className='w-full h-11 text-sm font-medium' size='lg'>
              <svg className='mr-2.5 h-4 w-4' viewBox='0 0 24 24'>
                <path d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z' fill='#4285F4'/>
                <path d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z' fill='#34A853'/>
                <path d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z' fill='#FBBC05'/>
                <path d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z' fill='#EA4335'/>
              </svg>
              Continue with Google
            </Button>
          </form>

          <p className='text-center text-xs text-slate-400'>
            By signing in, you agree this is a self-reporting tool only — not medical advice or a diagnostic tool.
          </p>
        </div>
      </div>
    </div>
  )
}
