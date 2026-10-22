import { awards, experience } from '../data/profile'
import { Reveal, SectionHead } from './ui'

export function Experience() {
  return (
    <section id="experience" className="section">
      <SectionHead index="06" kicker="experience" title="Where I've worked" />
      <ol className="timeline">
        {experience.map((j, i) => (
          <li className="timeline-item" key={j.org + j.role}>
            <span className="timeline-node" aria-hidden="true" />
            <Reveal delay={0.03 * i}>
              <p className="timeline-when">{j.when}</p>
              <h3>
                {j.role} <span className="at">@ {j.org}</span>
              </h3>
              <ul>
                {j.points.map((pt) => (
                  <li key={pt}>{pt}</li>
                ))}
              </ul>
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  )
}

export function Awards() {
  return (
    <section id="awards" className="section section-wide">
      <SectionHead index="07" kicker="trophy shelf" title="Awards & honors" />
      <div className="awards-grid">
        {awards.map((a, i) => (
          <Reveal key={a.title} delay={(i % 4) * 0.05}>
            <div className="award">
              <span className="award-icon" aria-hidden="true">
                {a.icon}
              </span>
              <h3>{a.title}</h3>
              <p>{a.detail}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
