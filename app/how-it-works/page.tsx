import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserPlus, faCreditCard, faCog, faChartLine, faWallet } from '@fortawesome/free-solid-svg-icons'

const steps = [
  {
    number: 1,
    icon: faUserPlus,
    title: 'Sign Up & KYC',
    description: 'Create your account and complete identity verification. Choose your investment goals and risk tolerance.',
    details: ['Email registration', 'Personal information', 'Document upload', 'Verification approval']
  },
  {
    number: 2,
    icon: faCreditCard,
    title: 'Deposit Funds',
    description: 'Add funds to your account using bank transfer, card, or crypto. Multiple secure deposit options available.',
    details: ['Bank transfer', 'Credit/Debit card', 'Crypto deposit', 'Instant confirmation']
  },
  {
    number: 3,
    icon: faCog,
    title: 'Choose Plan or Request Loan',
    description: 'Select from flexible investment plans or apply for crypto-backed loans. Customize your strategy.',
    details: ['Browse plans', 'Compare options', 'Loan application', 'Risk assessment']
  },
  {
    number: 4,
    icon: faChartLine,
    title: 'Track & Grow',
    description: 'Monitor your portfolio performance in real-time. Watch your investments grow with live analytics.',
    details: ['Portfolio dashboard', 'Performance charts', 'Market updates', 'Automated compounding']
  },
  {
    number: 5,
    icon: faWallet,
    title: 'Withdraw Securely',
    description: 'Access your funds anytime with secure withdrawal options. No hidden fees or delays.',
    details: ['Instant withdrawals', 'Bank transfer', 'Crypto withdrawal', 'Security verification']
  }
]

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-foreground mb-4">How GIRDUP Works</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Get started with GIRDUP in just 5 simple steps. From signup to growth, we've made investing straightforward and secure.
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-border"></div>

            <div className="space-y-12">
              {steps.map((step, index) => (
                <div key={step.number} className={`flex flex-col md:flex-row items-center gap-8 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                    <Card className="bg-card border-border">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <FontAwesomeIcon icon={step.icon} className="text-primary text-xl" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold">{step.title}</h3>
                            <p className="text-muted-foreground">{step.description}</p>
                          </div>
                        </div>
                        <ul className="space-y-2">
                          {step.details.map((detail, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm">
                              <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="flex-shrink-0 w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl border-4 border-background">
                    {step.number}
                  </div>
                  <div className="flex-1"></div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-16">
            <div className="bg-card border border-border rounded-lg p-8 max-w-2xl mx-auto">
              <h2 className="text-2xl font-semibold mb-4">Ready to Start Your Journey?</h2>
              <p className="text-muted-foreground mb-6">
                Join thousands of investors who have already illuminated their financial future with GIRDUP.
              </p>
              <div className="flex gap-4 justify-center">
                <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <a href="/signup">Get Started Free</a>
                </Button>
                <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary/5">
                  <a href="/features">Explore Features</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
