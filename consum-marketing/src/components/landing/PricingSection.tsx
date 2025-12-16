'use client'

import React from 'react'
import { CheckCircle2, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { PRICING_TIERS } from '@/data/landingContent'

type PricingSectionProps = {
  id?: string
  appUrl?: string
  title?: string
  subtitle?: string
}

export const PricingSection: React.FC<PricingSectionProps> = ({ 
  id = 'pricing', 
  appUrl = 'https://app.consum.app',
  title = 'Pick your momentum.',
  subtitle = 'Start free, then upgrade when you need scale.'
}) => {
  const normalizedAppUrl = appUrl.endsWith('/') ? appUrl.slice(0, -1) : appUrl
  const signupUrl = `${normalizedAppUrl}/signup`

  const handleCta = () => {
    if (typeof window === 'undefined') return
    window.location.assign(signupUrl)
  }

  return (
    <section id={id} className="scroll-mt-24 bg-background py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-4 text-center">
          <Badge variant="secondary" className="mx-auto w-fit gap-2 px-4 py-1 text-sm">
            <Sparkles aria-hidden className="size-4" />
            Pricing
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h2>
          <p className="text-lg text-muted-foreground">{subtitle}</p>
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
                  onClick={handleCta}
                >
                  {tier.cta}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
