import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Stellar Pay — XLM Payments on Testnet',
  description: 'A minimal, production-ready Stellar dApp to send XLM on Testnet using Freighter wallet.',
  keywords: ['Stellar', 'XLM', 'Freighter', 'blockchain', 'payments', 'testnet', 'dApp'],
  authors: [{ name: 'Stellar Pay' }],
  openGraph: {
    title: 'Stellar Pay',
    description: 'Send XLM on Stellar Testnet with Freighter wallet',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌟</text></svg>" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
