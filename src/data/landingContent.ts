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
    question: 'How is this different from just taking notes on a video?',
    answer:
      'Consum doesn\'t just transcribe: it analyzes. You get a structured blueprint with common mistakes to avoid, strategic guidance, and 3-5 sequential action steps tailored to your specific goal. It\'s the difference between "here\'s what the video said" and "here\'s how YOU implement this."',
  },
  {
    question: 'How personalized is it really?',
    answer:
      'The AI considers your stated goal and the routine you might be doing to meet you exactly where you are. Two people watching the same video will get different blueprints based on their intentions. Example: "reduce work stress" gets different steps than "build morning routine."',
  },
  {
    question: 'Will this just become another graveyard of plans I never use?',
    answer:
      'Fair concern - we\'ve all been there. If you chose not to log in and tick off a checkmark that you did what you committed to, that\'s fine, but Consum is made so that\'s the only effort on your side. I might add notifications for this down the line.',
  },
  {
    question: 'How long does it take to process a video?',
    answer: 'Less than 10 seconds for most videos, unless Gemini\'s busy.',
  },
  {
    question: 'What if I disagree with the AI\'s suggestions?',
    answer:
      "The blueprint is a starting point, not a prescription. Use what resonates, ignore what doesn't. You can always create another blueprint with a different goal or add text content to provide more context.",
  },
  {
    question: 'Can I combine insights from multiple videos?',
    answer:
      'Not yet. Each blueprint is based on one piece of content. BUT you can create multiple blueprints and synthesize them yourself. I might add this feature later.',
  },
  {
    question: 'Does Consum capture visual elements from videos?',
    answer:
      'Consum works with transcripts, so visual elements aren\'t captured. Best used for talk-heavy content (interviews, lectures, podcasts) rather than visual tutorials.',
  },
  {
    question: 'Can I use this with articles or text content, not just videos?',
    answer: 'Yes! You can paste any text content directly into the app: articles, X threads, book excerpts, whatever you want analyzed.',
  },
  {
    question: 'Can I import my existing saved content from Pocket/Notion/etc.?',
    answer: 'Not in the current version. You\'ll need to manually paste YouTube links or text… for now.',
  },
  {
    question: 'How does this integrate with my existing workflow (Notion, etc.)?',
    answer:
      "Right now, you can copy your blueprints and paste them wherever you work. Native integrations aren't available yet, but hopefully will be implemented.",
  },
  {
    question: 'Is this mobile-friendly?',
    answer:
      'The web app is mobile-responsive, so you can create and view blueprints on your phone. Full native mobile app isn\'t in development yet.',
  },
  {
    question: 'What happens to my data? Is it private?',
    answer: 'Your blueprints are stored securely in your account. Only you can see them. They\'re not shared with anyone.',
  },
  {
    question: 'What if the AI misses the KEY insight from the video?',
    answer:
      'Share your feedback with me! Each blueprint has a thumbs up/down rating. If the AI misses something important, let me know so I can improve the system asap.',
  },
]

export const FOOTER_LINKS = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/tos' },
]
