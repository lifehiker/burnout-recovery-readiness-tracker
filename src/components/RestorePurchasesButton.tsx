"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export function RestorePurchasesButton() {
  const [isRestoring, setIsRestoring] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [tone, setTone] = useState<"success" | "error" | "neutral">("neutral")

  const handleRestore = async () => {
    setIsRestoring(true)
    setMessage(null)

    try {
      const res = await fetch("/api/settings/restore-subscription", {
        method: "POST",
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error ?? "Unable to restore purchases")
      }

      setTone(data.restored ? "success" : "neutral")
      setMessage(
        data.restored
          ? "Premium access restored. Refreshing your settings."
          : "No active Stripe subscription was found for this account."
      )

      if (data.restored) {
        window.location.reload()
      }
    } catch (error) {
      setTone("error")
      setMessage(error instanceof Error ? error.message : "Unable to restore purchases")
    } finally {
      setIsRestoring(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button onClick={handleRestore} disabled={isRestoring} variant="outline" size="sm">
        {isRestoring ? "Checking Stripe..." : "Restore Purchases"}
      </Button>
      {message && (
        <p
          className={
            tone === "success"
              ? "text-xs text-[#205951]"
              : tone === "error"
                ? "text-xs text-[#8e3d34]"
                : "text-xs text-muted-foreground"
          }
        >
          {message}
        </p>
      )}
    </div>
  )
}
