"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const links = [
  { href: "/dashboard", label: "Home" },
  { href: "/checkin", label: "Check-In" },
  { href: "/history", label: "History" },
  { href: "/trends", label: "Trends" },
  { href: "/settings", label: "Settings" },
]

export function NavLinks() {
  const pathname = usePathname()
  return (
    <>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "px-4 py-2 text-sm rounded-full transition-colors tracking-[0.08em] uppercase text-[11px]",
            pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href))
              ? "bg-primary text-primary-foreground font-semibold shadow-[0_10px_22px_rgba(17,79,75,0.18)]"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/70"
          )}
        >
          {link.label}
        </Link>
      ))}
    </>
  )
}
