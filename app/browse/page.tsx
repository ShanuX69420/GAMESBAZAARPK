'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'

export default function BrowsePage() {
  const [listings, setListings] = useState([])
  const [games, setGames] = useState([])
  const [selectedGame, setSelectedGame] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/listings').then(res => res.json()),
      fetch('/api/games').then(res => res.json())
    ])
      .then(([listingsData, gamesData]) => {
        setListings(listingsData)
        setGames(gamesData)
        setLoading(false)
      })
      .catch(error => {
        console.error('Failed to fetch data:', error)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    const params = new URLSearchParams()
    if (selectedGame) params.append('gameId', selectedGame)
    if (selectedType) params.append('type', selectedType)

    fetch(`/api/listings?${params}`)
      .then(res => res.json())
      .then(setListings)
      .catch(console.error)
  }, [selectedGame, selectedType])

  const getTypeLabel = (type: string) => {
    const labels: any = {
      ACCOUNT: 'Account',
      GAME_KEY: 'Game Key',
      TOP_UP: 'Top-up',
      COINS: 'Coins',
      BOOSTING: 'Boosting',
      COACHING: 'Coaching'
    }
    return labels[type] || type
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Browse Listings</h1>

          <div className="flex flex-col md:flex-row gap-8">
            <aside className="md:w-64">
              <div className="bg-white rounded-lg shadow p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Filter by Game</h3>
                  <select
                    value={selectedGame}
                    onChange={(e) => setSelectedGame(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">All Games</option>
                    {games.map((game: any) => (
                      <option key={game.id} value={game.id}>
                        {game.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Filter by Type</h3>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">All Types</option>
                    <option value="ACCOUNT">Game Account</option>
                    <option value="GAME_KEY">Game Key</option>
                    <option value="TOP_UP">Top-up</option>
                    <option value="COINS">Coins</option>
                    <option value="BOOSTING">Boosting</option>
                    <option value="COACHING">Coaching</option>
                  </select>
                </div>

                <button
                  onClick={() => {
                    setSelectedGame('')
                    setSelectedType('')
                  }}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md"
                >
                  Clear Filters
                </button>
              </div>
            </aside>

            <main className="flex-1">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  <p className="mt-2 text-gray-600">Loading listings...</p>
                </div>
              ) : listings.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <p className="text-gray-500 text-lg">No listings found</p>
                  <Link
                    href="/sell"
                    className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
                  >
                    Create First Listing
                  </Link>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.map((listing: any) => (
                    <div key={listing.id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-2">
                          <span className="inline-block px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded">
                            {getTypeLabel(listing.type)}
                          </span>
                          <span className="text-2xl font-bold text-green-600">
                            PKR {listing.price}
                          </span>
                        </div>
                        
                        <h3 className="text-lg font-semibold mb-2">{listing.title}</h3>
                        
                        <div className="text-sm text-gray-600 mb-3">
                          <p>{listing.game.name}</p>
                          <p className="text-xs">{listing.game.category.name}</p>
                        </div>

                        <p className="text-gray-700 mb-4 line-clamp-2">
                          {listing.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <Link
                            href={`/user/${listing.seller.username}`}
                            className="text-sm text-gray-500 hover:text-blue-600 hover:underline"
                          >
                            by {listing.seller.username || listing.seller.name}
                          </Link>
                          <Link
                            href={`/listing/${listing.id}`}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </>
  )
}