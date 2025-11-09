import React, { useState } from 'react'
import { CheckCircle2, FileText, Loader2, PlayCircle } from 'lucide-react'

import { blueprintFormSchema, validateYouTubeUrl, validateTextContent } from '../../lib/validation'
import type { BlueprintFormData, ContentType, FormErrors } from '../../types/blueprint'
import { useBlueprint } from '../../hooks/useBlueprint'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { Button } from '../ui/button'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet
} from '../ui/field'
import { Input } from '../ui/input'
import { Separator } from '../ui/separator'
import { Textarea } from '../ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group'
import { BlueprintDetail } from './BlueprintDetail'

interface BlueprintFormProps {
  // No props needed - component handles everything internally
}

export const BlueprintForm: React.FC<BlueprintFormProps> = () => {
  const [formData, setFormData] = useState<BlueprintFormData>({
    goal: '',
    habitsToKill: '',
    habitsToDevelop: '',
    contentType: 'youtube',
    youtubeUrl: '',
    textContent: ''
  })

  const [errors, setErrors] = useState<FormErrors>({})

  // Blueprint creation hook - handles everything backend-side
  const {
    isLoading: isCreatingBlueprint,
    blueprint,
    metadata: blueprintMetadata,
    error: blueprintError,
    createBlueprint,
    clearBlueprint
  } = useBlueprint()

  // Real-time YouTube URL validation state
  const [youtubeValidation, setYoutubeValidation] = useState<{
    videoId?: string
    isValidating: boolean
  }>({ isValidating: false })

  const handleInputChange = (field: keyof BlueprintFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
    
    // Real-time YouTube URL validation
    if (field === 'youtubeUrl' && value.trim()) {
      setYoutubeValidation({ isValidating: true })
      
      const validation = validateYouTubeUrl(value)
      if (validation.isValid && validation.videoId) {
        setYoutubeValidation({
          isValidating: false,
          videoId: validation.videoId
        })
      } else {
        setYoutubeValidation({ isValidating: false })
      }
    }
  }

  const handleContentTypeChange = (newContentType: ContentType) => {
    setFormData(prev => ({ ...prev, contentType: newContentType }))
    
    setErrors(prev => ({
      ...prev,
      contentType: undefined,
      youtubeUrl: undefined,
      textContent: undefined
    }))
    
    if (newContentType !== 'youtube') {
      setYoutubeValidation({ isValidating: false })
      clearBlueprint()
    }
  }

  const validateForm = (): boolean => {
    try {
      blueprintFormSchema.parse(formData)
      
      const newErrors: FormErrors = {}
      
      if (formData.contentType === 'youtube') {
        const urlValidation = validateYouTubeUrl(formData.youtubeUrl)
        if (!urlValidation.isValid) {
          newErrors.youtubeUrl = urlValidation.error
        }
      }
      
      if (formData.contentType === 'text') {
        const textValidation = validateTextContent(formData.textContent)
        if (!textValidation.isValid) {
          newErrors.textContent = textValidation.error
        }
      }
      
      setErrors(newErrors)
      return Object.keys(newErrors).length === 0
      
    } catch (error: any) {
      console.error('[BlueprintForm] Validation error:', error)
      
      const newErrors: FormErrors = {}
      
      if (error.errors) {
        error.errors.forEach((err: any) => {
          const field = err.path[0]
          newErrors[field as keyof FormErrors] = err.message
        })
      }
      
      setErrors(newErrors)
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('[BlueprintForm] Starting blueprint creation')
    
    if (!validateForm()) {
      console.log('[BlueprintForm] Validation failed')
      return
    }
    
    // Single call to backend - handles transcript extraction + AI processing
    const success = await createBlueprint(formData)
    
    if (success) {
      console.log('[BlueprintForm] Blueprint created successfully!', blueprint)
    } else {
      console.error('[BlueprintForm] Blueprint creation failed:', blueprintError)
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-left">
        <h2 className="text-2xl font-semibold text-foreground md:text-3xl">Create Your Habit Blueprint</h2>
        <p className="text-sm text-muted-foreground md:text-base">
          Tell us your goal, choose the content source, and we&apos;ll turn it into a personalized habit plan.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <FieldSet className="space-y-6">
          <Field className="rounded-2xl border border-border/70 bg-background/80 p-6 shadow-sm">
            <FieldLabel htmlFor="goal">Primary Goal *</FieldLabel>
            <FieldDescription>
              Be specific about what you want to achieve ({formData.goal.length}/500 characters)
            </FieldDescription>
            <Input
              id="goal"
              value={formData.goal}
              onChange={(e) => handleInputChange('goal', e.target.value)}
              disabled={isCreatingBlueprint}
              placeholder="e.g., I want to wake up at 5 AM every day and feel energized"
              maxLength={500}
            />
            {errors.goal && <p className="text-sm text-destructive">{errors.goal}</p>}
          </Field>

          <FieldGroup>
            <Field className="rounded-2xl border border-border/60 bg-background/80 p-6 shadow-sm">
              <FieldLabel htmlFor="habitsToKill">Habits to Eliminate (Optional)</FieldLabel>
              <FieldDescription>
                Separate multiple habits with commas ({formData.habitsToKill.length}/1000 characters)
              </FieldDescription>
              <Input
                id="habitsToKill"
                value={formData.habitsToKill}
                onChange={(e) => handleInputChange('habitsToKill', e.target.value)}
                disabled={isCreatingBlueprint}
                placeholder="e.g., staying up late, checking phone first thing, drinking too much coffee"
                maxLength={1000}
              />
              {errors.habitsToKill && <p className="text-sm text-destructive">{errors.habitsToKill}</p>}
            </Field>

            <Field className="rounded-2xl border border-border/60 bg-background/80 p-6 shadow-sm">
              <FieldLabel htmlFor="habitsToDevelop">Habits to Develop (Optional)</FieldLabel>
              <FieldDescription>
                Separate multiple habits with commas ({formData.habitsToDevelop.length}/1000 characters)
              </FieldDescription>
              <Input
                id="habitsToDevelop"
                value={formData.habitsToDevelop}
                onChange={(e) => handleInputChange('habitsToDevelop', e.target.value)}
                disabled={isCreatingBlueprint}
                placeholder="e.g., morning meditation, drinking more water, reading before bed"
                maxLength={1000}
              />
              {errors.habitsToDevelop && <p className="text-sm text-destructive">{errors.habitsToDevelop}</p>}
            </Field>
          </FieldGroup>

          <Field className="rounded-2xl border border-border bg-background/90 p-6 shadow-sm">
            <FieldLabel>Content Source *</FieldLabel>
            <FieldDescription>Choose what we should analyze to build your blueprint.</FieldDescription>
            <ToggleGroup
              type="single"
              value={formData.contentType}
              onValueChange={(value) => value && handleContentTypeChange(value as ContentType)}
              className="grid gap-3 md:grid-cols-2"
            >
              <ToggleGroupItem
                value="youtube"
                className="flex flex-col items-start gap-2 rounded-2xl border border-border/70 bg-background px-4 py-3 text-left data-[state=on]:border-primary data-[state=on]:bg-primary/5"
                disabled={isCreatingBlueprint}
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <PlayCircle className="size-4" aria-hidden />
                  YouTube Video
                </div>
                <p className="text-xs text-muted-foreground">
                  Paste a YouTube link and we&apos;ll extract the transcript for you.
                </p>
              </ToggleGroupItem>
              <ToggleGroupItem
                value="text"
                className="flex flex-col items-start gap-2 rounded-2xl border border-border/70 bg-background px-4 py-3 text-left data-[state=on]:border-primary data-[state=on]:bg-primary/5"
                disabled={isCreatingBlueprint}
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <FileText className="size-4" aria-hidden />
                  Text Content
                </div>
                <p className="text-xs text-muted-foreground">
                  Paste any article, notes, or transcript for analysis.
                </p>
              </ToggleGroupItem>
            </ToggleGroup>
            {errors.contentType && <p className="text-sm text-destructive">{errors.contentType}</p>}
          </Field>

          {formData.contentType === 'youtube' && (
            <Field className="rounded-2xl border border-border/70 bg-background/80 p-6 shadow-sm">
              <FieldLabel htmlFor="youtubeUrl">YouTube URL *</FieldLabel>
              <FieldDescription>
                Provide the video link you want to convert into actionable steps.
              </FieldDescription>
              <Input
                id="youtubeUrl"
                type="url"
                value={formData.youtubeUrl}
                onChange={(e) => handleInputChange('youtubeUrl', e.target.value)}
                disabled={isCreatingBlueprint}
                placeholder="https://www.youtube.com/watch?v=VIDEO_ID"
              />
              {errors.youtubeUrl && <p className="text-sm text-destructive">{errors.youtubeUrl}</p>}
              {youtubeValidation.videoId && (
                <Alert className="mt-3 border-green-200 bg-green-50">
                  <AlertDescription className="flex items-center gap-2 text-sm text-green-700">
                    <CheckCircle2 className="size-4" aria-hidden />
                    Video ID detected: {youtubeValidation.videoId}
                  </AlertDescription>
                </Alert>
              )}
            </Field>
          )}

          {formData.contentType === 'text' && (
            <Field className="rounded-2xl border border-border/70 bg-background/80 p-6 shadow-sm">
              <FieldLabel htmlFor="textContent">Text Content *</FieldLabel>
              <FieldDescription>
                Minimum 50 characters required ({formData.textContent.length}/50,000 characters)
              </FieldDescription>
              <Textarea
                id="textContent"
                value={formData.textContent}
                onChange={(e) => handleInputChange('textContent', e.target.value)}
                disabled={isCreatingBlueprint}
                placeholder="Paste your content here (book excerpt, article, transcript, etc.)."
                maxLength={50000}
              />
              {errors.textContent && <p className="text-sm text-destructive">{errors.textContent}</p>}
            </Field>
          )}
        </FieldSet>

        {blueprintError && (
          <Alert variant="destructive" className="border-destructive/30 bg-destructive/10">
            <AlertTitle>Blueprint request failed</AlertTitle>
            <AlertDescription>{blueprintError}</AlertDescription>
          </Alert>
        )}

        {blueprint && (
          <Alert className="border-primary/20 bg-primary/5">
            <AlertTitle>Blueprint created</AlertTitle>
            <AlertDescription>
              We generated your personalized plan below. Scroll down to review the details.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col gap-4 border border-border/70 bg-background/90 p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Ready to build your blueprint?</p>
            <p>We&apos;ll analyze your content and return sequential steps, habits, and pitfalls within a minute.</p>
          </div>
          <Button type="submit" size="lg" disabled={isCreatingBlueprint} className="gap-2 rounded-full px-6">
            {isCreatingBlueprint ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Creating Blueprint...
              </>
            ) : (
              'Create Habit Blueprint'
            )}
          </Button>
        </div>
      </form>

      {blueprint && (
        <>
          <Separator className="my-6" />
          <BlueprintDetail blueprint={blueprint} />
        </>
      )}
    </div>
  )
}
