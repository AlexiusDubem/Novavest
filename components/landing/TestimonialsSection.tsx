'use client'

import { User, Briefcase, Rocket, Laptop, Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Investment Manager',
    company: 'Tech Innovations',
    icon: User,
    rating: 5,
    quote: 'NOVAINVEST made it incredibly easy to diversify my portfolio globally. The platform is intuitive and the fees are transparent.',
  },
  {
    name: 'Marcus Johnson',
    role: 'Financial Analyst',
    company: 'Global Capital',
    icon: Briefcase,
    rating: 5,
    quote: 'I&apos;ve been using NOVAINVEST for 18 months now. My portfolio has returned 24% annually, which is exceptional.',
  },
  {
    name: 'Elena Rodriguez',
    role: 'Entrepreneur',
    company: 'Digital Solutions',
    icon: Rocket,
    rating: 5,
    quote: 'The real-time analytics and crypto integration are game-changers. Highly recommend to anyone serious about investing.',
  },
  {
    name: 'David Kim',
    role: 'Portfolio Manager',
    company: 'Wealth Partners',
    icon: Laptop,
    rating: 5,
    quote: 'Best investment platform I&apos;ve used. Customer support is responsive and the security features are top-notch.',
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-primary mb-4">Trusted by Investors Worldwide</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of satisfied investors who are building wealth with NOVAINVEST.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-secondary hover:shadow-lg transition-all duration-300"
            >
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-700 mb-4 text-sm">{testimonial.quote}</p>

              {/* Author */}
              <div className="flex items-center gap-3 border-t border-gray-200 pt-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  {testimonial.icon ? <testimonial.icon size={24} /> : <User size={24} />}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{testimonial.name}</p>
                  <p className="text-xs text-gray-600">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
