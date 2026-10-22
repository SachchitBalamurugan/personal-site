// Runs MediaPipe FaceLandmarker on every frame of a webcam take, the way Chela's BlinkTracker does
// (same model, VIDEO running mode, one face, blendshapes on), and saves eyeBlinkLeft/Right per frame.
//
// Usage: node extract-blinks.mjs <take.webm|mp4> <out-dir>
// Writes <out-dir>/frames/*.jpg (30 fps, constant frame rate) and <out-dir>/blendshapes.json.
import { chromium } from 'playwright'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const FPS = 30
const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'
const here = path.dirname(fileURLToPath(import.meta.url))
const [take, outDir] = process.argv.slice(2).map((p) => path.resolve(p))

const frameDir = path.join(outDir, 'frames')
rmSync(frameDir, { recursive: true, force: true })
mkdirSync(frameDir, { recursive: true })
execFileSync('ffmpeg', ['-v', 'error', '-i', take, '-vf', `fps=${FPS}`, '-q:v', '2', path.join(frameDir, '%05d.jpg')])
const frames = readdirSync(frameDir).filter((f) => f.endsWith('.jpg')).sort()
console.log(`${frames.length} frames at ${FPS} fps`)

const model = path.join(here, '.cache/face_landmarker.task')
if (!existsSync(model)) {
  mkdirSync(path.dirname(model), { recursive: true })
  const res = await fetch(MODEL_URL)
  if (!res.ok) throw new Error(`model download failed: ${res.status}`)
  writeFileSync(model, Buffer.from(await res.arrayBuffer()))
}

const vision = path.dirname(createRequire(import.meta.url).resolve('@mediapipe/tasks-vision'))
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM ?? '/opt/pw-browsers/chromium' })
const page = await browser.newPage()
page.on('console', (m) => m.type() === 'error' && console.error(m.text()))

// Serve everything from a fake origin so the page needs no network.
const ORIGIN = 'http://chela.local'
const types = { '.mjs': 'text/javascript', '.js': 'text/javascript', '.wasm': 'application/wasm', '.jpg': 'image/jpeg', '.html': 'text/html' }
await page.route(`${ORIGIN}/**`, (route) => {
  const p = new URL(route.request().url()).pathname
  const file =
    p === '/' ? null
    : p === '/model.task' ? model
    : p.startsWith('/frames/') ? path.join(frameDir, path.basename(p))
    : path.join(vision, p)
  if (!file) return route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>extract</title>' })
  route.fulfill({ contentType: types[path.extname(file)] ?? 'application/octet-stream', body: readFileSync(file) })
})
await page.goto(`${ORIGIN}/`)

const scores = await page.evaluate(
  async ({ n, fps }) => {
    const { FaceLandmarker, FilesetResolver } = await import('/vision_bundle.mjs')
    const fileset = await FilesetResolver.forVisionTasks('/wasm')
    const lm = await FaceLandmarker.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: '/model.task', delegate: 'CPU' },
      runningMode: 'VIDEO',
      numFaces: 1,
      outputFaceBlendshapes: true,
    })
    const out = []
    for (let i = 0; i < n; i++) {
      const blob = await (await fetch(`/frames/${String(i + 1).padStart(5, '0')}.jpg`)).blob()
      const bmp = await createImageBitmap(blob)
      const t = (i * 1000) / fps
      const cats = lm.detectForVideo(bmp, t).faceBlendshapes?.[0]?.categories
      bmp.close()
      if (!cats) out.push({ t, left: null, right: null })
      else {
        const s = Object.fromEntries(cats.map((c) => [c.categoryName, c.score]))
        out.push({ t, left: s.eyeBlinkLeft ?? 0, right: s.eyeBlinkRight ?? 0 })
      }
    }
    return out
  },
  { n: frames.length, fps: FPS },
)
await browser.close()

writeFileSync(path.join(outDir, 'blendshapes.json'), JSON.stringify({ fps: FPS, frames: scores }))
const found = scores.filter((s) => s.left !== null).length
console.log(`face found in ${found}/${scores.length} frames -> ${path.join(outDir, 'blendshapes.json')}`)
