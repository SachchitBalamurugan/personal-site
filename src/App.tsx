import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'
import Hero from './sections/Hero'
import About from './sections/About'
import Projects from './sections/Projects'
import Research from './sections/Research'
import Missions from './sections/Missions'
import Press from './sections/Press'
import { Awards, Experience } from './sections/Experience'
import { Contact, EasterEggs } from './sections/Contact'

const HelixGalaxy = lazy(() => import('./three/HelixGalaxy'))

const NAV = [
  ['about', 'About'],
  ['projects', 'Projects'],
  ['research', 'Research'],
  ['nasa', 'NASA'],
  ['press', 'Press'],
  ['experience', 'Experience'],
  ['contact', 'Contact'],
] as const

function useBackgroundMode() {
  return useState(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let webgl = false
    try {
      const c = document.createElement('canvas')
      webgl = !!(c.getContext('webgl2') || c.getContext('webgl'))
    } catch {
      webgl = false
    }
    return webgl && !reduced ? '3d' : 'static'
  })[0]
}

export default function App() {
  const progress = useRef(0)
  const mode = useBackgroundMode()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.1, anchors: true })
    let raf = 0
    const loop = (t: number) => {
      lenis.raf(t)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    lenis.on('scroll', ({ scroll }: { scroll: number }) => {
      // the helix fully unwinds over the first ~1.2 screens
      progress.current = Math.min(1, scroll / (window.innerHeight * 1.2))
      setScrolled(scroll > 40)
    })
    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
    }
  }, [])

  return (
    <>
      <div className="bg" aria-hidden="true">
        {mode === '3d' ? (
          <Suspense fallback={null}>
            <HelixGalaxy progress={progress} />
          </Suspense>
        ) : (
          <div className="bg-static" />
        )}
      </div>
      <div className="bg-vignette" aria-hidden="true" />

      <nav className={scrolled ? 'nav is-scrolled' : 'nav'}>
        <a href="#top" className="nav-logo" aria-label="Back to top">
          sb<span>.</span>
        </a>
        <ul>
          {NAV.map(([id, label]) => (
            <li key={id}>
              <a href={`#${id}`}>{label}</a>
            </li>
          ))}
        </ul>
      </nav>

      <main>
        <Hero />
        <About />
        <Projects />
        <Research />
        <Missions />
        <Press />
        <Experience />
        <Awards />
        <Contact />
      </main>
      <EasterEggs />
    </>
  )
}
