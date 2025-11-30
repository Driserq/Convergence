import React from 'react'
import { ArrowRight, CheckCircle2, Quote, Sparkles } from 'lucide-react'
import { useNavigate, Link } from 'react-router'

import { useAuth } from '../src/hooks/useAuth'
import { Button } from '../src/components/ui/button'
import { Badge } from '../src/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../src/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '../src/components/ui/accordion'
import { Separator } from '../src/components/ui/separator'

const SECTION_LINKS = [
  { label: 'Overview', target: 'hero' },
  { label: 'Pain Points', target: 'pain-points' },
  { label: 'Outcomes', target: 'outcomes' },
  { label: 'How It Works', target: 'how-it-works' },
  { label: 'FAQ', target: 'faq' }
]

const HERO_BULLETS = [
  'Extract actionable steps from any YouTube video or text—no more "just be aware" advice',
  'Get personalized habit blueprints with Step By Step actions, daily habits, and emergency action plans',
  'Actually remember what you learned with summaries, common mistakes, and strategic guidance',
  'Build habits that stick with adaptive plans that match your content type',
  'Stop hoarding content you never use—your Watch Later list becomes a tool, not a graveyard'
]

const PAIN_POINTS = [
  {
    icon: '📚',
    title: 'The Endless Accumulation',
    description:
      "You save videos, posts, and podcasts promising to transform your life, but your saved list and 'watch later' playlist keeps growing while you're busy with life. The guilt piles up every time you add another \"must-watch\" video you know will be archived before you watch it."
  },
  {
    icon: '💭',
    title: 'Insights That Go Nowhere',
    description:
      'Without concrete steps applicable to you and your goals, more content just adds to the mental clutter. But taking diligent notes and breaking down the material into simple habits or step-by-step plans takes as much time as the video itself.'
  },
  {
    icon: '🔄',
    title: 'Keeping Actionable Accessible',
    description:
      'Extracting insight can be a challenge, but sticking to it is always a bigger one. You watch a 30-minute video full of life-changing advice, feel motivated for an hour... then nothing changes.'
  }
]

const OUTCOMES = [
  {
    icon: '✨',
    title: 'Make Insight Quick and Accessible',
    description:
      'It takes 30 seconds to turn a 30-minute video into a page in your notes app.'
  },
  {
    icon: '🎯',
    title: 'Help You Remember and Use What You Learn',
    description:
      'It lays out all the actionables, habits, and potential potholes with nuances in mind.'
  },
  {
    icon: '🌱',
    title: 'Create Habits That Actually Stick',
    description:
      "When you're trying to make lasting change, Consum breaks down habits into the simplest forms and adapts them to your situation."
  }
]

const BLUEPRINT_TYPES = [
  { icon: '📊', type: 'Step By Step', description: '(for tutorials, skill-building)' },
  { icon: '🔄', type: 'Daily Habits', description: '(for sustained behavior change)' },
  { icon: '🚨', type: 'Trigger Actions', description: '(for crisis management)' },
  { icon: '❓', type: 'Decision Checklists', description: '(for strategic choices)' },
  { icon: '📚', type: 'Resource Lists', description: '(for tools/books)' }
]

const FAQS = [
  {
    question: 'Does it work with private YouTube videos?',
    answer: 'Yes, as long as you can access the video, Consum can process it for you.'
  },
  {
    question: 'What languages are supported?',
    answer: 'Currently English, with Spanish and French coming soon.'
  },
  {
    question: 'How long does it take to create a blueprint?',
    answer: 'Most blueprints are ready in 60 seconds or less.'
  }
]

export default function IndexPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const handleSectionScroll = (target: string) => {
    if (typeof window === 'undefined') return
    const element = document.getElementById(target)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleAuthNavigation = () => {
    if (user) {
      navigate('/dashboard')
    } else {
      navigate('/login')
    }
  }

  const handleSignupNavigation = () => {
    if (user) {
      navigate('/dashboard')
      return
    }
    navigate('/signup')
  }

  const authButtonLabel = user ? 'Go to Dashboard' : 'Log In'

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-6 px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => handleSectionScroll('hero')}
            className="text-xl font-bold text-foreground transition-colors hover:text-primary"
          >
            Consum
          </button>
          <nav className="hidden flex-1 items-center justify-center gap-6 text-sm font-semibold md:flex">
            {SECTION_LINKS.map((link) => (
              <button
                key={link.target}
                onClick={() => handleSectionScroll(link.target)}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleAuthNavigation}
              className="rounded-full px-4"
            >
              {authButtonLabel}
            </Button>
            {!user && (
              <Button
                size="sm"
                className="rounded-full px-4"
                onClick={handleSignupNavigation}
              >
                Sign Up
              </Button>
            )}
          </div>
        </div>
        <nav className="flex w-full items-center justify-center gap-4 px-4 pb-4 text-sm font-semibold md:hidden">
          {SECTION_LINKS.map((link) => (
            <button
              key={link.target}
              onClick={() => handleSectionScroll(link.target)}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </button>
          ))}
        </nav>
        {!user && (
          <div className="flex w-full items-center justify-center gap-3 px-4 pb-4 md:hidden">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleAuthNavigation}
              className="rounded-full px-4"
            >
              {authButtonLabel}
            </Button>
            <Button
              size="sm"
              className="rounded-full px-4"
              onClick={handleSignupNavigation}
            >
              Sign Up
            </Button>
          </div>
        )}
      </header>

      <section
        id="hero"
        className="scroll-mt-24 bg-gradient-to-b from-background via-background to-background/90 py-32"
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 text-center sm:px-6 lg:px-8">
          <div className="space-y-6">
            <h1 className="text-balance text-4xl font-bold tracking-tight md:text-6xl">
              Stop Drowning in Your Watch Later List—Turn Content Into Action
            </h1>
            <p className="mx-auto max-w-3xl text-lg text-muted-foreground md:text-2xl">
              For anyone overwhelmed by self-improvement content, Consum transforms YouTube videos and articles into personalized habit blueprints with concrete steps you can actually follow.
            </p>
          </div>
          <div className="mx-auto w-full max-w-3xl space-y-3 text-left">
            {HERO_BULLETS.map((bullet) => (
              <div
                key={bullet}
                className="flex items-start gap-3"
              >
                <CheckCircle2 aria-hidden className="mt-1 size-5 shrink-0 text-primary" />
                <p className="text-base text-foreground/90 md:text-lg">{bullet}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center justify-center gap-3 md:flex-row pt-8">
            <Button
              size="lg"
              className="gap-2 rounded-full px-8 py-6 text-base font-semibold md:text-lg"
              onClick={handleAuthNavigation}
            >
              Create Your First Blueprint (Free)
              <ArrowRight aria-hidden className="size-5" />
            </Button>
            <Button
              variant="link"
              className="text-base"
              onClick={() => handleSectionScroll('how-it-works')}
            >
              See how it works
            </Button>
          </div>
        </div>
      </section>

      <section id="pain-points" className="scroll-mt-24 bg-background py-20">
        <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 sm:px-6 lg:px-8">
          <div className="space-y-4 text-center">
            <Badge variant="secondary" className="mx-auto w-fit gap-2 px-4 py-1 text-sm">
              <Sparkles aria-hidden className="size-4" />
              Pain Points
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Does This Sound Familiar?</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {PAIN_POINTS.map((pain) => (
              <Card
                key={pain.title}
                className="flex h-full flex-col border-border/50 bg-card/70 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                <CardHeader className="space-y-4">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-2xl" aria-hidden>
                    {pain.icon}
                  </div>
                  <CardTitle>{pain.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed text-muted-foreground">
                    {pain.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
          <Separator className="my-6" />
          <div className="mx-auto max-w-3xl space-y-6 text-left">
            <p className="text-xl font-semibold">The problem isn't:</p>
            <ul className="space-y-3">
              {['Consuming enough content', 'A lack of willpower', 'Not tracking streaks religiously'].map(
                (item) => (
                  <li key={item} className="flex items-center gap-3">
                    <Badge variant="destructive" className="rounded-full px-3 py-1 text-xs uppercase tracking-wide">
                      ❌
                    </Badge>
                    <span>{item}</span>
                  </li>
                )
              )}
            </ul>
            <div className="space-y-3">
              <p className="font-semibold">But from my experience:</p>
              <p className="text-muted-foreground">
                Content isn't structured for action. Self-improvement advice alone is designed to inspire, not implement. And
                even with the best effort from the author, it's still up to you to take what they say, break it down into
                actionables, and stick to them.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="outcomes" className="scroll-mt-24 border-y border-border bg-card py-20">
        <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 sm:px-6 lg:px-8">
          <div className="space-y-4 text-center">
            <Badge variant="secondary" className="mx-auto w-fit gap-2 px-4 py-1 text-sm">
              <Sparkles aria-hidden className="size-4" />
              Outcomes
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Consum is designed to do 3 things...
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {OUTCOMES.map((outcome) => (
              <Card
                key={outcome.title}
                className="flex h-full flex-col border-border/50 bg-card/70 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                <CardHeader className="space-y-4">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-2xl" aria-hidden>
                    {outcome.icon}
                  </div>
                  <CardTitle>{outcome.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {outcome.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-24 bg-background py-20">
        <div className="mx-auto flex max-w-6xl flex-col gap-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge variant="secondary" className="mx-auto mb-4 w-fit gap-2 px-4 py-1 text-sm">
              <Sparkles aria-hidden className="size-4" />
              Product
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
              Consum — Your Content-to-Action Engine
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-lg text-muted-foreground md:text-xl">
              Consum transforms self-improvement content into personalized habit blueprints you can actually follow.
            </p>
          </div>

          <div className="flex flex-col gap-12">
            <div className="mx-auto max-w-4xl space-y-8 text-center">
              <h3 className="text-2xl font-bold md:text-3xl">How It Works</h3>
              <div className="grid gap-8 md:grid-cols-3">
                {['Share Your Content 🎥', 'AI Analyzes & Structures 🤖', 'Get Your Blueprint & Take Action ✅'].map(
                  (step, index) => (
                    <div
                      key={step}
                      className="flex flex-col items-center gap-4 rounded-2xl border border-border/40 bg-background/70 p-8"
                    >
                      <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                        {index + 1}
                      </div>
                      <p className="text-base font-semibold text-foreground md:text-lg">{step}</p>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="mx-auto max-w-4xl space-y-8">
              <h3 className="text-2xl font-bold">Adaptive Blueprint Types</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {BLUEPRINT_TYPES.map((type) => (
                  <div
                    key={type.type}
                    className="flex items-center gap-4 rounded-2xl border border-border/50 bg-background/70 p-5"
                  >
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-lg" aria-hidden>
                      {type.icon}
                    </div>
                    <div>
                      <p className="font-semibold">{type.type}</p>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Card className="border border-border/60 bg-card/70 shadow-sm">
              <CardContent className="flex flex-col gap-6 p-8 md:flex-row md:items-center">
                <div className="hidden h-full w-1 rounded-full bg-primary md:block" aria-hidden />
                <div className="flex items-start gap-4">
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/10" aria-hidden>
                    <Quote className="size-5 text-primary" />
                  </div>
                  <div className="space-y-3 text-left">
                    <p className="text-sm uppercase tracking-wide text-muted-foreground">Message From the Founder</p>
                    <p className="text-base text-muted-foreground">
                      “I built Consum because I was drowning in my own YouTube Watch Later list. After saving hundreds of
                      self-improvement videos but never implementing anything, I realized the problem wasn't motivation—it was
                      the gap between inspiration and action.”
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border bg-card shadow-xl">
              <CardContent className="flex flex-col gap-6 p-10 text-center">
                <h3 className="text-3xl font-bold md:text-4xl">Stop Consuming. Start Transforming.</h3>
                <p className="text-lg text-muted-foreground">
                  Join hundreds of people turning their Watch Later lists into action plans.
                </p>
                <div className="flex flex-col items-center justify-center gap-3 md:flex-row">
                  <Button
                    size="lg"
                    className="gap-2 rounded-full px-8 py-6 text-base font-semibold md:text-lg"
                    onClick={handleAuthNavigation}
                  >
                    Create Your First Blueprint (Free)
                    <ArrowRight aria-hidden className="size-5" />
                  </Button>
                  <Button variant="secondary" size="lg" className="rounded-full px-8 py-6 text-base">
                    No credit card required
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">Get your first blueprint in 60 seconds.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="faq" className="scroll-mt-24 border-t border-border bg-card py-20">
        <div className="mx-auto max-w-3xl space-y-10 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge variant="secondary" className="mx-auto mb-4 w-fit gap-2 px-4 py-1 text-sm">
              <Sparkles aria-hidden className="size-4" />
              FAQ
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight">Frequently Asked Questions</h2>
          </div>
          <Accordion
            className="w-full overflow-hidden rounded-2xl border border-border/80 divide-y divide-border/60 bg-background/50"
            collapsible
            type="single"
          >
            {FAQS.map((faq) => (
              <AccordionItem key={faq.question} value={faq.question} className="border-none">
                <AccordionTrigger className="px-6 py-4 text-left text-base font-semibold hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <footer className="bg-background py-12">
        <div className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6 lg:px-8">
          <Separator />
          <nav className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            {['About', 'Privacy', 'Terms', 'Contact'].map((label) => (
              <a key={label} className="transition-colors hover:text-foreground" href="#">
                {label}
              </a>
            ))}
          </nav>
          <p className="text-center text-xs text-muted-foreground/80">© 2025 Consum. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
