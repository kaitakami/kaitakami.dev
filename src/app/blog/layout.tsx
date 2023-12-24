import '@/app/globals.css'
import './mdx.css'
import Link from 'next/link'
import Container from '@/components/Container'
import Footer from '@/components/Footer'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Container>
      <nav className='pt-8 max-w-2xl w-full mx-auto'>
        <Link href="/" className='text-secondary font-semibold'>Kai Takami</Link>
      </nav>
      <main className='py-20 max-w-2xl mx-auto mdx'>
        {children}
      </main>
      <Footer />
    </Container>
  )
}
