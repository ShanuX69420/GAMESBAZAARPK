import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
      include: {
        sellerProfile: true,
        _count: {
          select: {
            listings: true,
            orders: true,
            reviews: true
          }
        }
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("Failed to fetch profile:", error)
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, phoneNumber, city, bio, displayName } = body

    // Update user basic info
    const user = await prisma.user.update({
      where: { id: (session.user as any).id },
      data: {
        name,
        phoneNumber,
        city
      }
    })

    // Create or update seller profile if they want to sell
    if (displayName || bio) {
      await prisma.sellerProfile.upsert({
        where: { userId: (session.user as any).id },
        update: {
          displayName: displayName || name,
          bio
        },
        create: {
          userId: (session.user as any).id,
          displayName: displayName || name,
          bio
        }
      })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Failed to update profile:", error)
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    )
  }
}