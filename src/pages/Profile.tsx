import React from 'react'
import { ProtectedRoute } from '../components/auth/ProtectedRoute'

export const Profile: React.FC = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <main className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Profile & Settings Page
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                Coming soon - Account management, usage stats, data export, preferences
              </p>
              <a
                href="/dashboard"
                className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors duration-200"
              >
                Back to Dashboard
              </a>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}