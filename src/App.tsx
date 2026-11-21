import { useRef } from 'react'
import Nav from './sections/Nav'
import Hero from './sections/Hero'
import About from './sections/About'
import Showcase from './sections/Showcase'
import MoreProjects from './sections/MoreProjects'
import Research from './sections/Research'
import Missions from './sections/Missions'
import Press from './sections/Press'
import { Awards, Experience } from './sections/Experience'
import { Contact, EasterEggs } from './sections/Contact'
import { EASE_HOP, gsap, MOTION_OK, ScrollTrigger, useGSAP } from './lib/gsap'

export default function App() {
  const root = useRef<HTMLDivElement>(null)

  // Everything marked .reveal blurs up into place as it enters, in small staggered batches.
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        const items = gsap.utils.toArray<HTMLElement>('.reveal')
        gsap.set(items, { autoAlpha: 0, y: 28, filter: 'blur(8px)' })
        ScrollTrigger.batch(items, {
          start: 'top 90%',
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              autoAlpha: 1,
              y: 0,
              filter: 'blur(0px)',
              duration: 1,
              ease: EASE_HOP,
              stagger: 0.08,
              overwrite: true,
              clearProps: 'filter',
            }),
        })
      })
      // Fonts and lazy images shift layout after first paint; re-measure once they land.
      document.fonts?.ready.then(() => ScrollTrigger.refresh())
      window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true })

      // The sections render after the browser looks for #anchor, so honor deep links ourselves.
      const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)))
      if (target) requestAnimationFrame(() => target.scrollIntoView({ behavior: 'instant' }))
    },
    { scope: root },
  )

  return (
    <div ref={root} className="page">
      <Nav />
      <main>
        <Hero />
        <About />
        <Showcase />
        <MoreProjects />
        <Research />
        <Missions />
        <Press />
        <Experience />
        <Awards />
      </main>
      <Contact />
      <EasterEggs />
    </div>
  )
}
