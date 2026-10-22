// Feeds per-frame blendshapes through Chela's own BlinkDetector and MorseDecoder, imported from a
// checkout of the private repo (nothing is copied here). Wiring matches src/app/blinkSession.ts:
// default settings (DEFAULT_BLINK, DEFAULT_TIMING, adaptive timing on), detector edges go to
// decoder.close()/open(), and the decoder ticks every ~33 ms.
//
// Usage: npx tsx decode-blinks.ts <blendshapes.json> <chela checkout>/src <timeline.json>
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const [input, chelaSrc, out] = process.argv.slice(2).map((p) => path.resolve(p))
const load = (p: string) => import(pathToFileURL(path.join(chelaSrc, p)).href)
const { BlinkDetector, DEFAULT_BLINK } = await load('gaze/blinkDetector.ts')
const { MorseDecoder, DEFAULT_TIMING, applyEvent } = await load('morse/decoder.ts')
const { previewFor, prettyCode } = await load('morse/table.ts')

type In = { t: number; left: number | null; right: number | null }
const { fps, frames } = JSON.parse(readFileSync(input, 'utf8')) as { fps: number; frames: In[] }

const detector = new BlinkDetector(DEFAULT_BLINK)
const decoder = new MorseDecoder(DEFAULT_TIMING, { adaptive: true })
let text = ''
let spoken: string | null = null
const log: { t: number; kind: string; label: string }[] = []

const describe = (e: any): { kind: string; label: string } | null => {
  switch (e.type) {
    case 'symbol': return { kind: 'symbol', label: `${e.symbol === '.' ? 'dot' : 'dash'}  ${Math.round(e.durationMs)} ms` }
    case 'ignored': return { kind: 'ignored', label: `natural blink ignored  ${Math.round(e.durationMs)} ms` }
    case 'letter': return { kind: 'letter', label: `letter ${e.char}  (${prettyCode(e.code)})` }
    case 'invalid': return { kind: 'invalid', label: `not a letter: ${prettyCode(e.code)}` }
    case 'delete': return { kind: 'delete', label: e.target === 'letter' ? 'long close: deleted last letter' : 'long close: cleared pending' }
    case 'clear': return { kind: 'delete', label: e.reason === 'rapid' ? 'rapid blinks: cancelled letter' : 'cleared' }
    case 'space': return { kind: 'letter', label: 'space' }
    case 'send': return { kind: 'send', label: `SEND: speaks "${text}"` }
    case 'command': return { kind: 'command', label: `command ${e.id}` }
    default: return null
  }
}

const apply = (events: any[], t: number) => {
  for (const e of events) {
    text = applyEvent(text, e)
    if (e.type === 'send') spoken = text
    const d = describe(e)
    if (d) log.push({ t, ...d })
  }
}

const timeline = frames.map((f, i) => {
  const df = f.left === null || f.right === null ? detector.push(null, null, f.t) : detector.push(f.left, f.right, f.t)
  for (const e of df.edges) apply(e.type === 'close' ? decoder.close(e.t) : decoder.open(e.t, e.merged), e.t)
  apply(decoder.tick(f.t), f.t)
  return {
    i,
    t: f.t,
    raw: f.left === null ? null : [f.left, f.right],
    faceFound: df.faceFound,
    signal: df.signal,
    closed: df.closed,
    phase: decoder.phase(f.t),
    buffer: decoder.buffer,
    preview: previewFor(decoder.buffer),
    letterGapMs: decoder.letterGapMs,
    text,
    spoken,
  }
})

writeFileSync(out, JSON.stringify({ fps, blink: DEFAULT_BLINK, timing: DEFAULT_TIMING, timeline, log }))
console.log(log.map((l) => `${(l.t / 1000).toFixed(2).padStart(6)} s  ${l.label}`).join('\n'))
console.log(`transcript: "${text}"${spoken !== null ? `, spoken: "${spoken}"` : ''}`)
