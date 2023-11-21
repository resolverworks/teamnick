import type { Metadata } from 'next'

import '@rainbow-me/rainbowkit/styles.css'

import './globals.css'
import { ClientProviders } from '@/lib/providers'

export const metadata: Metadata = {
  title: 'Team Nick',
  description: 'A name a day, keeps the bad vibes away',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  )
}
