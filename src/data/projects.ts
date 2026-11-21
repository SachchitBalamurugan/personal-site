/** Painted backdrop behind a featured project in the showcase. */
export type Scene = 'noon' | 'lilac' | 'gold' | 'dusk' | 'grove' | 'dawn'

export interface Fact {
  /** Short text in the round badge. Two or three characters read best. */
  badge: string
  title: string
  sub: string
}

/** A region of the screenshot the showcase points at. Fractions of the image (0 to 1). */
export interface Spot {
  label: string
  x: number
  y: number
  w: number
  h: number
}

export type Shot =
  | { kind: 'image'; src: string; alt: string; width: number; height: number; bg: string; spots: [Spot, Spot, Spot] }
  /** Drawn in HTML instead of a screenshot; the mock marks its own spots. */
  | { kind: 'fschool'; spots: [string, string, string] }

/** A local demo video, or a YouTube embed when there is no local file. */
export type Video =
  | { kind: 'file'; src: string; poster: string; caption?: string }
  | { kind: 'youtube'; id: string; caption?: string }

export interface Featured {
  id: string
  name: string
  video?: Video
  /** One line shown as the panel's "live context". */
  tagline: string
  /** A sentence or two under the tagline. */
  blurb: string
  role: string
  year: number
  event?: string
  facts: [Fact, Fact]
  /** The highlighted bottom row of the panel, usually where to try it. */
  cta: { title: string; sub: string; href: string; badge: string; icon: string }
  note: { title: string; body: string }
  repo?: string
  live?: string
  /** Label in the fake window's title bar. */
  label: string
  shot: Shot
  scene: Scene
}

/** The three highlight labels for a project, in order. */
export const spotLabels = (f: Featured) =>
  f.shot.kind === 'image' ? f.shot.spots.map((s) => s.label) : f.shot.spots

export interface Project {
  id: string
  name: string
  tagline: string
  description: string
  year: number
  event?: string
  tech: string[]
  live?: string
  repo?: string
  /** Repo exists but is private: show a badge instead of a link. */
  privateRepo?: boolean
  /** Demo video in public/demos: H.264 mp4 plus a poster frame. */
  video?: Video
  /** Which little mock UI the card draws. */
  mini: 'orbit' | 'jungle' | 'guidewire' | 'chela' | 'brainrot'
  tint: 'lilac' | 'sky' | 'mint' | 'peach' | 'periwinkle'
}

const gh = (name: string) => `https://github.com/SachchitBalamurugan/${name}`

export const featured: Featured[] = [
  {
    id: 'fschoolai',
    name: 'FschoolAI',
    tagline: 'An AI tutor that learns from your own course materials',
    blurb:
      'It plugs into Canvas and other school LMS platforms and teaches from each student’s own slides, readings and assignments. If a student still fails, a grade guarantee refunds up to $2,000.',
    role: 'Co-founder & CTO',
    year: 2026,
    facts: [
      { badge: '130K', title: '130K+ users', sub: '600+ beta testers across 90+ schools' },
      { badge: '5M', title: '5M+ social views', sub: 'In our first 30 days. We interviewed for PearX.' },
    ],
    cta: { title: 'Try it', sub: 'fschoolai.com', href: 'https://fschoolai.com', badge: 'live', icon: 'F' },
    note: {
      title: 'I built the whole stack',
      body: 'React app, serverless API, a Postgres RAG pipeline, a voice tutor, study rooms with an AI whiteboard, and the Chrome extension.',
    },
    live: 'https://fschoolai.com',
    label: 'fschoolai.com',
    shot: { kind: 'fschool', spots: ['Your own lecture slides', 'Cited answer', 'Grade guarantee'] },
    scene: 'lilac',
  },
  {
    id: 'cadswarm',
    name: 'CADSwarm',
    tagline: 'A team’s AI agents building one live CAD model together',
    blurb:
      'You describe a part, like an enclosure for a Raspberry Pi. A lead agent splits it into tasks, and Claude Code, Codex or OpenCode agents build the parts live while people watch and steer from FreeCAD or a phone. No CAD experience needed.',
    role: 'Cal Hacks 13.0',
    year: 2026,
    event: 'Cal Hacks 13.0',
    facts: [
      { badge: 'DB', title: 'SpacetimeDB enforces the rules', sub: 'Change a part you don’t hold and it’s refused and rolled back' },
      { badge: '✓', title: 'A reviewer agent', sub: 'Checks fit and printability before the STL is exported' },
    ],
    cta: { title: 'Get it free', sub: 'cadswarm.design', href: 'https://www.cadswarm.design/', badge: 'live', icon: '⬡' },
    note: {
      title: 'Built at Cal Hacks 13.0',
      body: 'Free and open source. Shared sizes, crash takeover, and a lead agent that plans the build.',
    },
    video: { kind: 'youtube', id: 'E3yfQqsgq7Y', caption: 'Our Cal Hacks demo video.' },
    live: 'https://www.cadswarm.design/',
    repo: 'https://github.com/CADSwarm/cadswarm',
    label: 'CADSwarm · ESP32 case',
    shot: {
      kind: 'image',
      src: '/work/cadswarm.webp',
      alt: 'CADSwarm: two AI workers building an ESP32 case while the chat shows 3 of 5 parts done',
      width: 1600,
      height: 1000,
      bg: '#0a0a0a',
      spots: [
        { label: 'Two agents building', x: 0.135, y: 0.33, w: 0.205, h: 0.072 },
        { label: '3 of 5 parts done', x: 0.663, y: 0.155, w: 0.27, h: 0.19 },
        { label: '@team plans the build', x: 0.663, y: 0.918, w: 0.312, h: 0.048 },
      ],
    },
    scene: 'gold',
  },
  {
    id: 'eclipse',
    name: 'Eclipse',
    tagline: 'Train any robot with a simulated biological neural network',
    blurb:
      'Import a robot (MJCF, URDF or a zip of meshes), train a culture of 1,024 Izhikevich neurons to control it, then export a protocol a lab could run on living neurons.',
    role: 'Builder',
    year: 2026,
    facts: [
      { badge: '1K', title: '1,024 Izhikevich neurons', sub: 'On an 8×8 electrode grid, about 5 Hz per neuron' },
      { badge: '48', title: 'Sim-to-real export', sub: 'Every hardware bundle passes 48 validator checks' },
    ],
    cta: {
      title: 'See the site',
      sub: 'eclipse-blush-phi.vercel.app',
      href: 'https://eclipse-blush-phi.vercel.app',
      badge: 'live',
      icon: '◐',
    },
    note: {
      title: 'No living neurons yet',
      body: 'Every culture here is simulated, and the README says so. The surgical arm still can’t reach its targets reliably.',
    },
    live: 'https://eclipse-blush-phi.vercel.app',
    repo: gh('Eclipse-Open-World-Simulation-Playground-for-Biological-Neural-Networks'),
    label: 'Eclipse · Fleet',
    shot: {
      kind: 'image',
      src: '/work/eclipse.webp',
      alt: 'Eclipse studio training four simulated BNN cultures on four VMs at once',
      width: 1600,
      height: 812,
      bg: '#0b0b0c',
      spots: [
        { label: '4 VMs in parallel', x: 0.1875, y: 0.1795, w: 0.581, h: 0.058 },
        { label: 'Live error per culture', x: 0.192, y: 0.269, w: 0.283, h: 0.247 },
        { label: 'Electrode spikes, 8×8', x: 0.35, y: 0.815, w: 0.128, h: 0.18 },
      ],
    },
    scene: 'dusk',
  },
  {
    id: 'northstar',
    name: 'Northstar',
    tagline: 'An AI assistant for students with ADHD that runs your week for you',
    blurb:
      'It reads your Gmail and Google Calendar, works inside your own logged-in Chrome, finds internships and fills out the applications. Nothing gets sent, submitted or booked without your OK.',
    role: 'Built with Brian Huang and Cesar Cruz',
    year: 2026,
    event: 'SCET hackathon',
    facts: [
      { badge: 'AM', title: 'Comes to you first', sub: 'A morning briefing and one Next Thing to do' },
      { badge: '↩', title: 'Follows up for you', sub: 'Drafts the reply you forgot, then asks before sending' },
    ],
    cta: { title: 'Read the code', sub: 'github.com/SachchitBalamurugan/northstar', href: gh('northstar'), badge: 'open', icon: '✦' },
    note: {
      title: 'Built in 5 hours at the SCET hackathon',
      body: 'Then I kept going and added what I actually wanted. I run my own week on it now.',
    },
    repo: gh('northstar'),
    label: 'Northstar · Inbox',
    shot: {
      kind: 'image',
      src: '/work/northstar.webp',
      alt: 'Northstar replying to an email for you, with its checklist on the right (demo data)',
      width: 1600,
      height: 900,
      bg: '#0d1514',
      spots: [
        { label: 'Inbox sorted for you', x: 0.198, y: 0.235, w: 0.24, h: 0.036 },
        { label: 'Reply in your voice', x: 0.198, y: 0.301, w: 0.482, h: 0.478 },
        { label: 'Your own Chrome', x: 0.053, y: 0.786, w: 0.102, h: 0.035 },
      ],
    },
    scene: 'grove',
  },
  {
    id: 'tanuki',
    name: 'Tanuki Buddy',
    tagline: 'A hand-painted desktop tanuki that holds up a sign for your AI coding sessions',
    blurb:
      'It sits in the corner of your Windows desktop and shows what Claude Code and Codex are doing: working, waiting on you, done, or napping. If several sessions are open, the most urgent one wins.',
    role: 'Builder',
    year: 2026,
    facts: [
      { badge: '+N', title: 'The most urgent session wins', sub: 'Needs-you beats working beats done' },
      { badge: '3s', title: 'Finds older sessions too', sub: 'A read-only scan of transcripts every 3 seconds' },
    ],
    cta: {
      title: 'Download for Windows',
      sub: 'Latest release on GitHub',
      href: 'https://github.com/SachchitBalamurugan/tanuki-buddy/releases/latest',
      badge: 'free',
      icon: '狸',
    },
    note: {
      title: 'No model files',
      body: 'The tanuki is built from primitives in code, with a watercolor shader and ink outlines. The chime is synthesized in WebAudio.',
    },
    repo: gh('tanuki-buddy'),
    label: 'Tanuki Buddy',
    shot: {
      kind: 'image',
      src: '/work/tanuki.webp',
      alt: 'The tanuki in its four states: working, needs approval, done, and napping',
      width: 1540,
      height: 450,
      bg: '#f5efe3',
      spots: [
        { label: '進行中 · working', x: 0.107, y: 0.14, w: 0.117, h: 0.287 },
        { label: '確認 · needs you', x: 0.358, y: 0.076, w: 0.114, h: 0.284 },
        { label: '完了 · all done', x: 0.619, y: 0.178, w: 0.117, h: 0.278 },
      ],
    },
    scene: 'dawn',
  },
]

export const projects: Project[] = [
  {
    id: 'orbit',
    name: 'Orbit',
    tagline: 'A silent live teleprompter that tells sales reps what to say next',
    description:
      "Orbit listens to the customer's side of a call. It streams 16 kHz audio over WebSockets to a FastAPI backend that talks to Gemini Live, and puts the exact next line on screen while the call is happening. A rule-based stage tracker walks through the company's own call script. Rolling analytics track mood, objections, buying signals and close probability, and an LLM judge grades suggestions against about 30 cold-call scenarios.",
    year: 2026,
    tech: ['FastAPI', 'WebSockets', 'Gemini Live', 'Stripe'],
    live: 'https://orbit-ai-kappa.vercel.app',
    privateRepo: true,
    video: {
      kind: 'file',
      src: '/demos/orbit.mp4',
      poster: '/demos/orbit.jpg',
      caption:
        "A call on Orbit's teleprompter: the opening line fills in before dialing, the stage rail follows the call, and the roadmap's objection answer appears when the buyer asks about price.",
    },
    mini: 'orbit',
    tint: 'periwinkle',
  },
  {
    id: 'jungle-run',
    name: 'Jungle Run IRL',
    tagline: 'An endless runner you play with your whole body',
    description:
      'A Three.js temple runner. A Python tracker uses OpenCV and MediaPipe Pose to build a 33-joint armature from your webcam. You step left or right to change lanes, jump to clear logs, and crouch to slide. The explorer on screen copies your pose live over a WebSocket.',
    year: 2026,
    tech: ['Three.js', 'OpenCV', 'MediaPipe', 'WebSockets'],
    live: 'https://jungle-run-irl.vercel.app',
    repo: gh('Jungle-Run-IRL'),
    mini: 'jungle',
    tint: 'mint',
  },
  {
    id: 'guidewire',
    name: 'Guidewire',
    tagline: 'An offline AI tour co-pilot for small tourism operators',
    description:
      'Built for places where the internet is weak or missing. You download it once, and after that it runs entirely on your own computer. It does live translation between a guide and their guests and suggests what to say next, with no cloud at all. You double-click start.bat and it sets up Python and about 1.5 GB of models by itself.',
    year: 2026,
    event: 'Hack-Nation × World Bank Youth Summit',
    tech: ['Python', 'Local LLMs', 'Speech', 'Offline-first'],
    repo: gh('guidewire-ai'),
    mini: 'guidewire',
    tint: 'sky',
  },
  {
    id: 'chela',
    name: 'Chela',
    tagline: "An offline voice for people whose speech strangers can't understand",
    description:
      'A communication aid for people after a stroke, with cerebral palsy, or who can only move their eyes. Speech recognition runs entirely on the phone (MFCC + DTW fused with Whisper-tiny on ONNX). For eyes-only users, the webcam detects blinks, and short and long blinks become Morse code. It has a one-tap SOS button and works with no account and no internet.',
    year: 2026,
    event: 'Hack-Nation',
    tech: ['TypeScript', 'ONNX', 'Whisper', 'MediaPipe'],
    privateRepo: true,
    video: {
      kind: 'file',
      src: '/demos/chela.mp4',
      poster: '/demos/chela.jpg',
      caption:
        "My real webcam take, run through Chela's own blink detector and Morse decoder. Natural blinks are ignored, H E L P is typed, and SEND speaks it.",
    },
    mini: 'chela',
    tint: 'peach',
  },
  {
    id: 'brainrot',
    name: 'Brainrot Lang',
    tagline: 'A real programming language with unhinged syntax',
    description:
      'A real interpreter written in Python with no dependencies. It has variables, math, strings, conditionals and loops, but the keywords are brainrot: `rizz x be 0`, `grind (x < 10) { yap x }`, `sus … ratio …`. It comes with a REPL and installs as the `rotlang` command.',
    year: 2026,
    tech: ['Python', 'Interpreters', 'REPL'],
    repo: gh('brainrot-programming-language'),
    mini: 'brainrot',
    tint: 'lilac',
  },
]
