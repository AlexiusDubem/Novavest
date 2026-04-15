'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Compass, Wallet2, Sparkles, ShieldCheck } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { markOnboardingComplete } from '@/lib/firebase/firestore'

const steps = [
  {
    title: 'Welcome to BOLDWAVE',
    description: 'Your dashboard is set up for funding, wallet management, buying, selling, swapping, and tracking portfolio growth.',
    icon: Sparkles,
  },
  {
    title: 'Set up a withdrawal wallet',
    description: 'Before users can withdraw, they should add at least one destination wallet so transfers have somewhere valid to go.',
    icon: Wallet2,
  },
  {
    title: 'Fund and explore',
    description: 'Fund Wallet shows your token deposit addresses while the dashboard market and asset panels help users get familiar quickly.',
    icon: Compass,
  },
  {
    title: 'Stay safe',
    description: 'Double-check networks, addresses, and 2FA verification before moving any assets on-chain.',
    icon: ShieldCheck,
  },
]

export function OnboardingGuide() {
  const { profile, user } = useAuth()
  const [open, setOpen] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    if (!profile) return
    setOpen(!profile.onboardingCompleted)
  }, [profile])

  const step = steps[stepIndex]

  async function finishOnboarding() {
    if (user) {
      await markOnboardingComplete(user.uid)
    }
    setOpen(false)
    setStepIndex(0)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-xl rounded-[28px] border-slate-200 bg-white">
        <DialogHeader>
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-primary">
            <step.icon className="h-6 w-6" />
          </div>
          <DialogTitle className="text-2xl text-slate-900">{step.title}</DialogTitle>
          <DialogDescription className="text-base leading-7 text-slate-600">{step.description}</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2">
          {steps.map((_, index) => (
            <span
              key={index}
              className={`h-2 rounded-full transition-all ${index === stepIndex ? 'w-10 bg-primary' : 'w-2 bg-slate-300'}`}
            />
          ))}
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-600">
          Recommended first action:
          {' '}
          <Link href="/dashboard/wallet" className="font-semibold text-primary">
            add a withdrawal wallet
          </Link>
          {' '}
          so the funding and withdrawal flows feel complete for new users.
        </div>

        <DialogFooter className="gap-3 sm:justify-between">
          <Button variant="outline" onClick={finishOnboarding} className="rounded-full">
            Skip for now
          </Button>
          <div className="flex gap-3">
            {stepIndex > 0 && (
              <Button variant="outline" onClick={() => setStepIndex((value) => value - 1)} className="rounded-full">
                Back
              </Button>
            )}
            {stepIndex < steps.length - 1 ? (
              <Button onClick={() => setStepIndex((value) => value + 1)} className="rounded-full bg-primary text-white hover:bg-primary/90">
                Next
              </Button>
            ) : (
              <Button onClick={finishOnboarding} className="rounded-full bg-primary text-white hover:bg-primary/90">
                Finish Tour
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
