'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertCircle, Bitcoin, Building2, CheckCircle2, Clock3, Globe, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { fireAlert } from '@/lib/alerts'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { createWithdrawalRequest, logUserActivity, subscribeToWithdrawals } from '@/lib/firebase/firestore'
import type { WithdrawalRequest } from '@/lib/firebase/types'

const NETWORK_FEE = 8

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
    return subscribeToWithdrawals(user.uid, setWithdrawals)
  }, [user])

  const numericAmount = Number(amount)
  const pendingTotal = useMemo(
    () => withdrawals.filter((w) => w.status === 'pending').reduce((t, w) => t + w.amount, 0),
    [withdrawals],
  )

  async function validateAndPromptPin() {
    if (!user) return

    if (!numericAmount || numericAmount <= 0) {
      await fireAlert({ title: 'Enter a valid withdrawal amount', text: 'BOLDWAVE needs a valid withdrawal amount before we can create the request.', icon: 'error', confirmButtonText: 'Continue' })
      return
    }
    if (numericAmount > Number(profile?.balance ?? 0)) {
      await fireAlert({ title: 'Insufficient wallet balance', text: 'This withdrawal request exceeds the available approved balance.', icon: 'error', confirmButtonText: 'Adjust amount' })
      return
    }

    if (method === 'crypto' && !cryptoAddress.trim()) {
      await fireAlert({ title: 'Wallet address required', text: 'Please enter your destination wallet address for this withdrawal.', icon: 'error', confirmButtonText: 'Continue' })
      return
    }
    if (method === 'wire_usd' && (!usdHolder || !usdAccountNumber || !usdBankName || !usdRouting)) {
      await fireAlert({ title: 'Complete bank details', text: 'Please fill in Account Holder, Account Number, Bank Name, and Wire Routing Number.', icon: 'error', confirmButtonText: 'Continue' })
      return
    }
    if (method === 'wire_gbp' && (!gbpHolder || !gbpAccountNumber || !gbpBankName || !gbpIban)) {
      await fireAlert({ title: 'Complete bank details', text: 'Please fill in Account Holder, Account Number, Bank Name, and IBAN.', icon: 'error', confirmButtonText: 'Continue' })
      return
    }

    if (!profile?.withdrawalPin) {
      await fireAlert({
        title: 'Withdrawal PIN required',
        text: 'Please go to the support page or contact our team to obtain the unique withdrawal PIN for your account.',
        icon: 'warning',
        confirmButtonText: 'Contact Support',
        showCancelButton: true,
      }).then((result) => {
        if (result.isConfirmed) window.location.href = '/dashboard/support'
      })
      return
    }

    setPinInput('')
    setPinError('')
    setShowPinModal(true)
    await logUserActivity(user.uid, 'WITHDRAWAL_ATTEMPT', { amount: numericAmount, method })
  }

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
        await createWithdrawalRequest(user.uid, { method: 'crypto', amount: numericAmount, fee: NETWORK_FEE, cryptoNetwork, cryptoAddress: cryptoAddress.trim() })
        setCryptoAddress('')
      } else if (method === 'wire_usd') {
        await createWithdrawalRequest(user.uid, { method: 'wire_usd', amount: numericAmount, fee: NETWORK_FEE, wireAccountHolder: usdHolder, wireAccountNumber: usdAccountNumber, wireBankName: usdBankName, wireRoutingNumber: usdRouting, wireAchRouting: usdAch, wireAccountType: usdAccountType, wireBankAddress: usdBankAddress })
      } else if (method === 'wire_gbp') {
        await createWithdrawalRequest(user.uid, { method: 'wire_gbp', amount: numericAmount, fee: NETWORK_FEE, wireAccountHolder: gbpHolder, wireAccountNumber: gbpAccountNumber, wireBankName: gbpBankName, wireIban: gbpIban, wireSortCode: gbpSort, wireSwiftCode: gbpSwift, wireBankAddress: gbpBankAddress })
      }

      setAmount('')
      await fireAlert({ title: 'Withdrawal submitted', text: 'Your withdrawal request is pending BOLDWAVE review.', icon: 'success', confirmButtonText: 'Done' })
    } catch (error) {
      await fireAlert({ title: 'Unable to create withdrawal', text: error instanceof Error ? error.message : 'Please try again.', icon: 'error', confirmButtonText: 'Retry' })
    } finally {
      setSubmitting(false)
    }
  }

  const tabs: { id: Method; label: string; icon: React.ReactNode }[] = [
    { id: 'crypto', label: 'Crypto Wallet', icon: <Bitcoin size={16} /> },
    { id: 'wire_usd', label: 'Wire Transfer (USD)', icon: <Globe size={16} /> },
    { id: 'wire_gbp', label: 'Wire Transfer (GBP)', icon: <Building2 size={16} /> },
  ]

  const fieldLabel = 'mb-2 block text-sm font-medium text-gray-700'
  const fieldInput = 'w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-gray-900 outline-none focus:border-primary font-[inherit]'

  return (
    <>
      {/* PIN modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-[2rem] border border-slate-700 bg-slate-900 p-8 text-white shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
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
            {pinError && <p className="mt-2 text-sm text-rose-400 text-center font-bold tracking-tight">{pinError}</p>}
            <div className="grid grid-cols-2 gap-3 mt-8">
              <Button variant="ghost" className="text-slate-400 hover:text-white" onClick={() => { setShowPinModal(false); setPinInput(''); setPinError('') }}>Cancel</Button>
              <Button className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase tracking-widest h-12 rounded-xl" onClick={handlePinConfirm} disabled={!pinInput || submitting}>{submitting ? 'Authenticating...' : 'Confirm'}</Button>
            </div>
          </div>
        </div>
      )}

      <div>
        <div className="space-y-6">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-primary">Withdraw Funds</h1>
            <p className="text-gray-600">Create a withdrawal request for BOLDWAVE confirmation and release.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">

              {/* Warning */}
              <div className="flex gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <AlertCircle className="mt-0.5 shrink-0 text-yellow-600" size={20} />
                <div className="text-sm">
                  <p className="font-semibold text-yellow-900">Confirmation workflow</p>
                  <p className="mt-1 text-yellow-800">Withdrawals stay pending until BOLDWAVE completes the release review. Ensure all details are correct before submitting.</p>
                </div>
              </div>

              {/* Method selector */}
              <Card>
                <CardHeader>
                  <CardTitle>Select Withdrawal Method</CardTitle>
                  <CardDescription>Choose how you want to receive your funds.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setMethod(tab.id)}
                      className={`w-full flex items-center gap-3 rounded-lg border-2 p-4 text-left transition ${method === tab.id ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <span className={method === tab.id ? 'text-primary' : 'text-gray-400'}>{tab.icon}</span>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{tab.label}</p>
                        <p className="text-xs text-gray-500">
                          {tab.id === 'crypto' && 'Send directly to your crypto wallet address'}
                          {tab.id === 'wire_usd' && 'US bank wire — ACH / SWIFT routing'}
                          {tab.id === 'wire_gbp' && 'UK bank wire — IBAN / Sort code'}
                        </p>
                      </div>
                      <div className={`h-4 w-4 rounded-full border-2 ${method === tab.id ? 'border-primary bg-primary' : 'border-gray-300'}`} />
                    </button>
                  ))}
                </CardContent>
              </Card>

              {/* Method-specific fields */}
              {method === 'crypto' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Crypto Withdrawal Details</CardTitle>
                    <CardDescription>Select the coin & network, then enter your destination wallet address.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className={fieldLabel}>Coin &amp; Network</label>
                      <select
                        value={cryptoNetwork}
                        onChange={(e) => setCryptoNetwork(e.target.value)}
                        className={fieldInput}
                      >
                        {CRYPTO_NETWORKS.map((n) => (
                          <option key={n.value} value={n.value}>{n.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={fieldLabel}>Destination Wallet Address</label>
                      <input
                        type="text"
                        placeholder="Enter your wallet address"
                        value={cryptoAddress}
                        onChange={(e) => setCryptoAddress(e.target.value)}
                        className={fieldInput + ' font-mono'}
                      />
                      <p className="mt-1 text-xs text-orange-600 font-medium">⚠ Always verify the network — sending to the wrong network results in permanent loss.</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {method === 'wire_usd' && (
                <Card>
                  <CardHeader>
                    <CardTitle>USD Wire Transfer Details</CardTitle>
                    <CardDescription>Enter your US bank account information for the wire transfer.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className={fieldLabel}>Account Holder Name *</label>
                        <Input placeholder="Full legal name" value={usdHolder} onChange={(e) => setUsdHolder(e.target.value)} />
                      </div>
                      <div>
                        <label className={fieldLabel}>Account Number *</label>
                        <Input placeholder="e.g. 123456789" value={usdAccountNumber} onChange={(e) => setUsdAccountNumber(e.target.value)} className="font-mono" />
                      </div>
                      <div>
                        <label className={fieldLabel}>Bank Name *</label>
                        <Input placeholder="e.g. Chase Bank" value={usdBankName} onChange={(e) => setUsdBankName(e.target.value)} />
                      </div>
                      <div>
                        <label className={fieldLabel}>Account Type</label>
                        <select value={usdAccountType} onChange={(e) => setUsdAccountType(e.target.value)} className={fieldInput}>
                          <option value="Checking">Checking</option>
                          <option value="Savings">Savings</option>
                          <option value="Business Checking">Business Checking</option>
                        </select>
                      </div>
                      <div>
                        <label className={fieldLabel}>Wire Routing Number *</label>
                        <Input placeholder="9-digit ABA routing" value={usdRouting} onChange={(e) => setUsdRouting(e.target.value)} className="font-mono" />
                      </div>
                      <div>
                        <label className={fieldLabel}>ACH Routing Number</label>
                        <Input placeholder="ACH routing (if different)" value={usdAch} onChange={(e) => setUsdAch(e.target.value)} className="font-mono" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className={fieldLabel}>Bank Address</label>
                        <Input placeholder="Street, City, State, ZIP" value={usdBankAddress} onChange={(e) => setUsdBankAddress(e.target.value)} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {method === 'wire_gbp' && (
                <Card>
                  <CardHeader>
                    <CardTitle>GBP Wire Transfer Details</CardTitle>
                    <CardDescription>Enter your UK bank account information for the wire transfer.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className={fieldLabel}>Account Holder Name *</label>
                        <Input placeholder="Full legal name" value={gbpHolder} onChange={(e) => setGbpHolder(e.target.value)} />
                      </div>
                      <div>
                        <label className={fieldLabel}>Account Number *</label>
                        <Input placeholder="8-digit account number" value={gbpAccountNumber} onChange={(e) => setGbpAccountNumber(e.target.value)} className="font-mono" />
                      </div>
                      <div>
                        <label className={fieldLabel}>Bank Name *</label>
                        <Input placeholder="e.g. Barclays Bank" value={gbpBankName} onChange={(e) => setGbpBankName(e.target.value)} />
                      </div>
                      <div>
                        <label className={fieldLabel}>Sort Code</label>
                        <Input placeholder="XX-XX-XX" value={gbpSort} onChange={(e) => setGbpSort(e.target.value)} className="font-mono" />
                      </div>
                      <div>
                        <label className={fieldLabel}>IBAN *</label>
                        <Input placeholder="GB29 NWBK 6016 1331 9268 19" value={gbpIban} onChange={(e) => setGbpIban(e.target.value)} className="font-mono" />
                      </div>
                      <div>
                        <label className={fieldLabel}>SWIFT / BIC Code</label>
                        <Input placeholder="e.g. BARCGB22" value={gbpSwift} onChange={(e) => setGbpSwift(e.target.value)} className="font-mono" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className={fieldLabel}>Bank Address</label>
                        <Input placeholder="Street, City, Postcode" value={gbpBankAddress} onChange={(e) => setGbpBankAddress(e.target.value)} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Amount card */}
              <Card>
                <CardHeader>
                  <CardTitle>Enter Withdrawal Amount</CardTitle>
                  <CardDescription>The available balance reflects only approved credits and loan releases.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className={fieldLabel}>Amount to Withdraw ($)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-gray-500">$</span>
                      <Input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="pl-8" />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">Available Balance: {formatCurrency(profile?.balance ?? 0)}</p>
                  </div>

                  {numericAmount > 0 && (
                    <div className="space-y-2 rounded-lg bg-blue-50 p-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Withdrawal Amount:</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(numericAmount)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2 text-sm">
                        <span className="text-gray-600">Estimated Fee:</span>
                        <span className="font-semibold text-orange-600">{formatCurrency(NETWORK_FEE)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2 text-base">
                        <span className="font-semibold text-gray-900">Estimated Received:</span>
                        <span className="font-bold text-secondary">{formatCurrency(Math.max(numericAmount - NETWORK_FEE, 0))}</span>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={validateAndPromptPin}
                    className="w-full bg-primary text-white hover:bg-primary/90"
                    disabled={!amount || submitting}
                  >
                    {submitting ? 'Submitting...' : 'Submit Withdrawal Request'}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Balance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="mb-1 text-xs text-gray-600">Available Balance</p>
                    <p className="text-2xl font-bold text-primary">{formatCurrency(profile?.balance ?? 0)}</p>
                  </div>
                  <div className="border-t pt-4">
                    <p className="mb-1 text-xs text-gray-600">Pending Withdrawals</p>
                    <p className="text-lg font-semibold text-orange-600">{formatCurrency(pendingTotal)}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock3 size={18} /> Request Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-gray-600">
                  <p>Requests are reviewed by the BOLDWAVE operations desk.</p>
                  <p>Wire transfers may take 1–3 business days after approval.</p>
                  <p>Only approved balance can be withdrawn.</p>
                  <p>Large withdrawals may require extra compliance review.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CheckCircle2 size={18} /> Security Rules
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-gray-600">
                  <p>For crypto — only withdraw to a wallet you own and control.</p>
                  <p>Always verify network compatibility before confirming.</p>
                  <p>For wire — double-check all routing/IBAN numbers.</p>
                  <p>If a request cannot be completed, the BOLDWAVE note will appear here.</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* History */}
          <Card>
            <CardHeader>
              <CardTitle>Withdrawal History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Date</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Method</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Destination</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Amount</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Fee</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawals.map((w) => (
                      <tr key={w.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{formatDate(w.createdAt)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 capitalize">
                          {w.withdrawalMethod === 'crypto' ? 'Crypto' : w.withdrawalMethod === 'wire_usd' ? 'USD Wire' : 'GBP Wire'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 max-w-[160px] truncate" title={w.walletName}>{w.walletName}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatCurrency(w.amount)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(w.fee)}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${w.status === 'approved' ? 'bg-green-100 text-green-800' : w.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {w.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {withdrawals.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
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
      </div>
    </>
  )
}
