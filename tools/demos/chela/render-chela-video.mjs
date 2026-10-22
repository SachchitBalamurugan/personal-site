// Composites the webcam take with an overlay of what Chela's detector and decoder did on each frame
// (timeline.json from decode-blinks.ts). The overlay is drawn per frame in headless Chromium and piped
// into ffmpeg; nothing on screen is typed by hand.
//
// Usage: node render-chela-video.mjs <take> <timeline.json> <out.mp4>
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'

const [take, timelinePath, outPath] = process.argv.slice(2)
const data = JSON.parse(readFileSync(timelinePath, 'utf8'))
const { fps, timeline } = data
const W = 1280
const H = 720
const CAM = 860 // webcam column width; the panel takes the rest

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM ?? '/opt/pw-browsers/chromium' })
const page = await browser.newPage({ viewport: { width: W, height: H } })
await page.setContent(`<!doctype html><html><head><style>
  * { box-sizing: border-box; margin: 0 }
  html, body { background: transparent; width: ${W}px; height: ${H}px; overflow: hidden; color: #e8ebf5; font: 15px/1.4 Inter, sans-serif }
  .panel { position: absolute; left: ${CAM}px; top: 0; width: ${W - CAM}px; height: ${H}px; background: #07080d; border-left: 1px solid #23273a; padding: 22px 22px 18px; display: flex; flex-direction: column; gap: 16px }
  .k { font: 500 11px 'JetBrains Mono', monospace; letter-spacing: .08em; text-transform: uppercase; color: #6c7392; margin-bottom: 6px }
  h1 { font: 600 22px Inter, sans-serif } h1 span { color: #3ef0c8 }
  .sub { color: #8189a6; font-size: 12.5px; margin-top: 4px }
  canvas { display: block; border-radius: 10px; background: #0b0d15; border: 1px solid #1b1e2e }
  .meter { position: relative; height: 30px; border-radius: 8px; overflow: hidden; display: flex; font: 500 10px 'JetBrains Mono', monospace; color: #07080d }
  .meter div { display: grid; place-items: center; opacity: .35 }
  .meter .hit { opacity: 1 }
  .needle { position: absolute; top: 0; bottom: 0; width: 3px; background: #fff; box-shadow: 0 0 8px #fff }
  .state { font: 500 13px 'JetBrains Mono', monospace; color: #c9cee0; margin-top: 6px; min-height: 18px }
  .pending { display: flex; align-items: baseline; gap: 14px; min-height: 40px }
  .sym { font: 600 30px 'JetBrains Mono', monospace; letter-spacing: .12em; color: #ffb547 }
  .prev { font: 500 14px 'JetBrains Mono', monospace; color: #8189a6 }
  .text { font: 700 44px 'JetBrains Mono', monospace; letter-spacing: .08em; min-height: 52px; color: #fff }
  .caret { display: inline-block; width: 4px; height: 38px; background: #3ef0c8; vertical-align: -4px; margin-left: 4px }
  .log { font: 12.5px/1.75 'JetBrains Mono', monospace; color: #8189a6; flex: 1; overflow: hidden; display: flex; flex-direction: column; justify-content: flex-end }
  .log .symbol { color: #ffb547 } .log .letter { color: #3ef0c8 } .log .send { color: #fff; font-weight: 700 } .log .ignored { color: #5d6482 } .log .delete, .log .invalid { color: #ff6b6b }
  .chip { position: absolute; left: 20px; top: 20px; padding: 7px 13px; border-radius: 999px; background: rgba(7,8,13,.78); border: 1px solid #23273a; font: 500 12px 'JetBrains Mono', monospace; color: #c9cee0 }
  .eyes { position: absolute; left: 20px; bottom: 20px; padding: 10px 16px; border-radius: 12px; background: rgba(7,8,13,.82); border: 1px solid #23273a; font: 600 20px 'JetBrains Mono', monospace }
  .eyes.closed { border-color: #ffb547; color: #ffb547 }
  .speak { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); left: ${CAM / 2}px; padding: 18px 30px; border-radius: 18px; background: rgba(7,8,13,.88); border: 2px solid #3ef0c8; font: 700 40px Inter, sans-serif; display: none }
  .speak small { display: block; font: 500 13px 'JetBrains Mono', monospace; color: #3ef0c8; margin-bottom: 4px; letter-spacing: .08em }
</style></head><body>
  <div class="chip">real webcam take · Chela's own detector and decoder</div>
  <div class="eyes" id="eyes"></div>
  <div class="speak" id="speak"><small>CHELA SPEAKS</small><span id="spoken"></span></div>
  <div class="panel">
    <div><h1>Chela <span>blink to speech</span></h1><p class="sub">Short close = dot, long close = dash. Natural blinks are ignored.</p></div>
    <div><p class="k">eye-closed signal (both eyes, smoothed)</p><canvas id="plot" width="${(W - CAM - 44) * 2}" height="180" style="width:${W - CAM - 44}px;height:90px"></canvas></div>
    <div><p class="k">closure length</p><div class="meter" id="meter"></div><p class="state" id="state"></p></div>
    <div><p class="k">current letter</p><div class="pending"><span class="sym" id="sym"></span><span class="prev" id="prev"></span></div></div>
    <div><p class="k">typed</p><div class="text"><span id="text"></span><span class="caret"></span></div></div>
    <div class="log" id="log"></div>
  </div>
</body></html>`)

await page.evaluate(({ data }) => {
  const { timeline, log, timing, blink } = data
  const $ = (id) => document.getElementById(id)
  const pretty = (c) => c.replace(/\./g, '·').replace(/-/g, '−')
  const MAX = 3600 // meter range, ms
  const zones = [
    ['ignored', 0, timing.minDotMs, '#3a3f58'],
    ['dot', timing.minDotMs, timing.dotDashBoundaryMs, '#ffb547'],
    ['dash', timing.dotDashBoundaryMs, timing.deleteMs, '#ff8a3d'],
    ['delete', timing.deleteMs, MAX, '#ff6b6b'],
  ]
  window.draw = (i) => {
    const f = timeline[i]
    // Signal plot: last 4 s, with the close/open thresholds.
    const c = $('plot').getContext('2d')
    const w = c.canvas.width
    const h = c.canvas.height
    c.clearRect(0, 0, w, h)
    const span = 120
    const y = (v) => h - 12 - v * (h - 24)
    for (const [v, col] of [[blink.closeThreshold, '#ffb54788'], [blink.openThreshold, '#3ef0c866']]) {
      c.strokeStyle = col; c.setLineDash([8, 8]); c.lineWidth = 2
      c.beginPath(); c.moveTo(0, y(v)); c.lineTo(w, y(v)); c.stroke()
    }
    c.setLineDash([])
    for (let k = Math.max(0, i - span); k <= i; k++) {
      const g = timeline[k]
      if (!g.closed) continue
      const x = ((k - (i - span)) / span) * w
      c.fillStyle = '#ffb54722'; c.fillRect(x, 0, w / span + 1, h)
    }
    c.strokeStyle = '#3ef0c8'; c.lineWidth = 4; c.beginPath()
    for (let k = Math.max(0, i - span); k <= i; k++) {
      const x = ((k - (i - span)) / span) * w
      k === Math.max(0, i - span) ? c.moveTo(x, y(timeline[k].signal)) : c.lineTo(x, y(timeline[k].signal))
    }
    c.stroke()

    // Closure meter.
    const ph = f.phase
    const ms = ph.kind === 'closed' ? ph.ms : 0
    $('meter').innerHTML =
      zones.map(([name, a, b, col]) => `<div class="${ph.kind === 'closed' && ph.as === name ? 'hit' : ''}" style="width:${((b - a) / MAX) * 100}%;background:${col}">${name}</div>`).join('') +
      (ph.kind === 'closed' ? `<span class="needle" style="left:${Math.min(ms, MAX) / MAX * 100}%"></span>` : '')
    $('state').textContent =
      ph.kind === 'closed' ? `closed ${Math.round(ms)} ms -> ${ph.as}`
      : ph.kind === 'letter' ? `open: letter commits in ${(ph.remainingMs / 1000).toFixed(1)} s`
      : f.faceFound ? 'open' : 'no face'
    $('eyes').textContent = !f.faceFound ? 'no face' : f.closed ? `eyes closed  ${Math.round(ms)} ms` : 'eyes open'
    $('eyes').className = f.closed ? 'eyes closed' : 'eyes'

    $('sym').textContent = pretty(f.buffer)
    $('prev').textContent = f.buffer ? `-> ${f.preview}` : ''
    $('text').textContent = f.text
    const recent = log.filter((l) => l.t <= f.t).slice(-9)
    $('log').innerHTML = recent.map((l) => `<div class="${l.kind}">${(l.t / 1000).toFixed(1).padStart(5)} s  ${l.label}</div>`).join('')
    const sent = log.find((l) => l.kind === 'send' && l.t <= f.t)
    $('speak').style.display = sent && f.t - sent.t < 4000 ? 'block' : 'none'
    $('spoken').textContent = f.spoken ?? ''
  }
}, { data })

const ff = spawn('ffmpeg', [
  '-v', 'error', '-y',
  '-i', take,
  '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-',
  '-filter_complex',
  `[0:v]fps=${fps},scale=${CAM}:${H}:force_original_aspect_ratio=increase,crop=${CAM}:${H},hflip,pad=${W}:${H}:0:0:black[cam];[cam][1:v]overlay=0:0:shortest=1,format=yuv420p[o]`,
  '-map', '[o]', '-an', '-c:v', 'libx264', '-crf', '25', '-preset', 'slow', '-movflags', '+faststart', outPath,
], { stdio: ['pipe', 'inherit', 'inherit'] })

for (let i = 0; i < timeline.length; i++) {
  await page.evaluate((i) => window.draw(i), i)
  const png = await page.screenshot({ type: 'png', omitBackground: true })
  if (!ff.stdin.write(png)) await new Promise((r) => ff.stdin.once('drain', r))
}
ff.stdin.end()
await new Promise((r) => ff.on('close', r))
await browser.close()
console.log(`wrote ${outPath} (${(timeline.length / fps).toFixed(1)} s)`)
