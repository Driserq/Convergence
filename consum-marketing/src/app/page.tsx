import LandingPageContent from '@/components/landing/LandingPageContent'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.consum.app'

export default function Home() {
  return <LandingPageContent appUrl={APP_URL} />
}
