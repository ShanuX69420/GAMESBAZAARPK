import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: { username: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { username: params.username },
      include: {
        sellerProfile: true,
        listings: {
          where: { status: 'ACTIVE' },
          include: {
            game: true,
            _count: {
              select: { orders: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        reviews: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                name: true,
                image: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        _count: {
          select: {
            listings: true,
            orders: true,
            reviews: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Calculate average rating
    const avgRating = user.reviews.length > 0
      ? user.reviews.reduce((sum, review) => sum + review.rating, 0) / user.reviews.length
      : 0

    const userWithRating = {
      ...user,
      averageRating: avgRating
    }

    return NextResponse.json(userWithRating)
  } catch (error) {
    console.error("Failed to fetch user profile:", error)
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    )
  }
}