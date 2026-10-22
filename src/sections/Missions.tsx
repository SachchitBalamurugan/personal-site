import { missions } from '../data/profile'
import { ExtLink, Reveal, SectionHead } from './ui'

export default function Missions() {
  return (
    <section id="nasa" className="section">
      <SectionHead index="04" kicker="mission log" title="NASA, twice over" />
      <Reveal className="terminal">
        <div className="terminal-bar">
          <i />
          <i />
          <i />
          <span>~/nasa/mission-log</span>
        </div>
        <ol className="terminal-body">
          {missions.map((m) => (
            <li key={m.title}>
              <p className="t-cmd">
                <span className="t-prompt">$</span> log --year {m.year}
              </p>
              <h3>{m.title}</h3>
              <p>{m.detail}</p>
              <p className="t-badges">
                {m.badges.map((b) => (
                  <span key={b}>[{b}]</span>
                ))}
              </p>
              {m.href && (
                <ExtLink href={m.href} className="text-link">
                  View project on spaceappschallenge.org
                </ExtLink>
              )}
            </li>
          ))}
          <li className="t-cursor">
            <span className="t-prompt">$</span> <span className="caret" />
          </li>
        </ol>
      </Reveal>
    </section>
  )
}
