import React from 'react'
import { Header } from '../components/ui/Header'
import { BlueprintForm } from '../components/blueprint/BlueprintForm'
import { ProtectedRoute } from '../components/auth/ProtectedRoute'
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
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Welcome to Your Habit Blueprint Dashboard
              </h1>
              <p className="text-lg text-muted-foreground">
                Transform any content into actionable habit changes. Start by sharing your goal and the content you'd like to analyze.
              </p>
            </div>

            {/* Stats Cards (placeholder for future phases) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-card rounded-lg shadow p-6 border border-border">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-2xl">📋</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Blueprints Created</p>
                    <p className="text-2xl font-semibold text-card-foreground">0</p>
                  </div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Create your first blueprint below!
                </p>
              </div>

              <div className="bg-card rounded-lg shadow p-6 border border-border">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Active Habits</p>
                    <p className="text-2xl font-semibold text-card-foreground">0</p>
                  </div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Track your progress (coming soon)
                </p>
              </div>

              <div className="bg-card rounded-lg shadow p-6 border border-border">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-2xl">📈</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                    <p className="text-2xl font-semibold text-card-foreground">-%</p>
                  </div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Analytics (coming soon)
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <button className="p-4 bg-accent border border-border rounded-lg text-left hover:bg-accent/80 transition-colors duration-200">
                  <div className="flex items-center mb-2">
                    <span className="text-xl mr-3">📺</span>
                    <span className="font-medium text-accent-foreground">Analyze YouTube Video</span>
                  </div>
                  <p className="text-sm text-accent-foreground/80">
                    Extract insights from educational content
                  </p>
                </button>

                <button className="p-4 bg-accent border border-border rounded-lg text-left hover:bg-accent/80 transition-colors duration-200">
                  <div className="flex items-center mb-2">
                    <span className="text-xl mr-3">📝</span>
                    <span className="font-medium text-accent-foreground">Analyze Text Content</span>
                  </div>
                  <p className="text-sm text-accent-foreground/80">
                    Transform articles, books, or notes
                  </p>
                </button>

                <button className="p-4 bg-muted border border-border rounded-lg text-left hover:bg-muted/80 transition-colors duration-200 opacity-50 cursor-not-allowed">
                  <div className="flex items-center mb-2">
                    <span className="text-xl mr-3">📚</span>
                    <span className="font-medium text-muted-foreground">View History</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Review past blueprints (Phase 7)
                  </p>
                </button>
              </div>
            </div>

            {/* Main Blueprint Form */}
            <BlueprintForm onSubmit={handleBlueprintSubmit} />

            {/* Help Section */}
            <div className="mt-12 bg-accent border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-accent-foreground mb-2">
                💡 How It Works
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-accent-foreground/90">
                <div>
                  <h4 className="font-medium mb-2">1. Set Your Goal</h4>
                  <p>Be specific about what you want to achieve. The more detailed, the better our AI can help.</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">2. Add Content Source</h4>
                  <p>Provide either a YouTube video URL or paste text content (book, article, transcript, etc.).</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">3. Get Your Blueprint</h4>
                  <p>Our AI analyzes the content and creates personalized habit steps tailored to your goal.</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">4. Take Action</h4>
                  <p>Follow the sequential habit steps and track your progress over time.</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}