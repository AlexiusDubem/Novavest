'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BrandLogo } from '@/components/brand/BrandLogo'
import { useAuth } from '@/hooks/use-auth'
import { signUpWithEmail } from '@/lib/firebase/auth'
import { fireAlert } from '@/lib/alerts'

export default function SignupPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    country: '',
    goal: 'growth',
    investmentPackage: 'starter',
  })

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard')
    }
  }, [loading, router, user])

  function updateField(field: keyof typeof formData, value: string) {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (Object.values(formData).some((value) => !value)) {
      await fireAlert({
        title: 'Complete every field',
        text: 'All fields are required to create your secure investor profile.',
        icon: 'error',
        confirmButtonText: 'Continue',
      })
      return
    }

    try {
      setSubmitting(true)
      await signUpWithEmail(formData)
      await fireAlert({
        title: 'Account created',
        text: 'Your account is ready. Proceed to the dashboard to set up KYC and fund your wallet.',
        icon: 'success',
        confirmButtonText: 'Open dashboard',
      })
      router.push('/dashboard')
    } catch (error) {
      await fireAlert({
        title: 'Unable to create account',
        text: error instanceof Error ? error.message : 'Please review your information and try again.',
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
        <div className="mx-auto w-full max-w-5xl rounded-3xl border border-white/10 bg-slate-900/90 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-12">
          <div className="mb-10 text-center">
            <div className="mb-6 flex justify-center">
              <BrandLogo href="/" light subtitle="Investor Platform" />
            </div>
            <p className="text-sm uppercase tracking-[0.32em] text-cyan-300">Start your investment journey</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">Create your BOLDWAVE account</h1>
            <p className="mt-4 text-sm leading-6 text-slate-300 sm:text-base">
              This form creates your secure investor account and prepares you to complete KYC, fund your wallet, and invest.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <section className="space-y-6 rounded-3xl bg-slate-950/70 p-6 ring-1 ring-white/5 sm:p-8">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className="text-sm font-medium text-slate-200">First name</label>
                    <Input id="firstName" className="mt-2" value={formData.firstName} onChange={(event) => updateField('firstName', event.target.value)} />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="text-sm font-medium text-slate-200">Last name</label>
                    <Input id="lastName" className="mt-2" value={formData.lastName} onChange={(event) => updateField('lastName', event.target.value)} />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="email" className="text-sm font-medium text-slate-200">Email address</label>
                    <Input id="email" type="email" className="mt-2" value={formData.email} onChange={(event) => updateField('email', event.target.value)} />
                  </div>
                  <div>
                    <label htmlFor="phone" className="text-sm font-medium text-slate-200">Phone number</label>
                    <Input id="phone" type="tel" className="mt-2" value={formData.phone} onChange={(event) => updateField('phone', event.target.value)} />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="password" className="text-sm font-medium text-slate-200">Create password</label>
                    <Input id="password" type="password" className="mt-2" value={formData.password} onChange={(event) => updateField('password', event.target.value)} />
                  </div>
                  <div>
                    <label htmlFor="country" className="text-sm font-medium text-slate-200">Country of residence</label>
                    <Input id="country" className="mt-2" value={formData.country} onChange={(event) => updateField('country', event.target.value)} />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="goal" className="text-sm font-medium text-slate-200">Investment objective</label>
                    <select
                      id="goal"
                      value={formData.goal}
                      onChange={(event) => updateField('goal', event.target.value)}
                      className="mt-2 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base text-slate-100 outline-none"
                    >
                      <option value="growth">Long-term growth</option>
                      <option value="income">Regular income</option>
                      <option value="savings">Capital preservation</option>
                      <option value="speculation">High-growth opportunity</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="package" className="text-sm font-medium text-slate-200">Preferred package</label>
                    <select
                      id="package"
                      value={formData.investmentPackage}
                      onChange={(event) => updateField('investmentPackage', event.target.value)}
                      className="mt-2 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base text-slate-100 outline-none"
                    >
                      <option value="starter">Starter</option>
                      <option value="growth">Growth</option>
                      <option value="professional">Professional</option>
                    </select>
                  </div>
                </div>

                <Button type="submit" size="lg" className="w-full bg-cyan-500 text-slate-950 hover:bg-cyan-400" disabled={submitting}>
                  {submitting ? 'Creating account...' : 'Create account and start onboarding'}
                </Button>

                <p className="text-center text-sm text-slate-400">
                  Already have an account?{' '}
                  <Link href="/login" className="font-semibold text-white hover:text-cyan-300">
                    Sign in
                  </Link>
                </p>
              </form>
            </section>

            <aside className="rounded-3xl bg-slate-900/80 p-6 ring-1 ring-white/5 sm:p-8">
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">What happens next</p>
              <div className="mt-6 rounded-[32px] border border-white/10 bg-gradient-to-br from-cyan-500/10 via-slate-900 to-cyan-300/5 p-5">
                <div className="mx-auto w-[220px] rounded-[32px] border border-white/10 bg-slate-950 p-3 shadow-2xl shadow-cyan-500/10">
                  <div className="rounded-[24px] bg-slate-900 p-4">
                    <div className="mx-auto h-2 w-16 rounded-full bg-white/10" />
                    <div className="mt-5 rounded-[22px] bg-gradient-to-br from-cyan-400 to-blue-600 p-4 text-white">
                      <p className="text-xs uppercase tracking-[0.28em] text-cyan-50/80">Live Wallet</p>
                      <p className="mt-3 text-2xl font-semibold">$0.00</p>
                      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-2xl bg-white/10 p-2">
                          <p className="text-cyan-50/70">KYC</p>
                          <p className="mt-1 font-semibold">Pending</p>
                        </div>
                        <div className="rounded-2xl bg-white/10 p-2">
                          <p className="text-cyan-50/70">Assets</p>
                          <p className="mt-1 font-semibold">Ready</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 space-y-3">
                      <div className="rounded-2xl bg-white/5 p-3">
                        <p className="text-xs text-slate-400">First move</p>
                        <p className="mt-1 text-sm font-semibold text-white">Complete KYC and unlock deposits</p>
                      </div>
                      <div className="rounded-2xl bg-white/5 p-3">
                        <p className="text-xs text-slate-400">Real-time updates</p>
                        <p className="mt-1 text-sm font-semibold text-white">Approvals and notifications sync instantly</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 space-y-4 text-slate-200">
                <div className="rounded-3xl bg-white/5 p-4">
                  <p className="text-sm text-slate-300">Step 1</p>
                  <p className="mt-2 text-lg font-semibold text-white">Your investor profile starts clean, with live Firebase data instead of hardcoded balances.</p>
                </div>
                <div className="rounded-3xl bg-white/5 p-4">
                  <p className="text-sm text-slate-300">Step 2</p>
                  <p className="mt-2 text-lg font-semibold text-white">Deposits, withdrawals, KYC, loans, and notifications all update in real time.</p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  )
}
