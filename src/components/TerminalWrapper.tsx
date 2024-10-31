'use client'

import { useState } from 'react'
import Container from './Container'
import Hero from './Hero'
import Blogs from './Blogs'
import Projects from './Projects'
import Footer from './Footer'
import Terminal from './Terminal'

export default function TerminalWrapper() {
  const [showNormal, setShowNormal] = useState(false)

  if (!showNormal) {
    return <Terminal onSwitchView={() => setShowNormal(true)} />
  }

  return (
    <Container>
      <Hero />
      <Blogs />
      <Projects />
      <Footer onToggleTerminal={() => setShowNormal(false)} />
    </Container>
  )
} 