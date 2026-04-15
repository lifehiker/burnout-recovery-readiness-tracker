"use client"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export function UpgradedBanner() {
  const searchParams = useSearchParams()
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (searchParams.get("upgraded") === "true") {
      setShow(true)
      const timer = setTimeout(() => setShow(false), 8000)
      return () => clearTimeout(timer)
    }
  }, [searchParams])

  if (!show) return null

  return (
    <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-3">
      <span className="text-green-600 text-lg">🎉</span>
      <div>
        <p className="text-sm font-semibold text-green-800">Welcome to Premium!</p>
        <p className="text-xs text-green-700">Your subscription is active. All premium features are now unlocked.</p>
      </div>
      <button
        onClick={() => setShow(false)}
        className="ml-auto text-green-600 hover:text-green-800 text-lg leading-none"
        aria-label="Dismiss"
      >
        x
      </button>
    </div>
  )
}
