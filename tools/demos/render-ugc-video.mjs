// Turns the transcript of a real mcp-ugc run (mcp-ugc-run.mjs) into a captioned, terminal-style demo video.
// Every value on screen comes from the logged tool responses; the rendered TikTok plays in the phone frame.
//
// Usage: node render-ugc-video.mjs <transcript.json> <out.mp4>
import { chromium } from 'playwright'
import { spawn, execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const [transcriptPath, outPath] = process.argv.slice(2)
const { tools, steps, render } = JSON.parse(readFileSync(transcriptPath, 'utf8'))
const FPS = 30
const W = 1280
const H = 720

const task = (brief) => brief.split('\n')[0].replace(/^TASK:\s*/, '')
const context = (brief) => JSON.parse(brief.slice(brief.indexOf('CONTEXT:') + 8))
const short = (s, n = 58) => (s.length > n ? s.slice(0, n - 1) + '…' : s)

// What each tool call prints: the call line, then the response, condensed from the real result.
const show = {
  ugc_ingest_context: (r) => [
    `brief: ${short(task(r))}`,
    `read: ${context(r).repo.map((s) => s.source.replace(' (recent commit subjects)', '')).join(', ')}`,
  ],
  ugc_save_brand_profile: (r) => [`saved: ${r.saved}  product: ${r.profile.product_name}`, `one_liner: "${short(r.profile.one_liner, 50)}"`],
  ugc_research_trends: (r) => {
    const w = context(r).where_to_look
    return [`plan: ${w.hashtags.length} hashtag pages, ${w.searches.length} searches`, ...w.searches.slice(0, 2).map((s) => short(s.url.replace('https://www.', ''), 60))]
  },
  ugc_generate_ideas: (r) => [`brief: ${short(task(r))}`],
  ugc_save_ideas: (r) => r.items.map((i) => `item ${i.id}: "${i.title}"  stage: idea`),
  ugc_write_script: (r) => [`brief: ${short(task(r))}`],
  ugc_save_script: (r) => [`stage: scripted  warnings: ${r.warnings.length}`, `filming checklist: ${r.filming_checklist.shots.length} shots`],
  ugc_add_footage: (r) => r.added.map((c) => `clip ${c.id} -> beat ${c.beat}: ${path.basename(c.path)}  ${c.width}x${c.height} ${c.fps}fps ${c.duration.toFixed(1)}s`),
  ugc_plan_edit: (r) => [`status: ${r.status}`, `cuts: ${r.edit.cuts.map((c) => `beat ${c.beat} [${c.in}-${c.out.toFixed(1)}s]`).join('  ')}`],
  ugc_render: (r) => [`${path.basename(r.output_path)}  ${r.probe.width}x${r.probe.height}  ${r.probe.fps}fps  ${r.probe.duration.toFixed(1)}s`, `captions: ${path.basename(r.captions_ass)}, ${path.basename(r.captions_srt)}`],
  ugc_write_post_copy: (r) => [`brief: ${short(task(r))}`],
  ugc_save_post_copy: (r) => [`title: "${r.post.title}"  status: ${r.post.status}`, `hashtags: ${r.post.hashtags.map((h) => '#' + h).join(' ')}`],
  ugc_prepare_post: (r) => [
    `ready: ${r.ready}  mode: ${r.mode}`,
    ...r.checks.map((c) => `${c.ok ? 'ok  ' : 'FAIL'} ${c.check}: ${c.detail}`),
  ],
}

// Arguments as a short JS-like literal; long values are elided.
const lit = (v) => (typeof v === 'string' ? `"${v}"` : v)
const argLine = (s) => {
  const a = { ...s.args }
  const raw = {}
  if (a.profile) raw.profile = `{ product_name: "${a.profile.product_name}", … }`
  if (a.ideas) raw.ideas = `[{ title: "${a.ideas[0].title}", … }]`
  if (a.script) raw.script = `{ beats: [${a.script.beats.length}], … }`
  if (a.clips) raw.clips = `[${a.clips.length} clips]`
  if (a.description) raw.description = '"…"'
  if (a.hashtags) raw.hashtags = `[${a.hashtags.length}]`
  if (a.summary) a.summary = short(a.summary, 30)
  const body = Object.entries(a)
    .map(([k, v]) => `${k}: ${raw[k] ?? lit(v)}`)
    .join(', ')
  return short(body, 68)
}

const STAGE_AFTER = { ugc_save_ideas: 0, ugc_save_script: 1, ugc_add_footage: 2, ugc_render: 3, ugc_save_post_copy: 4 }

// Timeline.
const events = []
let t = 2.2
let renderAt = 0
for (const s of steps) {
  const call = `${s.tool}(${argLine(s)})`
  const typing = Math.min(1.1, call.length / 70)
  const lines = show[s.tool](s.result)
  const wait = s.tool === 'ugc_render' ? 1.6 : 0.35
  events.push({ t, typing, call, wait, lines, ms: s.ms, caption: s.caption, tool: s.tool, stage: STAGE_AFTER[s.tool] })
  if (s.tool === 'ugc_render') renderAt = t + typing + wait
  t += typing + wait + 0.9 + lines.length * 0.12 + (s.tool === 'ugc_prepare_post' ? 2.5 : 0.6)
}
const stopAt = t
const duration = stopAt + 5

const page = await (
  await chromium.launch({ executablePath: process.env.CHROMIUM ?? '/opt/pw-browsers/chromium' })
).newPage({ viewport: { width: W, height: H } })

await page.setContent(`<!doctype html><html><head><style>
  * { box-sizing: border-box; margin: 0 }
  body { width: ${W}px; height: ${H}px; background: #07080d; color: #d7dbe8; font: 15px/1.55 'JetBrains Mono', monospace; overflow: hidden }
  .term { position: absolute; left: 24px; top: 24px; width: 820px; height: 590px; border: 1px solid #22263a; border-radius: 14px; background: #0b0d15; overflow: hidden }
  .bar { height: 34px; display: flex; align-items: center; gap: 8px; padding: 0 14px; border-bottom: 1px solid #1b1e2e; color: #6c7392; font-size: 12px }
  .bar i { width: 11px; height: 11px; border-radius: 50%; background: #23273a; display: inline-block }
  .bar span { margin-left: 10px }
  .out { position: absolute; left: 0; right: 0; top: 35px; bottom: 0; padding: 14px 18px; font-size: 13.5px; white-space: pre; overflow: hidden; display: flex; flex-direction: column; justify-content: flex-end }
  .out > div { min-height: 1.55em }
  .call { color: #e8ebf5 } .call b { color: #3ef0c8; font-weight: 500 } .dim { color: #5d6482 } .res { color: #9aa3c2 } .ok { color: #3ef0c8 } .warn { color: #ffb547 }
  .cursor { display: inline-block; width: 8px; height: 15px; background: #3ef0c8; vertical-align: -2px }
  .side { position: absolute; left: 868px; top: 24px; width: 388px; height: 590px }
  .stages { position: absolute; left: 0; top: 0; width: 92px; font: 500 11px/1 'JetBrains Mono', monospace; color: #3a3f58 }
  .stages div { padding: 9px 0 9px 12px; border-left: 2px solid #1b1e2e; margin-bottom: 4px; text-transform: uppercase; letter-spacing: .06em }
  .stages .on { color: #3ef0c8; border-color: #3ef0c8 }
  .stages .cur { color: #07080d; background: #3ef0c8; border-color: #3ef0c8 }
  .phone { position: absolute; right: 0; top: 0; width: 290px; height: 590px; border: 1px solid #22263a; border-radius: 26px; background: #0b0d15; display: grid; place-items: center; color: #3a3f58; font-size: 12px; text-align: center; padding: 20px }
  .cap { position: absolute; left: 24px; right: 24px; bottom: 26px; height: 60px; display: flex; align-items: center; gap: 18px; font: 500 21px/1.2 Inter, sans-serif; color: #f2f4fa }
  .cap .n { font: 500 13px 'JetBrains Mono', monospace; color: #3ef0c8; border: 1px solid #3ef0c855; border-radius: 999px; padding: 6px 12px; white-space: nowrap }
</style></head><body>
  <div class="term"><div class="bar"><i></i><i></i><i></i><span>claude code  ·  mcp-ugc over stdio  ·  ~/personal-site</span></div><div class="out" id="out"></div></div>
  <div class="side"><div class="stages" id="stages"></div><div class="phone" id="phone"></div></div>
  <div class="cap"><span class="n" id="n"></span><span id="cap"></span></div>
</body></html>`)

await page.evaluate(
  ({ events, tools, renderAt, stopAt }) => {
    const STAGES = ['idea', 'scripted', 'filmed', 'edited', 'captioned', 'scheduled', 'posted']
    const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
    window.renderAt = (t) => {
      const lines = [`<span class="dim">$ claude mcp add ugc -- node mcp-ugc/dist/index.js</span>`, `<span class="dim">connected: ${tools.length} tools</span>`, '']
      let caption = 'mcp-ugc: from a codebase to a TikTok, driven from Claude Code'
      let n = ''
      let stage = -1
      events.forEach((e, i) => {
        if (t < e.t) return
        const typed = Math.min(1, (t - e.t) / e.typing)
        const call = e.call.slice(0, Math.round(e.call.length * typed))
        const name = call.slice(0, e.tool.length)
        const cursor = typed < 1 ? '<span class="cursor"></span>' : ''
        lines.push(`<span class="call"><b>${esc(name)}</b>${esc(call.slice(e.tool.length))}</span>${cursor}`)
        caption = e.caption
        n = `${i + 1} / ${events.length}`
        const done = e.t + e.typing + e.wait
        if (t >= e.t + e.typing && t < done) lines.push(`<span class="dim">  … ${e.tool === 'ugc_render' ? 'ffmpeg rendering' : 'waiting'}</span>`)
        if (t >= done) {
          const shown = Math.floor((t - done) / 0.12) + 1
          e.lines.slice(0, shown).forEach((l) => lines.push(`<span class="${l.startsWith('FAIL') ? 'warn' : l.startsWith('ok') ? 'ok' : 'res'}">  ${esc(l)}</span>`))
          if (shown >= e.lines.length) lines.push(`<span class="dim">  (${e.ms} ms)</span>`)
          if (e.stage !== undefined) stage = e.stage
        }
      })
      if (t >= stopAt) {
        lines.push('', `<span class="warn">STOP: posting needs your explicit confirmation.</span>`, `<span class="dim">next: higgsfield media_upload -> tiktok_prepare_publish (UPLOAD_TO_DRAFT)</span>`)
        caption = 'Nothing posts without you: it stops for confirmation, then goes to TikTok drafts'
        n = 'done'
      }
      document.getElementById('out').innerHTML = lines.map((l) => `<div>${l}</div>`).join('')
      document.getElementById('cap').textContent = caption
      document.getElementById('n').textContent = n || 'mcp-ugc'
      document.getElementById('stages').innerHTML = STAGES.map((s, i) => `<div class="${i === stage ? 'cur' : i < stage ? 'on' : ''}">${s}</div>`).join('')
      document.getElementById('phone').textContent = t < renderAt ? 'final.mp4 appears here after ugc_render' : ''
    }
  },
  { events, tools, renderAt, stopAt },
)

// Pass 1: the terminal, frame by frame.
const tmp = outPath.replace(/\.mp4$/, '.terminal.mp4')
const enc = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-', '-c:v', 'libx264', '-crf', '16', '-pix_fmt', 'yuv420p', tmp], { stdio: ['pipe', 'inherit', 'inherit'] })
const frames = Math.ceil(duration * FPS)
for (let f = 0; f < frames; f++) {
  await page.evaluate((t) => window.renderAt(t), f / FPS)
  const png = await page.screenshot({ type: 'png' })
  if (!enc.stdin.write(png)) await new Promise((r) => enc.stdin.once('drain', r))
}
enc.stdin.end()
await new Promise((r) => enc.on('close', r))
await page.context().browser().close()

// Pass 2: the real rendered TikTok in the phone frame from the moment ugc_render returns, looping.
// 9:16 inside the 290x590 phone frame.
const phone = { x: 868 + 388 - 290 + 8, w: 274 }
phone.y = 24 + Math.round((590 - (phone.w * 16) / 9) / 2)
execFileSync('ffmpeg', [
  '-v', 'error', '-y', '-i', tmp, '-stream_loop', '-1', '-itsoffset', renderAt.toFixed(3), '-i', render.output_path,
  '-filter_complex',
  `[1:v]scale=${phone.w}:-2,format=yuv420p[v];[0:v][v]overlay=${phone.x}:${phone.y}:enable='gte(t,${renderAt.toFixed(3)})':eof_action=pass[o]`,
  '-map', '[o]', '-t', duration.toFixed(2), '-an', '-c:v', 'libx264', '-crf', '24', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', outPath,
])
console.log(`wrote ${outPath} (${duration.toFixed(1)} s, TikTok from ${renderAt.toFixed(1)} s)`)
