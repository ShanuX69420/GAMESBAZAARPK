import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/navbar'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
          
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Welcome back, {session.user?.name || session.user?.email}!</h2>
            <p className="text-gray-600">Username: {(session.user as any)?.username}</p>
            <p className="text-gray-600">Email: {session.user?.email}</p>
            <p className="text-gray-600">Role: {(session.user as any)?.role}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Active Listings</h3>
              <p className="text-3xl font-bold text-blue-600">0</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Total Sales</h3>
              <p className="text-3xl font-bold text-green-600">0</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Pending Orders</h3>
              <p className="text-3xl font-bold text-yellow-600">0</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Rating</h3>
              <p className="text-3xl font-bold text-purple-600">N/A</p>
            </div>
          </div>

          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
              <p className="text-gray-500">No orders yet</p>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Your Listings</h3>
              <p className="text-gray-500">No listings yet</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}