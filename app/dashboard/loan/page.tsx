'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertTriangle, DollarSign, Clock } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { fireAlert } from '@/lib/alerts'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { createLoanRequest, subscribeToLoanRequests } from '@/lib/firebase/firestore'
import type { LoanRequest } from '@/lib/firebase/types'

const loanTerms = [
  { id: 6, label: '6 months', rate: 8.5 },
  { id: 12, label: '12 months', rate: 6.8 },
  { id: 24, label: '24 months', rate: 5.5 },
]

export default function LoanPage() {
  const { user, profile } = useAuth()
  const [selectedTerm, setSelectedTerm] = useState<number>(12)
  const [loanAmount, setLoanAmount] = useState('')
  const [purpose, setPurpose] = useState('')
  const [requests, setRequests] = useState<LoanRequest[]>([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!user) return
    return subscribeToLoanRequests(user.uid, setRequests)
  }, [user])

  const numericAmount = Number(loanAmount)
  const selectedOffer = loanTerms.find((term) => term.id === selectedTerm) ?? loanTerms[1]
  const borrowingPower = useMemo(() => Number(profile?.balance ?? 0) * 0.6, [profile?.balance])

  async function handleRequestLoan() {
    if (!user) return
    if (!numericAmount || numericAmount <= 0 || !purpose) {
      await fireAlert({
        title: 'Complete the request',
        text: 'Enter an amount and purpose before sending a loan request.',
        icon: 'error',
        confirmButtonText: 'Continue',
      })
      return
    }

    if (numericAmount > borrowingPower) {
      await fireAlert({
        title: 'Amount exceeds borrowing power',
        text: 'Reduce the request or increase approved balance before trying again.',
        icon: 'error',
        confirmButtonText: 'Adjust amount',
      })
      return
    }

    try {
      setSubmitting(true)
      await createLoanRequest(user.uid, numericAmount, selectedTerm, purpose)
      setLoanAmount('')
      setPurpose('')
    } catch (error) {
      await fireAlert({
        title: 'Unable to request loan',
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
        <h1 className="mb-2 text-3xl font-bold text-primary">Request a Loan</h1>
        <p className="text-gray-600">Use your approved balance history as the basis for NovaVest lending review.</p>
      </div>

      <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
        <AlertTriangle className="text-red-600" size={20} />
        <div className="text-sm">
          <p className="font-semibold text-red-900">Risk Warning</p>
          <p className="mt-1 text-red-800">Loan requests are reviewed manually. Approval is not guaranteed and terms should be reviewed carefully.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Select Loan Term</CardTitle>
              <CardDescription>Choose the repayment period that suits your needs.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {loanTerms.map((offer) => (
                <button
                  key={offer.id}
                  onClick={() => setSelectedTerm(offer.id)}
                  className={`w-full rounded-lg border-2 p-4 text-left transition ${selectedTerm === offer.id ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-gray-900">{offer.label}</p>
                      <p className="text-sm text-gray-600">{offer.rate}% annual rate</p>
                    </div>
                    <div className={`h-4 w-4 rounded-full border-2 ${selectedTerm === offer.id ? 'border-primary bg-primary' : 'border-gray-300'}`} />
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Loan Amount</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Amount to Borrow ($)</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-500">$</span>
                  <Input type="number" placeholder="0.00" value={loanAmount} onChange={(event) => setLoanAmount(event.target.value)} className="pl-8" />
                </div>
                <p className="mt-2 text-xs text-gray-500">Estimated borrowing power: {formatCurrency(borrowingPower)}</p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Purpose</label>
                <Input value={purpose} onChange={(event) => setPurpose(event.target.value)} placeholder="Describe what the loan will be used for" />
              </div>

              {numericAmount > 0 && (
                <div className="space-y-3 rounded-lg bg-blue-50 p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Principal:</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(numericAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Interest Rate:</span>
                    <span className="font-semibold text-primary">{selectedOffer.rate}%</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 text-sm">
                    <span className="text-gray-600">Monthly Payment:</span>
                    <span className="font-bold text-orange-600">{formatCurrency((numericAmount * (1 + selectedOffer.rate / 100)) / selectedTerm)}</span>
                  </div>
                </div>
              )}

              <Button onClick={handleRequestLoan} className="w-full bg-primary text-white hover:bg-primary/90" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Request Loan'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign size={18} />
                Borrowing Power
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="mb-1 text-xs text-gray-600">Approved Balance</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(profile?.balance ?? 0)}</p>
              </div>
              <div className="border-t pt-4">
                <p className="mb-1 text-xs text-gray-600">60% Borrowing Power</p>
                <p className="text-lg font-semibold text-secondary">{formatCurrency(borrowingPower)}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock size={18} />
                Recent Requests
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {requests.map((request) => (
                <div key={request.id} className="rounded-lg border border-gray-200 p-3">
                  <p className="font-semibold text-gray-900">{formatCurrency(request.amount)}</p>
                  <p className="text-sm text-gray-600">{request.termMonths} months</p>
                  <p className="text-xs capitalize text-gray-500">{request.status} on {formatDate(request.createdAt)}</p>
                </div>
              ))}
              {requests.length === 0 && <p className="text-sm text-muted-foreground">No loan requests yet.</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
