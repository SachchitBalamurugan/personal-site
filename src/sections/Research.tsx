import { ongoingResearch, profile, publications } from '../data/profile'
import { ExtLink, Reveal, SectionHead } from './ui'

export default function Research() {
  return (
    <section id="research" className="section">
      <SectionHead index="03" kicker="research" title="Published, peer-reviewed, presented in Tokyo">
        Two papers so far: one on finding a rare cancer early, and one on who gets to be good at tennis.
      </SectionHead>
      <div className="papers">
        {publications.map((p, i) => (
          <Reveal key={p.title} delay={i * 0.1}>
            <article className="paper">
              <div className="paper-spine">
                <span>{p.year}</span>
                <span>{p.venue.includes('IYRC') ? 'IYRC' : 'JRHS'}</span>
              </div>
              <div className="paper-body">
                <p className="card-meta">{p.venue}</p>
                <h3>{p.title}</h3>
                <p className="paper-authors">{p.authors}</p>
                <p>{p.note}</p>
                <div className="card-links">
                  {p.links.map((l) => (
                    <ExtLink key={l.href} href={l.href}>
                      {l.label}
                    </ExtLink>
                  ))}
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
      <Reveal className="ongoing">
        <h3>Also in the lab</h3>
        <dl>
          {ongoingResearch.map((r) => (
            <div key={r.org}>
              <dt>{r.org}</dt>
              <dd>{r.what}</dd>
            </div>
          ))}
        </dl>
        <ExtLink href={profile.links.scholar} className="text-link">
          Google Scholar profile
        </ExtLink>
      </Reveal>
    </section>
  )
}
