'use client'

import { Users, TrendingUp, DollarSign, Globe } from 'lucide-react'

const stats = [
  {
    icon: Users,
    value: '1.2M+',
    label: 'Active Investors',
  },
  {
    icon: DollarSign,
    value: '$50B+',
    label: 'Assets Under Management',
  },
  {
    icon: Globe,
    value: '150+',
    label: 'Countries Supported',
  },
  {
    icon: TrendingUp,
    value: '18.5%',
    label: 'Average Annual Return',
  },
]

export function StatsSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary to-blue-900 text-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="text-center">
                <Icon className="w-10 h-10 mx-auto mb-3 text-secondary" />
                <p className="text-4xl font-bold mb-2">{stat.value}</p>
                <p className="text-blue-100">{stat.label}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
