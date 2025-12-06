import React, { useState } from 'react'
import { ArrowRight, CheckCircle2, Sparkles, Menu, X, Zap, Brain, TrendingUp, Database, Target, Hourglass, Layers } from 'lucide-react'
import * as DialogPrimitive from '@radix-ui/react-dialog'

import {
  SECTION_LINKS,
  HERO_CONTENT,
  RELEVANCE_POINTS,
  VALUE_CLAIMS,
  HOW_IT_WORKS_STEPS,
  PRICING_TIERS,
  FINAL_CTA,
  FAQS,
  FOOTER_LINKS,
} from '../../data/landingContent'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'
import { Separator } from '../ui/separator'
import { LogoMark } from '../ui/LogoMark'
import { FaqSection } from './FaqSection'

type RawTimelineStep = (typeof HOW_IT_WORKS_STEPS)[number]
type TimelineStep = RawTimelineStep & { image: string }

const STEP_IMAGES = [
  new URL('../../../step_by_step/Consum1.webp', import.meta.url).href,
  new URL('../../../step_by_step/Consum2.webp', import.meta.url).href,
  new URL('../../../step_by_step/Consum3.webp', import.meta.url).href,
  new URL('../../../step_by_step/Consum4.webp', import.meta.url).href,
]

const TIMELINE_STEPS: TimelineStep[] = HOW_IT_WORKS_STEPS.map((step, index) => ({
  ...step,
  image: STEP_IMAGES[index % STEP_IMAGES.length],
}))

type LandingPageContentProps = {
  isAuthenticated: boolean
  onPrimaryCta: () => void
  onSignupCta?: () => void
}

export const LandingPageContent: React.FC<LandingPageContentProps> = ({
  isAuthenticated,
  onPrimaryCta,
  onSignupCta,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSectionScroll = (target: string) => {
    if (typeof window === 'undefined') return
    const element = document.getElementById(target)
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const closeMobileMenu = () => setIsMobileMenuOpen(false)
  const handleSectionNavMobile = (target: string) => {
    handleSectionScroll(target)
    closeMobileMenu()
  }
  const handleMobilePrimaryCta = () => {
    onPrimaryCta()
    closeMobileMenu()
  }
  const handleMobileSignupCta = () => {
    onSignupCta?.()
    closeMobileMenu()
  }
  const openMobileMenu = () => setIsMobileMenuOpen(true)

  const authButtonLabel = isAuthenticated ? 'Go to Dashboard' : 'Log In'
  const showSignupButton = !isAuthenticated && Boolean(onSignupCta)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => handleSectionScroll('hero')}
            className="flex h-full items-center gap-2 text-xl font-bold text-foreground transition-colors hover:text-primary"
          >
            <LogoMark className="h-full w-auto" />
            <span>Consum</span>
          </button>
          <nav className="hidden flex-1 items-center justify-center gap-6 text-sm font-semibold md:flex">
            {SECTION_LINKS.map(link => (
              <button
                key={link.target}
                onClick={() => handleSectionScroll(link.target)}
                className="whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </button>
            ))}
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <Button
              size="sm"
              variant="secondary"
              onClick={onPrimaryCta}
              className="rounded-full px-4"
            >
              {authButtonLabel}
            </Button>
            {showSignupButton && (
              <Button
                size="sm"
                className="rounded-full px-4"
                onClick={onSignupCta}
              >
                Sign Up
              </Button>
            )}
          </div>
          <div className="ml-auto flex items-center gap-2 md:hidden">
            {showSignupButton && (
              <Button
                size="sm"
                className="rounded-full px-4"
                onClick={onSignupCta}
              >
                Sign Up
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full border-border/70"
              onClick={openMobileMenu}
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <DialogPrimitive.Root open={isMobileMenuOpen} onOpenChange={(val) => { if (!val) closeMobileMenu() }}>
          <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-background/60 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 md:hidden" />
            <DialogPrimitive.Content className="fixed inset-y-0 right-0 z-50 w-[85vw] max-w-sm border-l border-border/60 bg-background p-6 shadow-2xl transition-transform duration-200 data-[state=open]:animate-in data-[state=open]:slide-in-from-right data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right md:hidden">
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold">Menu</p>
                <button
                  type="button"
                  onClick={closeMobileMenu}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 text-muted-foreground"
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-6 flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  {SECTION_LINKS.map(link => (
                    <button
                      key={link.target}
                      type="button"
                      onClick={() => handleSectionNavMobile(link.target)}
                      className="w-full rounded-2xl border border-border/60 px-4 py-3 text-left text-base font-semibold text-foreground transition-colors hover:bg-primary/10"
                    >
                      {link.label}
                    </button>
                  ))}
                </div>
                <Separator />
                <div className="flex flex-col gap-3">
                  <Button
                    variant="secondary"
                    className="w-full rounded-2xl py-3"
                    onClick={handleMobilePrimaryCta}
                  >
                    {authButtonLabel}
                  </Button>
                  {showSignupButton && (
                    <Button
                      className="w-full rounded-2xl py-3"
                      onClick={handleMobileSignupCta}
                    >
                      Sign Up
                    </Button>
                  )}
                </div>
              </div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
      </header>

      <main>
        <section id="hero" className="relative isolate overflow-hidden bg-background">
          <div
            className="absolute inset-0 opacity-20"
            aria-hidden
            style={{ background: 'radial-gradient(circle at top, var(--primary) 0%, transparent 60%)' }}
          />
          <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col items-center justify-center gap-10 px-4 py-24 text-center sm:px-6 lg:px-8">
            <div className="rounded-full border border-primary/30 bg-background/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              {HERO_CONTENT.eyebrow}
            </div>
            <div className="space-y-6">
              <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight md:text-6xl">
                {HERO_CONTENT.headline}
              </h1>
              <p className="mx-auto max-w-3xl text-lg text-muted-foreground md:text-2xl">
                {HERO_CONTENT.subheadline}
              </p>
            </div>
            <div className="flex flex-col items-center justify-center gap-3 md:flex-row">
              <Button
                size="lg"
                className="gap-2 rounded-full bg-primary px-8 py-6 text-base font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:bg-primary/90 md:text-lg"
                onClick={onPrimaryCta}
              >
                {HERO_CONTENT.primaryCta}
                <ArrowRight aria-hidden className="size-5" />
              </Button>
              <Button
                variant="link"
                className="text-base text-muted-foreground hover:text-foreground"
                onClick={() => handleSectionScroll('how-it-works')}
              >
                {HERO_CONTENT.secondaryCta}
              </Button>
            </div>
          </div>
        </section>

        <section id="relevance" className="scroll-mt-24 bg-background py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-4 text-center">
              <Badge variant="secondary" className="mx-auto w-fit gap-2 px-4 py-1 text-sm">
                <Sparkles aria-hidden className="size-4" />
                Who is Consum for?
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">If this sounds like you, you belong here.</h2>
              <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
                High-agency operators who refuse to drown in “Watch Later” piles and want action-ready insights instead.
              </p>
            </div>
            <div className="mt-16 grid gap-6 md:grid-cols-3">
              {RELEVANCE_POINTS.map((point, i) => (
                <div
                  key={point}
                  className="group relative overflow-hidden rounded-xl border border-border/40 bg-card/30 p-8 transition-all duration-300 hover:border-primary/50 hover:bg-card/50 hover:shadow-lg"
                >
                  {/* Scan Line Animation */}
                  <div 
                    className="absolute inset-x-0 -top-4 z-20 h-[2px] bg-primary opacity-0 shadow-[0_0_15px_rgba(var(--primary),0.6)] blur-[1px] transition-all duration-1000 group-hover:top-full group-hover:opacity-100" 
                    aria-hidden 
                  />

                  {/* HUD Corner Brackets */}
                  <div className="absolute left-0 top-0 h-6 w-6 border-l-2 border-t-2 border-primary/20 transition-colors group-hover:border-primary/60" />
                  <div className="absolute right-0 top-0 h-6 w-6 border-r-2 border-t-2 border-primary/20 transition-colors group-hover:border-primary/60" />
                  <div className="absolute bottom-0 left-0 h-6 w-6 border-b-2 border-l-2 border-primary/20 transition-colors group-hover:border-primary/60" />
                  <div className="absolute bottom-0 right-0 h-6 w-6 border-b-2 border-r-2 border-primary/20 transition-colors group-hover:border-primary/60" />

                  {/* HUD Header */}
                  <div className="mb-6 flex items-center justify-between font-mono text-xs tracking-wider text-muted-foreground">
                    <span className="opacity-70">TRT_0{i + 1}</span>
                    <div className="flex items-center gap-2">
                      <span className="hidden uppercase text-primary/80 group-hover:inline-block">MATCH CONFIRMED</span>
                      <span className="uppercase opacity-50 group-hover:hidden">Scanning...</span>
                      <div className="size-2 rounded-full bg-muted-foreground/30 transition-all duration-300 group-hover:animate-pulse group-hover:bg-primary group-hover:shadow-[0_0_8px_currentColor]" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="relative z-10 space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/5 text-muted-foreground/50 ring-1 ring-border/50 transition-all duration-500 group-hover:bg-primary/10 group-hover:text-primary group-hover:ring-primary/30">
                        <CheckCircle2 className="size-5" />
                      </div>
                      <p className="text-lg font-medium leading-relaxed text-muted-foreground transition-colors duration-300 group-hover:text-foreground">
                        {point}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-16 flex justify-center">
              <Button
                size="lg"
                className="gap-2 rounded-full px-8 py-6 text-base font-semibold md:text-lg"
                onClick={onPrimaryCta}
              >
                {HERO_CONTENT.primaryCta}
                <ArrowRight aria-hidden className="size-5" />
              </Button>
            </div>
          </div>
        </section>

        <section id="value" className="scroll-mt-24 bg-card/30 py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-4 text-center">
              <Badge variant="secondary" className="mx-auto w-fit gap-2 px-4 py-1 text-sm">
                <Sparkles aria-hidden className="size-4" />
                Value
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Tailored actionables without the busywork.</h2>
              <p className="text-lg text-muted-foreground">Every claim is built for speed, precision, and zero fluff.</p>
            </div>
            
            <div className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-3 md:auto-rows-[22rem]">
              {VALUE_CLAIMS.map((claim, i) => {
                // Row 1: Wide (2col) + Square (1col)
                // Row 2: Square (1col) + Wide (2col)
                const isWide = i === 0 || i === 3
                const icons = [Brain, Zap, TrendingUp, Database]
                const Icon = icons[i % icons.length]

                return (
                  <div
                    key={claim.title}
                    className={`
                      group relative overflow-hidden rounded-3xl border border-border/50 bg-card/50 p-8 shadow-sm transition-all duration-500 hover:bg-card/80 hover:shadow-xl hover:-translate-y-1
                      ${isWide ? "md:col-span-2" : "md:col-span-1"}
                    `}
                  >
                    {/* Gradient Blob Background */}
                    <div 
                      className={`absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-20 blur-3xl transition-opacity duration-700 group-hover:opacity-40 ${isWide ? 'bg-primary' : 'bg-blue-500'}`} 
                      aria-hidden
                    />
                    
                    <div className="relative flex h-full flex-col justify-between">
                      <div className="flex size-14 items-center justify-center rounded-2xl bg-background/50 shadow-sm backdrop-blur-sm ring-1 ring-border/50 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                        <Icon className="size-7 text-primary" />
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="text-2xl font-bold leading-tight text-foreground md:text-3xl">
                          {claim.title}
                        </h3>
                        <p className="text-lg text-muted-foreground/90 leading-relaxed">
                          {claim.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-24 bg-background py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-4 text-center">
              <Badge variant="secondary" className="mx-auto w-fit gap-2 px-4 py-1 text-sm">
                <Sparkles aria-hidden className="size-4" />
                Step by step
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Exactly how Consum works, step by step.</h2>
              <p className="text-lg text-muted-foreground">Four moves from intention to actual change.</p>
            </div>
            <div className="mt-16 space-y-12 lg:space-y-0 lg:mt-0">
              {/* Mobile View */}
              <div className="space-y-12 lg:hidden">
                {TIMELINE_STEPS.map((step) => (
                  <div key={step.title} className="relative flex pl-6">
                    <span
                      className="absolute inset-y-6 left-0 w-px bg-border/40"
                      aria-hidden
                    />
                    <MobileStepCard step={step} />
                  </div>
                ))}
              </div>

              {/* Desktop View */}
              <div className="hidden lg:grid lg:grid-cols-[1fr_auto_1fr] lg:gap-x-16 lg:gap-y-0">
                {TIMELINE_STEPS.map((step, index) => {
                  const isEven = index % 2 === 0
                  const isLast = index === TIMELINE_STEPS.length - 1
                  
                  return (
                    <React.Fragment key={step.title}>
                      {/* Left Column */}
                      <div className={`py-24 flex flex-col justify-center ${isEven ? 'items-end text-right' : 'items-start text-left'}`}>
                        {isEven ? (
                          <div className="space-y-4 max-w-md">
                            <h3 className="text-3xl font-bold text-foreground">{step.title}</h3>
                            <p className="text-lg text-muted-foreground leading-relaxed">{step.description}</p>
                          </div>
                        ) : (
                          <div className="relative rounded-2xl border border-border/40 bg-card/50 p-2 shadow-2xl transition-transform duration-500 hover:-translate-y-2">
                            <img
                              src={step.image}
                              alt={`${step.title} screenshot`}
                              className="h-64 w-full max-w-md object-cover rounded-xl"
                              loading="lazy"
                            />
                          </div>
                        )}
                      </div>

                      {/* Center Spine */}
                      <div className="flex flex-col items-center h-full">
                        <div className={`w-px flex-1 ${index === 0 ? 'bg-transparent' : 'bg-border/30'}`} />
                        <div className="relative z-10 flex size-16 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-background shadow-lg shadow-primary/10">
                          <span className="text-lg font-bold text-primary">{step.step}</span>
                        </div>
                        <div className={`w-px flex-1 ${isLast ? 'bg-transparent' : 'bg-border/30'}`} />
                      </div>

                      {/* Right Column */}
                      <div className={`py-24 flex flex-col justify-center ${!isEven ? 'items-start text-left' : 'items-end text-right'}`}>
                        {isEven ? (
                          <div className="relative rounded-2xl border border-border/40 bg-card/50 p-2 shadow-2xl transition-transform duration-500 hover:-translate-y-2">
                            <img
                              src={step.image}
                              alt={`${step.title} screenshot`}
                              className="h-64 w-full max-w-md object-cover rounded-xl"
                              loading="lazy"
                            />
                          </div>
                        ) : (
                          <div className="space-y-4 max-w-md">
                            <h3 className="text-3xl font-bold text-foreground">{step.title}</h3>
                            <p className="text-lg text-muted-foreground leading-relaxed">{step.description}</p>
                          </div>
                        )}
                      </div>
                    </React.Fragment>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="scroll-mt-24 bg-background py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-4 text-center">
              <Badge variant="secondary" className="mx-auto w-fit gap-2 px-4 py-1 text-sm">
                <Sparkles aria-hidden className="size-4" />
                Pricing
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Choose the pace you want to grow at.</h2>
              <p className="text-lg text-muted-foreground">Free forever, $5 weekly sprints, or $10 for full accountability.</p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {PRICING_TIERS.map(tier => (
                <Card
                  key={tier.name}
                  className={`relative flex h-full flex-col border ${
                    tier.highlight
                      ? 'border-primary/70 bg-primary/5 shadow-lg shadow-primary/30'
                      : 'border-border/60 bg-card/80 shadow-sm'
                  }`}
                >
                  {tier.badgeText && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-primary/40 bg-background/80 px-4 py-1 text-xs uppercase tracking-wide text-primary">
                      {tier.badgeText}
                    </Badge>
                  )}
                  <CardHeader className="space-y-2 pt-8">
                    <CardTitle className="text-2xl font-semibold">{tier.name}</CardTitle>
                    <CardDescription>{tier.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col gap-6 pb-8">
                    <div>
                      <span className="text-4xl font-bold">{tier.price}</span>
                      <span className="ml-2 text-sm text-muted-foreground">{tier.period}</span>
                    </div>
                    <ul className="space-y-3 text-sm text-foreground/80">
                      {tier.features.map(feature => (
                        <li key={feature} className="flex items-start gap-3 text-base">
                          <CheckCircle2 className="mt-1 size-4 text-primary" aria-hidden />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant={(tier.buttonVariant as 'default' | 'secondary' | 'outline') ?? 'default'}
                      size="lg"
                      className={`mt-auto gap-2 rounded-full px-6 ${tier.highlight ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}`}
                      onClick={onPrimaryCta}
                    >
                      {tier.cta}
                      <ArrowRight aria-hidden className="size-5" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="cta" className="scroll-mt-24 bg-gradient-to-b from-background via-primary/10 to-background py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <Card className="relative overflow-hidden border border-border/80 bg-card shadow-2xl">
              <CardContent className="space-y-6 p-10 text-center">
                <Badge variant="secondary" className="mx-auto w-fit gap-2 px-4 py-1 text-sm">
                  <Sparkles aria-hidden className="size-4" />
                  {FINAL_CTA.eyebrow}
                </Badge>
                <h3 className="text-3xl font-bold md:text-5xl">{FINAL_CTA.headline}</h3>
                <p className="text-lg text-muted-foreground">{FINAL_CTA.subheadline}</p>
                <div className="flex flex-col items-center justify-center gap-3 md:flex-row">
                  <Button
                    size="lg"
                    className="gap-2 rounded-full px-8 py-6 text-base font-semibold md:text-lg"
                    onClick={onPrimaryCta}
                  >
                    {FINAL_CTA.primaryCta}
                    <ArrowRight aria-hidden className="size-5" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    className="rounded-full px-8 py-6 text-base"
                    onClick={() => handleSectionScroll('how-it-works')}
                  >
                    {FINAL_CTA.secondaryCta}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <FaqSection />
      </main>

      <footer className="bg-background py-12">
        <div className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6 lg:px-8">
          <Separator />
          <nav className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            {FOOTER_LINKS.map(link => (
              <a key={link.label} className="transition-colors hover:text-foreground" href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>
          <p className="text-center text-xs text-muted-foreground">
            Feel free to reach out to me at <a href="mailto:support@consum.app" className="underline-offset-2 hover:underline">support@consum.app</a>
          </p>
          <p className="text-center text-xs text-muted-foreground/80">
            Built with ☕ and a dream on <a href="https://x.com/kuba_shev" className="underline-offset-2 hover:underline">X</a>
          </p>
          <p className="text-center text-xs text-muted-foreground/80">© {new Date().getFullYear()} Consum. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPageContent

type MobileStepCardProps = {
  step: TimelineStep
}

const MobileStepCard: React.FC<MobileStepCardProps> = ({ step }) => (
  <article className="w-full max-w-md rounded-2xl border border-border/50 bg-card/70 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
    <div className="overflow-hidden rounded-xl border border-border/40 bg-card/60">
      <img
        src={step.image}
        alt={`${step.title} screenshot`}
        className="h-56 w-full object-cover"
        loading="lazy"
      />
    </div>
    <div className="mt-4 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
        Step {step.step}
      </p>
      <h3 className="text-2xl font-semibold text-foreground">{step.title}</h3>
      <p className="text-base text-muted-foreground">{step.description}</p>
    </div>
  </article>
)
