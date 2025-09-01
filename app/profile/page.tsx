'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    city: '',
    displayName: '',
    bio: ''
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      fetch('/api/profile')
        .then(res => res.json())
        .then(data => {
          setProfile(data)
          setFormData({
            name: data.name || '',
            phoneNumber: data.phoneNumber || '',
            city: data.city || '',
            displayName: data.sellerProfile?.displayName || '',
            bio: data.sellerProfile?.bio || ''
          })
        })
        .catch(console.error)
    }
  }, [session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const updatedProfile = await response.json()
        setProfile(updatedProfile)
        setEditing(false)
        window.location.reload() // Refresh to update session
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || !profile) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            <div className="p-6">
              {editing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                      placeholder="+92 300 1234567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                      placeholder="Karachi, Lahore, Islamabad..."
                    />
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Seller Profile</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Display Name</label>
                        <input
                          type="text"
                          value={formData.displayName}
                          onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                          placeholder="Your shop/seller name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Bio</label>
                        <textarea
                          value={formData.bio}
                          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                          rows={4}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                          placeholder="Tell buyers about yourself..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Email</h3>
                      <p className="mt-1 text-sm text-gray-900">{profile.email}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Username</h3>
                      <p className="mt-1 text-sm text-gray-900">@{profile.username}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                      <p className="mt-1 text-sm text-gray-900">{profile.name || 'Not set'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Phone Number</h3>
                      <p className="mt-1 text-sm text-gray-900">{profile.phoneNumber || 'Not set'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">City</h3>
                      <p className="mt-1 text-sm text-gray-900">{profile.city || 'Not set'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Member Since</h3>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(profile.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {profile.sellerProfile && (
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Seller Information</h3>
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Display Name</h4>
                          <p className="mt-1 text-sm text-gray-900">{profile.sellerProfile.displayName}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Bio</h4>
                          <p className="mt-1 text-sm text-gray-900">{profile.sellerProfile.bio || 'No bio provided'}</p>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Total Listings</h4>
                            <p className="mt-1 text-2xl font-bold text-blue-600">{profile._count.listings}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Total Orders</h4>
                            <p className="mt-1 text-2xl font-bold text-green-600">{profile._count.orders}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Reviews</h4>
                            <p className="mt-1 text-2xl font-bold text-purple-600">{profile._count.reviews}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}