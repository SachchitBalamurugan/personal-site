import { useState } from 'react'
import { awards, experience } from '../data/profile'
import { SectionHead, Title } from '../components/ui'

export function Experience() {
  const [open, setOpen] = useState(0)
  return (
    <section id="experience" className="section">
      <div className="faq">
        <div className="faq-side">
          <p className="eyebrow reveal">Experience</p>
          <Title parts={['Where I’ve', { em: 'worked.' }]} />
          <p className="section-sub reveal">Internships, research labs, and the things I started myself.</p>
        </div>
        <ul className="faq-list">
          {experience.map((j, i) => {
            const isOpen = open === i
            const id = `job-${i}`
            return (
              <li key={j.org + j.role} className={isOpen ? 'faq-item is-open reveal' : 'faq-item reveal'}>
                <button type="button" aria-expanded={isOpen} aria-controls={id} onClick={() => setOpen(isOpen ? -1 : i)}>
                  <span className="faq-q">
                    {j.role} <span className="at">· {j.org}</span>
                  </span>
                  <span className="faq-when">{j.when}</span>
                  <span className="faq-plus" aria-hidden="true" />
                </button>
                <div className="faq-a" id={id} role="region">
                  <div>
                    <ul>
                      {j.points.map((pt) => (
                        <li key={pt}>{pt}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

const TAG_TONE: Record<string, string> = {
  Hackathon: 'mint',
  NASA: 'sky',
  Research: 'lilac',
  Competition: 'peach',
  Robotics: 'slate',
  Service: 'mint',
  Speaking: 'peach',
  Academics: 'lilac',
  Leadership: 'sky',
  Certification: 'slate',
}

export function Awards() {
  return (
    <section id="awards" className="section section-wide">
      <SectionHead eyebrow="Awards" parts={['The', { em: 'trophy shelf.' }]} />
      <div className="awards-grid">
        {awards.map((a) => (
          <div key={a.title} className={a.detail.length > 120 ? 'award award--wide reveal' : 'award reveal'}>
            <span className={`award-tag tone-${TAG_TONE[a.tag] ?? 'slate'}`}>{a.tag}</span>
            <h3>{a.title}</h3>
            <p>{a.detail}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
