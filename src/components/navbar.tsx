import { motion } from 'motion/react'
import { type AnchorHTMLAttributes, type ReactNode } from 'react'
import { usePage } from '../hooks'

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string
  children: ReactNode
}

function Link({ children, href }: LinkProps) {
  const { navigateTo, currentPage } = usePage()
  const isActive = currentPage === href

  return (
    <motion.button
      onClick={() => navigateTo(href)}
      className="grid h-full place-items-center p-2 no-underline"
      style={{ opacity: isActive ? 1 : 0.85, cursor: 'pointer' }}
      whileHover={{ opacity: 1, scale: 1.025 }}
      whileFocus={{ opacity: 1, scale: 1.025 }}
      whileTap={{ scale: 0.975 }}
      initial={false}
      transition={{ duration: 0.1, ease: 'easeOut' }}
      aria-current={isActive ? 'page' : undefined}
    >
      {children}
    </motion.button>
  )
}

export function Navbar() {
  return (
    <motion.nav
      className="bg-background fixed right-0 left-0 z-50 md:top-0"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="relative flex justify-between p-8 text-xl"
        initial={false}
        animate={{ opacity: 1 }}
      >
        {/* LOGO */}
        <Link href="home" aria-label="Navigate to home">
          <img src="/signature.svg" alt="Logo" className="h-auto w-24" />
        </Link>

        {/* Pages */}
        <div className="flex gap-4">
          <Link href="work">Work</Link>
          <Link href="about">Profile</Link>
          <Link href="projects">Projects</Link>
          <Link href="contact">Contact</Link>
        </div>
      </motion.div>
    </motion.nav>
  )
}
