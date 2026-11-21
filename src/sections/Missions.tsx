import { useEffect, useState } from 'react'
import { missions } from '../data/profile'
import { Wallpaper } from '../components/Sky'
import { ExtLink, Mark, Title, Wave } from '../components/ui'

/** Newest entry slides in on top every 3.2s, like a live feed. */
function useFeed() {
  const [feed, setFeed] = useState(() => missions.map((m, i) => ({ ...m, id: i })).reverse())
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let n = missions.length
    const id = window.setInterval(() => {
      const next = { ...missions[n % missions.length], id: n }
      n++
      setFeed((f) => [next, ...f].slice(0, 3))
    }, 3200)
    return () => window.clearInterval(id)
  }, [])
  return feed
}

export default function Missions() {
  const feed = useFeed()
  const links = missions.filter((m) => m.href)
  return (
    <section id="nasa" className="section section-wide">
      <div className="band tint-lilac reveal">
        <span className="grain" />
        <div className="band-copy">
          <span className="label-pill">
            <Wave /> Mission log
          </span>
          <Title as="h3" parts={['NASA Space Apps,', { em: 'twice.' }]} />
          <p>
            People’s Choice in 2024 for an AR climate app. Global Nominee again in 2025, in the top 940 of 15,000 teams. In
            between, NASA’s Texas High School Aerospace Scholars and the Moonshot summer intensive.
          </p>
          <div className="band-links">
            {links.map((m) => (
              <ExtLink key={m.title} href={m.href!} className="btn btn-glass btn-sm">
                {m.year} project
              </ExtLink>
            ))}
          </div>
        </div>
        <div className="desk" aria-hidden="true">
          <Wallpaper scene="dusk" bob={false} />
          <div className="desk-bar">
            <Mark small />
            <b>Mission log</b>
            <span>~/nasa</span>
          </div>
          <div className="desk-win">
            <p className="desk-title">
              <Wave /> Logged entries
            </p>
            {feed.map((m, i) => (
              <div key={m.id} className={i === 0 ? 'feed-row row-in is-new' : 'feed-row'}>
                <span className="feed-year">{m.year.replace('–', '-')}</span>
                <div>
                  <b>{m.title}</b>
                  <span>{m.badges.join(' · ')}</span>
                </div>
                <span className="status">{i === 0 ? 'new' : 'logged'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
