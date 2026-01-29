import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, Lightbulb, AlertCircle, Settings } from 'lucide-react'
import { getUser } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'
import { ensureCoachRoleIfInAllowlist } from '@/lib/supabase/admin'
import {
  getAllClientSummaries,
  getCoachDashboardStats,
} from '@/lib/queries/coach'
import { ClientCard } from '@/components/coach/client-card'
import { AppHeader } from '@/components/app-header'

export default async function CoachDashboardPage() {
  // Get authenticated user
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  // Verify user is a coach (sync DB role from allowlist if needed)
  const supabase = await createClient()
  let { data: profile } = await supabase
    .from('users')
    .select('role, name')
    .eq('id', user.id)
    .single()

  if ((!profile || profile.role !== 'coach') && user.email) {
    await ensureCoachRoleIfInAllowlist(user.id, user.email)
    const refetch = await supabase
      .from('users')
      .select('role, name')
      .eq('id', user.id)
      .single()
    profile = refetch.data
  }

  if (!profile || profile.role !== 'coach') {
    redirect('/client/home')
  }

  // Fetch dashboard data
  const [clientSummaries, stats] = await Promise.all([
    getAllClientSummaries(),
    getCoachDashboardStats(),
  ])

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader userName={profile.name} userRole="coach" />

      <div className="container mx-auto py-8 px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-700 font-mono">Coach Dashboard</h1>
            <p className="text-gray-500 mt-1 font-mono">
              {profile.name ? `Welcome back, ${profile.name}` : 'Manage your clients'}
            </p>
          </div>
          <Link
            href="/coach/settings/onboarding"
            className="flex items-center gap-2 px-4 py-2 bg-[#f0f3fa] rounded-xl text-sm font-mono text-gray-600 shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#d1d9e6,-2px_-2px_4px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] transition-all"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {/* Total Clients */}
          <div className="bg-[#f0f3fa] rounded-2xl p-6 shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-600 font-mono">Total Clients</span>
              <div className="w-10 h-10 rounded-full bg-[#f0f3fa] flex items-center justify-center shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff]">
                <Users className="h-5 w-5 text-[#8B1E3F]" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-700 font-mono">{stats.totalClients}</div>
            <p className="text-xs text-gray-500 mt-1 font-mono">
              Active coaching relationships
            </p>
          </div>

          {/* Ideas Captured */}
          <div className="bg-[#f0f3fa] rounded-2xl p-6 shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-600 font-mono">Ideas Captured</span>
              <div className="w-10 h-10 rounded-full bg-[#f0f3fa] flex items-center justify-center shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff]">
                <Lightbulb className="h-5 w-5 text-[#8B1E3F]" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-700 font-mono">
              {stats.totalCompletedActions + stats.totalOpenActions}
            </div>
            <p className="text-xs text-gray-500 mt-1 font-mono">
              across all clients
            </p>
          </div>

          {/* Needs Attention */}
          <div className="bg-[#f0f3fa] rounded-2xl p-6 shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-600 font-mono">Needs Attention</span>
              <div className="w-10 h-10 rounded-full bg-[#f0f3fa] flex items-center justify-center shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff]">
                <AlertCircle className="h-5 w-5 text-[#8B1E3F]" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-700 font-mono">{stats.clientsWithNoTheme}</div>
            <p className="text-xs text-gray-500 mt-1 font-mono">
              Clients without a theme set
            </p>
          </div>
        </div>

        {/* Clients Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-700 font-mono">Your Clients</h2>
            <span className="px-4 py-2 bg-[#f0f3fa] rounded-full text-sm font-mono text-gray-600 shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff]">
              {clientSummaries.length} client{clientSummaries.length !== 1 ? 's' : ''}
            </span>
          </div>

          {clientSummaries.length === 0 ? (
            <div className="bg-[#f0f3fa] rounded-3xl p-12 shadow-[20px_20px_40px_#d1d9e6,-20px_-20px_40px_#ffffff] text-center">
              <div className="w-20 h-20 rounded-full bg-[#f0f3fa] flex items-center justify-center mx-auto mb-6 shadow-[inset_8px_8px_16px_#d1d9e6,inset_-8px_-8px_16px_#ffffff]">
                <Users className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 font-mono">No clients yet</h3>
              <p className="mt-2 text-sm text-gray-500 font-mono">
                When clients sign up and start their journey, they&apos;ll appear here.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {clientSummaries.map((client) => (
                <ClientCard key={client.user.id} client={client} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
