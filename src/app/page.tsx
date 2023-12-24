import Blogs from '@/components/Blogs'
import Container from '@/components/Container'
import Footer from '@/components/Footer'
import Hero from '@/components/Hero'
import Projects from '@/components/Projects'

export default function Home() {
  return (
    <Container>
      <Hero />
      <Blogs />
      <Projects />
      <Footer />
    </Container>
  )
}
