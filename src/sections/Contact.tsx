import { useEffect, useState } from 'react'
import { profile } from '../data/profile'
import { Cloud } from '../components/Sky'
import { LivePill, Orb, Title } from '../components/ui'
import { useInView } from '../lib/hooks'

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']

const BRAINROT = `rizz aura be 0
grind (aura < 9000) {
    rizz aura be aura + 1000
}
sus (aura > 9000) {
    yap "it's over 9000 fr fr"
}`

/** Watches the keyboard for "rizz" and the Konami code. */
function useEasterEggs() {
  const [egg, setEgg] = useState<'rizz' | 'konami' | null>(null)
  useEffect(() => {
    let typed = ''
    let seq: string[] = []
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      typed = (typed + e.key.toLowerCase()).slice(-8)
      seq = [...seq, e.key].slice(-KONAMI.length)
      if (typed.endsWith('rizz')) setEgg('rizz')
      if (KONAMI.every((k, i) => seq[i]?.toLowerCase() === k.toLowerCase())) setEgg('konami')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  useEffect(() => {
    if (!egg) return
    const id = setTimeout(() => setEgg(null), egg === 'konami' ? 4200 : 6000)
    return () => clearTimeout(id)
  }, [egg])
  return egg
}

export function EasterEggs() {
  const egg = useEasterEggs()
  if (egg === 'rizz')
    return (
      <div className="toast" role="status">
        <div className="note-head">
          <Orb small />
          <b>Brainrot Lang</b>
          <span>now</span>
        </div>
        <p className="toast-title">You found it.</p>
        <pre>{BRAINROT}</pre>
        <p className="toast-out">&gt; it's over 9000 fr fr</p>
      </div>
    )
  if (egg === 'konami')
    return (
      <div className="runner-egg" role="status">
        <span className="runner-guy" aria-hidden="true" />
        <span className="runner-log" aria-hidden="true" />
        <p>Jungle Run IRL unlocked. Go play the real one with your whole body.</p>
      </div>
    )
  return null
}

const COLUMNS = [
  {
    title: 'Work',
    links: [
      { href: '#work', label: 'Featured' },
      { href: '#projects', label: 'More projects' },
      { href: '#research', label: 'Research' },
    ],
  },
  {
    title: 'About',
    links: [
      { href: '#press', label: 'Press' },
      { href: '#experience', label: 'Experience' },
      { href: '#awards', label: 'Awards' },
    ],
  },
  {
    title: 'Elsewhere',
    links: [
      { href: profile.links.github, label: 'GitHub', ext: true },
      { href: profile.links.linkedin, label: 'LinkedIn', ext: true },
      { href: profile.links.scholar, label: 'Scholar', ext: true },
      { href: profile.links.resume, label: 'Résumé', ext: true },
    ],
  },
]

export function Contact() {
  const [copied, setCopied] = useState(false)
  const [markRef, markIn] = useInView<HTMLDivElement>('top 75%')
  return (
    <footer id="contact" className="footer-shell">
      <span className="grain" />
      <span className="f-blob f-blob--lilac" aria-hidden="true">
        <span className="grain" />
      </span>
      <span className="f-blob f-blob--sky" aria-hidden="true">
        <span className="grain" />
        <Cloud shape="puff" seed={61} tint="#8eaad3" className="f-cloud" />
      </span>
      <span className="f-blob f-blob--mint" aria-hidden="true">
        <span className="grain" />
      </span>
      <span className="f-blob f-blob--peach" aria-hidden="true" />
      <span className="f-blob f-blob--pink" aria-hidden="true" />
      <div className="f-cloud-left" aria-hidden="true">
        <Cloud shape="long" seed={64} tint="#9fb4d4" />
      </div>

      <div className="footer-cta">
        <LivePill>Inbox open</LivePill>
        <Title parts={['Got a problem worth building for?', { br: true }, { em: 'Tell me about it.' }]} />
        <button
          type="button"
          className="btn btn-glass btn-lg"
          onClick={() => {
            navigator.clipboard?.writeText(profile.email)
            setCopied(true)
            setTimeout(() => setCopied(false), 1800)
          }}
        >
          {copied ? 'Copied to clipboard' : profile.email}
        </button>
        <p className="footer-note">
          Startups, research, hackathon teammates, or just talking about rare cancers and robots.{' '}
          <a href={`mailto:${profile.email}`}>Email me directly</a>.
        </p>
      </div>

      <div ref={markRef} className={markIn ? 'wordmark is-in' : 'wordmark'} aria-hidden="true">
        <span className="wordmark-inner">
          <span className="wordmark-outline">Sachchit</span>
          <span className="wordmark-fill">Sachchit</span>
        </span>
      </div>

      <div className="footer-bar">
        <div className="footer-brand">
          <a href="#top" className="nav-logo">
            <Orb />
            <span>sachchit</span>
          </a>
          <p>Bioengineering at UC Berkeley. Building FschoolAI. Shipping a hackathon project about every other week.</p>
          <p className="footer-copy">© 2026 Sachchit Balamurugan · {profile.location}</p>
          <p className="footer-hint">psst: type “rizz” anywhere, or the Konami code.</p>
        </div>
        {COLUMNS.map((c) => (
          <div key={c.title} className="footer-col">
            <p>{c.title}</p>
            <ul>
              {c.links.map((l) => (
                <li key={l.label}>
                  <a href={l.href} {...('ext' in l ? { target: '_blank', rel: 'noreferrer' } : {})}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  )
}
