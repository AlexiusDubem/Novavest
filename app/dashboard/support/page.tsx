'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { HelpCircle, MessageCircle, FileText, Clock, Send } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { fireAlert } from '@/lib/alerts'
import { createSupportTicket, subscribeToSupportTickets } from '@/lib/firebase/firestore'
import { formatDateTime } from '@/lib/formatters'
import type { SupportTicketRecord } from '@/lib/firebase/types'

const faqs = [
  {
    id: 1,
    category: 'General',
    question: 'What is NovaVest?',
    answer: 'NovaVest is a live investment workspace where funding, verification, support, and portfolio activity sync in real time.',
  },
  {
    id: 2,
    category: 'Account',
    question: 'Why is my account restricted?',
    answer: 'If NovaVest restricts your account, only support remains available until the issue is resolved.',
  },
  {
    id: 3,
    category: 'Deposits',
    question: 'Why does my payment need confirmation?',
    answer: 'Funding and withdrawals are reviewed so your balance, notifications, and transaction history stay accurate in real time.',
  },
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

  useEffect(() => {
    if (!user) return
    return subscribeToSupportTickets(user.uid, setTickets)
  }, [user])

  async function handleSubmitTicket() {
    if (!user || !subject || !message) {
      await fireAlert({
        title: 'Complete the support form',
        text: 'Category, subject, and message are required.',
        icon: 'error',
        confirmButtonText: 'Continue',
      })
      return
    }

    try {
      setSubmitting(true)
      await createSupportTicket(user.uid, {
        category,
        subject,
        message,
        priority,
      })
      setSubject('')
      setMessage('')
      setPriority('Normal')
      await fireAlert({
        title: 'Support ticket created',
        text: 'Your ticket has been submitted and saved in real time.',
        icon: 'success',
        confirmButtonText: 'Done',
      })
    } catch (error) {
      await fireAlert({
        title: 'Unable to create support ticket',
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
        <h1 className="mb-2 text-3xl font-bold text-primary">Support Center</h1>
        <p className="text-gray-600">
          {profile?.accountStatus === 'suspended'
            ? `Your account is suspended. Support is still available. ${profile.suspensionReason || ''}`
            : 'Get help with your NovaVest account.'}
        </p>
      </div>

      <Tabs defaultValue="ticket" className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-3">
          <TabsTrigger value="ticket">Create Ticket</TabsTrigger>
          <TabsTrigger value="mytickets">My Tickets</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>

        <TabsContent value="ticket" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle size={20} />
                Create Support Ticket
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Category</label>
                <select value={category} onChange={(event) => setCategory(event.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary">
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
                <label className="mb-2 block text-sm font-medium text-gray-700">Subject</label>
                <Input placeholder="Brief description of your issue" value={subject} onChange={(event) => setSubject(event.target.value)} />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  placeholder="Please provide detailed information about your issue"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  rows={6}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Priority</label>
                <select value={priority} onChange={(event) => setPriority(event.target.value as 'Normal' | 'High' | 'Urgent')} className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary">
                  <option>Normal</option>
                  <option>High</option>
                  <option>Urgent</option>
                </select>
              </div>

              <Button onClick={handleSubmitTicket} className="w-full gap-2 bg-primary text-white hover:bg-primary/90" disabled={submitting}>
                <Send size={18} />
                {submitting ? 'Submitting...' : 'Submit Ticket'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Response Time</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Clock className="text-primary" size={20} />
                <div>
                  <p className="font-medium text-gray-900">Normal Priority</p>
                  <p className="text-sm text-gray-600">Average response: 2-4 hours</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="text-orange-500" size={20} />
                <div>
                  <p className="font-medium text-gray-900">High Priority</p>
                  <p className="text-sm text-gray-600">Average response: 30 minutes</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="text-red-500" size={20} />
                <div>
                  <p className="font-medium text-gray-900">Urgent</p>
                  <p className="text-sm text-gray-600">Average response: 15 minutes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mytickets" className="space-y-6">
          {tickets.length > 0 ? (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <Card key={ticket.id} className="transition hover:shadow-lg">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <span className={`rounded px-2 py-1 text-xs font-semibold ${ticket.status === 'Open' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                            {ticket.status}
                          </span>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${ticket.priority === 'Urgent' ? 'bg-red-100 text-red-700' : ticket.priority === 'High' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                            {ticket.priority}
                          </span>
                        </div>
                        <p className="font-bold text-gray-900">{ticket.subject}</p>
                        <p className="mt-1 text-sm text-gray-600">{ticket.category}</p>
                        <p className="mt-2 text-sm text-gray-700">{ticket.message}</p>
                        <p className="mt-3 text-xs text-gray-500">{formatDateTime(ticket.createdAt)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center text-gray-500">No support tickets yet</CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="faq" className="space-y-6">
          <div className="space-y-3">
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
                {expandedFAQ === faq.id && (
                  <CardContent className="border-t pt-4">
                    <p className="text-gray-700">{faq.answer}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle size={20} />
            Other Ways to Get Help
          </CardTitle>
        </CardHeader>
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
              <p className="mb-3 text-sm text-gray-600">support@novainvest.com</p>
              <Button variant="outline" size="sm">Send Email</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
