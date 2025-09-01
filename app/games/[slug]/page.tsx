import { Navbar } from '@/components/navbar'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface GamePageProps {
  params: {
    slug: string
  }
}

async function getGameWithListings(slug: string) {
  const game = await prisma.game.findUnique({
    where: { slug },
    include: {
      categories: {
        include: {
          category: true
        }
      },
      listings: {
        where: { status: 'ACTIVE' },
        include: {
          seller: {
            include: {
              sellerProfile: true
            }
          }
        },
        take: 20,
        orderBy: { createdAt: 'desc' }
      }
    }
  })
  
  return game
}

async function getAllCategories() {
  return await prisma.category.findMany({
    orderBy: { name: 'asc' }
  })
}

export default async function GamePage({ params }: GamePageProps) {
  const game = await getGameWithListings(params.slug)
  const allCategories = await getAllCategories()
  
  if (!game) {
    notFound()
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Game Header */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-4xl">🎮</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{game.name}</h1>
                <p className="text-gray-600">{game.description}</p>
                <div className="flex items-center gap-2 mt-3">
                  {game.categories.slice(0, 3).map((gameCategory) => (
                    <span key={gameCategory.category.slug} className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full">
                      {gameCategory.category.name}
                    </span>
                  ))}
                  {game.categories.length > 3 && (
                    <span className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-full">
                      +{game.categories.length - 3} more
                    </span>
                  )}
                  <span className="text-gray-500">•</span>
                  <span className="text-sm text-gray-600">
                    {game.listings.length} listings available
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Category Navigation */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Browse by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {allCategories.map((category) => (
                <Link
                  key={category.id}
                  href={`/games/${game.slug}/${category.slug}`}
                  className="bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-lg p-4 text-center transition cursor-pointer group"
                >
                  <div className="text-2xl mb-2">{category.icon}</div>
                  <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-700">
                    {category.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">{category.description}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Listings Preview */}
          {game.listings.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Recent Listings</h2>
                <Link 
                  href={`/games/${game.slug}/${game.categories[0]?.category.slug}`}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View all →
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {game.listings.slice(0, 6).map((listing) => (
                  <div key={listing.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-3">
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                        {listing.type.replace('_', ' ')}
                      </span>
                      <span className="text-lg font-semibold text-gray-900">
                        ${listing.price}
                      </span>
                    </div>
                    <h3 className="font-medium text-gray-900 mb-2">{listing.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{listing.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                        <span className="text-xs text-gray-600">
                          {listing.seller.sellerProfile?.displayName || listing.seller.name}
                        </span>
                      </div>
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {game.listings.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No listings yet</h3>
              <p className="text-gray-600 mb-6">Be the first to create a listing for {game.name}</p>
              <Link
                href="/sell"
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