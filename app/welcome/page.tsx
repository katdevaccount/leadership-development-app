import { getOnboardingCopy } from '@/lib/queries/onboarding-copy'
import { WelcomeClient } from './client'
import type { WelcomeCopy } from '@/lib/config/onboarding-defaults'

export default async function WelcomePage() {
  const copy = await getOnboardingCopy<WelcomeCopy>('welcome')
  return <WelcomeClient copy={copy} />
}
