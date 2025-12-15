'use server'

import { revalidatePath } from 'next/cache'
import { createClient, getUser } from '@/lib/supabase/server'
import {
  updateProfileSchema,
  type UpdateProfileInput,
} from '@/lib/validations/schemas'
import type { ActionResult } from './onboarding'

/**
 * Updates the user's profile information (name, phone, nudge preference).
 * Used on the /client/settings page.
 *
 * @param input - Contains userId and optional fields to update
 * @returns ActionResult with success/error status
 *
 * Usage:
 * ```tsx
 * const result = await updateProfile({
 *   userId: '...',
 *   name: 'New Name',
 *   phone: '+14155551234',
 *   receiveWeeklyNudge: true
 * })
 * ```
 */
export async function updateProfile(
  input: UpdateProfileInput
): Promise<ActionResult> {
  try {
    // Validate input
    const validated = updateProfileSchema.parse(input)

    // Verify user is authenticated and owns this profile
    const user = await getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }
    if (user.id !== validated.userId) {
      return { success: false, error: 'Unauthorized: Cannot modify another user\'s profile' }
    }

    const supabase = await createClient()

    // Update user profile (name, phone) if provided
    const userUpdates: { name?: string; phone?: string | null } = {}
    if (validated.name !== undefined) {
      userUpdates.name = validated.name
    }
    if (validated.phone !== undefined) {
      // Store empty string as null in database
      userUpdates.phone = validated.phone === '' ? null : validated.phone
    }

    if (Object.keys(userUpdates).length > 0) {
      const { error: userError } = await supabase
        .from('users')
        .update(userUpdates)
        .eq('id', validated.userId)

      if (userError) {
        console.error('Error updating user profile:', userError)
        return { success: false, error: 'Failed to update profile' }
      }
    }

    // Update settings (nudge preference) if provided
    if (validated.receiveWeeklyNudge !== undefined) {
      const { error: settingsError } = await supabase
        .from('settings')
        .update({ receive_weekly_nudge: validated.receiveWeeklyNudge })
        .eq('user_id', validated.userId)

      if (settingsError) {
        console.error('Error updating settings:', settingsError)
        return { success: false, error: 'Failed to update settings' }
      }
    }

    // Revalidate pages that show this data
    revalidatePath('/client/home')
    revalidatePath('/client/settings')

    return { success: true }
  } catch (err) {
    if (err instanceof Error) {
      // Zod validation errors
      if (err.name === 'ZodError') {
        const zodErr = err as { errors?: Array<{ message: string }> }
        return { success: false, error: zodErr.errors?.[0]?.message || 'Validation error' }
      }
      return { success: false, error: err.message }
    }
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Gets the user's profile data for the settings page.
 * Returns user info and settings in a single call.
 */
export async function getProfileData(): Promise<{
  user: { id: string; name: string; email: string; phone: string | null } | null
  settings: { receive_weekly_nudge: boolean } | null
  error?: string
}> {
  try {
    const authUser = await getUser()
    if (!authUser) {
      return { user: null, settings: null, error: 'Not authenticated' }
    }

    const supabase = await createClient()

    // Fetch user and settings in parallel
    const [userResult, settingsResult] = await Promise.all([
      supabase
        .from('users')
        .select('id, name, email, phone')
        .eq('id', authUser.id)
        .single(),
      supabase
        .from('settings')
        .select('receive_weekly_nudge')
        .eq('user_id', authUser.id)
        .single(),
    ])

    if (userResult.error) {
      console.error('Error fetching user:', userResult.error)
      return { user: null, settings: null, error: 'Failed to load profile' }
    }

    // Settings might not exist yet, that's okay
    const settings = settingsResult.data || { receive_weekly_nudge: true }

    return {
      user: userResult.data,
      settings,
    }
  } catch (err) {
    console.error('Error in getProfileData:', err)
    return { user: null, settings: null, error: 'An unexpected error occurred' }
  }
}
