'use client'

import { useState, useTransition } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { WeeklyActionItem } from './weekly-action-item'
import { addWeeklyAction } from '@/lib/actions/weekly-actions'
import type { WeeklyAction } from '@/lib/supabase/types'

interface WeeklyActionsListProps {
  actions: WeeklyAction[]
}

export function WeeklyActionsList({ actions }: WeeklyActionsListProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newActionText, setNewActionText] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const completedCount = actions.filter((a) => a.is_completed).length
  const totalCount = actions.length

  const handleAddAction = () => {
    if (!newActionText.trim()) return

    setError(null)
    startTransition(async () => {
      const result = await addWeeklyAction(newActionText.trim())

      if (!result.success) {
        setError(result.error)
        return
      }

      // Success - reset form
      setNewActionText('')
      setIsAdding(false)
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isPending) {
      handleAddAction()
    }
    if (e.key === 'Escape') {
      setIsAdding(false)
      setNewActionText('')
      setError(null)
    }
  }

  return (
    <div className="space-y-3">
      {/* Counter - only show if there are actions */}
      {totalCount > 0 && (
        <div className="flex items-center justify-between text-sm font-mono">
          <span className="text-gray-500">
            {completedCount} of {totalCount} completed
          </span>
          {completedCount === totalCount && totalCount > 0 && (
            <span className="px-3 py-1 rounded-full bg-[#8B1E3F] text-white text-xs shadow-[3px_3px_6px_#d1d9e6,-3px_-3px_6px_#ffffff]">
              All done!
            </span>
          )}
        </div>
      )}

      {/* Actions list */}
      {totalCount > 0 && (
        <div className="space-y-2">
          {actions.map((action) => (
            <WeeklyActionItem key={action.id} action={action} />
          ))}
        </div>
      )}

      {/* Empty state - only when no actions and not adding */}
      {totalCount === 0 && !isAdding && (
        <p className="text-sm text-gray-400 text-center py-4 font-mono italic">
          No weekly actions yet. Add some to track your progress!
        </p>
      )}

      {/* Add action section */}
      <div className="pt-2">
        {!isAdding ? (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-mono text-gray-500 hover:text-[#8B1E3F] bg-[#f0f3fa] rounded-xl shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#d1d9e6,-2px_-2px_4px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            Add action
          </button>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={newActionText}
                onChange={(e) => setNewActionText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="What will you commit to this week?"
                disabled={isPending}
                autoFocus
                className={`flex-1 px-4 py-2 bg-[#f0f3fa] rounded-xl text-sm text-gray-700 placeholder-gray-400 font-mono outline-none shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] focus:ring-2 focus:ring-[#8B1E3F80] transition-all duration-200 ${
                  isPending ? 'opacity-50' : ''
                }`}
              />
              <button
                onClick={handleAddAction}
                disabled={isPending || !newActionText.trim()}
                className={`px-4 py-2 bg-[#f0f3fa] rounded-xl text-sm font-mono shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#d1d9e6,-2px_-2px_4px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] transition-all duration-200 ${
                  isPending || !newActionText.trim()
                    ? 'opacity-50 cursor-not-allowed text-gray-400'
                    : 'text-[#8B1E3F]'
                }`}
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Save'
                )}
              </button>
            </div>
            {error && (
              <p className="text-xs text-red-500 font-mono">{error}</p>
            )}
            <button
              onClick={() => {
                setIsAdding(false)
                setNewActionText('')
                setError(null)
              }}
              disabled={isPending}
              className="text-xs text-gray-400 hover:text-gray-600 font-mono"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
