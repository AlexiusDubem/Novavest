'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Rocket } from 'lucide-react'

export function CTASection() {
  return (
    <section className="relative py-28 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-br from-slate-950 via-[#0a1628] to-slate-950">
      {/* Animated decorative orbs */}
      <div className="absolute top-10 right-[10%] w-[300px] h-[300px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none animate-float" />
      <div className="absolute bottom-10 left-[15%] w-[250px] h-[250px] bg-cyan-500/8 rounded-full blur-[80px] pointer-events-none animate-float stagger-3" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500/15 to-cyan-500/15 border border-teal-500/20 rounded-full px-5 py-2 text-sm font-bold text-teal-300 mb-8 backdrop-blur-sm">
            <Rocket size={14} />
            Start Today
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
            Ready to Build Your{' '}
            <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Crypto Empire
            </span>
            ?
          </h2>

          <p className="text-lg sm:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join over 1.2 million investors who are building wealth with BOLDWAVE. Start with just $100 and grow your portfolio today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up stagger-2">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold gap-2 shadow-lg shadow-teal-500/20 rounded-xl text-base px-8"
            >
              <Link href="/signup">
                <ArrowRight size={20} />
                Start Investing Now
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="bg-white/5 hover:bg-white/10 text-white border border-white/10 font-semibold backdrop-blur-sm rounded-xl text-base px-8"
            >
              <Link href="/features">
                Explore Features
              </Link>
            </Button>
          </div>

          <p className="text-slate-500 mt-10 text-sm animate-fade-in-up stagger-4">
            No credit card required • Takes 5 minutes • 100% free to start
          </p>
        </div>
      </div>
    </section>
  )
}
