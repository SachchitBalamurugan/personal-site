import { press } from '../data/profile'
import { SectionHead } from '../components/ui'

export default function Press() {
  const items = press.filter((p) => !p.todo && p.href)
  return (
    <section id="press" className="section">
      <SectionHead eyebrow="Press" parts={['People', { em: 'wrote about it.' }]} />
      <ul className="press-list">
        {items.map((p) => (
          <li key={p.href} className="reveal">
            <a href={p.href} target="_blank" rel="noreferrer">
              <span className="press-outlet">{p.outlet}</span>
              <span className="press-headline">{p.headline}</span>
              <span className="press-date">{p.date}</span>
              <span className="press-arrow" aria-hidden="true">
                ↗
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
