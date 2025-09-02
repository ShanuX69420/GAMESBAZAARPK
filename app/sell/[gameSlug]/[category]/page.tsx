'use client'

import { useState, useEffect, use } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import Link from 'next/link'

interface SellerDashboardProps {
  params: Promise<{
    gameSlug: string
    category: string
  }>
}

interface Game {
  id: string
  name: string
  slug: string
}

interface Listing {
  id: string
  title: string
  description: string
  price: number
  type: string
  status: string
  createdAt: string
  accountLevel?: number
  coinAmount?: number
  coachingHours?: number
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

function getCategoryName(categorySlug: string): string {
  const mapping: { [key: string]: string } = {
    'accounts': 'Accounts',
    'keys': 'Keys',
    'top-ups': 'Top-ups',
    'boosting': 'Boosting',
    'coaching': 'Coaching',
    'items': 'Items'
  }
  return mapping[categorySlug] || 'Accounts'
}

export default function SellerGameCategoryDashboard({ params }: SellerDashboardProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [game, setGame] = useState<Game | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // Unwrap params Promise
  const resolvedParams = use(params)
  const categoryType = getCategoryType(resolvedParams.category)
  const categoryName = getCategoryName(resolvedParams.category)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated' && session?.user) {
      fetchGameAndListings()
    }
  }, [status, session, resolvedParams.gameSlug, resolvedParams.category, categoryType])

  const fetchGameAndListings = async () => {
    try {
      setLoading(true)
      
      if (!session?.user) {
        throw new Error('User session not found')
      }

      // Fetch game data
      const gameResponse = await fetch(`/api/games?slug=${resolvedParams.gameSlug}`)
      if (!gameResponse.ok) {
        throw new Error('Game not found')
      }
      const gameData = await gameResponse.json()
      setGame(gameData)

      // Fetch user's listings for this game and category
      const userId = (session.user as any).id
      
      if (!userId) {
        console.log('No user ID found, setting empty listings')
        setListings([])
        return
      }
      
      const listingsUrl = `/api/listings?gameId=${gameData.id}&type=${categoryType}&sellerId=${userId}`
      
      console.log('Fetching listings with:', {
        gameId: gameData.id,
        categoryType,
        userId,
        listingsUrl
      })
      
      const listingsResponse = await fetch(listingsUrl)
      console.log('Listings response status:', listingsResponse.status)
      
      if (!listingsResponse.ok) {
        const errorText = await listingsResponse.text()
        console.log('Error response:', errorText)
        
        // If it's a 404 or similar, just set empty listings instead of erroring
        if (listingsResponse.status === 404 || listingsResponse.status === 400) {
          console.log('Setting empty listings due to 404/400 error')
          setListings([])
          return
        }
        
        let errorData = {}
        try {
          errorData = JSON.parse(errorText)
        } catch (e) {
          console.log('Could not parse error as JSON')
        }
        throw new Error(errorData.error || `Failed to fetch listings (${listingsResponse.status}): ${errorText}`)
      }
      const listingsData = await listingsResponse.json()
      setListings(listingsData)
      
    } catch (err: any) {
      console.error('Error fetching data:', err)
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (listingId: string) => {
    // Navigate to edit page with the listing context
    router.push(`/sell?gameId=${game?.id}&category=${categoryType}&editId=${listingId}`)
  }

  const handleDelete = async (listingId: string) => {
    if (deleteConfirm !== listingId) {
      setDeleteConfirm(listingId)
      return
    }

    try {
      const response = await fetch(`/api/listings/${listingId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete listing')
      }

      // Remove the listing from the local state
      setListings(prev => prev.filter(listing => listing.id !== listingId))
      setDeleteConfirm(null)
    } catch (err: any) {
      setError(err.message || 'Failed to delete listing')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">Loading...</div>
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-red-600">{error}</div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span>→</span>
            <Link href="/dashboard" className="hover:text-blue-600">Dashboard</Link>
            <span>→</span>
            <span className="text-gray-900">{game?.name} {categoryName}</span>
          </nav>

          {/* Header */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-3xl">🎮</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    My {game?.name} {categoryName}
                  </h1>
                  <p className="text-gray-600">
                    Manage your {categoryName.toLowerCase()} listings for {game?.name}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full">
                      {listings.length} active listings
                    </span>
                  </div>
                </div>
              </div>
              <Link
                href={`/sell?gameId=${game?.id}&category=${categoryType}`}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2"
              >
                <span>➕</span>
                Create New Listing
              </Link>
            </div>
          </div>

          {/* Listings */}
          {listings.length > 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Listings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <div key={listing.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-4">
                      <span className={`px-3 py-1 text-xs rounded-full ${
                        listing.status === 'ACTIVE' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {listing.status}
                      </span>
                      <span className="text-xl font-bold text-gray-900">
                        PKR {listing.price}
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
                    
                    {listing.coinAmount && (
                      <div className="mb-4">
                        <span className="text-xs font-medium text-gray-500 uppercase">Coins</span>
                        <p className="text-sm text-gray-900">{listing.coinAmount.toLocaleString()}</p>
                      </div>
                    )}

                    {listing.coachingHours && (
                      <div className="mb-4">
                        <span className="text-xs font-medium text-gray-500 uppercase">Hours</span>
                        <p className="text-sm text-gray-900">{listing.coachingHours}</p>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <span className="text-xs text-gray-500">
                        Created {new Date(listing.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEdit(listing.id)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(listing.id)}
                          className={`text-sm font-medium ${
                            deleteConfirm === listing.id
                              ? 'text-red-700 bg-red-100 px-2 py-1 rounded'
                              : 'text-red-600 hover:text-red-700'
                          }`}
                        >
                          {deleteConfirm === listing.id ? 'Confirm?' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No {categoryName.toLowerCase()} listings yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first {categoryName.toLowerCase()} listing for {game?.name}
              </p>
              <Link
                href={`/sell?gameId=${game?.id}&category=${categoryType}`}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center gap-2"
              >
                <span>➕</span>
                Create Your First Listing
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}