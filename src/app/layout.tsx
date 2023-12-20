import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans';
import './globals.css'

export const metadata: Metadata = {
  title: 'Kai Takami',
  description: 'Full-stack software engineer with 3+ years of experience focused on building user-centric products, delivering high-quality code, emphasizing reliable systems, and ensuring scalability.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={GeistSans.className}>{children}</body>
    </html>
  )
}
