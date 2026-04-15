'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BrandLogo } from '@/components/brand/BrandLogo'
import { useAuth } from '@/hooks/use-auth'
import { signInWithEmail, signInWithGoogle } from '@/lib/firebase/auth'
import { fireAlert } from '@/lib/alerts'

export default function LoginPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard')
    }
  }, [loading, router, user])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!email || !password) {
      await fireAlert({
        title: 'Missing sign-in details',
        text: 'Enter both your email address and password.',
        icon: 'error',
        confirmButtonText: 'Continue',
      })
      return
    }

    try {
      setSubmitting(true)
      await signInWithEmail(email, password)
      router.push('/dashboard')
    } catch (error) {
      await fireAlert({
        title: 'Unable to sign in',
        text: error instanceof Error ? error.message : 'Please verify your credentials and try again.',
        icon: 'error',
        confirmButtonText: 'Try again',
      })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleGoogleSignIn() {
    try {
      setSubmitting(true)
      await signInWithGoogle()
      router.push('/dashboard')
    } catch (error) {
      await fireAlert({
        title: 'Google Sign-In failed',
        text: error instanceof Error ? error.message : 'Please try again.',
        icon: 'error',
        confirmButtonText: 'Try again',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-4xl rounded-3xl border border-white/10 bg-slate-900/90 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-12">
          <div className="mb-10 text-center">
            <div className="mb-6 flex justify-center">
              <BrandLogo href="/" light subtitle="Investor Platform" />
            </div>
            <p className="text-sm uppercase tracking-[0.32em] text-cyan-300">Secure Investor Access</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">Login to BOLDWAVE</h1>
            <p className="mt-4 text-sm leading-6 text-slate-300 sm:text-base">
              Sign in to access your live portfolio, wallet activity, and investment workspace.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <section className="space-y-6 rounded-3xl bg-slate-950/70 p-6 ring-1 ring-white/5 sm:p-8">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="text-sm font-medium text-slate-200">
                      Email address
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      className="mt-2"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="text-sm font-medium text-slate-200">
                      Password
                    </label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Enter your password"
                      className="mt-2"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                    />
                  </div>
                </div>

                <Button type="submit" size="lg" className="w-full bg-cyan-500 text-slate-950 hover:bg-cyan-400" disabled={submitting}>
                  {submitting ? 'Signing in...' : 'Sign In'}
                </Button>

                <Button
                  type="button"
                  size="lg"
                  className="w-full bg-white text-gray-900 hover:bg-gray-50 border border-gray-300 flex items-center justify-center gap-3"
                  onClick={handleGoogleSignIn}
                  disabled={submitting}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign in with Google
                </Button>

                <div className="text-center text-sm text-slate-400">
                  New to BOLDWAVE?{' '}
                  <Link href="/signup" className="font-semibold text-white hover:text-cyan-300">
                    Create an account
                  </Link>
                </div>
              </form>
            </section>

            <aside className="rounded-3xl bg-slate-900/80 p-6 ring-1 ring-white/5 sm:p-8">
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Live platform access</p>
              <div className="mt-6 space-y-4 text-slate-200">
                <div className="rounded-3xl bg-white/5 p-4">
                  <p className="text-sm text-slate-300">Real balances</p>
                  <p className="mt-2 text-lg font-semibold text-white">Deposits, withdrawals, balances, and portfolio updates sync instantly across your workspace.</p>
                </div>
                <div className="rounded-3xl bg-white/5 p-4">
                  <p className="text-sm text-slate-300">Protected access</p>
                  <p className="mt-2 text-lg font-semibold text-white">Each account opens the right BOLDWAVE workspace automatically after sign-in.</p>
                </div>
                <div className="rounded-3xl bg-white/5 p-4">
                  <p className="text-sm text-slate-300">New-user ready</p>
                  <p className="mt-2 text-lg font-semibold text-white">Fresh accounts start clean, then unlock funding and investing as verification is completed.</p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  )
}
