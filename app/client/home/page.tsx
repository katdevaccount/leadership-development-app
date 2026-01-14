import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/server'
import { getCanvasSummary } from '@/lib/queries/client'
import { LeadershipPurpose } from '@/components/client/leadership-purpose'
import { ThemeCanvas } from '@/components/client/theme-canvas'
import { AddThemeButton } from '@/components/client/add-theme-button'
import { PhoneMissingBanner } from '@/components/client/phone-missing-banner'
import { PadletLinkBanner } from '@/components/client/padlet-link-banner'
import { AppHeader } from '@/components/app-header'

export default async function ClientHomePage() {
  // Get authenticated user
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch canvas data
  const { user: profile, themes } = await getCanvasSummary(user.id)

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader userName={profile?.name} userRole="client" />

      <div className="container mx-auto py-6 sm:py-8 px-4 max-w-4xl">
        {/* Phone missing banner */}
        {!profile?.phone && <PhoneMissingBanner />}

        {/* Padlet link banner */}
        {profile?.padlet_url && <PadletLinkBanner padletUrl={profile.padlet_url} />}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-700 font-mono">
            Welcome back{profile?.name ? `, ${profile.name}` : ''}
          </h1>
          <p className="text-gray-500 mt-1 font-mono">
            Your leadership development space
          </p>
          <p className="text-sm text-gray-400 font-mono mt-2 max-w-lg">
            If you don't know where you're going, you won't get there. Writing down your intentions increases the likelihood of meaningful change.
          </p>
        </div>

        {/* Canvas Layout */}
        <div className="space-y-6">
          {/* Leadership Purpose */}
          <LeadershipPurpose purpose={profile?.leadership_purpose || null} />

          {/* Development Themes Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-700 font-mono">
                Development Themes
              </h2>
              <span className="text-sm text-gray-400 font-mono">
                {themes.length} of 3 themes
              </span>
            </div>

            {/* Theme Cards */}
            <div className="space-y-6">
              {themes.map((themeData) => (
                <ThemeCanvas
                  key={themeData.id}
                  theme={themeData}
                  hypotheses={themeData.hypotheses}
                />
              ))}
            </div>

            {/* Add Theme Button */}
            <AddThemeButton currentThemeCount={themes.length} />
          </div>
        </div>
      </div>
    </div>
  )
}
