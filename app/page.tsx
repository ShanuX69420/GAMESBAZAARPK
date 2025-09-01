import { Navbar } from '@/components/navbar'
import { GameCard } from '@/components/game-card'
import { prisma } from '@/lib/prisma'

async function getGamesWithCategories() {
  const games = await prisma.game.findMany({
    include: {
      categories: {
        include: {
          category: true
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  })
  
  return games
}

export default async function Home() {
  const games = await getGamesWithCategories()

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Browse Games
            </h1>
            <p className="text-gray-600 text-lg">
              Find accounts, keys, top-ups, and services for your favorite games
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-6">
            {games.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </div>
      </main>
    </>
  )
}