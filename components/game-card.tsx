'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface GameCardProps {
  game: {
    id: string
    name: string
    slug: string
    categories: Array<{
      category: {
        name: string
        slug: string
      }
    }>
  }
}

export function GameCard({ game }: GameCardProps) {
  const router = useRouter()

  const handleCategoryClick = (categorySlug: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    router.push(`/games/${game.slug}/${categorySlug}`)
  }

  // Get the first category for the main game link
  const firstCategory = game.categories[0]?.category.slug

  return (
    <div className="group">
      <Link href={firstCategory ? `/games/${game.slug}/${firstCategory}` : `/games/${game.slug}`}>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center hover:shadow-md transition cursor-pointer group-hover:border-blue-300">
          <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-3 flex items-center justify-center group-hover:bg-blue-50">
            <span className="text-2xl">🎮</span>
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-2 group-hover:text-blue-700">
            {game.name}
          </h3>
          <div className="flex flex-wrap gap-1 justify-center">
            {game.categories.map((gameCategory) => (
              <span 
                key={gameCategory.category.slug}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition cursor-pointer"
                onClick={handleCategoryClick(gameCategory.category.slug)}
              >
                {gameCategory.category.name}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </div>
  )
}