'use client'

import { MessageCircle, Phone, Mail, Clock, ArrowRight } from 'lucide-react'

export default function SupportPage() {
  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-teal-600">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-500" />
          </span>
          Support Live
        </div>
        <h1 className="text-3xl font-black tracking-tighter text-slate-950 sm:text-5xl">Support Center</h1>
        <p className="max-w-xl text-sm font-bold text-slate-500 leading-relaxed">
          Get help from the BOLDWAVE team. Use the floating chat button at the bottom-right of your screen to start a conversation instantly.
        </p>
      </div>

      {/* Main CTA */}
      <div className="relative overflow-hidden rounded-[40px] border border-teal-100 bg-gradient-to-br from-teal-50 to-cyan-50/30 p-8 sm:p-12 shadow-sm">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-teal-400/10 blur-[80px]" />
        <div className="relative z-10 flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-teal-500 shadow-lg shadow-teal-500/30">
              <MessageCircle className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tighter text-slate-900">Live Chat Support</h2>
              <p className="mt-1 text-sm font-bold text-slate-500 leading-relaxed max-w-sm">
                Click the floating chat bubble at the bottom-right corner of your screen to open a real-time conversation with our support team.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:items-end">
            <div className="flex items-center gap-2 rounded-2xl border border-teal-200 bg-white px-5 py-3 shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-700">Team Online Now</span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">↘ Look for the chat bubble</p>
          </div>
        </div>
      </div>

      {/* Contact Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <a
          href="tel:+12345678900"
          className="group flex items-center gap-5 rounded-[32px] border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl hover:shadow-teal-500/5"
        >
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-[20px] bg-teal-50 ring-1 ring-teal-100 transition group-hover:bg-teal-500 group-hover:ring-teal-500">
            <Phone className="h-6 w-6 text-teal-600 transition group-hover:text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phone Support</p>
            <p className="mt-1 text-lg font-black tracking-tight text-slate-900">+1 (234) 567-8900</p>
            <p className="text-xs font-bold text-slate-500 mt-0.5">Mon – Fri, 9am – 6pm EST</p>
          </div>
          <ArrowRight className="ml-auto h-5 w-5 flex-shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-teal-500" />
        </a>

        <a
          href="mailto:support@boldwave.com"
          className="group flex items-center gap-5 rounded-[32px] border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5"
        >
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-[20px] bg-blue-50 ring-1 ring-blue-100 transition group-hover:bg-blue-500 group-hover:ring-blue-500">
            <Mail className="h-6 w-6 text-blue-600 transition group-hover:text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Support</p>
            <p className="mt-1 text-lg font-black tracking-tight text-slate-900">support@boldwave.com</p>
            <p className="text-xs font-bold text-slate-500 mt-0.5">Response within 2–4 hours</p>
          </div>
          <ArrowRight className="ml-auto h-5 w-5 flex-shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-500" />
        </a>
      </div>

      {/* Response times */}
      <section className="rounded-[32px] border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <h2 className="mb-6 text-lg font-black tracking-tighter text-slate-900 uppercase">Response Times</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: 'Normal Priority', time: '2–4 hours', color: 'bg-slate-100 text-slate-500', dot: 'bg-slate-400' },
            { label: 'High Priority', time: '~30 minutes', color: 'bg-amber-50 text-amber-600', dot: 'bg-amber-400' },
            { label: 'Urgent', time: '~15 minutes', color: 'bg-rose-50 text-rose-600', dot: 'bg-rose-500' },
          ].map((item) => (
            <div key={item.label} className={`flex items-center gap-4 rounded-2xl p-5 ${item.color}`}>
              <Clock className="h-5 w-5 flex-shrink-0" />
              <div>
                <p className="text-sm font-black tracking-tight">{item.label}</p>
                <p className="text-xs font-bold opacity-70 mt-0.5">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
