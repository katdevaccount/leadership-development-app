'use server'

import { createClient } from '@/lib/supabase/server'
import {
  type OnboardingPageKey,
  type OnboardingCopyData,
  type OnboardingCopy,
  type JobRoleCopy,
  type CompanyInfoCopy,
  type WelcomeCopy,
  mergeCopyWithDefaults,
} from '@/lib/config/onboarding-defaults'

/**
 * Get the onboarding copy for a specific page.
 * Returns merged copy with defaults filled in for any missing fields.
 */
export async function getOnboardingCopy<T extends OnboardingCopyData>(
  pageKey: OnboardingPageKey
): Promise<T> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('onboarding_copy')
      .select('copy_data')
      .eq('page_key', pageKey)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned, which is fine (use defaults)
      console.error('Error fetching onboarding copy:', error)
    }

    const customCopy = data?.copy_data as Partial<T> | null
    return mergeCopyWithDefaults<T>(pageKey, customCopy)
  } catch (err) {
    console.error('Error in getOnboardingCopy:', err)
    // Return defaults on error
    return mergeCopyWithDefaults<T>(pageKey, null)
  }
}

/**
 * Get all onboarding copy entries from the database.
 * Used for the coach settings page.
 */
export async function getAllOnboardingCopy(): Promise<{
  onboarding: OnboardingCopy
  'job-role': JobRoleCopy
  'company-info': CompanyInfoCopy
  welcome: WelcomeCopy
}> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('onboarding_copy')
      .select('page_key, copy_data')

    if (error) {
      console.error('Error fetching all onboarding copy:', error)
    }

    // Build a map of page_key -> copy_data
    const copyMap = new Map<string, Record<string, unknown>>()
    if (data) {
      for (const row of data) {
        copyMap.set(row.page_key, row.copy_data as Record<string, unknown>)
      }
    }

    return {
      onboarding: mergeCopyWithDefaults<OnboardingCopy>('onboarding', copyMap.get('onboarding') as Partial<OnboardingCopy> | undefined ?? null),
      'job-role': mergeCopyWithDefaults<JobRoleCopy>('job-role', copyMap.get('job-role') as Partial<JobRoleCopy> | undefined ?? null),
      'company-info': mergeCopyWithDefaults<CompanyInfoCopy>('company-info', copyMap.get('company-info') as Partial<CompanyInfoCopy> | undefined ?? null),
      welcome: mergeCopyWithDefaults<WelcomeCopy>('welcome', copyMap.get('welcome') as Partial<WelcomeCopy> | undefined ?? null),
    }
  } catch (err) {
    console.error('Error in getAllOnboardingCopy:', err)
    // Return all defaults on error
    return {
      onboarding: mergeCopyWithDefaults<OnboardingCopy>('onboarding', null),
      'job-role': mergeCopyWithDefaults<JobRoleCopy>('job-role', null),
      'company-info': mergeCopyWithDefaults<CompanyInfoCopy>('company-info', null),
      welcome: mergeCopyWithDefaults<WelcomeCopy>('welcome', null),
    }
  }
}

/**
 * Get raw custom copy data for a page (without merging with defaults).
 * Used for the coach editor to see what's actually customized.
 */
export async function getRawOnboardingCopy(
  pageKey: OnboardingPageKey
): Promise<Record<string, unknown> | null> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('onboarding_copy')
      .select('copy_data')
      .eq('page_key', pageKey)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // No custom copy exists
      }
      console.error('Error fetching raw onboarding copy:', error)
      return null
    }

    return data?.copy_data as Record<string, unknown> | null
  } catch (err) {
    console.error('Error in getRawOnboardingCopy:', err)
    return null
  }
}
