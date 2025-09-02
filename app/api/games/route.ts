import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    if (slug) {
      // Fetch single game by slug
      const game = await prisma.game.findUnique({
        where: { slug },
        include: {
          categories: {
            include: {
              category: true
            }
          },
          _count: {
            select: { listings: true }
          }
        }
      })

      if (!game) {
        return NextResponse.json(
          { error: "Game not found" },
          { status: 404 }
        )
      }

      return NextResponse.json(game)
    }

    // Fetch all games
    const games = await prisma.game.findMany({
      include: {
        categories: {
          include: {
            category: true
          }
        },
        _count: {
          select: { listings: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(games)
  } catch (error) {
    console.error("Failed to fetch games:", error)
    return NextResponse.json(
      { error: "Failed to fetch games" },
      { status: 500 }
    )
  }
}