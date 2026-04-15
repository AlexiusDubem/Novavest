import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendar, faUser, faTag } from '@fortawesome/free-solid-svg-icons'

const blogPosts = [
  {
    id: 1,
    title: 'Getting Started with Crypto Investing: A Beginner\'s Guide',
    excerpt: 'Learn the fundamentals of cryptocurrency investing, from understanding blockchain to choosing your first investment.',
    author: 'Sarah Johnson',
    date: '2024-12-15',
    category: 'Education',
    readTime: '5 min read',
    featured: true
  },
  {
    id: 2,
    title: 'Understanding APY vs APR: What\'s the Difference?',
    excerpt: 'Clear explanation of annual percentage yield vs annual percentage rate and why it matters for your investments.',
    author: 'Michael Chen',
    date: '2024-12-12',
    category: 'Finance Basics',
    readTime: '3 min read',
    featured: false
  },
  {
    id: 3,
    title: 'Market Analysis: Q4 2024 Crypto Trends',
    excerpt: 'Latest market insights and predictions for the cryptocurrency market in the final quarter of 2024.',
    author: 'David Kim',
    date: '2024-12-10',
    category: 'Market Analysis',
    readTime: '7 min read',
    featured: false
  },
  {
    id: 4,
    title: 'Risk Management Strategies for Investors',
    excerpt: 'Essential risk management techniques to protect your portfolio and maximize long-term returns.',
    author: 'Emma Rodriguez',
    date: '2024-12-08',
    category: 'Strategy',
    readTime: '6 min read',
    featured: false
  },
  {
    id: 5,
    title: 'The Rise of DeFi: Decentralized Finance Explained',
    excerpt: 'Explore the world of decentralized finance and how it\'s revolutionizing traditional banking.',
    author: 'Michael Chen',
    date: '2024-12-05',
    category: 'DeFi',
    readTime: '8 min read',
    featured: false
  },
  {
    id: 6,
    title: 'Tax Implications of Crypto Investments',
    excerpt: 'Important tax considerations for cryptocurrency investors in different jurisdictions.',
    author: 'Sarah Johnson',
    date: '2024-12-03',
    category: 'Tax & Legal',
    readTime: '4 min read',
    featured: false
  }
]

export default function BlogPage() {
  const featuredPost = blogPosts.find(post => post.featured)
  const regularPosts = blogPosts.filter(post => !post.featured)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-foreground mb-4">BOLDWAVE Blog</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Insights, tips, and analysis to help you navigate the world of investing and cryptocurrency.
            </p>
          </div>

          {/* Featured Post */}
          {featuredPost && (
            <div className="mb-12">
              <Card className="bg-card border-border overflow-hidden">
                <div className="md:flex">
                  <div className="md:w-1/2 p-8">
                    <Badge className="mb-4 bg-primary text-primary-foreground">{featuredPost.category}</Badge>
                    <CardTitle className="text-2xl mb-4">{featuredPost.title}</CardTitle>
                    <CardDescription className="text-base mb-4">{featuredPost.excerpt}</CardDescription>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <FontAwesomeIcon icon={faUser} />
                        {featuredPost.author}
                      </div>
                      <div className="flex items-center gap-1">
                        <FontAwesomeIcon icon={faCalendar} />
                        {new Date(featuredPost.date).toLocaleDateString()}
                      </div>
                      <span>{featuredPost.readTime}</span>
                    </div>
                    <button className="text-primary hover:underline font-medium">
                      Read More →
                    </button>
                  </div>
                  <div className="md:w-1/2 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <div className="text-6xl opacity-50">📈</div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Regular Posts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularPosts.map((post) => (
              <Card key={post.id} className="bg-card border-border hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Badge className="mb-2 w-fit bg-secondary text-secondary-foreground">{post.category}</Badge>
                  <CardTitle className="text-lg leading-tight">{post.title}</CardTitle>
                  <CardDescription className="line-clamp-3">{post.excerpt}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <FontAwesomeIcon icon={faUser} />
                      {post.author}
                    </div>
                    <div className="flex items-center gap-1">
                      <FontAwesomeIcon icon={faCalendar} />
                      {new Date(post.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{post.readTime}</span>
                    <button className="text-primary hover:underline text-sm font-medium">
                      Read More
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Newsletter Signup */}
          <div className="text-center mt-16">
            <Card className="bg-card border-border max-w-2xl mx-auto">
              <CardContent className="p-8">
                <h2 className="text-2xl font-semibold mb-4">Stay Updated</h2>
                <p className="text-muted-foreground mb-6">
                  Subscribe to our newsletter for the latest insights and market updates.
                </p>
                <div className="flex gap-2 max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-2 border border-border rounded bg-background text-foreground"
                  />
                  <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded font-semibold">
                    Subscribe
                  </button>
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