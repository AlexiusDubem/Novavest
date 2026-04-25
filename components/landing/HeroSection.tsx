'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, TrendingUp, ShieldCheck, Zap } from 'lucide-react'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import Link from 'next/link'
import { motion } from 'framer-motion'

const chartData = [
  { month: 'Jan', users: 4000 },
  { month: 'Feb', users: 5200 },
  { month: 'Mar', users: 6800 },
  { month: 'Apr', users: 7200 },
  { month: 'May', users: 9100 },
  { month: 'Jun', users: 10500 },
  { month: 'Jul', users: 12800 },
]

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 bg-[#020617] overflow-hidden">
      {/* Premium background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-teal-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150 contrast-150" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 backdrop-blur-md px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-teal-400 mb-8 shadow-xl">
              <span className="flex h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
              Institutional Liquidity Engine
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-8 leading-[1.1] tracking-tight">
              Master the<br />
              <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent italic">
                Crypto Pulse
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg text-slate-400 max-w-xl mb-12 leading-relaxed font-medium">
              Join the elite circle of digital asset managers. BOLDWAVE provides the infrastructure, data, and security needed to scale your crypto mandates with professional precision.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-5">
              <Button
                asChild
                size="lg"
                className="h-16 px-10 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black uppercase tracking-widest gap-3 rounded-2xl shadow-[0_0_40px_rgba(20,184,166,0.3)] transition-all hover:scale-105 active:scale-95"
              >
                <Link href="/signup">
                  Launch Terminal
                  <ArrowRight size={20} />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                className="h-16 px-10 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold uppercase tracking-widest gap-2 backdrop-blur-md rounded-2xl transition-all"
              >
                <Link href="/login">
                  Member Auth
                </Link>
              </Button>
            </div>

            {/* Trust Markers */}
            <div className="mt-12 flex items-center gap-8 border-t border-white/5 pt-10">
              <div className="flex flex-col gap-1">
                <span className="text-2xl font-black text-white">45k+</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Active Mandates</span>
              </div>
              <div className="h-10 w-[1px] bg-white/10" />
              <div className="flex flex-col gap-1">
                <span className="text-2xl font-black text-white">$1.2B</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">AUM Managed</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Interactive Card / Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-[40px] opacity-20 blur-2xl" />
            <div className="relative bg-[#0f172a]/80 backdrop-blur-3xl rounded-[40px] border border-white/10 p-8 shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-teal-500 flex items-center justify-center text-slate-950 shadow-lg shadow-teal-500/20">
                    <Zap size={24} fill="currentColor" />
                  </div>
                  <div>
                    <h3 className="text-white font-black uppercase tracking-tight">Real-time Pulse</h3>
                    <p className="text-[10px] text-teal-400 font-black uppercase tracking-widest flex items-center gap-1">
                      <span className="h-1 w-1 rounded-full bg-teal-400 animate-ping" />
                      Live Network Feed
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 font-bold">Total Velocity</p>
                  <p className="text-xl font-black text-white">+12.4%</p>
                </div>
              </div>

              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#14B8A6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '20px',
                        fontSize: '12px',
                        color: 'white',
                        fontWeight: 'bold',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                      }}
                      itemStyle={{ color: '#14B8A6' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="users"
                      stroke="#14B8A6"
                      strokeWidth={4}
                      fillOpacity={1}
                      fill="url(#colorUsers)"
                      animationDuration={3000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-4 border-t border-white/5 pt-8">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-500" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Secure</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-amber-500" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Instant</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-teal-500" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Growth</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
