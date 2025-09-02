'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Navbar } from '@/components/navbar'

function getCategorySlug(categoryType: string): string {
  const mapping: { [key: string]: string } = {
    'ACCOUNT': 'accounts',
    'GAME_KEY': 'keys',
    'TOP_UP': 'top-ups',
    'BOOSTING': 'boosting',
    'COACHING': 'coaching',
    'COINS': 'items'
  }
  return mapping[categoryType] || 'accounts'
}

export default function SellPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [games, setGames] = useState([])
  const [selectedGame, setSelectedGame] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [existingListing, setExistingListing] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  
  // Get context from URL params
  const gameId = searchParams.get('gameId')
  const categoryType = searchParams.get('category')
  const editId = searchParams.get('editId')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    fetch('/api/games')
      .then(res => res.json())
      .then(data => {
        setGames(data)
        // If gameId is provided in URL, set the selected game
        if (gameId) {
          const game = data.find((g: any) => g.id === gameId)
          if (game) {
            setSelectedGame(game)
          }
        }
      })
      .catch(console.error)
  }, [gameId])

  // Set category type from URL params
  useEffect(() => {
    if (categoryType) {
      setSelectedCategory(categoryType)
    }
  }, [categoryType])

  // Fetch existing listing data when editing
  useEffect(() => {
    if (editId && status === 'authenticated') {
      setIsEditing(true)
      fetchExistingListing()
    } else {
      setIsEditing(false)
      setExistingListing(null)
    }
  }, [editId, status])

  const fetchExistingListing = async () => {
    try {
      const response = await fetch(`/api/listings/${editId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch listing')
      }
      const listing = await response.json()
      setExistingListing(listing)
      
      // Set the game and category from the listing
      setSelectedGame(listing.game)
      setSelectedCategory(listing.type)
    } catch (err: any) {
      setError(err.message || 'Failed to load listing for editing')
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData.entries())
    
    // Use selected game and category if available, otherwise use form values
    if (selectedGame) {
      data.gameId = selectedGame.id
    }
    if (selectedCategory) {
      data.type = selectedCategory
    }

    try {
      const url = isEditing ? `/api/listings/${editId}` : '/api/listings'
      const method = isEditing ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to ${isEditing ? 'update' : 'create'} listing`)
      }

      // Navigate back to the seller dashboard if editing, otherwise to dashboard
      if (isEditing && selectedGame) {
        const gameSlug = selectedGame.slug
        const categorySlug = getCategorySlug(selectedCategory)
        router.push(`/sell/${gameSlug}/${categorySlug}`)
      } else {
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') return <div>Loading...</div>

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            {isEditing 
              ? `Edit ${selectedCategory?.replace('_', ' ')} Listing`
              : selectedGame && selectedCategory 
                ? `Create ${selectedCategory.replace('_', ' ')} Listing for ${selectedGame.name}`
                : 'Create New Listing'
            }
          </h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                name="title"
                id="title"
                required
                defaultValue={existingListing?.title || ''}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                placeholder="e.g., PUBG Mobile Account Level 50"
              />
            </div>

            {/* Only show game selection if no game context is provided */}
            {!selectedGame ? (
              <div>
                <label htmlFor="gameId" className="block text-sm font-medium text-gray-700">
                  Game
                </label>
                <select
                  name="gameId"
                  id="gameId"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                >
                  <option value="">Select a game</option>
                  {games && games.map((game: any) => (
                    <option key={game.id} value={game.id}>
                      {game.name} ({game.categories.map((gc: any) => gc.category.name).join(', ')})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Game
                </label>
                <div className="mt-1 p-3 bg-gray-50 border border-gray-300 rounded-md">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🎮</span>
                    <div>
                      <p className="font-medium text-gray-900">{selectedGame.name}</p>
                      <p className="text-sm text-gray-600">Pre-selected from browsing context</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Only show listing type selection if no category context is provided */}
            {!selectedCategory ? (
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                  Listing Type
                </label>
                <select
                  name="type"
                  id="type"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                >
                  <option value="">Select type</option>
                  <option value="ACCOUNT">Game Account</option>
                  <option value="GAME_KEY">Game Key</option>
                  <option value="TOP_UP">Top-up</option>
                  <option value="COINS">Coins/Currency</option>
                  <option value="BOOSTING">Boosting Service</option>
                  <option value="COACHING">Coaching Service</option>
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Listing Type
                </label>
                <div className="mt-1 p-3 bg-gray-50 border border-gray-300 rounded-md">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📝</span>
                    <div>
                      <p className="font-medium text-gray-900">
                        {selectedCategory.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </p>
                      <p className="text-sm text-gray-600">Pre-selected from category context</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Price (PKR)
              </label>
              <input
                type="number"
                name="price"
                id="price"
                required
                min="0"
                step="0.01"
                defaultValue={existingListing?.price || ''}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                placeholder="1000"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                id="description"
                required
                rows={4}
                defaultValue={existingListing?.description || ''}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                placeholder="Describe your listing in detail..."
              />
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Details (Optional)</h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="accountLevel" className="block text-sm font-medium text-gray-700">
                    Account Level (for accounts)
                  </label>
                  <input
                    type="number"
                    name="accountLevel"
                    id="accountLevel"
                    defaultValue={existingListing?.accountLevel || ''}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  />
                </div>

                <div>
                  <label htmlFor="coinAmount" className="block text-sm font-medium text-gray-700">
                    Coin Amount (for coins)
                  </label>
                  <input
                    type="number"
                    name="coinAmount"
                    id="coinAmount"
                    defaultValue={existingListing?.coinAmount || ''}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  />
                </div>

                <div>
                  <label htmlFor="coachingHours" className="block text-sm font-medium text-gray-700">
                    Coaching Hours (for coaching)
                  </label>
                  <input
                    type="number"
                    name="coachingHours"
                    id="coachingHours"
                    defaultValue={existingListing?.coachingHours || ''}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading 
                  ? (isEditing ? 'Updating...' : 'Creating...') 
                  : (isEditing ? 'Update Listing' : 'Create Listing')
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}