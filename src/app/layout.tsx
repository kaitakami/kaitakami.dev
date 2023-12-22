import type { Metadata } from 'next'
import { Syne } from "next/font/google"
import './globals.css'

const syneFont = Syne({
  style: "normal",
  subsets: ["latin"],
  weight: ["700", "400"],
})

export const metadata: Metadata = {
  title: 'Kai Takami',
  description: 'Full-stack software engineer with 3+ years of experience focused on building user-centric products, delivering high-quality code, emphasizing reliable systems, and ensuring scalability.',
  openGraph: {
    images: "/public/og.jpg",
    type: "website",
    description: "Software Engineer 3+ years of experience focused on building user-centric products, delivering high-quality code, emphasizing reliable systems, and ensuring scalability.",
    title: "Kai Takami"
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kai Takami',
    description: 'Software Engineer 3+ years of experience focused on building user-centric products, delivering high-quality code, emphasizing reliable systems, and ensuring scalability.',
    creator: '@kaitakami_',
    images: "/public/og.jpg",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${syneFont.className} bg-gradient-to-br from-background-start to-background-end min-h-screen text-primary`}>{children}</body>
    </html>
  )
}
