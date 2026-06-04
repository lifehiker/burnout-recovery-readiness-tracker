"use client"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export function UpgradedBanner() {
  const searchParams = useSearchParams()
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (searchParams?.get("upgraded") === "true") {
      setShow(true)
      const timer = setTimeout(() => setShow(false), 8000)
      return () => clearTimeout(timer)
    }
  }, [searchParams])

  if (!show) return null

  return (
    <div className="paper-panel border-[#7eb6aa] bg-[linear-gradient(135deg,rgba(220,239,232,0.95),rgba(250,246,239,0.98))] px-4 py-3 flex items-center gap-3">
      <span className="text-[#205951] text-lg">◆</span>
      <div>
        <p className="text-sm font-semibold text-[#205951]">Welcome to Premium</p>
        <p className="text-xs text-[#356d66]">Your subscription is active. All premium features are now unlocked.</p>
      </div>
      <button
        type="button"
        onClick={() => setShow(false)}
        className="ml-auto text-[#205951] hover:text-[#123b36] text-lg leading-none"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  )
}
