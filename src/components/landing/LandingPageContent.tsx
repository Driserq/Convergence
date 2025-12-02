import React, { useState } from 'react'
import { ArrowRight, CheckCircle2, Sparkles, Menu, X } from 'lucide-react'
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
          <div className="flex items-center gap-2 md:hidden">
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
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {RELEVANCE_POINTS.map(point => (
                <Card
                  key={point}
                  className="border border-border/60 bg-card/70 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                >
                  <CardContent className="flex h-full flex-col gap-4 p-6">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary" aria-hidden>
                      <CheckCircle2 className="size-5" />
                    </div>
                    <p className="text-lg font-semibold text-foreground/90">{point}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-10 flex justify-center">
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

        <section id="value" className="scroll-mt-24 bg-card/30 py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-4 text-center">
              <Badge variant="secondary" className="mx-auto w-fit gap-2 px-4 py-1 text-sm">
                <Sparkles aria-hidden className="size-4" />
                Value
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Tailored actionables without the busywork.</h2>
              <p className="text-lg text-muted-foreground">Every claim is built for speed, precision, and zero fluff.</p>
            </div>
            <div className="mt-12 space-y-6">
              {VALUE_CLAIMS.map(claim => (
                <div
                  key={claim.title}
                  className="rounded-3xl border border-border/40 bg-card/70 p-6 shadow-lg"
                >
                  <div className="h-1 w-16 rounded-full bg-primary" aria-hidden />
                  <h3 className="mt-4 text-2xl font-semibold text-foreground md:text-3xl">{claim.title}</h3>
                  <p className="mt-3 text-lg text-muted-foreground">{claim.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-24 bg-background py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-4 text-center">
              <Badge variant="secondary" className="mx-auto w-fit gap-2 px-4 py-1 text-sm">
                <Sparkles aria-hidden className="size-4" />
                How it works
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Seven quiet steps from feed to follow-through.</h2>
              <p className="text-lg text-muted-foreground">Consum stays invisible while you stay in flow.</p>
            </div>
            <div className="mt-12 space-y-10">
              {HOW_IT_WORKS_STEPS.map((step, index) => (
                <div key={step.title} className="relative pl-16">
                  {index !== HOW_IT_WORKS_STEPS.length - 1 && (
                    <span
                      className="absolute left-[22px] top-12 z-0 block h-[calc(100%+24px)] w-px bg-primary/20"
                      aria-hidden
                    />
                  )}
                  <span className="absolute left-0 top-0 z-10 flex size-12 items-center justify-center rounded-full border border-primary/60 bg-background text-sm font-semibold text-primary shadow-sm">
                    {step.step}
                  </span>
                  <div className="rounded-2xl border border-border/40 bg-card/60 p-6 shadow-sm">
                    <h3 className="text-2xl font-semibold">{step.title}</h3>
                    <p className="mt-3 text-base text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
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
