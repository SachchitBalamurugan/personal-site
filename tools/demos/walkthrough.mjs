// Shared recorder for captioned walkthroughs of a site or app.
//
// 1. Headless Chromium drives the real site at 1280x720 while Playwright records the viewport in real time.
//    Each beat logs when it starts, so its caption covers exactly the stretch of footage it describes.
// 2. Each caption is drawn once in Chromium as a transparent PNG. ffmpeg cuts each beat's footage, overlays
//    its caption, and joins the beats into H.264 with +faststart. Nothing in the page itself is changed.
// 3. The poster is a frame taken from the finished video.
import { chromium } from 'playwright'
import { execFileSync } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const W = 1280
const H = 720

export const smoothScroll = async (page, dy, steps = 40, pause = 25) => {
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, dy / steps)
    await page.waitForTimeout(pause)
  }
}

export const scrollToId = async (page, id, offset = 0) => {
  const dy = await page.evaluate(([id, offset]) => document.getElementById(id).getBoundingClientRect().top - offset, [id, offset])
  await smoothScroll(page, dy)
}

/**
 * @param {{ url: string, out: string, label: string, beats: { caption: string, seconds?: number, act: (page) => Promise<void> }[] }} opts
 * `out` is the mp4 path; the poster is written next to it as .jpg. `seconds` is a beat's length in the video.
 * `setup(context)` runs before the page opens, for routes that serve a local app. A `viewport` larger than
 * 1280x720 is recorded scaled down, like a bigger screen.
 */
export async function walkthrough({ url, out, label, beats, setup, launchArgs = [], viewport = { width: W, height: H }, posterAt = 2, crf = 27, lag = 1.5 }) {
  const work = path.join(path.dirname(out), `.${path.basename(out, '.mp4')}-work`)
  rmSync(work, { recursive: true, force: true })
  mkdirSync(work, { recursive: true })

  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM ?? '/opt/pw-browsers/chromium',
    args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', ...launchArgs],
  })
  const ctx = await browser.newContext({ viewport, recordVideo: { dir: work, size: { width: W, height: H } } })
  if (setup) await setup(ctx)
  const t0 = Date.now()
  const page = await ctx.newPage()
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)

  // The recording starts with a blank page and the load; the video starts at the first beat.
  const marks = []
  for (const beat of beats) {
    marks.push({ caption: beat.caption, start: (Date.now() - t0) / 1000 })
    await beat.act(page)
    console.log(`beat ${marks.length}: ${((Date.now() - t0) / 1000 - marks.at(-1).start).toFixed(1)} s  ${beat.caption}`)
  }
  const end = (Date.now() - t0) / 1000
  // The screencast trails the page by a second or two here; let the last beat's frames arrive.
  await page.waitForTimeout((lag + 0.5) * 1000)
  const video = page.video()
  await ctx.close()
  const raw = await video.path()

  // Captions, drawn once each in Chromium as transparent PNGs.
  const cap = await browser.newPage({ viewport: { width: W, height: H } })
  await cap.setContent(`<!doctype html><html><head><style>
    * { box-sizing: border-box; margin: 0 }
    html, body { background: transparent; width: ${W}px; height: ${H}px; overflow: hidden; font-family: Inter, 'Helvetica Neue', Arial, sans-serif }
    .chip { position: absolute; left: 18px; top: 66px; padding: 6px 12px; border-radius: 999px; background: rgba(7,8,13,.72); color: #dfe3f0; font: 500 12px 'JetBrains Mono', 'DejaVu Sans Mono', monospace; letter-spacing: .02em }
    .cap { position: absolute; left: 50%; bottom: 26px; transform: translateX(-50%); width: max-content; max-width: 1060px; padding: 14px 24px; border-radius: 14px; background: rgba(7,8,13,.86); color: #fff; font-size: 23px; line-height: 1.38; text-align: center; box-shadow: 0 6px 24px rgba(0,0,0,.25) }
  </style></head><body><div class="chip"></div><div class="cap"></div></body></html>`)
  for (const [i, m] of marks.entries()) {
    await cap.evaluate(([label, text]) => {
      document.querySelector('.chip').textContent = label
      document.querySelector('.cap').textContent = text
    }, [label, m.caption])
    await cap.screenshot({ path: path.join(work, `cap${i}.png`), omitBackground: true })
  }
  await browser.close()

  // One segment per beat: exactly that beat's footage, time-scaled to the beat's target length (headless
  // Chromium renders on the CPU, so scrolling takes several times longer than it would with a GPU), with
  // that beat's caption on top. Then the segments are joined.
  const list = []
  let total = 0
  for (const [i, m] of marks.entries()) {
    const a = m.start + lag
    const b = (marks[i + 1]?.start ?? end) + lag
    const k = (beats[i].seconds ?? b - a) / (b - a)
    const seg = path.join(work, `seg${i}.mp4`)
    const vf = `[0:v]trim=start=${a.toFixed(3)}:end=${b.toFixed(3)},setpts=(PTS-STARTPTS)*${k.toFixed(4)},fps=30[v];[v][1:v]overlay=0:0`
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', raw, '-i', path.join(work, `cap${i}.png`), '-filter_complex', vf, '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf), '-pix_fmt', 'yuv420p', seg])
    list.push(`file '${path.resolve(seg)}'`)
    total += (b - a) * k
  }
  writeFileSync(path.join(work, 'list.txt'), list.join('\n'))
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', path.join(work, 'list.txt'), '-c', 'copy', '-movflags', '+faststart', out])

  execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', String(posterAt), '-i', out, '-frames:v', '1', '-q:v', '3', out.replace(/\.mp4$/, '.jpg')])
  rmSync(work, { recursive: true, force: true })
  console.log(`wrote ${out} (${total.toFixed(1)} s from ${(end - marks[0].start).toFixed(1)} s of recording)`)
}
