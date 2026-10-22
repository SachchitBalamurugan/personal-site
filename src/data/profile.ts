export const profile = {
  name: 'Sachchit Balamurugan',
  roles: ['bioengineer', 'founder', 'cancer researcher', 'robot builder', 'hackathon goblin', 'Eagle Scout'],
  school: 'UC Berkeley · B.S. Bioengineering · Regents’ & Chancellor’s Scholar',
  location: 'Little Elm, TX → Berkeley, CA',
  email: 'sachchit.cool@gmail.com',
  links: {
    github: 'https://github.com/SachchitBalamurugan',
    linkedin: 'https://www.linkedin.com/in/sachchit-balamurugan-951403283/',
    scholar: 'https://scholar.google.com/citations?user=Xk_I7eoAAAAJ',
    resume: '/resume.pdf',
  },
  stats: [
    { value: '130K+', label: 'FschoolAI users' },
    { value: '2', label: 'peer-reviewed papers' },
    { value: '5M+', label: 'press reach' },
    { value: '1 / 514', label: 'class rank' },
  ],
  currently: [
    'Building FschoolAI as Co-Founder & CTO',
    'Studying bioengineering at Berkeley',
    'Building AI infrastructure at State Farm',
    'Shipping a hackathon project roughly every other week',
  ],
}

export interface Publication {
  title: string
  authors: string
  venue: string
  year: number
  note: string
  links: { label: string; href: string }[]
}

export const publications: Publication[] = [
  {
    title:
      'Evaluation of Lightweight CNN Architectures for Adrenal Cortical Carcinoma Classification from MRI: A Comparative Study of Pre-trained and Custom Models',
    authors: 'S. Balamurugan, A. Datar',
    venue: 'Journal of the International Youth Research Conference (IYRC)',
    year: 2025,
    note: 'I was one of 27 students worldwide chosen to present at the University of Tokyo. The paper compares ResNet50, MobileNetV2, VGG, ConvNeXtTiny, and a custom CNN for early ACC detection.',
    links: [{ label: 'DOI 10.34614/JIYRC2025II23', href: 'https://doi.org/10.34614/JIYRC2025II23' }],
  },
  {
    title:
      'Analyzing the Impact of Socioeconomic Status on UTR Score for Youth Tennis Players (10–18) in the United States of America',
    authors: 'A. Kommineni, S. Balamurugan, D. Johnson',
    venue: 'Journal of Research High School (JRHS)',
    year: 2024,
    note: 'Started during my Duke research internship. We used regression and hypothesis testing to measure how household income relates to Universal Tennis Ratings for players aged 10–18.',
    links: [
      {
        label: 'Read PDF',
        href: 'https://www.journalresearchhs.org/_files/ugd/ebf144_5907f479c7c249978e362f0c9e17951f.pdf',
      },
    ],
  },
]

export const ongoingResearch = [
  {
    org: 'Southern Methodist University',
    what: 'Quantum chemistry on 2,4,6-triaminopyrimidine (TAP) as a possible RNA ancestor under primordial-Earth UV, plus molecular docking of malathion against human acetylcholinesterase. I proposed a two-step inhibition mechanism.',
  },
  {
    org: 'UT Dallas',
    what: 'Applied NLP (POS tagging, word-sense disambiguation, coreference, and document classification) on news, social media, and medical records.',
  },
  {
    org: 'UCLA · Civics Unplugged',
    what: 'A priority algorithm for allocating cancer beds during pandemic conditions.',
  },
]

export interface PressItem {
  outlet: string
  headline: string
  date: string
  href?: string
  /** Hidden until a link is provided. */
  todo?: boolean
}

export const press: PressItem[] = [
  {
    outlet: 'Forbes',
    headline: 'When Patients Become Innovators: Using AI To Improve Their Own Care',
    date: 'Jan 2026',
    href: 'https://www.forbes.com/sites/craigsmith/2026/01/21/when-patients-become-innovators-using-ai-to-improve-their-own-care/',
  },
  {
    outlet: 'D Magazine',
    headline: 'Meet the Little Elm Teen Who Developed an AI-Powered Cancer Detection Tool',
    date: 'Aug 2025',
    href: 'https://www.dmagazine.com/healthcare-business/2025/08/meet-the-little-elm-teen-who-developed-an-ai-powered-cancer-detection-tool/',
  },
  {
    outlet: 'Spectrum News 1',
    headline: 'Little Elm teen builds AI cancer detection tool',
    date: '2025',
    todo: true,
  },
  {
    outlet: 'Dallas Innovates',
    headline: 'North Texas Teen Creates AI Cancer Detection App, Flies to Tokyo to Present It',
    date: 'Jun 2025',
    href: 'https://dallasinnovates.com/north-texas-teen-creates-ai-cancer-detection-app-flies-to-tokyo-to-present-it/',
  },
  {
    outlet: 'Little Elm Journal',
    headline: 'Little Elm student creates cancer detection technology',
    date: '2025',
    href: 'https://starlocalmedia.com/littleelmjournal/news/little-elm-student-creates-cancer-detection-technology/article_a5fa71dd-1ec9-436f-911a-e68250fbadb7.html',
  },
  {
    outlet: 'Texas Online Prep',
    headline: 'From Little Elm to Tokyo: Sachchit’s Mission to Fight Cancer with AI',
    date: '2025',
    href: 'https://tops.k12.com/blog/stories-spotlights/from-little-elm-to-tokyo-sachchits-mission-to-fight-cancer-with-ai/',
  },
  {
    outlet: 'Texas Online Prep',
    headline: 'Dream Big, Code Boldly: Lessons from Sachchit’s Global Tech Journey',
    date: '2025',
    href: 'https://tops.k12.com/blog/stories-spotlights/dream-big-code-boldly-lessons-from-sachchits-global-tech-journey/',
  },
  {
    outlet: 'Military Families',
    headline: 'Veterans’ stories inspire Texas teen to create prize-winning housing design',
    date: '2024',
    href: 'https://militaryfamilies.com/military-veterans/veterans-stories-inspire-texas-teen-to-create-prize-winning-housing-design/',
  },
]

export interface Mission {
  year: string
  title: string
  detail: string
  badges: string[]
  href?: string
  todo?: boolean
}

export const missions: Mission[] = [
  {
    year: '2024',
    title: 'NASA Space Apps · NE-AR (Naturalists Explorer, Augmented Reality)',
    detail:
      'For the "Tell Us a Climate Story!" challenge, Team NE-AR built an AR app with US Greenhouse Gas Center data. It shows climate hotspots in three views (past, present, and future), starting with Alaska’s Pedersen Glacier: at sea level in the 1990s, retreated by the 2020s, and projected into the 2090s. It also has extreme-weather scenarios and an AI climate chatbot. The project won the Global People’s Choice Award and was a Global Nominee in a year with a record 93,000+ participants.',
    badges: ['Global People’s Choice', 'Global Nominee', 'Climate'],
    href: 'https://www.spaceappschallenge.org/nasa-space-apps-2024/find-a-team/teslans/?tab=project',
  },
  {
    year: '2024–25',
    title: 'NASA Texas High School Aerospace Scholars → Moonshot',
    detail:
      'A 7-month aerospace curriculum, then the Moonshot Summer Intensive with 8-hour days spent designing solutions for Artemis mission challenges using systems engineering, CAD, orbital mechanics, and propulsion analysis.',
    badges: ['NASA HAS', 'Artemis'],
  },
  {
    year: '2025',
    title: 'NASA Space Apps · NE-AR for urban planners',
    detail:
      'We came back and took NE-AR from awareness to action. It became a platform with an e-book, a website, an AR app, and an Urban Planner AR viewer that put NASA Earth observation data in front of city planners across the Indo-Gangetic Plain: CO₂ and air pollution in Delhi, heat and water stress in Uttarakhand, sea level rise in West Bengal, and crop stress in Punjab. Planners can run what-if simulations, like rerouting a road around flood risk. It was a Global Nominee again, in the top 940 of 15,000 teams.',
    badges: ['Global Nominee', 'Top ~6%', 'AR'],
    href: 'https://www.spaceappschallenge.org/2025/find-a-team/ne-ar-naturalists-explorer-augmented-reality/',
  },
]

export interface Job {
  role: string
  org: string
  when: string
  points: string[]
}

export const experience: Job[] = [
  {
    role: 'Co-Founder & CTO',
    org: 'FschoolAI',
    when: 'Jul 2026 – now',
    points: ['Built the whole stack (app, RAG pipeline, voice tutor, Chrome extension)', '130K+ users, 90+ schools, interviewed for PearX'],
  },
  {
    role: 'Software / Data Infrastructure Engineer Intern',
    org: 'State Farm',
    when: 'Jun 2025 – now',
    points: [
      'Selected from 9,000+ applicants (2%) and invited back as a returning intern',
      'AWS infrastructure in OpenTofu + Python for the SpaceX team; an LLM pipeline for the internal Test Case AI',
    ],
  },
  {
    role: 'Research Intern',
    org: 'Southern Methodist University',
    when: 'Aug 2023 – now',
    points: ['Quantum chemistry on RNA precursors; molecular docking of pesticide inhibition'],
  },
  {
    role: 'Air Quality Research Intern',
    org: 'UT Dallas',
    when: 'May 2024 – Jun 2026',
    points: ['Real-time particulate matter + wind visualization platform in Vue.js'],
  },
  {
    role: 'Research Intern',
    org: 'Duke University',
    when: 'Jun – Sep 2024',
    points: ['Socioeconomic status vs. UTR, which became the JRHS paper'],
  },
  {
    role: 'NLP Research Intern',
    org: 'UT Dallas',
    when: 'Jun – Aug 2024',
    points: ['POS tagging, WSD, coreference, and classification across news, social media, and medical text'],
  },
  {
    role: 'Research Intern',
    org: 'NASA HAS & Moonshot',
    when: 'Oct 2024 – Jun 2025',
    points: ['Artemis mission engineering challenges'],
  },
  {
    role: 'AI Software Engineer Intern',
    org: 'Gigaplex Academy',
    when: 'Aug 2024 – Jun 2026',
    points: ['AI chatbots that recommend FBLA/CTSO competitions; featured for my cancer research'],
  },
  {
    role: 'CTO',
    org: 'EcoBox LLC',
    when: 'Jun 2024 – Jun 2026',
    points: ['Shipped EcoWise to Google Play; 500+ workbooks sold to schools'],
  },
  {
    role: 'Founder & CEO',
    org: 'YOTI (nonprofit)',
    when: 'Apr 2024 – Jun 2026',
    points: ['Taught 100+ students to code; ran AI/ML workshops; built free sites for nonprofits'],
  },
]

export const awards: { title: string; detail: string; icon: string }[] = [
  { icon: '🚀', title: 'NASA Space Apps', detail: 'Global People’s Choice 2024 · Global Nominee 2024 & 2025' },
  { icon: '🗼', title: 'IYRC Tokyo', detail: '1 of 27 students worldwide to present' },
  { icon: '🥇', title: 'BPA National 1st', detail: 'Mobile Application, 2024–25 · 7th Computer Modeling' },
  { icon: '🤖', title: 'FRC Texas State Champion', detail: '27th / 3,690 at Worlds · 2× District Champion' },
  { icon: '🌍', title: 'Destination Imagination', detail: 'World Champion, Digital Open · Magellan Award' },
  { icon: '🧠', title: 'RISE Global Finalist', detail: 'Top ~2% worldwide, 2023' },
  { icon: '🦅', title: 'Eagle Scout', detail: '45 merit badges · Bronze, Gold & Silver Palms · OA' },
  { icon: '🎤', title: 'SXSW EDU 2026', detail: 'Workshop on cancer research + YOTI' },
  { icon: '🏅', title: 'President’s Volunteer Service', detail: 'Gold Medal · 1,200+ service hours' },
  { icon: '🇺🇳', title: 'UN Association', detail: 'National Ambassador · Zero Hunger & Zero Waste' },
  { icon: '🔬', title: 'ISEF State Qualifier', detail: '3rd, Fort Worth Regional CS · Texas A&M state fair' },
  { icon: '🎓', title: 'AP Scholar w/ Distinction', detail: 'College Board National Recognition' },
  { icon: '🏛️', title: 'Texas FBLA Area 9 State VP', detail: '2025–26 · first gamified service challenge' },
  { icon: '📜', title: 'Certiport IT Specialist', detail: 'AI, Python, Java, JavaScript, HTML/CSS' },
]
