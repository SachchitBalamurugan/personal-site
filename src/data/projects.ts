export type Category = 'health' | 'ai' | 'civic' | 'play' | 'startup'

export interface Project {
  id: string
  name: string
  tagline: string
  description: string
  category: Category
  year: number
  event?: string
  tech: string[]
  live?: string
  repo?: string
  /** Repo exists but is private: show a badge instead of a link. */
  privateRepo?: boolean
  /** Demo video in public/demos: H.264 mp4 plus a poster frame. */
  video?: { src: string; poster: string; caption?: string }
  /** 1–3, sets planet size and ordering. */
  weight: number
  featured?: boolean
}

const gh = (name: string) => `https://github.com/SachchitBalamurugan/${name}`

export const categoryMeta: Record<Category, { label: string; color: string }> = {
  startup: { label: 'Startup', color: '#ffb547' },
  health: { label: 'Health & Bio', color: '#3ef0c8' },
  ai: { label: 'AI Tools', color: '#8b5cf6' },
  civic: { label: 'Civic & Impact', color: '#4fa8ff' },
  play: { label: 'Games & Fun', color: '#ff5fa2' },
}

export const projects: Project[] = [
  {
    id: 'fschoolai',
    name: 'FschoolAI',
    tagline: 'An AI tutor that learns from your own course materials',
    description:
      "My startup, where I'm Co-Founder and CTO. It plugs into Canvas and other school LMS platforms and teaches from each student's own course materials. If a student fails anyway, a grade guarantee refunds up to $2,000. I built the React/TypeScript app, the serverless API, a Postgres RAG pipeline, a cited LLM tutor with voice, live study rooms with an AI whiteboard, and a Chrome extension that syncs LMS data. It has 130K+ users, 600+ beta testers across 90+ schools, and 5M+ social views in 30 days. We interviewed for PearX.",
    category: 'startup',
    year: 2026,
    tech: ['React', 'TypeScript', 'Postgres', 'RAG', 'LLMs', 'Chrome Extension'],
    live: 'https://fschoolai.com',
    weight: 3,
    featured: true,
  },
  {
    id: 'orbit',
    name: 'Orbit',
    tagline: 'A silent live teleprompter that tells sales reps what to say next',
    description:
      "Orbit listens to the customer's side of a call. It streams 16 kHz audio over WebSockets to a FastAPI backend that talks to Gemini Live, and puts the exact next line on screen while the call is happening. A rule-based stage tracker walks through the company's own call script (built from a PDF, pasted text, or a guided builder). Rolling analytics track mood, objections, buying signals, and close probability. Billing runs on Stripe subscriptions with a webhook-only write path. An LLM judge grades suggestion quality against about 30 cold-call scenarios.",
    category: 'ai',
    year: 2026,
    tech: ['Python', 'FastAPI', 'WebSockets', 'Gemini Live', 'Firebase', 'Stripe'],
    live: 'https://orbit-ai-kappa.vercel.app',
    privateRepo: true,
    video: {
      src: '/demos/orbit.mp4',
      poster: '/demos/orbit.jpg',
      caption:
        "A call on Orbit's teleprompter: the opening line fills in before dialing, the stage rail follows the call, and the roadmap's objection answer appears when the buyer asks about price.",
    },
    weight: 3,
    featured: true,
  },
  {
    id: 'studylens',
    name: 'StudyLens',
    tagline: 'Feedback while you work, not after the grade',
    description:
      "A browser extension and Claude connector that checks a student's homework on any page. One click screenshots the work, and a vision model circles mistakes in red and good steps in green. It names the belief behind each error and asks a question instead of giving the answer. It also builds a learner model that improves the more the student uses it. Built with Philip Baker.",
    category: 'ai',
    year: 2026,
    event: 'Hackathon, USC',
    tech: ['TypeScript', 'Chrome Extension', 'MCP', 'Vision LLMs', 'Vercel'],
    live: 'https://studylens-two.vercel.app',
    repo: gh('hackathon-SEP-USC'),
    weight: 3,
    featured: true,
  },
  {
    id: 'guidewire',
    name: 'Guidewire',
    tagline: 'An offline AI tour co-pilot for small tourism operators',
    description:
      'Built for places where the internet is weak or missing. You download it once, and after that it runs entirely on your own computer. It does live multilingual translation between a guide and their guests and suggests what to say next, with no cloud at all. You double-click start.bat and it sets up Python and about 1.5 GB of models by itself.',
    category: 'civic',
    year: 2026,
    event: 'Hack-Nation × World Bank Youth Summit 2026',
    tech: ['Python', 'Local LLMs', 'Speech', 'Offline-first'],
    repo: gh('guidewire-ai'),
    weight: 2,
    featured: true,
  },
  {
    id: 'chela',
    name: 'Chela',
    tagline: "An offline voice for people whose speech strangers can't understand",
    description:
      'A communication aid for people after a stroke, with cerebral palsy, or who can only move their eyes. Speech recognition runs entirely on the phone (MFCC + DTW fused with Whisper-tiny on ONNX). For eyes-only users, the webcam detects blinks, and short and long blinks become Morse code. It has a one-tap SOS button and works with no account and no internet.',
    category: 'health',
    year: 2026,
    event: 'Hack-Nation',
    tech: ['TypeScript', 'ONNX', 'Whisper', 'MediaPipe', 'Offline-first'],
    privateRepo: true,
    video: {
      src: '/demos/chela.mp4',
      poster: '/demos/chela.jpg',
      caption: "My real webcam take, run through Chela's own blink detector and Morse decoder. Natural blinks are ignored, H E L P is typed, and SEND speaks it.",
    },
    weight: 2,
    featured: true,
  },
  {
    id: 'clara',
    name: 'CLARA',
    tagline: 'Fixing the immigration backlog at the intake step',
    description:
      'A working prototype of a research paper on DHS intake bottlenecks. A filer photographs their documents. CLARA reads them, swaps every identifying value for a cryptographic token, checks the package against the form requirements, and gives a clerk a filled-in record to verify instead of a flat scan to retype.',
    category: 'civic',
    year: 2026,
    tech: ['Python', 'Vision Models', 'Tokenization', 'Human-in-the-loop'],
    live: 'https://clara-ai-azure.vercel.app',
    privateRepo: true,
    video: {
      src: '/demos/clara.mp4',
      poster: '/demos/clara.jpg',
      caption:
        'Four sample documents go through CLARA: identifiers become tokens, the I-130 check catches a date-of-birth mismatch and a missing marriage certificate, and a clerk sends the case back.',
    },
    weight: 2,
  },
  {
    id: 'jungle-run',
    name: 'Jungle Run IRL',
    tagline: 'An endless runner you play with your whole body',
    description:
      'A Three.js temple runner. A Python tracker uses OpenCV and MediaPipe Pose to build a 33-joint armature from your webcam. You step left or right to change lanes, jump to clear logs, and crouch to slide. The explorer on screen copies your pose live over a WebSocket.',
    category: 'play',
    year: 2026,
    tech: ['Three.js', 'Python', 'OpenCV', 'MediaPipe', 'WebSockets'],
    live: 'https://jungle-run-irl.vercel.app',
    repo: gh('Jungle-Run-IRL'),
    weight: 2,
    featured: true,
  },
  {
    id: 'ne-ar',
    name: 'NE-AR',
    tagline: 'See a glacier’s past, present and future in AR',
    description:
      'Our NASA Space Apps 2024 entry for "Tell Us a Climate Story!" It won the Global People’s Choice Award and was a Global Nominee. NE-AR (Naturalists Explorer, Augmented Reality) uses US Greenhouse Gas Center and NASA open data to show climate hotspots in three views. The first is Alaska’s Pedersen Glacier: at sea level in the 1990s, retreated by the 2020s, and projected into the 2090s. It also has extreme-weather AR scenarios, a solutions showcase, and an AI climate chatbot. In 2025 we expanded it into an Urban Planner AR viewer that lets city planners in Delhi, Uttarakhand, West Bengal, and Punjab run what-if climate simulations on NASA Earth observation data. That version was a Global Nominee again (top 940 of 15,000 teams).',
    category: 'civic',
    year: 2025,
    event: 'NASA Space Apps · People’s Choice ’24 · Nominee ’25',
    tech: ['Augmented Reality', 'NASA Earth Data', 'AI Chatbot', 'Geolocation'],
    live: 'https://www.spaceappschallenge.org/2025/find-a-team/ne-ar-naturalists-explorer-augmented-reality/',
    repo: gh('delhiAR'),
    weight: 3,
    featured: true,
  },
  {
    id: 'third-space',
    name: 'Third Space',
    tagline: 'Bringing suburbs back to their libraries, cafés and parks',
    description:
      "Built for a Civics Unplugged project on third spaces in car-dependent suburbs, with suburban Philadelphia as the case study. It's Duolingo-style streaks for getting out of the house, a Life360-style map of who's out right now, and transit and carpool routing to get you there.",
    category: 'civic',
    year: 2026,
    event: 'Civics Unplugged',
    tech: ['React', 'TypeScript', 'Flask', 'SQLite', 'Maps'],
    repo: gh('CoolBeans_CU'),
    weight: 1,
  },
  {
    id: 'brainrot',
    name: 'Brainrot Lang',
    tagline: 'A real programming language with unhinged syntax',
    description:
      'A real interpreter written in Python with no dependencies. It has variables, math, strings, conditionals, and loops, but the keywords are brainrot: `rizz x be 0`, `grind (x < 10) { yap x }`, `sus … ratio …`. It comes with a REPL and installs as the `rotlang` command.',
    category: 'play',
    year: 2026,
    tech: ['Python', 'Interpreters', 'REPL'],
    repo: gh('brainrot-programming-language'),
    weight: 1,
  },
  {
    id: 'mcp-ugc',
    name: 'mcp-ugc',
    tagline: 'A UGC content pipeline you run from Claude Code',
    description:
      'An MCP server that goes from your codebase to a posted TikTok: project context, research on similar content, ideas, a script, footage, edits, captions, and the post. It needs no API keys, edits locally with ffmpeg, and never publishes without your confirmation.',
    category: 'ai',
    year: 2026,
    tech: ['TypeScript', 'MCP', 'ffmpeg', 'Node'],
    privateRepo: true,
    video: {
      src: '/demos/mcp-ugc.mp4',
      poster: '/demos/mcp-ugc.jpg',
      caption: 'A real run over stdio: 13 tool calls turn this site into a captioned TikTok, then stop for confirmation before posting.',
    },
    weight: 1,
  },
  {
    id: 'acc-research',
    name: 'ACC Cancer Detection',
    tagline: 'AI for the rare cancer that took my grandfather',
    description:
      'I pulled TCGA transcriptome data with R and combined it with public MRI images. Then I trained ResNet50, MobileNetV2, VGG, ConvNeXtTiny, and a custom CNN for early detection of adrenocortical carcinoma and six secondary tumors. Along the way I found two potential biomarkers across 7 cancer types. I presented the work at the University of Tokyo, and Forbes and D Magazine covered it.',
    category: 'health',
    year: 2025,
    event: 'IYRC @ University of Tokyo',
    tech: ['Python', 'R', 'TensorFlow', 'CNNs', 'TCGA'],
    repo: gh('Adrenal-Carcinoma-ACC-CNN-ML-Research'),
    weight: 3,
    featured: true,
  },
  {
    id: 'seven-cancers',
    name: '7-Cancer Biomarker Models',
    tagline: 'Machine learning across seven cancer types',
    description:
      'The tabular half of my cancer research. Statistical models and classifiers trained on transcriptomic data across 7 cancer types, which surfaced two novel candidate biomarkers.',
    category: 'health',
    year: 2025,
    tech: ['Python', 'scikit-learn', 'pandas', 'Matplotlib'],
    repo: gh('AI-Cancer-Research-CSV-7-Cancers'),
    weight: 1,
  },
  {
    id: 'soulsync',
    name: 'SoulSync',
    tagline: 'A mental health app for OCD and depression',
    description:
      'An AI chatbot, ERP (exposure and response prevention) therapy tools, and mood tracking. I built it with input from OCD Texas and shared it with the community. It made me a RISE Global Challenge Finalist (top ~2%).',
    category: 'health',
    year: 2024,
    event: 'RISE Global Challenge Finalist',
    tech: ['Flutter', 'Dart', 'Firebase', 'AI Chatbot'],
    repo: gh('SoulSynce-health-app-final-2.0'),
    weight: 2,
  },
  {
    id: 'ecowise',
    name: 'EcoWise',
    tagline: 'Gamified carbon tracking for everyday habits',
    description:
      'An AI-powered carbon footprint tracker with gamified challenges, built as CTO of EcoBox LLC and published on Google Play. EcoBox also sold 500+ sustainability workbooks to schools.',
    category: 'civic',
    year: 2024,
    tech: ['Flutter', 'Dart', 'Firebase'],
    repo: gh('Carbon_flutter_app'),
    weight: 1,
  },
  {
    id: 'clubconnect',
    name: 'ClubConnect',
    tagline: 'A school club app from BPA nationals',
    description:
      "A mobile app for discovering and running school clubs. I built it for Business Professionals of America's Mobile Application event, where I became my school's first national winner.",
    category: 'civic',
    year: 2025,
    event: 'BPA Nationals — 1st Place',
    tech: ['Flutter', 'Dart', 'Firebase'],
    repo: gh('ClubConnect'),
    weight: 2,
  },
  {
    id: 'yoti',
    name: 'YOTI',
    tagline: 'A nonprofit teaching 100+ students to code',
    description:
      'Youth Opportunities in Tech Innovation, the nonprofit I founded. We teach coding and app and web development to students around the world, run AI/ML workshops (85+ participants), and build free websites for organizations like Project Surya, which now reaches 4 million viewers.',
    category: 'civic',
    year: 2024,
    tech: ['JavaScript', 'React', 'Teaching'],
    live: 'https://yotiweb.com',
    repo: gh('YOTI-Website-Final'),
    weight: 2,
  },
  {
    id: 'utd-wind',
    name: 'UTD Air Quality Viz',
    tagline: 'Live particulate matter and wind, visualized',
    description:
      'An interactive Vue.js platform for the University of Texas at Dallas that shows real-time particulate matter and wind data for researchers and the public.',
    category: 'health',
    year: 2024,
    tech: ['Vue.js', 'JavaScript', 'Data Viz'],
    repo: gh('UTD_Website_Wind_2.0'),
    weight: 1,
  },
  {
    id: 'fbla-chatbot',
    name: 'FBLA Event Matcher',
    tagline: 'A chatbot that finds your perfect competition',
    description:
      "An AI chatbot that matches students with FBLA competitive events based on their interests and personality. It started at Gigaplex Academy and became part of my work as Texas FBLA's Area 9 State VP.",
    category: 'ai',
    year: 2024,
    tech: ['Python', 'NLP', 'HTML/CSS'],
    repo: gh('FBLA-Chatbot'),
    weight: 1,
  },
]
