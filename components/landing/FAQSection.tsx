'use client'

import { useState } from 'react'
import { ChevronDown, HelpCircle } from 'lucide-react'

const faqs = [
  {
    question: 'Is NOVAINVEST safe and regulated?',
    answer: 'Yes, NOVAINVEST is fully regulated by major financial authorities including the SEC, FCA, and FINRA. We maintain the highest security standards with AES-256 encryption and regular third-party audits.',
  },
  {
    question: 'What is the minimum investment amount?',
    answer: 'You can start investing with as little as $100. We believe everyone should have access to global investment opportunities, regardless of their initial capital.',
  },
  {
    question: 'How long does it take to withdraw my funds?',
    answer: 'Most withdrawals are processed within 24 hours. Bank transfers typically appear in your account within 2-3 business days depending on your bank.',
  },
  {
    question: 'Can I invest in crypto on NOVAINVEST?',
    answer: 'Absolutely! We support trading of Bitcoin, Ethereum, and 100+ other cryptocurrencies. You can also earn staking rewards on selected coins.',
  },
  {
    question: 'What are the fees and investment requirements?',
    answer: 'You can invest any amount you choose. We offer flexible investment packages designed for different goals — from capital preservation to growth strategies. There are no hidden trading fees or commissions.',
  },
  {
    question: 'Is there a mobile app?',
    answer: 'Yes! NOVAINVEST is available on iOS and Android. You can manage your entire portfolio, trade, and monitor real-time prices on the go.',
  },
  {
    question: 'How do I start?',
    answer: 'Getting started is easy: 1) Sign up with your email 2) Complete KYC verification 3) Deposit funds 4) Start investing! The entire process takes about 10 minutes.',
  },
  {
    question: 'What if I need help?',
    answer: 'Our support team is available 24/7 via email, chat, and phone. We also have extensive documentation and video tutorials in our help center.',
  },
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faqs" className="relative py-28 px-4 sm:px-6 lg:px-8 landing-section-alt overflow-hidden">
      <div className="absolute bottom-0 right-1/3 w-[500px] h-[400px] bg-cyan-500/3 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-5 py-2 text-sm font-semibold text-teal-300 mb-6 backdrop-blur-sm">
            <HelpCircle size={14} />
            FAQ
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Frequently Asked{' '}
            <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          <p className="text-lg text-slate-400">
            Find answers to common questions about NOVAINVEST
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index
            return (
              <div
                key={index}
                className={`landing-glass-card rounded-xl overflow-hidden transition-all duration-300 animate-fade-in-up stagger-${Math.min(index + 1, 6)} ${
                  isOpen ? '!border-teal-500/30 !shadow-[0_0_25px_rgba(20,184,166,0.06)]' : ''
                }`}
                style={{ transform: 'none' }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
                >
                  <span className="text-base font-semibold text-white pr-4">{faq.question}</span>
                  <ChevronDown
                    size={20}
                    className={`flex-shrink-0 text-teal-400 transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-6 pb-5 border-t border-white/5">
                    <p className="text-slate-400 leading-relaxed pt-4 text-sm">{faq.answer}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
