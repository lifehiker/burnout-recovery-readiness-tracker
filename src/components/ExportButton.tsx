"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export function ExportButton() {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const res = await fetch("/api/export")
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      const today = new Date().toISOString().split("T")[0]
      a.download = "burnout-tracker-export-" + today + ".csv"
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert("Export failed. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button onClick={handleExport} disabled={isExporting} variant="outline">
      {isExporting ? "Exporting..." : "Export CSV"}
    </Button>
  )
}