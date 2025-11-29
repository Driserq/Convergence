import React, { useCallback } from 'react'

import { useRouter } from '../contexts/RouterContext'
import { useAuth } from '../hooks/useAuth'
import { LandingPageContent } from '../components/landing/LandingPageContent'

export const Landing: React.FC = () => {
  const { navigate } = useRouter()
  const { user } = useAuth()

  const handlePrimaryCta = useCallback(() => {
    if (user) {
      navigate('dashboard')
      return
    }
    navigate('login')
  }, [navigate, user])

  return (
    <LandingPageContent
      isAuthenticated={Boolean(user)}
      onPrimaryCta={handlePrimaryCta}
    />
  )
}
