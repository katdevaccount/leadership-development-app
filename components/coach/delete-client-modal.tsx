'use client'

import { useState, useTransition } from 'react'
import { Trash2, Loader2, X, AlertTriangle } from 'lucide-react'
import { deleteClient } from '@/lib/actions/coach'

interface DeleteClientModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientId: string
  clientName: string
}

export function DeleteClientModal({
  open,
  onOpenChange,
  clientId,
  clientName,
}: DeleteClientModalProps) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    setError(null)

    startTransition(async () => {
      const result = await deleteClient(clientId)

      if (result.success) {
        onOpenChange(false)
        // Dashboard will revalidate and show updated list
      } else {
        setError(result.error || 'Failed to delete client')
      }
    })
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isPending) {
      setError(null)
    }
    if (!isPending) {
      onOpenChange(newOpen)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={() => handleOpenChange(false)}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-[#f0f3fa] rounded-3xl p-8 shadow-[20px_20px_40px_#d1d9e6,-20px_-20px_40px_#ffffff]">
        {/* Close button */}
        <button
          onClick={() => handleOpenChange(false)}
          disabled={isPending}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#f0f3fa] flex items-center justify-center shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#d1d9e6,-2px_-2px_4px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] transition-all duration-200 disabled:opacity-50"
        >
          <X className="h-4 w-4 text-gray-500" />
        </button>

        {/* Warning Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center shadow-[inset_6px_6px_12px_#d1d9e6,inset_-6px_-6px_12px_#ffffff]">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-700 font-mono mb-2">
            Delete {clientName}?
          </h2>
          <p className="text-sm text-gray-500 font-mono">
            This will permanently remove this client and all their data:
          </p>
          <ul className="text-sm text-gray-500 font-mono mt-2 space-y-1">
            <li>- Development themes</li>
            <li>- Ideas & experiments</li>
            <li>- Settings & preferences</li>
            <li>- Nudge history</li>
          </ul>
          <p className="text-sm text-red-500 font-mono mt-3 font-semibold">
            This action cannot be undone.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-mono">
            {error}
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-center gap-3">
          <button
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
            className="px-6 py-3 bg-[#f0f3fa] rounded-2xl text-sm font-mono text-gray-600 shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] hover:shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] transition-all duration-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className={`px-6 py-3 bg-red-500 rounded-2xl text-sm font-mono text-white shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] hover:bg-red-600 active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2)] transition-all duration-200 flex items-center gap-2 ${
              isPending ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete Client
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
