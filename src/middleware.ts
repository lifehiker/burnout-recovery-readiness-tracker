import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const DASHBOARD_GROUP_PREFIXES = ["/(dashboard)", "/%28dashboard%29"]
// Paths served directly by the pages router — skip the rewrite so they are reached
const PAGES_ROUTER_PASSTHROUGH = ["/(dashboard)/checkin", "/%28dashboard%29/checkin"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (PAGES_ROUTER_PASSTHROUGH.includes(pathname)) {
    return NextResponse.next()
  }

  const matchedPrefix = DASHBOARD_GROUP_PREFIXES.find(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  )

  if (matchedPrefix) {
    const normalizedPath = pathname.slice(matchedPrefix.length) || "/dashboard"
    const redirectPath =
      normalizedPath === "/dashboard"
        ? "/dashboard"
        : normalizedPath.startsWith("/dashboard/")
          ? normalizedPath.replace("/dashboard", "")
          : normalizedPath
    const url = request.nextUrl.clone()
    url.pathname = redirectPath
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: "/:path*",
}
