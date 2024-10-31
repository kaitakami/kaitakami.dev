'use client'

import Terminal from '@/components/Terminal'
import Container from '@/components/Container'
import Hero from '@/components/Hero'
import Blogs from '@/components/Blogs'
import Projects from '@/components/Projects'
import Footer from '@/components/Footer'
import { useState, useEffect } from 'react'

export default function Home() {
  const [isTerminalView, setIsTerminalView] = useState<boolean | null>(null)

  useEffect(() => {
    const savedView = localStorage.getItem('isTerminalView')
    setIsTerminalView(savedView !== null ? JSON.parse(savedView) : true)
  }, [])

  const toggleView = () => {
    setIsTerminalView(prev => {
      const newValue = !prev
      localStorage.setItem('isTerminalView', JSON.stringify(newValue))
      return newValue
    })
  }

  if (isTerminalView === null) {
    return null
  }

  if (isTerminalView) {
    return <Terminal onSwitchView={toggleView} />
  }

  return (
    <>
      <Container>
        <Hero />
        <Blogs />
        <Projects />
      </Container>
      <Footer onToggleTerminal={toggleView} />
    </>
  )
}
