'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const Footer = ({ onToggleTerminal }: { onToggleTerminal: () => void }) => {
  const pathname = usePathname()

  return (
    <footer className="relative py-6 md:py-0">
      <div className="absolute top-0 h-px w-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-dark to-background-start" />
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          Brought to you by{" "}
          <Link href="https://github.com/kaitakami" target="_blank" rel="noreferrer" className="font-medium underline underline-offset-4">Kai</Link>.
        </p>
        {pathname === '/' && (
          <button 
            type="button"
            onClick={onToggleTerminal}
            className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4"
          >
            Terminal View
          </button>
        )}
      </div>
    </footer>
  )
}

export default Footer
