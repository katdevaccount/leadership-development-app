/**
 * Default copy for onboarding pages.
 * These values are used when no custom copy is set in the database.
 */

export interface OnboardingCopy {
  title: string
  subtitle: string
  step1: string
  step2: string
  step3: string
  buttonText: string
}

export interface JobRoleCopy {
  purposeTitle: string
  purposeSubtitle: string
  purposePlaceholder: string
  themesTitle: string
  themesSubtitle: string
  themePlaceholder: string
  themeSecondaryPlaceholder: string
  suggestionsLabel: string
  suggestions: string[]
  buttonText: string
  backButtonText: string
}

export interface CompanyInfoCopy {
  titleSingle: string
  titleMultiple: string
  subtitleSingle: string
  subtitleMultiple: string
  placeholder: string
  footer: string
  buttonText: string
  backButtonText: string
}

export interface WelcomeCopy {
  title: string
  subtitle: string
  ideasTitle: string
  ideasSubtitle: string
  ideasPlaceholders: string[]
  phoneLabel: string
  phonePlaceholder: string
  phoneHelper: string
  nudgeLabel: string
  buttonText: string
}

export type OnboardingPageKey = 'onboarding' | 'job-role' | 'company-info' | 'welcome'

export type OnboardingCopyData =
  | OnboardingCopy
  | JobRoleCopy
  | CompanyInfoCopy
  | WelcomeCopy

export const ONBOARDING_DEFAULTS: OnboardingCopy = {
  title: 'Welcome!',
  subtitle: "Let's set up your leadership development journey.",
  step1: 'Choose your development theme',
  step2: 'Envision what progress looks like',
  step3: 'Translate your theme into weekly actions',
  buttonText: 'Begin',
}

export const JOB_ROLE_DEFAULTS: JobRoleCopy = {
  purposeTitle: 'Leadership Purpose',
  purposeSubtitle: 'Why do you do what you do? (optional)',
  purposePlaceholder: 'e.g., To create environments where people thrive and grow...',
  themesTitle: 'Development Themes',
  themesSubtitle: 'What do you want to work on as a leader? (up to 3)',
  themePlaceholder: 'e.g., Delegation, Presence, Clarity',
  themeSecondaryPlaceholder: 'Another theme (1-4 words)',
  suggestionsLabel: 'Or choose from suggestions:',
  suggestions: ['Delegation', 'Presence', 'Clarity', 'Trust', 'Boundaries', 'Strategy', 'Balance'],
  buttonText: 'Continue',
  backButtonText: 'Go back',
}

export const COMPANY_INFO_DEFAULTS: CompanyInfoCopy = {
  titleSingle: 'What will be different?',
  titleMultiple: 'Envision success for each theme',
  subtitleSingle: "Describe your envisioned future. Start with 'I' and describe what you do, feel, and experience.",
  subtitleMultiple: "Describe what progress looks like for each theme. Start with 'I'...",
  placeholder: 'Start with "I" — e.g., "I feel calm and confident. I ask questions before giving advice. Others notice I\'m more present."',
  footer: "This isn't a goal to complete — it's a vision of who you're becoming.",
  buttonText: 'Continue',
  backButtonText: 'Go back',
}

export const WELCOME_DEFAULTS: WelcomeCopy = {
  title: 'Almost there!',
  subtitle: 'What experiments, principles, or reminders will guide your progress?',
  ideasTitle: 'Ideas & Experiments',
  ideasSubtitle: 'Things to stop, start, or do differently. Mantras, principles, or small experiments.',
  ideasPlaceholders: [
    'Pause before saying yes',
    "Ask 'What do you think?' first",
    'Delegate one thing each day',
  ],
  phoneLabel: 'Phone Number',
  phonePlaceholder: '+1234567890',
  phoneHelper: 'Required for SMS nudges. You can add this later in Settings.',
  nudgeLabel: 'Receive leadership nudges',
  buttonText: 'Enter the app',
}

/**
 * Get the default copy for a specific page.
 */
export function getDefaultCopy(pageKey: OnboardingPageKey): OnboardingCopyData {
  switch (pageKey) {
    case 'onboarding':
      return ONBOARDING_DEFAULTS
    case 'job-role':
      return JOB_ROLE_DEFAULTS
    case 'company-info':
      return COMPANY_INFO_DEFAULTS
    case 'welcome':
      return WELCOME_DEFAULTS
    default:
      throw new Error(`Unknown page key: ${pageKey}`)
  }
}

/**
 * Merge custom copy with defaults, using defaults for any missing fields.
 */
export function mergeCopyWithDefaults<T extends OnboardingCopyData>(
  pageKey: OnboardingPageKey,
  customCopy: Partial<T> | null
): T {
  const defaults = getDefaultCopy(pageKey) as T

  if (!customCopy) {
    return defaults
  }

  // Deep merge: use custom value if it exists and is not empty, otherwise use default
  const merged: Record<string, unknown> = { ...defaults }

  for (const key of Object.keys(defaults)) {
    const customValue = customCopy[key as keyof T]
    if (customValue !== undefined && customValue !== null && customValue !== '') {
      // For arrays, only use custom if it has items
      if (Array.isArray(customValue) && customValue.length === 0) {
        continue
      }
      merged[key] = customValue
    }
  }

  return merged as T
}

/**
 * Get all page keys.
 */
export function getAllPageKeys(): OnboardingPageKey[] {
  return ['onboarding', 'job-role', 'company-info', 'welcome']
}

/**
 * Get human-readable name for a page key.
 */
export function getPageName(pageKey: OnboardingPageKey): string {
  switch (pageKey) {
    case 'onboarding':
      return 'Welcome Screen'
    case 'job-role':
      return 'Theme Selection'
    case 'company-info':
      return 'Envisioned Future'
    case 'welcome':
      return 'Ideas & Finish'
    default:
      return pageKey
  }
}
