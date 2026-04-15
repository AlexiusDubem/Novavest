'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertCircle, CheckCircle2, Clock3 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { fireAlert } from '@/lib/alerts'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { createWithdrawalRequest, subscribeToWallets, subscribeToWithdrawals } from '@/lib/firebase/firestore'
import type { WalletRecord, WithdrawalRequest } from '@/lib/firebase/types'

const NETWORK_FEE = 8

export default function WithdrawPage() {
  const { user, profile } = useAuth()
  const [amount, setAmount] = useState('')
  const [wallets, setWallets] = useState<WalletRecord[]>([])
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([])
  const [destination, setDestination] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!user) return

    const stopWallets = subscribeToWallets(user.uid, (items) => {
      setWallets(items)
      setDestination((current) => current || items[0]?.id || '')
    })
    const stopWithdrawals = subscribeToWithdrawals(user.uid, setWithdrawals)

    return () => {
      stopWallets()
      stopWithdrawals()
    }
  }, [user])

  const selectedDestination = wallets.find((item) => item.id === destination)
  const numericAmount = Number(amount)
  const pendingTotal = useMemo(
    () => withdrawals.filter((item) => item.status === 'pending').reduce((total, item) => total + item.amount, 0),
    [withdrawals],
  )

  async function handleCreateRequest() {
    if (!user || !selectedDestination) return

    if (!numericAmount || numericAmount <= 0) {
      await fireAlert({
        title: 'Enter a valid withdrawal amount',
        text: 'BOLDWAVE needs a valid withdrawal amount before we can create the request.',
        icon: 'error',
        confirmButtonText: 'Continue',
      })
      return
    }

    if (numericAmount > Number(profile?.balance ?? 0)) {
      await fireAlert({
        title: 'Insufficient wallet balance',
        text: 'This withdrawal request exceeds the available approved balance.',
        icon: 'error',
        confirmButtonText: 'Adjust amount',
      })
      return
    }

    try {
      setSubmitting(true)
      await createWithdrawalRequest(user.uid, selectedDestination, numericAmount, NETWORK_FEE)
      setAmount('')
    } catch (error) {
      await fireAlert({
        title: 'Unable to create withdrawal',
        text: error instanceof Error ? error.message : 'Please try again.',
        icon: 'error',
        confirmButtonText: 'Retry',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-primary">Withdraw Crypto</h1>
        <p className="text-gray-600">Create a real withdrawal request for BOLDWAVE confirmation and wallet release.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {wallets.length === 0 && (
            <Card className="border-2 border-primary/30 bg-blue-50">
              <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-lg font-semibold text-slate-900">Set up a withdrawal wallet first</p>
                  <p className="mt-1 text-sm text-slate-600">A destination wallet is required before submitting a withdrawal request.</p>
                </div>
                <Button asChild className="rounded-full bg-primary text-white hover:bg-primary/90">
                  <Link href="/dashboard/wallet">Set Up Wallet</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <AlertCircle className="mt-0.5 shrink-0 text-yellow-600" size={20} />
            <div className="text-sm">
              <p className="font-semibold text-yellow-900">Confirmation workflow</p>
              <p className="mt-1 text-yellow-800">Withdrawals stay pending until BOLDWAVE completes the release review.</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Select Withdrawal Wallet</CardTitle>
              <CardDescription>Choose the saved wallet you want the funds sent to.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {wallets.map((dest) => (
                  <label
                    key={dest.id}
                    className={`flex cursor-pointer items-start rounded-lg border-2 p-4 transition ${destination === dest.id ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <input
                      type="radio"
                      name="destination"
                      value={dest.id}
                      checked={destination === dest.id}
                      onChange={(event) => setDestination(event.target.value)}
                      className="mr-3 mt-1"
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900">{dest.name}</p>
                      <p className="text-sm text-gray-500">{dest.network} wallet</p>
                      <p className="mt-1 break-all text-xs text-gray-500">{dest.address}</p>
                    </div>
                  </label>
                ))}
                {wallets.length === 0 && <div className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500">No saved withdrawal wallets yet.</div>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Enter Withdrawal Amount</CardTitle>
              <CardDescription>The available balance reflects only approved credits and loan releases.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Amount to Withdraw ($)</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-500">$</span>
                  <Input type="number" placeholder="0.00" value={amount} onChange={(event) => setAmount(event.target.value)} className="pl-8" />
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
                    <span className="text-gray-600">Estimated Network Fee:</span>
                    <span className="font-semibold text-orange-600">{formatCurrency(NETWORK_FEE)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 text-sm">
                    <span className="text-gray-600">Destination:</span>
                    <span className="font-semibold text-gray-900">{selectedDestination?.name ?? 'No wallet selected'}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 text-base">
                    <span className="font-semibold text-gray-900">Estimated Received:</span>
                    <span className="font-bold text-secondary">{formatCurrency(Math.max(numericAmount - NETWORK_FEE, 0))}</span>
                  </div>
                </div>
              )}

              <Button onClick={handleCreateRequest} className="w-full bg-primary text-white hover:bg-primary/90" disabled={!amount || wallets.length === 0 || submitting}>
                {submitting ? 'Submitting...' : 'Submit Withdrawal Request'}
              </Button>
            </CardContent>
          </Card>
        </div>

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
                <Clock3 size={18} />
                Request Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-600">
              <p>Requests are reviewed by the BOLDWAVE operations desk.</p>
              <p>Only approved balance can be withdrawn.</p>
              <p>Large withdrawals may require extra compliance review.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle2 size={18} />
                Crypto Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-600">
              <p>Only withdraw to a supported blockchain wallet you control.</p>
              <p>Always verify network compatibility before confirming.</p>
              <p>If a request cannot be completed, the BOLDWAVE note will appear here.</p>
            </CardContent>
          </Card>
        </div>
      </div>

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
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Amount</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Destination</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Fee</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((withdrawal) => (
                  <tr key={withdrawal.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{formatDate(withdrawal.createdAt)}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatCurrency(withdrawal.amount)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{withdrawal.walletName}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(withdrawal.fee)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${withdrawal.status === 'approved' ? 'bg-green-100 text-green-800' : withdrawal.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {withdrawal.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {withdrawals.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
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
  )
}
