'use client'

import { useTransition } from 'react'
import { LogOut, Loader2, User } from 'lucide-react'
import { signOut } from '@/lib/actions/auth'

interface AppHeaderProps {
  userName?: string | null
  userRole?: 'client' | 'coach' | null
}

export function AppHeader({ userName, userRole }: AppHeaderProps) {
  const [isPending, startTransition] = useTransition()

  const handleSignOut = () => {
    startTransition(async () => {
      await signOut()
    })
  }

  return (
    <header className="bg-[#f0f3fa] shadow-[0_4px_12px_#d1d9e6]">
      <div className="container mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between max-w-6xl">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <h1 className="font-semibold text-base sm:text-lg text-gray-700 font-mono truncate">Leadership Development</h1>
          {userRole && (
            <span className="text-xs bg-[#f0f3fa] text-[#8B1E3F] px-2 sm:px-3 py-1 rounded-full capitalize font-mono shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] flex-shrink-0">
              {userRole}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          {userName && (
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600 font-mono">
              <div className="w-8 h-8 rounded-full bg-[#f0f3fa] flex items-center justify-center shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff]">
                <User className="h-4 w-4 text-gray-500" />
              </div>
              {userName}
            </div>
          )}
          <button
            onClick={handleSignOut}
            disabled={isPending}
            className="px-3 sm:px-4 py-2 bg-[#f0f3fa] rounded-xl text-sm font-mono text-gray-600 shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] hover:shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] transition-all duration-200 flex items-center gap-1.5 sm:gap-2 disabled:opacity-50 whitespace-nowrap"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <LogOut className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline">Sign Out</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
