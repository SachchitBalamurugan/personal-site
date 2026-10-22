import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { profile } from '../data/profile'
import { ExtLink, Reveal, SectionHead } from './ui'

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']

const BRAINROT = `rizz aura be 0
grind (aura < 9000) {
    rizz aura be aura + 1000
}
sus (aura > 9000) {
    yap "it's over 9000 fr fr"
}`

/** Watches the keyboard for typed words and the Konami code. */
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
  return (
    <AnimatePresence>
      {egg === 'rizz' && (
        <motion.div className="toast" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} role="status">
          <p className="card-meta">you found it: Brainrot Lang 🧠</p>
          <pre>{BRAINROT}</pre>
          <p className="toast-out">&gt; it's over 9000 fr fr</p>
        </motion.div>
      )}
      {egg === 'konami' && (
        <motion.div className="runner" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} aria-hidden="true">
          <span className="runner-guy">🏃🏽</span>
          <span className="runner-log">🪵</span>
          <p>Jungle Run IRL unlocked. Go play the real one with your whole body.</p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function Contact() {
  const [copied, setCopied] = useState(false)
  return (
    <section id="contact" className="section contact">
      <SectionHead index="08" kicker="say hi" title="Let's build something." />
      <Reveal className="contact-body">
        <p>
          Startups, research, hackathon teammates, or just talking about rare cancers and robots. My inbox is open.
        </p>
        <button
          className="email-big"
          onClick={() => {
            navigator.clipboard?.writeText(profile.email)
            setCopied(true)
            setTimeout(() => setCopied(false), 1800)
          }}
        >
          {profile.email}
          <span className="copy-hint">{copied ? 'copied ✓' : 'click to copy'}</span>
        </button>
        <div className="card-links center">
          <a className="btn btn-primary" href={`mailto:${profile.email}`}>
            Email me
          </a>
          <ExtLink href={profile.links.github}>GitHub</ExtLink>
          <ExtLink href={profile.links.linkedin}>LinkedIn</ExtLink>
          <ExtLink href={profile.links.scholar}>Scholar</ExtLink>
          <ExtLink href={profile.links.resume}>Résumé</ExtLink>
        </div>
        <p className="hint">psst: try typing “rizz” anywhere, or the Konami code.</p>
      </Reveal>
      <footer className="footer">
        <span>© 2026 Sachchit Balamurugan</span>
        <span>Built with React Three Fiber · {profile.location}</span>
      </footer>
    </section>
  )
}
