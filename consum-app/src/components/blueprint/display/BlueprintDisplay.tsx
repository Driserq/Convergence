import React, { useMemo } from 'react'
import { Clock3, UserRound } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '../../ui/alert'
import { Badge } from '../../ui/badge'
import { Button } from '../../ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../ui/accordion'
import { cn } from '../../../lib/utils'
import type { AIBlueprint, BlueprintStatus, ContentType } from '../../../types/blueprint'
import {
  formatBlueprintDate,
  getOverviewPreview,
  mapBlueprintToSections,
  parseOverview,
  type BlueprintSection,
} from '../../../lib/blueprint-display'

interface BlueprintDisplayProps {
  blueprint: AIBlueprint | null
  /**
   * Detail: full stacked layout. Summary: compact accordion card.
   */
  variant: 'detail' | 'summary'
  metadata?: {
    goal: string
    createdAt: string
    status: BlueprintStatus
    contentType: ContentType
    contentSource?: string
    title?: string
    duration?: number | null
    authorName?: string
  }
  onNavigateToDetail?: () => void
  actionLabel?: string
  sectionOrder?: Array<BlueprintSection['id']>
  summaryFooterLeft?: React.ReactNode
  summaryFooterExtra?: React.ReactNode
  summaryMetaExtra?: React.ReactNode
}

const STATUS_STYLES: Record<BlueprintStatus, string> = {
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  failed: 'bg-red-50 text-red-700 border-red-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
}

const formatDuration = (seconds?: number | null): string | null => {
  if (!seconds || seconds <= 0) return null
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (hours === 0) return `${minutes}m`
  return `${hours}h ${remainingMinutes}m`
}

function reorderSections(sections: BlueprintSection[], order?: Array<BlueprintSection['id']>): BlueprintSection[] {
  if (!order?.length) {
    return sections
  }

  const orderIndex = new Map(order.map((id, idx) => [id, idx]))
  const originalIndex = new Map(sections.map((section, idx) => [section.id, idx]))

  return [...sections].sort((a, b) => {
    const aIndex = orderIndex.has(a.id)
      ? orderIndex.get(a.id)!
      : order.length + (originalIndex.get(a.id) ?? 0)
    const bIndex = orderIndex.has(b.id)
      ? orderIndex.get(b.id)!
      : order.length + (originalIndex.get(b.id) ?? 0)
    return aIndex - bIndex
  })
}

function SectionContent({ section, compact }: { section: BlueprintSection; compact?: boolean }) {
  return (
    <div className="space-y-4">
      {section.items.map((item, index) => {
        if (compact) {
          if (item.type === 'list' && item.items.length > 3) {
            return (
              <div key={`${section.id}-list-${index}`} className="space-y-2">
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {item.items.slice(0, 3).map((entry, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="mt-1 text-muted-foreground/70">•</span>
                      <span className="flex-1 leading-relaxed">{entry}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          }

          if (item.type === 'step') {
            return (
              <div key={`${section.id}-step-${item.stepNumber}`} className="rounded-xl border border-border/60 bg-background/70 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{`Step ${item.stepNumber}`}</p>
                    <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
                  </div>
                  {item.meta && (
                    <Badge variant="outline" className="text-xs">{item.meta}</Badge>
                  )}
                </div>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{item.description}</p>
              </div>
            )
          }
        }

        switch (item.type) {
          case 'paragraph':
            return (
              <p key={`${section.id}-paragraph-${index}`} className="text-sm leading-relaxed text-muted-foreground">
                {item.content}
              </p>
            )
          case 'list':
            return (
              <ul key={`${section.id}-list-${index}`} className="space-y-2 text-sm text-muted-foreground">
                {item.items.map((entry, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="mt-1 text-muted-foreground/70">•</span>
                    <span className="flex-1 leading-relaxed">{entry}</span>
                  </li>
                ))}
              </ul>
            )
          case 'step':
            return (
              <div key={`${section.id}-step-${item.stepNumber}`} className="rounded-2xl border border-border/70 bg-background/80 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {`Step ${item.stepNumber}`}
                    </p>
                    <h4 className="text-base font-semibold text-foreground">{item.title}</h4>
                  </div>
                  {item.meta && (
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/30 text-xs">
                      {item.meta}
                    </Badge>
                  )}
                </div>
                {/* Description mapped from AI 'description' field */}
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                {item.deliverable && (
                  <div className="mt-4 rounded-xl border border-primary/30 bg-primary/5 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">Deliverable</p>
                    <p className="mt-1 text-sm text-foreground leading-relaxed">{item.deliverable}</p>
                  </div>
                )}
              </div>
            )
          case 'troubleshooting':
            return (
              <div key={`${section.id}-trouble-${index}`} className="rounded-2xl border border-border/70 bg-background/80 p-5">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Problem</p>
                    <h4 className="text-base font-semibold text-foreground leading-snug">{item.problem}</h4>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Solution</p>
                    <p className="mt-1 text-sm text-foreground leading-relaxed">{item.solution}</p>
                  </div>

                  {item.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed border-l-2 border-border/60 pl-3">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            )
          case 'resource':
            return (
              <div key={`${section.id}-resource-${index}`} className="rounded-xl border border-border/60 bg-background/70 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h4 className="text-sm font-semibold text-foreground flex-1">{item.name}</h4>
                  <Badge variant="outline" className="text-xs capitalize">
                    {item.tag}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            )
          case 'checklist':
            return (
              <div key={`${section.id}-check-${index}`} className="flex items-start gap-3 rounded-xl border border-border/70 bg-background/70 p-4">
                <div className="mt-1 h-4 w-4 rounded-md border border-border/60" aria-hidden />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground leading-snug">{item.question}</p>
                  {item.description && (
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  )}
                  {item.weight && (
                    <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">{item.weight}</p>
                  )}
                </div>
              </div>
            )
          default:
            return null
        }
      })}
    </div>
  )
}

function SummaryVariant({
  blueprint,
  metadata,
  onNavigateToDetail,
  actionLabel = 'View Full Blueprint',
  footerExtra,
  footerLeft,
  metaExtra,
}: Pick<BlueprintDisplayProps, 'blueprint' | 'metadata' | 'onNavigateToDetail' | 'actionLabel' | 'summaryMetaExtra'> & {
  footerExtra?: React.ReactNode
  footerLeft?: React.ReactNode
  metaExtra?: React.ReactNode
}) {
  if (!metadata) return null

  const overview = useMemo(() => parseOverview(blueprint), [blueprint])
  const baseSections = useMemo(() => mapBlueprintToSections(blueprint), [blueprint])
  const sectionsWithPitfalls = useMemo(() => {
    if (!overview.mistakes.length) {
      return baseSections
    }

    if (baseSections.some((section) => section.id === 'common_pitfalls')) {
      return baseSections
    }

    const pitfallsSection: BlueprintSection = {
      id: 'common_pitfalls',
      title: 'Common pitfalls',
      description: undefined,
      items: [
        {
          type: 'list',
          items: overview.mistakes,
        },
      ],
    }

    const next = [...baseSections]
    const overviewIndex = next.findIndex((section) => section.id === 'overview')

    if (overviewIndex !== -1) {
      next.splice(overviewIndex + 1, 0, pitfallsSection)
    } else {
      next.unshift(pitfallsSection)
    }

    return next
  }, [baseSections, overview])
  const accordionSections = useMemo(
    () => sectionsWithPitfalls.filter((section) => section.id !== 'overview'),
    [sectionsWithPitfalls]
  )
  const overviewPreview = useMemo(() => getOverviewPreview(blueprint, 140), [blueprint])
  const canShowDetails = metadata.status === 'completed' && !!blueprint
  const displayTitle = metadata.title && metadata.title.trim().length > 0 ? metadata.title : metadata.goal
  const shouldShowGoalSubtitle = metadata.goal && metadata.goal !== displayTitle
  const durationLabel = formatDuration(metadata.duration)

  return (
    <Card className="rounded-2xl border border-border bg-card/95 shadow-sm transition hover:shadow-md">
      <CardHeader className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={metadata.contentType === 'youtube' ? 'default' : 'secondary'}>
              {metadata.contentType === 'youtube' ? 'YouTube' : 'Text'}
            </Badge>
            <Badge variant="outline" className={cn('text-xs', STATUS_STYLES[metadata.status])}>
              {metadata.status === 'completed' ? 'Ready' : metadata.status === 'pending' ? 'Processing' : 'Failed'}
            </Badge>
            {durationLabel && (
              <Badge variant="outline" className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock3 className="size-3" aria-hidden />
                {durationLabel}
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>Created {formatBlueprintDate(metadata.createdAt)}</span>
            {metaExtra && (
              <>
                <span className="text-muted-foreground/70">•</span>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">{metaExtra}</div>
              </>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <CardTitle className="text-xl font-semibold text-foreground">
            {displayTitle || 'Habit Blueprint'}
          </CardTitle>
          {shouldShowGoalSubtitle && (
            <CardDescription className="text-sm text-muted-foreground">
              {metadata.goal}
            </CardDescription>
          )}
        </div>

        {metadata.authorName && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground/90">
            <UserRound className="size-4 text-muted-foreground/70" aria-hidden />
            <span className="truncate">{metadata.authorName}</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {metadata.status === 'pending' && (
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTitle className="text-amber-950">Hang tight!</AlertTitle>
            <AlertDescription className="text-sm text-amber-950">
              I got your video and I'm processing it right now. Let me mull over it for a minute or two so you have something worth putting energy into. This page will refresh automatically by the way.
            </AlertDescription>
          </Alert>
        )}

        {metadata.status === 'failed' && (
          <Alert variant="destructive">
            <AlertTitle>Blueprint processing failed</AlertTitle>
            <AlertDescription className="text-sm">
              Try again later or regenerate from the dashboard.
            </AlertDescription>
          </Alert>
        )}

        {canShowDetails && (overview.summary || overview.guidance.length > 0) && (
          <div className="space-y-3">
            {overview.summary && (
              <p className="text-sm leading-relaxed text-muted-foreground">{overviewPreview}</p>
            )}

            {overview.guidance.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Guidance</p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {overview.guidance.map((item, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="mt-1 text-muted-foreground/70">•</span>
                      <span className="flex-1 leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {canShowDetails && accordionSections.length > 0 && (
          <Accordion type="multiple" className="rounded-xl border border-border/60 bg-background/80">
            {accordionSections.map((section) => (
              <AccordionItem key={section.id} value={section.id} className="border-border/40">
                <AccordionTrigger className="px-4 text-left text-sm font-semibold text-foreground">
                  {section.title}
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  {section.description && (
                    <p className="mb-3 text-xs uppercase tracking-wide text-muted-foreground">{section.description}</p>
                  )}
                  <SectionContent section={section} compact />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}

      </CardContent>

      <CardFooter className="flex flex-col items-start gap-4 border-t border-border/50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-muted-foreground">
          {footerLeft ?? 'Need deeper context? Open the full blueprint to explore all sections.'}
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {footerExtra}
          <Button
            size="sm"
            className="rounded-md"
            onClick={onNavigateToDetail}
            disabled={!onNavigateToDetail || metadata.status !== 'completed'}
          >
            {actionLabel}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

function DetailVariant({ blueprint, sectionOrder }: Pick<BlueprintDisplayProps, 'blueprint' | 'sectionOrder'>) {
  const sections = useMemo(() => {
    const base = mapBlueprintToSections(blueprint)
    return reorderSections(base, sectionOrder)
  }, [blueprint, sectionOrder])

  if (!sections.length) {
    return (
      <Card className="rounded-3xl border border-border/70 bg-background/80">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Blueprint details unavailable</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            This blueprint is still processing or did not return structured sections.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <Card key={section.id} className="rounded-3xl border border-border bg-card shadow-sm">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl font-semibold text-foreground">{section.title}</CardTitle>
            {section.description && (
              <CardDescription className="text-sm text-muted-foreground">{section.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <SectionContent section={section} />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export const BlueprintDisplay: React.FC<BlueprintDisplayProps> = ({
  blueprint,
  variant,
  metadata,
  onNavigateToDetail,
  actionLabel,
  sectionOrder,
  summaryFooterLeft,
  summaryFooterExtra,
  summaryMetaExtra,
}) => {
  if (variant === 'summary') {
    return (
      <SummaryVariant
        blueprint={blueprint}
        metadata={metadata}
        onNavigateToDetail={onNavigateToDetail}
        actionLabel={actionLabel}
        footerExtra={summaryFooterExtra}
        footerLeft={summaryFooterLeft}
        metaExtra={summaryMetaExtra}
      />
    )
  }

  return <DetailVariant blueprint={blueprint} sectionOrder={sectionOrder} />
}

BlueprintDisplay.displayName = 'BlueprintDisplay'
