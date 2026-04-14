import type { NextAuthConfig } from "next-auth"

// Edge Runtime-compatible auth config (no Prisma/Node.js-only dependencies).
// Used by middleware for lightweight session verification.
export const authConfig = {
  providers: [],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isAuthPage = nextUrl.pathname.startsWith("/auth")
      const isApiRoute = nextUrl.pathname.startsWith("/api")

      if (isAuthPage || isApiRoute) return true
      return isLoggedIn
    },
  },
} satisfies NextAuthConfig
