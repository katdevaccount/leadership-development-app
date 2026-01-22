import { getOnboardingCopy } from '@/lib/queries/onboarding-copy'
import { OnboardingClient } from './client'
import type { OnboardingCopy } from '@/lib/config/onboarding-defaults'

export default async function OnboardingPage() {
  const copy = await getOnboardingCopy<OnboardingCopy>('onboarding')
  return <OnboardingClient copy={copy} />
}
