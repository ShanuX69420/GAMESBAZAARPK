import { Navbar } from '@/components/navbar'
import Link from 'next/link'

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                Pakistan's Gaming Marketplace
              </h1>
              <p className="text-xl md:text-2xl mb-8">
                Buy & Sell Game Accounts, Keys, Top-ups, Coins, Boosting & Coaching
              </p>
              <div className="flex gap-4 justify-center">
                <Link
                  href="/browse"
                  className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
                >
                  Browse Listings
                </Link>
                <Link
                  href="/register"
                  className="bg-transparent border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition"
                >
                  Start Selling
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">Popular Categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {['Game Accounts', 'Game Keys', 'Top-ups', 'Coins', 'Boosting', 'Coaching'].map((category) => (
                <div
                  key={category}
                  className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition cursor-pointer"
                >
                  <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4"></div>
                  <h3 className="font-semibold">{category}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">Popular Games</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {['PUBG Mobile', 'Free Fire', 'Call of Duty', 'FIFA', 'GTA V', 'Valorant', 'Fortnite', 'Minecraft', 'CS:GO', 'Apex Legends', 'League of Legends', 'Rocket League'].map((game) => (
                <div
                  key={game}
                  className="bg-gray-100 rounded-lg p-4 text-center hover:bg-gray-200 transition cursor-pointer"
                >
                  <div className="w-20 h-20 bg-gray-300 rounded-lg mx-auto mb-2"></div>
                  <p className="text-sm font-medium">{game}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose Games Bazaar?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-500 rounded-full mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold mb-2">Secure Transactions</h3>
                <p className="text-gray-600">Safe and secure payment methods with buyer protection</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-green-500 rounded-full mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold mb-2">Verified Sellers</h3>
                <p className="text-gray-600">All sellers are verified with ratings and reviews</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-purple-500 rounded-full mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
                <p className="text-gray-600">Round the clock customer support for all your needs</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}