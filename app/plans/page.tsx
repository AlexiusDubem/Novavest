import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLock, faClock, faPercent, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'

const plans = {
  flexible: [
    {
      name: 'Starter Flex',
      minDeposit: '$100',
      duration: 'No lock',
      apy: '4-6%',
      risk: 'Low',
      description: 'Perfect for beginners. Withdraw anytime with no penalties.'
    },
    {
      name: 'Growth Flex',
      minDeposit: '$500',
      duration: 'No lock',
      apy: '6-8%',
      risk: 'Medium',
      description: 'Balanced approach with higher returns. Flexible withdrawals.'
    }
  ],
  fixed: [
    {
      name: '3-Month Fixed',
      minDeposit: '$1,000',
      duration: '90 days',
      apy: '8%',
      risk: 'Medium',
      earlyExitFee: '2%',
      description: 'Short-term fixed plan with guaranteed returns.'
    },
    {
      name: '6-Month Fixed',
      minDeposit: '$2,000',
      duration: '180 days',
      apy: '10%',
      risk: 'Medium',
      earlyExitFee: '3%',
      description: 'Mid-term plan for steady growth.'
    },
    {
      name: '1-Year Fixed',
      minDeposit: '$5,000',
      duration: '365 days',
      apy: '12%',
      risk: 'High',
      earlyExitFee: '5%',
      description: 'Long-term high-yield investment.'
    }
  ],
  highYield: [
    {
      name: 'Crypto Accelerator',
      minDeposit: '$10,000',
      duration: '180 days',
      apy: '15-20%',
      risk: 'High',
      description: 'High-risk, high-reward crypto-focused plan.'
    }
  ]
}

export default function PlansPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-foreground mb-4">Investment Plans</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose from our range of flexible investment plans designed to meet your financial goals.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-500" />
              <span>All investments carry risk. Past performance does not guarantee future results.</span>
            </div>
          </div>

          <Tabs defaultValue="flexible" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="flexible">Flexible Plans</TabsTrigger>
              <TabsTrigger value="fixed">Fixed-Term Plans</TabsTrigger>
              <TabsTrigger value="highYield">High-Yield Plans</TabsTrigger>
            </TabsList>

            <TabsContent value="flexible">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {plans.flexible.map((plan, index) => (
                  <Card key={index} className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {plan.name}
                        <Badge variant={plan.risk === 'Low' ? 'secondary' : 'default'}>{plan.risk} Risk</Badge>
                      </CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 mb-6">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Min Deposit:</span>
                          <span className="font-semibold">{plan.minDeposit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Duration:</span>
                          <span className="font-semibold">{plan.duration}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Expected APY:</span>
                          <span className="font-semibold text-secondary">{plan.apy}</span>
                        </div>
                      </div>
                      <Button asChild size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                        <Link href="/signup">Subscribe Now</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="fixed">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.fixed.map((plan, index) => (
                  <Card key={index} className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {plan.name}
                        <Badge variant={plan.risk === 'Medium' ? 'default' : 'destructive'}>{plan.risk} Risk</Badge>
                      </CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 mb-6">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Min Deposit:</span>
                          <span className="font-semibold">{plan.minDeposit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Duration:</span>
                          <span className="font-semibold">{plan.duration}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">APY:</span>
                          <span className="font-semibold text-secondary">{plan.apy}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Early Exit Fee:</span>
                          <span className="font-semibold">{plan.earlyExitFee}</span>
                        </div>
                      </div>
                      <Button asChild size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                        <Link href="/signup">Subscribe Now</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="highYield">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {plans.highYield.map((plan, index) => (
                  <Card key={index} className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {plan.name}
                        <Badge variant="destructive">{plan.risk} Risk</Badge>
                      </CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 mb-6">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Min Deposit:</span>
                          <span className="font-semibold">{plan.minDeposit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Duration:</span>
                          <span className="font-semibold">{plan.duration}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Expected APY:</span>
                          <span className="font-semibold text-secondary">{plan.apy}</span>
                        </div>
                      </div>
                      <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded">
                        <p className="text-sm text-yellow-600 dark:text-yellow-400">
                          <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
                          High-risk investment. Only invest what you can afford to lose.
                        </p>
                      </div>
                      <Button asChild size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                        <Link href="/signup">Subscribe Now</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  )
}