'use client'

import { Newspaper, ArrowRight } from 'lucide-react'
import { NEWS_DATA } from '@/lib/constants'

export function NewsSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-primary px-4 py-2 rounded-full text-sm font-semibold">
              <Newspaper size={16} />
              Latest Updates
            </div>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-primary mb-4">
            Market News &amp; Company Updates
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Stay informed about market trends, company developments, and investment opportunities from our global portfolio.
          </p>
        </div>

        {/* News Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {NEWS_DATA.map((news) => (
            <div
              key={news.id}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-secondary transition group"
            >
              {/* Date Badge */}
              <div className="inline-flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-secondary rounded-full" />
                <span className="text-sm font-semibold text-secondary">
                  {news.date}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-primary mb-3 group-hover:text-secondary transition">
                {news.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {news.description}
              </p>

              {/* Read More */}
              <a
                href="#"
                className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition"
              >
                Read More
                <ArrowRight size={16} />
              </a>
            </div>
          ))}
        </div>

        {/* Additional Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Market Performance Chart */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUpIcon />
              <h3 className="font-bold text-primary">Market Performance</h3>
            </div>
            <div className="h-40 bg-gradient-to-t from-primary/10 to-transparent rounded-lg flex items-end justify-between px-4 pb-4">
              <div className="w-6 h-16 bg-primary/40 rounded" />
              <div className="w-6 h-20 bg-primary/50 rounded" />
              <div className="w-6 h-24 bg-primary/60 rounded" />
              <div className="w-6 h-28 bg-primary/70 rounded" />
              <div className="w-6 h-32 bg-primary rounded" />
            </div>
            <div className="mt-4 flex justify-between text-xs text-gray-500">
              <span>Q1</span>
              <span>Q2</span>
              <span>Q3</span>
              <span>Q4</span>
              <span>YTD</span>
            </div>
          </div>

          {/* Sector Distribution */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <PieChartIcon />
              <h3 className="font-bold text-primary">Sector Distribution</h3>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">Technology</span>
                  <span className="font-semibold text-primary">35%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '35%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">Finance</span>
                  <span className="font-semibold text-primary">25%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-secondary" style={{ width: '25%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">Energy</span>
                  <span className="font-semibold text-primary">20%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-primary/50" style={{ width: '20%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">Healthcare</span>
                  <span className="font-semibold text-primary">15%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-secondary/50" style={{ width: '15%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">Other</span>
                  <span className="font-semibold text-primary">5%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gray-300" style={{ width: '5%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Regional Allocation */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <GlobeIcon />
              <h3 className="font-bold text-primary">Regional Allocation</h3>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">North America</span>
                  <span className="font-semibold text-primary">40%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '40%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">Europe</span>
                  <span className="font-semibold text-primary">30%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-secondary" style={{ width: '30%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">Asia Pacific</span>
                  <span className="font-semibold text-primary">20%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-primary/50" style={{ width: '20%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">Emerging Markets</span>
                  <span className="font-semibold text-primary">10%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gray-300" style={{ width: '10%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function TrendingUpIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="text-primary"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 17" />
      <polyline points="23 6 23 12 17 12" />
    </svg>
  )
}

function PieChartIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="text-primary"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2v10" />
      <path d="M12 12h10" />
    </svg>
  )
}

function GlobeIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="text-primary"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}
