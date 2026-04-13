import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChartLine, faShieldAlt, faCoins, faWallet, faUserCheck, faHeadset, faChartBar, faMobileAlt } from '@fortawesome/free-solid-svg-icons'

const features = [
  {
    icon: faChartLine,
    title: 'Smart Investment Plans',
    description: 'AI-powered portfolio allocation with flexible terms and competitive APYs. Choose from growth, balanced, or conservative strategies.',
    link: '/plans'
  },
  {
    icon: faShieldAlt,
    title: 'Secure Deposits & Withdrawals',
    description: 'Bank-grade security with multiple deposit methods including crypto, bank transfer, and card payments. Fast, secure withdrawals.',
    link: '/dashboard/deposit'
  },
  {
    icon: faCoins,
    title: 'Crypto-Backed Loans',
    description: 'Borrow against your crypto holdings without selling. Competitive rates, flexible terms, and liquidation protection.',
    link: '/dashboard/loan'
  },
  {
    icon: faWallet,
    title: 'Wallet Management',
    description: 'Connect external wallets or use our secure internal wallets. Multi-coin support with real-time balance tracking.',
    link: '/dashboard/wallet'
  },
  {
    icon: faUserCheck,
    title: 'Advanced KYC',
    description: 'Multi-level verification for enhanced security and higher limits. Quick approval process with document upload.',
    link: '/dashboard/kyc'
  },
  {
    icon: faHeadset,
    title: '24/7 Support',
    description: 'Round-the-clock customer support via live chat, email, and ticket system. Expert assistance for all your needs.',
    link: '/dashboard/support'
  },
  {
    icon: faChartBar,
    title: 'Real-time Analytics',
    description: 'Comprehensive portfolio analytics with live market data, performance tracking, and detailed transaction history.',
    link: '/dashboard'
  },
  {
    icon: faMobileAlt,
    title: 'Mobile App',
    description: 'Full-featured mobile app for iOS and Android. Manage your investments on the go with secure biometric authentication.',
    link: '#'
  }
]

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-foreground mb-4">Powerful Features for Smart Investing</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover the tools and capabilities that make NovaVest the premier choice for serious investors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="bg-card border-border hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FontAwesomeIcon icon={feature.icon} className="text-primary text-xl" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="mb-4">{feature.description}</CardDescription>
                  <Button asChild variant="outline" size="sm" className="border-primary text-primary hover:bg-primary/5">
                    <a href={feature.link}>Learn More</a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-16">
            <div className="bg-card border border-border rounded-lg p-8 max-w-2xl mx-auto">
              <h2 className="text-2xl font-semibold mb-4">Ready to Get Started?</h2>
              <p className="text-muted-foreground mb-6">
                Join thousands of investors who trust NovaVest for their financial growth.
              </p>
              <div className="flex gap-4 justify-center">
                <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <a href="/signup">Sign Up Free</a>
                </Button>
                <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary/5">
                  <a href="/login">Login</a>
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