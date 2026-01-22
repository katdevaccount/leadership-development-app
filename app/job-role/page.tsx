import { getOnboardingCopy } from '@/lib/queries/onboarding-copy'
import { JobRoleClient } from './client'
import type { JobRoleCopy } from '@/lib/config/onboarding-defaults'

export default async function JobRolePage() {
  const copy = await getOnboardingCopy<JobRoleCopy>('job-role')
  return <JobRoleClient copy={copy} />
}
