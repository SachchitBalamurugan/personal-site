import { useEffect, useState } from 'react'
import { Mark } from '../components/ui'

const LINKS = [
  ['#work', 'Work'],
  ['#projects', 'Projects'],
  ['#research', 'Research'],
  ['#experience', 'Experience'],
] as const

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  return (
    <nav className={scrolled ? 'nav is-scrolled' : 'nav'} aria-label="Main">
      <a href="#top" className="nav-logo" aria-label="Sachchit Balamurugan, back to top">
        <Mark />
        <span>sachchit</span>
      </a>
      <ul>
        {LINKS.map(([href, label]) => (
          <li key={href}>
            <a href={href}>{label}</a>
          </li>
        ))}
      </ul>
      <a className="btn btn-dark btn-sm" href="#contact">
        Say hi
      </a>
    </nav>
  )
}
