'use client'

import { useState, useTransition } from 'react'
import { ExternalLink, Pencil, X, Check, Loader2, Link2 } from 'lucide-react'
import { updateClientPadletUrl } from '@/lib/actions/coach'

interface PadletLinkEditorProps {
  clientId: string
  currentUrl: string | null
}

/**
 * Inline editor for a client's Padlet link.
 * Shows truncated URL with edit/view actions, or "Add Padlet link" when empty.
 */
export function PadletLinkEditor({ clientId, currentUrl }: PadletLinkEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [inputValue, setInputValue] = useState(currentUrl || '')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleEdit = () => {
    setInputValue(currentUrl || '')
    setError(null)
    setIsEditing(true)
  }

  const handleCancel = () => {
    setInputValue(currentUrl || '')
    setError(null)
    setIsEditing(false)
  }

  const handleSave = () => {
    setError(null)
    startTransition(async () => {
      const result = await updateClientPadletUrl(clientId, inputValue || null)
      if (result.success) {
        setIsEditing(false)
      } else {
        setError(result.error)
      }
    })
  }

  const handleRemove = () => {
    setError(null)
    startTransition(async () => {
      const result = await updateClientPadletUrl(clientId, null)
      if (result.success) {
        setInputValue('')
        setIsEditing(false)
      } else {
        setError(result.error)
      }
    })
  }

  // Truncate URL for display
  const displayUrl = currentUrl
    ? currentUrl.length > 40
      ? currentUrl.slice(0, 40) + '...'
      : currentUrl
    : null

  if (isEditing) {
    return (
      <div className="mt-3 pt-3 border-t border-gray-200/60">
        <div className="flex items-center gap-1.5 text-gray-400 mb-2">
          <Link2 className="w-3.5 h-3.5" />
          <span className="text-xs font-mono">Padlet Link</span>
        </div>
        <div className="flex flex-col gap-2">
          <input
            type="url"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="https://padlet.com/..."
            disabled={isPending}
            className="w-full px-3 py-2 bg-[#f0f3fa] rounded-xl text-sm font-mono text-gray-700 placeholder-gray-400 shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff] outline-none focus:ring-2 focus:ring-[#8B1E3F80] transition-all disabled:opacity-50"
          />
          {error && (
            <p className="text-xs text-red-500 font-mono">{error}</p>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={isPending}
              className="px-3 py-1.5 bg-[#f0f3fa] rounded-lg text-xs font-mono text-[#8B1E3F] shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#d1d9e6,-2px_-2px_4px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] transition-all duration-200 flex items-center gap-1 disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Check className="w-3 h-3" />
              )}
              Save
            </button>
            <button
              onClick={handleCancel}
              disabled={isPending}
              className="px-3 py-1.5 bg-[#f0f3fa] rounded-lg text-xs font-mono text-gray-500 shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#d1d9e6,-2px_-2px_4px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] transition-all duration-200 flex items-center gap-1 disabled:opacity-50"
            >
              <X className="w-3 h-3" />
              Cancel
            </button>
            {currentUrl && (
              <button
                onClick={handleRemove}
                disabled={isPending}
                className="px-3 py-1.5 text-xs font-mono text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Display mode
  return (
    <div className="mt-3 pt-3 border-t border-gray-200/60">
      <div className="flex items-center gap-1.5 text-gray-400 mb-2">
        <Link2 className="w-3.5 h-3.5" />
        <span className="text-xs font-mono">Padlet Link</span>
      </div>
      {currentUrl ? (
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href={currentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-mono text-[#8B1E3F] hover:underline"
          >
            <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{displayUrl}</span>
          </a>
          <button
            onClick={handleEdit}
            className="p-1.5 bg-[#f0f3fa] rounded-lg shadow-[3px_3px_6px_#d1d9e6,-3px_-3px_6px_#ffffff] hover:shadow-[2px_2px_4px_#d1d9e6,-2px_-2px_4px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] transition-all duration-200"
            title="Edit Padlet link"
          >
            <Pencil className="w-3 h-3 text-gray-400" />
          </button>
        </div>
      ) : (
        <button
          onClick={handleEdit}
          className="inline-flex items-center gap-1.5 text-sm font-mono text-gray-400 hover:text-[#8B1E3F] transition-colors"
        >
          <Link2 className="w-3.5 h-3.5" />
          Add Padlet link
        </button>
      )}
    </div>
  )
}
