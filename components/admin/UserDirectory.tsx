'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/formatters'
import { type UserProfile } from '@/lib/firebase/types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRotate, faUserSlash } from '@fortawesome/free-solid-svg-icons'

interface UserDirectoryProps {
  users: UserProfile[]
  onToggleSuspension: (user: UserProfile) => void
}

export function UserDirectory({ users, onToggleSuspension }: UserDirectoryProps) {
  return (
    <Card className="rounded-[28px] border-slate-200 overflow-hidden">
      <CardHeader>
        <CardTitle className="text-xl font-bold">User Directory</CardTitle>
        <p className="text-sm text-slate-500">Manage all registered accounts and balance states.</p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-y border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Identity</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Meta</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Capital</th>
                <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-6 py-5">
                    <p className="font-bold text-slate-900">{entry.firstName} {entry.lastName}</p>
                    <p className="text-xs text-slate-500 truncate max-w-[180px]">{entry.email}</p>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-tighter">{entry.role}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{entry.portfolioId}</p>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest ${
                      entry.accountStatus === 'suspended' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {entry.accountStatus}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right font-black text-slate-900">
                    {formatCurrency(entry.balance)}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => onToggleSuspension(entry)}
                      className="h-8 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100"
                    >
                      <FontAwesomeIcon icon={entry.accountStatus === 'suspended' ? faRotate : faUserSlash} className="mr-2 h-3 w-3" />
                      {entry.accountStatus === 'suspended' ? 'Restore' : 'Suspend'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
