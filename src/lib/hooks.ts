import { useEffect, useRef, useState, type RefObject } from 'react'
import { ScrollTrigger } from './gsap'

export function useMedia(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mql = window.matchMedia(query)
    const on = () => setMatches(mql.matches)
    mql.addEventListener('change', on)
    return () => mql.removeEventListener('change', on)
  }, [query])
  return matches
}

export const useReducedMotion = () => useMedia('(prefers-reduced-motion: reduce)')

/** Flips to true once the element scrolls into view, then stays true. */
export function useInView<T extends HTMLElement>(start = 'top 85%'): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const st = ScrollTrigger.create({ trigger: el, start, once: true, onEnter: () => setSeen(true) })
    return () => st.kill()
  }, [start])
  return [ref, seen]
}

/** A menu-bar clock, e.g. "Sat 1:08 AM". */
export function useClock() {
  const fmt = () =>
    new Date().toLocaleTimeString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' }).replace(',', '')
  const [now, setNow] = useState(fmt)
  useEffect(() => {
    const id = window.setInterval(() => setNow(fmt()), 15000)
    return () => window.clearInterval(id)
  }, [])
  return now
}
