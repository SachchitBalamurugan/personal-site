import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Cloud } from '../components/Sky'
import { ArrowDown, Avatar, ExtLink, LivePill, Title, type Tone } from '../components/ui'
import { gsap, MOTION_OK, useGSAP } from '../lib/gsap'
import { profile } from '../data/profile'

interface Bubble {
  initial: string
  tone: Tone
  name: string
  line: string
}

const BUBBLES: Bubble[] = [
  { initial: 'F', tone: 'lilac', name: 'FschoolAI', line: '130K+ users' },
  { initial: 'Y', tone: 'clay', name: 'Y Combinator', line: '1st at Haunted Hacks' },
  { initial: 'F', tone: 'slate', name: 'Forbes', line: 'wrote about my cancer research' },
  { initial: 'D', tone: 'moss', name: 'DNAForge', line: '1st, Ray Caster track' },
  { initial: 'T', tone: 'clay', name: 'Tokyo', line: 'presented at IYRC' },
  { initial: 'B', tone: 'ochre', name: 'BPA', line: '1st at Nationals' },
  { initial: 'N', tone: 'sky', name: 'NASA Space Apps', line: 'People’s Choice ’24' },
  { initial: 'S', tone: 'moss', name: 'State Farm', line: 'three internship terms' },
  { initial: 'R', tone: 'ochre', name: 'FRC', line: 'Texas State Champion' },
  { initial: 'E', tone: 'moss', name: 'Eagle Scout', line: '45 merit badges' },
]

/** Four fixed spots around the headline, taken from the reference layout. */
const SLOTS: CSSProperties[] = [
  { top: '17%', left: '4%' },
  { top: '15%', right: '4%' },
  { top: '64%', left: '9%' },
  { top: '68%', right: '7%' },
]

type Phase = 'enter' | 'in' | 'out'

/** One bubble every 1.9s after a 1.8s pause; each lives 3.6s, then floats off. */
function useBubbles() {
  const [items, setItems] = useState<{ id: number; bubble: Bubble; slot: number; phase: Phase }[]>([])
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let n = 0
    const timers: number[] = []
    const spawn = () => {
      const id = n++
      setItems((all) => [...all, { id, bubble: BUBBLES[id % BUBBLES.length], slot: id % SLOTS.length, phase: 'enter' }])
      const set = (phase: Phase) => setItems((all) => all.map((b) => (b.id === id ? { ...b, phase } : b)))
      timers.push(window.setTimeout(() => set('in'), 40))
      timers.push(window.setTimeout(() => set('out'), 3600))
      timers.push(window.setTimeout(() => setItems((all) => all.filter((b) => b.id !== id)), 4600))
    }
    let interval = 0
    const first = window.setTimeout(() => {
      spawn()
      interval = window.setInterval(spawn, 1900)
    }, 1800)
    return () => {
      window.clearTimeout(first)
      window.clearInterval(interval)
      timers.forEach(window.clearTimeout)
    }
  }, [])
  return items
}

export default function Hero() {
  const root = useRef<HTMLElement>(null)
  const bubbles = useBubbles()

  // Pointer + scroll parallax: each layer drifts by its depth.
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        const el = root.current
        if (!el) return
        const layers = gsap.utils.toArray<HTMLElement>('[data-depth]', el).map((layer) => ({
          depth: Number(layer.dataset.depth),
          x: gsap.quickTo(layer, 'x', { duration: 0.9, ease: 'power3.out' }),
          y: gsap.quickTo(layer, 'y', { duration: 0.9, ease: 'power3.out' }),
        }))
        const p = { x: 0, y: 0, scroll: 0 }
        const apply = () =>
          layers.forEach((l) => {
            l.x(p.x * l.depth)
            l.y(p.y * l.depth * 0.6 - p.scroll * l.depth * 0.012)
          })
        const onMove = (e: PointerEvent) => {
          const r = el.getBoundingClientRect()
          p.x = ((e.clientX - r.left) / r.width - 0.5) * 2
          p.y = ((e.clientY - r.top) / r.height - 0.5) * 2
          apply()
        }
        const onScroll = () => {
          p.scroll = Math.min(window.scrollY, 1200)
          apply()
        }
        el.addEventListener('pointermove', onMove)
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => {
          el.removeEventListener('pointermove', onMove)
          window.removeEventListener('scroll', onScroll)
        }
      })
    },
    { scope: root },
  )

  return (
    <header className="hero" id="top" ref={root}>
      <div className="hero-sky" aria-hidden="true">
        <div className="wall wall--noon" />
        <span className="grain" />
      </div>

      <div className="hero-layer" data-depth="8" aria-hidden="true">
        <div className="cloud-pos bob" style={{ right: '-4%', top: '9%', width: '27vw' }}>
          <Cloud shape="tall" seed={8} tint="#8eaad3" />
        </div>
        <div className="cloud-pos bob" style={{ left: '30%', top: '76%', width: '34vw', animationDelay: '-2s' }}>
          <Cloud shape="long" seed={14} tint="#8eaad3" />
        </div>
      </div>
      <div className="hero-layer" data-depth="16" aria-hidden="true">
        <div className="cloud-pos bob" style={{ left: '-7%', top: '40%', width: '30vw', animationDelay: '-1s' }}>
          <Cloud shape="puff" seed={2} tint="#8eaad3" />
        </div>
        <div className="cloud-pos bob" style={{ right: '5%', top: '70%', width: '23vw', animationDelay: '-3s' }}>
          <Cloud shape="puff" seed={11} tint="#8eaad3" />
        </div>
      </div>
      <div className="hero-layer" data-depth="26" aria-hidden="true">
        <span className="hero-blob hero-blob--lilac" />
        <span className="hero-blob hero-blob--peach">
          <i />
          <i />
        </span>
      </div>

      <div className="hero-bubbles" aria-hidden="true">
        {bubbles.map(({ id, bubble, slot, phase }) => (
          <div key={id} className={`bubble is-${phase}`} style={SLOTS[slot]}>
            <Avatar initial={bubble.initial} tone={bubble.tone} />
            <b>{bubble.name}</b>
            <span>{bubble.line}</span>
            <i className="live-dot" />
          </div>
        ))}
      </div>

      <div className="hero-copy">
        <div className="hero-pill">
          <LivePill>Studying bioengineering at UC Berkeley</LivePill>
        </div>
        <Title
          as="h1"
          auto
          delay={150}
          className="hero-title"
          parts={['I build AI', { em: 'for real problems', mark: true, after: ',' }, { br: true }, 'and then I actually ship it.']}
        />
        <p className="hero-sub">
          Hi, I’m <strong>{profile.name}</strong>. Co-founder and CTO of FschoolAI, Regents’ and Chancellor’s Scholar at Berkeley.
        </p>
        <div className="hero-cta">
          <a className="btn btn-glass btn-lg" href="#work">
            See my work <ArrowDown className="bob-fast" />
          </a>
          <ExtLink href={profile.links.resume} className="btn btn-glass btn-lg btn-quiet">
            Résumé
          </ExtLink>
        </div>
      </div>
    </header>
  )
}
