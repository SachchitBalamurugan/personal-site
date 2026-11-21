import { useState, type CSSProperties } from 'react'
import { projects, type Project } from '../data/projects'
import { profile } from '../data/profile'
import { ExtLink, SectionHead, Wave } from '../components/ui'

function Mini({ kind }: { kind: Project['mini'] }) {
  switch (kind) {
    case 'orbit':
      return (
        <div className="mini mini-orbit">
          <div className="mini-top">
            <span className="live-tag">
              <i />
              LIVE
            </span>
            Call with Dana · Acme
            <Wave />
          </div>
          <p className="mini-label">Say next</p>
          <p className="mini-say">“Totally fair. What would it need to show you in the first 30 days?”</p>
          <div className="mini-meter" style={{ '--v': 0.64 } as CSSProperties}>
            <span>Close probability</span>
            <b>64%</b>
            <i />
          </div>
        </div>
      )
    case 'jungle':
      return (
        <div className="mini mini-jungle">
          <div className="lanes" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <svg className="runner" viewBox="0 0 60 90" aria-hidden="true">
            <g stroke="#2f5d3a" strokeWidth="3.5" strokeLinecap="round" fill="none">
              <path d="M30 26 30 52M30 34 16 44M30 34 46 26M30 52 20 74M30 52 42 70" />
            </g>
            <circle cx="30" cy="16" r="8" fill="#2f5d3a" />
            {[
              [16, 44],
              [46, 26],
              [20, 74],
              [42, 70],
              [30, 52],
              [30, 34],
            ].map(([x, y]) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r="3" fill="#22c55e" />
            ))}
          </svg>
          <span className="log" aria-hidden="true" />
          <span className="mini-tag">33 joints · jump!</span>
        </div>
      )
    case 'guidewire':
      return (
        <div className="mini mini-guide">
          <p className="bubble-a">
            <b>EN</b> This temple was finished in 1102.
          </p>
          <p className="bubble-b">
            <b>ES</b> Este templo se terminó en 1102.
          </p>
          <div className="mini-foot">
            <span className="offline">
              <i /> No internet needed
            </span>
            <span>1.5 GB of local models</span>
          </div>
        </div>
      )
    case 'chela':
      return (
        <div className="mini mini-chela">
          <p className="mini-label">Blinks → Morse</p>
          <div className="morse" aria-label="H E L P in Morse code">
            {'···· · ·−·· ·−−·'.split('').map((c, i) =>
              c === ' ' ? (
                <span key={i} className="gap" />
              ) : (
                <span key={i} className={c === '·' ? 'dot' : 'dash'} style={{ '--k': i } as CSSProperties} />
              ),
            )}
          </div>
          <div className="mini-foot">
            <b className="decoded">HELP</b>
            <span className="sos">SOS</span>
          </div>
        </div>
      )
    case 'brainrot':
      return (
        <div className="mini mini-code">
          <pre>
            <span className="k">rizz</span> aura <span className="k">be</span> <span className="n">0</span>
            {'\n'}
            <span className="k">grind</span> (aura &lt; <span className="n">9000</span>) {'{'}
            {'\n'}
            {'  '}
            <span className="k">rizz</span> aura <span className="k">be</span> aura + <span className="n">1000</span>
            {'\n'}
            {'}'}
            {'\n'}
            <span className="k">yap</span> <span className="s">"over 9000 fr"</span>
          </pre>
          <p className="out">
            &gt; over 9000 fr<span className="caret" aria-hidden="true" />
          </p>
        </div>
      )
  }
}

function ProjectCard({ p, i }: { p: Project; i: number }) {
  const [open, setOpen] = useState(false)
  return (
    <article className={`proj tint-${p.tint} reveal`}>
      <div className="proj-visual">
        <span className="grain" />
        <Mini kind={p.mini} />
      </div>
      <div className="proj-body">
        <p className="proj-meta">
          {String(i + 1).padStart(2, '0')} · {p.year}
          {p.event && <> · {p.event}</>}
        </p>
        <h3>{p.name}</h3>
        <p className="proj-tagline">{p.tagline}</p>
        <div className={open ? 'more is-open' : 'more'}>
          <div>
            <p>{p.description}</p>
            <ul className="tags">
              {p.tech.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="proj-links">
          <button type="button" className="btn btn-ring btn-sm" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            {open ? 'Less' : 'How it works'}
          </button>
          {p.live && (
            <ExtLink href={p.live} className="btn btn-ring btn-sm">
              Live
            </ExtLink>
          )}
          {p.repo && (
            <ExtLink href={p.repo} className="btn btn-ring btn-sm">
              GitHub
            </ExtLink>
          )}
          {p.privateRepo && <span className="badge-private">private repo</span>}
        </div>
      </div>
    </article>
  )
}

/** A made-up but steady-looking contribution grid for the GitHub card. */
const LEVELS = Array.from({ length: 7 * 9 }, (_, k) => [0, 1, 2, 3, 1, 2, 4, 2, 3, 1][(k * 7 + (k % 5) * 3) % 10])

export default function MoreProjects() {
  return (
    <section id="projects" className="section section-wide">
      <SectionHead eyebrow="More projects" parts={['Other things', { em: 'I’ve shipped.' }]} />
      <div className="proj-grid">
        {projects.map((p, i) => (
          <ProjectCard key={p.id} p={p} i={i} />
        ))}
        <a className="proj proj-github tint-paper reveal" href={profile.links.github} target="_blank" rel="noreferrer">
          <div className="proj-visual">
            <span className="grain" />
            <div className="mini mini-gh" aria-hidden="true">
              {LEVELS.map((lvl, k) => (
                <i key={k} className={`l${lvl}`} />
              ))}
            </div>
          </div>
          <div className="proj-body">
            <p className="proj-meta">06 · and more</p>
            <h3>Everything else is on GitHub</h3>
            <p className="proj-tagline">Hackathon builds, research code, and the half-finished stuff too.</p>
            <span className="btn btn-dark btn-sm">
              github.com/SachchitBalamurugan <span aria-hidden="true">↗</span>
            </span>
          </div>
        </a>
      </div>
    </section>
  )
}
