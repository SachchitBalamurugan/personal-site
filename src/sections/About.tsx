import { profile } from '../data/profile'
import { SectionHead } from '../components/ui'

const TINTS = ['lilac', 'sky', 'mint', 'peach'] as const

export default function About() {
  return (
    <section id="about" className="section">
      <SectionHead eyebrow="About" parts={['Why I build', { em: 'what I build.' }]} />
      <div className="about-grid">
        <figure className="about-photo reveal">
          <img src="/headshot.png" alt="Sachchit Balamurugan in a suit, wearing a competition medal" width={296} height={392} />
          <figcaption>
            <i className="live-dot" /> BPA Nationals · 1st, Mobile App
          </figcaption>
        </figure>
        <div className="about-copy">
          <p className="lede reveal">
            My grandfather died of <em>adrenocortical carcinoma</em>, a cancer so rare that most doctors never see a case.
          </p>
          <p className="reveal">
            I didn’t have a lab, so I cold-called researchers around the world until I had enough MRI and transcriptome data
            to train my own models. That work got me to the University of Tokyo to present. It was later published, and
            Forbes, D Magazine, and Spectrum News covered it.
          </p>
          <p className="reveal">
            That’s still how I work. I find a problem that matters to a real person, build the smallest thing that actually
            helps, and ship it. Sometimes it’s a startup with 130K users. Sometimes it’s a hackathon app that runs offline in
            a village with no internet. Sometimes it’s a programming language where <code>yap</code> means print.
          </p>
          <ul className="currently reveal" aria-label="Right now">
            {profile.currently.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="stats">
        {profile.stats.map((s, i) => (
          <div key={s.label} className={`stat tint-${TINTS[i % TINTS.length]} reveal`}>
            <span className="grain" />
            <strong>{s.value}</strong>
            <span>{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
