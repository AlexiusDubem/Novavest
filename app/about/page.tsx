import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faShieldAlt, faUsers, faGlobe, faAward } from '@fortawesome/free-solid-svg-icons'

const team = [
  { name: 'Sarah Johnson', role: 'CEO & Founder', description: 'Former fintech executive with 15+ years in investment management.' },
  { name: 'Michael Chen', role: 'CTO', description: 'Blockchain expert and former lead engineer at major crypto exchanges.' },
  { name: 'Emma Rodriguez', role: 'Head of Compliance', description: 'Regulatory specialist ensuring platform security and compliance.' },
  { name: 'David Kim', role: 'Head of Investments', description: 'Portfolio manager with expertise in crypto and traditional assets.' }
]

const badges = [
  { icon: faShieldAlt, title: 'Bank-Grade Security', description: 'Cold storage and multi-signature wallets' },
  { icon: faGlobe, title: 'Global Compliance', description: 'Licensed in multiple jurisdictions' },
  { icon: faAward, title: 'Industry Recognition', description: 'Award-winning fintech platform' },
  { icon: faUsers, title: '2M+ Users', description: 'Trusted by investors worldwide' }
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-foreground mb-4">About BOLDWAVE</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              We're on a mission to democratize investing by providing secure, transparent, and accessible financial tools for everyone.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {badges.map((badge, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <FontAwesomeIcon icon={badge.icon} className="text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm">{badge.title}</h3>
                  <p className="text-xs text-muted-foreground">{badge.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Mission */}
          <div className="mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
                <p className="text-muted-foreground mb-4">
                  At BOLDWAVE, we believe that everyone deserves access to powerful investment tools previously reserved for institutions and wealthy individuals. Our platform combines cutting-edge technology with traditional financial wisdom to create a secure, user-friendly investment experience.
                </p>
                <p className="text-muted-foreground mb-4">
                  Founded in 2020, we've grown from a small team of fintech enthusiasts to a global platform serving investors across 50+ countries. Our commitment to transparency, security, and innovation drives everything we do.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Security First</Badge>
                  <Badge variant="secondary">Regulatory Compliant</Badge>
                  <Badge variant="secondary">User-Centric</Badge>
                  <Badge variant="secondary">Innovation Driven</Badge>
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-8">
                <h3 className="text-xl font-semibold mb-4">Key Statistics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Assets Under Management</span>
                    <span className="font-semibold">$2.5B+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Active Users</span>
                    <span className="font-semibold">2M+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Countries Served</span>
                    <span className="font-semibold">50+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Average APY</span>
                    <span className="font-semibold text-secondary">8-12%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Team */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">Our Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((member, index) => (
                <Card key={index} className="bg-card border-border">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FontAwesomeIcon icon={faUsers} className="text-primary text-2xl" />
                    </div>
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    <CardDescription className="font-semibold text-primary">{member.role}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground text-center">{member.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Card className="bg-card border-border max-w-2xl mx-auto">
              <CardContent className="p-8">
                <h2 className="text-2xl font-semibold mb-4">Join the BOLDWAVE Community</h2>
                <p className="text-muted-foreground mb-6">
                  Start your investment journey today and be part of the future of finance.
                </p>
                <div className="flex gap-4 justify-center">
                  <a href="/signup" className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded font-semibold">
                    Get Started
                  </a>
                  <a href="/contact" className="border border-primary text-primary hover:bg-primary/5 px-6 py-2 rounded">
                    Contact Us
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}