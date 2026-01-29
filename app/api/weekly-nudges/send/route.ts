import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendSms } from '@/lib/twilio/send-sms'

/**
 * Build weekly nudge message for a client.
 */
function buildWeeklyMessage(name: string, theme: string | null, openActionsCount: number): string {
  const themeText = theme || 'Not set'
  const count = openActionsCount ?? 0
  const actionsLine = count === 0
    ? 'No open actions this week.'
    : `You have ${count} open action(s). Keep going!`
  return `Hi ${name}, your focus: ${themeText}. ${actionsLine}`
}

/**
 * POST /api/weekly-nudges/send
 *
 * Fetches clients who want weekly nudges, sends each an SMS via Twilio, and logs to nudges_sent.
 * Call this from a scheduler (Railway cron or n8n on schedule) with:
 *   Authorization: Bearer <N8N_API_SECRET>
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const expectedSecret = process.env.N8N_API_SECRET

    if (!expectedSecret) {
      console.error('N8N_API_SECRET not configured')
      return NextResponse.json(
        { error: 'Server Configuration Error', message: 'API not configured' },
        { status: 500 }
      )
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Missing authorization header' },
        { status: 401 }
      )
    }

    const providedSecret = authHeader.substring(7)
    if (providedSecret !== expectedSecret) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid API secret' },
        { status: 401 }
      )
    }

    const supabase = createAdminClient()

    const { data: coach } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'coach')
      .limit(1)
      .single()

    if (!coach) {
      return NextResponse.json(
        { error: 'Configuration Error', message: 'No coach found in system' },
        { status: 500 }
      )
    }

    const { data: clients, error: clientsError } = await supabase
      .from('users')
      .select(`
        id,
        name,
        phone,
        settings!inner (
          receive_weekly_nudge
        )
      `)
      .eq('role', 'client')
      .eq('settings.receive_weekly_nudge', true)
      .not('phone', 'is', null)

    if (clientsError) {
      console.error('Error fetching clients for weekly nudges:', clientsError)
      return NextResponse.json(
        { error: 'Database Error', message: 'Failed to fetch clients' },
        { status: 500 }
      )
    }

    const clientsList = clients ?? []
    const clientsWithData = await Promise.all(
      clientsList.map(async (client) => {
        const { data: theme } = await supabase
          .from('development_themes')
          .select('theme_text')
          .eq('user_id', client.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        const { data: actions } = await supabase
          .from('weekly_actions')
          .select('action_text')
          .eq('user_id', client.id)
          .eq('is_completed', false)
          .order('created_at', { ascending: false })

        return {
          client_id: client.id,
          name: client.name,
          phone: client.phone as string,
          current_theme: theme?.theme_text ?? null,
          open_actions_count: actions?.length ?? 0,
        }
      })
    )

    const results: { client_id: string; success: boolean; sid?: string; error?: string }[] = []
    let sentCount = 0
    let failedCount = 0

    for (const client of clientsWithData) {
      const body = buildWeeklyMessage(
        client.name,
        client.current_theme,
        client.open_actions_count
      )
      const smsResult = await sendSms(client.phone, body)

      if ('sid' in smsResult) {
        const messageText = `[Automated Weekly] ${body}`
        const { error: insertError } = await supabase.from('nudges_sent').insert({
          coach_id: coach.id,
          client_id: client.client_id,
          message_text: messageText,
        })
        if (insertError) {
          console.error('Error logging weekly nudge for', client.client_id, insertError)
        }
        sentCount++
        results.push({ client_id: client.client_id, success: true, sid: smsResult.sid })
      } else {
        failedCount++
        results.push({ client_id: client.client_id, success: false, error: smsResult.error })
        console.error('Weekly nudge send failed for', client.client_id, smsResult.error)
      }
    }

    return NextResponse.json({
      sent_count: sentCount,
      failed_count: failedCount,
      results,
      generated_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Unexpected error in weekly-nudges/send:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
