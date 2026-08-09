import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  title: 'My Site',
  description: 'Welcome to my site',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <nav>
          <Link href="/">Home</Link>
          <Link href="/services">Services</Link>
          <Link href="/quote">Get a Quote</Link>
          <Link href="/about">About</Link>
          <Link href="/reviews">Reviews</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        {children}
        <footer>
          <Link href="/privacy-policy">Privacy Policy</Link>
          <Link href="/terms">Terms and Conditions</Link>
        </footer>
      </body>
    </html>
  )
}
