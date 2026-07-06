import './globals.css'
import { Cormorant_Garamond, Inter, Space_Grotesk } from 'next/font/google'
import { SiteShell } from '@/components/site/site-shell'

const headingFont = Cormorant_Garamond({ subsets: ['latin'], variable: '--font-heading' })
const bodyFont = Inter({ subsets: ['latin'], variable: '--font-body' })
const numberFont = Space_Grotesk({ subsets: ['latin'], variable: '--font-number' })

export const metadata = {
  title: "EPILOGUE'26 | Official Farewell Celebration",
  description: 'The final chapter of four unforgettable years.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${headingFont.variable} ${bodyFont.variable} ${numberFont.variable} min-h-screen antialiased`}>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  )
}
