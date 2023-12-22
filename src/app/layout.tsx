import type { Metadata } from 'next'
import { Young_Serif } from 'next/font/google'
import './globals.css'

const youngSerif = Young_Serif({
  weight: ['400'],
  subsets: ["latin"]
})

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
      <body className={`${youngSerif.className} bg-gradient-to-br from-background-start to-background-end min-h-screen text-primary`}>{children}</body>
    </html>
  )
}
