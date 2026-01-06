"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react"

interface ThemeEntry {
  name: string
  successDescription?: string
}

interface DummyUser {
  email: string
  loginTime: string
  leadershipPurpose?: string
  themes?: ThemeEntry[]
  // Backward compat
  themeName?: string
  successDescription?: string
}

export default function CompanyInfoPage() {
  const [user, setUser] = useState<DummyUser | null>(null)
  const [descriptions, setDescriptions] = useState<string[]>([])
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if user is "logged in"
    const dummyUser = localStorage.getItem("dummyUser")
    if (!dummyUser) {
      router.push("/")
      return
    }

    const userData = JSON.parse(dummyUser) as DummyUser
    setUser(userData)

    // Initialize descriptions array based on themes
    if (userData.themes && userData.themes.length > 0) {
      setDescriptions(userData.themes.map(t => t.successDescription || ''))
    } else if (userData.successDescription) {
      setDescriptions([userData.successDescription])
    } else {
      setDescriptions([''])
    }
  }, [router])

  const updateDescription = (index: number, value: string) => {
    const updated = [...descriptions]
    updated[index] = value
    setDescriptions(updated)
  }

  const handleContinue = () => {
    // At least first description is required
    if (!descriptions[0]?.trim() || !user) return

    // Update themes with descriptions
    const updatedThemes = user.themes?.map((theme, i) => ({
      ...theme,
      successDescription: descriptions[i]?.trim() || ''
    })) || []

    const updatedUser = {
      ...user,
      themes: updatedThemes,
      // Backward compat
      successDescription: descriptions[0]?.trim(),
    }
    localStorage.setItem("dummyUser", JSON.stringify(updatedUser))

    // Navigate to welcome page
    router.push("/welcome")
  }

  const handleGoBack = () => {
    router.push("/job-role")
  }

  const hasValidDescription = descriptions[0]?.trim()
  const themeNames = user?.themes?.map(t => t.name) || [user?.themeName || 'your theme']

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl mx-auto bg-[#f0f3fa] rounded-3xl p-8 shadow-[20px_20px_40px_#d1d9e6,-20px_-20px_40px_#ffffff]"
      >
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-[#f0f3fa] flex items-center justify-center mb-4 shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff]">
            <Sparkles className="w-6 h-6 text-[#8B1E3F]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-700 mb-2 font-mono">
            {themeNames.length === 1 ? "What will be different?" : "Envision success for each theme"}
          </h1>
          <p className="text-gray-500 font-mono">
            {themeNames.length === 1
              ? "Describe your envisioned future. Start with 'I' and describe what you do, feel, and experience."
              : "Describe what progress looks like for each theme. Start with 'I'..."
            }
          </p>
        </div>

        {/* Description textareas for each theme */}
        <div className="space-y-6 mb-8">
          {themeNames.map((themeName, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1, duration: 0.4 }}
            >
              {/* Theme label */}
              <div className="mb-3 px-4 py-2 bg-[#f0f3fa] rounded-xl shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff] inline-block">
                <p className="text-sm text-gray-500 font-mono">
                  Theme {index + 1}: <span className="text-[#8B1E3F] font-semibold">{themeName}</span>
                </p>
              </div>

              <textarea
                value={descriptions[index] || ''}
                onChange={(e) => updateDescription(index, e.target.value)}
                onFocus={() => setFocusedIndex(index)}
                onBlur={() => setFocusedIndex(null)}
                placeholder={`Start with "I" — e.g., "I feel calm and confident. I ask questions before giving advice. Others notice I'm more present."`}
                rows={4}
                className={`w-full px-6 py-4 bg-[#f0f3fa] rounded-2xl text-gray-700 placeholder-gray-500 outline-none transition-all duration-200 font-mono resize-none ${
                  focusedIndex === index
                    ? "shadow-[inset_6px_6px_12px_#d1d9e6,inset_-6px_-6px_12px_#ffffff] ring-2 ring-[#8B1E3F80]"
                    : "shadow-[inset_8px_8px_16px_#d1d9e6,inset_-8px_-8px_16px_#ffffff]"
                }`}
              />
            </motion.div>
          ))}
        </div>

        <p className="text-xs text-gray-400 mb-6 font-mono text-center">
          This isn't a goal to complete — it's a vision of who you're becoming.
        </p>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            onClick={handleGoBack}
            className="px-6 py-3 bg-[#f0f3fa] rounded-2xl font-semibold shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff] hover:shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] transition-all duration-200 flex items-center gap-2 font-mono text-gray-600"
          >
            <ArrowLeft className="w-4 h-4" />
            Go back
          </motion.button>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
            onClick={handleContinue}
            disabled={!hasValidDescription}
            className={`px-6 py-3 bg-[#f0f3fa] rounded-2xl font-semibold shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff] hover:shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] transition-all duration-200 flex items-center gap-2 font-mono ${
              hasValidDescription ? "text-[#8B1E3F]" : "text-gray-400 opacity-50 cursor-not-allowed"
            }`}
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
