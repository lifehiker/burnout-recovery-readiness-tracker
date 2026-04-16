import NextAuth from "next-auth"
import { NextResponse } from "next/server"
import { authConfig } from "./auth.config"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { pathname } = req.nextUrl

  if (pathname === "/(dashboard)" || pathname.startsWith("/(dashboard)/")) {
    const rewriteUrl = req.nextUrl.clone()
    const normalizedPath = pathname.replace(/^\/\(dashboard\)(?=\/|$)/, "") || "/dashboard"

    rewriteUrl.pathname = normalizedPath
    return NextResponse.rewrite(rewriteUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|auth|api\\/auth|.*\\..*).*)"],
}
