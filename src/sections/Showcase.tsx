import { useCallback, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { featured, spotLabels, type Featured } from '../data/projects'
import { transferSteps } from '../data/transferSteps'
import { Wallpaper } from '../components/Sky'
import { ArrowDown, Avatar, Mark, Wave } from '../components/ui'
import { clamp01, ScrollTrigger, useGSAP } from '../lib/gsap'
import { useClock, useReducedMotion } from '../lib/hooks'
import FschoolMock from './FschoolMock'
import TransferDemo from './TransferDemo'
import { VideoModal } from '../components/VideoModal'

const N = featured.length
/** Project boundaries in viewports, including room to read each terminal step. */
const LEAD = 1.15
const TAIL = 0.45
const STEP_SCREENS = 0.75
const projectStarts = [LEAD]
for (const project of featured) {
  const screens = project.shot.kind === 'transfer' ? transferSteps.length * STEP_SCREENS : 1
  projectStarts.push(projectStarts[projectStarts.length - 1] + screens)
}
const TRACK_SCREENS = projectStarts[N] + TAIL + 1
/** The window is designed at this size and scaled to fit its area. */
const W = 1040
const H = 720
const BAR = 38

type Reveal = {
  highlight: number
  chips: number
  finding: boolean
  people: number
  opportunity: boolean
  intro: boolean
  note: boolean
}

const EMPTY: Reveal = { highlight: -1, chips: 0, finding: false, people: 0, opportunity: false, intro: false, note: false }

/** What the panel shows at progress p through a project (0 to 1). */
function revealAt(p: number): Reveal {
  const step = Math.floor((p - 0.04) / 0.13)
  return {
    highlight: p >= 0.04 && step < 3 ? step : -1,
    chips: [0.1, 0.23, 0.36].filter((t) => p > t).length,
    finding: p > 0.42 && p < 0.56,
    people: [0.54, 0.62].filter((t) => p > t).length,
    opportunity: p > 0.72,
    intro: p > 0.82,
    note: p > 0.86,
  }
}

const TONES = ['lilac', 'ochre', 'slate', 'moss', 'clay'] as const

function windowHeight(f: Featured) {
  if (f.shot.kind === 'transfer') return 690
  if (f.shot.kind !== 'image') return 600
  return Math.max(420, Math.min(H, BAR + (W * f.shot.height) / f.shot.width))
}

function ShotWindow({ f, typed, className, children }: { f: Featured; typed: number; className: string; children?: ReactNode }) {
  const h = windowHeight(f)
  const shot = f.shot
  let body
  if (shot.kind === 'transfer') {
    body = children
  } else if (shot.kind === 'fschool') {
    body = <FschoolMock typed={typed} />
  } else {
    const ch = h - BAR
    const fw = Math.min(W, (ch * shot.width) / shot.height)
    const fh = (fw * shot.height) / shot.width
    body = (
      <div className="win-body" style={{ background: shot.bg }}>
        <div className="shot-frame" style={{ width: fw, height: fh }}>
          <img src={shot.src} alt={shot.alt} width={shot.width} height={shot.height} decoding="async" />
          {shot.spots.map((s, i) => (
            <span
              key={s.label}
              data-spot={i}
              className="spot"
              style={{ left: `${s.x * 100}%`, top: `${s.y * 100}%`, width: `${s.w * 100}%`, height: `${s.h * 100}%` }}
            />
          ))}
        </div>
      </div>
    )
  }
  return (
    <div className={`win ${className}${shot.kind === 'transfer' ? ' win-terminal' : ''}`} style={{ height: h, top: (H - h) / 2 }}>
      <div className="win-bar">
        <span className="lights" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="win-url">{f.label}</span>
      </div>
      {body}
    </div>
  )
}

function Label({ children, hidden = false }: { children: ReactNode; hidden?: boolean }) {
  return <div className={hidden ? 'p-label is-hidden' : 'p-label'}>{children}</div>
}

function Panel({ f, r, typed, visible, transferIndex, part }: {
  f: Featured | null; r: Reveal; typed: number; visible: boolean; transferIndex?: number; part: number
}) {
  const step = transferIndex === undefined ? undefined : transferSteps[transferIndex]
  const now = f ? f.tagline.slice(0, Math.round(f.tagline.length * typed)) : 'Ready. Just keep scrolling.'
  const labels = f ? spotLabels(f, transferIndex) : []
  const visibleChips = step ? part + 1 : r.chips
  return (
    <div className={visible ? 'panel is-on' : 'panel'}>
      <div className="panel-head">
        <Mark small />
        SACHCHIT
        <small>{f ? f.role : 'portfolio'}</small>
      </div>
      <div className="p-group">
        <Label>
          <Wave /> {transferIndex === undefined ? 'Now showing' : `Step ${transferIndex + 1} of ${transferSteps.length} · ${step?.name}`}
        </Label>
        <p className="panel-now" aria-live={step ? 'polite' : undefined}>
          {step?.callouts[part].explanation ?? now}
          {!step && f && typed < 1 && <span className="caret" aria-hidden="true" />}
        </p>
        <div className="chips">
          {labels.map((s, i) => (
            <span key={`${f?.id}-${s}`} className={i < visibleChips ? 'chip is-on' : 'chip'}>
              <i aria-hidden="true" />
              {s}
            </span>
          ))}
        </div>
      </div>
      {!step && r.finding && (
        <div className="finding">
          <span className="spin" aria-hidden="true" />
          Pulling up the details…
        </div>
      )}
      {(!step || r.people > 0) && <div className="p-group">
        <Label hidden={r.people === 0}>Highlights</Label>
        <div className="rows">
          {f?.facts.slice(0, r.people).map((fact, i) => {
            const hot = i === 0 && r.intro
            return (
              <div key={`${f.id}-${fact.title}`} className={hot ? 'row row-in is-intro' : 'row row-in'}>
                <span className="row-badge">{fact.badge}</span>
                <div className="row-text">
                  <b>{fact.title}</b>
                  <span>{fact.sub}</span>
                </div>
                {i === 0 && <span className={hot ? 'row-pill is-hot' : 'row-pill'}>{hot ? 'Shipped' : f.year}</span>}
              </div>
            )
          })}
        </div>
      </div>}
      {f && (step || r.opportunity) && (
        <div className="p-group p-opportunity">
          <Label>Try it</Label>
          <a className="row row-in row-link" href={f.cta.href} target="_blank" rel="noreferrer">
            <span className="opp-icon" aria-hidden="true">
              {f.cta.icon}
            </span>
            <div className="row-text">
              <b>{f.cta.title}</b>
              <span>{f.cta.sub}</span>
            </div>
            <span className="status">{f.cta.badge}</span>
          </a>
        </div>
      )}
    </div>
  )
}

function Note({
  f,
  index,
  shown,
  onNext,
  onWatch,
}: {
  f: Featured | null
  index: number
  shown: boolean
  onNext: () => void
  onWatch: () => void
}) {
  const href = f?.live ?? f?.repo
  return (
    <div className={shown ? 'note is-on' : 'note'} aria-hidden={!shown}>
      <div className="note-head">
        <Mark small />
        <b>Sachchit</b>
        <span>now</span>
      </div>
      {f && (
        <div className="note-body">
          <Avatar initial={f.name[0]} tone={TONES[index % TONES.length]} className="avatar-lg" />
          <div>
            <b>{f.note.title}</b>
            <p>{f.note.body}</p>
          </div>
        </div>
      )}
      <div className="note-actions">
        {f?.video ? (
          <button type="button" tabIndex={shown ? 0 : -1} onClick={onWatch}>
            ▶ Watch demo
          </button>
        ) : (
          <button type="button" tabIndex={shown ? 0 : -1} onClick={onNext}>
            {index < N - 1 ? 'Next project' : 'Keep going'}
          </button>
        )}
        {href && (
          <a href={href} target="_blank" rel="noreferrer" tabIndex={shown ? 0 : -1} className="primary">
            Open ↗
          </a>
        )}
      </div>
    </div>
  )
}

const WifiIcon = () => (
  <svg viewBox="0 0 16 12" width="16" height="12" fill="currentColor" aria-hidden="true">
    <path d="M8 9.6a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Zm0-3.2c1.3 0 2.5.5 3.4 1.3l-1 1A3.4 3.4 0 0 0 8 7.8c-.9 0-1.8.3-2.4.9l-1-1C5.5 6.9 6.7 6.4 8 6.4Zm0-3.2c2.2 0 4.2.8 5.7 2.2l-1 1A6.7 6.7 0 0 0 8 4.6c-1.8 0-3.5.7-4.7 1.8l-1-1C3.8 4 5.8 3.2 8 3.2ZM8 0c3 0 5.8 1.1 7.9 3.1l-1 1A10 10 0 0 0 8 1.4 10 10 0 0 0 1.1 4.1l-1-1A11.4 11.4 0 0 1 8 0Z" />
  </svg>
)

const BatteryIcon = () => (
  <svg viewBox="0 0 26 12" width="26" height="12" fill="none" aria-hidden="true">
    <rect x=".5" y=".5" width="22" height="11" rx="3" stroke="currentColor" opacity=".45" />
    <rect x="2" y="2" width="17" height="8" rx="1.6" fill="currentColor" />
    <path d="M24 4v4c.8-.3 1.3-1 1.3-2s-.5-1.7-1.3-2Z" fill="currentColor" opacity=".45" />
  </svg>
)

export default function Showcase() {
  const section = useRef<HTMLElement>(null)
  const frame = useRef<HTMLDivElement>(null)
  const intro = useRef<HTMLDivElement>(null)
  const overlay = useRef<HTMLDivElement>(null)
  const area = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const highlight = useRef<HTMLDivElement>(null)
  const current = useRef({ index: -1, progress: 0 })
  const [state, setState] = useState({ index: -1, progress: 0 })
  const [prev, setPrev] = useState(-1)
  const [panelOn, setPanelOn] = useState(false)
  const [watching, setWatching] = useState<Featured | null>(null)
  const clock = useClock()
  const reducedMotion = useReducedMotion()

  // Scale the 1040×720 window stage to whatever room the layout leaves it.
  useLayoutEffect(() => {
    const a = area.current
    const s = stage.current
    if (!a || !s) return
    const fit = () => {
      const r = a.getBoundingClientRect()
      if (!r.width) return
      const k = Math.min(r.width / W, r.height / H)
      s.style.transform = `translate(${(r.width - W * k) / 2}px, ${(r.height - H * k) / 2}px) scale(${k})`
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(a)
    return () => ro.disconnect()
  }, [])

  const update = useCallback((i: number) => {
    const vh = window.innerHeight
    const n = clamp01(i / 0.9)
    const l = 1 - n
    const small = window.innerWidth < 860
    if (frame.current) {
      const side = small ? `${12 * l}px` : `${5 * l}vw`
      frame.current.style.clipPath = `inset(${(small ? 5 : 7) * l}vh ${side} round ${(small ? 24 : 32) * l}px)`
    }
    const u = 1 - clamp01((n - 0.2) / 0.5)
    if (intro.current) {
      intro.current.style.opacity = String(u)
      intro.current.style.transform = `translateY(${-(1 - u) * 30}px)`
    }
    const f = clamp01((n - 0.6) / 0.35)
    if (overlay.current) {
      overlay.current.style.opacity = String(f)
      overlay.current.style.pointerEvents = f > 0.5 ? 'auto' : 'none'
    }
    const bottom = section.current?.getBoundingClientRect().bottom ?? 0
    document.documentElement.classList.toggle('immersive', n > 0.55 && bottom > vh * 0.5)
    setPanelOn(n > 0.6)

    let next = { index: -1, progress: 0 }
    if (i >= LEAD) {
      const idx = Math.min(N - 1, projectStarts.findLastIndex(start => start <= i))
      const length = projectStarts[idx + 1] - projectStarts[idx]
      next = { index: idx, progress: Math.round(400 * clamp01((i - projectStarts[idx]) / length)) / 400 }
    }
    const cur = current.current
    if (cur.index !== next.index || cur.progress !== next.progress) {
      if (cur.index !== next.index) setPrev(cur.index)
      current.current = next
      setState(next)
    }
  }, [])

  useGSAP(
    () => {
      const el = section.current
      if (!el) return
      const sync = (trigger: ScrollTrigger) => update((trigger.scroll() - trigger.start) * TRACK_SCREENS / el.offsetHeight)
      const st = ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: sync,
        onRefresh: sync,
      })
      sync(st)
      return () => document.documentElement.classList.remove('immersive')
    },
    { scope: section },
  )

  const active = state.index >= 0 ? featured[state.index] : null
  const position = state.progress * transferSteps.length
  const transferIndex = active?.shot.kind === 'transfer' ? Math.min(Math.floor(position), transferSteps.length - 1) : undefined
  const part = transferIndex !== undefined && position - transferIndex >= 0.4 ? 1 : 0
  const callout = transferIndex === undefined ? undefined : transferSteps[transferIndex].callouts[part]
  const r = active ? revealAt(state.progress) : EMPTY
  const spotKey = callout?.target ?? r.highlight
  const typed = clamp01(state.progress / 0.4)

  // Move the green highlight box onto the current spot of the active window.
  useLayoutEffect(() => {
    const box = highlight.current
    const st = stage.current
    if (!box || !st) return
    const win = st.querySelector<HTMLElement>(`[data-win="${state.index}"]`)
    const spot = win?.querySelector<HTMLElement>(`[data-spot="${spotKey}"]`)
    if (!spot) {
      box.style.opacity = '0'
      return
    }
    const align = () => {
      let left = 0
      let top = 0
      let node: HTMLElement | null = spot
      while (node && node !== st) {
        left += node.offsetLeft
        top += node.offsetTop
        node = node.offsetParent as HTMLElement | null
      }
      const pad = 6
      Object.assign(box.style, {
        left: `${left - pad}px`,
        top: `${top - pad}px`,
        width: `${spot.offsetWidth + pad * 2}px`,
        height: `${spot.offsetHeight + pad * 2}px`,
        opacity: '1',
      })
    }
    align()
    const observer = new ResizeObserver(align)
    observer.observe(spot)
    if (area.current) observer.observe(area.current)
    return () => observer.disconnect()
  }, [state.index, transferIndex, spotKey])

  const jumpTo = (target: number, offset = 0.02) => {
    const el = section.current
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY
    const unit = el.offsetHeight / TRACK_SCREENS
    const y = target >= N ? top + el.offsetHeight - window.innerHeight * 0.4 : top + (projectStarts[target] + offset) * unit
    window.scrollTo({ top: y, behavior: reducedMotion ? 'instant' : 'smooth' })
  }

  const spotLabel = callout?.label ?? (active && r.highlight >= 0 ? spotLabels(active)[r.highlight] : '')

  return (
    <section ref={section} id="work" aria-label="Featured work" className="showcase" style={{ height: `${TRACK_SCREENS * 100}vh` }}>
      {featured.map((f, i) => (
        <span key={f.id} id={f.id} aria-hidden="true" style={{ position: 'absolute', top: `${(projectStarts[i] + 0.02) * 100}vh` }} />
      ))}
      {/* The stage below is visual and scroll-driven; this list carries the same content for screen readers. */}
      <ul className="sr-only">
        {featured.map((f) => (
          <li key={f.id}>
            <h3>{f.name}</h3>
            <p>
              {f.tagline}. {f.blurb} {f.role}, {f.year}.
            </p>
            {f.live && <a href={f.live}>{f.name} website</a>}
            {f.repo && <a href={f.repo}>{f.name} on GitHub</a>}
            {f.video?.kind === 'youtube' && <a href={`https://www.youtube.com/watch?v=${f.video.id}`}>{f.name} demo video</a>}
          </li>
        ))}
      </ul>
      {watching?.video && <VideoModal title={watching.name} video={watching.video} onClose={() => setWatching(null)} />}
      <div className="showcase-sticky">
        <div ref={frame} className="showcase-frame" data-tone={active?.scene === 'dusk' ? 'dark' : 'light'}>
          <div className="walls" aria-hidden="true">
            {(['noon', ...featured.map((f) => f.scene)] as const).map((scene, i) => (
              <div key={`${scene}-${i}`} className={i === state.index + 1 ? 'wall-slot is-on' : 'wall-slot'}>
                <Wallpaper scene={scene} />
              </div>
            ))}
            <div className="wall-shade" />
          </div>

          <div ref={intro} className="showcase-intro">
            <p className="eyebrow">Featured work</p>
            <h2>
              If you only see a few, <em>see these.</em>
            </h2>
            <p className="showcase-intro-sub">Keep scrolling.</p>
            <span className="round-hint bob">
              <ArrowDown />
            </span>
          </div>

          <div ref={overlay} className="showcase-overlay" data-terminal={transferIndex !== undefined || undefined}>
            <div className="menubar" aria-hidden="true">
              <Mark small />
              <b>{active?.name ?? 'Finder'}</b>
              {['File', 'Edit', 'View', 'Window', 'Help'].map((m) => (
                <span key={m} className="menubar-menu">
                  {m}
                </span>
              ))}
              <span className="menubar-right">
                <span className={panelOn ? 'menubar-status is-on' : 'menubar-status'} key={`${state.index}-${r.people > 0}`}>
                  <Mark small />
                  <i className="pulse-dot" />
                </span>
                <WifiIcon />
                <BatteryIcon />
                <span>{clock}</span>
              </span>
            </div>

            <div ref={area} className="stage-area" aria-hidden={active?.shot.kind !== 'transfer'}>
              <div ref={stage} className="stage" style={{ width: W, height: H }}>
                {featured.map((f, i) => (
                  <div key={f.id} data-win={i} aria-hidden={i !== state.index}>
                    <ShotWindow
                      f={f}
                      typed={i === state.index ? typed : 1}
                      className={i === state.index ? 'is-on' : i === prev ? 'is-prev' : 'is-next'}
                    >
                      {i === state.index && transferIndex !== undefined && (
                        <TransferDemo index={transferIndex} progress={position - transferIndex}
                          onSelect={step => jumpTo(i, step * STEP_SCREENS + 0.02)} />
                      )}
                    </ShotWindow>
                  </div>
                ))}
                <div ref={highlight} className="spot-box" data-transfer-spot={callout?.target} aria-hidden="true">
                  <span>{spotLabel}</span>
                </div>
              </div>
            </div>

            <div className="side">
              <Panel f={active} r={r} typed={typed} visible={panelOn} transferIndex={transferIndex} part={part} />
              <Note
                f={active}
                index={Math.max(0, state.index)}
                shown={r.note}
                onNext={() => jumpTo(state.index + 1)}
                onWatch={() => setWatching(active)}
              />
            </div>

            <div className="tabs">
              {featured.map((f, s) => {
                const value = s < state.index ? 1 : s === state.index ? state.progress : 0
                return (
                  <button
                    key={f.id}
                    type="button"
                    className={s === state.index ? 'tab is-on' : 'tab'}
                    onClick={() => jumpTo(s)}
                    aria-label={`Jump to ${f.name}`}
                  >
                    <span className="tab-label">{f.name}</span>
                    <span className="tab-track">
                      <span className="tab-fill" style={{ '--v': value } as CSSProperties} />
                    </span>
                  </button>
                )
              })}
              <button type="button" className="keep-scrolling" onClick={() => jumpTo(state.index + 1)}>
                <ArrowDown className="bob-fast" />
                Keep scrolling
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
