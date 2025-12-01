import React from 'react'
import { Sparkles } from 'lucide-react'

import { FAQS } from '../../data/landingContent'
import { Badge } from '../ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion'

export const FaqSection: React.FC = () => (
  <section id="faq" className="scroll-mt-24 border-t border-border bg-card py-20">
    <div className="mx-auto max-w-3xl space-y-10 px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <Badge variant="secondary" className="mx-auto mb-4 w-fit gap-2 px-4 py-1 text-sm">
          <Sparkles aria-hidden className="size-4" />
          FAQ
        </Badge>
        <h2 className="text-3xl font-bold tracking-tight">Frequently asked questions</h2>
      </div>
      <Accordion className="w-full overflow-hidden rounded-2xl border border-border/80" collapsible type="single">
        {FAQS.map((faq, index) => (
          <AccordionItem
            key={faq.question}
            value={`faq-${index}`}
            className={`bg-background/80 ${index === FAQS.length - 1 ? 'border-b-0' : ''}`}
          >
            <AccordionTrigger className="px-6 py-4 text-left text-base font-semibold">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4 text-muted-foreground">{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </section>
)

export default FaqSection
