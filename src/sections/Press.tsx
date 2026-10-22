import { press } from '../data/profile'
import { Reveal, SectionHead } from './ui'

export default function Press() {
  const items = press.filter((p) => !p.todo && p.href)
  const outlets = [...new Set(press.map((p) => p.outlet))]

  return (
    <section id="press" className="section section-wide">
      <SectionHead index="05" kicker="in the press" title="People wrote about it" />
      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[...outlets, ...outlets].map((o, i) => (
            <span key={i}>{o}</span>
          ))}
        </div>
      </div>
      <div className="press-grid">
        {items.map((p, i) => (
          <Reveal key={p.href} delay={(i % 3) * 0.06}>
            <a className="card press-card" href={p.href} target="_blank" rel="noreferrer">
              <p className="press-outlet">{p.outlet}</p>
              <h3>{p.headline}</h3>
              <p className="card-meta">
                {p.date} <span aria-hidden="true">↗</span>
              </p>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
