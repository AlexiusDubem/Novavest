'use client'

import { UserPlus, FileText, CreditCard, TrendingUp } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: UserPlus,
    title: 'Sign Up',
    description: 'Create your account in minutes with just your email and phone number. No credit card required to get started.',
  },
  {
    number: '02',
    icon: FileText,
    title: 'Verify Identity',
    description: 'Complete our quick KYC verification process to unlock full investing capabilities. We support all identity types.',
  },
  {
    number: '03',
    icon: CreditCard,
    title: 'Deposit Funds',
    description: 'Fund your account via bank transfer, credit card, or crypto wallet. Minimum deposit is just $100.',
  },
  {
    number: '04',
    icon: TrendingUp,
    title: 'Start Investing',
    description: 'Browse our curated list of companies and invest. Diversify across sectors and markets.',
  },
]

export function HowItWorksSection() {
  return (
    <section className="relative py-28 px-4 sm:px-6 lg:px-8 landing-section-alt overflow-hidden">
      {/* Subtle glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-teal-500/3 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-5 py-2 text-sm font-semibold text-teal-300 mb-6 backdrop-blur-sm">
            Getting Started
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
            How It{' '}
            <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Works
            </span>
          </h2>
          <p className="text-lg text-slate-400 max-w-3xl mx-auto">
            Get started with just 4 simple steps. You can be investing within minutes.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 relative">
          {/* Connector Line */}
          <div className="hidden md:block absolute top-28 left-[12%] right-[12%] h-px bg-gradient-to-r from-transparent via-teal-500/30 to-transparent" />

          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={index} className={`relative animate-fade-in-up stagger-${index + 1}`}>
                <div className="landing-glass-card rounded-2xl p-8 h-full flex flex-col items-center text-center">
                  {/* Number Circle */}
                  <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center mb-6 text-white font-bold text-xl shadow-lg shadow-teal-500/20">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6 text-teal-400" />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
