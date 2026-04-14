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
  const [isSaving, setIsSaving] = useState(false)

  const save = async (nextEnabled: boolean, nextTime: string) => {
    setIsSaving(true)
    setSavedMessage("")
    try {
      await fetch("/api/settings/reminder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reminderEnabled: nextEnabled, reminderTime: nextTime }),
      })
      setSavedMessage("Saved")
      setTimeout(() => setSavedMessage(""), 2000)
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
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-900">Daily reminder</p>
          <p className="text-xs text-muted-foreground">Get reminded to complete your check-in</p>
        </div>
        <Switch
          checked={reminderEnabled}
          onCheckedChange={handleToggle}
          disabled={isSaving}
        />
      </div>
      {reminderEnabled && (
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Reminder time</label>
          <input
            type="time"
            value={reminderTime}
            onChange={handleTimeChange}
            disabled={isSaving}
            className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          />
        </div>
      )}
      {savedMessage && (
        <p className="text-xs text-green-600 font-medium">{savedMessage}</p>
      )}
    </div>
  )
}
