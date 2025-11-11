import { motion, type Transition } from 'motion/react'
import { useState, type AnchorHTMLAttributes, type ReactNode } from 'react'

import { Signature } from './signature'

const navbarTransition: Transition = { duration: 1, ease: 'circOut', delay: 0.5 }

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string
    children: ReactNode
}

function Link({ href, children, className }: LinkProps) {
    const composedClassName = ['no-underline p-2 h-full grid place-items-center', className]
        .filter(Boolean)
        .join(' ')

        const [isHovering, setIsHovering] = useState(false)

    return (
        <motion.a 
        href={href} 
        className={composedClassName}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        onHoverStart={() => setIsHovering(true)}
        onHoverEnd={() => setIsHovering(false)}
        animate={{ opacity: isHovering ? 1 : 0.75 }}
        >
            {children}
        </motion.a>
    )
}

export function Navbar() {
    

    return (
        <motion.nav
            className="bg-background fixed top-0 left-0 right-0 z-50"
            initial={{ y: 32, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={navbarTransition}
        >
            <motion.div
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="relative flex justify-between p-8 text-xl">
                {/* LOGO */}
                <Link href="#home" aria-label="Navigate to home">
                    <Signature className="w-24 h-auto" drawDelay={1.5} />
                </Link>

                {/* Pages */}
                <div className="flex gap-4">
                    <Link href="#work">Work</Link>
                    <Link href="#profile">Profile</Link>
                    <Link href="#open-source">Open Source</Link>
                    <Link href="#contact">Contact</Link>
                </div>
            </motion.div>
        </motion.nav>
    )
}