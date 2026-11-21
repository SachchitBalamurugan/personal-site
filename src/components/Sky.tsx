import { useId, type CSSProperties } from 'react'
import type { Scene } from '../data/projects'

type Ellipse = [cx: number, cy: number, rx: number, ry: number]

const SHAPES: Record<'puff' | 'long' | 'tall', Ellipse[]> = {
  puff: [
    [110, 128, 74, 46],
    [180, 98, 84, 64],
    [262, 112, 80, 54],
    [326, 138, 56, 36],
    [150, 150, 104, 34],
    [246, 152, 118, 34],
  ],
  long: [
    [70, 124, 60, 30],
    [140, 108, 74, 44],
    [220, 98, 86, 52],
    [300, 110, 70, 42],
    [370, 128, 52, 28],
    [220, 138, 172, 26],
  ],
  tall: [
    [120, 142, 70, 44],
    [186, 98, 72, 70],
    [242, 62, 54, 50],
    [284, 112, 76, 56],
    [200, 152, 124, 32],
  ],
}

export type CloudShape = keyof typeof SHAPES

/**
 * A painted cloud: a cluster of ellipses pushed around by fractal noise, with a tinted
 * underside so it reads as volume. Pure SVG, no image files.
 */
export function Cloud({
  shape = 'puff',
  seed = 3,
  tint = '#9fb4d4',
  className,
  style,
}: {
  shape?: CloudShape
  seed?: number
  tint?: string
  className?: string
  style?: CSSProperties
}) {
  const id = `c${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const pts = SHAPES[shape]
  return (
    <svg className={className ? `cloud ${className}` : 'cloud'} style={style} viewBox="0 0 420 200" aria-hidden="true">
      <defs>
        <filter id={id} x="-25%" y="-45%" width="150%" height="190%">
          <feTurbulence type="fractalNoise" baseFrequency="0.014" numOctaves="4" seed={seed} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="62" xChannelSelector="R" yChannelSelector="G" result="d" />
          <feGaussianBlur in="d" stdDeviation="4.5" />
        </filter>
        <filter id={`${id}s`} x="-25%" y="-45%" width="150%" height="190%">
          <feTurbulence type="fractalNoise" baseFrequency="0.011" numOctaves="3" seed={seed + 7} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="54" xChannelSelector="R" yChannelSelector="G" result="d" />
          <feGaussianBlur in="d" stdDeviation="10" />
        </filter>
      </defs>
      <g filter={`url(#${id}s)`} fill={tint} opacity="0.62">
        {pts.map(([cx, cy, rx, ry], i) => (
          <ellipse key={i} cx={cx + 6} cy={cy + 18} rx={rx} ry={ry * 0.9} />
        ))}
      </g>
      <g filter={`url(#${id})`} fill="#fff">
        {pts.map(([cx, cy, rx, ry], i) => (
          <ellipse key={i} cx={cx} cy={cy - 2} rx={rx} ry={ry} />
        ))}
      </g>
      <g filter={`url(#${id})`} fill="#fff" opacity="0.9">
        {pts.slice(0, 3).map(([cx, cy, rx, ry], i) => (
          <ellipse key={i} cx={cx - 8} cy={cy - 14} rx={rx * 0.6} ry={ry * 0.55} />
        ))}
      </g>
    </svg>
  )
}

interface CloudSpec {
  shape: CloudShape
  seed: number
  style: CSSProperties
}

const at = (left: string, top: string, width: string): CSSProperties => ({ left, top, width })

const SCENE_CLOUDS: Record<Scene, { tint: string; clouds: CloudSpec[] }> = {
  noon: {
    tint: '#8eaad3',
    clouds: [
      { shape: 'puff', seed: 2, style: at('-8%', '50%', '36vw') },
      { shape: 'long', seed: 5, style: at('18%', '74%', '32vw') },
      { shape: 'tall', seed: 8, style: at('74%', '4%', '32vw') },
      { shape: 'puff', seed: 11, style: at('68%', '56%', '30vw') },
      { shape: 'long', seed: 14, style: at('36%', '86%', '46vw') },
    ],
  },
  lilac: {
    tint: '#a597d6',
    clouds: [
      { shape: 'long', seed: 21, style: at('-6%', '64%', '40vw') },
      { shape: 'puff', seed: 24, style: at('70%', '10%', '30vw') },
      { shape: 'tall', seed: 27, style: at('62%', '68%', '34vw') },
    ],
  },
  gold: {
    tint: '#d69a62',
    clouds: [
      { shape: 'puff', seed: 31, style: at('-4%', '12%', '30vw') },
      { shape: 'long', seed: 34, style: at('54%', '72%', '44vw') },
      { shape: 'puff', seed: 37, style: at('8%', '76%', '28vw') },
    ],
  },
  dusk: {
    tint: '#6f5f9e',
    clouds: [
      { shape: 'long', seed: 41, style: at('-10%', '70%', '46vw') },
      { shape: 'long', seed: 44, style: at('58%', '80%', '50vw') },
    ],
  },
  grove: { tint: '#6e9c7c', clouds: [] },
  dawn: {
    tint: '#df9f82',
    clouds: [
      { shape: 'puff', seed: 51, style: at('70%', '6%', '30vw') },
      { shape: 'long', seed: 54, style: at('-6%', '60%', '40vw') },
      { shape: 'tall', seed: 57, style: at('64%', '64%', '32vw') },
    ],
  },
}

/** A full-bleed painted wallpaper: gradient sky, clouds, scene props and grain. */
export function Wallpaper({ scene, bob = true }: { scene: Scene; bob?: boolean }) {
  const { tint, clouds } = SCENE_CLOUDS[scene]
  return (
    <div className={`wall wall--${scene}`} aria-hidden="true">
      {scene === 'dusk' && <span className="wall-eclipse" />}
      {scene === 'grove' && (
        <>
          <span className="leaf leaf--a" />
          <span className="leaf leaf--b" />
          <span className="leaf leaf--c" />
          <span className="leaf leaf--d" />
        </>
      )}
      {clouds.map((c, i) => (
        <div key={i} className={bob ? 'cloud-pos bob' : 'cloud-pos'} style={{ ...c.style, animationDelay: `${-i * 1.3}s` }}>
          <Cloud shape={c.shape} seed={c.seed} tint={tint} />
        </div>
      ))}
      <span className="grain" />
    </div>
  )
}
