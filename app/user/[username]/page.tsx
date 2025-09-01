'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'

export default function UserProfilePage() {
  const params = useParams()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.username) {
      fetch(`/api/users/${params.username}`)
        .then(res => res.json())
        .then(data => {
          setUser(data)
          setLoading(false)
        })
        .catch(error => {
          console.error('Failed to fetch user:', error)
          setLoading(false)
        })
    }
  }, [params.username])

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <span key={i} className="text-yellow-400">★</span>
        )
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <span key={i} className="text-yellow-400">☆</span>
        )
      } else {
        stars.push(
          <span key={i} className="text-gray-300">★</span>
        )
      }
    }
    return stars
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </>
    )
  }

  if (!user || user.error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">User not found</h1>
            <Link href="/" className="text-blue-600 hover:underline">
              Go back to homepage
            </Link>
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
          <div className="bg-white shadow rounded-lg mb-8">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {user.sellerProfile?.displayName || user.name || user.username}
                  </h1>
                  <p className="text-gray-500">@{user.username}</p>
                  {user.city && (
                    <p className="text-sm text-gray-600 mt-1">
                      📍 {user.city}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end mb-2">
                    {renderStars(user.averageRating)}
                    <span className="ml-2 text-sm text-gray-600">
                      ({user.averageRating.toFixed(1)})
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {user._count.reviews} reviews
                  </p>
                </div>
              </div>

              {user.sellerProfile?.bio && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700">{user.sellerProfile.bio}</p>
                </div>
              )}

              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-3xl font-bold text-blue-600">{user._count.listings}</p>
                  <p className="text-sm text-gray-600">Active Listings</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-3xl font-bold text-green-600">{user.sellerProfile?.totalSales || 0}</p>
                  <p className="text-sm text-gray-600">Total Sales</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-3xl font-bold text-purple-600">
                    {user.sellerProfile?.verified ? '✓' : '✗'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {user.sellerProfile?.verified ? 'Verified' : 'Not Verified'}
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-500 mt-4">
                Member since {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Active Listings</h2>
              {user.listings.length === 0 ? (
                <p className="text-gray-500">No active listings</p>
              ) : (
                <div className="space-y-4">
                  {user.listings.map((listing: any) => (
                    <div key={listing.id} className="bg-white shadow rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{listing.title}</h3>
                          <p className="text-sm text-gray-600">{listing.game.name}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {listing._count.orders} sold
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">
                            PKR {listing.price}
                          </p>
                          <Link
                            href={`/listing/${listing.id}`}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            View →
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Reviews</h2>
              {user.reviews.length === 0 ? (
                <p className="text-gray-500">No reviews yet</p>
              ) : (
                <div className="space-y-4">
                  {user.reviews.map((review: any) => (
                    <div key={review.id} className="bg-white shadow rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold">
                            {review.author.name || review.author.username}
                          </p>
                          <div className="flex items-center">
                            {renderStars(review.rating)}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {review.comment && (
                        <p className="text-gray-700">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}