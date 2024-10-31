'use client'

import { createContext, useContext, useState, useEffect } from 'react'

type ViewContextType = {
  isTerminalView: boolean
  toggleView: () => void
}

const ViewContext = createContext<ViewContextType | undefined>(undefined)

export function ViewProvider({ children }: { children: React.ReactNode }) {
  const [isTerminalView, setIsTerminalView] = useState(true)

  useEffect(() => {
    const savedView = localStorage.getItem('isTerminalView')
    if (savedView !== null) {
      setIsTerminalView(JSON.parse(savedView))
    }
  }, [])

  const toggleView = () => {
    setIsTerminalView(prev => {
      const newValue = !prev
      localStorage.setItem('isTerminalView', JSON.stringify(newValue))
      return newValue
    })
  }

  return (
    <ViewContext.Provider value={{ isTerminalView, toggleView }}>
      {children}
    </ViewContext.Provider>
  )
}

export function useView() {
  const context = useContext(ViewContext)
  if (context === undefined) {
    throw new Error('useView must be used within a ViewProvider')
  }
  return context
} 