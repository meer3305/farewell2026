import Link from 'next/link'
import './globals.css'

export const metadata = {
  title: 'Freshers 2026',
  description: 'Registration and Attendance System',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <header className="sticky top-0 z-50 w-full border-b bg-white">
          <div className="max-w-2xl mx-auto flex h-14 items-center justify-between px-4">
            {/* <Link href="/" className="text-base font-medium text-foreground">
              Freshers 2026
            </Link> */}
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/" className="text-muted-foreground hover:text-foreground">
                Register
              </Link>
              <Link href="/status" className="text-muted-foreground hover:text-foreground">
                Status
              </Link>
              <Link href="/admin/login" className="text-muted-foreground hover:text-foreground">
                Admin
              </Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  )
}
