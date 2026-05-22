'use client'

import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { fireAlert } from '@/lib/alerts'
import {
  createSupportTicket,
  subscribeToSupportTickets,
  addTicketReply,
  appealSupportTicket,
  deleteSupportTicket,
} from '@/lib/firebase/firestore'
import { formatDateTime } from '@/lib/formatters'
import type { SupportTicketRecord } from '@/lib/firebase/types'
import {
  MessageCircle,
  X,
  Send,
  ArrowLeft,
  CheckCircle,
  Phone,
  Mail,
  ChevronDown,
  Plus,
  Trash2,
  Undo2,
} from 'lucide-react'

type View = 'home' | 'new-ticket' | 'chat'

export function FloatingSupportChat() {
  const { user, profile } = useAuth()
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<View>('home')
  const [tickets, setTickets] = useState<SupportTicketRecord[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [sendingReply, setSendingReply] = useState(false)

  // New ticket form
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [category, setCategory] = useState('Account & Login')
  const [priority, setPriority] = useState<'Normal' | 'High' | 'Urgent'>('Normal')
  const [submitting, setSubmitting] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) return
    return subscribeToSupportTickets(user.uid, setTickets)
  }, [user])

  const selectedTicket = selectedId ? tickets.find((t) => t.id === selectedId) ?? null : null

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedTicket?.replies?.length])

  // Reset view when closing
  const handleClose = () => {
    setOpen(false)
    setTimeout(() => {
      setView('home')
      setSelectedId(null)
    }, 300)
  }

  async function handleSubmitTicket() {
    if (!user || !subject || !message) {
      await fireAlert({ title: 'Complete the form', text: 'Subject and message are required.', icon: 'error', confirmButtonText: 'OK' })
      return
    }
    try {
      setSubmitting(true)
      await createSupportTicket(user.uid, { category, subject, message, priority })
      setSubject('')
      setMessage('')
      setPriority('Normal')
      setView('home')
      await fireAlert({ title: 'Ticket submitted!', text: 'Our team will respond shortly.', icon: 'success', confirmButtonText: 'Done' })
    } catch (error) {
      await fireAlert({ title: 'Error', text: error instanceof Error ? error.message : 'Please try again.', icon: 'error', confirmButtonText: 'Retry' })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSendReply() {
    if (!selectedId || !replyText.trim() || !profile) return
    setSendingReply(true)
    try {
      await addTicketReply(selectedId, {
        authorRole: 'user',
        authorName: `${profile.firstName} ${profile.lastName}`,
        message: replyText.trim(),
      })
      setReplyText('')
    } catch (error) {
      await fireAlert({ title: 'Could not send', text: error instanceof Error ? error.message : 'Please try again.', icon: 'error', confirmButtonText: 'OK' })
    } finally {
      setSendingReply(false)
    }
  }

  async function handleAppealTicket() {
    if (!selectedId || !profile) return
    setSendingReply(true)
    try {
      await appealSupportTicket(selectedId)
      await addTicketReply(selectedId, {
        authorRole: 'user',
        authorName: `${profile.firstName} ${profile.lastName}`,
        message: '⚠️ I would like to appeal and reopen this ticket for further review.',
      })
      await fireAlert({ title: 'Ticket Reopened', text: 'You have successfully appealed this ticket. Our support team has been notified.', icon: 'success', confirmButtonText: 'OK' })
    } catch (error) {
      await fireAlert({ title: 'Could not reopen', text: error instanceof Error ? error.message : 'Please try again.', icon: 'error', confirmButtonText: 'OK' })
    } finally {
      setSendingReply(false)
    }
  }

  async function handleDeleteTicket() {
    if (!selectedId) return
    const result = await fireAlert({
      title: 'Delete Ticket?',
      text: 'Are you sure you want to permanently delete this support ticket? This action is irreversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'No, cancel',
    })

    if (result.isConfirmed) {
      try {
        await deleteSupportTicket(selectedId)
        setSelectedId(null)
        setView('home')
        await fireAlert({ title: 'Ticket Deleted', text: 'The ticket has been permanently removed.', icon: 'success', confirmButtonText: 'OK' })
      } catch (error) {
        await fireAlert({ title: 'Could not delete', text: error instanceof Error ? error.message : 'Please try again.', icon: 'error', confirmButtonText: 'OK' })
      }
    }
  }

  const unreadCount = tickets.filter((t) => {
    const lastReply = t.replies?.[t.replies.length - 1]
    return lastReply?.authorRole === 'admin'
  }).length

  return (
    <>
      {/* ─── Floating Ball ─── */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Pulse ring */}
        {!open && (
          <>
            <span className="absolute inset-0 rounded-full bg-teal-400 opacity-30 animate-ping" />
            <span className="absolute inset-0 rounded-full bg-teal-500 opacity-20 animate-ping [animation-delay:0.3s]" />
          </>
        )}

        <button
          onClick={() => setOpen((v) => !v)}
          className={`
            relative flex h-16 w-16 items-center justify-center rounded-full shadow-2xl transition-all duration-500
            ${open
              ? 'bg-slate-900 hover:bg-slate-800 rotate-0 scale-95'
              : 'bg-gradient-to-br from-teal-400 to-cyan-500 hover:scale-110 animate-float shadow-[0_0_30px_rgba(20,184,166,0.5)]'
            }
          `}
          aria-label="Open support chat"
        >
          {open ? (
            <X className="h-6 w-6 text-white" />
          ) : (
            <MessageCircle className="h-7 w-7 text-white drop-shadow" />
          )}
          {!open && unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white ring-2 ring-white shadow-lg">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* ─── Chat Panel ─── */}
      <div
        className={`
          fixed bottom-24 right-4 z-50 w-[calc(100vw-32px)] max-w-[420px] overflow-hidden rounded-[28px]
          border border-slate-200 bg-white shadow-2xl shadow-black/20 ring-1 ring-black/5
          transition-all duration-300 origin-bottom-right
          ${open ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-4 pointer-events-none'}
        `}
        style={{ maxHeight: 'min(600px, calc(100vh - 120px))' }}
      >
        {/* ── Header ── */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 px-5 py-5">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-teal-400/10 blur-2xl" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              {view !== 'home' && (
                <button
                  onClick={() => setView('home')}
                  className="mr-1 rounded-xl bg-white/10 p-1.5 text-white hover:bg-white/20 transition"
                >
                  <ArrowLeft size={14} />
                </button>
              )}
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-400/20 ring-1 ring-teal-400/30">
                <MessageCircle className="h-5 w-5 text-teal-300" />
              </div>
              <div>
                <p className="text-sm font-black text-white">BOLDWAVE Support</p>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                  <p className="text-[10px] font-bold text-slate-300">Live · Typically replies in minutes</p>
                </div>
              </div>
            </div>
            <button onClick={handleClose} className="rounded-xl bg-white/10 p-1.5 text-white hover:bg-white/20 transition">
              <ChevronDown size={16} />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-col overflow-hidden" style={{ maxHeight: 'calc(min(600px, 100vh - 120px) - 82px)' }}>

          {/* HOME VIEW */}
          {view === 'home' && (
            <div className="flex-1 overflow-y-auto">
              {/* Quick contact info */}
              <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4">
                <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Contact Us Directly</p>
                <div className="flex flex-col gap-2">
                  <a href="https://wa.me/14452265410" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-sm font-bold text-slate-700 hover:text-teal-600 transition-colors">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 ring-1 ring-teal-100">
                      <Phone className="h-3.5 w-3.5 text-teal-500" />
                    </div>
                    +1 (445) 226-5410 (WhatsApp only)
                  </a>
                  <a href="mailto:support@boldwave.com" className="flex items-center gap-2.5 text-sm font-bold text-slate-700 hover:text-teal-600 transition-colors">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 ring-1 ring-blue-100">
                      <Mail className="h-3.5 w-3.5 text-blue-500" />
                    </div>
                    support@boldwave.com
                  </a>
                </div>
              </div>

              {/* New ticket button */}
              <div className="px-5 pt-4 pb-2">
                <button
                  onClick={() => setView('new-ticket')}
                  className="flex w-full items-center gap-3 rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3.5 text-left transition hover:bg-teal-100 active:scale-[0.98]"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500 shadow-sm">
                    <Plus className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-teal-800">Send a Message</p>
                    <p className="text-[11px] text-teal-600">Create a new support ticket</p>
                  </div>
                </button>
              </div>

              {/* Ticket list */}
              {tickets.length > 0 && (
                <div className="px-5 pb-4">
                  <p className="mb-2 mt-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Your Tickets</p>
                  <div className="flex flex-col gap-2">
                    {tickets.slice(0, 5).map((ticket) => {
                      const hasNewReply = ticket.replies?.[ticket.replies.length - 1]?.authorRole === 'admin'
                      return (
                        <button
                          key={ticket.id}
                          onClick={() => { setSelectedId(ticket.id); setView('chat') }}
                          className="w-full rounded-2xl border border-slate-200 bg-white p-3.5 text-left transition hover:border-teal-200 hover:shadow-sm active:scale-[0.99]"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${ticket.status === 'Open' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                                <p className="truncate text-xs font-black text-slate-900">{ticket.subject}</p>
                              </div>
                              <p className="text-[10px] text-slate-400 font-medium">{ticket.category}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                              {hasNewReply && (
                                <span className="rounded-full bg-teal-500 px-2 py-0.5 text-[9px] font-black text-white">New</span>
                              )}
                              <span className={`rounded-full px-2 py-0.5 text-[9px] font-black ${ticket.status === 'Open' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                {ticket.status}
                              </span>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {tickets.length === 0 && (
                <div className="px-5 py-6 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                    <MessageCircle className="h-5 w-5 text-slate-400" />
                  </div>
                  <p className="text-xs font-bold text-slate-400">No tickets yet</p>
                  <p className="text-[11px] text-slate-300 mt-0.5">Send us a message above</p>
                </div>
              )}
            </div>
          )}

          {/* NEW TICKET VIEW */}
          {view === 'new-ticket' && (
            <div className="flex flex-1 flex-col overflow-y-auto">
              <div className="flex-1 space-y-3 px-5 py-4 overflow-y-auto">
                <div>
                  <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-500">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
                  >
                    <option>Account & Login</option>
                    <option>Deposits & Withdrawals</option>
                    <option>Investments</option>
                    <option>KYC Verification</option>
                    <option>Loans</option>
                    <option>Technical Issue</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-500">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as 'Normal' | 'High' | 'Urgent')}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
                  >
                    <option>Normal</option>
                    <option>High</option>
                    <option>Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-500">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief description of your issue"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition placeholder:text-slate-300"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-500">Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your issue in detail..."
                    rows={4}
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition placeholder:text-slate-300"
                  />
                </div>
              </div>
              <div className="border-t border-slate-100 px-5 py-4 bg-white">
                <button
                  onClick={handleSubmitTicket}
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3.5 text-sm font-black text-white shadow-sm transition hover:bg-teal-600 disabled:opacity-50 active:scale-95"
                >
                  <Send size={15} />
                  {submitting ? 'Sending...' : 'Submit Ticket'}
                </button>
              </div>
            </div>
          )}

          {/* CHAT VIEW */}
          {view === 'chat' && selectedTicket && (
            <div className="flex flex-1 flex-col overflow-hidden">
              {/* Ticket meta */}
              <div className="border-b border-slate-100 bg-slate-50/60 px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-black text-slate-900">{selectedTicket.subject}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{selectedTicket.category}</p>
                  </div>
                  <span className={`flex-shrink-0 rounded-full px-2.5 py-1 text-[9px] font-black uppercase ${selectedTicket.status === 'Open' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {selectedTicket.status}
                  </span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4 bg-slate-50/30">
                {/* Original message */}
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-[18px] rounded-tr-sm bg-slate-900 px-4 py-3 shadow-sm">
                    <p className="mb-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400">
                      You · {formatDateTime(selectedTicket.createdAt)}
                    </p>
                    <p className="text-sm leading-relaxed text-white">{selectedTicket.message}</p>
                  </div>
                </div>

                {/* Awaiting */}
                {(selectedTicket.replies ?? []).length === 0 && (
                  <div className="py-4 text-center">
                    <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                      <MessageCircle className="h-4 w-4 text-slate-400" />
                    </div>
                    <p className="text-[10px] font-bold text-slate-400">Awaiting response from the BOLDWAVE team…</p>
                  </div>
                )}

                {/* Replies */}
                {(selectedTicket.replies ?? []).map((reply) => (
                  <div key={reply.id} className={`flex ${reply.authorRole === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {reply.authorRole === 'admin' && (
                      <div className="mr-2 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-600 text-[10px] font-black mt-auto">
                        BW
                      </div>
                    )}
                    <div className={`max-w-[82%] rounded-[18px] px-4 py-3 shadow-sm ${reply.authorRole === 'user'
                      ? 'bg-slate-900 text-white rounded-tr-sm'
                      : 'bg-white border border-emerald-100 text-slate-900 rounded-tl-sm'
                    }`}>
                      <p className={`mb-1.5 text-[9px] font-black uppercase tracking-widest ${reply.authorRole === 'user' ? 'text-slate-400' : 'text-teal-600'}`}>
                        {reply.authorRole === 'admin' ? '🛡 BOLDWAVE Support' : 'You'} · {reply.createdAt ? formatDateTime(reply.createdAt) : 'Just now'}
                      </p>
                      <p className="text-sm leading-relaxed">{reply.message}</p>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Reply bar */}
              {selectedTicket.status === 'Open' ? (
                <div className="border-t border-slate-100 bg-white p-3 flex gap-2 items-end">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type a message..."
                    rows={2}
                    className="flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition placeholder:text-slate-300"
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendReply() } }}
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={!replyText.trim() || sendingReply}
                    className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm transition hover:bg-teal-600 disabled:opacity-40 active:scale-95"
                  >
                    <Send size={15} />
                  </button>
                </div>
              ) : (
                <div className="border-t border-slate-100 bg-slate-50/90 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <CheckCircle size={15} className="animate-bounce" />
                    <span className="text-[11px] font-black uppercase tracking-wider">Ticket Resolved & Closed</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    This support ticket is resolved. If your issue is not fully settled, you can appeal/reopen it, or permanently delete the ticket record.
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={handleAppealTicket}
                      disabled={sendingReply}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50 py-2.5 text-xs font-bold text-teal-800 transition hover:bg-teal-100 active:scale-95 disabled:opacity-50"
                    >
                      <Undo2 size={13} />
                      Appeal Issue
                    </button>
                    <button
                      onClick={handleDeleteTicket}
                      disabled={sendingReply}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 py-2.5 text-xs font-bold text-rose-800 transition hover:bg-rose-100 active:scale-95 disabled:opacity-50"
                    >
                      <Trash2 size={13} />
                      Delete Ticket
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

    </>
  )
}
