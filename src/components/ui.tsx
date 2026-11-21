import { Fragment, type CSSProperties, type ElementType, type ReactNode } from 'react'
import { useInView } from '../lib/hooks'

/** `after` is punctuation glued to the italic phrase, e.g. a trailing comma. */
export type Part = string | { em: string; mark?: boolean; after?: string } | { br: true }

/**
 * A serif headline whose words blur up into place one by one, with an optional
 * highlighter swipe behind the italic phrase. `auto` plays on mount instead of on scroll.
 */
export function Title({
  as: Tag = 'h2',
  parts,
  className,
  auto = false,
  delay = 0,
  step = 70,
}: {
  as?: ElementType
  parts: Part[]
  className?: string
  auto?: boolean
  delay?: number
  step?: number
}) {
  const [ref, seen] = useInView<HTMLHeadingElement>('top 88%')
  let i = 0
  const nodes: ReactNode[] = []
  parts.forEach((p, pi) => {
    if (typeof p === 'string') {
      p.split(' ')
        .filter(Boolean)
        .forEach((w, wi) => {
          nodes.push(
            <Fragment key={`${pi}-${wi}`}>
              <span className="w" style={{ '--i': i++ } as CSSProperties}>
                {w}
              </span>{' '}
            </Fragment>,
          )
        })
    } else if ('br' in p) {
      nodes.push(<br key={`${pi}-br`} />)
    } else {
      const idx = i++
      nodes.push(
        <Fragment key={`${pi}-em`}>
          <span className={p.mark ? 'w em-wrap has-mark' : 'w em-wrap'} style={{ '--i': idx } as CSSProperties}>
            {p.mark && <span className="mark" aria-hidden="true" />}
            <em>{p.em}</em>
            {p.after}
          </span>{' '}
        </Fragment>,
      )
    }
  })
  return (
    <Tag
      ref={ref}
      className={['title', auto || seen ? 'is-in' : '', className ?? ''].join(' ').trim()}
      style={{ '--d': `${delay}ms`, '--step': `${step}ms` } as CSSProperties}
    >
      {nodes}
    </Tag>
  )
}

/** Section opener: small gray eyebrow, serif title, optional sub line. */
export function SectionHead({ eyebrow, parts, sub, align = 'center' }: { eyebrow: string; parts: Part[]; sub?: ReactNode; align?: 'center' | 'left' }) {
  return (
    <header className={`section-head section-head--${align}`}>
      <p className="eyebrow reveal">{eyebrow}</p>
      <Title parts={parts} />
      {sub && <p className="section-sub reveal">{sub}</p>}
    </header>
  )
}

export type Tone = 'lilac' | 'ochre' | 'moss' | 'clay' | 'slate' | 'sky'

export function Avatar({ initial, tone, className }: { initial: string; tone: Tone; className?: string }) {
  return (
    <span className={`avatar tone-${tone}${className ? ` ${className}` : ''}`} aria-hidden="true">
      {initial}
    </span>
  )
}

export const Orb = ({ small = false }: { small?: boolean }) => <span className={small ? 'orb orb--sm' : 'orb'} aria-hidden="true" />

export const Wave = () => (
  <span className="wave" aria-hidden="true">
    <i />
    <i />
    <i />
    <i />
  </span>
)

export const LiveDot = () => <i className="live-dot" aria-hidden="true" />

export function LivePill({ children }: { children: ReactNode }) {
  return (
    <span className="live-pill">
      <span className="live-tag">
        <i />
        LIVE
      </span>
      {children}
    </span>
  )
}

export function ExtLink({ href, children, className = 'btn btn-glass' }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a className={className} href={href} target="_blank" rel="noreferrer">
      {children}
      <span aria-hidden="true" className="arrow">
        ↗
      </span>
    </a>
  )
}

export const ArrowDown = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M8 3v10M3.5 8.5 8 13l4.5-4.5" />
  </svg>
)
