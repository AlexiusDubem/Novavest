'use client'

import { Check, Sparkles, TrendingUp, ShieldCheck, Zap } from 'lucide-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBtc } from '@fortawesome/free-brands-svg-icons'
import { Button } from '@/components/ui/button'
import { INVESTMENT_PLANS } from '@/lib/constants'
import Link from 'next/link'

export function InvestmentPlansSection() {
  return (
    <section className="relative py-28 px-4 sm:px-6 lg:px-8 landing-section-dark overflow-hidden">
      {/* Institutional gradient background */}
      <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-20 left-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-5 py-2 text-xs font-black uppercase tracking-[0.25em] text-emerald-400 mb-6 backdrop-blur-sm">
            <TrendingUp size={14} />
            Institutional Mandates
          </div>
          <h2 className="text-5xl sm:text-7xl font-black text-white mb-6 tracking-tighter">
            Quantum{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Yield Portfolios
            </span>
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto font-medium leading-relaxed">
            Select an institutional-grade investment mandate designed for peak capital efficiency and risk-adjusted returns.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-stretch">
          {INVESTMENT_PLANS.map((plan, index) => (
            <div
              key={plan.id}
              className={`relative rounded-[40px] p-10 transition-all duration-700 animate-fade-in-up stagger-${index + 1} group hover:translate-y-[-8px] ${
                plan.id === 3
                  ? 'bg-gradient-to-b from-emerald-500/10 via-slate-900 to-slate-900 border border-emerald-500/30'
                  : 'landing-glass-card border border-white/5'
              }`}
            >
              {plan.id === 3 && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 bg-emerald-500 text-slate-950 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                  <Zap size={12} fill="currentColor" />
                  High Frequency
                </div>
              )}

              {/* Portfolio Header */}
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-black text-white mb-2 tracking-tight group-hover:text-emerald-400 transition-colors">
                    {plan.name}
                  </h3>
                  <div className="flex items-center gap-2 text-slate-500">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full ring-1 ring-white/10 text-sm">
                      <FontAwesomeIcon icon={faBtc} className="text-amber-400" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">Bilateral Mandate</span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-400/10 transition-all">
                  <ShieldCheck size={24} />
                </div>
              </div>

              {/* APY ROI Display */}
              <div className="mb-10 p-6 rounded-[32px] bg-slate-950/40 border border-white/5 group-hover:border-emerald-500/20 transition-all">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Projected APY</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-6xl font-black tracking-tighter text-white group-hover:text-emerald-400 transition-colors">
                    {plan.apy.replace('%', '')}
                  </span>
                  <span className="text-2xl font-black text-emerald-500">%</span>
                </div>
              </div>

              {/* Mandate Detail Grid */}
              <div className="grid grid-cols-2 gap-4 mb-10 text-center">
                 <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Locked Term</p>
                    <p className="mt-1.5 text-sm font-bold text-slate-100">{plan.term}</p>
                 </div>
                 <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Threshold</p>
                    <p className="mt-1.5 text-sm font-bold text-slate-100">{plan.minInvestment}</p>
                 </div>
              </div>

              {/* Features / Details */}
              <p className="text-sm text-slate-400 mb-10 leading-relaxed font-medium">
                {plan.description}
              </p>

              {/* CTA */}
              <Button
                asChild
                className={`w-full py-7 rounded-2xl text-[11px] font-black uppercase tracking-[0.25em] transition-all duration-500 active:scale-95 ${
                  plan.id === 3
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_10px_30px_rgba(16,185,129,0.2)]'
                    : 'bg-white hover:bg-slate-50 text-slate-950 shadow-xl'
                }`}
              >
                <Link href="/signup">
                  Initialize Mandate
                </Link>
              </Button>

              {/* Verified Badge */}
              <div className="mt-8 flex items-center justify-center gap-2 opacity-30 group-hover:opacity-100 transition-opacity">
                 <div className="h-1 w-1 rounded-full bg-emerald-500" />
                 <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">BOLDWAVE Secure Protocol 2.1</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
