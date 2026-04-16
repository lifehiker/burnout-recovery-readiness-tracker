"use client"
import { useState } from "react"
import { Switch } from "@/components/ui/switch"

interface ReminderSettingsProps {
  enabled: boolean
  time: string
}

export function ReminderSettings({ enabled, time }: ReminderSettingsProps) {
  const [reminderEnabled, setReminderEnabled] = useState(enabled)
  const [reminderTime, setReminderTime] = useState(time)
  const [savedMessage, setSavedMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const save = async (nextEnabled: boolean, nextTime: string) => {
    setIsSaving(true)
    setSavedMessage("")
    setErrorMessage("")
    try {
      const response = await fetch("/api/settings/reminder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reminderEnabled: nextEnabled, reminderTime: nextTime }),
      })
      if (!response.ok) {
        throw new Error("We couldn’t save your reminder settings.")
      }
      setSavedMessage("Saved")
      setTimeout(() => setSavedMessage(""), 2000)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "We couldn’t save your reminder settings.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggle = (checked: boolean) => {
    setReminderEnabled(checked)
    save(checked, reminderTime)
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value
    setReminderTime(newTime)
    save(reminderEnabled, newTime)
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[1.35rem] border border-border/70 bg-white/55 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">Daily reminder</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Save the time you want this habit to surface. This stores your preference on the account.
            </p>
          </div>
          <Switch
            checked={reminderEnabled}
            onCheckedChange={handleToggle}
            disabled={isSaving}
          />
        </div>
      </div>
      {reminderEnabled && (
        <div className="rounded-[1.35rem] border border-border/70 bg-white/55 p-4 space-y-2">
          <label className="text-sm font-medium text-slate-700">Reminder time</label>
          <input
            type="time"
            value={reminderTime}
            onChange={handleTimeChange}
            disabled={isSaving}
            className="w-full rounded-2xl border border-border/80 bg-background/80 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          />
        </div>
      )}
      <div className="min-h-4">
        {savedMessage && (
          <p className="text-xs font-medium text-[#205951]">{savedMessage}</p>
        )}
        {errorMessage && (
          <p className="text-xs font-medium text-[#8e3d34]">{errorMessage}</p>
        )}
      </div>
    </div>
  )
}
