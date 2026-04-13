import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function TermsOfService() {
  return (
    <main>
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <div className="prose prose-lg">
          <p className="text-sm text-muted-foreground mb-8">Last updated: April 5, 2026</p>

          <h2>1. Acceptance of Terms</h2>
          <p>By accessing and using NOVA INVEST, you accept and agree to be bound by the terms and provision of this agreement.</p>

          <h2>2. Use License</h2>
          <p>Permission is granted to temporarily access the materials on NOVA INVEST's website for personal, non-commercial transitory viewing only.</p>

          <h2>3. Investment Risks</h2>
          <p>Cryptocurrency investments carry significant risks including volatility, regulatory changes, and potential loss of principal. We do not guarantee returns.</p>

          <h2>4. User Responsibilities</h2>
          <p>Users are responsible for maintaining the confidentiality of their account information and for all activities that occur under their account.</p>

          <h2>5. Prohibited Uses</h2>
          <p>You may not use our services for any illegal or unauthorized purpose nor may you violate any laws in your jurisdiction.</p>

          <h2>6. Limitation of Liability</h2>
          <p>In no event shall NOVA INVEST or its suppliers be liable for any damages arising out of the use or inability to use our services.</p>

          <h2>7. Termination</h2>
          <p>We may terminate or suspend your account immediately, without prior notice, for any reason whatsoever.</p>

          <h2>8. Governing Law</h2>
          <p>These terms shall be interpreted and governed by the laws of the jurisdiction in which NOVA INVEST operates.</p>

          <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-sm">
              <strong>Risk Warning:</strong> Trading cryptocurrencies involves substantial risk of loss and is not suitable for every investor. The value of cryptocurrencies can go up or down, and you may lose money investing in them. You should carefully consider whether trading or holding cryptocurrencies is suitable for you in light of your financial condition.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}