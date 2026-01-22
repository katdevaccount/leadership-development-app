import { getOnboardingCopy } from '@/lib/queries/onboarding-copy'
import { CompanyInfoClient } from './client'
import type { CompanyInfoCopy } from '@/lib/config/onboarding-defaults'

export default async function CompanyInfoPage() {
  const copy = await getOnboardingCopy<CompanyInfoCopy>('company-info')
  return <CompanyInfoClient copy={copy} />
}
