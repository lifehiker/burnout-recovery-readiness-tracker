import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const { auth } = NextAuth(authConfig)

const DASHBOARD_GROUP_PREFIXES = ["/(dashboard)", "/%28dashboard%29"]

export default auth((request: NextRequest) => {
  const { pathname } = request.nextUrl
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
})

export const config = {
  matcher: ["/:path*"],
}
