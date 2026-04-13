import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { HeroSection } from '@/components/ui/hero-section-3'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { HowItWorksSection } from '@/components/landing/HowItWorksSection'
import { PricingSection } from '@/components/landing/PricingSection'
import { FAQSection } from '@/components/landing/FAQSection'
import { CTASection } from '@/components/landing/CTASection'

export default function Home() {
  return (
    <>
      <Header />
      <HeroSection />
      <main className="bg-background">
        <FeaturesSection />
        <HowItWorksSection />
        <PricingSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </>
  )
}
