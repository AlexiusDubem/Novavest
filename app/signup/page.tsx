'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BrandLogo } from '@/components/brand/BrandLogo'
import { useAuth } from '@/hooks/use-auth'
import { signInWithGoogleRaw, signOutUser } from '@/lib/firebase/auth'
import { createUserProfile } from '@/lib/firebase/firestore'
import { fireAlert } from '@/lib/alerts'

export default function SignupPage() {
  const router = useRouter()
  const { user, profile, loading } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const submittingRef = useRef(false) // ref so the useEffect can read latest value without re-running
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    country: '',
    goal: 'growth',
    investmentPackage: 'starter',
    experience: 'beginner',
    riskTolerance: 'moderate',
    horizon: 'medium',
    sourceOfFunds: 'income',
  })

  useEffect(() => {
    // Don't redirect while the signup submit is in progress
    if (submittingRef.current) return
    if (!loading && user && profile) {
      router.replace('/dashboard')
    }
  }, [loading, router, user, profile])

  function updateField(field: keyof typeof formData, value: string) {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    // 1. Basic validation
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.phone ||
      !formData.password ||
      !formData.country
    ) {
      await fireAlert({
        title: 'Complete Profile Details',
        text: 'Please fill in all your personal details before verifying your account.',
        icon: 'error',
        confirmButtonText: 'Continue',
      })
      return
    }

    // 2. Terms Checkbox validation
    if (!acceptTerms) {
      await fireAlert({
        title: 'Terms & Conditions Required',
        text: 'Please review and accept our Terms of Service and Privacy Policy to continue.',
        icon: 'warning',
        confirmButtonText: 'I agree',
      })
      return
    }

    try {
      setSubmitting(true)
      submittingRef.current = true

      const cleanEmail = formData.email.trim().toLowerCase()
      const normalizedFormData = { ...formData, email: cleanEmail }

      // 3. Trigger Google Sign-In as verification (RAW — no auto profile creation)
      const googleUser = await signInWithGoogleRaw()

      if (!googleUser || !googleUser.email) {
        throw new Error('Google Sign-In returned no valid email address. Please try again.')
      }

      const googleEmail = googleUser.email.trim().toLowerCase()

      // 4. Verify Google email matches form email
      if (googleEmail !== cleanEmail) {
        await signOutUser() // Sign out mismatched user session immediately
        await fireAlert({
          title: 'Verification Mismatch',
          html: `
            <div class="text-left space-y-3 text-sm" style="color: #cbd5e1;">
              <p>The Google account you selected does not match the email address provided in the signup form.</p>
              <div class="rounded-2xl border border-white/5 bg-white/5 p-4 space-y-2 mt-2">
                <p><strong>Signup Form Email:</strong> <span class="text-cyan-400">${cleanEmail}</span></p>
                <p><strong>Google Account Email:</strong> <span class="text-rose-400">${googleEmail}</span></p>
              </div>
              <p class="text-xs text-slate-400 mt-2">Please select the matching Google account to securely verify your identity.</p>
            </div>
          `,
          icon: 'error',
          confirmButtonText: 'Try again',
        })
        return
      }

      // 5. Create Firestore User Profile with ALL form data including investor suitability
      console.log('[Signup] Creating Firestore profile for uid:', googleUser.uid)
      await createUserProfile(googleUser, normalizedFormData)
      console.log('[Signup] Firestore profile created successfully')

      await fireAlert({
        title: 'Identity Verified & Registered',
        text: `Welcome to BOLDWAVE, ${formData.firstName}! Your account is now active and verified via Google.`,
        icon: 'success',
        confirmButtonText: 'Open Dashboard',
      })

      router.push('/dashboard')
    } catch (error) {
      console.error('[Signup] Registration error:', error)
      // Clean up incomplete session if the auth was established but Firestore profile creation failed
      try {
        await signOutUser()
      } catch (signOutErr) {
        console.error('[Signup] Clean up signout failed:', signOutErr)
      }
      await fireAlert({
        title: 'Registration failed',
        text: error instanceof Error ? error.message : 'An error occurred during account verification. Please try again.',
        icon: 'error',
        confirmButtonText: 'Try again',
      })
    } finally {
      setSubmitting(false)
      submittingRef.current = false
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background radial effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[600px] h-[400px] bg-teal-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-4xl relative z-10 space-y-8">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <BrandLogo href="/" light subtitle="Investor Platform" />
          </div>
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-300 font-bold">Onboard Security Protocol</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">Create Your Secure Account</h1>
          <p className="mt-3 text-sm text-slate-400 max-w-xl mx-auto">
            Fill in your profile details and verify your email via Google to initiate institutional-grade digital asset investing.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="grid gap-8 md:grid-cols-2">
              
              {/* Left Column: Personal Information */}
              <div className="space-y-6">
                <div className="border-b border-white/5 pb-3">
                  <h2 className="text-lg font-bold tracking-tight text-white">1. Personal Profile</h2>
                  <p className="text-xs text-slate-400">Fill in your legal contact information</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">First Name</label>
                    <Input
                      id="firstName"
                      className="mt-2"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(event) => updateField('firstName', event.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Last Name</label>
                    <Input
                      id="lastName"
                      className="mt-2"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(event) => updateField('lastName', event.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="email" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Email Address</label>
                    <Input
                      id="email"
                      type="email"
                      className="mt-2"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(event) => updateField('email', event.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Phone Number</label>
                    <Input
                      id="phone"
                      type="tel"
                      className="mt-2"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={(event) => updateField('phone', event.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="password" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Password</label>
                    <Input
                      id="password"
                      type="password"
                      className="mt-2"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(event) => updateField('password', event.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="country" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Country</label>
                    <Input
                      id="country"
                      className="mt-2"
                      placeholder="United States"
                      value={formData.country}
                      onChange={(event) => updateField('country', event.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Investor Strategy & Suitability */}
              <div className="space-y-6">
                <div className="border-b border-white/5 pb-3">
                  <h2 className="text-lg font-bold tracking-tight text-white">2. Investor Strategy</h2>
                  <p className="text-xs text-slate-400">Configure your investment preferences</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="goal" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Investment Objective</label>
                    <select
                      id="goal"
                      value={formData.goal}
                      onChange={(event) => updateField('goal', event.target.value)}
                      className="mt-2 w-full rounded-md border border-input bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500"
                    >
                      <option value="growth">Long-term Growth</option>
                      <option value="income">Regular Income</option>
                      <option value="savings">Capital Preservation</option>
                      <option value="speculation">High Growth Focus</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="package" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Preferred Package</label>
                    <select
                      id="package"
                      value={formData.investmentPackage}
                      onChange={(event) => updateField('investmentPackage', event.target.value)}
                      className="mt-2 w-full rounded-md border border-input bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500"
                    >
                      <option value="starter">Starter Plan</option>
                      <option value="growth">Growth Plan</option>
                      <option value="professional">Professional Plan</option>
                    </select>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-4">
                  <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-[0.2em] mb-3">Investor Suitability Questionnaire</h3>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="experience" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Market Experience</label>
                    <select
                      id="experience"
                      value={formData.experience}
                      onChange={(event) => updateField('experience', event.target.value)}
                      className="mt-2 w-full rounded-md border border-input bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500"
                    >
                      <option value="beginner">Beginner (Little knowledge)</option>
                      <option value="intermediate">Intermediate (Active Trader)</option>
                      <option value="expert">Expert (Institutional Pro)</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="riskTolerance" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Risk Profile</label>
                    <select
                      id="riskTolerance"
                      value={formData.riskTolerance}
                      onChange={(event) => updateField('riskTolerance', event.target.value)}
                      className="mt-2 w-full rounded-md border border-input bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500"
                    >
                      <option value="conservative">Conservative</option>
                      <option value="moderate">Moderate</option>
                      <option value="aggressive">Aggressive</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="horizon" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Investment Horizon</label>
                    <select
                      id="horizon"
                      value={formData.horizon}
                      onChange={(event) => updateField('horizon', event.target.value)}
                      className="mt-2 w-full rounded-md border border-input bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500"
                    >
                      <option value="short">Short Term (&lt; 1 Year)</option>
                      <option value="medium">Medium Term (1 - 5 Years)</option>
                      <option value="long">Long Term (5+ Years)</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="sourceOfFunds" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Source of Wealth</label>
                    <select
                      id="sourceOfFunds"
                      value={formData.sourceOfFunds}
                      onChange={(event) => updateField('sourceOfFunds', event.target.value)}
                      className="mt-2 w-full rounded-md border border-input bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500"
                    >
                      <option value="income">Employment / Business Income</option>
                      <option value="savings">Personal Savings</option>
                      <option value="investments">Other Portfolios</option>
                      <option value="inheritance">Inheritance / Grants</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section: Terms Checkbox & CTA */}
            <div className="border-t border-white/5 pt-6 space-y-4">
              <div className="flex items-start gap-3">
                <input
                  id="acceptTerms"
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500"
                  checked={acceptTerms}
                  onChange={(event) => setAcceptTerms(event.target.checked)}
                />
                <label htmlFor="acceptTerms" className="text-sm text-slate-300 leading-snug">
                  I accept the BOLDWAVE{' '}
                  <Link href="/terms" target="_blank" className="font-semibold text-cyan-400 hover:underline">
                    Terms & Conditions
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy-policy" target="_blank" className="font-semibold text-cyan-400 hover:underline">
                    Privacy Policy
                  </Link>
                  . I understand that account creation requires Google email verification.
                </label>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-black uppercase tracking-wider transition-all duration-300 shadow-[0_0_30px_rgba(6,182,212,0.2)] rounded-2xl h-14"
                  disabled={submitting}
                >
                  {submitting ? 'Verifying Credentials...' : 'Create Account'}
                </Button>
              </div>

              <div className="text-center text-sm text-slate-400 pt-2">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-white hover:text-cyan-300 transition-colors">
                  Sign in
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
