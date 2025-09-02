import { Navbar } from '@/components/navbar'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface GameCategoryPageProps {
  params: {
    slug: string
    category: string
  }
}

async function getGameCategoryListings(gameSlug: string, categorySlug: string) {
  const game = await prisma.game.findUnique({
    where: { slug: gameSlug },
    include: {
      categories: {
        include: {
          category: true
        }
      }
    }
  })
  
  if (!game) return null

  const category = await prisma.category.findUnique({
    where: { slug: categorySlug }
  })
  
  if (!category) return null

  // Check if this game actually has this category
  const hasCategory = game.categories.some(gc => gc.category.slug === categorySlug)
  if (!hasCategory) return null

  const listings = await prisma.listing.findMany({
    where: {
      gameId: game.id,
      type: getCategoryType(categorySlug),
      status: 'ACTIVE'
    },
    include: {
      seller: {
        include: {
          sellerProfile: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return { game, category, listings }
}

async function getAllCategories() {
  return await prisma.category.findMany({
    orderBy: { name: 'asc' }
  })
}

function getCategoryType(categorySlug: string): string {
  const mapping: { [key: string]: string } = {
    'accounts': 'ACCOUNT',
    'keys': 'GAME_KEY',
    'top-ups': 'TOP_UP',
    'boosting': 'BOOSTING',
    'coaching': 'COACHING',
    'items': 'COINS'
  }
  return mapping[categorySlug] || 'ACCOUNT'
}

export default async function GameCategoryPage({ params }: GameCategoryPageProps) {
  const { slug, category: categorySlug } = await params
  const data = await getGameCategoryListings(slug, categorySlug)
  const allCategories = await getAllCategories()
  
  if (!data) {
    notFound()
  }

  const { game, category, listings } = data

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span>→</span>
            <Link href={`/games/${game.slug}`} className="hover:text-blue-600">{game.name}</Link>
            <span>→</span>
            <span className="text-gray-900">{category.name}</span>
          </nav>

          {/* Header */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-3xl">🎮</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {game.name} - {category.name}
                </h1>
                <p className="text-gray-600">{category.description} for {game.name}</p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full">
                    {category.icon} {category.name}
                  </span>
                  <span className="text-gray-500">•</span>
                  <span className="text-sm text-gray-600">
                    {listings.length} listings available
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Category Navigation - Only show categories for this game */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Other Categories</h2>
              <Link
                href={`/sell/${game.slug}/${category.slug}`}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
              >
                <span>📱</span>
                Sell {category.name}
              </Link>
            </div>
            <div className="flex flex-wrap gap-3">
              {game.categories.map((gameCategory) => (
                <Link
                  key={gameCategory.category.id}
                  href={`/games/${game.slug}/${gameCategory.category.slug}`}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    gameCategory.category.slug === category.slug
                      ? 'bg-blue-100 text-blue-700 border-2 border-blue-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                  }`}
                >
                  {gameCategory.category.icon} {gameCategory.category.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Listings */}
          {listings.length > 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {category.name} Listings
                </h2>
                <div className="flex items-center gap-4">
                  <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    <option>Sort by: Latest</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <div key={listing.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                        {listing.type.replace('_', ' ')}
                      </span>
                      <span className="text-xl font-bold text-gray-900">
                        ${listing.price}
                      </span>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 mb-2">{listing.title}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">{listing.description}</p>
                    
                    {/* Listing specific details */}
                    {listing.accountLevel && (
                      <div className="mb-4">
                        <span className="text-xs font-medium text-gray-500 uppercase">Level</span>
                        <p className="text-sm text-gray-900">{listing.accountLevel}</p>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {listing.seller.sellerProfile?.displayName || listing.seller.name}
                          </p>
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-400">⭐</span>
                            <span className="text-xs text-gray-600">
                              {listing.seller.sellerProfile?.rating.toFixed(1) || 'New'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
              <div className="text-4xl mb-4">{category.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No {category.name} listings yet
              </h3>
              <p className="text-gray-600 mb-6">
                Be the first to create a {category.name.toLowerCase()} listing for {game.name}
              </p>
              <Link
                href={`/sell?gameId=${game.id}&category=${getCategoryType(category.slug)}`}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
              >
                Create Listing
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  )
}