'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  AlertCircle,
  Bitcoin,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Globe,
  ShieldCheck,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { fireAlert } from '@/lib/alerts'
import { formatCurrency, formatDate } from '@/lib/formatters'
import {
  createWithdrawalRequest,
  logUserActivity,
  subscribeToWithdrawals,
} from '@/lib/firebase/firestore'
import type { WithdrawalRequest } from '@/lib/firebase/types'

const NETWORK_FEE = 8

// ─── Crypto network options ──────────────────────────────────────────────────
const CRYPTO_NETWORKS = [
  { value: 'BTC — Bitcoin Network', label: 'Bitcoin (BTC) · Bitcoin Network' },
  { value: 'ETH — Ethereum ERC-20', label: 'Ethereum (ETH) · ERC-20' },
  { value: 'USDT — TRC-20 (Tron)', label: 'USDT · TRC-20 (Tron)' },
  { value: 'USDT — ERC-20 (Ethereum)', label: 'USDT · ERC-20 (Ethereum)' },
  { value: 'USDT — BEP-20 (BSC)', label: 'USDT · BEP-20 (BNB Smart Chain)' },
  { value: 'USDC — ERC-20 (Ethereum)', label: 'USDC · ERC-20 (Ethereum)' },
  { value: 'USDC — Polygon', label: 'USDC · Polygon' },
  { value: 'BNB — BEP-20 (BSC)', label: 'BNB · BEP-20 (BNB Smart Chain)' },
  { value: 'SOL — Solana Network', label: 'Solana (SOL) · Solana Network' },
  { value: 'XRP — Ripple Network', label: 'Ripple (XRP) · XRP Ledger' },
  { value: 'LTC — Litecoin Network', label: 'Litecoin (LTC) · Litecoin Network' },
  { value: 'DOGE — Dogecoin Network', label: 'Dogecoin (DOGE) · Dogecoin Network' },
]

type Method = 'crypto' | 'wire_usd' | 'wire_gbp'

export default function WithdrawPage() {
  const { user, profile } = useAuth()
  const [method, setMethod] = useState<Method>('crypto')
  const [amount, setAmount] = useState('')
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([])
  const [submitting, setSubmitting] = useState(false)

  // PIN modal
  const [showPinModal, setShowPinModal] = useState(false)
  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState('')

  // Crypto fields
  const [cryptoNetwork, setCryptoNetwork] = useState(CRYPTO_NETWORKS[0].value)
  const [cryptoAddress, setCryptoAddress] = useState('')

  // Wire USD fields
  const [usdHolder, setUsdHolder] = useState('')
  const [usdAccountNumber, setUsdAccountNumber] = useState('')
  const [usdBankName, setUsdBankName] = useState('')
  const [usdRouting, setUsdRouting] = useState('')
  const [usdAch, setUsdAch] = useState('')
  const [usdAccountType, setUsdAccountType] = useState('Checking')
  const [usdBankAddress, setUsdBankAddress] = useState('')

  // Wire GBP fields
  const [gbpHolder, setGbpHolder] = useState('')
  const [gbpAccountNumber, setGbpAccountNumber] = useState('')
  const [gbpBankName, setGbpBankName] = useState('')
  const [gbpIban, setGbpIban] = useState('')
  const [gbpSort, setGbpSort] = useState('')
  const [gbpSwift, setGbpSwift] = useState('')
  const [gbpBankAddress, setGbpBankAddress] = useState('')

  useEffect(() => {
    if (!user) return
    const stop = subscribeToWithdrawals(user.uid, setWithdrawals)
    return stop
  }, [user])

  const numericAmount = Number(amount)
  const pendingTotal = useMemo(
    () => withdrawals.filter((w) => w.status === 'pending').reduce((t, w) => t + w.amount, 0),
    [withdrawals],
  )

  // ─── Validation ────────────────────────────────────────────────────────────
  async function validateAndPromptPin() {
    if (!user) return

    if (!numericAmount || numericAmount <= 0) {
      await fireAlert({ title: 'Enter a valid amount', text: 'Please enter the amount you wish to withdraw.', icon: 'error', confirmButtonText: 'OK' })
      return
    }
    if (numericAmount > Number(profile?.balance ?? 0)) {
      await fireAlert({ title: 'Insufficient balance', text: 'This withdrawal exceeds your available approved balance.', icon: 'error', confirmButtonText: 'Adjust' })
      return
    }

    // Method-specific field validation
    if (method === 'crypto') {
      if (!cryptoAddress.trim()) {
        await fireAlert({ title: 'Wallet address required', text: 'Please enter your destination wallet address.', icon: 'error', confirmButtonText: 'OK' })
        return
      }
    } else if (method === 'wire_usd') {
      if (!usdHolder || !usdAccountNumber || !usdBankName || !usdRouting) {
        await fireAlert({ title: 'Complete bank details', text: 'Please fill in all required USD wire transfer fields (Account Holder, Account Number, Bank Name, Wire Routing).', icon: 'error', confirmButtonText: 'OK' })
        return
      }
    } else if (method === 'wire_gbp') {
      if (!gbpHolder || !gbpAccountNumber || !gbpBankName || !gbpIban) {
        await fireAlert({ title: 'Complete bank details', text: 'Please fill in all required GBP wire transfer fields (Account Holder, Account Number, Bank Name, IBAN).', icon: 'error', confirmButtonText: 'OK' })
        return
      }
    }

    if (!profile?.withdrawalPin) {
      const result = await fireAlert({
        title: 'Withdrawal PIN required',
        text: 'Please go to the support page or contact our team to obtain the withdrawal PIN for your account.',
        icon: 'warning',
        confirmButtonText: 'Contact Support',
        showCancelButton: true,
      })
      if (result.isConfirmed) window.location.href = '/dashboard/support'
      return
    }

    setPinInput('')
    setPinError('')
    setShowPinModal(true)
    await logUserActivity(user.uid, 'WITHDRAWAL_ATTEMPT', { amount: numericAmount, method })
  }

  // ─── PIN confirmation & submit ─────────────────────────────────────────────
  async function handlePinConfirm() {
    if (pinInput !== profile?.withdrawalPin) {
      setPinError('Incorrect PIN. Please try again.')
      setPinInput('')
      return
    }
    setShowPinModal(false)
    setPinInput('')
    setPinError('')
    if (!user) return

    try {
      setSubmitting(true)
      await logUserActivity(user.uid, 'WITHDRAWAL_AUTHORIZED', { amount: numericAmount, method })

      if (method === 'crypto') {
        await createWithdrawalRequest(user.uid, {
          method: 'crypto',
          amount: numericAmount,
          fee: NETWORK_FEE,
          cryptoNetwork,
          cryptoAddress: cryptoAddress.trim(),
        })
        setCryptoAddress('')
      } else if (method === 'wire_usd') {
        await createWithdrawalRequest(user.uid, {
          method: 'wire_usd',
          amount: numericAmount,
          fee: NETWORK_FEE,
          wireAccountHolder: usdHolder,
          wireAccountNumber: usdAccountNumber,
          wireBankName: usdBankName,
          wireRoutingNumber: usdRouting,
          wireAchRouting: usdAch,
          wireAccountType: usdAccountType,
          wireBankAddress: usdBankAddress,
        })
      } else if (method === 'wire_gbp') {
        await createWithdrawalRequest(user.uid, {
          method: 'wire_gbp',
          amount: numericAmount,
          fee: NETWORK_FEE,
          wireAccountHolder: gbpHolder,
          wireAccountNumber: gbpAccountNumber,
          wireBankName: gbpBankName,
          wireIban: gbpIban,
          wireSortCode: gbpSort,
          wireSwiftCode: gbpSwift,
          wireBankAddress: gbpBankAddress,
        })
      }

      setAmount('')
      await fireAlert({ title: 'Withdrawal submitted', text: 'Your withdrawal request is pending BOLDWAVE review. We will notify you once processed.', icon: 'success', confirmButtonText: 'Done' })
    } catch (error) {
      await fireAlert({ title: 'Unable to submit withdrawal', text: error instanceof Error ? error.message : 'Please try again.', icon: 'error', confirmButtonText: 'Retry' })
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Method tab config ─────────────────────────────────────────────────────
  const tabs: { id: Method; label: string; icon: React.ReactNode }[] = [
    { id: 'crypto', label: 'Crypto Wallet', icon: <Bitcoin className="h-4 w-4" /> },
    { id: 'wire_usd', label: 'Wire Transfer (USD)', icon: <Globe className="h-4 w-4" /> },
    { id: 'wire_gbp', label: 'Wire Transfer (GBP)', icon: <Building2 className="h-4 w-4" /> },
  ]

  const inputClass =
    'mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition'
  const labelClass = 'text-xs font-semibold text-slate-400 uppercase tracking-wider'

  return (
    <>
      {/* PIN modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-[2rem] border border-slate-700 bg-slate-900 p-8 text-white shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-black tracking-tight uppercase">Security Auth</h2>
                <p className="text-xs text-slate-400">Enter your institutional withdrawal PIN</p>
              </div>
            </div>
            <Input
              type="password"
              maxLength={6}
              value={pinInput}
              onChange={(e) => { setPinInput(e.target.value.replace(/\D/g, '')); setPinError('') }}
              placeholder="● ● ● ●"
              className="text-center text-2xl tracking-[0.6em] h-16 bg-slate-800 border-slate-600 text-white"
              autoFocus
            />
            {pinError && <p className="mt-2 text-sm text-rose-400 text-center font-bold">{pinError}</p>}
            <div className="grid grid-cols-2 gap-3 mt-8">
              <Button variant="ghost" className="text-slate-400 hover:text-white" onClick={() => { setShowPinModal(false); setPinInput(''); setPinError('') }}>Cancel</Button>
              <Button className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase tracking-widest h-12 rounded-xl" onClick={handlePinConfirm} disabled={!pinInput || submitting}>
                {submitting ? 'Processing…' : 'Confirm'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Withdraw Funds</h1>
          <p className="mt-1 text-sm text-slate-400">Submit a withdrawal request. BOLDWAVE operations will review and release within 1–3 business days.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* ── Left: Form ── */}
          <div className="space-y-5 lg:col-span-2">

            {/* Warning banner */}
            <div className="flex gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
              <AlertCircle className="mt-0.5 shrink-0 text-amber-400" size={18} />
              <div className="text-sm">
                <p className="font-semibold text-amber-300">Confirmation workflow</p>
                <p className="mt-0.5 text-amber-200/70">Withdrawals remain pending until BOLDWAVE completes the release review. Ensure all details are correct before submitting.</p>
              </div>
            </div>

            {/* Method Tabs */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-1.5 flex gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setMethod(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                    method === tab.id
                      ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.id === 'crypto' ? 'Crypto' : tab.id === 'wire_usd' ? 'USD Wire' : 'GBP Wire'}</span>
                </button>
              ))}
            </div>

            {/* Method-specific fields */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-5">

              {method === 'crypto' && (
                <>
                  <div>
                    <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                      <Bitcoin className="h-5 w-5 text-cyan-400" /> Crypto Withdrawal Details
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label className={labelClass}>Coin & Network</label>
                        <select
                          value={cryptoNetwork}
                          onChange={(e) => setCryptoNetwork(e.target.value)}
                          className={inputClass}
                        >
                          {CRYPTO_NETWORKS.map((n) => (
                            <option key={n.value} value={n.value}>{n.label}</option>
                          ))}
                        </select>
                        <p className="mt-1 text-xs text-rose-400 font-medium">⚠ Always verify the network before submitting — sending to the wrong network will result in permanent loss.</p>
                      </div>
                      <div>
                        <label className={labelClass}>Destination Wallet Address</label>
                        <input
                          type="text"
                          placeholder="Enter your wallet address"
                          value={cryptoAddress}
                          onChange={(e) => setCryptoAddress(e.target.value)}
                          className={inputClass + ' font-mono'}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {method === 'wire_usd' && (
                <>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Globe className="h-5 w-5 text-cyan-400" /> USD Wire Transfer Details
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelClass}>Account Holder Name *</label>
                      <input type="text" placeholder="Full legal name" value={usdHolder} onChange={(e) => setUsdHolder(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Account Number *</label>
                      <input type="text" placeholder="e.g. 123456789" value={usdAccountNumber} onChange={(e) => setUsdAccountNumber(e.target.value)} className={inputClass + ' font-mono'} />
                    </div>
                    <div>
                      <label className={labelClass}>Bank Name *</label>
                      <input type="text" placeholder="e.g. Chase Bank" value={usdBankName} onChange={(e) => setUsdBankName(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Account Type</label>
                      <select value={usdAccountType} onChange={(e) => setUsdAccountType(e.target.value)} className={inputClass}>
                        <option value="Checking">Checking</option>
                        <option value="Savings">Savings</option>
                        <option value="Business Checking">Business Checking</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Wire Routing Number *</label>
                      <input type="text" placeholder="9-digit ABA routing" value={usdRouting} onChange={(e) => setUsdRouting(e.target.value)} className={inputClass + ' font-mono'} />
                    </div>
                    <div>
                      <label className={labelClass}>ACH Routing Number</label>
                      <input type="text" placeholder="ACH routing (if different)" value={usdAch} onChange={(e) => setUsdAch(e.target.value)} className={inputClass + ' font-mono'} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelClass}>Bank Address</label>
                      <input type="text" placeholder="Street, City, State, ZIP" value={usdBankAddress} onChange={(e) => setUsdBankAddress(e.target.value)} className={inputClass} />
                    </div>
                  </div>
                </>
              )}

              {method === 'wire_gbp' && (
                <>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-cyan-400" /> GBP Wire Transfer Details
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelClass}>Account Holder Name *</label>
                      <input type="text" placeholder="Full legal name" value={gbpHolder} onChange={(e) => setGbpHolder(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Account Number *</label>
                      <input type="text" placeholder="8-digit account number" value={gbpAccountNumber} onChange={(e) => setGbpAccountNumber(e.target.value)} className={inputClass + ' font-mono'} />
                    </div>
                    <div>
                      <label className={labelClass}>Bank Name *</label>
                      <input type="text" placeholder="e.g. Barclays Bank" value={gbpBankName} onChange={(e) => setGbpBankName(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Sort Code</label>
                      <input type="text" placeholder="XX-XX-XX" value={gbpSort} onChange={(e) => setGbpSort(e.target.value)} className={inputClass + ' font-mono'} />
                    </div>
                    <div>
                      <label className={labelClass}>IBAN *</label>
                      <input type="text" placeholder="GB29 NWBK 6016 1331 9268 19" value={gbpIban} onChange={(e) => setGbpIban(e.target.value)} className={inputClass + ' font-mono'} />
                    </div>
                    <div>
                      <label className={labelClass}>SWIFT / BIC Code</label>
                      <input type="text" placeholder="e.g. BARCGB22" value={gbpSwift} onChange={(e) => setGbpSwift(e.target.value)} className={inputClass + ' font-mono'} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelClass}>Bank Address</label>
                      <input type="text" placeholder="Street, City, Postcode" value={gbpBankAddress} onChange={(e) => setGbpBankAddress(e.target.value)} className={inputClass} />
                    </div>
                  </div>
                </>
              )}

              {/* Amount — common to all methods */}
              <div className="border-t border-slate-700/60 pt-5">
                <label className={labelClass}>Withdrawal Amount (USD) *</label>
                <div className="relative mt-1.5">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    min={0}
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={inputClass + ' pl-8'}
                  />
                </div>
                <p className="mt-1.5 text-xs text-slate-500">Available: <span className="text-cyan-400 font-semibold">{formatCurrency(profile?.balance ?? 0)}</span></p>
              </div>

              {/* Breakdown */}
              {numericAmount > 0 && (
                <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Withdrawal Amount</span>
                    <span className="font-semibold text-white">{formatCurrency(numericAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Processing Fee</span>
                    <span className="text-amber-400 font-semibold">{formatCurrency(NETWORK_FEE)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-700 pt-2">
                    <span className="font-bold text-white">You Receive</span>
                    <span className="font-black text-emerald-400">{formatCurrency(Math.max(numericAmount - NETWORK_FEE, 0))}</span>
                  </div>
                </div>
              )}

              <Button
                onClick={validateAndPromptPin}
                disabled={submitting || !amount}
                className="w-full h-12 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-black uppercase tracking-widest rounded-xl shadow-[0_0_24px_rgba(6,182,212,0.2)] transition-all"
              >
                {submitting ? 'Submitting…' : 'Submit Withdrawal Request'} <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* ── Right: Sidebar ── */}
          <div className="space-y-4">
            <Card className="border-slate-800 bg-slate-900/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-400 uppercase tracking-widest">Your Balance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-2xl font-black text-white">{formatCurrency(profile?.balance ?? 0)}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Available for withdrawal</p>
                </div>
                <div className="border-t border-slate-700 pt-4">
                  <p className="text-xs text-slate-500">Pending Withdrawals</p>
                  <p className="text-lg font-bold text-amber-400">{formatCurrency(pendingTotal)}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/60">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm text-slate-400 uppercase tracking-widest">
                  <Clock3 size={14} /> Processing Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-slate-400">
                <p>All withdrawals are reviewed by the BOLDWAVE operations desk.</p>
                <p>Wire transfers may take 1–3 business days after approval.</p>
                <p>Only approved balance can be withdrawn.</p>
                <p>Large withdrawals may require additional compliance review.</p>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/60">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm text-slate-400 uppercase tracking-widest">
                  <CheckCircle2 size={14} /> Security Rules
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-slate-400">
                <p>For crypto — only withdraw to a wallet you own and control.</p>
                <p>For wire — double-check all routing/IBAN numbers before submitting.</p>
                <p>BOLDWAVE will never ask you to send funds to a third party.</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ── Withdrawal History ── */}
        <Card className="border-slate-800 bg-slate-900/60">
          <CardHeader>
            <CardTitle className="text-white">Withdrawal History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Method</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Destination</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Fee</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((w) => (
                    <tr key={w.id} className="border-b border-slate-800/60 hover:bg-slate-800/30 transition">
                      <td className="px-4 py-3 text-slate-300">{formatDate(w.createdAt)}</td>
                      <td className="px-4 py-3 text-slate-300 capitalize">
                        {w.withdrawalMethod === 'crypto' ? '₿ Crypto' : w.withdrawalMethod === 'wire_usd' ? '🏦 USD Wire' : '🏦 GBP Wire'}
                      </td>
                      <td className="px-4 py-3 text-slate-300 max-w-[160px] truncate" title={w.walletName}>{w.walletName}</td>
                      <td className="px-4 py-3 font-semibold text-white">{formatCurrency(w.amount)}</td>
                      <td className="px-4 py-3 text-amber-400">{formatCurrency(w.fee)}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                          w.status === 'approved' ? 'bg-emerald-500/15 text-emerald-400' :
                          w.status === 'rejected' ? 'bg-rose-500/15 text-rose-400' :
                          'bg-amber-500/15 text-amber-400'
                        }`}>
                          {w.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {withdrawals.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-slate-500 text-sm">
                        No withdrawal requests yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
