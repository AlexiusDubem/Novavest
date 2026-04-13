'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, Copy, CreditCard, RefreshCw, ShoppingBag, Wallet2 } from 'lucide-react'
import { MarketSimulationChart } from '@/components/dashboard/MarketSimulationChart'
import { useAuth } from '@/hooks/use-auth'
import { formatCurrency, formatDateTime } from '@/lib/formatters'
import { subscribeToInvestments, subscribeToTransactions, subscribeToWallets } from '@/lib/firebase/firestore'
import type { InvestmentRecord, TransactionRecord, WalletRecord } from '@/lib/firebase/types'
import { Timer } from 'lucide-react'

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
  { label: 'Fund Wallet', icon: Wallet2, href: '/dashboard/deposit', description: 'Send funds to a live wallet and notify NovaVest once payment is made.' },
  { label: 'Invest', icon: ShoppingBag, href: '/dashboard/investment-plans', description: 'Choose a package and track live ROI as your cycle progresses.' },
  { label: 'Withdraw', icon: CreditCard, href: '/dashboard/withdraw', description: 'Send a live withdrawal request for NovaVest confirmation.' },
  { label: 'Wallets', icon: RefreshCw, href: '/dashboard/wallet', description: 'Manage destination wallets stored in your account.' },
]

export default function DashboardPage() {
  const { user, profile } = useAuth()
  const [transactions, setTransactions] = useState<TransactionRecord[]>([])
  const [wallets, setWallets] = useState<WalletRecord[]>([])
  const [investments, setInvestments] = useState<InvestmentRecord[]>([])

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

  const accruedROI = activeInvestment ? activeInvestment.principal * (activeInvestment.roiPercent / 100) : 0
  const totalProjected = activeInvestment ? activeInvestment.principal + accruedROI : 0

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-primary shadow-sm">
            Investor Overview
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">NovaVest dashboard</h1>
          <p className="max-w-xl text-base font-medium text-slate-500 leading-relaxed sm:text-lg">
            Welcome back, {profile?.firstName}. Your workspace is live with real-time mandate tracking.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:min-w-[400px]">
          <div className="dashboard-card rounded-[28px] border-slate-200/60 bg-white/80 p-5 backdrop-blur-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Available balance</p>
            <p className="mt-3 text-2xl font-bold tracking-tighter text-slate-900 sm:text-3xl">
              {formatCurrency(profile?.balance ?? 0)}
            </p>
          </div>
          <div className="dashboard-card rounded-[28px] border-emerald-500/10 bg-emerald-500/5 p-5 backdrop-blur-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500/60">Active loan balance</p>
            <p className="mt-3 text-2xl font-bold tracking-tighter text-emerald-600 sm:text-3xl">
              {formatCurrency(profile?.activeLoanBalance ?? 0)}
            </p>
          </div>
        </div>
      </div>

      <section className="dashboard-card grid gap-8 rounded-[32px] border-slate-200/60 bg-white p-6 sm:p-8 lg:grid-cols-[1fr_0.8fr] lg:p-10">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-3 rounded-full border border-slate-100 bg-slate-50 px-4 py-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-slate-600 tracking-wider truncate max-w-[180px] sm:max-w-none">{profile?.portfolioId}</span>
            <span className="h-4 w-px bg-slate-200" />
            <span className="text-xs font-black uppercase text-slate-400 tracking-tighter">{profile?.investmentPackage}</span>
          </div>

          <div className="text-4xl font-bold tracking-tighter text-slate-900 sm:text-6xl lg:text-7xl">
            {formatCurrency(profile?.balance ?? 0)}
          </div>

          <button
            onClick={() => {
              navigator.clipboard.writeText(profile?.portfolioId ?? '')
              fireAlert({ title: 'ID Copied', text: 'Portfolio ID copied to clipboard.', icon: 'success' })
            }}
            className="inline-flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-bold text-slate-700 transition active:scale-95 sm:w-auto"
          >
            <Copy className="h-4 w-4 text-primary" />
            Copy Portfolio ID
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[28px] border border-emerald-100 bg-emerald-50/30 p-6 transition hover:bg-emerald-50/50">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600/70">Completed deposits</p>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                <ArrowDownLeft className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold tracking-tighter text-emerald-600">{formatCurrency(completedDeposits)}</p>
            </div>
          </div>
          <div className="rounded-[28px] border border-rose-100 bg-rose-50/30 p-6 transition hover:bg-rose-50/50">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-600/70">Completed withdrawals</p>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/10 text-rose-600">
                <ArrowUpRight className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold tracking-tighter text-rose-600">{formatCurrency(completedWithdrawals)}</p>
            </div>
          </div>
          <div className="rounded-[28px] border border-slate-100 bg-slate-50/30 p-6 sm:col-span-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Verification Intelligence</p>
            <p className="mt-4 text-sm font-medium leading-relaxed text-slate-600">
              Account KYC status is currently <span className="font-bold text-slate-900 underline decoration-primary/30 underline-offset-4">{profile?.kycStatus?.replace('_', ' ')}</span>. Level {profile?.kycLevel ?? 0} authorization granted.
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="dashboard-card flex flex-col items-start rounded-[32px] border-slate-200/60 bg-white p-5 text-left transition hover:-translate-y-1 sm:p-7"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <action.icon className="h-5 w-5" />
            </div>
            <p className="mt-6 text-lg font-bold tracking-tight text-slate-900">{action.label}</p>
            <p className="mt-2 text-xs font-medium leading-relaxed text-slate-400 sm:text-sm line-clamp-2">{action.description}</p>
          </Link>
        ))}
      </section>

      {activeInvestment && (
        <section className="dashboard-card relative overflow-hidden rounded-[40px] bg-white border border-slate-200/60 p-8 shadow-2xl sm:p-12 transition-all hover:shadow-slate-200/50">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/5 blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-500/5 blur-[100px]" />

          <div className="relative z-10 flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1 space-y-6">
              <div className="flex items-center gap-4">
                 <div className="h-14 w-14 overflow-hidden rounded-full ring-4 ring-slate-50 shadow-xl">
                    <img
                      src={activeInvestment.planName.toLowerCase().includes('eth') ? '/assets/crypto/eth.jpg' : '/assets/crypto/btc.jpg'}
                      alt="Mandate Logo"
                      className="h-full w-full object-cover"
                    />
                 </div>
                 <div className="inline-flex items-center gap-3 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-emerald-600">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
                  </span>
                  Active Pulse
                </div>
                <div className="rounded-full bg-slate-100 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ring-1 ring-slate-200/50">
                   Live Countdown: <span className="font-mono text-slate-950 ml-2 text-xs">{activeInvestment ? formatCountdown(activeInvestment) : '--:--:--'}</span>
                </div>
              </div>
              <h2 className="text-5xl font-black tracking-tighter text-slate-950 sm:text-7xl">{activeInvestment.planName}</h2>
              <p className="max-w-xl text-base font-medium text-slate-600 leading-relaxed sm:text-lg">
                High-frequency mandate currently active. ROI accruals are locked until cycle maturity at {activeInvestment.termDays} days.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:min-w-[700px]">
              <div className="group rounded-[32px] border border-slate-100 bg-slate-50/50 p-8 transition hover:bg-white hover:shadow-xl hover:shadow-slate-100">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Principal</p>
                <div className="mt-4 flex items-center gap-3">
                   <div className="h-8 w-8 overflow-hidden rounded-full ring-2 ring-white shadow-sm grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition">
                      <img src={activeInvestment.planName.toLowerCase().includes('eth') ? '/assets/crypto/eth.jpg' : '/assets/crypto/btc.jpg'} alt="Asset" className="h-full w-full object-cover" />
                   </div>
                   <p className="font-mono text-3xl font-bold tracking-tighter text-slate-950 sm:text-4xl">{formatCurrency(activeInvestment.principal)}</p>
                </div>
              </div>
              <div className="group rounded-[32px] border border-emerald-500/20 bg-emerald-500/5 p-8 transition hover:bg-white hover:shadow-xl hover:shadow-emerald-100">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600/70">Maturity ROI</p>
                <div className="mt-4 flex items-center gap-3">
                   <div className="h-8 w-8 overflow-hidden rounded-full ring-2 ring-white shadow-sm grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition">
                      <img src={activeInvestment.planName.toLowerCase().includes('eth') ? '/assets/crypto/eth.jpg' : '/assets/crypto/btc.jpg'} alt="Asset" className="h-full w-full object-cover" />
                   </div>
                   <p className="font-mono text-3xl font-bold tracking-tighter text-emerald-600 sm:text-4xl">+{activeInvestment.roiPercent}%</p>
                </div>
              </div>
              <div className="group rounded-[32px] border border-slate-100 bg-slate-50/50 p-8 transition hover:bg-white hover:shadow-xl hover:shadow-slate-100">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Duration</p>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="font-mono text-3xl font-bold tracking-tighter text-slate-950 sm:text-4xl">{activeInvestment.termDays}</span>
                  <span className="text-[11px] font-black text-slate-500 tracking-[0.25em]">DAYS</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <MarketSimulationChart activeInvestment={activeInvestment} />

      <section className="grid gap-10 lg:grid-cols-[1fr_0.7fr]">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Recent Pulse Activity</h2>
          <div className="dashboard-card overflow-hidden rounded-[32px] border-slate-200/60 bg-white">
            <div className="hidden grid-cols-3 border-b border-slate-100 px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 md:grid">
              <span>Description</span>
              <span>Authorization</span>
              <span className="text-right">Amount</span>
            </div>
            <div className="divide-y divide-slate-50">
              {transactions.slice(0, 6).map((item) => (
                <div key={item.id} className="flex flex-col gap-3 px-6 py-5 md:grid md:grid-cols-3 md:items-center md:gap-0 md:px-8">
                  <div className="min-w-0">
                    <span className="block truncate font-bold text-slate-900">{item.title}</span>
                    <p className="mt-1 text-xs font-medium text-slate-400">{formatDateTime(item.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2 md:block">
                     <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-tighter ${item.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{item.status}</span>
                  </div>
                  <span className={`text-left font-mono font-bold md:text-right ${item.type === 'withdrawal' ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {item.type === 'withdrawal' ? '-' : '+'}
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              ))}
              {transactions.length === 0 && <div className="px-8 py-12 text-center text-sm font-medium text-slate-400 italic">No activity registered in the current session.</div>}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Destination Wallets</h2>
          <div className="grid grid-cols-1 gap-4">
            {wallets.slice(0, 4).map((wallet) => (
              <Link key={wallet.id} href="/dashboard/wallet" className="dashboard-card group flex items-center gap-5 rounded-[28px] border-slate-200/60 bg-white p-5 transition hover:shadow-xl hover:shadow-slate-200/30">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 overflow-hidden ring-1 ring-slate-100 transition group-hover:ring-primary/30">
                  <img
                    src={wallet.network.toLowerCase().includes('btc') ? '/assets/crypto/btc.jpg' : '/assets/crypto/eth.jpg'}
                    alt={wallet.network}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-1">
                    <p className="truncate text-lg font-bold text-slate-900">{wallet.name}</p>
                    <p className="truncate font-mono text-xs font-medium text-slate-400">{wallet.address}</p>
                  </div>
                </div>
                <ArrowUpRight className="h-5 w-5 text-slate-300 transition group-hover:text-primary" />
              </Link>
            ))}
            {wallets.length === 0 && <div className="dashboard-card rounded-[28px] border-slate-100 bg-slate-50/50 p-8 text-center text-sm font-medium text-slate-400 italic">No saved destination wallets detected.</div>}
          </div>
        </div>
      </section>

    </div>
  )
}
