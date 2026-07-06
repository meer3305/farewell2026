import Link from 'next/link'
import './globals.css'

export const metadata = {
  title: 'Freshers 2026',
  description: 'Registration and Attendance System',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="max-w-6xl mx-auto flex h-14 items-center justify-between px-4">
            <Link href="/" className="font-bold text-lg">Freshers 2026</Link>
            <nav className="flex gap-4 text-sm">
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">Register</Link>
              <Link href="/status" className="text-muted-foreground hover:text-foreground transition-colors">Status</Link>
              <Link href="/admin/login" className="text-muted-foreground hover:text-foreground transition-colors">Admin</Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  )
}
