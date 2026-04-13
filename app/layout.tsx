import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { config } from '@fortawesome/fontawesome-svg-core'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

config.autoAddCss = false

export const metadata: Metadata = {
  title: 'NovaVest - Illuminate Your Financial Future',
  description: 'Premium fintech platform for secure investments, crypto-backed loans, and advanced portfolio management. Build wealth with confidence.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
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
