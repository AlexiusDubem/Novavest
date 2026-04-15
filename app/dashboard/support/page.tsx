'use client'

import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { HelpCircle, MessageCircle, FileText, Clock, Send, ArrowLeft, CheckCircle } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { fireAlert } from '@/lib/alerts'
import { createSupportTicket, subscribeToSupportTickets, addTicketReply } from '@/lib/firebase/firestore'
import { formatDateTime } from '@/lib/formatters'
import type { SupportTicketRecord } from '@/lib/firebase/types'

const faqs = [
  { id: 1, category: 'General', question: 'What is BOLDWAVE?', answer: 'BOLDWAVE is a live investment workspace where funding, verification, support, and portfolio activity sync in real time.' },
  { id: 2, category: 'Account', question: 'Why is my account restricted?', answer: 'If BOLDWAVE restricts your account, only support remains available until the issue is resolved.' },
  { id: 3, category: 'Deposits', question: 'Why does my payment need confirmation?', answer: 'Funding and withdrawals are reviewed so your balance, notifications, and transaction history stay accurate in real time.' },
]

export default function SupportPage() {
  const { user, profile } = useAuth()
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [category, setCategory] = useState('Account & Login')
  const [priority, setPriority] = useState<'Normal' | 'High' | 'Urgent'>('Normal')
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)
  const [tickets, setTickets] = useState<SupportTicketRecord[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketRecord | null>(null)
  const [replyText, setReplyText] = useState('')
  const [sendingReply, setSendingReply] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) return
    return subscribeToSupportTickets(user.uid, (data) => {
      setTickets(data)
      // Keep selectedTicket in sync with latest data
      if (selectedTicket) {
        const updated = data.find((t) => t.id === selectedTicket.id)
        if (updated) setSelectedTicket(updated)
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedTicket?.replies?.length])

  async function handleSubmitTicket() {
    if (!user || !subject || !message) {
      await fireAlert({ title: 'Complete the support form', text: 'Category, subject, and message are required.', icon: 'error', confirmButtonText: 'Continue' })
      return
    }
    try {
      setSubmitting(true)
      await createSupportTicket(user.uid, { category, subject, message, priority })
      setSubject('')
      setMessage('')
      setPriority('Normal')
      await fireAlert({ title: 'Support ticket created', text: 'Your ticket has been submitted. Our team will respond shortly.', icon: 'success', confirmButtonText: 'Done' })
    } catch (error) {
      await fireAlert({ title: 'Unable to create support ticket', text: error instanceof Error ? error.message : 'Please try again.', icon: 'error', confirmButtonText: 'Retry' })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSendReply() {
    if (!selectedTicket || !replyText.trim() || !profile) return
    setSendingReply(true)
    try {
      await addTicketReply(selectedTicket.id, {
        authorRole: 'user',
        authorName: `${profile.firstName} ${profile.lastName}`,
        message: replyText.trim(),
      })
      setReplyText('')
    } catch (error) {
      await fireAlert({ title: 'Could not send reply', text: error instanceof Error ? error.message : 'Please try again.', icon: 'error', confirmButtonText: 'OK' })
    } finally {
      setSendingReply(false)
    }
  }

  if (selectedTicket) {
    const ticket = tickets.find((t) => t.id === selectedTicket.id) ?? selectedTicket
    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        <button onClick={() => setSelectedTicket(null)} className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 transition">
          <ArrowLeft size={14} /> Back to Tickets
        </button>

        <Card className="rounded-[28px] border-slate-200">
          <CardHeader className="border-b border-slate-100 px-6 py-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="font-black text-slate-900 text-base">{ticket.subject}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{ticket.category} · {formatDateTime(ticket.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${ticket.status === 'Open' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{ticket.status}</span>
                <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${ticket.priority === 'Urgent' ? 'bg-red-100 text-red-700' : ticket.priority === 'High' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>{ticket.priority}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Chat thread */}
            <div className="flex flex-col gap-4 p-6 max-h-[480px] overflow-y-auto">
              {/* Original message */}
              <div className="flex justify-end">
                <div className="max-w-[75%] rounded-[20px] rounded-tr-sm bg-slate-900 text-white px-5 py-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">You · {formatDateTime(ticket.createdAt)}</p>
                  <p className="text-sm font-medium leading-relaxed">{ticket.message}</p>
                </div>
              </div>

              {/* Replies */}
              {(ticket.replies ?? []).map((reply) => (
                <div key={reply.id} className={`flex ${reply.authorRole === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-[20px] px-5 py-4 ${reply.authorRole === 'user' ? 'bg-slate-900 text-white rounded-tr-sm' : 'bg-emerald-50 border border-emerald-200 text-slate-900 rounded-tl-sm'}`}>
                    <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${reply.authorRole === 'user' ? 'text-slate-400' : 'text-emerald-600'}`}>
                      {reply.authorRole === 'admin' ? '🛡 BOLDWAVE Support' : 'You'} · {reply.createdAt ? formatDateTime(reply.createdAt) : 'Just now'}
                    </p>
                    <p className="text-sm font-medium leading-relaxed">{reply.message}</p>
                  </div>
                </div>
              ))}

              {(ticket.replies ?? []).length === 0 && (
                <div className="text-center py-6">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Awaiting response from BOLDWAVE support team</p>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Reply input */}
            {ticket.status === 'Open' && (
              <div className="border-t border-slate-100 p-4 flex gap-3 items-end">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply..."
                  rows={2}
                  className="flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendReply() } }}
                />
                <Button onClick={handleSendReply} disabled={!replyText.trim() || sendingReply} className="h-12 w-12 rounded-2xl p-0 bg-slate-900 hover:bg-slate-700 shrink-0">
                  <Send size={16} />
                </Button>
              </div>
            )}
            {ticket.status === 'Resolved' && (
              <div className="border-t border-slate-100 p-4 flex items-center gap-2 text-emerald-600">
                <CheckCircle size={16} /> <span className="text-[11px] font-black uppercase tracking-widest">This ticket has been resolved</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-primary">Support Center</h1>
        <p className="text-gray-600">
          {profile?.accountStatus === 'suspended'
            ? `Your account is suspended. Support is still available. ${profile.suspensionReason || ''}`
            : 'Get help with your BOLDWAVE account.'}
        </p>
      </div>

      <Tabs defaultValue="ticket" className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-3">
          <TabsTrigger value="ticket">Create Ticket</TabsTrigger>
          <TabsTrigger value="mytickets">My Tickets {tickets.length > 0 && `(${tickets.length})`}</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>

        <TabsContent value="ticket" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><MessageCircle size={20} /> Create Support Ticket</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary">
                  <option>Account &amp; Login</option>
                  <option>Deposits &amp; Withdrawals</option>
                  <option>Investments</option>
                  <option>KYC Verification</option>
                  <option>Loans</option>
                  <option>Technical Issue</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Subject</label>
                <Input placeholder="Brief description of your issue" value={subject} onChange={(e) => setSubject(e.target.value)} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Description</label>
                <textarea placeholder="Please provide detailed information about your issue" value={message} onChange={(e) => setMessage(e.target.value)} rows={5} className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Priority</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value as 'Normal' | 'High' | 'Urgent')} className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary">
                  <option>Normal</option>
                  <option>High</option>
                  <option>Urgent</option>
                </select>
              </div>
              <Button onClick={handleSubmitTicket} className="w-full gap-2 bg-primary text-white hover:bg-primary/90" disabled={submitting}>
                <Send size={18} /> {submitting ? 'Submitting...' : 'Submit Ticket'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Response Time</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3"><Clock className="text-primary" size={20} /><div><p className="font-medium text-gray-900">Normal Priority</p><p className="text-sm text-gray-600">Average response: 2-4 hours</p></div></div>
              <div className="flex items-center gap-3"><Clock className="text-orange-500" size={20} /><div><p className="font-medium text-gray-900">High Priority</p><p className="text-sm text-gray-600">Average response: 30 minutes</p></div></div>
              <div className="flex items-center gap-3"><Clock className="text-red-500" size={20} /><div><p className="font-medium text-gray-900">Urgent</p><p className="text-sm text-gray-600">Average response: 15 minutes</p></div></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mytickets" className="space-y-4">
          {tickets.length > 0 ? (
            tickets.map((ticket) => (
              <button key={ticket.id} onClick={() => setSelectedTicket(ticket)} className="w-full text-left rounded-[24px] border border-slate-200 bg-white p-5 transition hover:shadow-md hover:border-primary/30 active:scale-[0.99]">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest ${ticket.status === 'Open' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{ticket.status}</span>
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest ${ticket.priority === 'Urgent' ? 'bg-red-100 text-red-700' : ticket.priority === 'High' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>{ticket.priority}</span>
                      {(ticket.replies?.length ?? 0) > 0 && <span className="rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700">{ticket.replies!.length} {ticket.replies!.length === 1 ? 'reply' : 'replies'}</span>}
                    </div>
                    <p className="font-bold text-gray-900 truncate">{ticket.subject}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{ticket.category} · {formatDateTime(ticket.createdAt)}</p>
                  </div>
                  <MessageCircle size={18} className="shrink-0 text-slate-300 mt-1" />
                </div>
              </button>
            ))
          ) : (
            <Card><CardContent className="pt-6 text-center text-gray-500">No support tickets yet</CardContent></Card>
          )}
        </TabsContent>

        <TabsContent value="faq" className="space-y-3">
          {faqs.map((faq) => (
            <Card key={faq.id}>
              <CardHeader onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)} className="cursor-pointer hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="mb-1 text-xs font-semibold text-secondary">{faq.category}</p>
                    <CardTitle className="text-base">{faq.question}</CardTitle>
                  </div>
                  <span className={`transition ${expandedFAQ === faq.id ? 'rotate-180' : ''}`}>▼</span>
                </div>
              </CardHeader>
              {expandedFAQ === faq.id && <CardContent className="border-t pt-4"><p className="text-gray-700">{faq.answer}</p></CardContent>}
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><HelpCircle size={20} /> Other Ways to Get Help</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-gray-200 p-4 text-center transition hover:border-primary">
              <MessageCircle className="mx-auto mb-2 text-primary" size={24} />
              <p className="mb-1 font-semibold text-gray-900">Live Chat</p>
              <p className="mb-3 text-sm text-gray-600">Chat with our team</p>
              <Button variant="outline" size="sm">Open Chat</Button>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 text-center transition hover:border-primary">
              <FileText className="mx-auto mb-2 text-primary" size={24} />
              <p className="mb-1 font-semibold text-gray-900">Documentation</p>
              <p className="mb-3 text-sm text-gray-600">Read our guides</p>
              <Button variant="outline" size="sm">Learn More</Button>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 text-center transition hover:border-primary">
              <FileText className="mx-auto mb-2 text-primary" size={24} />
              <p className="mb-1 font-semibold text-gray-900">Email Support</p>
              <p className="mb-3 text-sm text-gray-600">support@boldwave.com</p>
              <Button variant="outline" size="sm">Send Email</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
