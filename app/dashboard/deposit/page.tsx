'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { BadgeCheck, Copy, ShieldCheck, Wallet2, ArrowRightLeft } from 'lucide-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBtc, faEthereum } from '@fortawesome/free-brands-svg-icons'
import { useAuth } from '@/hooks/use-auth'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { fireAlert } from '@/lib/alerts'
import { createDepositRequest, subscribeToDeposits } from '@/lib/firebase/firestore'
import type { DepositRequest } from '@/lib/firebase/types'

// Official GIRDUP funding wallet addresses
const COMPANY_WALLETS = [
  {
    id: 'btc',
    symbol: 'BTC',
    name: 'Bitcoin',
    network: 'Bitcoin',
    address: '1Pn68t3Zx37AjZ9oHvhCWGnPG2a5tstcRd',
    note: 'Send only BTC to this address. Minimum deposit: 0.001 BTC.'
  },
  {
    id: 'eth',
    symbol: 'ETH',
    name: 'Ethereum',
    network: 'Ethereum (ERC20)',
    address: '0x4bfdd1b2368ff5a7f8c0507062c12d2c77e2bb84',
    note: 'Send ETH to this address. Minimum deposit: 0.01 ETH.'
  }
]

export default function DepositPage() {
  const { user, profile } = useAuth()
  const [selectedAsset, setSelectedAsset] = useState<typeof COMPANY_WALLETS[0] | null>(null)
  const [requests, setRequests] = useState<DepositRequest[]>([])
  const [cryptoAmount, setCryptoAmount] = useState('')
  const [saving, setSaving] = useState(false)
  const [priceData, setPriceData] = useState<Record<string, number>>({})

  useEffect(() => {
    if (!user) return

    const stopRequests = subscribeToDeposits(user.uid, setRequests)
    return () => {
      stopRequests()
    }
  }, [user])

  useEffect(() => {
    async function fetchPrices() {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd')
        const data = await response.json()
        setPriceData({
          BTC: data.bitcoin.usd,
          ETH: data.ethereum.usd
        })
      } catch (error) {
        console.error('Failed to fetch prices:', error)
      }
    }
    fetchPrices()
    const interval = setInterval(fetchPrices, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (COMPANY_WALLETS.length > 0 && !selectedAsset) {
      setSelectedAsset(COMPANY_WALLETS[0])
    }
  }, [selectedAsset])

  const usdValue = useMemo(() => {
    if (!selectedAsset || !cryptoAmount || !priceData[selectedAsset.symbol]) return 0
    return Number(cryptoAmount) * priceData[selectedAsset.symbol]
  }, [selectedAsset, cryptoAmount, priceData])

  async function handleExpectedDeposit() {
    if (!user || !selectedAsset) return

    if (profile?.kycStatus !== 'verified') {
      await fireAlert({
        title: 'KYC verification required',
        text: 'You must complete KYC verification before depositing funds.',
        icon: 'warning',
        confirmButtonText: 'Go to KYC',
      })
      window.location.href = '/dashboard/kyc'
      return
    }

    if (!usdValue || usdValue <= 0) {
      await fireAlert({
        title: 'Enter a valid amount',
        text: 'Set the amount you plan to send so operations can review the deposit intent.',
        icon: 'error',
        confirmButtonText: 'Continue',
      })
      return
    }

    try {
      setSaving(true)
      await createDepositRequest(user.uid, {
        id: selectedAsset.id,
        symbol: selectedAsset.symbol,
        name: selectedAsset.name,
        network: selectedAsset.network,
        address: selectedAsset.address,
        note: selectedAsset.note,
        isActive: true
      }, usdValue)
      setCryptoAmount('')
      await fireAlert({
        title: 'Deposit intent saved',
        text: `GIRDUP has been notified of your ${cryptoAmount} ${selectedAsset.symbol} transfer (${formatCurrency(usdValue)}). Please send the funds if you haven't already.`,
        icon: 'success',
        confirmButtonText: 'OK',
      })
    } catch (error) {
      console.error('Deposit request error:', error)
      await fireAlert({
        title: 'Unable to save deposit intent',
        text: error instanceof Error ? error.message : 'Please try again.',
        icon: 'error',
        confirmButtonText: 'Retry',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Fund Workspace</h1>
          <p className="mt-2 max-w-2xl text-base font-medium text-slate-500 leading-relaxed">
            Choose a live mandate channel, fulfill the transfer, and notify the GIRDUP treasury for confirmation.
          </p>
        </div>

        <div className="dashboard-card inline-flex items-center gap-4 rounded-3xl border-slate-200/60 bg-white px-6 py-4 lg:min-w-[280px]">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
             <Wallet2 size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Active Intents</p>
            <p className="mt-0.5 text-xl font-bold text-slate-900">{requests.filter((item) => item.status === 'pending').length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.7fr_1.3fr]">
        <Card className="dashboard-card overflow-hidden border-slate-200/60 bg-white rounded-[32px] p-0">
          <CardHeader className="p-6 pb-2">
            <CardTitle className="text-lg font-bold text-slate-900">Mandate Channels</CardTitle>
            <CardDescription className="text-xs font-medium text-slate-400 uppercase tracking-widest">GIRDUP Treasury Gateways</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 p-6 pt-4">
            {COMPANY_WALLETS.map((asset) => (
              <button
                key={asset.id}
                type="button"
                onClick={() => setSelectedAsset(asset)}
                className={`flex w-full items-center justify-between rounded-2xl border px-5 py-5 transition-all active:scale-[0.98] ${selectedAsset?.id === asset.id ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20' : 'border-slate-100 bg-slate-50/50 hover:border-slate-200'}`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 overflow-hidden ring-1 ring-slate-100 shadow-inner text-xl">
                    <FontAwesomeIcon 
                      icon={asset.symbol === 'BTC' ? faBtc : faEthereum} 
                      className={asset.symbol === 'BTC' ? 'text-amber-500' : 'text-blue-400'}
                    />
                  </div>
                  <div className="text-left">
                    <p className="text-base font-bold text-slate-900 leading-tight">{asset.name}</p>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{asset.network}</p>
                  </div>
                </div>
                {selectedAsset?.id === asset.id && <BadgeCheck className="h-5 w-5 text-primary" />}
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="dashboard-card overflow-hidden border-slate-200/60 bg-white rounded-[32px] p-0">
          <CardHeader className="p-6 pb-2 sm:p-8">
            <CardTitle className="text-lg font-bold text-slate-900">Secure Gateway</CardTitle>
            <CardDescription className="text-xs font-medium text-slate-400 uppercase tracking-widest">Digital Asset Lockbox</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6 pt-4 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row">
              <div className="flex-1 space-y-6">
                <div className="rounded-[28px] border border-slate-100 bg-slate-50/30 p-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Fulfillment Network</p>
                  <p className="mt-2 text-xl font-bold text-slate-900">{selectedAsset?.network ?? 'Mandate Unassigned'}</p>

                  <div className="mt-8 space-y-4">
                    <div className="rounded-2xl bg-white p-5 border border-slate-100 shadow-sm">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Destination Address</p>
                      <p className="mt-3 break-all font-mono text-sm font-bold leading-relaxed text-slate-700">{selectedAsset?.address || 'Awaiting treasury authorization...'}</p>
                      <Button
                        onClick={() => {
                          if (selectedAsset?.address) {
                            navigator.clipboard.writeText(selectedAsset.address)
                            fireAlert({ title: 'Address Copied', text: 'Wallet address secured in clipboard.', icon: 'success' })
                          }
                        }}
                        className="mt-4 h-11 w-full rounded-xl bg-emerald-600 text-xs font-black uppercase tracking-widest text-white transition hover:bg-emerald-700 active:scale-95 group"
                        disabled={!selectedAsset?.address}
                      >
                        <Copy className="mr-2 h-4 w-4 transition group-hover:rotate-12" />
                        Capture Address
                      </Button>
                    </div>

                    <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 p-4 border border-emerald-100 text-[11px] font-bold text-emerald-700 leading-relaxed">
                       <ShieldCheck className="h-4 w-4 flex-shrink-0" />
                       <span>{selectedAsset?.note || 'Verifying funding channel integrity...'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center rounded-[28px] border border-slate-100 bg-slate-50/30 p-8 lg:w-80">
                 <div className="mb-8 flex flex-col items-center gap-4">
                   <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white ring-4 ring-white shadow-2xl transition hover:scale-105 text-5xl">
                      <FontAwesomeIcon 
                        icon={selectedAsset?.symbol === 'BTC' ? faBtc : faEthereum} 
                        className={selectedAsset?.symbol === 'BTC' ? 'text-amber-500' : 'text-blue-400'}
                      />
                   </div>
                   <div className="text-center">
                     <p className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400">Mandate Channel</p>
                     <p className="mt-1 text-lg font-black text-slate-900">{selectedAsset?.name || 'Authorized'}</p>
                   </div>
                 </div>
                 
                 {selectedAsset?.address ? (
                   <div className="group relative rounded-2xl bg-white p-3 shadow-inner border border-slate-100 transition-all hover:shadow-lg">
                     <img
                       src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(selectedAsset.address)}`}
                       alt="Mandate QR"
                       className="h-32 w-32 object-contain opacity-40 transition group-hover:opacity-100 group-hover:scale-105 grayscale hover:grayscale-0"
                     />
                     <div className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
                        <div className="rounded-full bg-emerald-600/90 px-4 py-1.5 backdrop-blur-md">
                           <p className="text-[9px] font-black uppercase tracking-widest text-white">Scan Token</p>
                        </div>
                     </div>
                   </div>
                 ) : (
                   <div className="flex h-32 w-32 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 text-[10px] font-black uppercase text-slate-300">
                      Awaiting
                   </div>
                 )}
                 <p className="mt-8 text-[10px] font-black uppercase tracking-[0.2em] text-primary italic">
                   Pulse-verified {selectedAsset?.symbol} Treasury
                 </p>
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Fulfillment Commitment</p>
                <p className="text-xs font-medium text-slate-400">Input the exact volume of {selectedAsset?.symbol} dispatched. GIRDUP calculates high-water mark conversion in real-time.</p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                 <div className="relative flex-1 group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400 tracking-tighter transition group-focus-within:text-primary">{selectedAsset?.symbol}</div>
                    <Input
                      type="number"
                      step="any"
                      value={cryptoAmount}
                      onChange={(e) => setCryptoAmount(e.target.value)}
                      placeholder="0.00"
                      className="h-16 rounded-2xl border-slate-200 bg-white pl-16 text-xl font-bold tracking-tighter transition focus:ring-4 focus:ring-primary/10"
                    />
                 </div>
                 
                 <div className="flex items-center justify-center rotate-90 sm:rotate-0">
                    <ArrowRightLeft className="h-6 w-6 text-slate-300" />
                 </div>

                 <div className="relative flex-1">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400 tracking-tighter">$</div>
                    <Input
                      readOnly
                      value={usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      className="h-16 rounded-2xl border-transparent bg-slate-50 pl-10 text-xl font-black text-slate-900"
                    />
                 </div>
              </div>

              <Button
                onClick={handleExpectedDeposit}
                className="h-16 w-full rounded-2xl bg-primary text-lg font-black uppercase tracking-widest text-white shadow-xl shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50"
                disabled={saving || !selectedAsset?.address || !cryptoAmount}
              >
                {saving ? 'Authorizing Intent...' : 'Commit Fulfillment'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="dashboard-card rounded-[30px] border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Recent Funding Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {requests.map((entry) => (
              <div key={entry.id} className="grid gap-2 rounded-[22px] border border-border bg-background/65 px-4 py-4 sm:grid-cols-4 sm:items-center">
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{entry.assetSymbol}</p>
                  <p className="break-all text-sm text-muted-foreground">{entry.network}</p>
                </div>
                <p className="text-sm text-muted-foreground">{formatDate(entry.createdAt)}</p>
                <p className="break-all text-lg font-semibold text-foreground">{formatCurrency(entry.expectedAmount)}</p>
                <div className="sm:text-right">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${entry.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : entry.status === 'rejected' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>
                    {entry.status}
                  </span>
                </div>
              </div>
            ))}
            {requests.length === 0 && <div className="py-8 text-sm text-muted-foreground">No payment confirmations submitted yet.</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
