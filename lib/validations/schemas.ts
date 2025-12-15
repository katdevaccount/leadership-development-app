import { z } from 'zod'

/**
 * Validation schemas for the Leadership Development App.
 * Used in server actions and API routes to validate input.
 */

// ============================================================================
// User & Auth Schemas
// ============================================================================

export const userRoleSchema = z.enum(['client', 'coach'])

/**
 * Phone number validation - E.164 format or empty string.
 * E.164 format: +[country code][number], e.g., +14155551234
 */
export const phoneSchema = z
  .string()
  .refine(
    (val) => val === '' || /^\+[1-9]\d{1,14}$/.test(val),
    'Enter phone in format +1234567890'
  )

export const userProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional().nullable(),
})

/**
 * Schema for updating user profile (settings page).
 */
export const updateProfileSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  name: z.string().min(1, 'Name is required').max(100).optional(),
  phone: phoneSchema.optional(),
  receiveWeeklyNudge: z.boolean().optional(),
})

// ============================================================================
// Onboarding Schemas
// ============================================================================

export const saveThemeSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  themeText: z
    .string()
    .min(1, 'Theme is required')
    .max(500, 'Theme must be less than 500 characters'),
})

export const saveProgressSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  text: z
    .string()
    .min(1, 'Progress entry is required')
    .max(2000, 'Progress entry must be less than 2000 characters'),
})

export const weeklyActionSchema = z
  .string()
  .min(1, 'Action is required')
  .max(500, 'Action must be less than 500 characters')

export const saveWeeklyActionsSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  actions: z
    .array(weeklyActionSchema)
    .min(1, 'At least one action is required')
    .max(10, 'Maximum 10 actions allowed'),
})

export const updateNudgePreferenceSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  receiveWeeklyNudge: z.boolean(),
})

// ============================================================================
// Weekly Actions Schemas
// ============================================================================

export const toggleActionCompleteSchema = z.object({
  actionId: z.string().uuid('Invalid action ID'),
  isCompleted: z.boolean(),
})

// ============================================================================
// Nudge Schemas
// ============================================================================

export const sendNudgeSchema = z.object({
  clientId: z.string().uuid('Invalid client ID'),
  messageText: z
    .string()
    .min(1, 'Message is required')
    .max(320, 'Message must be less than 320 characters (SMS limit)'),
})

// ============================================================================
// Type Exports
// ============================================================================

export type SaveThemeInput = z.infer<typeof saveThemeSchema>
export type SaveProgressInput = z.infer<typeof saveProgressSchema>
export type SaveWeeklyActionsInput = z.infer<typeof saveWeeklyActionsSchema>
export type UpdateNudgePreferenceInput = z.infer<typeof updateNudgePreferenceSchema>
export type ToggleActionCompleteInput = z.infer<typeof toggleActionCompleteSchema>
export type SendNudgeInput = z.infer<typeof sendNudgeSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
