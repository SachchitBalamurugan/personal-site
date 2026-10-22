// A real end-to-end run of mcp-ugc (private repo) over stdio, the way Claude Code drives it,
// making a TikTok about this site. Logs every tool call and its actual response to transcript.json.
// The writing steps (brand profile, ideas, script, post copy) are the assistant's part of the
// protocol: the server returns a brief and validates what is saved, so those inputs are written here.
//
// Usage: node mcp-ugc-run.mjs <mcp-ugc checkout, built> <project dir> <footage dir> <out dir>
import { createRequire } from 'node:module'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const [ugcDir, projectDir, footageDir, outDir] = process.argv.slice(2).map((p) => path.resolve(p))
mkdirSync(outDir, { recursive: true })

const req = createRequire(path.join(ugcDir, 'package.json'))
const sdk = (p) => import(pathToFileURL(req.resolve(`@modelcontextprotocol/sdk/${p}`)).href)
const { Client } = await sdk('client/index.js')
const { StdioClientTransport } = await sdk('client/stdio.js')

const client = new Client({ name: 'demo', version: '0' })
await client.connect(
  new StdioClientTransport({
    command: process.execPath,
    args: [path.join(ugcDir, 'dist/index.js')],
    cwd: projectDir,
    env: { ...process.env, UGC_PROJECT_DIR: projectDir },
    stderr: 'ignore',
  }),
)

const steps = []
async function call(name, args = {}, caption = '') {
  const t = Date.now()
  const res = await client.callTool({ name, arguments: args })
  const text = res.content[0].text
  if (res.isError) throw new Error(`${name}: ${text}`)
  const result = text.startsWith('{') ? JSON.parse(text) : text
  steps.push({ tool: name, caption, args, result, ms: Date.now() - t })
  console.log(`${name} (${Date.now() - t} ms)`)
  return result
}

const tools = (await client.listTools()).tools.map((t) => t.name)

await call(
  'ugc_ingest_context',
  { summary: "Sachchit's personal site: a Three.js portfolio with a DNA helix that unwinds into a galaxy of projects, research, and hackathon work." },
  'Reads the repo: README, package.json, git log',
)

await call(
  'ugc_save_brand_profile',
  {
    profile: {
      product_name: 'sachchit-site',
      one_liner: 'A portfolio where every project is a planet you can fly to',
      problem: 'Student portfolios all look the same and nobody scrolls past the first screen',
      audience: { icp: 'Students and early-career engineers building a portfolio', pain_points: ['boring template sites', 'no way to show personality'] },
      value_props: ['DNA helix that unwinds into a project galaxy as you scroll', 'Every project opens into its own card with links and demos'],
      proof_points: ['Built with React Three Fiber', '19 projects as planets'],
      tone: ['casual', 'builder'],
      banned_claims: ['guaranteed', 'best portfolio ever'],
      cta: 'Link in bio to fly through it',
      keywords: ['portfolio website', 'three.js', 'creative coding'],
      hashtags: ['#threejs', '#webdev', '#portfolio', '#creativecoding', '#buildinpublic'],
      competitors: [],
    },
  },
  'Saves the brand profile the assistant wrote from that brief',
)

await call('ugc_research_trends', {}, 'Builds a keyless research plan: hashtag, search, and competitor links')

await call('ugc_generate_ideas', { count: 3, goal: 'show off the site' }, 'Returns a brief for ideas')
const { items } = await call(
  'ugc_save_ideas',
  {
    ideas: [
      {
        title: 'My portfolio is a galaxy',
        format: 'screen recording with captions',
        hook: 'Scroll and my DNA turns into a galaxy',
        angle: 'A portfolio you explore instead of read',
        why_it_works: 'Satisfying scroll reveals hold attention in the first second',
        effort: 'low',
      },
    ],
  },
  'Saves the picked idea as a pipeline item',
)
const item_id = items[0].id

await call('ugc_write_script', { item_id, target_seconds: 12 }, 'Returns a script brief')
await call(
  'ugc_save_script',
  {
    item_id,
    script: {
      title: 'My portfolio is a galaxy',
      target_seconds: 12,
      cta: 'Link in bio to fly through it',
      beats: [
        { seconds: 3, shot: 'Hero, scrolling into the helix', vo: 'Scroll and my DNA turns into a galaxy', on_screen_text: 'my portfolio, but make it space' },
        { seconds: 5, shot: 'Project list, open a card', vo: 'Every project is a planet you can land on' },
        { seconds: 4, shot: 'Scroll up through the awards', vo: 'Link in bio to fly through it' },
      ],
    },
  },
  'Saves the script; returns a filming checklist',
)

await call(
  'ugc_add_footage',
  {
    item_id,
    clips: [
      { path: path.join(footageDir, 'hero.mp4'), beat: 1, trim_in: 1.5 },
      { path: path.join(footageDir, 'projects.mp4'), beat: 2 },
      { path: path.join(footageDir, 'contact.mp4'), beat: 3 },
    ],
  },
  'Registers three screen recordings of the site, one per beat',
)

await call('ugc_plan_edit', { item_id }, 'Plans the cuts against the script')
const render = await call('ugc_render', { item_id }, 'Renders 1080x1920 with ffmpeg: cuts, captions, -14 LUFS')

await call('ugc_write_post_copy', { item_id }, 'Returns a brief for the caption')
await call(
  'ugc_save_post_copy',
  { item_id, title: 'My portfolio is a galaxy', description: 'Every project is a planet. Built with React Three Fiber.', hashtags: ['threejs', 'webdev', 'portfolio', 'creativecoding'] },
  'Saves title, description, hashtags',
)
await call('ugc_prepare_post', { item_id }, 'Pre-flight checks before anything is posted')

await client.close()
writeFileSync(path.join(outDir, 'transcript.json'), JSON.stringify({ tools, steps, render }, null, 2))
console.log('render:', render.output_path)
