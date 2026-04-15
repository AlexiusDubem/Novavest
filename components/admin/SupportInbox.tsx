'use client'

import { useRef, useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Send, CheckCircle, MessageCircle } from 'lucide-react'
import { addTicketReply, resolveTicket } from '@/lib/firebase/firestore'
import { formatDateTime } from '@/lib/formatters'
import { fireAlert } from '@/lib/alerts'
import type { SupportTicketRecord } from '@/lib/firebase/types'

interface Props {
  tickets: SupportTicketRecord[]
}

export function SupportInbox({ tickets }: Props) {
  const [selected, setSelected] = useState<SupportTicketRecord | null>(null)
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Keep selected in sync with live tickets data
  useEffect(() => {
    if (selected) {
      const updated = tickets.find((t) => t.id === selected.id)
      if (updated) setSelected(updated)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickets])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selected?.replies?.length])

  async function handleReply() {
    if (!selected || !replyText.trim()) return
    setSending(true)
    try {
      await addTicketReply(selected.id, {
        authorRole: 'admin',
        authorName: 'BOLDWAVE Support',
        message: replyText.trim(),
      })
      setReplyText('')
    } catch (err) {
      await fireAlert({ title: 'Reply failed', text: err instanceof Error ? err.message : 'Please try again.', icon: 'error', confirmButtonText: 'OK' })
    } finally {
      setSending(false)
    }
  }

  async function handleResolve() {
    if (!selected) return
    await resolveTicket(selected.id)
    await fireAlert({ title: 'Ticket resolved', text: 'The ticket has been marked as Resolved.', icon: 'success', confirmButtonText: 'Done' })
  }

  if (selected) {
    const ticket = tickets.find((t) => t.id === selected.id) ?? selected
    return (
      <Card className="rounded-[28px] border-slate-200">
        <CardHeader className="border-b border-slate-100 px-6 py-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <button onClick={() => setSelected(null)} className="mb-3 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition">
                <ArrowLeft size={12} /> All Tickets
              </button>
              <p className="font-black text-slate-900 text-base">{ticket.subject}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                {ticket.category} · {formatDateTime(ticket.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${ticket.status === 'Open' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                {ticket.status}
              </span>
              <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${ticket.priority === 'Urgent' ? 'bg-red-100 text-red-700' : ticket.priority === 'High' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                {ticket.priority}
              </span>
              {ticket.status === 'Open' && (
                <Button size="sm" onClick={handleResolve} className="h-8 rounded-xl bg-emerald-600 text-[10px] font-black uppercase tracking-widest px-4 hover:bg-emerald-700">
                  <CheckCircle size={12} className="mr-1" /> Resolve
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex flex-col gap-4 p-6 max-h-[420px] overflow-y-auto">
            {/* Original message */}
            <div className="flex justify-start">
              <div className="max-w-[75%] rounded-[20px] rounded-tl-sm bg-slate-100 px-5 py-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                  User · {formatDateTime(ticket.createdAt)}
                </p>
                <p className="text-sm font-medium leading-relaxed text-slate-800">{ticket.message}</p>
              </div>
            </div>

            {(ticket.replies ?? []).map((reply) => (
              <div key={reply.id} className={`flex ${reply.authorRole === 'admin' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-[20px] px-5 py-4 ${reply.authorRole === 'admin' ? 'bg-emerald-600 text-white rounded-tr-sm' : 'bg-slate-100 text-slate-800 rounded-tl-sm'}`}>
                  <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${reply.authorRole === 'admin' ? 'text-emerald-200' : 'text-slate-400'}`}>
                    {reply.authorRole === 'admin' ? '🛡 BOLDWAVE Support' : 'User'} · {reply.createdAt ? formatDateTime(reply.createdAt) : 'Just now'}
                  </p>
                  <p className="text-sm font-medium leading-relaxed">{reply.message}</p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {ticket.status === 'Open' ? (
            <div className="border-t border-slate-100 p-4 flex gap-3 items-end">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply to the user..."
                rows={2}
                className="flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply() } }}
              />
              <Button onClick={handleReply} disabled={!replyText.trim() || sending} className="h-12 w-12 rounded-2xl p-0 bg-emerald-600 hover:bg-emerald-700 shrink-0">
                <Send size={16} />
              </Button>
            </div>
          ) : (
            <div className="border-t border-slate-100 p-4 flex items-center gap-2 text-emerald-600">
              <CheckCircle size={16} />
              <span className="text-[11px] font-black uppercase tracking-widest">Ticket Resolved</span>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  const open = tickets.filter((t) => t.status === 'Open')
  const resolved = tickets.filter((t) => t.status === 'Resolved')

  return (
    <div className="space-y-4">
      {open.length === 0 && resolved.length === 0 && (
        <Card className="rounded-[28px] border-slate-200">
          <CardContent className="py-16 text-center text-slate-400">
            <MessageCircle className="mx-auto mb-4 opacity-20" size={48} />
            <p className="text-[11px] font-black uppercase tracking-widest">No support tickets yet</p>
          </CardContent>
        </Card>
      )}
      {open.length > 0 && (
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Open · {open.length}</p>
          {open.map((ticket) => (
            <TicketRow key={ticket.id} ticket={ticket} onClick={() => setSelected(ticket)} />
          ))}
        </div>
      )}
      {resolved.length > 0 && (
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mt-6">Resolved · {resolved.length}</p>
          {resolved.map((ticket) => (
            <TicketRow key={ticket.id} ticket={ticket} onClick={() => setSelected(ticket)} />
          ))}
        </div>
      )}
    </div>
  )
}

function TicketRow({ ticket, onClick }: { ticket: SupportTicketRecord; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full text-left rounded-[22px] border border-slate-200 bg-white p-5 transition hover:shadow-md hover:border-emerald-500/30 active:scale-[0.99]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest ${ticket.status === 'Open' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{ticket.status}</span>
            <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest ${ticket.priority === 'Urgent' ? 'bg-red-100 text-red-700' : ticket.priority === 'High' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>{ticket.priority}</span>
            {(ticket.replies?.length ?? 0) > 0 && (
              <span className="rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700">{ticket.replies!.length} replies</span>
            )}
          </div>
          <p className="font-bold text-slate-900 truncate text-sm">{ticket.subject}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">{ticket.category} · {formatDateTime(ticket.createdAt)}</p>
        </div>
        <MessageCircle size={16} className="shrink-0 text-slate-300 mt-1" />
      </div>
    </button>
  )
}
