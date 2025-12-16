'use client'

import React from 'react'
import { Sparkles, Flag, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ROADMAP_CONTENT } from '@/data/landingContent'
import { cn } from '@/lib/utils'

export const RoadmapSection: React.FC = () => {
  return (
    <section id="roadmap" className="scroll-mt-24 bg-background py-20 border-t border-border/40">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="space-y-4 text-center mb-16">
          <Badge variant="secondary" className="mx-auto w-fit gap-2 px-4 py-1 text-sm">
            <Sparkles aria-hidden className="size-4" />
            {ROADMAP_CONTENT.eyebrow}
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl text-balance">
            {ROADMAP_CONTENT.headline}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {ROADMAP_CONTENT.subheadline}
          </p>
        </div>

        {/* Grid Container */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Connecting Line (Desktop Only) */}
          <div className="hidden md:block absolute top-6 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-primary/20 to-border/40 -z-10 translate-y-4" />

          {ROADMAP_CONTENT.phases.map((phase, index) => {
            // In a real roadmap, you might want distinct 'completed', 'active', 'planned' states.
            // Based on data: Phase 1 is in-progress, others are planned.
            
            return (
              <div 
                key={index} 
                className="group relative flex flex-col h-full bg-card/40 border border-border/50 hover:border-border/80 rounded-2xl p-6 transition-all duration-300 hover:bg-card/60 hover:-translate-y-1 hover:shadow-md"
              >
                {/* Phase Indicator Pill */}
                <div className="mb-6 flex items-center justify-between">
                  <div className={cn(
                    "flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider",
                    phase.status === 'in-progress' 
                      ? "border-primary/20 bg-primary/10 text-primary"
                      : "border-border bg-muted/50 text-muted-foreground"
                  )}>
                    <div className={cn(
                      "size-2 rounded-full",
                       phase.status === 'in-progress' ? "bg-primary animate-pulse" : "bg-muted-foreground/40"
                    )} />
                    {phase.status === 'in-progress' ? 'Active' : 'Planned'}
                  </div>
                  <span className="font-mono text-xs text-muted-foreground/50">0{index + 1}</span>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                  {phase.title}
                </h3>
                
                <ul className="space-y-3 mt-auto">
                  {phase.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <div className={cn(
                        "mt-1 size-1.5 rounded-full shrink-0",
                        phase.status === 'in-progress' ? "bg-primary/60" : "bg-muted-foreground/40"
                      )} />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>

                {/* Mobile Connector (visual flair for mobile stack) */}
                {index !== ROADMAP_CONTENT.phases.length - 1 && (
                  <div className="md:hidden absolute -bottom-6 left-1/2 -translate-x-1/2 text-border">
                    <ArrowRight className="size-4 rotate-90" />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Destination Footer */}
        <div className="mt-12 md:mt-16 flex justify-center">
           <div className="inline-flex items-center gap-3 rounded-full border border-border bg-background px-5 py-2 text-sm text-muted-foreground shadow-sm">
              <Flag className="size-4 text-primary" />
              <span className="font-medium text-foreground">Goal:</span>
              <span>{ROADMAP_CONTENT.endProduct}</span>
           </div>
        </div>

      </div>
    </section>
  )
}
