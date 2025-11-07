import React from 'react'
import { ProtectedRoute } from '../components/auth/ProtectedRoute'
import { Header } from '../components/ui/Header'

export const BlueprintDetail: React.FC = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Blueprint Detail Page
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                Coming soon - Individual blueprint view with expand/collapse sections
              </p>
              <div className="flex gap-4 justify-center">
                <a
                  href="/history"
                  className="px-6 py-3 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium rounded-lg transition-colors duration-200"
                >
                  Back to History
                </a>
                <a
                  href="/dashboard"
                  className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors duration-200"
                >
                  Dashboard
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}