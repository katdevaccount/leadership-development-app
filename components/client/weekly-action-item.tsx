'use client'

import { useState, useTransition } from 'react'
import { Check, Trash2 } from 'lucide-react'
import { toggleActionComplete, deleteWeeklyAction } from '@/lib/actions/weekly-actions'
import type { WeeklyAction } from '@/lib/supabase/types'

interface WeeklyActionItemProps {
  action: WeeklyAction
}

export function WeeklyActionItem({ action }: WeeklyActionItemProps) {
  const [isPending, startTransition] = useTransition()
  const [isDeleting, startDeleteTransition] = useTransition()
  const [optimisticCompleted, setOptimisticCompleted] = useState(action.is_completed)
  const [isDeleted, setIsDeleted] = useState(false)

  const handleToggle = () => {
    if (isDeleting) return

    const newValue = !optimisticCompleted
    setOptimisticCompleted(newValue)

    startTransition(async () => {
      const result = await toggleActionComplete({
        actionId: action.id,
        isCompleted: newValue,
      })

      if (!result.success) {
        // Revert on error
        setOptimisticCompleted(!newValue)
        console.error('Failed to toggle action:', result.error)
      }
    })
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent toggle from firing
    if (isPending) return

    // Optimistic delete
    setIsDeleted(true)

    startDeleteTransition(async () => {
      const result = await deleteWeeklyAction(action.id)

      if (!result.success) {
        // Revert on error
        setIsDeleted(false)
        console.error('Failed to delete action:', result.error)
      }
    })
  }

  // Don't render if optimistically deleted
  if (isDeleted) return null

  return (
    <div
      onClick={handleToggle}
      className={`group relative flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
        optimisticCompleted
          ? 'bg-[#f0f3fa] shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff]'
          : 'bg-[#f0f3fa] shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#d1d9e6,-2px_-2px_4px_#ffffff]'
      } ${isPending || isDeleting ? 'opacity-70' : ''}`}
    >
      {/* Checkbox */}
      <div
        className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
          optimisticCompleted
            ? 'bg-[#8B1E3F] shadow-[2px_2px_4px_#d1d9e6,-2px_-2px_4px_#ffffff]'
            : 'bg-[#f0f3fa] shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff]'
        }`}
      >
        {optimisticCompleted && <Check className="w-3 h-3 text-white" />}
      </div>

      {/* Label */}
      <span
        className={`flex-1 text-sm font-mono select-none pr-8 ${
          optimisticCompleted ? 'text-gray-400 line-through' : 'text-gray-700'
        }`}
      >
        {action.action_text}
      </span>

      {/* Delete button - visible on hover */}
      <button
        onClick={handleDelete}
        disabled={isPending || isDeleting}
        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200 disabled:opacity-50"
        title="Delete action"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}
