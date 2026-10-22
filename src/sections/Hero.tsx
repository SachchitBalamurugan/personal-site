import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { profile } from '../data/profile'

function useCyclingRole(roles: string[]) {
  const [index, setIndex] = useState(0)
  const [text, setText] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const word = roles[index]
    const done = !deleting && text === word
    const empty = deleting && text === ''
    const delay = done ? 1600 : deleting ? 35 : 70
    const id = setTimeout(() => {
      if (done) setDeleting(true)
      else if (empty) {
        setDeleting(false)
        setIndex((i) => (i + 1) % roles.length)
      } else setText(word.slice(0, text.length + (deleting ? -1 : 1)))
    }, delay)
    return () => clearTimeout(id)
  }, [text, deleting, index, roles])

  return text
}

export default function Hero() {
  const role = useCyclingRole(profile.roles)
  const [first, last] = profile.name.split(' ')

  return (
    <header className="hero" id="top">
      <motion.p className="hero-hello" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        hi, i'm
      </motion.p>
      <h1 className="hero-name">
        {[first, last].map((word, w) => (
          <span key={word} className="hero-line">
            {word.split('').map((ch, i) => (
              <motion.span
                key={i}
                initial={{ y: '110%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 + w * 0.25 + i * 0.035, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                {ch}
              </motion.span>
            ))}
          </span>
        ))}
      </h1>
      <motion.p className="hero-role" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}>
        <span className="hero-role-prefix">&gt;</span> {role}
        <span className="caret" aria-hidden="true" />
      </motion.p>
      <motion.p className="hero-blurb" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3 }}>
        I build AI for real problems, like spotting a rare cancer early, teaching
        students from their own coursework, and giving a voice to people who can only blink.
        I'm studying bioengineering at <strong>UC Berkeley</strong> as a <strong>Regents' and Chancellor's Scholar</strong>,
        and I'm CTO of <strong>FschoolAI</strong>.
      </motion.p>
      <motion.div className="hero-cta" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
        <a className="btn btn-primary" href="#projects">
          Explore the galaxy
        </a>
        <a className="btn" href={profile.links.resume} target="_blank" rel="noreferrer">
          Résumé
        </a>
      </motion.div>
      <div className="scroll-hint" aria-hidden="true">
        <span>scroll to unwind the helix</span>
        <i />
      </div>
    </header>
  )
}
