// Captioned demo of CLARA run locally from its repo: a filer uploads the four synthetic sample documents
// from samples/, the I-130 check runs, and a clerk reviews the queued case. See demo_server.py for what is
// real and what stands in for Supabase, sign-in, and Gemini.
//
// Usage: node clara/clara-demo.mjs <clara.ai checkout> <python with clara's requirements> [out.mp4]
import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { walkthrough, smoothScroll } from '../walkthrough.mjs'

const [claraDir, python, out = '../../public/demos/clara.mp4'] = process.argv.slice(2)
const ORIGIN = 'http://127.0.0.1:8001'
const SAMPLES = ['i130_form', 'birth_certificate', 'passport', 'tax_return'].map((n) => path.join(claraDir, 'samples', `${n}.jpg`))

const server = spawn(python, [path.join(path.dirname(fileURLToPath(import.meta.url)), 'demo_server.py'), claraDir, '8001'], { stdio: 'inherit' })
for (let i = 0; ; i++) {
  try {
    if ((await fetch(`${ORIGIN}/healthz`)).ok) break
  } catch {}
  if (i > 60) throw new Error('demo server did not start')
  await new Promise((r) => setTimeout(r, 500))
}

const scrollTo = (page, selector, offset = 20) =>
  page.locator(selector).first().evaluate((el, offset) => window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - offset, behavior: 'smooth' }), offset)

let caseId = null

try {
  await walkthrough({
    url: `${ORIGIN}/demo/signin/filer`,
    out,
    label: 'CLARA · sample documents',
    viewport: { width: 1600, height: 900 },
    posterAt: 14,
    beats: [
      {
        caption: 'A filer starts a new case for an I-130 spousal petition.',
        seconds: 7,
        act: async (page) => {
          await scrollTo(page, 'form[action="/cases"]', 80)
          await page.waitForTimeout(800)
          await page.locator('#title').click()
          await page.keyboard.type('Petition for my spouse', { delay: 30 })
          await page.locator('#zip_code').click()
          await page.keyboard.type('10007', { delay: 60 })
          await page.waitForTimeout(600)
          await page.locator('form[action="/cases"] button[type="submit"]').click()
          await page.waitForURL(/\/cases\/[0-9a-f]+$/)
          caseId = page.url().split('/').pop()
          await page.waitForTimeout(1000)
        },
      },
      {
        caption: 'Four sample documents go in. Each one is straightened, checked, and read, one stage at a time.',
        seconds: 12,
        act: async (page) => {
          await scrollTo(page, '#file', 160)
          for (const file of SAMPLES) {
            await page.setInputFiles('#file', file)
            await page.locator('form[hx-post$="/documents"] button[type="submit"]').click()
            await page.waitForTimeout(1200)
          }
          await page.waitForFunction(() => document.querySelectorAll('#documents .badge.ok').length === 4, null, { timeout: 120000 })
          await page.waitForTimeout(1000)
        },
      },
      {
        caption: 'Each upload is encrypted and straightened, and names, dates of birth, the A-Number and the passport number become tokens before anything is stored.',
        seconds: 8,
        act: async (page) => {
          await scrollTo(page, '#documents', 90)
          await page.waitForTimeout(3500)
        },
      },
      {
        caption: "The I-130 check catches that the beneficiary's date of birth differs between documents, and that there is no marriage certificate.",
        seconds: 9,
        act: async (page) => {
          await page.locator('button[hx-post$="/review"]').click()
          await page.waitForFunction(() => document.querySelector('#review')?.textContent.includes('must fix'), null, { timeout: 60000 })
          await scrollTo(page, '#review', 90)
          await page.waitForTimeout(4000)
        },
      },
      {
        caption: 'Each finding says what is wrong and what to do about it before filing.',
        seconds: 7,
        act: async (page) => {
          await smoothScroll(page, 260, 20)
          await page.waitForTimeout(3500)
        },
      },
      {
        caption: 'The case goes to a court clerk. Hovering a field outlines where it was read on the page, so the clerk checks it instead of retyping it.',
        seconds: 11,
        act: async (page) => {
          await page.goto(`${ORIGIN}/demo/queue/${caseId}`)
          await page.goto(`${ORIGIN}/demo/signin/clerk`)
          await page.waitForTimeout(1200)
          await page.locator(`a[href="/queue/${caseId}"]`).first().click()
          await page.waitForLoadState('networkidle')
          await scrollTo(page, '.review-split', 70)
          await page.waitForTimeout(1200)
          // The petitioner's rows sit beside the page image, so the outline and the row are both on screen.
          for (const key of ['petitioner_family_name', 'petitioner_dob', 'petitioner_mailing_zip']) {
            await page.locator(`[data-field-key="${key}"]`).first().hover()
            await page.waitForTimeout(1300)
          }
        },
      },
      {
        caption: 'The clerk returns the case to the filer with a note. Nothing is filed with USCIS or EOIR.',
        seconds: 8,
        act: async (page) => {
          await page.mouse.move(10, 10)
          await scrollTo(page, '#note', 260)
          await page.waitForTimeout(800)
          await page.locator('#note').click()
          await page.keyboard.type('Date of birth differs between the petition and the birth certificate. Please add the marriage certificate.', { delay: 12 })
          await page.waitForTimeout(2500)
          await page.locator('form[action$="/return"] button[type="submit"]').click()
          await page.waitForTimeout(1500)
        },
      },
    ],
  })
} finally {
  server.kill()
}
