'use client'

import React, { useMemo, useState } from 'react'
import Image from 'next/image'
import { ArrowRight, CheckCircle2, Sparkles, Menu, X, Zap, Brain, TrendingUp, Database } from 'lucide-react'
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
} from '@/data/landingContent'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { LogoMark } from '@/components/ui/LogoMark'
import { FaqSection } from './FaqSection'

type RawTimelineStep = (typeof HOW_IT_WORKS_STEPS)[number]
type TimelineStep = RawTimelineStep & { image: string }

const STEP_IMAGES = [
  '/step_by_step/Consum1.webp',
  '/step_by_step/Consum2.webp',
  '/step_by_step/Consum3.webp',
  '/step_by_step/Consum4.webp',
]

const TIMELINE_STEPS: TimelineStep[] = HOW_IT_WORKS_STEPS.map((step, index) => ({
  ...step,
  image: STEP_IMAGES[index % STEP_IMAGES.length],
}))

type LandingPageContentProps = {
  appUrl: string
}

export const LandingPageContent: React.FC<LandingPageContentProps> = ({ appUrl }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const normalizedAppUrl = useMemo(() => {
    if (!appUrl) return 'https://app.consum.app'
    return appUrl.endsWith('/') ? appUrl.slice(0, -1) : appUrl
  }, [appUrl])

  const loginUrl = `${normalizedAppUrl}/login`
  const signupUrl = `${normalizedAppUrl}/signup`

  const navigateTo = (url: string) => {
    if (typeof window === 'undefined') return
    window.location.href = url
  }

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
  const goToLogin = () => navigateTo(loginUrl)
  const handlePrimaryCta = () => navigateTo(signupUrl)
  const handleSignupCta = () => navigateTo(signupUrl)
  const openMobileMenu = () => setIsMobileMenuOpen(true)

  const authButtonLabel = 'Log in'

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
              onClick={goToLogin}
              className="rounded-full px-4"
            >
              {authButtonLabel}
            </Button>
            <Button
              size="sm"
              className="rounded-full px-4"
              onClick={handleSignupCta}
            >
              Sign up free
            </Button>
          </div>
          <div className="ml-auto flex items-center gap-2 md:hidden">
            <Button
              size="sm"
              className="rounded-full px-4"
              onClick={handleSignupCta}
            >
              Sign up
            </Button>
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
                    onClick={goToLogin}
                  >
                    {authButtonLabel}
                  </Button>
                  <Button
                    className="w-full rounded-2xl py-3"
                    onClick={handleSignupCta}
                  >
                    Sign up
                  </Button>
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
                onClick={handlePrimaryCta}
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
                  <div
                    className="absolute inset-x-0 -top-4 z-20 h-[2px] bg-primary opacity-0 shadow-[0_0_15px_rgba(var(--primary),0.6)] blur-[1px] transition-all duration-1000 group-hover:top-full group-hover:opacity-100"
                    aria-hidden
                  />
                  <div className="absolute left-0 top-0 h-6 w-6 border-l-2 border-t-2 border-primary/20 transition-colors group-hover:border-primary/60" />
                  <div className="absolute right-0 top-0 h-6 w-6 border-r-2 border-t-2 border-primary/20 transition-colors group-hover:border-primary/60" />
                  <div className="absolute bottom-0 left-0 h-6 w-6 border-b-2 border-l-2 border-primary/20 transition-colors group-hover:border-primary/60" />
                  <div className="absolute bottom-0 right-0 h-6 w-6 border-b-2 border-r-2 border-primary/20 transition-colors group-hover:border-primary/60" />
                  <div className="mb-6 flex items-center justify-between font-mono text-xs tracking-wider text-muted-foreground">
                    <span className="opacity-70">TRT_0{i + 1}</span>
                    <div className="flex items-center gap-2">
                      <span className="hidden uppercase text-primary/80 group-hover:inline-block">MATCH CONFIRMED</span>
                      <span className="uppercase opacity-50 group-hover:hidden">Scanning...</span>
                      <div className="size-2 rounded-full bg-muted-foreground/30 transition-all duration-300 group-hover:animate-pulse group-hover:bg-primary group-hover:shadow-[0_0_8px_currentColor]" />
                    </div>
                  </div>
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
                onClick={handlePrimaryCta}
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
                const isWide = i === 0 || i === 3
                const icons = [Brain, Zap, TrendingUp, Database]
                const Icon = icons[i % icons.length]

                return (
                  <div
                    key={claim.title}
                    className={`
                      group relative overflow-hidden rounded-3xl border border-border/50 bg-card/50 p-8 shadow-sm transition-all duration-500 hover:bg-card/80 hover:shadow-xl hover:-translate-y-1
                      ${isWide ? 'md:col-span-2' : 'md:col-span-1'}
                    `}
                  >
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
              <div className="hidden lg:grid lg:grid-cols-[1fr_auto_1fr] lg:gap-x-16 lg:gap-y-0">
                {TIMELINE_STEPS.map((step, index) => {
                  const isEven = index % 2 === 0
                  const isLast = index === TIMELINE_STEPS.length - 1

                  return (
                    <React.Fragment key={step.title}>
                      <div className={`py-24 flex flex-col justify-center ${isEven ? 'items-end text-right' : 'items-start text-left'}`}>
                        {isEven ? (
                          <div className="space-y-4 max-w-md">
                            <h3 className="text-3xl font-bold text-foreground">{step.title}</h3>
                            <p className="text-lg text-muted-foreground leading-relaxed">{step.description}</p>
                          </div>
                        ) : (
                          <div className="relative rounded-2xl border border-border/40 bg-card/50 p-2 shadow-2xl transition-transform duration-500 hover:-translate-y-2">
                            <Image
                              src={step.image}
                              alt={`${step.title} screenshot`}
                              width={640}
                              height={384}
                              className="h-64 w-full max-w-md rounded-xl object-cover"
                              loading="lazy"
                            />
                          </div>
                        )}
                      </div>
                      <div className="relative flex flex-col items-center">
                        <span className="flex size-10 items-center justify-center rounded-full border border-border bg-background font-mono text-sm font-semibold">
                          {step.step}
                        </span>
                        {!isLast && <span className="my-4 w-px flex-1 bg-border" aria-hidden />}
                      </div>
                      <div className={`py-24 flex flex-col justify-center ${isEven ? 'items-start text-left' : 'items-end text-right'}`}>
                        {isEven ? (
                          <div className="relative rounded-2xl border border-border/40 bg-card/50 p-2 shadow-2xl transition-transform duration-500 hover:-translate-y-2">
                            <Image
                              src={step.image}
                              alt={`${step.title} screenshot`}
                              width={640}
                              height={384}
                              className="h-64 w-full max-w-md rounded-xl object-cover"
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
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-4 text-center">
              <Badge variant="secondary" className="mx-auto w-fit gap-2 px-4 py-1 text-sm">
                <Sparkles aria-hidden className="size-4" />
                Pricing
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Pick your momentum.</h2>
              <p className="text-lg text-muted-foreground">Start free, then upgrade when you need scale.</p>
            </div>
            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {PRICING_TIERS.map(tier => (
                <Card
                  key={tier.name}
                  className={`flex flex-col justify-between border-border/70 bg-card/70 ${tier.highlight ? 'ring-2 ring-primary/50' : ''}`}
                >
                  <CardHeader>
                    {tier.badgeText && (
                      <Badge className="w-fit rounded-full px-3 py-1 text-xs">
                        {tier.badgeText}
                      </Badge>
                    )}
                    <CardTitle className="text-3xl">{tier.name}</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      {tier.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <p className="text-4xl font-bold text-foreground">{tier.price}</p>
                      <p className="text-muted-foreground">{tier.period}</p>
                    </div>
                    <ul className="space-y-3 text-muted-foreground">
                      {tier.features.map(feature => (
                        <li key={feature} className="flex items-center gap-3">
                          <CheckCircle2 className="size-4 text-primary" aria-hidden />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <div className="p-6 pt-0">
                    <Button
                      variant={tier.buttonVariant as 'default' | 'secondary' | 'outline'}
                      className="w-full rounded-full py-3"
                      onClick={tier.name === 'Free' ? () => navigateTo(loginUrl) : handlePrimaryCta}
                    >
                      {tier.cta}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="cta" className="scroll-mt-24 border-t border-border bg-card py-20">
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 px-4 text-center sm:px-6 lg:px-8">
            <Badge variant="secondary" className="mx-auto w-fit gap-2 px-4 py-1 text-sm">
              <Sparkles aria-hidden className="size-4" />
              {FINAL_CTA.eyebrow}
            </Badge>
            <div className="space-y-6">
              <h2 className="text-4xl font-bold tracking-tight md:text-5xl">{FINAL_CTA.headline}</h2>
              <p className="text-lg text-muted-foreground">{FINAL_CTA.subheadline}</p>
            </div>
            <div className="flex flex-col items-center gap-4 md:flex-row">
              <Button
                size="lg"
                className="rounded-full px-8 py-6 text-base font-semibold md:text-lg"
                onClick={handlePrimaryCta}
              >
                {FINAL_CTA.primaryCta}
              </Button>
              <Button
                variant="ghost"
                className="text-base"
                onClick={goToLogin}
              >
                {FINAL_CTA.secondaryCta}
              </Button>
            </div>
          </div>
        </section>

        <FaqSection faqs={FAQS} />

        <footer className="border-t border-border/60 bg-background py-10">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 text-sm text-muted-foreground md:flex-row">
            <p>© {new Date().getFullYear()} Consum. All rights reserved.</p>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              {FOOTER_LINKS.map(link => (
                <a key={link.href} href={link.href} className="transition-colors hover:text-foreground">
                  {link.label}
                </a>
              ))}
              <a href={loginUrl} className="transition-colors hover:text-foreground">
                Log in
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}

type MobileStepCardProps = {
  step: TimelineStep
}

const MobileStepCard: React.FC<MobileStepCardProps> = ({ step }) => (
    <div className="space-y-4">
    <div className="flex items-center gap-3">
      <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
        {step.step}
      </span>
      <h3 className="text-xl font-semibold">{step.title}</h3>
    </div>
    <p className="text-muted-foreground">{step.description}</p>
    <div className="overflow-hidden rounded-2xl border border-border/60">
        <Image
          src={step.image}
          alt={`${step.title} preview`}
          width={640}
          height={360}
          className="h-56 w-full object-cover"
          loading="lazy"
        />
    </div>
  </div>
)

export default LandingPageContent
