'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope, faPhone, faMapMarkerAlt, faClock } from '@fortawesome/free-solid-svg-icons'

const faqs = [
  {
    question: 'How do I get started with NovaVest?',
    answer: 'Sign up for a free account, complete KYC verification, deposit funds, and choose your investment plan. Our onboarding process takes just 10-15 minutes.'
  },
  {
    question: 'What are the minimum investment amounts?',
    answer: 'Our plans start from $100 for flexible options. Fixed-term and high-yield plans require minimums of $1,000-$10,000 depending on the plan.'
  },
  {
    question: 'How secure is my money?',
    answer: 'We use bank-grade security with cold storage for 95% of assets, multi-signature wallets, and regular security audits. Your funds are protected by industry-leading security measures.'
  },
  {
    question: 'What are the withdrawal fees?',
    answer: 'Withdrawals are free for most plans. Early withdrawal from fixed-term plans may incur a small fee (2-5%) as outlined in the plan terms.'
  },
  {
    question: 'Do you offer customer support?',
    answer: 'Yes, we provide 24/7 customer support via live chat, email, and phone. Our expert team is ready to assist with any questions.'
  },
  {
    question: 'What cryptocurrencies do you support?',
    answer: 'We support major cryptocurrencies including Bitcoin (BTC), Ethereum (ETH), and stablecoins like USDT and USDC.'
  }
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log('Form submitted:', formData)
    // Reset form
    setFormData({ name: '', email: '', subject: '', message: '' })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-foreground mb-4">Contact Us</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Have questions? Our team is here to help. Get in touch with us through any of the channels below.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Contact Form */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you within 24 hours.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-2">Name</label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium mb-2">Subject</label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2">Message</label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={5}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <div className="space-y-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faEnvelope} className="text-primary" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-muted-foreground">support@novavest.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faPhone} className="text-primary" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-muted-foreground">+1 (555) 123-4567</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-primary" />
                    <div>
                      <p className="font-medium">Address</p>
                      <p className="text-muted-foreground">123 Finance Street, New York, NY 10001</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FontAwesomeIcon icon={faClock} className="text-primary" />
                    <div>
                      <p className="font-medium">Support Hours</p>
                      <p className="text-muted-foreground">24/7 Live Support</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Live Chat</CardTitle>
                  <CardDescription>
                    Get instant help from our support team
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                    Start Live Chat
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
            <Card className="bg-card border-border max-w-4xl mx-auto">
              <CardContent className="p-6">
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent>
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}