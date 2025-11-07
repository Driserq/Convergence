import React, { useState } from 'react'
import { blueprintFormSchema, validateYouTubeUrl, validateTextContent } from '../../lib/validation'
import type { BlueprintFormData, ContentType, FormErrors } from '../../types/blueprint'
import { useBlueprint } from '../../hooks/useBlueprint'
import { BlueprintDetail } from './BlueprintDetail'

interface BlueprintFormProps {
  // No props needed - component handles everything internally
}

export const BlueprintForm: React.FC<BlueprintFormProps> = () => {
  const [formData, setFormData] = useState<BlueprintFormData>({
    goal: 'I want to learn how to market my vibe coded app from scratch',
    habitsToKill: '',
    habitsToDevelop: '',
    contentType: 'youtube',
    youtubeUrl: 'https://www.youtube.com/watch?v=WJlvQu3yeCY&list=WL&index=3&pp=gAQBiAQB',
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
    <>
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Your Habit Blueprint</h2>
            <p className="text-gray-600">
              Tell us your goal and provide content to analyze. We'll create a personalized habit transformation plan.
            </p>
          </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Primary Goal */}
          <div>
            <label htmlFor="goal" className="block text-sm font-medium text-gray-700 mb-2">
              Primary Goal *
            </label>
            <input
              type="text"
              id="goal"
              value={formData.goal}
              onChange={(e) => handleInputChange('goal', e.target.value)}
              disabled={isCreatingBlueprint}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="e.g., I want to wake up at 5 AM every day and feel energized"
              maxLength={500}
            />
            {errors.goal && (
              <p className="mt-1 text-sm text-red-600">{errors.goal}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Be specific about what you want to achieve ({formData.goal.length}/500 characters)
            </p>
          </div>

          {/* Habits to Kill */}
          <div>
            <label htmlFor="habitsToKill" className="block text-sm font-medium text-gray-700 mb-2">
              Habits to Eliminate (Optional)
            </label>
            <input
              type="text"
              id="habitsToKill"
              value={formData.habitsToKill}
              onChange={(e) => handleInputChange('habitsToKill', e.target.value)}
              disabled={isCreatingBlueprint}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="e.g., staying up late, checking phone first thing, drinking too much coffee"
              maxLength={1000}
            />
            {errors.habitsToKill && (
              <p className="mt-1 text-sm text-red-600">{errors.habitsToKill}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Separate multiple habits with commas ({formData.habitsToKill.length}/1000 characters)
            </p>
          </div>

          {/* Habits to Develop */}
          <div>
            <label htmlFor="habitsToDevelop" className="block text-sm font-medium text-gray-700 mb-2">
              Habits to Develop (Optional)
            </label>
            <input
              type="text"
              id="habitsToDevelop"
              value={formData.habitsToDevelop}
              onChange={(e) => handleInputChange('habitsToDevelop', e.target.value)}
              disabled={isCreatingBlueprint}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="e.g., morning meditation, drinking more water, reading before bed"
              maxLength={1000}
            />
            {errors.habitsToDevelop && (
              <p className="mt-1 text-sm text-red-600">{errors.habitsToDevelop}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Separate multiple habits with commas ({formData.habitsToDevelop.length}/1000 characters)
            </p>
          </div>

          {/* Content Source Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Content Source *
            </label>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <button
                type="button"
                onClick={() => handleContentTypeChange('youtube')}
                disabled={isCreatingBlueprint}
                className={`p-4 border-2 rounded-lg text-left transition-colors duration-200 disabled:opacity-50 ${
                  formData.contentType === 'youtube'
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center mb-2">
                  <span className="text-lg">📺</span>
                  <span className="ml-2 font-medium">YouTube Video</span>
                </div>
                <p className="text-sm text-gray-600">
                  Analyze content from a YouTube video
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleContentTypeChange('text')}
                disabled={isCreatingBlueprint}
                className={`p-4 border-2 rounded-lg text-left transition-colors duration-200 disabled:opacity-50 ${
                  formData.contentType === 'text'
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center mb-2">
                  <span className="text-lg">📝</span>
                  <span className="ml-2 font-medium">Text Content</span>
                </div>
                <p className="text-sm text-gray-600">
                  Paste your own text to analyze
                </p>
              </button>
            </div>

            {errors.contentType && (
              <p className="mt-1 text-sm text-red-600">{errors.contentType}</p>
            )}
          </div>

          {/* YouTube URL Input */}
          {formData.contentType === 'youtube' && (
            <div>
              <label htmlFor="youtubeUrl" className="block text-sm font-medium text-gray-700 mb-2">
                YouTube URL *
              </label>
              <input
                type="url"
                id="youtubeUrl"
                value={formData.youtubeUrl}
                onChange={(e) => handleInputChange('youtubeUrl', e.target.value)}
                disabled={isCreatingBlueprint}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID"
              />
              {errors.youtubeUrl && (
                <p className="mt-1 text-sm text-red-600">{errors.youtubeUrl}</p>
              )}
              
              {youtubeValidation.videoId && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-green-600">✅</span>
                    <span className="ml-2 text-sm text-green-700">
                      Video ID detected: {youtubeValidation.videoId}
                    </span>
                  </div>
                </div>
              )}
              
              <p className="mt-1 text-sm text-gray-500">
                Paste a YouTube video URL. We'll extract the transcript for analysis.
              </p>
            </div>
          )}

          {/* Text Content Input */}
          {formData.contentType === 'text' && (
            <div>
              <label htmlFor="textContent" className="block text-sm font-medium text-gray-700 mb-2">
                Text Content *
              </label>
              <textarea
                id="textContent"
                value={formData.textContent}
                onChange={(e) => handleInputChange('textContent', e.target.value)}
                disabled={isCreatingBlueprint}
                rows={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 resize-vertical"
                placeholder="Paste your content here (book excerpt, article, transcript, etc.). Minimum 50 characters required for meaningful analysis."
                maxLength={50000}
              />
              {errors.textContent && (
                <p className="mt-1 text-sm text-red-600">{errors.textContent}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Minimum 50 characters required ({formData.textContent.length}/50,000 characters)
              </p>
            </div>
          )}

          {/* Blueprint Error */}
          {blueprintError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {blueprintError}
            </div>
          )}

          {/* Blueprint Success Message */}
          {blueprint && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              🎉 Blueprint created successfully! Scroll down to view your personalized plan.
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isCreatingBlueprint}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {isCreatingBlueprint ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white inline mr-2"></div>
                  Creating Blueprint...
                </>
              ) : (
                'Create Habit Blueprint'
              )}
            </button>
          </div>
        </form>
        </div>
      </div>

      {/* Display Created Blueprint */}
      {blueprint && (
        <div className="mt-8">
          <BlueprintDetail blueprint={blueprint} />
        </div>
      )}
    </>
  )
}
