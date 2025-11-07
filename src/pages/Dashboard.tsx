import React from 'react'
import { BlueprintForm } from '../components/blueprint/BlueprintForm'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Separator } from '../components/ui/separator'
import type { BlueprintFormData } from '../types/blueprint'

export const Dashboard: React.FC = () => {
  const handleBlueprintSubmit = async (formData: BlueprintFormData): Promise<void> => {
    console.log('[Dashboard] Blueprint form submitted:', formData)
    
    // TODO: This will be implemented in Phase 4 (YouTube Transcript) and Phase 5 (AI Blueprint Generation)
    // For now, we'll just simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    console.log('[Dashboard] Blueprint form processing complete (simulated)')
    
    // In future phases, this will:
    // 1. Extract YouTube transcript (if YouTube URL provided) - Phase 4
    // 2. Generate AI blueprint from content + goals - Phase 5
    // 3. Save blueprint to database - Phase 6
    // 4. Navigate to blueprint result or history - Phase 7
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Create Your Habit Blueprint
            </h1>
            <p className="text-lg text-muted-foreground">
              Transform any content into actionable habit changes. Start by sharing your goal and the content you'd like to analyze.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <span className="text-2xl mr-3">📋</span>
                <div>
                  <CardTitle className="text-sm font-medium text-muted-foreground">Blueprints Created</CardTitle>
                  <p className="text-2xl font-semibold text-card-foreground mt-1">0</p>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Create your first blueprint below!
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <span className="text-2xl mr-3">🎯</span>
                <div>
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Habits</CardTitle>
                  <p className="text-2xl font-semibold text-card-foreground mt-1">0</p>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Track your progress (coming soon)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <span className="text-2xl mr-3">📈</span>
                <div>
                  <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
                  <p className="text-2xl font-semibold text-card-foreground mt-1">-%</p>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Analytics (coming soon)
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Blueprint Form */}
          <div className="mb-12">
            <BlueprintForm onSubmit={handleBlueprintSubmit} />
          </div>

          <Separator className="my-12" />

          {/* Analytics Cards (Phase 9 - Below Form) */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Your Analytics (Last 30 Days)</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Content Processed</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-card-foreground mb-2">0</p>
                  <p className="text-sm text-muted-foreground">
                    Blueprints created in the last 30 days
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Time Saved</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-card-foreground mb-2">0h 0m</p>
                  <p className="text-sm text-muted-foreground">
                    Estimated time saved from processing content
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Content Type Ratio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">YouTube:</span>
                      <span className="text-card-foreground">0%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Text:</span>
                      <span className="text-card-foreground">0%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Help Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="mr-2">💡</span>
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-muted-foreground">
                <div>
                  <h4 className="font-medium text-card-foreground mb-2">1. Set Your Goal</h4>
                  <p>Be specific about what you want to achieve. The more detailed, the better our AI can help.</p>
                </div>
                <div>
                  <h4 className="font-medium text-card-foreground mb-2">2. Add Content Source</h4>
                  <p>Provide either a YouTube video URL or paste text content (book, article, transcript, etc.).</p>
                </div>
                <div>
                  <h4 className="font-medium text-card-foreground mb-2">3. Get Your Blueprint</h4>
                  <p>Our AI analyzes the content and creates personalized habit steps tailored to your goal.</p>
                </div>
                <div>
                  <h4 className="font-medium text-card-foreground mb-2">4. Take Action</h4>
                  <p>Follow the sequential habit steps and track your progress over time.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
