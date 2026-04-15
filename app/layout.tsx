import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { config } from '@fortawesome/fontawesome-svg-core'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

config.autoAddCss = false

export const metadata: Metadata = {
  title: 'BOLDWAVE - Illuminate Your Financial Future',
  description: 'Premium fintech platform for secure investments, crypto-backed loans, and advanced portfolio management. Build wealth with confidence.',
  generator: 'v0.app',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <body className="font-sans antialiased overflow-x-hidden w-full relative">
        <AuthProvider>
          <ThemeProvider attribute="class" forcedTheme="light" enableSystem={false}>
            {children}
            <Toaster richColors position="top-right" />
          </ThemeProvider>
        </AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
