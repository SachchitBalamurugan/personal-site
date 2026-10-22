import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

export function SectionHead({ index, kicker, title, children }: { index: string; kicker: string; title: string; children?: ReactNode }) {
  return (
    <Reveal className="section-head">
      <p className="kicker">
        <span className="kicker-index">{index}</span> {kicker}
      </p>
      <h2>{title}</h2>
      {children && <p className="section-sub">{children}</p>}
    </Reveal>
  )
}

export function ExtLink({ href, children, className = 'btn' }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a className={className} href={href} target="_blank" rel="noreferrer">
      {children}
      <span aria-hidden="true"> ↗</span>
    </a>
  )
}
