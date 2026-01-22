import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Settings } from 'lucide-react'
import { getUser } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'
import { getAllOnboardingCopy, getRawOnboardingCopy } from '@/lib/queries/onboarding-copy'
import { AppHeader } from '@/components/app-header'
import { OnboardingCopyEditor } from '@/components/coach/onboarding-copy-editor'
import type { OnboardingPageKey } from '@/lib/config/onboarding-defaults'

export default async function OnboardingSettingsPage() {
  // Get authenticated user
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  // Verify user is a coach
  const supabase = await createClient()
  const { data: userData } = await supabase
    .from('users')
    .select('role, name')
    .eq('id', user.id)
    .single()

  if (!userData || userData.role !== 'coach') {
    redirect('/client/home')
  }

  // Fetch all copy data
  const allCopy = await getAllOnboardingCopy()

  // Fetch raw custom copy for each page to check customizations
  const pageKeys: OnboardingPageKey[] = ['onboarding', 'job-role', 'company-info', 'welcome']
  const rawCopyMap: Record<OnboardingPageKey, Record<string, unknown> | null> = {
    'onboarding': null,
    'job-role': null,
    'company-info': null,
    'welcome': null,
  }

  for (const key of pageKeys) {
    rawCopyMap[key] = await getRawOnboardingCopy(key)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader userName={userData.name} userRole="coach" />

      <div className="container mx-auto py-6 sm:py-8 px-4 max-w-3xl">
        {/* Back navigation */}
        <Link
          href="/coach/dashboard"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-[#8B1E3F] font-mono text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Page Header */}
        <div className="bg-[#f0f3fa] rounded-2xl p-4 sm:p-6 shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff] mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#f0f3fa] flex items-center justify-center shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff]">
              <Settings className="h-6 w-6 text-[#8B1E3F]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-700 font-mono">
                Onboarding Copy
              </h1>
              <p className="text-sm text-gray-500 font-mono">
                Customize the text clients see during onboarding
              </p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-[#f0f3fa] rounded-xl p-4 shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff] mb-6">
          <p className="text-sm text-gray-600 font-mono">
            Edit any field below to customize the onboarding text. Leave fields empty to use defaults.
            Changes will apply to all new clients going through onboarding.
          </p>
        </div>

        {/* Page Editors */}
        <div className="space-y-4">
          <OnboardingCopyEditor
            pageKey="onboarding"
            currentCopy={allCopy.onboarding}
            customCopy={rawCopyMap.onboarding}
          />
          <OnboardingCopyEditor
            pageKey="job-role"
            currentCopy={allCopy['job-role']}
            customCopy={rawCopyMap['job-role']}
          />
          <OnboardingCopyEditor
            pageKey="company-info"
            currentCopy={allCopy['company-info']}
            customCopy={rawCopyMap['company-info']}
          />
          <OnboardingCopyEditor
            pageKey="welcome"
            currentCopy={allCopy.welcome}
            customCopy={rawCopyMap.welcome}
          />
        </div>
      </div>
    </div>
  )
}
