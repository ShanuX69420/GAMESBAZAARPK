'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'

export function Navbar() {
  const { data: session, status } = useSession()

  return (
    <nav className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold">
              Games Bazaar
            </Link>
            <div className="flex space-x-4">
              <Link href="/browse" className="hover:text-gray-300">
                Browse
              </Link>
              <Link href="/games" className="hover:text-gray-300">
                Games
              </Link>
              {session && (
                <Link href="/sell" className="hover:text-gray-300">
                  Sell
                </Link>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {status === 'loading' ? (
              <span className="text-gray-400">Loading...</span>
            ) : session ? (
              <>
                <Link href="/dashboard" className="hover:text-gray-300">
                  Dashboard
                </Link>
                <Link href="/profile" className="hover:text-gray-300">
                  {session.user?.name || session.user?.email}
                </Link>
                <button
                  onClick={() => signOut()}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-sm"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hover:text-gray-300"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-sm"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}