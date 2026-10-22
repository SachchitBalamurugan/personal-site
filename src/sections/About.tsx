import { profile } from '../data/profile'
import { Reveal, SectionHead } from './ui'

export default function About() {
  return (
    <section id="about" className="section">
      <SectionHead index="01" kicker="origin story" title="Why I build what I build" />
      <div className="about-grid">
        <Reveal className="about-photo">
          <img src="/headshot.png" alt="Sachchit Balamurugan in a suit, wearing a competition medal" width={296} height={392} />
          <span className="photo-tag">BPA Nationals · 1st, Mobile App</span>
        </Reveal>
        <Reveal delay={0.1} className="about-copy">
          <p className="lede">
            My grandfather died of <em>adrenocortical carcinoma</em>, a cancer so rare that most doctors never see a case.
          </p>
          <p>
            I didn't have a lab, so I cold-called researchers around the world until I had enough MRI and transcriptome data to
            train my own models. That work got me to the University of Tokyo to present. It was later published, and
            Forbes, D Magazine, and Spectrum News covered it.
          </p>
          <p>
            That's still how I work. I find a problem that matters to a real person, build the smallest thing that actually
            helps, and ship it. Sometimes it's a startup with 130K users. Sometimes it's a hackathon app that runs
            offline in a village with no internet. Sometimes it's a programming language where <code>yap</code> means print.
          </p>
          <ul className="currently">
            {profile.currently.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </Reveal>
      </div>
      <div className="stats">
        {profile.stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.08} className="stat">
            <strong>{s.value}</strong>
            <span>{s.label}</span>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
