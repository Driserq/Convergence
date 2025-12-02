export const SECTION_LINKS = [
  { label: 'Overview', target: 'hero' },
  { label: 'Who it’s for', target: 'relevance' },
  { label: 'Value', target: 'value' },
  { label: 'How it works', target: 'how-it-works' },
  { label: 'Pricing', target: 'pricing' },
  { label: 'FAQ', target: 'faq' },
]

export const HERO_CONTENT = {
  eyebrow: 'Consum Action Engine',
  headline: 'Consume actionables, not content',
  subheadline:
    'Consum takes your YouTube videos, articles, and posts and spits out ready-to-implement habits, plans, and checklists so you can outgrow everyone.',
  primaryCta: 'Start consuming actionables',
  secondaryCta: 'See how Consum works',
}

export const RELEVANCE_POINTS = [
  'You’re serious about self improvement.',
  'You’re too busy to spend time digesting content and making notes.',
  'Your Watch Later playlist keeps piling up.',
]

export const VALUE_CLAIMS = [
  {
    title: 'Tailored actionables to drop straight into your routine',
    description: 'No time wasted on figuring out what’s relevant to you.',
  },
  {
    title: 'Become the smartest person in the room in the least possible time',
    description: 'Condense hours of podcasts and video into a 5 minute read that is 100% tailored to you.',
  },
  {
    title: 'Level up with every piece of content you consume',
    description: 'Consume only the stuff that will move the needle — no fluff to waste your time and energy.',
  },
  {
    title: 'Turn content into datasets downloadable straight into your brain',
    description: 'Taking notes is optional now. Everything’s curated and sorted for you to consume.',
  },
]

export const HOW_IT_WORKS_STEPS = [
  {
    step: '01',
    title: 'You set the intention',
    description:
      'Log in and spell out your goal so the system knows exactly what “success” means for you.',
  },
  {
    step: '02',
    title: 'You hand us the source material',
    description: 'Paste a YouTube link or raw notes; we quietly verify it’s usable and prep it for analysis.',
  },
  {
    step: '03',
    title: 'We digest the content for you',
    description:
      'Consum pulls the full transcript (if it’s a video) and cleans up the text so only the meaningful insights remain.',
  },
  {
    step: '04',
    title: 'We spin up an expert coach',
    description:
      'Your goals plus the distilled content feed our habit blueprint engine, which thinks like a coach and maps realistic action sequences.',
  },
  {
    step: '05',
    title: 'Your blueprint lands in your workspace',
    description:
      'The finished plan drops into your dashboard and History automatically with steps, checklists, triggers, and habit prompts.',
  },
  {
    step: '06',
    title: 'You decide what to stay accountable to',
    description:
      'From History you tag the blueprints you want to track, instantly piping their habits into the Today tab.',
  },
  {
    step: '07',
    title: 'Daily follow-through stays effortless',
    description:
      'Today view keeps those items front and center with streak tracking, completion toggles, and live stats.',
  },
]

export const PRICING_TIERS = [
  {
    name: 'Free',
    price: '$0',
    period: 'per month',
    description: 'Test-drive Consum with capped output and no tracking overhead.',
    features: [
      '3 blueprints / month',
      'Baseline transcript cleanup',
      'History access only',
      'Habit tracking disabled',
    ],
    cta: 'Stay free',
    buttonVariant: 'secondary',
  },
  {
    name: 'Weekly Sprint',
    price: '$5',
    period: 'per week',
    description: 'Ship a steady cadence of blueprints with light accountability baked in.',
    features: [
      '20 blueprints / week',
      'Track up to 3 habits + actions',
      'Priority weekly refresh cadence',
      'Export-ready summaries',
    ],
    cta: 'Go weekly',
    buttonVariant: 'outline',
  },
  {
    name: 'Monthly Builder',
    price: '$10',
    period: 'per month',
    description: 'High-capacity plan with full accountability (8 tracked habits — more is just ineffective).',
    features: [
      '150 blueprints / month',
      'Track up to 8 habits + actions',
      'Full accountability workspace',
      'Priority processing + export packs',
    ],
    highlight: true,
    badgeText: 'Most popular',
    cta: 'Commit monthly',
    buttonVariant: 'default',
  },
]

export const FINAL_CTA = {
  eyebrow: 'Ready to lap your feed?',
  headline: 'Feed Consum content at breakfast and ship new habits by lunch.',
  subheadline: 'Pipe in one video today and wake up tomorrow with a plan you can actually execute.',
  primaryCta: 'Start now — it’s free',
  secondaryCta: 'Browse the workflow',
}

export const FAQS = [
  {
    question: 'What content sources does Consum support?',
    answer: 'YouTube, podcasts with transcripts, long-form articles, and uploaded notes — anything with text we can parse.',
  },
  {
    question: 'Will I lose my blueprints if I uninstall?',
    answer: 'No. Every blueprint is stored in History and can be exported at any time as PDF or Notion docs.',
  },
  {
    question: 'How personalized are the actionables?',
    answer: 'Every blueprint is generated from your stated intention, so steps, guardrails, and reminders adapt to your goal.',
  },
  {
    question: 'Can teams use Consum?',
    answer: 'Yes. Pro plans allow shared workspaces so teams can centralize their learning playlists.',
  },
]

export const FOOTER_LINKS = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/tos' },
]
