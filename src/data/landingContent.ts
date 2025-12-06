export const SECTION_LINKS = [
  { label: 'Overview', target: 'hero' },
  { label: 'Who it’s for', target: 'relevance' },
  { label: 'Value', target: 'value' },
  { label: 'How it works', target: 'how-it-works' },
  { label: 'Pricing', target: 'pricing' },
  { label: 'FAQ', target: 'faq' },
]

export const HERO_CONTENT = {
  eyebrow: 'Content-Action Engine',
  headline: 'From Content to Action in Record Time',
  subheadline:
    'Consum takes your YouTube videos, articles, and posts and spits out ready-to-implement habits, plans, and checklists so you can outgrow everyone.',
  primaryCta: 'Actionize Your Content',
  secondaryCta: 'See how Consum works',
}

export const RELEVANCE_POINTS = [
  'You’re serious about self improvement.',
  'You struggle finding the time to consume your content and turn it into notes',
  'You ‘Watch Lates’ playlist has grown beyond saving.',
]

export const VALUE_CLAIMS = [
  {
    title: 'Become the smartest person in the room in the least possible time',
    description: 'Condense hours of podcasts and video into a 5 minute read that is 100% tailored to you.',
  },
  {
    title: 'Tailored actionables to drop straight into your routine',
    description: 'No time wasted on figuring out what’s relevant to you.',
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
    title: 'Set the intention',
    description:
      'Let Consum know what you do or what you want to learn so it can pick only the things that’ll move the needle.',
  },
  {
    step: '02',
    title: 'Share your content',
    description: 'Whether it’s a YouTube link or a piece of text.',
  },
  {
    step: '03',
    title: 'Review',
    description: 'Consume content worth your time and focus.',
  },
  {
    step: '04',
    title: 'Track and stay consistent',
    description:
      'Choose what matters most and keep it on your dashboard to make it as easy as possible to stay consistent and create actual change.',
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
      'Track 1 habit/actionable',
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
    
      'Track up to 3 habits/actionables',
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
      'Track up to 8 habits/actionables',
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
