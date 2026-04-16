import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  providers: [],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    authorized() {
      return true
    },
  },
} satisfies NextAuthConfig
