import Blog from '@/components/Blog'
import Container from '@/components/Container'
import Footer from '@/components/Footer'
import Hero from '@/components/Hero'

export default function Home() {
  return (
    <Container>
      <Hero />
      <Blog />
      <Footer />
    </Container>
  )
}
