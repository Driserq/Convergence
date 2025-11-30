import React, { useCallback } from 'react'
import { useNavigate } from 'react-router'

import { useAuth } from '../src/hooks/useAuth'
import { LandingPageContent } from '../src/components/landing/LandingPageContent'

export default function Landing() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const handlePrimaryCta = useCallback(() => {
    if (user) {
      navigate('/dashboard')
      return
    }
    navigate('/login')
  }, [navigate, user])

  const handleSignupCta = useCallback(() => {
    if (user) {
      navigate('/dashboard')
      return
    }
    navigate('/signup')
  }, [navigate, user])

  return (
    <LandingPageContent
      isAuthenticated={Boolean(user)}
      onPrimaryCta={handlePrimaryCta}
      onSignupCta={handleSignupCta}
    />
  )
}
