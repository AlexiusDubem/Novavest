import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Hero } from '@/components/ui/animated-hero'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { TestimonialsSection } from '@/components/landing/TestimonialsSection'
import { HowItWorksSection } from '@/components/landing/HowItWorksSection'
import { InvestmentPlansSection } from '@/components/landing/InvestmentPlansSection'
import { FAQSection } from '@/components/landing/FAQSection'
import { CTASection } from '@/components/landing/CTASection'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1">
        <Hero />
        <TestimonialsSection />
        <FeaturesSection />
        <HowItWorksSection />
        <InvestmentPlansSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
