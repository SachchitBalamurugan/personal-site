// Captioned demo of Orbit's teleprompter during a simulated sales call.
//
// The page is Orbit's real front end (static/ from a checkout of the private orbit.ai repo), unchanged.
// Around it: sign-in is stubbed with a demo user, the REST calls get the responses simulate_call.py built
// from Orbit's own route code, and the call WebSocket replays the frames Orbit's backend sent during that
// simulated call. The buyer transcript and the coach lines are scripted; see simulate_call.py.
//
// Usage: node orbit/orbit-call-demo.mjs <orbit.ai checkout> <frames.json> [out.mp4]
import { readFileSync } from 'node:fs'
import { createServer } from 'node:http'
import path from 'node:path'
import { walkthrough, smoothScroll } from '../walkthrough.mjs'

const [orbitDir, framesPath, out = '../../public/demos/orbit.mp4'] = process.argv.slice(2)
const { api, frames } = JSON.parse(readFileSync(framesPath, 'utf8'))
// localhost so the page is a secure context and can open the (fake) microphone. The routes below answer
// every request except the audio worklet's, which the small server further down handles.
const ORIGIN = 'http://localhost:8000'
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png' }

const FIREBASE_STUB = `
const user = { uid: 'demo', email: 'demo@example.com' };
export async function initFirebase() {}
export async function getAuthInstance() { return { currentUser: user }; }
export async function onAuthChange(callback) { callback(user); return () => {}; }
export async function getIdToken() { return 'demo-token'; }
export async function waitForAuthReady() { return user; }
export async function signIn() { return user; }
export async function signUp() { return user; }
export async function signOut() {}
`

let socket = null
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Sends one beat's frames, spaced out in proportion to the simulated call's clock.
async function replay(beat) {
  for (const { frame } of frames.filter((f) => f.beat === beat)) {
    socket.send(JSON.stringify(frame))
    await sleep(frame.type === 'transcript' && frame.entry.partial ? 450 : frame.type === 'analytics' ? 120 : 1300)
  }
}

function serveFile(file) {
  return { contentType: TYPES[path.extname(file)] ?? 'application/octet-stream', body: readFileSync(path.join(orbitDir, file)) }
}

// Requests from an AudioWorklet bypass Playwright's routes, so the static files are also served for real.
const server = createServer((req, res) => {
  try {
    const file = new URL(req.url, ORIGIN).pathname.slice(1)
    if (!file.startsWith('static/') || file.includes('..')) throw new Error('not served')
    const { contentType, body } = serveFile(file)
    res.writeHead(200, { 'Content-Type': contentType }).end(body)
  } catch {
    res.writeHead(404).end()
  }
})
await new Promise((resolve) => server.listen(8000, 'localhost', resolve))

async function setup(ctx) {
  await ctx.route(`${ORIGIN}/**`, async (route) => {
    const url = new URL(route.request().url())
    if (url.pathname === '/static/firebase-client.js') {
      return route.fulfill({ contentType: 'text/javascript', body: FIREBASE_STUB })
    }
    if (url.pathname.startsWith('/api/')) {
      const body = api[decodeURIComponent(url.pathname)]
      return body ? route.fulfill({ json: body }) : route.fulfill({ status: 404, json: { detail: 'Not in demo' } })
    }
    const file = url.pathname === '/teleprompter' ? 'static/teleprompter.html' : url.pathname.slice(1)
    try {
      return route.fulfill(serveFile(file))
    } catch {
      return route.fulfill({ status: 404, body: '' })
    }
  })
  // Not connected to any server: the beats push the recorded frames, and what the page sends is dropped.
  await ctx.routeWebSocket('ws://localhost:8000/ws', (ws) => {
    socket = ws
  })
}

const scrollTo = (page, selector) =>
  page.locator(selector).evaluate((el) => window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 70, behavior: 'smooth' }))

const typeInto = async (page, key, text) => {
  await page.locator(`input[data-var="${key}"]`).click()
  await page.keyboard.type(text, { delay: 35 })
}

await walkthrough({
  url: `${ORIGIN}/teleprompter`,
  out,
  label: 'Orbit · teleprompter',
  setup,
  // A fake microphone lets the page's real audio capture start; nothing it captures is used.
  launchArgs: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'],
  viewport: { width: 1920, height: 1080 },
  posterAt: 22,
  beats: [
    {
      caption: "Orbit's teleprompter before a call. With a roadmap picked, typing the buyer's details fills in the opening line.",
      seconds: 9,
      act: async (page) => {
        await page.locator('#roadmapFields').scrollIntoViewIfNeeded()
        await smoothScroll(page, 150, 10)
        await typeInto(page, 'buyername', 'Marcus')
        await typeInto(page, 'companyname', 'Northwind')
        await typeInto(page, 'meetinglength', 'thirty minutes')
        await page.waitForTimeout(1500)
      },
    },
    {
      caption: 'Starting the call brings up the stage rail for the roadmap, with the things a rep should never do pinned underneath.',
      seconds: 7,
      act: async (page) => {
        await page.locator('#start').click()
        // Let the page finish starting its audio capture, which sets its own status line.
        await page.waitForTimeout(1500)
        await replay(0)
        await scrollTo(page, '#rail-section')
        await page.waitForTimeout(2500)
      },
    },
    {
      caption: 'Each buyer line updates mood and signal counts, and the rail moves on when the next suggested line belongs to the next stage.',
      seconds: 10,
      act: async (page) => {
        await replay(1)
        await page.waitForTimeout(1500)
      },
    },
    {
      caption: 'The coach keeps digging until the buyer puts a number on the problem, and the rail moves on to Implication.',
      seconds: 9,
      act: async (page) => {
        await replay(2)
        await page.waitForTimeout(1500)
      },
    },
    {
      caption: "Asked about price, the roadmap's own objection answer appears under the line to say next.",
      seconds: 8,
      act: async (page) => {
        await scrollTo(page, '.suggestion-section')
        await replay(3)
        await page.waitForTimeout(2000)
      },
    },
    {
      caption: 'By the end the close probability and signal counts have moved with the call, and the rail has reached the last stage, The next step.',
      seconds: 12,
      act: async (page) => {
        await replay(4)
        await page.waitForTimeout(1500)
        await scrollTo(page, '#rail-section')
        await page.waitForTimeout(2500)
      },
    },
  ],
})

server.close()
