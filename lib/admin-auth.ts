import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"

interface AuthUser {
  id: string
  email: string
  name?: string
  username: string
  role: string
  image?: string
}

export async function authenticate(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user as AuthUser).role !== 'ADMIN') {
      return {
        success: false,
        redirectUrl: '/login?message=Admin access required'
      }
    }

    return {
      success: true,
      user: session.user
    }
  } catch (error) {
    console.error('Admin authentication error:', error)
    return {
      success: false,
      redirectUrl: '/login?message=Authentication error'
    }
  }
}

export function adminAuthMiddleware() {
  return async (req: NextRequest) => {
    const authResult = await authenticate(req)
    
    if (!authResult.success) {
      return NextResponse.redirect(new URL(authResult.redirectUrl, req.url))
    }
    
    return NextResponse.next()
  }
}