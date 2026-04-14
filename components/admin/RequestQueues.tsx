'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDateTime } from '@/lib/formatters'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faXmark, faCircleNodes, faClock } from '@fortawesome/free-solid-svg-icons'

interface RequestQueuesProps {
  title: string
  items: any[]
  type: 'deposit' | 'withdrawal' | 'loan' | 'kyc' | 'investment'
  onReview: (type: any, id: string, status: 'approved' | 'rejected') => void
}

export function RequestQueues({ title, items, type, onReview }: RequestQueuesProps) {
  if (items.length === 0) {
    return (
      <Card className="rounded-[28px] border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg font-bold">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-4">
              <FontAwesomeIcon icon={faCircleNodes} />
            </div>
            <p className="text-sm font-medium text-slate-400 italic">No pending {type} requests at this time.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-[28px] border-slate-200">
      <CardHeader>
        <CardTitle className="text-lg font-bold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="group relative rounded-[28px] border border-slate-200 bg-white p-6 transition-all hover:bg-slate-50/50 hover:shadow-md">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <p className="font-black text-slate-900 tracking-tight">
                    {type === 'deposit' ? `${item.assetSymbol} Confirmation` : 
                     type === 'investment' ? item.planName : 
                     type === 'withdrawal' ? item.walletName :
                     type === 'loan' ? `${formatCurrency(item.amount)} Capital Request` :
                     `${item.fullName} ID Check`}
                  </p>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest ${
                    item.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 
                    item.status === 'rejected' ? 'bg-rose-100 text-rose-700' : 
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-600">
                  {type === 'deposit' ? `${formatCurrency(item.expectedAmount)} • ${item.network}` :
                   type === 'investment' ? `${formatCurrency(item.amount)} • ${item.roiPercent}% ROI` :
                   type === 'withdrawal' ? `${formatCurrency(item.amount)} • To ${item.address.slice(0, 10)}...` :
                   type === 'loan' ? `${item.termMonths} Months • ${item.purpose}` :
                   `${item.documentType} • ${item.documentNumber}`}
                </p>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <FontAwesomeIcon icon={faClock} className="h-2.5 w-2.5" />
                  <span>{formatDateTime(item.createdAt)} • ID: {item.userId?.slice(0, 8)}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Button 
                  size="sm" 
                  onClick={() => onReview(type, item.id, 'approved')} 
                  className="h-11 flex-1 lg:flex-none rounded-2xl bg-emerald-600 hover:bg-emerald-700 px-6 text-[10px] font-black uppercase tracking-[0.2em] transition active:scale-95 shadow-lg shadow-emerald-600/10"
                  disabled={item.status !== 'pending'}
                >
                  <FontAwesomeIcon icon={faCheck} className="mr-2 h-3.5 w-3.5" />
                  Finalize
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => onReview(type, item.id, 'rejected')}
                  className="h-11 flex-1 lg:flex-none rounded-2xl border-slate-200 px-6 text-[10px] font-black uppercase tracking-[0.2em] transition active:scale-95"
                  disabled={item.status !== 'pending'}
                >
                  <FontAwesomeIcon icon={faXmark} className="mr-2 h-3.5 w-3.5" />
                  Decline
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
