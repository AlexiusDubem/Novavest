'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, ShieldCheck, Globe } from 'lucide-react'
import { motion } from 'framer-motion'

export function CTASection() {
  return (
    <section className="relative py-32 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[#020617]">
      {/* Premium background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-teal-500/5 rounded-full blur-[150px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="rounded-[48px] border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-3xl p-8 sm:p-16 lg:p-24 shadow-2xl relative overflow-hidden group">
          {/* Inner glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl transition-all duration-700 group-hover:scale-150" />
          
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-teal-400 mb-10 shadow-lg">
                <Globe size={14} />
                Global Liquidity Access
              </div>

              <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white mb-10 leading-[1.05] tracking-tight">
                Ready to Scale Your<br />
                <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent italic">
                  Digital Treasury?
                </span>
              </h2>

              <p className="text-lg sm:text-xl text-slate-400 mb-14 max-w-2xl mx-auto leading-relaxed font-medium">
                Join the next generation of institutional investors using BOLDWAVE to manage, grow, and secure their digital asset portfolios.
              </p>

              <div className="flex flex-col sm:flex-row gap-5 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="h-16 px-10 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black uppercase tracking-widest gap-3 rounded-2xl shadow-[0_0_50px_rgba(20,184,166,0.25)] transition-all hover:scale-105 active:scale-95"
                >
                  <Link href="/signup">
                    Get Started Free
                    <ArrowRight size={20} />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  className="h-16 px-10 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold uppercase tracking-widest gap-2 backdrop-blur-md rounded-2xl transition-all"
                >
                  <Link href="/features">
                    Review Protocol
                  </Link>
                </Button>
              </div>

              <div className="mt-16 flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">SEC Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">ISO 27001</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Bank-grade Encrypted</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
