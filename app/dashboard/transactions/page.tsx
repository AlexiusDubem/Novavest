'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { formatCurrency, formatDateTime } from '@/lib/formatters'
import { subscribeToTransactions } from '@/lib/firebase/firestore'
import type { TransactionRecord } from '@/lib/firebase/types'

export default function TransactionsPage() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<TransactionRecord[]>([])

  useEffect(() => {
    if (!user) return
    return subscribeToTransactions(user.uid, setTransactions)
  }, [user])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Transactions</h1>
        <p className="mt-2 text-gray-600">Approved deposits, withdrawals, and loans appear here in real time.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Title</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Type</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{formatDateTime(transaction.createdAt)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <p className="font-semibold">{transaction.title}</p>
                      <p className="text-xs text-muted-foreground">{transaction.description}</p>
                    </td>
                    <td className="px-4 py-3 text-sm capitalize text-gray-900">{transaction.type}</td>
                    <td className="px-4 py-3 text-sm capitalize text-gray-900">{transaction.status}</td>
                    <td className={`px-4 py-3 text-right text-sm font-semibold ${transaction.type === 'withdrawal' ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {transaction.type === 'withdrawal' ? '-' : '+'}
                      {formatCurrency(transaction.amount)}
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                      No transactions yet.
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
