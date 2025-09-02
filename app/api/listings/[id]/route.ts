import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const resolvedParams = await params
    const listingId = resolvedParams.id

    // Check if the listing exists and belongs to the current user
    const listing = await prisma.listing.findUnique({
      where: { id: listingId }
    })

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      )
    }

    if (listing.sellerId !== (session.user as any).id) {
      return NextResponse.json(
        { error: "You can only delete your own listings" },
        { status: 403 }
      )
    }

    // Delete the listing
    await prisma.listing.delete({
      where: { id: listingId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete listing:", error)
    return NextResponse.json(
      { error: "Failed to delete listing" },
      { status: 500 }
    )
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const listingId = resolvedParams.id

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        game: {
          include: {
            categories: {
              include: {
                category: true
              }
            }
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
      }
    })

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(listing)
  } catch (error) {
    console.error("Failed to fetch listing:", error)
    return NextResponse.json(
      { error: "Failed to fetch listing" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const resolvedParams = await params
    const listingId = resolvedParams.id
    const body = await request.json()

    // Check if the listing exists and belongs to the current user
    const existingListing = await prisma.listing.findUnique({
      where: { id: listingId }
    })

    if (!existingListing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      )
    }

    if (existingListing.sellerId !== (session.user as any).id) {
      return NextResponse.json(
        { error: "You can only edit your own listings" },
        { status: 403 }
      )
    }

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

    // Update the listing
    const updatedListing = await prisma.listing.update({
      where: { id: listingId },
      data: {
        title,
        description,
        price: parseFloat(price),
        type,
        gameId,
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
        game: {
          include: {
            categories: {
              include: {
                category: true
              }
            }
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
      }
    })

    return NextResponse.json(updatedListing)
  } catch (error) {
    console.error("Failed to update listing:", error)
    return NextResponse.json(
      { error: "Failed to update listing" },
      { status: 500 }
    )
  }
}