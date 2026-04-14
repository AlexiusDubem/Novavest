'use client'

import { useEffect, useMemo, useState } from 'react'
import { CandlestickChart, TrendingUp, Zap } from 'lucide-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBtc } from '@fortawesome/free-brands-svg-icons'
import type { InvestmentRecord } from '@/lib/firebase/types'

type Timeframe = 1 | 7 | 30 | 90

interface Candle {
  open: number
  high: number
  low: number
  close: number
  label: string
  signal?: 'BUY' | 'SELL'
}

function buildFallbackCandles(length: number) {
  const candles: Candle[] = []
  let base = 68000
  for (let index = 0; index < length; index += 1) {
    const shift = (Math.random() - 0.45) * 800
    const open = base
    const close = Math.max(1000, open + shift)
    const high = Math.max(open, close) + Math.random() * 200
    const low = Math.min(open, close) - Math.random() * 200
    candles.push({ open, high, low, close, label: `P${index}` })
    base = close
  }
  return candles
}

export function MarketSimulationChart({ activeInvestment }: { activeInvestment?: InvestmentRecord }) {
  const [timeframe, setTimeframe] = useState<string>('1D')
  const [candles, setCandles] = useState<Candle[]>(() => buildFallbackCandles(80))
  const [loading, setLoading] = useState(false)

  const TIMEFRAMES = ['1D', '5D', '1M', '6M', 'YTD', '1Y', '5Y', 'Max']

  useEffect(() => {
    // Simulate data refresh for timeframe change
    const candleCount = 100
    const nextCandles: Candle[] = []
    
    let currentPrice = activeInvestment?.principal ?? 65420
    const targetGrowth = activeInvestment ? (activeInvestment.roiPercent / 100) : 0.05
    const growthPerStep = (currentPrice * targetGrowth) / candleCount

    for (let index = 0; index < candleCount; index += 1) {
      const isBullish = Math.random() < (activeInvestment ? 0.6 : 0.52)
      const move = (Math.random() * 1.5) * growthPerStep * (isBullish ? 1.4 : -0.7)
      const open = currentPrice
      const close = open + move
      nextCandles.push({ open, close, high: 0, low: 0, label: `${index}` })
      currentPrice = close
    }

    setCandles(nextCandles)
  }, [activeInvestment, timeframe])

  const stats = useMemo(() => {
    const closes = candles.map(c => c.close)
    const low = Math.min(...closes)
    const high = Math.max(...closes)
    const last = closes[closes.length - 1] || 0
    const first = closes[0] || last
    const change = ((last - first) / first) * 100
    return { last, low, high, change }
  }, [candles])

  const scaleY = (val: number) => {
    const min = stats.low * 0.999
    const max = stats.high * 1.001
    return 340 - ((val - min) / (max - min || 1)) * 300
  }

  // Generate SVG path for the line
  const linePath = useMemo(() => {
    return candles.map((c, i) => {
      const x = (i * (1000/candles.length))
      const y = scaleY(c.close)
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    }).join(' ')
  }, [candles, stats])

  // Generate SVG path for the area
  const areaPath = useMemo(() => {
    if (candles.length === 0) return ''
    const firstX = 0
    const lastX = 1000
    return `${linePath} L ${lastX} 400 L ${firstX} 400 Z`
  }, [linePath, candles.length])

  return (
    <section className="dashboard-card overflow-hidden rounded-[40px] border-slate-200/60 bg-white p-0 shadow-xl">
      {/* Chart Header */}
      <div className="flex flex-col gap-6 border-b border-slate-100 bg-white px-8 py-8 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm border border-emerald-100">
                <TrendingUp size={20} />
             </div>
             <div>
               <h2 className="text-xl font-bold tracking-tight text-slate-900">
                 {activeInvestment ? `${activeInvestment.planName} Performance` : 'Global Market Terminal'}
               </h2>
               <div className="flex items-center gap-4">
                 <div className="flex h-6 w-6 items-center justify-center rounded-full ring-1 ring-slate-100 shadow-sm flex-shrink-0 text-sm">
                   <FontAwesomeIcon icon={faBtc} className="text-amber-500" />
                 </div>
                 <span className="font-mono text-xs font-black uppercase tracking-widest text-slate-500">BTC/USD (Live Feed)</span>
                 <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-600 ring-1 ring-emerald-200/50 uppercase">
                   <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                   Authorized
                 </div>
               </div>
             </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-50/80 rounded-2xl border border-slate-100">
          {TIMEFRAMES.map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`rounded-xl px-4 py-2.5 text-[11px] font-black tracking-widest transition-all uppercase ${timeframe === t ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Visualizer Area */}
      <div className="relative h-[320px] bg-white sm:h-[420px]">
        {/* Horizontal Grid */}
        <div className="absolute inset-0 z-0 flex flex-col justify-between py-10 opacity-70">
           {[1,2,3,4,5].map(i => (
             <div key={i} className="flex items-center gap-4 px-8">
                <span className="w-12 text-[10px] font-black text-slate-400 font-mono">{(stats.high - (i-1) * (stats.high - stats.low)/4).toFixed(0)}</span>
                <div className="h-px flex-1 bg-slate-100" />
             </div>
           ))}
        </div>

        <svg viewBox="0 0 1000 400" className="relative z-10 h-full w-full" preserveAspectRatio="none">
           <defs>
             <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
               <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
               <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
             </linearGradient>
           </defs>

           {/* Gradient Area Fill */}
           <path d={areaPath} fill="url(#areaGradient)" className="transition-all duration-700" />
           
           {/* Price Line */}
           <path
             d={linePath}
             fill="none"
             stroke="#10b981"
             strokeWidth="3.5"
             strokeLinecap="round"
             strokeLinejoin="round"
             className="transition-all duration-700 drop-shadow-[0_0_12px_rgba(16,185,129,0.4)]"
           />
        </svg>

        {/* Floating Price Label */}
        <div className="absolute right-12 top-10 flex flex-col items-end">
           <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Institutional Mark</p>
           <p className="text-4xl font-black tracking-tighter text-slate-900">${stats.last.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
           <p className={`text-xs font-black uppercase tracking-widest ${stats.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
             {stats.change >= 0 ? '+' : ''}{stats.change.toFixed(2)}% Pulse Gain
           </p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-50 bg-slate-50/30 px-8 py-5 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
        <div className="flex items-center gap-4">
           <span className="text-slate-500 font-black">NovaVest Quantum Feed 2.1</span>
           <div className="h-1.5 w-1.5 rounded-full bg-slate-200" />
           <span>Latency: 14ms</span>
        </div>
        <span>2024 Institutional Engine</span>
      </div>
    </section>
  )
}
