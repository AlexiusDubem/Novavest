// Brand Colors
export const COLORS = {
  primary: '#1E3A8A',
  primaryLight: '#3B5998',
  secondary: '#14B8A6',
  accent: '#20C997',
  white: '#FFFFFF',
  grayLight: '#F9FAFB',
  gray: '#E5E7EB',
  grayDark: '#374151',
  textDark: '#1F2937',
  textLight: '#6B7280',
}

// Navigation Menu Items
export const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Leadership', href: '/about' },
  { label: 'News', href: '/blog' },
  { label: 'Tactics', href: '/features' },
  { label: 'Companies', href: '/plans' },
  { label: 'Benefits', href: '/how-it-works' },
  { label: 'FAQs', href: '/#faqs' },
]

// Dashboard Menu Items
export const DASHBOARD_NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: 'faChartLine' },
  { label: 'My Wallet', href: '/dashboard/wallet', icon: 'faWallet' },
  { label: 'Transactions', href: '/dashboard/transactions', icon: 'faHistory' },
  { label: 'Staking', href: '/dashboard/investment-plans', icon: 'faCoins' },
  { label: 'Settings', href: '/dashboard/settings', icon: 'faCog' },
  { label: 'Support', href: '/dashboard/support', icon: 'faHeadset' },
  { label: 'Profile', href: '/dashboard/profile', icon: 'faUser' },
  { label: 'KYC', href: '/dashboard/kyc', icon: 'faUserCheck' },
  { label: 'Deposit', href: '/dashboard/deposit', icon: 'faPlus' },
  { label: 'Withdraw', href: '/dashboard/withdraw', icon: 'faMinus' },
  { label: 'Loans', href: '/dashboard/loan', icon: 'faRocket' },
]

// Mock News Data
export const NEWS_DATA = [
  {
    id: 1,
    date: 'December 25, 2024',
    title: 'TechFlow Corp Reports Record Q4 Earnings',
    description: 'Leading technology company announces unprecedented growth in revenue and user base, signaling strong market positioning.',
    category: 'Company News',
  },
  {
    id: 2,
    date: 'December 24, 2024',
    title: 'Global Markets Show Resilience Amid Economic Shifts',
    description: 'International markets demonstrate stability as investors focus on long-term opportunities in emerging sectors.',
    category: 'Market Analysis',
  },
  {
    id: 3,
    date: 'December 23, 2024',
    title: 'Green Energy Sector Reaches New Milestone',
    description: 'Renewable energy investments surge as governments commit to net-zero targets and sustainable development goals.',
    category: 'Industry Trends',
  },
]

// Mock Investment Plans Data
export const INVESTMENT_PLANS = [
  {
    id: 1,
    name: 'Growth Portfolio',
    apy: '12.5%',
    term: '12 months',
    minInvestment: '$1,000',
    maxInvestment: '$50,000',
    description: 'Balanced portfolio focused on medium to high growth with moderate risk.',
    status: 'active',
  },
  {
    id: 2,
    name: 'Conservative Plus',
    apy: '6.8%',
    term: '6 months',
    minInvestment: '$500',
    maxInvestment: '$25,000',
    description: 'Low-risk portfolio suitable for conservative investors seeking steady returns.',
    status: 'active',
  },
  {
    id: 3,
    name: 'Aggressive Growth',
    apy: '18.2%',
    term: '24 months',
    minInvestment: '$5,000',
    maxInvestment: '$100,000',
    description: 'High-growth strategy for experienced investors with higher risk tolerance.',
    status: 'active',
  },
]

// Mock Company Data
export const COMPANIES = [
  { id: 1, name: 'TechFlow Corp', sector: 'Technology', price: 245.50, change: 2.4 },
  { id: 2, name: 'GreenEnergy Inc', sector: 'Renewable Energy', price: 128.75, change: 4.2 },
  { id: 3, name: 'Global Finance Ltd', sector: 'Finance', price: 342.00, change: 1.8 },
  { id: 4, name: 'HealthPlus Pharma', sector: 'Healthcare', price: 198.30, change: 3.1 },
  { id: 5, name: 'TransportFuture', sector: 'Transportation', price: 89.45, change: 5.6 },
  { id: 6, name: 'RetailPro Systems', sector: 'Retail', price: 156.20, change: 2.9 },
]

// Mock Portfolio Data
export const PORTFOLIO_DATA = [
  { month: 'Jan', value: 45000 },
  { month: 'Feb', value: 48000 },
  { month: 'Mar', value: 52000 },
  { month: 'Apr', value: 50000 },
  { month: 'May', value: 58000 },
  { month: 'Jun', value: 62000 },
]

// Mock Performance Data
export const PERFORMANCE_DATA = [
  { name: '2024 Q1', value: 4200 },
  { name: '2024 Q2', value: 5100 },
  { name: '2024 Q3', value: 6200 },
  { name: '2024 Q4', value: 7800 },
]

// Sector Distribution
export const SECTOR_DISTRIBUTION = [
  { name: 'Technology', value: 35 },
  { name: 'Finance', value: 25 },
  { name: 'Energy', value: 20 },
  { name: 'Healthcare', value: 15 },
  { name: 'Other', value: 5 },
]

// Regional Allocation
export const REGIONAL_ALLOCATION = [
  { name: 'North America', value: 40 },
  { name: 'Europe', value: 30 },
  { name: 'Asia Pacific', value: 20 },
  { name: 'Emerging Markets', value: 10 },
]
