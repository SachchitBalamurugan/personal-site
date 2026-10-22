import { lazy, Suspense, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { categoryMeta, projects, type Category, type Project } from '../data/projects'
import { ExtLink, Reveal, SectionHead } from './ui'

const ProjectGalaxy = lazy(() => import('../three/ProjectGalaxy'))

function ProjectLinks({ p, onWatch }: { p: Project; onWatch?: () => void }) {
  return (
    <div className="card-links">
      {p.video && onWatch && (
        <button className="btn btn-demo" onClick={onWatch}>
          Watch demo
        </button>
      )}
      {p.live && <ExtLink href={p.live}>{p.live.includes('spaceappschallenge') ? 'NASA page' : 'Live'}</ExtLink>}
      {p.repo && <ExtLink href={p.repo}>GitHub</ExtLink>}
      {p.privateRepo && <span className="badge-private">private repo</span>}
    </div>
  )
}

function ProjectModal({ project, autoPlay, onClose }: { project: Project; autoPlay: boolean; onClose: () => void }) {
  const meta = categoryMeta[project.category]
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <motion.div className="modal-backdrop" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.article
        className="modal"
        data-lenis-prevent
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        style={{ '--accent': meta.color } as React.CSSProperties}
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.92, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20, opacity: 0 }}
        transition={{ type: 'spring', damping: 24, stiffness: 260 }}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <p className="card-meta">
          <span className="dot" /> {meta.label} · {project.year}
          {project.event && <> · {project.event}</>}
        </p>
        <h3 id="modal-title">{project.name}</h3>
        <p className="modal-tagline">{project.tagline}</p>
        {project.video && (
          <figure className="modal-video">
            <video src={project.video.src} poster={project.video.poster} controls muted playsInline autoPlay={autoPlay} preload="metadata" />
            {project.video.caption && <figcaption>{project.video.caption}</figcaption>}
          </figure>
        )}
        <p>{project.description}</p>
        <ul className="tags">
          {project.tech.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <ProjectLinks p={project} />
      </motion.article>
    </motion.div>
  )
}

function canUseWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

export default function Projects() {
  const [selected, setSelected] = useState<Project | null>(null)
  const [autoPlay, setAutoPlay] = useState(false)
  const open = (p: Project, play = false) => {
    setAutoPlay(play)
    setSelected(p)
  }
  const [filter, setFilter] = useState<Category | 'all'>('all')
  const [view, setView] = useState<'galaxy' | 'list'>(() => (window.innerWidth < 700 || !canUseWebGL() ? 'list' : 'galaxy'))
  const shown = filter === 'all' ? projects : projects.filter((p) => p.category === filter)

  return (
    <section id="projects" className="section section-wide">
      <SectionHead index="02" kicker="project galaxy" title="Things I've shipped">
        Every planet is a project. Bigger planets on inner orbits are the ones I'm proudest of. Drag to rotate, or click one to land on it.
      </SectionHead>

      <Reveal className="project-toolbar">
        <div className="chips" role="group" aria-label="Filter by category">
          <button className={filter === 'all' ? 'chip is-active' : 'chip'} onClick={() => setFilter('all')}>
            All · {projects.length}
          </button>
          {(Object.keys(categoryMeta) as Category[]).map((c) => (
            <button
              key={c}
              className={filter === c ? 'chip is-active' : 'chip'}
              style={{ '--accent': categoryMeta[c].color } as React.CSSProperties}
              onClick={() => setFilter(c)}
            >
              <span className="dot" /> {categoryMeta[c].label}
            </button>
          ))}
        </div>
        <div className="view-toggle" role="group" aria-label="View">
          <button className={view === 'galaxy' ? 'is-active' : ''} onClick={() => setView('galaxy')}>
            Galaxy
          </button>
          <button className={view === 'list' ? 'is-active' : ''} onClick={() => setView('list')}>
            List
          </button>
        </div>
      </Reveal>

      {view === 'galaxy' ? (
        <div className="galaxy-frame">
          <Suspense fallback={<div className="galaxy-loading">warming up the star…</div>}>
            <ProjectGalaxy projects={shown} onSelect={(p) => open(p)} />
          </Suspense>
          <div className="galaxy-legend">
            {(Object.keys(categoryMeta) as Category[]).map((c) => (
              <span key={c} style={{ '--accent': categoryMeta[c].color } as React.CSSProperties}>
                <span className="dot" /> {categoryMeta[c].label}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div className={view === 'galaxy' ? 'project-grid featured-only' : 'project-grid'}>
        {(view === 'galaxy' ? shown.filter((p) => p.featured) : shown).map((p, i) => (
          <Reveal key={p.id} delay={(i % 3) * 0.06}>
            <article className="card project-card" style={{ '--accent': categoryMeta[p.category].color } as React.CSSProperties}>
              <p className="card-meta">
                <span className="dot" /> {p.year}
                {p.event && <> · {p.event}</>}
              </p>
              <h3>
                <button className="link-button" onClick={() => open(p)}>
                  {p.name}
                </button>
              </h3>
              <p>{p.tagline}</p>
              <ul className="tags">
                {p.tech.slice(0, 4).map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
              <ProjectLinks p={p} onWatch={() => open(p, true)} />
            </article>
          </Reveal>
        ))}
      </div>

      <AnimatePresence>{selected && <ProjectModal project={selected} autoPlay={autoPlay} onClose={() => setSelected(null)} />}</AnimatePresence>
    </section>
  )
}
