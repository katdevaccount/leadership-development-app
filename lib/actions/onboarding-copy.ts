'use server'

import { revalidatePath } from 'next/cache'
import { createClient, getUser } from '@/lib/supabase/server'
import type { ActionResult } from './onboarding'
import type { OnboardingPageKey } from '@/lib/config/onboarding-defaults'

/**
 * Updates the onboarding copy for a specific page.
 * Only coaches can update onboarding copy.
 *
 * @param pageKey - The page key (onboarding, job-role, company-info, welcome)
 * @param copyData - The custom copy data to save
 * @returns ActionResult with success/error status
 */
export async function updateOnboardingCopy(
  pageKey: OnboardingPageKey,
  copyData: Record<string, unknown>
): Promise<ActionResult> {
  try {
    // Validate page key
    const validPageKeys: OnboardingPageKey[] = ['onboarding', 'job-role', 'company-info', 'welcome']
    if (!validPageKeys.includes(pageKey)) {
      return { success: false, error: 'Invalid page key' }
    }

    // Get authenticated user
    const user = await getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const supabase = await createClient()

    // Verify user is a coach
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return { success: false, error: 'Failed to verify permissions' }
    }

    if (userData.role !== 'coach') {
      return { success: false, error: 'Only coaches can update onboarding copy' }
    }

    // Clean the copy data - remove empty strings and null values
    const cleanedData: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(copyData)) {
      if (value !== '' && value !== null && value !== undefined) {
        // For arrays, only include if they have items
        if (Array.isArray(value)) {
          const filtered = value.filter((v: unknown) => v !== '' && v !== null && v !== undefined)
          if (filtered.length > 0) {
            cleanedData[key] = filtered
          }
        } else {
          cleanedData[key] = value
        }
      }
    }

    // Upsert the copy data
    const { error: upsertError } = await supabase
      .from('onboarding_copy')
      .upsert({
        page_key: pageKey,
        copy_data: cleanedData as unknown as Record<string, never>,
        updated_by: user.id,
      }, {
        onConflict: 'page_key',
      })

    if (upsertError) {
      console.error('Error updating onboarding copy:', upsertError)
      return { success: false, error: 'Failed to update onboarding copy' }
    }

    // Revalidate the onboarding pages and coach settings
    revalidatePath('/onboarding')
    revalidatePath('/job-role')
    revalidatePath('/company-info')
    revalidatePath('/welcome')
    revalidatePath('/coach/settings/onboarding')

    return { success: true }
  } catch (err) {
    if (err instanceof Error) {
      return { success: false, error: err.message }
    }
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Resets the onboarding copy for a specific page to defaults.
 * This deletes the custom copy from the database.
 *
 * @param pageKey - The page key to reset
 * @returns ActionResult with success/error status
 */
export async function resetOnboardingCopy(
  pageKey: OnboardingPageKey
): Promise<ActionResult> {
  try {
    // Validate page key
    const validPageKeys: OnboardingPageKey[] = ['onboarding', 'job-role', 'company-info', 'welcome']
    if (!validPageKeys.includes(pageKey)) {
      return { success: false, error: 'Invalid page key' }
    }

    // Get authenticated user
    const user = await getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const supabase = await createClient()

    // Verify user is a coach
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return { success: false, error: 'Failed to verify permissions' }
    }

    if (userData.role !== 'coach') {
      return { success: false, error: 'Only coaches can reset onboarding copy' }
    }

    // Delete the custom copy (will fall back to defaults)
    const { error: deleteError } = await supabase
      .from('onboarding_copy')
      .delete()
      .eq('page_key', pageKey)

    if (deleteError) {
      console.error('Error resetting onboarding copy:', deleteError)
      return { success: false, error: 'Failed to reset onboarding copy' }
    }

    // Revalidate the onboarding pages and coach settings
    revalidatePath('/onboarding')
    revalidatePath('/job-role')
    revalidatePath('/company-info')
    revalidatePath('/welcome')
    revalidatePath('/coach/settings/onboarding')

    return { success: true }
  } catch (err) {
    if (err instanceof Error) {
      return { success: false, error: err.message }
    }
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Resets all onboarding copy to defaults.
 *
 * @returns ActionResult with success/error status
 */
export async function resetAllOnboardingCopy(): Promise<ActionResult> {
  try {
    // Get authenticated user
    const user = await getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const supabase = await createClient()

    // Verify user is a coach
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return { success: false, error: 'Failed to verify permissions' }
    }

    if (userData.role !== 'coach') {
      return { success: false, error: 'Only coaches can reset onboarding copy' }
    }

    // Delete all custom copy
    const { error: deleteError } = await supabase
      .from('onboarding_copy')
      .delete()
      .neq('page_key', '') // Delete all rows

    if (deleteError) {
      console.error('Error resetting all onboarding copy:', deleteError)
      return { success: false, error: 'Failed to reset onboarding copy' }
    }

    // Revalidate all pages
    revalidatePath('/onboarding')
    revalidatePath('/job-role')
    revalidatePath('/company-info')
    revalidatePath('/welcome')
    revalidatePath('/coach/settings/onboarding')

    return { success: true }
  } catch (err) {
    if (err instanceof Error) {
      return { success: false, error: err.message }
    }
    return { success: false, error: 'An unexpected error occurred' }
  }
}
