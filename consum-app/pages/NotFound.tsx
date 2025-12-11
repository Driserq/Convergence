import React from 'react'

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-foreground mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-foreground mb-4">Page Not Found</h2>
        <p className="text-lg text-muted-foreground mb-6">
          The page you're looking for doesn't exist.
        </p>
        <a
          href="/"
          className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors duration-200"
        >
          Go Home
        </a>
      </div>
    </div>
  )
}