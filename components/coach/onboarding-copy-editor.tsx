'use client'

import { useState, useTransition } from 'react'
import { ChevronDown, ChevronUp, RotateCcw, Save, Loader2, Check, X, Plus, Trash2 } from 'lucide-react'
import { updateOnboardingCopy, resetOnboardingCopy } from '@/lib/actions/onboarding-copy'
import {
  type OnboardingPageKey,
  type OnboardingCopy,
  type JobRoleCopy,
  type CompanyInfoCopy,
  type WelcomeCopy,
  getPageName,
  getDefaultCopy,
} from '@/lib/config/onboarding-defaults'

type CopyData = OnboardingCopy | JobRoleCopy | CompanyInfoCopy | WelcomeCopy

interface OnboardingCopyEditorProps {
  pageKey: OnboardingPageKey
  currentCopy: CopyData
  customCopy: Record<string, unknown> | null
}

export function OnboardingCopyEditor({ pageKey, currentCopy, customCopy }: OnboardingCopyEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [editedCopy, setEditedCopy] = useState<Record<string, unknown>>(
    customCopy ? { ...customCopy } : {}
  )
  const [isSaving, startSaveTransition] = useTransition()
  const [isResetting, startResetTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const defaults = getDefaultCopy(pageKey) as unknown as Record<string, unknown>
  const hasCustomizations = customCopy && Object.keys(customCopy).length > 0

  const handleFieldChange = (field: string, value: unknown) => {
    setEditedCopy(prev => ({
      ...prev,
      [field]: value,
    }))
    setMessage(null)
  }

  const handleArrayFieldChange = (field: string, index: number, value: string) => {
    const currentArray = (editedCopy[field] as string[] | undefined) || (defaults[field] as string[])
    const newArray = [...currentArray]
    newArray[index] = value
    handleFieldChange(field, newArray)
  }

  const handleAddArrayItem = (field: string) => {
    const currentArray = (editedCopy[field] as string[] | undefined) || (defaults[field] as string[])
    handleFieldChange(field, [...currentArray, ''])
  }

  const handleRemoveArrayItem = (field: string, index: number) => {
    const currentArray = (editedCopy[field] as string[] | undefined) || (defaults[field] as string[])
    handleFieldChange(field, currentArray.filter((_, i) => i !== index))
  }

  const handleSave = () => {
    setMessage(null)
    startSaveTransition(async () => {
      const result = await updateOnboardingCopy(pageKey, editedCopy)
      if (result.success) {
        setMessage({ type: 'success', text: 'Saved successfully!' })
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to save' })
      }
    })
  }

  const handleReset = () => {
    setMessage(null)
    startResetTransition(async () => {
      const result = await resetOnboardingCopy(pageKey)
      if (result.success) {
        setEditedCopy({})
        setMessage({ type: 'success', text: 'Reset to defaults!' })
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to reset' })
      }
    })
  }

  const handleClearField = (field: string) => {
    const newCopy = { ...editedCopy }
    delete newCopy[field]
    setEditedCopy(newCopy)
    setMessage(null)
  }

  const getFieldValue = (field: string): string => {
    const editedValue = editedCopy[field]
    if (editedValue !== undefined && editedValue !== null && editedValue !== '') {
      return String(editedValue)
    }
    return ''
  }

  const getArrayFieldValue = (field: string): string[] => {
    const editedValue = editedCopy[field]
    if (Array.isArray(editedValue) && editedValue.length > 0) {
      return editedValue
    }
    return defaults[field] as string[]
  }

  const isFieldCustomized = (field: string): boolean => {
    return editedCopy[field] !== undefined && editedCopy[field] !== null && editedCopy[field] !== ''
  }

  const renderField = (field: string, label: string, isTextarea = false) => {
    const defaultValue = String(defaults[field] || '')
    const customized = isFieldCustomized(field)
    const value = getFieldValue(field)

    return (
      <div key={field} className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-mono text-gray-600">
            {label}
            {customized && (
              <span className="ml-2 text-xs text-[#8B1E3F]">(customized)</span>
            )}
          </label>
          {customized && (
            <button
              onClick={() => handleClearField(field)}
              className="text-xs text-gray-400 hover:text-gray-600 font-mono flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>
        {isTextarea ? (
          <textarea
            value={value}
            onChange={(e) => handleFieldChange(field, e.target.value)}
            placeholder={defaultValue}
            rows={3}
            className="w-full px-3 py-2 bg-[#f0f3fa] rounded-xl text-gray-700 placeholder-gray-400 font-mono text-sm outline-none shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff] focus:ring-2 focus:ring-[#8B1E3F80] transition-all resize-none"
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(field, e.target.value)}
            placeholder={defaultValue}
            className="w-full px-3 py-2 bg-[#f0f3fa] rounded-xl text-gray-700 placeholder-gray-400 font-mono text-sm outline-none shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff] focus:ring-2 focus:ring-[#8B1E3F80] transition-all"
          />
        )}
        <p className="text-xs text-gray-400 font-mono mt-1">
          Default: {defaultValue.length > 60 ? defaultValue.substring(0, 60) + '...' : defaultValue}
        </p>
      </div>
    )
  }

  const renderArrayField = (field: string, label: string) => {
    const values = getArrayFieldValue(field)
    const customized = isFieldCustomized(field)

    return (
      <div key={field} className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-mono text-gray-600">
            {label}
            {customized && (
              <span className="ml-2 text-xs text-[#8B1E3F]">(customized)</span>
            )}
          </label>
          {customized && (
            <button
              onClick={() => handleClearField(field)}
              className="text-xs text-gray-400 hover:text-gray-600 font-mono flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>
        <div className="space-y-2">
          {values.map((value, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={value}
                onChange={(e) => handleArrayFieldChange(field, index, e.target.value)}
                placeholder={`Item ${index + 1}`}
                className="flex-1 px-3 py-2 bg-[#f0f3fa] rounded-xl text-gray-700 placeholder-gray-400 font-mono text-sm outline-none shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff] focus:ring-2 focus:ring-[#8B1E3F80] transition-all"
              />
              {values.length > 1 && (
                <button
                  onClick={() => handleRemoveArrayItem(field, index)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={() => handleAddArrayItem(field)}
          className="mt-2 flex items-center gap-1 text-xs text-gray-500 hover:text-[#8B1E3F] font-mono transition-colors"
        >
          <Plus className="w-3 h-3" />
          Add item
        </button>
      </div>
    )
  }

  const renderFields = () => {
    switch (pageKey) {
      case 'onboarding':
        return (
          <>
            {renderField('title', 'Title')}
            {renderField('subtitle', 'Subtitle', true)}
            {renderField('step1', 'Step 1')}
            {renderField('step2', 'Step 2')}
            {renderField('step3', 'Step 3')}
            {renderField('buttonText', 'Button Text')}
          </>
        )
      case 'job-role':
        return (
          <>
            {renderField('purposeTitle', 'Purpose Title')}
            {renderField('purposeSubtitle', 'Purpose Subtitle')}
            {renderField('purposePlaceholder', 'Purpose Placeholder', true)}
            {renderField('themesTitle', 'Themes Title')}
            {renderField('themesSubtitle', 'Themes Subtitle')}
            {renderField('themePlaceholder', 'Theme Placeholder')}
            {renderField('themeSecondaryPlaceholder', 'Secondary Placeholder')}
            {renderField('suggestionsLabel', 'Suggestions Label')}
            {renderArrayField('suggestions', 'Theme Suggestions')}
            {renderField('buttonText', 'Continue Button')}
            {renderField('backButtonText', 'Back Button')}
          </>
        )
      case 'company-info':
        return (
          <>
            {renderField('titleSingle', 'Title (Single Theme)')}
            {renderField('titleMultiple', 'Title (Multiple Themes)')}
            {renderField('subtitleSingle', 'Subtitle (Single)', true)}
            {renderField('subtitleMultiple', 'Subtitle (Multiple)', true)}
            {renderField('placeholder', 'Textarea Placeholder', true)}
            {renderField('footer', 'Footer Text', true)}
            {renderField('buttonText', 'Continue Button')}
            {renderField('backButtonText', 'Back Button')}
          </>
        )
      case 'welcome':
        return (
          <>
            {renderField('title', 'Title')}
            {renderField('subtitle', 'Subtitle', true)}
            {renderField('ideasTitle', 'Ideas Section Title')}
            {renderField('ideasSubtitle', 'Ideas Section Subtitle', true)}
            {renderArrayField('ideasPlaceholders', 'Idea Placeholders')}
            {renderField('phoneLabel', 'Phone Label')}
            {renderField('phonePlaceholder', 'Phone Placeholder')}
            {renderField('phoneHelper', 'Phone Helper Text', true)}
            {renderField('nudgeLabel', 'Nudge Toggle Label')}
            {renderField('buttonText', 'Enter App Button')}
          </>
        )
      default:
        return null
    }
  }

  return (
    <div className="bg-[#f0f3fa] rounded-2xl shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#e8ebf3] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-base font-semibold text-gray-700 font-mono">
            {getPageName(pageKey)}
          </span>
          {hasCustomizations && (
            <span className="px-2 py-0.5 bg-[#8B1E3F20] text-[#8B1E3F] text-xs font-mono rounded-full">
              Customized
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-200">
          <div className="pt-4">
            {renderFields()}
          </div>

          {/* Message */}
          {message && (
            <div
              className={`mb-4 p-3 rounded-xl text-sm font-mono flex items-center gap-2 ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {message.type === 'success' ? (
                <Check className="w-4 h-4" />
              ) : (
                <X className="w-4 h-4" />
              )}
              {message.text}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-mono text-white bg-[#8B1E3F] rounded-xl shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#d1d9e6,-2px_-2px_4px_#ffffff] active:shadow-[inset_2px_2px_4px_#6d1731] transition-all duration-200 disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Changes
            </button>
            <button
              onClick={handleReset}
              disabled={isResetting || !hasCustomizations}
              className="flex items-center gap-2 px-4 py-2 text-sm font-mono text-gray-600 bg-[#f0f3fa] rounded-xl shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#d1d9e6,-2px_-2px_4px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] transition-all duration-200 disabled:opacity-50"
            >
              {isResetting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RotateCcw className="w-4 h-4" />
              )}
              Reset to Defaults
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
