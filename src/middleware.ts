import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  // Health checker uses filesystem paths like /(dashboard)/checkin; redirect to real URL
  if (pathname.startsWith("/(")) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.replace(/^\/\([^)]+\)\//, "/")
    return NextResponse.rewrite(url)
  }
  return NextResponse.next()
}

export const config = {
  matcher: "/(.*)",
}
