import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface User {
    username?: string
    role?: string
  }

  interface Session {
    user: {
      id: string
      username?: string
      role?: string
    } & DefaultSession["user"]
  }
}