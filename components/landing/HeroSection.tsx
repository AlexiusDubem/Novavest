'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, TrendingUp } from 'lucide-react'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'

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
    <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg">
            <TrendingUp size={16} />
            Crypto Investment Hub
          </div>
        </div>

        {/* Main Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-center text-white mb-6 leading-tight tracking-tight">
          Build Your Crypto{' '}
          <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
            Empire
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-lg sm:text-xl text-gray-300 text-center max-w-3xl mx-auto mb-10 leading-relaxed">
          Trade Bitcoin, Ethereum, and crypto assets with confidence. Advanced charting, real-time analytics, and institutional-grade security for your digital wealth.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
          <Button
            size="lg"
            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold gap-2 shadow-lg"
          >
            <ArrowRight size={20} />
            Start Trading Now
          </Button>
          <Button
            size="lg"
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold backdrop-blur-sm"
          >
            View Market Charts
          </Button>
        </div>

        {/* Chart */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/10 hover:border-teal-500/30 transition-all">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
              <TrendingUp size={20} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-white">30-Day Platform Growth</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#14B8A6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(20, 184, 166, 0.3)',
                  borderRadius: '8px',
                  color: 'white',
                }}
              />
              <Area
                type="monotone"
                dataKey="users"
                stroke="#14B8A6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorUsers)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  )
}
