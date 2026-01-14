import { ExternalLink } from 'lucide-react'

interface PadletLinkBannerProps {
  padletUrl: string
}

/**
 * Quiet info banner showing client's Padlet link.
 * Opens in new tab when clicked.
 */
export function PadletLinkBanner({ padletUrl }: PadletLinkBannerProps) {
  return (
    <a
      href={padletUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-[#f0f3fa] rounded-2xl p-4 shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#d1d9e6,-2px_-2px_4px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] transition-all duration-200 mb-6 group"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-[#f0f3fa] flex items-center justify-center shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff] flex-shrink-0">
            <ExternalLink className="h-5 w-5 text-[#8B1E3F]" />
          </div>
          <p className="text-sm text-gray-600 font-mono truncate">
            View your Padlet board
          </p>
        </div>
        <span className="text-sm font-mono text-[#8B1E3F] group-hover:underline flex-shrink-0">
          Open
        </span>
      </div>
    </a>
  )
}
