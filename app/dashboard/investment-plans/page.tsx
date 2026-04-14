'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TrendingUp, Clock, DollarSign, Timer } from 'lucide-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBtc, faEthereum } from '@fortawesome/free-brands-svg-icons'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/use-auth'
import { fireAlert, showValidationMessage } from '@/lib/alerts'
import { formatCurrency, formatDateTime } from '@/lib/formatters'
import { createInvestmentRequest, subscribeToInvestmentRequests, subscribeToInvestments } from '@/lib/firebase/firestore'
import { INVESTMENT_PLANS } from '@/lib/constants'
import type { InvestmentRecord, InvestmentRequestRecord } from '@/lib/firebase/types'

function formatCountdown(investment: InvestmentRecord) {
  if (!investment.startedAt) return 'Not started'
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

function investmentProgress(investment: InvestmentRecord) {
  if (!investment.startedAt) return 0
  const started = investment.startedAt.toDate().getTime()
  const duration = investment.termDays * 24 * 60 * 60 * 1000
  const elapsed = Date.now() - started
  return Math.min(elapsed / duration, 1)
}

export default function InvestmentPlansPage() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const [requests, setRequests] = useState<InvestmentRequestRecord[]>([])
  const [investments, setInvestments] = useState<InvestmentRecord[]>([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!user) return
    const stopRequests = subscribeToInvestmentRequests(user.uid, setRequests)
    const stopInvestments = subscribeToInvestments(user.uid, setInvestments)
    return () => {
      stopRequests()
      stopInvestments()
    }
  }, [user])

  // Refresh countdown timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      setInvestments(prev => [...prev])
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  async function handleInvest(plan: typeof INVESTMENT_PLANS[0]) {
    if (!user || !profile) return

    if (profile.kycStatus !== 'verified') {
      await fireAlert({
        title: 'Verification needed',
        text: 'Complete your GIRDUP verification before starting a package.',
        icon: 'warning',
        confirmButtonText: 'Open verification',
      })
      router.push('/dashboard/kyc')
      return
    }

    const { value: formValues } = await fireAlert({
      title: `Start ${plan.name} Package`,
      html: `
        <div class="space-y-4 text-left">
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">Investment Amount (USD)</label>
            <input id="amount" type="number" min="${plan.minInvestment}" max="${plan.maxInvestment}" step="0.01" class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Enter amount">
            <p class="mt-1 text-xs text-slate-500">Available: ${formatCurrency(profile.balance ?? 0)}</p>
          </div>
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">Source of Investment Capital</label>
            <select id="source" class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white">
              <option value="Savings">Personal Savings</option>
              <option value="Trading">Trading Profits</option>
              <option value="Mining">Mining Rewards</option>
              <option value="Business">Business Revenue</option>
              <option value="Other">Other Sources</option>
            </select>
          </div>
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 italic text-[13px] text-slate-600">
            "I acknowledge that this capital is not subject to immediate leverage restrictions and I understand the mandate's cycle duration."
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Initialize Mandate',
      preConfirm: () => {
        const amount = (document.getElementById('amount') as HTMLInputElement)?.value
        const source = (document.getElementById('source') as HTMLSelectElement)?.value
        if (!amount || !source) {
          showValidationMessage('Please fill in all required fields')
          return false
        }
        const numericAmount = Number(amount)
        if (numericAmount < Number(plan.minInvestment) || numericAmount > Number(plan.maxInvestment)) {
          showValidationMessage(`Amount must be between ${plan.minInvestment} and ${plan.maxInvestment}`)
          return false
        }
        return { amount: numericAmount, requirements: `Source: ${source}` }
      }
    })

    if (!formValues) return

    const { amount, requirements } = formValues

    if (amount > Number(profile.balance ?? 0)) {
      await fireAlert({
        title: 'Insufficient balance',
        text: 'Fund your wallet first before starting this package.',
        icon: 'error',
        confirmButtonText: 'Fund wallet',
      })
      router.push('/dashboard/deposit')
      return
    }

    try {
      setSubmitting(true)
      await createInvestmentRequest(user.uid, {
        planName: plan.name,
        roiPercent: Number.parseFloat(plan.apy),
        termDays: Number.parseInt(plan.term, 10) * 30,
        amount,
        requirements,
      })
      await fireAlert({
        title: 'Package request submitted',
        text: 'GIRDUP will review your request and notify you once approved.',
        icon: 'success',
        confirmButtonText: 'OK',
      })
    } catch (error) {
      await fireAlert({
        title: 'Unable to start package request',
        text: error instanceof Error ? error.message : 'Please try again.',
        icon: 'error',
        confirmButtonText: 'Retry',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Mandate Packages</h1>
        <p className="max-w-xl text-base font-medium text-slate-500 leading-relaxed sm:text-lg">
          Select a high-frequency mandate cycle once your profile is verified and wallet fulfills the threshold.
        </p>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Available Mandates</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {INVESTMENT_PLANS.map((plan) => (
            <Card key={plan.id} className="dashboard-card overflow-hidden border-slate-200/60 bg-white rounded-[32px] p-0 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/40">
              <CardHeader className="p-7">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-900">{plan.name}</CardTitle>
                    <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-400">{plan.status}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <TrendingUp size={20} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 p-7 pt-0">
                <div className="grid grid-cols-2 gap-3">
                   <div className="rounded-2xl bg-blue-50/50 p-4 border border-blue-100/50">
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-600/60">APY Range</p>
                      <p className="mt-1 text-lg font-bold text-blue-700 tracking-tighter">{plan.apy}</p>
                   </div>
                   <div className="rounded-2xl bg-teal-50/50 p-4 border border-teal-100/50">
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-teal-600/60">Mandate Term</p>
                      <p className="mt-1 text-lg font-bold text-teal-700 tracking-tighter">{plan.term}</p>
                   </div>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50/30 p-4">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Capital Requirement</p>
                  <p className="mt-2 text-sm font-bold text-slate-700">{plan.minInvestment} - {plan.maxInvestment}</p>
                </div>

                <p className="text-xs font-medium leading-relaxed text-slate-400">{plan.description}</p>
                
                <Button 
                  onClick={() => handleInvest(plan)}
                  disabled={isProcessing === plan.id}
                  className="h-14 w-full rounded-2xl bg-emerald-600 text-xs font-black uppercase tracking-widest text-white transition hover:bg-emerald-700 active:scale-[0.98]" 
                >
                  {isProcessing === plan.id ? 'Authorizing...' : 'Initialize Mandate'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="mb-8 grid w-full grid-cols-2 rounded-2xl bg-slate-100 p-1">
          <TabsTrigger value="active" className="rounded-xl py-3 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-slate-950">Active Tracker</TabsTrigger>
          <TabsTrigger value="requests" className="rounded-xl py-3 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-slate-950">History Log</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <div className="space-y-6">
            {investments.length > 0 ? (
              investments.map((investment) => {
                const progress = investmentProgress(investment)
                const projectedReturn = investment.principal * (investment.roiPercent / 100)
                const liveValue = investment.principal + projectedReturn * progress
                const countdown = formatCountdown(investment)

                return (
                  <Card key={investment.id} className="dashboard-card relative overflow-hidden border-slate-200/60 bg-white rounded-[40px] p-7 shadow-2xl sm:p-12">
                    {/* Institutional Background Elements */}
                    <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/5 blur-[100px]" />
                    <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-500/5 blur-[100px]" />

                    <div className="relative z-10">
                      <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-5">
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5 ring-4 ring-slate-50 shadow-xl text-3xl">
                             <FontAwesomeIcon
                               icon={investment.planName.toLowerCase().includes('eth') ? faEthereum : faBtc}
                               className={investment.planName.toLowerCase().includes('eth') ? 'text-blue-400' : 'text-amber-500'}
                             />
                          </div>
                          <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-emerald-500">
                               <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
                               Institutional Mandate
                            </div>
                            <h3 className="text-4xl font-black tracking-tighter text-slate-900">{investment.planName}</h3>
                          </div>
                        </div>
                        <div className="inline-flex items-center gap-4 rounded-[24px] bg-slate-50 border border-slate-100 px-6 py-4 text-sm font-bold text-slate-900 shadow-sm">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100/50">
                             <Timer size={16} className="text-emerald-600" />
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Time Remaining</p>
                            <span className="font-mono text-base tracking-tight">{countdown}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
                        <div className="rounded-[28px] border border-slate-100 bg-slate-50/50 p-6 transition hover:bg-white hover:shadow-lg hover:shadow-slate-100">
                          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400">Initial Principal</p>
                          <p className="mt-3 font-mono text-2xl font-bold tracking-tighter text-slate-900">{formatCurrency(investment.principal)}</p>
                        </div>
                        <div className="rounded-[28px] border border-emerald-100 bg-emerald-50/20 p-6 transition hover:bg-white hover:shadow-lg hover:shadow-emerald-100/20">
                          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-emerald-600/80">Estimated Pulse</p>
                          <p className="mt-3 font-mono text-2xl font-bold tracking-tighter text-emerald-600">{formatCurrency(liveValue)}</p>
                        </div>
                        <div className="rounded-[28px] border border-slate-100 bg-slate-50/50 p-6 transition hover:bg-white hover:shadow-lg hover:shadow-slate-100">
                          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400">Mandate ROI</p>
                          <p className="mt-3 font-mono text-2xl font-bold tracking-tighter text-primary">+{investment.roiPercent}%</p>
                        </div>
                        <div className="rounded-[28px] border border-slate-100 bg-slate-50/50 p-6 transition hover:bg-white hover:shadow-lg hover:shadow-slate-100">
                          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400">Total Completion</p>
                          <p className="mt-3 font-mono text-2xl font-bold tracking-tighter text-slate-900">{Math.round(progress * 100)}%</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                          <span>Alpha Propagation Progress</span>
                          <span className="text-slate-950">{Math.round(progress * 100)}% SECURED</span>
                        </div>
                        <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-100">
                           <div 
                             className="absolute inset-y-0 left-0 rounded-full bg-primary shadow-[0_0_20px_rgba(59,130,246,0.6)] transition-all duration-1000 ease-out" 
                             style={{ width: `${progress * 100}%` }}
                           >
                             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                           </div>
                        </div>
                      </div>
                      
                      <div className="mt-10 flex flex-col gap-4 border-t border-slate-50 pt-8 sm:flex-row sm:items-center sm:justify-between">
                         <div className="flex items-center gap-4">
                           <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ring-2 ring-slate-100 shadow-sm text-lg">
                             <FontAwesomeIcon icon={faBtc} className="text-amber-500" />
                           </div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                             Live mandate initiated {formatDateTime(investment.startedAt)}<br/>
                             <span className="text-emerald-500">Quantum Feed: Latency 12ms • Operational</span>
                           </p>
                         </div>
                         <div className="flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 ring-1 ring-slate-200/50">
                           Verified Institutional Record
                         </div>
                      </div>
                    </div>
                  </Card>
                )
              })
            ) : (
              <div className="rounded-[32px] border-2 border-dashed border-slate-200 bg-slate-50/50 py-16 text-center">
                 <p className="text-sm font-bold text-slate-400 tracking-widest uppercase italic">No active mandate detected.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="requests">
          <div className="space-y-4">
            {requests.length > 0 ? (
              requests.map((request) => (
                <Card key={request.id} className="dashboard-card overflow-hidden border-slate-200/60 bg-white rounded-3xl p-6">
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-5 sm:items-center">
                      <div className="col-span-1">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Mandate</p>
                        <p className="mt-1 font-bold text-slate-900 truncate">{request.planName}</p>
                      </div>
                      <div className="col-span-1">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Principal</p>
                        <p className="mt-1 font-bold text-slate-900">{formatCurrency(request.amount)}</p>
                      </div>
                      <div className="hidden sm:block">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Term</p>
                        <p className="mt-1 font-bold text-slate-900">{request.termDays}d Cycle</p>
                      </div>
                      <div className="hidden sm:block">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Authorization</p>
                        <p className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-black uppercase text-amber-600 tracking-tighter ring-1 ring-amber-200/30">{request.status}</p>
                      </div>
                      <div className="text-right sm:text-left">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Captured</p>
                        <p className="mt-1 text-xs font-bold text-slate-400">{formatDateTime(request.createdAt).split(',')[0]}</p>
                      </div>
                    </div>
                </Card>
              ))
            ) : (
              <div className="rounded-3xl border border-slate-100 bg-slate-50/50 py-12 text-center text-sm font-bold text-slate-300 uppercase italic">
                 Log history empty.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
