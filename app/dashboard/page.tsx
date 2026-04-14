'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { MarketSimulationChart } from '@/components/dashboard/MarketSimulationChart'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { fireAlert } from '@/lib/alerts'
import { formatCurrency, formatDateTime } from '@/lib/formatters'
import { subscribeToInvestments, subscribeToTransactions, subscribeToWallets } from '@/lib/firebase/firestore'
import type { InvestmentRecord, TransactionRecord, WalletRecord } from '@/lib/firebase/types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faWallet,
  faShoppingBag,
  faCreditCard,
  faRefresh,
  faArrowDown,
  faArrowUp,
  faArrowRight,
  faCopy,
  faClock,
} from '@fortawesome/free-solid-svg-icons'
import { faBtc, faEthereum } from '@fortawesome/free-brands-svg-icons'

function formatCountdown(investment: InvestmentRecord) {
  if (!investment.startedAt) return 'Pending...'
  const started = investment.startedAt.toDate().getTime()
  const duration = investment.termDays * 24 * 60 * 60 * 1000
  const endTime = started + duration
  const remaining = endTime - Date.now()
  if (remaining <= 0) return 'Completed'
  const days = Math.floor(remaining / (24 * 60 * 60 * 1000))
  const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
  const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000))
  const seconds = Math.floor((remaining % (60 * 1000)) / 1000)
  return `${days}d ${hours}h ${minutes}m ${seconds}s`
}

const actions = [
  { label: 'Fund Wallet', icon: faWallet, href: '/dashboard/deposit', description: 'Send funds to a live wallet and notify GIRDUP once payment is made.' },
  { label: 'Invest', icon: faShoppingBag, href: '/dashboard/investment-plans', description: 'Choose a package and track live ROI as your cycle progresses.' },
  { label: 'Withdraw', icon: faCreditCard, href: '/dashboard/withdraw', description: 'Send a live withdrawal request for GIRDUP confirmation.' },
  { label: 'Wallets', icon: faRefresh, href: '/dashboard/wallet', description: 'Manage destination wallets stored in your account.' },
]

export default function DashboardPage() {
  const { user, profile } = useAuth()
  const [transactions, setTransactions] = useState<TransactionRecord[]>([])
  const [wallets, setWallets] = useState<WalletRecord[]>([])
  const [investments, setInvestments] = useState<InvestmentRecord[]>([])
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!user) return
    const stopTransactions = subscribeToTransactions(user.uid, setTransactions)
    const stopWallets = subscribeToWallets(user.uid, setWallets)
    const stopInvestments = subscribeToInvestments(user.uid, setInvestments)
    
    const interval = setInterval(() => {
      setInvestments(prev => [...prev])
    }, 1000)

    return () => {
      stopTransactions()
      stopWallets()
      stopInvestments()
      clearInterval(interval)
    }
  }, [user])

  const completedDeposits = transactions
    .filter((item) => item.type === 'deposit' || (item.type === 'adjustment' && item.amount > 0))
    .reduce((total, item) => total + item.amount, 0)

  const completedWithdrawals = transactions
    .filter((item) => item.type === 'withdrawal' || (item.type === 'adjustment' && item.amount < 0))
    .reduce((total, item) => total + Math.abs(item.amount), 0)

  const activeInvestment = investments.find((inv) => inv.status === 'active')

  const handleCopyId = () => {
    if (!profile?.portfolioId) return
    navigator.clipboard.writeText(profile.portfolioId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    fireAlert({ title: 'ID Secured', text: 'Portfolio ID copied to clipboard.', icon: 'success' })
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 shadow-sm">
            Operational Protocol Live
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-950 sm:text-5xl">GIRDUP Terminal</h1>
          <p className="max-w-xl text-sm font-bold text-slate-500 leading-relaxed sm:text-base">
            Welcome, {profile?.firstName}. Your workspace is synchronized with the GIRDUP institutional grid.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:w-auto">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm min-w-[200px]">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Ledger Balance</p>
            <p className="mt-2 text-2xl font-black tracking-tighter text-slate-950">
              {formatCurrency(profile?.balance ?? 0)}
            </p>
          </div>
          <div className="rounded-[28px] border border-emerald-100 bg-emerald-50/30 p-5 shadow-sm min-w-[200px]">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600/70">Loan Capacity</p>
            <p className="mt-2 text-2xl font-black tracking-tighter text-emerald-600">
              {formatCurrency(profile?.activeLoanBalance ?? 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Main Portfolio Summary */}
      <section className="relative overflow-hidden rounded-[40px] border border-slate-200 bg-white p-6 sm:p-10 lg:grid lg:grid-cols-[1fr_0.8fr] lg:gap-12 lg:p-12 shadow-sm">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-5 py-3 shadow-inner">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></span>
            </span>
            <span className="text-xs font-black text-slate-500 tracking-wider truncate max-w-[140px] sm:max-w-none uppercase">ID: {profile?.portfolioId}</span>
            <span className="h-4 w-px bg-slate-200 mx-1" />
            <span className="text-[10px] font-black uppercase text-primary tracking-widest">{profile?.investmentPackage} Active</span>
          </div>

          <div className="space-y-1">
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-1">Total Assets</p>
             <div className="text-5xl font-black tracking-tighter text-slate-950 sm:text-7xl lg:text-8xl">
               {formatCurrency(profile?.balance ?? 0)}
             </div>
          </div>

          <button
            onClick={handleCopyId}
            className="group inline-flex w-full items-center justify-center gap-3 rounded-[24px] border border-slate-200 bg-white px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-700 transition duration-300 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 active:scale-95 sm:w-auto"
          >
            <FontAwesomeIcon icon={faCopy} className={`h-4 w-4 transition-transform ${copied ? 'scale-125 text-emerald-400' : 'text-primary'}`} />
            {copied ? 'Copied to Ledger' : 'Secure Portfolio ID'}
          </button>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:mt-0 lg:content-center">
          <div className="rounded-[32px] border border-emerald-100 bg-emerald-50/40 p-6 transition-all hover:shadow-lg hover:shadow-emerald-500/5">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-600/70">Aggregate Funding</p>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 shadow-sm">
                <FontAwesomeIcon icon={faArrowDown} />
              </div>
              <p className="text-2xl font-black tracking-tighter text-emerald-600 truncate">{formatCurrency(completedDeposits)}</p>
            </div>
          </div>
          <div className="rounded-[32px] border border-rose-100 bg-rose-50/40 p-6 transition-all hover:shadow-lg hover:shadow-rose-500/5">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-rose-600/70">Aggregate Exits</p>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 shadow-sm">
                <FontAwesomeIcon icon={faArrowUp} />
              </div>
              <p className="text-2xl font-black tracking-tighter text-rose-600 truncate">{formatCurrency(completedWithdrawals)}</p>
            </div>
          </div>
          <div className="rounded-[32px] border border-slate-200 bg-slate-50/50 p-7 sm:col-span-2 shadow-inner">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Identity Intelligence</p>
            <p className="mt-4 text-sm font-bold leading-relaxed text-slate-600">
              KYC node status: <span className="font-black text-slate-950 uppercase tracking-tight">{profile?.kycStatus?.replace('_', ' ')}</span>. Level {profile?.kycLevel ?? 0} authorization enabled.
            </p>
          </div>
        </div>
      </section>

      {/* Action Grid */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="flex flex-col items-start rounded-[32px] border border-slate-200 bg-white p-6 text-left transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-100 sm:p-8 group"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-slate-50 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all duration-500">
              <FontAwesomeIcon icon={action.icon} />
            </div>
            <p className="mt-8 text-lg font-black tracking-tight text-slate-950 uppercase">{action.label}</p>
            <p className="mt-2 text-xs font-bold leading-relaxed text-slate-400 line-clamp-2">{action.description}</p>
          </Link>
        ))}
      </section>

      {/* Active Investment Card */}
      {activeInvestment && (
        <section className="relative overflow-hidden rounded-[40px] border-2 border-emerald-100 bg-gradient-to-br from-white via-emerald-50/30 to-white p-8 shadow-xl sm:p-12 transition-all">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-400/10 blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-400/8 blur-[100px]" />

          <div className="relative z-10 flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1 space-y-6">
              <div className="flex flex-wrap items-center gap-4">
                 <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 ring-4 ring-slate-100 shadow-xl text-3xl">
                    <FontAwesomeIcon 
                      icon={activeInvestment.planName.toLowerCase().includes('eth') ? faEthereum : faBtc} 
                      className={activeInvestment.planName.toLowerCase().includes('eth') ? 'text-blue-400' : 'text-amber-500'}
                    />
                 </div>
                 <div className="inline-flex items-center gap-3 rounded-full border border-emerald-400/40 bg-emerald-50 px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.25em] text-emerald-600">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
                  </span>
                  Active Mandate
                </div>
                <div className="rounded-full bg-slate-50 border border-slate-200 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                   <FontAwesomeIcon icon={faClock} className="mr-2 text-emerald-500" />
                   Live Pulse: <span className="font-mono text-slate-900 ml-1 text-xs">{formatCountdown(activeInvestment)}</span>
                </div>
              </div>
              <h2 className="text-5xl font-black tracking-tighter text-slate-950 sm:text-7xl">{activeInvestment.planName}</h2>
              <p className="max-w-xl text-base font-bold text-slate-500 leading-relaxed sm:text-lg">
                Quantum mandate currently active. Accumulating ROI on sub-atomic cycle maturity ({activeInvestment.termDays} days).
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 lg:w-full lg:max-w-[700px]">
              <div className="rounded-[32px] border border-slate-100 bg-white p-8 shadow-sm transition hover:shadow-md">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Principal</p>
                <p className="mt-4 font-mono text-3xl font-black tracking-tighter text-slate-900 sm:text-4xl">{formatCurrency(activeInvestment.principal)}</p>
              </div>
              <div className="rounded-[32px] border border-emerald-100 bg-emerald-50 p-8 transition hover:shadow-md">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600/70">Projected ROI</p>
                <p className="mt-4 font-mono text-3xl font-black tracking-tighter text-emerald-600 sm:text-4xl">+{activeInvestment.roiPercent}%</p>
              </div>
              <div className="rounded-[32px] border border-slate-100 bg-white p-8 shadow-sm sm:col-span-2 xl:col-span-1">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Maturity Window</p>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="font-mono text-3xl font-black tracking-tighter text-slate-900 sm:text-4xl">{activeInvestment.termDays}</span>
                  <span className="text-[11px] font-black text-slate-400 tracking-[0.25em]">DAYS</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <MarketSimulationChart activeInvestment={activeInvestment} />

      <section className="grid gap-10 xl:grid-cols-[1fr_0.7fr]">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
             <h2 className="text-2xl font-black tracking-tight text-slate-900 uppercase">Recent Pulse Ledger</h2>
             <Link href="/dashboard/transactions" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">View Full Audit</Link>
          </div>
          <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm overflow-x-auto">
            <div className="min-w-[500px]">
               <div className="hidden grid-cols-3 border-b border-slate-100 px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 md:grid">
                 <span>Description</span>
                 <span>Authorization</span>
                 <span className="text-right">Amount</span>
               </div>
               <div className="divide-y divide-slate-50">
                 {transactions.slice(0, 6).map((item) => (
                   <div key={item.id} className="flex flex-col gap-3 px-6 py-6 md:grid md:grid-cols-3 md:items-center md:gap-0 md:px-8 hover:bg-slate-50/50 transition-colors">
                     <div className="min-w-0">
                       <span className="block truncate font-black text-slate-900 uppercase text-xs tracking-tight">{item.title}</span>
                       <p className="mt-1 text-[10px] font-bold text-slate-400">{formatDateTime(item.createdAt)}</p>
                     </div>
                     <div className="flex items-center gap-2 md:block">
                        <span className={`inline-flex rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest ${item.status === 'approved' || item.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{item.status}</span>
                     </div>
                     <span className={`text-left font-mono font-black md:text-right text-lg tracking-tighter ${item.type === 'withdrawal' || (item.type === 'adjustment' && item.amount < 0) ? 'text-rose-500' : 'text-emerald-500'}`}>
                       {item.type === 'withdrawal' || (item.type === 'adjustment' && item.amount < 0) ? '-' : '+'}
                       {formatCurrency(Math.abs(item.amount))}
                     </span>
                   </div>
                 ))}
                 {transactions.length === 0 && <div className="px-8 py-16 text-center text-sm font-bold text-slate-400 italic bg-slate-50/30">No transaction data available.</div>}
               </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-black tracking-tight text-slate-900 uppercase">Trusted Wallets</h2>
          <div className="grid grid-cols-1 gap-4">
            {wallets.slice(0, 4).map((wallet) => (
              <Link key={wallet.id} href="/dashboard/wallet" className="group flex items-center gap-5 rounded-[32px] border border-slate-200 bg-white p-5 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200 hover:-translate-y-1">
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-50 overflow-hidden ring-1 ring-slate-100 transition group-hover:ring-emerald-400/30 text-2xl">
                   <FontAwesomeIcon 
                     icon={wallet.network.toLowerCase().includes('btc') || wallet.network.toLowerCase().includes('bitcoin') ? faBtc : faEthereum} 
                     className={wallet.network.toLowerCase().includes('btc') || wallet.network.toLowerCase().includes('bitcoin') ? 'text-amber-500' : 'text-blue-400'}
                   />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-lg font-black text-slate-900 uppercase tracking-tight">{wallet.name}</p>
                  <p className="truncate font-mono text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{wallet.network} • {wallet.address.slice(0, 10)}...</p>
                </div>
                <div className="h-10 w-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-primary transition-colors">
                   <FontAwesomeIcon icon={faArrowRight} className="h-4 w-4" />
                </div>
              </Link>
            ))}
            {wallets.length === 0 && <div className="rounded-[32px] border border-slate-100 bg-slate-50/50 p-12 text-center text-xs font-black uppercase tracking-widest text-slate-400 italic">No destination wallets configured.</div>}
            <Button asChild variant="outline" className="w-full h-14 rounded-2xl border-dashed bg-slate-50 text-[10px] font-black uppercase tracking-widest"><Link href="/dashboard/wallet">Configure New Wallet</Link></Button>
          </div>
        </div>
      </section>
    </div>
  )
}
