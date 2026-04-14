'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWallet, faBell, faTriangleExclamation, faBullhorn } from '@fortawesome/free-solid-svg-icons'
import { type UserProfile } from '@/lib/firebase/types'

interface AdminToolsProps {
  users: UserProfile[]
  adjustUserId: string
  setAdjustUserId: (id: string) => void
  adjustAmount: string
  setAdjustAmount: (amount: string) => void
  adjustNote: string
  setAdjustNote: (note: string) => void
  onAdjustBalance: () => void
  adjusting: boolean
  notificationUserId: string
  setNotificationUserId: (id: string) => void
  notificationTitle: string
  setNotificationTitle: (title: string) => void
  notificationMessage: string
  setNotificationMessage: (message: string) => void
  sendToAllUsers: boolean
  setSendToAllUsers: (value: boolean) => void
  onSendNotification: () => void
  sendingNotification: boolean
}

export function AdminTools({
  users,
  adjustUserId, setAdjustUserId,
  adjustAmount, setAdjustAmount,
  adjustNote, setAdjustNote,
  onAdjustBalance, adjusting,
  notificationUserId, setNotificationUserId,
  notificationTitle, setNotificationTitle,
  notificationMessage, setNotificationMessage,
  sendToAllUsers, setSendToAllUsers,
  onSendNotification, sendingNotification
}: AdminToolsProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card className="rounded-[28px] border-slate-200 overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
          <CardTitle className="flex items-center gap-3 text-lg font-bold">
            <FontAwesomeIcon icon={faWallet} className="text-primary" />
            Ledger Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="grid gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target User</label>
              <select 
                value={adjustUserId} 
                onChange={(event) => setAdjustUserId(event.target.value)} 
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/20"
              >
                <option value="">Choose a user account...</option>
                {users.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.firstName} {entry.lastName} ({entry.email})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Adjustment Amount</label>
                 <Input 
                   type="number" 
                   placeholder="0.00" 
                   value={adjustAmount} 
                   onChange={(event) => setAdjustAmount(event.target.value)} 
                   className="h-14 rounded-2xl text-lg font-bold"
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Internal Memo</label>
                 <Input 
                   placeholder="Funding / Adjustment note" 
                   value={adjustNote} 
                   onChange={(event) => setAdjustNote(event.target.value)} 
                   className="h-14 rounded-2xl"
                 />
               </div>
            </div>
          </div>
          
          <div className="rounded-2xl bg-amber-50 p-4 border border-amber-100 flex gap-3">
             <FontAwesomeIcon icon={faTriangleExclamation} className="text-amber-500 mt-0.5" />
             <p className="text-xs text-amber-800 leading-relaxed font-medium">
               This affects live user balances and creates a system-audited transaction record. Verify details before execution.
             </p>
          </div>

          <Button 
            onClick={onAdjustBalance} 
            className="h-14 w-full rounded-2xl bg-slate-950 text-[11px] font-black uppercase tracking-[0.25em] text-white shadow-xl transition active:scale-95" 
            disabled={adjusting}
          >
            {adjusting ? 'Processing Ledger...' : 'Commit Balance Adjustment'}
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-[28px] border-slate-200 overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
          <CardTitle className="flex items-center gap-3 text-lg font-bold">
            <FontAwesomeIcon icon={faBullhorn} className="text-primary" />
            Global Broadcaster
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="flex items-center space-x-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <Checkbox
              id="sendToAll"
              checked={sendToAllUsers}
              onCheckedChange={(checked) => setSendToAllUsers(checked as boolean)}
              className="h-5 w-5 rounded-md"
            />
            <label htmlFor="sendToAll" className="text-xs font-bold uppercase tracking-widest text-slate-600 cursor-pointer">
              Broadcast to all registered users
            </label>
          </div>

          <div className="grid gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Recipient</label>
              <select
                value={notificationUserId}
                onChange={(event) => setNotificationUserId(event.target.value)}
                disabled={sendToAllUsers}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/20 disabled:opacity-50"
              >
                <option value="">Specific user profile...</option>
                {users.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.firstName} {entry.lastName}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Headline</label>
                <Input placeholder="System Alert / Dashboard Update" value={notificationTitle} onChange={(event) => setNotificationTitle(event.target.value)} className="h-14 rounded-2xl font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Message Content</label>
                <Input placeholder="Enter the institutional broadcast details..." value={notificationMessage} onChange={(event) => setNotificationMessage(event.target.value)} className="h-14 rounded-2xl" />
              </div>
            </div>
          </div>

          <Button 
            onClick={onSendNotification} 
            className="h-14 w-full rounded-2xl bg-slate-950 text-[11px] font-black uppercase tracking-[0.25em] text-white shadow-xl transition active:scale-95" 
            disabled={sendingNotification}
          >
            {sendingNotification ? 'Broadcasting...' : 'Execute Pulse Notification'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
