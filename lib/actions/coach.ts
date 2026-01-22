'use server'

import { revalidatePath } from 'next/cache'
import { createClient, getUser } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { ActionResult } from './onboarding'

/**
 * Coach actions for the Leadership Development app.
 * These actions are restricted to users with the coach role.
 */

/**
 * Validates a URL format.
 * @param url - The URL to validate
 * @returns true if valid HTTPS URL, false otherwise
 */
function isValidHttpsUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Updates a client's Padlet URL.
 * Only coaches can update this field for any client.
 *
 * @param clientId - The client's user ID
 * @param padletUrl - The Padlet URL (or null/empty to remove)
 * @returns ActionResult with success/error status
 */
export async function updateClientPadletUrl(
  clientId: string,
  padletUrl: string | null
): Promise<ActionResult> {
  try {
    // Validate client ID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(clientId)) {
      return { success: false, error: 'Invalid client ID' }
    }

    // Normalize empty string to null
    const normalizedUrl = padletUrl?.trim() || null

    // Validate URL format if provided
    if (normalizedUrl) {
      if (normalizedUrl.length > 2048) {
        return { success: false, error: 'URL is too long (max 2048 characters)' }
      }
      if (!isValidHttpsUrl(normalizedUrl)) {
        return { success: false, error: 'Please enter a valid HTTPS URL' }
      }
    }

    // Get authenticated user
    const user = await getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const supabase = await createClient()

    // Verify user is a coach
    const { data: coachUser, error: coachError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (coachError || !coachUser) {
      return { success: false, error: 'Failed to verify permissions' }
    }

    if (coachUser.role !== 'coach') {
      return { success: false, error: 'Only coaches can update client Padlet links' }
    }

    // Verify the target is a client (not a coach)
    const { data: clientUser, error: clientError } = await supabase
      .from('users')
      .select('role')
      .eq('id', clientId)
      .single()

    if (clientError || !clientUser) {
      return { success: false, error: 'Client not found' }
    }

    if (clientUser.role !== 'client') {
      return { success: false, error: 'Can only update Padlet links for clients' }
    }

    // Update the client's padlet_url using admin client (bypasses RLS)
    // This is necessary because RLS only allows users to update their own row
    const adminClient = createAdminClient()
    const { error: updateError } = await adminClient
      .from('users')
      .update({ padlet_url: normalizedUrl })
      .eq('id', clientId)

    if (updateError) {
      console.error('Error updating padlet_url:', updateError)
      return { success: false, error: 'Failed to update Padlet link' }
    }

    // Revalidate the coach client detail page
    revalidatePath(`/coach/client/${clientId}`)

    return { success: true }
  } catch (err) {
    if (err instanceof Error) {
      return { success: false, error: err.message }
    }
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Helper function to verify coach permissions for client operations.
 * @returns Object with coach user or error
 */
async function verifyCoachAccess(clientId: string): Promise<{
  success: true;
  adminClient: ReturnType<typeof createAdminClient>;
} | {
  success: false;
  error: string;
}> {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(clientId)) {
    return { success: false, error: 'Invalid client ID' }
  }

  const user = await getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const supabase = await createClient()

  // Verify user is a coach
  const { data: coachUser, error: coachError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (coachError || !coachUser) {
    return { success: false, error: 'Failed to verify permissions' }
  }

  if (coachUser.role !== 'coach') {
    return { success: false, error: 'Only coaches can perform this action' }
  }

  // Verify the target is a client
  const { data: clientUser, error: clientError } = await supabase
    .from('users')
    .select('role')
    .eq('id', clientId)
    .single()

  if (clientError || !clientUser) {
    return { success: false, error: 'Client not found' }
  }

  if (clientUser.role !== 'client') {
    return { success: false, error: 'Can only modify data for clients' }
  }

  return { success: true, adminClient: createAdminClient() }
}

/**
 * Updates a client's leadership purpose (coach action).
 *
 * @param clientId - The client's user ID
 * @param purpose - The new leadership purpose text
 * @returns ActionResult with success/error status
 */
export async function updateClientLeadershipPurpose(
  clientId: string,
  purpose: string
): Promise<ActionResult> {
  try {
    if (purpose.length > 500) {
      return { success: false, error: 'Purpose must be less than 500 characters' }
    }

    const authResult = await verifyCoachAccess(clientId)
    if (!authResult.success) {
      return { success: false, error: authResult.error }
    }

    const { error: updateError } = await authResult.adminClient
      .from('users')
      .update({ leadership_purpose: purpose.trim() || null })
      .eq('id', clientId)

    if (updateError) {
      console.error('Error updating leadership purpose:', updateError)
      return { success: false, error: 'Failed to update leadership purpose' }
    }

    revalidatePath(`/coach/client/${clientId}`)
    revalidatePath('/client/home')

    return { success: true }
  } catch (err) {
    if (err instanceof Error) {
      return { success: false, error: err.message }
    }
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Updates a client's theme name (coach action).
 *
 * @param clientId - The client's user ID
 * @param themeId - The theme ID to update
 * @param themeText - The new theme name
 * @returns ActionResult with success/error status
 */
export async function updateClientThemeName(
  clientId: string,
  themeId: string,
  themeText: string
): Promise<ActionResult> {
  try {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(themeId)) {
      return { success: false, error: 'Invalid theme ID' }
    }
    if (!themeText || themeText.trim().length === 0) {
      return { success: false, error: 'Theme name is required' }
    }
    if (themeText.length > 100) {
      return { success: false, error: 'Theme name must be less than 100 characters' }
    }

    const authResult = await verifyCoachAccess(clientId)
    if (!authResult.success) {
      return { success: false, error: authResult.error }
    }

    // Verify theme belongs to the client
    const { data: theme, error: themeCheckError } = await authResult.adminClient
      .from('development_themes')
      .select('id')
      .eq('id', themeId)
      .eq('user_id', clientId)
      .single()

    if (themeCheckError || !theme) {
      return { success: false, error: 'Theme not found' }
    }

    const { error: updateError } = await authResult.adminClient
      .from('development_themes')
      .update({ theme_text: themeText.trim() })
      .eq('id', themeId)

    if (updateError) {
      console.error('Error updating theme name:', updateError)
      return { success: false, error: 'Failed to update theme' }
    }

    revalidatePath(`/coach/client/${clientId}`)
    revalidatePath('/client/home')

    return { success: true }
  } catch (err) {
    if (err instanceof Error) {
      return { success: false, error: err.message }
    }
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Updates a client's success description (coach action).
 *
 * @param clientId - The client's user ID
 * @param themeId - The theme ID to update
 * @param description - The new success description
 * @returns ActionResult with success/error status
 */
export async function updateClientSuccessDescription(
  clientId: string,
  themeId: string,
  description: string
): Promise<ActionResult> {
  try {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(themeId)) {
      return { success: false, error: 'Invalid theme ID' }
    }
    if (description.length > 2000) {
      return { success: false, error: 'Description must be less than 2000 characters' }
    }

    const authResult = await verifyCoachAccess(clientId)
    if (!authResult.success) {
      return { success: false, error: authResult.error }
    }

    // Verify theme belongs to the client
    const { data: theme, error: themeCheckError } = await authResult.adminClient
      .from('development_themes')
      .select('id')
      .eq('id', themeId)
      .eq('user_id', clientId)
      .single()

    if (themeCheckError || !theme) {
      return { success: false, error: 'Theme not found' }
    }

    const { error: updateError } = await authResult.adminClient
      .from('development_themes')
      .update({ success_description: description.trim() || null })
      .eq('id', themeId)

    if (updateError) {
      console.error('Error updating success description:', updateError)
      return { success: false, error: 'Failed to update description' }
    }

    revalidatePath(`/coach/client/${clientId}`)
    revalidatePath('/client/home')

    return { success: true }
  } catch (err) {
    if (err instanceof Error) {
      return { success: false, error: err.message }
    }
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Adds a hypothesis to a client's theme (coach action).
 *
 * @param clientId - The client's user ID
 * @param themeId - The theme ID to add the hypothesis to
 * @param hypothesisText - The hypothesis text
 * @returns ActionResult with the new hypothesis ID
 */
export async function addClientHypothesis(
  clientId: string,
  themeId: string,
  hypothesisText: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(themeId)) {
      return { success: false, error: 'Invalid theme ID' }
    }
    if (!hypothesisText || hypothesisText.trim().length === 0) {
      return { success: false, error: 'Hypothesis text is required' }
    }
    if (hypothesisText.length > 500) {
      return { success: false, error: 'Hypothesis must be less than 500 characters' }
    }

    const authResult = await verifyCoachAccess(clientId)
    if (!authResult.success) {
      return { success: false, error: authResult.error }
    }

    // Verify theme belongs to the client
    const { data: theme, error: themeCheckError } = await authResult.adminClient
      .from('development_themes')
      .select('id')
      .eq('id', themeId)
      .eq('user_id', clientId)
      .single()

    if (themeCheckError || !theme) {
      return { success: false, error: 'Theme not found' }
    }

    const { data, error } = await authResult.adminClient
      .from('weekly_actions')
      .insert({
        user_id: clientId,
        theme_id: themeId,
        action_text: hypothesisText.trim(),
        is_completed: false,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error adding hypothesis:', error)
      return { success: false, error: 'Failed to add hypothesis' }
    }

    revalidatePath(`/coach/client/${clientId}`)
    revalidatePath('/client/home')

    return { success: true, data: { id: data.id } }
  } catch (err) {
    if (err instanceof Error) {
      return { success: false, error: err.message }
    }
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Updates a client's hypothesis text (coach action).
 *
 * @param clientId - The client's user ID
 * @param hypothesisId - The hypothesis ID to update
 * @param newText - The new hypothesis text
 * @returns ActionResult with success/error status
 */
export async function updateClientHypothesis(
  clientId: string,
  hypothesisId: string,
  newText: string
): Promise<ActionResult> {
  try {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(hypothesisId)) {
      return { success: false, error: 'Invalid hypothesis ID' }
    }
    if (!newText || newText.trim().length === 0) {
      return { success: false, error: 'Hypothesis text is required' }
    }
    if (newText.length > 500) {
      return { success: false, error: 'Hypothesis must be less than 500 characters' }
    }

    const authResult = await verifyCoachAccess(clientId)
    if (!authResult.success) {
      return { success: false, error: authResult.error }
    }

    // Verify hypothesis belongs to the client
    const { data: hypothesis, error: hypothesisCheckError } = await authResult.adminClient
      .from('weekly_actions')
      .select('id')
      .eq('id', hypothesisId)
      .eq('user_id', clientId)
      .single()

    if (hypothesisCheckError || !hypothesis) {
      return { success: false, error: 'Hypothesis not found' }
    }

    const { error: updateError } = await authResult.adminClient
      .from('weekly_actions')
      .update({ action_text: newText.trim() })
      .eq('id', hypothesisId)

    if (updateError) {
      console.error('Error updating hypothesis:', updateError)
      return { success: false, error: 'Failed to update hypothesis' }
    }

    revalidatePath(`/coach/client/${clientId}`)
    revalidatePath('/client/home')

    return { success: true }
  } catch (err) {
    if (err instanceof Error) {
      return { success: false, error: err.message }
    }
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Deletes a client's hypothesis (coach action).
 *
 * @param clientId - The client's user ID
 * @param hypothesisId - The hypothesis ID to delete
 * @returns ActionResult with success/error status
 */
export async function deleteClientHypothesis(
  clientId: string,
  hypothesisId: string
): Promise<ActionResult> {
  try {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(hypothesisId)) {
      return { success: false, error: 'Invalid hypothesis ID' }
    }

    const authResult = await verifyCoachAccess(clientId)
    if (!authResult.success) {
      return { success: false, error: authResult.error }
    }

    // Verify hypothesis belongs to the client
    const { data: hypothesis, error: hypothesisCheckError } = await authResult.adminClient
      .from('weekly_actions')
      .select('id')
      .eq('id', hypothesisId)
      .eq('user_id', clientId)
      .single()

    if (hypothesisCheckError || !hypothesis) {
      return { success: false, error: 'Hypothesis not found' }
    }

    const { error: deleteError } = await authResult.adminClient
      .from('weekly_actions')
      .delete()
      .eq('id', hypothesisId)

    if (deleteError) {
      console.error('Error deleting hypothesis:', deleteError)
      return { success: false, error: 'Failed to delete hypothesis' }
    }

    revalidatePath(`/coach/client/${clientId}`)
    revalidatePath('/client/home')

    return { success: true }
  } catch (err) {
    if (err instanceof Error) {
      return { success: false, error: err.message }
    }
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Deletes a client from the system (coach action).
 * This removes the client from auth.users, which cascades to delete
 * all related data (profile, themes, actions, settings, nudge history).
 *
 * @param clientId - The client's user ID to delete
 * @returns ActionResult with success/error status
 */
export async function deleteClient(clientId: string): Promise<ActionResult> {
  try {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(clientId)) {
      return { success: false, error: 'Invalid client ID' }
    }

    // Get authenticated user
    const user = await getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const supabase = await createClient()

    // Verify user is a coach
    const { data: coachUser, error: coachError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (coachError || !coachUser) {
      return { success: false, error: 'Failed to verify permissions' }
    }

    if (coachUser.role !== 'coach') {
      return { success: false, error: 'Only coaches can delete clients' }
    }

    // Verify the target exists and is a client (not a coach)
    const adminClient = createAdminClient()
    const { data: clientUser, error: clientError } = await adminClient
      .from('users')
      .select('role, name')
      .eq('id', clientId)
      .single()

    if (clientError || !clientUser) {
      return { success: false, error: 'Client not found' }
    }

    if (clientUser.role !== 'client') {
      return { success: false, error: 'Cannot delete coaches' }
    }

    // Delete the user from auth.users - this cascades to public.users
    // and all related tables (themes, actions, settings, nudges)
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(clientId)

    if (deleteError) {
      console.error('Error deleting client:', deleteError)
      return { success: false, error: 'Failed to delete client' }
    }

    // Revalidate the dashboard
    revalidatePath('/coach/dashboard')

    return { success: true }
  } catch (err) {
    if (err instanceof Error) {
      return { success: false, error: err.message }
    }
    return { success: false, error: 'An unexpected error occurred' }
  }
}
