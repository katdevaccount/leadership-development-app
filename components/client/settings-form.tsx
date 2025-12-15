'use client'

import { useState, useTransition } from 'react'
import { motion } from 'framer-motion'
import { Loader2, Save, CheckCircle } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { updateProfile } from '@/lib/actions/profile'

interface SettingsFormProps {
  userId: string
  initialName: string
  initialPhone: string | null
  initialReceiveWeeklyNudge: boolean
}

export function SettingsForm({
  userId,
  initialName,
  initialPhone,
  initialReceiveWeeklyNudge,
}: SettingsFormProps) {
  const [name, setName] = useState(initialName)
  const [phone, setPhone] = useState(initialPhone || '')
  const [receiveWeeklyNudge, setReceiveWeeklyNudge] = useState(initialReceiveWeeklyNudge)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Track if any field has changed
  const hasChanges =
    name !== initialName ||
    phone !== (initialPhone || '') ||
    receiveWeeklyNudge !== initialReceiveWeeklyNudge

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    // Basic validation
    if (!name.trim()) {
      setError('Name is required')
      return
    }

    // Phone validation (if provided)
    if (phone && !/^\+[1-9]\d{1,14}$/.test(phone)) {
      setError('Phone must be in format +1234567890 (E.164)')
      return
    }

    startTransition(async () => {
      const result = await updateProfile({
        userId,
        name: name.trim(),
        phone: phone.trim(),
        receiveWeeklyNudge,
      })

      if (!result.success) {
        setError(result.error)
        return
      }

      setSuccess(true)
      // Clear success after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    })
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-[#f0f3fa] rounded-3xl p-8 shadow-[20px_20px_40px_#d1d9e6,-20px_-20px_40px_#ffffff]"
    >
      <h2 className="text-2xl font-bold text-gray-700 font-mono mb-6">
        Profile Settings
      </h2>

      {/* Name field */}
      <div className="mb-6">
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-600 font-mono mb-2"
        >
          Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isPending}
          className={`w-full px-4 py-3 bg-[#f0f3fa] rounded-2xl text-gray-700 placeholder-gray-400 outline-none transition-all duration-200 font-mono shadow-[inset_6px_6px_12px_#d1d9e6,inset_-6px_-6px_12px_#ffffff] focus:ring-2 focus:ring-[#8B1E3F80] ${
            isPending ? 'opacity-50' : ''
          }`}
          placeholder="Your name"
        />
      </div>

      {/* Phone field */}
      <div className="mb-6">
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-gray-600 font-mono mb-2"
        >
          Phone Number
        </label>
        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={isPending}
          className={`w-full px-4 py-3 bg-[#f0f3fa] rounded-2xl text-gray-700 placeholder-gray-400 outline-none transition-all duration-200 font-mono shadow-[inset_6px_6px_12px_#d1d9e6,inset_-6px_-6px_12px_#ffffff] focus:ring-2 focus:ring-[#8B1E3F80] ${
            isPending ? 'opacity-50' : ''
          }`}
          placeholder="+1234567890"
        />
        <p className="mt-2 text-xs text-gray-500 font-mono">
          Required to receive SMS nudges from your coach. Format: +1234567890
        </p>
      </div>

      {/* Weekly nudge toggle */}
      <div className="mb-8 flex items-center gap-3 px-4 py-4 bg-[#f0f3fa] rounded-2xl shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff]">
        <Switch
          id="weekly-nudge"
          checked={receiveWeeklyNudge}
          onCheckedChange={setReceiveWeeklyNudge}
          disabled={isPending}
          className="data-[state=checked]:bg-[#8B1E3F]"
        />
        <label
          htmlFor="weekly-nudge"
          className="text-sm font-mono text-gray-600 cursor-pointer flex-1"
          onClick={() => !isPending && setReceiveWeeklyNudge(!receiveWeeklyNudge)}
        >
          Receive weekly leadership nudges
        </label>
      </div>

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-mono"
        >
          {error}
        </motion.div>
      )}

      {/* Success message */}
      {success && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm font-mono flex items-center gap-2"
        >
          <CheckCircle className="w-4 h-4" />
          Settings saved successfully
        </motion.div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={isPending || !hasChanges}
        className={`w-full py-4 bg-[#f0f3fa] rounded-2xl text-lg font-mono shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff] hover:shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] transition-all duration-200 flex items-center justify-center gap-2 ${
          isPending || !hasChanges
            ? 'opacity-50 cursor-not-allowed text-gray-400'
            : 'text-[#8B1E3F]'
        }`}
      >
        {isPending ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="w-5 h-5" />
            Save Changes
          </>
        )}
      </button>
    </motion.form>
  )
}
