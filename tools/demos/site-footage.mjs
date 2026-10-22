// Records vertical (540x960) footage of this site running locally, for the mcp-ugc demo run.
// Usage: node site-footage.mjs <base-url> <out-dir>
//
// Headless Chromium renders WebGL on the CPU, so the scripted actions run several times slower
// than on a real machine. Each clip is time-scaled back to the length the actions take with a GPU.
import { chromium } from 'playwright'
import { execFileSync } from 'node:child_process'
import { mkdirSync, rmSync } from 'node:fs'
import path from 'node:path'

const [base = 'http://localhost:4173', out = 'out/footage'] = process.argv.slice(2)
mkdirSync(out, { recursive: true })

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM ?? '/opt/pw-browsers/chromium',
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
})

async function clip(name, seconds, act) {
  const size = { width: 540, height: 960 }
  const ctx = await browser.newContext({ viewport: size, recordVideo: { dir: out, size } })
  const t0 = Date.now()
  const page = await ctx.newPage()
  await page.goto(base, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  // The recording starts with the page load; keep only the scripted part.
  const start = (Date.now() - t0) / 1000
  await act(page)
  const took = (Date.now() - t0) / 1000 - start
  const video = page.video()
  await ctx.close()
  const raw = await video.path()
  const vf = `setpts=PTS*${(seconds / took).toFixed(4)},fps=30`
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', String(start), '-i', raw, '-an', '-vf', vf, '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p', path.join(out, `${name}.mp4`)])
  rmSync(raw)
  console.log(`recorded ${name}: ${took.toFixed(1)} s of actions -> ${seconds} s`)
}

const wheel = async (page, dy, steps = 20) => {
  for (let i = 0; i < steps; i++) await page.mouse.wheel(0, dy / steps)
}

// Beat 1: the hero and the helix.
await clip('hero', 5, async (page) => {
  await page.mouse.move(270, 450)
  await page.waitForTimeout(2500)
  await wheel(page, 900, 30)
  await page.waitForTimeout(1200)
})

// Beat 2: the project list, opening one project.
await clip('projects', 5, async (page) => {
  await page.locator('#projects').scrollIntoViewIfNeeded()
  await page.waitForTimeout(1200)
  await wheel(page, 500, 20)
  await page.locator('.project-card .link-button').first().click()
  await page.waitForTimeout(2500)
})

// Beat 3: press and contact.
await clip('contact', 4, async (page) => {
  await page.locator('#contact').scrollIntoViewIfNeeded()
  await page.waitForTimeout(800)
  await wheel(page, -700, 25)
  await page.waitForTimeout(1500)
})

await browser.close()
