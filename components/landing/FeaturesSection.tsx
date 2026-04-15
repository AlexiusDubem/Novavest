'use client'

import { Shield, TrendingUp, Zap, Globe, Lock, BarChart3 } from 'lucide-react'

const features = [
  {
    icon: Globe,
    title: 'Global Crypto Markets',
    description: 'Trade Bitcoin, Ethereum, and 100+ cryptocurrencies 24/7 across all major global markets.',
  },
  {
    icon: Shield,
    title: 'Military-Grade Security',
    description: 'Cold storage + multi-signature wallets protecting your digital assets with institutional-grade encryption.',
  },
  {
    icon: TrendingUp,
    title: 'Pro Trading Tools',
    description: 'Advanced candlestick charts, technical analysis, real-time alerts, and AI-powered market insights.',
  },
  {
    icon: Lock,
    title: 'DeFi Integration',
    description: 'Yield farming, staking, liquidity pools, and smart contract interactions in one seamless platform.',
  },
  {
    icon: Zap,
    title: 'Lightning Settlements',
    description: 'Blockchain-fast transactions with minimal fees. Buy and sell crypto instantly, 24/7.',
  },
  {
    icon: BarChart3,
    title: 'Portfolio Analytics',
    description: 'Real-time portfolio tracking, performance metrics, and personalized investment recommendations.',
  },
]

export function FeaturesSection() {
  return (
    <section className="relative py-28 px-4 sm:px-6 lg:px-8 landing-section-dark overflow-hidden">
      {/* Decorative orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-5 py-2 text-sm font-semibold text-teal-300 mb-6 backdrop-blur-sm">
            <Zap size={14} />
            Platform Advantages
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Why Choose{' '}
            <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              BOLDWAVE
            </span>
          </h2>
          <p className="text-lg text-slate-400 max-w-3xl mx-auto">
            The most advanced crypto trading platform for serious investors
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className={`landing-glass-card p-7 rounded-2xl group animate-fade-in-up stagger-${index + 1}`}
              >
                <div className="w-14 h-14 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center mb-5 group-hover:from-teal-500/40 group-hover:to-cyan-500/40 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(20,184,166,0.2)]">
                  <Icon className="w-6 h-6 text-teal-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
