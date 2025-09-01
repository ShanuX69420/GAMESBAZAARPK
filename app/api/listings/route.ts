import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const gameId = searchParams.get('gameId')
    const type = searchParams.get('type')
    const sellerId = searchParams.get('sellerId')

    const where: any = {
      status: 'ACTIVE'
    }

    if (gameId) where.gameId = gameId
    if (type) where.type = type
    if (sellerId) where.sellerId = sellerId

    const listings = await prisma.listing.findMany({
      where,
      include: {
        game: {
          include: {
            category: true
          }
        },
        seller: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(listings)
  } catch (error) {
    console.error("Failed to fetch listings:", error)
    return NextResponse.json(
      { error: "Failed to fetch listings" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      title,
      description,
      price,
      type,
      gameId,
      images = [],
      accountLevel,
      accountDetails,
      keyDetails,
      coinAmount,
      boostingFrom,
      boostingTo,
      coachingHours
    } = body

    if (!title || !description || !price || !type || !gameId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        type,
        gameId,
        sellerId: (session.user as any).id,
        images,
        accountLevel: accountLevel ? parseInt(accountLevel) : null,
        accountDetails,
        keyDetails,
        coinAmount: coinAmount ? parseInt(coinAmount) : null,
        boostingFrom,
        boostingTo,
        coachingHours: coachingHours ? parseInt(coachingHours) : null
      },
      include: {
        game: true,
        seller: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true
          }
        }
      }
    })

    return NextResponse.json(listing)
  } catch (error) {
    console.error("Failed to create listing:", error)
    return NextResponse.json(
      { error: "Failed to create listing" },
      { status: 500 }
    )
  }
}