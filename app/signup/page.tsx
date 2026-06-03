'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BrandLogo } from '@/components/brand/BrandLogo'
import { useAuth } from '@/hooks/use-auth'
import { signInWithGoogleRaw, signOutUser, signUpWithEmail } from '@/lib/firebase/auth'
import { createUserProfile } from '@/lib/firebase/firestore'
import { fireAlert } from '@/lib/alerts'

export default function SignupPage() {
  const router = useRouter()
  const { user, profile, loading } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const submittingRef = useRef(false)
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
    if (submittingRef.current) return
    if (!loading && user && profile) {
      router.replace('/dashboard')
    }
  }, [loading, router, user, profile])

  function updateField(field: keyof typeof formData, value: string) {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  // ─── Shared validation ──────────────────────────────────────────────────────
  async function validateForm(): Promise<boolean> {
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
        text: 'Please fill in all personal details before creating your account.',
        icon: 'error',
        confirmButtonText: 'Continue',
      })
      return false
    }
    if (!acceptTerms) {
      await fireAlert({
        title: 'Terms & Conditions Required',
        text: 'Please review and accept our Terms of Service and Privacy Policy to continue.',
        icon: 'warning',
        confirmButtonText: 'I agree',
      })
      return false
    }
    return true
  }

  // ─── Email / Password sign-up ───────────────────────────────────────────────
  async function handleEmailSignup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!(await validateForm())) return

    try {
      setSubmitting(true)
      submittingRef.current = true

      const cleanEmail = formData.email.trim().toLowerCase()
      await signUpWithEmail({ ...formData, email: cleanEmail })

      await fireAlert({
        title: 'Account Created!',
        text: `Welcome to BOLDWAVE, ${formData.firstName}! Your account is now active.`,
        icon: 'success',
        confirmButtonText: 'Open Dashboard',
      })
      router.push('/dashboard')
    } catch (error) {
      console.error('[Signup] Email registration error:', error)
      await fireAlert({
        title: 'Registration failed',
        text: error instanceof Error ? error.message : 'An error occurred. Please try again.',
        icon: 'error',
        confirmButtonText: 'Try again',
      })
    } finally {
      setSubmitting(false)
      submittingRef.current = false
    }
  }

  // ─── Google sign-up (email-verified path) ──────────────────────────────────
  async function handleGoogleSignup() {
    if (!(await validateForm())) return

    try {
      setSubmitting(true)
      submittingRef.current = true

      const cleanEmail = formData.email.trim().toLowerCase()
      const normalizedFormData = { ...formData, email: cleanEmail }

      const googleUser = await signInWithGoogleRaw()
      if (!googleUser || !googleUser.email) {
        throw new Error('Google Sign-In returned no valid email address. Please try again.')
      }

      const googleEmail = googleUser.email.trim().toLowerCase()
      if (googleEmail !== cleanEmail) {
        await signOutUser()
        await fireAlert({
          title: 'Verification Mismatch',
          html: `
            <div class="text-left space-y-3 text-sm" style="color: #cbd5e1;">
              <p>The Google account you selected does not match the email in the signup form.</p>
              <div class="rounded-2xl border border-white/5 bg-white/5 p-4 space-y-2 mt-2">
                <p><strong>Signup Form Email:</strong> <span class="text-cyan-400">${cleanEmail}</span></p>
                <p><strong>Google Account Email:</strong> <span class="text-rose-400">${googleEmail}</span></p>
              </div>
              <p class="text-xs text-slate-400 mt-2">Please select the matching Google account to verify your identity.</p>
            </div>
          `,
          icon: 'error',
          confirmButtonText: 'Try again',
        })
        return
      }

      await createUserProfile(googleUser, normalizedFormData)

      await fireAlert({
        title: 'Identity Verified & Registered',
        text: `Welcome to BOLDWAVE, ${formData.firstName}! Your account is verified via Google.`,
        icon: 'success',
        confirmButtonText: 'Open Dashboard',
      })
      router.push('/dashboard')
    } catch (error) {
      console.error('[Signup] Google registration error:', error)
      try { await signOutUser() } catch { /* ignore */ }

      const isPopupBlocked =
        error instanceof Error &&
        (error.message.includes('popup-blocked') ||
          (error as any).code === 'auth/popup-blocked' ||
          error.message.toLowerCase().includes('popup'))

      if (isPopupBlocked) {
        await fireAlert({
          title: 'Verification Pop-up Blocked',
          html: `
            <div class="text-left space-y-3 text-sm" style="color: #cbd5e1;">
              <p>Your browser blocked the Google verification pop-up window.</p>
              <div class="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 mt-2">
                <p class="font-bold text-amber-400">How to allow pop-ups:</p>
                <ul class="list-disc pl-4 space-y-1 mt-1 text-slate-300">
                  <li>Look for a pop-up blocker icon in your browser's address bar.</li>
                  <li>Click it and choose <strong>"Always allow pop-ups from this site"</strong>.</li>
                  <li>Then click "Try again" to complete your registration.</li>
                </ul>
              </div>
            </div>
          `,
          icon: 'warning',
          confirmButtonText: 'Try again',
        })
      } else {
        await fireAlert({
          title: 'Registration failed',
          text: error instanceof Error ? error.message : 'An error occurred during verification. Please try again.',
          icon: 'error',
          confirmButtonText: 'Try again',
        })
      }
    } finally {
      setSubmitting(false)
      submittingRef.current = false
    }
  }

  const selectClass = 'mt-2 w-full rounded-md border border-input bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500'

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
            Fill in your profile details, then choose how to create your account — via email & password or by verifying with Google.
          </p>
        </div>

        {/* wrap the whole form so pressing Enter triggers email signup by default */}
        <form className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 sm:p-10 shadow-2xl backdrop-blur-xl space-y-8" onSubmit={handleEmailSignup}>
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
                  <Input id="firstName" className="mt-2" placeholder="John" value={formData.firstName} onChange={(e) => updateField('firstName', e.target.value)} />
                </div>
                <div>
                  <label htmlFor="lastName" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Last Name</label>
                  <Input id="lastName" className="mt-2" placeholder="Doe" value={formData.lastName} onChange={(e) => updateField('lastName', e.target.value)} />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="email" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Email Address</label>
                  <Input id="email" type="email" className="mt-2" placeholder="you@example.com" value={formData.email} onChange={(e) => updateField('email', e.target.value)} />
                </div>
                <div>
                  <label htmlFor="phone" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Phone Number</label>
                  <Input id="phone" type="tel" className="mt-2" placeholder="+1 (555) 000-0000" value={formData.phone} onChange={(e) => updateField('phone', e.target.value)} />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="password" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Password</label>
                  <Input id="password" type="password" className="mt-2" placeholder="Min. 8 characters" value={formData.password} onChange={(e) => updateField('password', e.target.value)} />
                </div>
                <div>
                  <label htmlFor="country" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Country</label>
                  <Input id="country" className="mt-2" placeholder="United States" value={formData.country} onChange={(e) => updateField('country', e.target.value)} />
                </div>
              </div>
            </div>

            {/* Right Column: Investor Strategy */}
            <div className="space-y-6">
              <div className="border-b border-white/5 pb-3">
                <h2 className="text-lg font-bold tracking-tight text-white">2. Investor Strategy</h2>
                <p className="text-xs text-slate-400">Configure your investment preferences</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="goal" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Investment Objective</label>
                  <select id="goal" value={formData.goal} onChange={(e) => updateField('goal', e.target.value)} className={selectClass}>
                    <option value="growth">Long-term Growth</option>
                    <option value="income">Regular Income</option>
                    <option value="savings">Capital Preservation</option>
                    <option value="speculation">High Growth Focus</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="package" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Preferred Package</label>
                  <select id="package" value={formData.investmentPackage} onChange={(e) => updateField('investmentPackage', e.target.value)} className={selectClass}>
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
                  <select id="experience" value={formData.experience} onChange={(e) => updateField('experience', e.target.value)} className={selectClass}>
                    <option value="beginner">Beginner (Little knowledge)</option>
                    <option value="intermediate">Intermediate (Active Trader)</option>
                    <option value="expert">Expert (Institutional Pro)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="riskTolerance" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Risk Profile</label>
                  <select id="riskTolerance" value={formData.riskTolerance} onChange={(e) => updateField('riskTolerance', e.target.value)} className={selectClass}>
                    <option value="conservative">Conservative</option>
                    <option value="moderate">Moderate</option>
                    <option value="aggressive">Aggressive</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="horizon" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Investment Horizon</label>
                  <select id="horizon" value={formData.horizon} onChange={(e) => updateField('horizon', e.target.value)} className={selectClass}>
                    <option value="short">Short Term (&lt; 1 Year)</option>
                    <option value="medium">Medium Term (1 – 5 Years)</option>
                    <option value="long">Long Term (5+ Years)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="sourceOfFunds" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Source of Wealth</label>
                  <select id="sourceOfFunds" value={formData.sourceOfFunds} onChange={(e) => updateField('sourceOfFunds', e.target.value)} className={selectClass}>
                    <option value="income">Employment / Business Income</option>
                    <option value="savings">Personal Savings</option>
                    <option value="investments">Other Portfolios</option>
                    <option value="inheritance">Inheritance / Grants</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section: Terms + Dual CTA */}
          <div className="border-t border-white/5 pt-6 space-y-5">
            {/* Terms checkbox */}
            <div className="flex items-start gap-3">
              <input
                id="acceptTerms"
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
              />
              <label htmlFor="acceptTerms" className="text-sm text-slate-300 leading-snug">
                I accept the BOLDWAVE{' '}
                <Link href="/terms" target="_blank" className="font-semibold text-cyan-400 hover:underline">Terms & Conditions</Link>{' '}
                and{' '}
                <Link href="/privacy-policy" target="_blank" className="font-semibold text-cyan-400 hover:underline">Privacy Policy</Link>.
              </label>
            </div>

            {/* Dual CTA section */}
            <div className="rounded-2xl border border-white/5 bg-slate-800/40 p-5 space-y-4">
              <p className="text-xs text-center text-slate-400 uppercase tracking-widest font-semibold">Choose how to create your account</p>

              {/* Primary: Email/Password */}
              <Button
                id="signup-email-btn"
                type="submit"
                size="lg"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-black uppercase tracking-wider transition-all duration-300 shadow-[0_0_30px_rgba(6,182,212,0.2)] rounded-2xl h-14"
              >
                {submitting ? 'Creating Account…' : '✉ Create Account with Email & Password'}
              </Button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-slate-500 font-medium">OR</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Secondary: Google */}
              <button
                id="signup-google-btn"
                type="button"
                disabled={submitting}
                onClick={handleGoogleSignup}
                className="w-full h-12 flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold transition-all disabled:opacity-50"
              >
                {/* Google icon */}
                <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                {submitting ? 'Verifying…' : 'Verify & Create Account with Google'}
              </button>

              <p className="text-center text-xs text-slate-500">
                Google sign-up verifies your email identity. Email/password is faster and works without Google.
              </p>
            </div>

            <div className="text-center text-sm text-slate-400">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-white hover:text-cyan-300 transition-colors">Sign in</Link>
            </div>
          </div>
        </form>
      </div>
    </main>
  )
}
