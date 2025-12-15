import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getUser } from '@/lib/supabase/server'
import { getProfileData } from '@/lib/actions/profile'
import { SettingsForm } from '@/components/client/settings-form'
import { AppHeader } from '@/components/app-header'

export default async function ClientSettingsPage() {
  // Get authenticated user
  const authUser = await getUser()

  if (!authUser) {
    redirect('/login')
  }

  // Fetch profile data
  const { user, settings, error } = await getProfileData()

  if (error || !user) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AppHeader userName={undefined} userRole="client" />
        <div className="container mx-auto py-8 px-4 max-w-lg">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 font-mono">
            {error || 'Failed to load profile'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader userName={user.name} userRole="client" />

      <div className="container mx-auto py-8 px-4 max-w-lg">
        {/* Back link */}
        <Link
          href="/client/home"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-[#8B1E3F] transition-colors font-mono text-sm mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Settings Form */}
        <SettingsForm
          userId={user.id}
          initialName={user.name}
          initialPhone={user.phone}
          initialReceiveWeeklyNudge={settings?.receive_weekly_nudge ?? true}
        />
      </div>
    </div>
  )
}
