import '@/app/globals.css'
import './mdx.css'
import Link from 'next/link'
import Container from '@/components/Container'
import Footer from '@/components/Footer'
import { Inter, Lora } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })
const lora = Lora({ 
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-lora'
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Container>
      <div className={`${inter.className} ${lora.variable}`}>
        <nav className='pt-8 max-w-2xl w-full mx-auto'>
          <Link href="/" className='text-secondary font-semibold'>Kai Takami</Link>
        </nav>
        <main className='py-20 max-w-2xl mx-auto mdx'>
          {children}
        </main>
        <Footer />
      </div>
    </Container>
  )
}
