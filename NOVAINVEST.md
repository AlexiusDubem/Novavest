# NOVAINVEST - Global Investment Platform

A professional investment platform built with Next.js 16, React 19, and Tailwind CSS. This is a fully functional demo featuring a landing page and comprehensive user dashboard.

## Features

### Landing Page
- **Hero Section** with animated growth chart showing platform metrics
- **News & Updates** section with market news and company updates
- **Financial Charts** displaying market performance, sector distribution, and regional allocation
- **Responsive Navigation** with mobile menu support
- **Professional Footer** with links and social media

### User Dashboard
- **Portfolio Overview** - View total balance, investments, profits, and dividends
- **Investment Plans** - Browse and manage investment opportunities with various APY rates
- **Deposit Funds** - Multiple payment methods (card, bank transfer, digital wallet)
- **Withdraw Funds** - Secure withdrawal with 2FA verification
- **Request Loans** - Use portfolio as collateral with detailed LTV calculations
- **Wallet Management** - Connect wallets and track crypto portfolio
- **KYC Verification** - Multi-level Know Your Customer verification system
- **Settings** - Security, notifications, API keys, and privacy preferences
- **User Profile** - Personal information and contact details
- **Support Center** - Ticketing system, FAQs, and support options

## Design System

### Colors
- **Primary**: #1E3A8A (Professional Blue)
- **Secondary**: #14B8A6 (Teal Accent)
- **Neutrals**: White, grays, and dark backgrounds

### Typography
- **Font**: Geist (sans-serif) - Clean, modern, professional
- **Hierarchy**: Bold headlines, clear information hierarchy

### Components
- Cards for content sections
- Tabs for multi-view pages
- Charts with Recharts for data visualization
- Forms with validation
- Professional tables for data display
- Modal dialogs for confirmations

## Project Structure

```
/app
  /dashboard
    - page.tsx (Overview)
    /investment-plans
    /deposit
    /withdraw
    /loan
    /wallet
    /kyc
    /settings
    /profile
    /support
  /layout.tsx (Root layout with metadata)
  /page.tsx (Landing page)

/components
  /layout
    - Header.tsx
    - Sidebar.tsx
    - Footer.tsx
  /landing
    - HeroSection.tsx
    - NewsSection.tsx
  /ui (shadcn/ui components)

/lib
  - constants.ts (Brand colors, navigation, mock data)
```

## Mock Data

The application includes comprehensive mock data for:
- News articles and updates
- Investment plans with various APY rates
- User portfolio and transactions
- KYC verification levels
- Support tickets and FAQs
- Wallet and crypto holdings

## Key Pages

| Page | Route | Purpose |
|------|-------|---------|
| Landing | `/` | Public landing page with features |
| Dashboard | `/dashboard` | Portfolio overview and metrics |
| Investment Plans | `/dashboard/investment-plans` | Browse and manage investments |
| Deposit | `/dashboard/deposit` | Add funds to account |
| Withdraw | `/dashboard/withdraw` | Withdraw funds with 2FA |
| Loan Request | `/dashboard/loan` | Borrow against portfolio |
| Wallets | `/dashboard/wallet` | Manage connected wallets |
| KYC | `/dashboard/kyc` | Verification levels |
| Settings | `/dashboard/settings` | Account preferences |
| Profile | `/dashboard/profile` | User information |
| Support | `/dashboard/support` | Help and support |

## Technology Stack

- **Framework**: Next.js 16.2 (App Router)
- **React**: 19.0
- **Styling**: Tailwind CSS 4.2
- **UI Components**: shadcn/ui
- **Charts**: Recharts 2.15
- **Forms**: React Hook Form + Zod
- **Notifications**: Sonner
- **Icons**: Lucide React

## Getting Started

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

The app will be available at `http://localhost:3000`

## Responsive Design

- **Mobile-first** approach
- **Responsive navigation** with hamburger menu
- **Mobile-optimized** forms and inputs
- **Tablet and desktop** layout enhancements
- **Touch-friendly** button sizes

## Security Features (Demo)

- 2FA verification forms
- Password change functionality
- API key management interface
- Session management display
- Privacy settings controls

## Notes

- This is a **demo/showcase** application with mock data
- No real authentication backend required
- All data is client-side (suitable for demonstration)
- Forms are fully functional with validation
- Toast notifications for user feedback
- Professional styling matching reference designs

## Future Enhancements

- Real API backend integration
- Authentication system (Auth.js/NextAuth)
- Database integration (Supabase/Neon)
- Real-time notifications
- Advanced charting and analytics
- Mobile app with React Native
- Webhook integrations
