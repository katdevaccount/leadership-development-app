import Link from 'next/link'
import { Phone, ArrowRight } from 'lucide-react'

export function PhoneMissingBanner() {
  return (
    <div className="bg-[#f0f3fa] rounded-2xl p-4 shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] mb-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#f0f3fa] flex items-center justify-center shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff]">
            <Phone className="h-5 w-5 text-[#8B1E3F]" />
          </div>
          <p className="text-sm text-gray-600 font-mono">
            Add your phone number to receive weekly nudges from your coach
          </p>
        </div>
        <Link
          href="/client/settings"
          className="inline-flex items-center gap-1 px-4 py-2 bg-[#f0f3fa] rounded-xl text-sm font-mono text-[#8B1E3F] shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#d1d9e6,-2px_-2px_4px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] transition-all duration-200 whitespace-nowrap"
        >
          Add Phone
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
