import { motion } from 'motion/react'
import { useState, type AnchorHTMLAttributes, type ReactNode } from 'react'
import { usePage } from '../hooks'

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string
  children: ReactNode
}

function Link({ children, href }: LinkProps) {
  const [isHovering, setIsHovering] = useState(false)
  const { setCurrentPage } = usePage()

  return (
    <motion.button
      onClick={() => setCurrentPage(href)}
      className="grid h-full place-items-center p-2 no-underline"
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      onHoverStart={() => setIsHovering(true)}
      onHoverEnd={() => setIsHovering(false)}
      animate={{ opacity: isHovering ? 1 : 0.75 }}
    >
      {children}
    </motion.button>
  )
}

export function Navbar() {
  return (
    <motion.nav key="navbar" className="bg-background fixed right-0 bottom-0 left-0 z-50 md:top-0">
      <motion.div className="relative flex justify-between p-8 text-xl">
        {/* LOGO */}
        <Link href="home" aria-label="Navigate to home">
          <img src="/signature.svg" alt="Logo" className="h-auto w-24" />
        </Link>

        {/* Pages */}
        <div className="flex gap-4">
          <Link href="about">Work</Link>
          <Link href="profile">Profile</Link>
          <Link href="open-source">Open Source</Link>
          <Link href="contact">Contact</Link>
        </div>
      </motion.div>
    </motion.nav>
  )
}
