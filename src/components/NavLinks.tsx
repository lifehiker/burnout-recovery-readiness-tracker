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
            "px-3 py-2 text-sm rounded-md transition-colors",
            pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href))
              ? "bg-indigo-50 text-indigo-700 font-medium"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          )}
        >
          {link.label}
        </Link>
      ))}
    </>
  )
}
