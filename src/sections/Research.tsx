import { ongoingResearch, profile, publications } from '../data/profile'
import { SectionHead } from '../components/ui'

const SHORT = ['IYRC 2025 · Tokyo', 'JRHS 2024']
const TINTS = ['lilac', 'sky'] as const

export default function Research() {
  return (
    <section id="research" className="section section-wide">
      <SectionHead
        eyebrow="Research"
        parts={['Published, peer-reviewed,', { em: 'presented in Tokyo.' }]}
        sub="Two papers so far: one on finding a rare cancer early, and one on who gets to be good at tennis."
      />
      <div className="paper-grid">
        {publications.map((p, i) => (
          <article key={p.title} className={`paper-card tint-${TINTS[i]} reveal`}>
            <span className="grain" />
            <header>
              <h3>{SHORT[i]}</h3>
              <p>{p.venue}</p>
            </header>
            <div className="sheets">
              <div className="sheet sheet-back">
                <span className="sheet-label">Paper</span>
                <p className="sheet-title">{p.title}</p>
                <p className="sheet-authors">{p.authors}</p>
              </div>
              <a className="sheet sheet-front" href={p.links[0].href} target="_blank" rel="noreferrer">
                <span className="sheet-label">Read it</span>
                <span className="sheet-link">
                  <i aria-hidden="true">✓</i> {p.links[0].label} <span aria-hidden="true">↗</span>
                </span>
              </a>
            </div>
            <p className="paper-note">{p.note}</p>
          </article>
        ))}
        <article className="paper-card tint-mint reveal">
          <span className="grain" />
          <header>
            <h3>Also in the lab</h3>
            <p>Ongoing work, not published yet</p>
          </header>
          <div className="sheets">
            <div className="sheet sheet-list">
              <span className="sheet-label">Labs</span>
              {ongoingResearch.map((r) => (
                <div key={r.org} className="lab">
                  <i aria-hidden="true">✓</i>
                  <div>
                    <b>{r.org}</b>
                    <span>{r.what}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <a className="btn btn-ring btn-sm paper-scholar" href={profile.links.scholar} target="_blank" rel="noreferrer">
            Google Scholar <span aria-hidden="true">↗</span>
          </a>
        </article>
      </div>
    </section>
  )
}
