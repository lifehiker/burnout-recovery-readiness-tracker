import Link from "next/link"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  title: string
  description: string
  action?: { label: string; href: string }
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="paper-panel flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="eyebrow mb-5">Fresh Start</div>
      <div className="mb-5 h-20 w-20 rounded-full border border-border/70 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.9),rgba(219,205,188,0.45)_55%,rgba(188,161,124,0.18))] shadow-[0_20px_30px_rgba(94,75,52,0.12)]" />
      <h3 className="text-3xl editorial-title mb-3">{title}</h3>
      <p className="text-muted-foreground max-w-sm mb-6 leading-relaxed">{description}</p>
      {action && (
        <Button asChild>
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )}
    </div>
  )
}
