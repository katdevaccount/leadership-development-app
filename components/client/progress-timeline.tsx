'use client'

import { useState, useTransition } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Plus, Loader2 } from 'lucide-react'
import { saveProgress } from '@/lib/actions/onboarding'
import type { ProgressEntry } from '@/lib/supabase/types'

interface ProgressTimelineProps {
  entries: ProgressEntry[]
  userId: string
}

export function ProgressTimeline({ entries, userId }: ProgressTimelineProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [reflectionText, setReflectionText] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const maxChars = 2000
  const charCount = reflectionText.length
  const isOverLimit = charCount > maxChars

  const handleAddReflection = () => {
    if (!reflectionText.trim() || isOverLimit) return

    setError(null)
    startTransition(async () => {
      const result = await saveProgress({
        userId,
        text: reflectionText.trim(),
      })

      if (!result.success) {
        setError(result.error)
        return
      }

      // Success - reset form
      setReflectionText('')
      setIsAdding(false)
    })
  }

  return (
    <div className="space-y-4">
      {/* Add reflection section */}
      <div>
        {!isAdding ? (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-mono text-gray-500 hover:text-[#8B1E3F] bg-[#f0f3fa] rounded-xl shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#d1d9e6,-2px_-2px_4px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            Add reflection
          </button>
        ) : (
          <div className="space-y-2">
            <textarea
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
              placeholder="What progress have you made? What did you learn?"
              disabled={isPending}
              autoFocus
              rows={3}
              className={`w-full px-4 py-3 bg-[#f0f3fa] rounded-xl text-sm text-gray-700 placeholder-gray-400 font-mono outline-none resize-none shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] focus:ring-2 focus:ring-[#8B1E3F80] transition-all duration-200 ${
                isPending ? 'opacity-50' : ''
              }`}
            />
            <div className="flex items-center justify-between">
              <span className={`text-xs font-mono ${isOverLimit ? 'text-red-500' : 'text-gray-400'}`}>
                {charCount}/{maxChars}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsAdding(false)
                    setReflectionText('')
                    setError(null)
                  }}
                  disabled={isPending}
                  className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 font-mono transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddReflection}
                  disabled={isPending || !reflectionText.trim() || isOverLimit}
                  className={`px-4 py-1.5 bg-[#f0f3fa] rounded-lg text-xs font-mono shadow-[3px_3px_6px_#d1d9e6,-3px_-3px_6px_#ffffff] hover:shadow-[2px_2px_4px_#d1d9e6,-2px_-2px_4px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] transition-all duration-200 ${
                    isPending || !reflectionText.trim() || isOverLimit
                      ? 'opacity-50 cursor-not-allowed text-gray-400'
                      : 'text-[#8B1E3F]'
                  }`}
                >
                  {isPending ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    'Save'
                  )}
                </button>
              </div>
            </div>
            {error && (
              <p className="text-xs text-red-500 font-mono">{error}</p>
            )}
          </div>
        )}
      </div>

      {/* Empty state */}
      {entries.length === 0 && !isAdding && (
        <p className="text-sm text-gray-400 text-center py-4 font-mono italic">
          No progress entries yet. Start documenting your journey!
        </p>
      )}

      {/* Timeline entries */}
      {entries.length > 0 && (
        <div className="space-y-4">
          {entries.map((entry, index) => (
            <div key={entry.id} className="relative pl-8">
              {/* Timeline line */}
              {index !== entries.length - 1 && (
                <div className="absolute left-[11px] top-7 bottom-0 w-0.5 bg-gradient-to-b from-[#8B1E3F] to-[#d1d9e6]" />
              )}
              {/* Timeline dot */}
              <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-[#f0f3fa] flex items-center justify-center shadow-[3px_3px_6px_#d1d9e6,-3px_-3px_6px_#ffffff]">
                <div className="w-3 h-3 rounded-full bg-[#8B1E3F]" />
              </div>
              {/* Content */}
              <div className="space-y-1">
                <p className="text-sm text-gray-700 font-mono">{entry.text}</p>
                <p className="text-xs text-gray-400 font-mono">
                  {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
