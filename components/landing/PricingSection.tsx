'use client'

import { Check, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    description: 'Perfect for beginners',
    features: [
      'Up to $10,000 in investments',
      'Basic portfolio tracking',
      'Email support',
      'Standard market data',
      'Mobile app access',
    ],
    highlighted: false,
  },
  {
    name: 'Professional',
    price: '$9.99',
    period: '/month',
    description: 'For active investors',
    features: [
      'Unlimited investments',
      'Advanced analytics & insights',
      'Priority email & chat support',
      'Real-time data feeds',
      'Custom watchlists',
      'Tax reporting tools',
      'API access',
    ],
    highlighted: true,
  },
  {
    name: 'Elite',
    price: '$29.99',
    period: '/month',
    description: 'For professional traders',
    features: [
      'Everything in Professional',
      'Dedicated account manager',
      'Advanced trading tools',
      'Crypto derivatives',
      'Options trading',
      'Advanced charting',
      'White-label solution',
      'Custom integrations',
    ],
    highlighted: false,
  },
]

export function PricingSection() {
  return (
    <section className="relative py-28 px-4 sm:px-6 lg:px-8 landing-section-dark overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-20 left-0 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-5 py-2 text-sm font-semibold text-teal-300 mb-6 backdrop-blur-sm">
            <Sparkles size={14} />
            Pricing Plans
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Transparent{' '}
            <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Pricing
            </span>
          </h2>
          <p className="text-lg text-slate-400 max-w-3xl mx-auto">
            Choose the plan that fits your investment style. No hidden fees, cancel anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-2xl p-8 transition-all duration-500 animate-fade-in-up stagger-${index + 1} ${
                plan.highlighted
                  ? 'bg-gradient-to-b from-teal-500/20 via-cyan-500/10 to-transparent border border-teal-500/30 shadow-[0_0_50px_rgba(20,184,166,0.12)] scale-[1.03]'
                  : 'landing-glass-card'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg shadow-teal-500/25">
                  <Sparkles size={12} />
                  Most Popular
                </div>
              )}

              {/* Header */}
              <h3 className={`text-2xl font-bold mb-2 ${plan.highlighted ? 'text-teal-300' : 'text-white'}`}>
                {plan.name}
              </h3>
              <p className="text-sm mb-6 text-slate-400">
                {plan.description}
              </p>

              {/* Price */}
              <div className="mb-8">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                {plan.period && <span className="text-slate-400">{plan.period}</span>}
              </div>

              {/* CTA Button */}
              <Button
                className={`w-full mb-8 font-semibold rounded-xl ${
                  plan.highlighted
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg shadow-teal-500/20'
                    : 'bg-white/10 hover:bg-white/15 text-white border border-white/10'
                }`}
                size="lg"
              >
                Get Started
              </Button>

              {/* Features */}
              <ul className="space-y-4">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-teal-500/15 flex items-center justify-center flex-shrink-0">
                      <Check size={12} className="text-teal-400" />
                    </div>
                    <span className="text-slate-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
