import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create marketplace categories based on listing types
  console.log('Creating marketplace categories...')
  
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'accounts' },
      update: {},
      create: {
        name: 'Accounts',
        slug: 'accounts',
        description: 'Game accounts for sale',
        icon: '👤'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'keys' },
      update: {},
      create: {
        name: 'Keys',
        slug: 'keys',
        description: 'Game keys and digital copies',
        icon: '🔑'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'top-ups' },
      update: {},
      create: {
        name: 'Top-ups',
        slug: 'top-ups',
        description: 'In-game currency top-ups',
        icon: '💰'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'boosting' },
      update: {},
      create: {
        name: 'Boosting',
        slug: 'boosting',
        description: 'Rank boosting services',
        icon: '🚀'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'coaching' },
      update: {},
      create: {
        name: 'Coaching',
        slug: 'coaching',
        description: 'Gaming coaching sessions',
        icon: '🎓'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'items' },
      update: {},
      create: {
        name: 'Items',
        slug: 'items',
        description: 'In-game items and skins',
        icon: '🎨'
      }
    })
  ])

  // Get category references
  const [accountsCategory, keysCategory, topUpsCategory, boostingCategory, coachingCategory, itemsCategory] = categories

  // Create comprehensive game list with multiple categories
  console.log('Creating games...')
  
  const gamesList = [
    { 
      name: 'Among Us', 
      slug: 'among-us', 
      categories: ['accounts']
    },
    { 
      name: 'Apex Legends', 
      slug: 'apex-legends', 
      categories: ['accounts', 'keys', 'boosting']
    },
    { 
      name: 'Assassin\'s Creed', 
      slug: 'assassins-creed', 
      categories: ['keys', 'accounts']
    },
    { 
      name: 'Battlefield', 
      slug: 'battlefield', 
      categories: ['keys', 'accounts', 'boosting']
    },
    { 
      name: 'Brawl Stars', 
      slug: 'brawl-stars', 
      categories: ['accounts', 'top-ups', 'boosting']
    },
    { 
      name: 'Call of Duty', 
      slug: 'call-of-duty', 
      categories: ['accounts', 'keys', 'boosting', 'top-ups']
    },
    { 
      name: 'Clash of Clans', 
      slug: 'clash-of-clans', 
      categories: ['accounts', 'top-ups']
    },
    { 
      name: 'Clash Royale', 
      slug: 'clash-royale', 
      categories: ['accounts', 'top-ups']
    },
    { 
      name: 'Counter-Strike 2', 
      slug: 'counter-strike-2', 
      categories: ['accounts', 'keys', 'items', 'boosting']
    },
    { 
      name: 'Cyberpunk 2077', 
      slug: 'cyberpunk-2077', 
      categories: ['keys', 'accounts']
    },
    { 
      name: 'Destiny 2', 
      slug: 'destiny-2', 
      categories: ['keys', 'boosting', 'accounts']
    },
    { 
      name: 'Dota 2', 
      slug: 'dota-2', 
      categories: ['accounts', 'boosting', 'coaching', 'items']
    },
    { 
      name: 'Elden Ring', 
      slug: 'elden-ring', 
      categories: ['keys', 'accounts']
    },
    { 
      name: 'Fall Guys', 
      slug: 'fall-guys', 
      categories: ['accounts', 'keys']
    },
    { 
      name: 'FIFA 24', 
      slug: 'fifa-24', 
      categories: ['keys', 'accounts', 'top-ups', 'boosting']
    },
    { 
      name: 'Fortnite', 
      slug: 'fortnite', 
      categories: ['accounts', 'top-ups', 'boosting']
    },
    { 
      name: 'Free Fire', 
      slug: 'free-fire', 
      categories: ['accounts', 'top-ups', 'boosting']
    },
    { 
      name: 'Genshin Impact', 
      slug: 'genshin-impact', 
      categories: ['accounts', 'top-ups']
    },
    { 
      name: 'Grand Theft Auto V', 
      slug: 'grand-theft-auto-v', 
      categories: ['keys', 'accounts', 'top-ups']
    },
    { 
      name: 'Halo Infinite', 
      slug: 'halo-infinite', 
      categories: ['keys', 'accounts']
    },
    { 
      name: 'League of Legends', 
      slug: 'league-of-legends', 
      categories: ['accounts', 'top-ups', 'boosting', 'coaching']
    },
    { 
      name: 'Minecraft', 
      slug: 'minecraft', 
      categories: ['keys', 'accounts']
    },
    { 
      name: 'Mobile Legends', 
      slug: 'mobile-legends', 
      categories: ['accounts', 'top-ups', 'boosting']
    },
    { 
      name: 'Overwatch 2', 
      slug: 'overwatch-2', 
      categories: ['accounts', 'keys', 'boosting']
    },
    { 
      name: 'PUBG Mobile', 
      slug: 'pubg-mobile', 
      categories: ['accounts', 'top-ups', 'boosting']
    },
    { 
      name: 'Rainbow Six Siege', 
      slug: 'rainbow-six-siege', 
      categories: ['keys', 'accounts', 'top-ups']
    },
    { 
      name: 'Rocket League', 
      slug: 'rocket-league', 
      categories: ['keys', 'accounts', 'top-ups']
    },
    { 
      name: 'Roblox', 
      slug: 'roblox', 
      categories: ['accounts', 'top-ups']
    },
    { 
      name: 'Rust', 
      slug: 'rust', 
      categories: ['keys', 'accounts']
    },
    { 
      name: 'The Witcher 3', 
      slug: 'the-witcher-3', 
      categories: ['keys']
    },
    { 
      name: 'Valorant', 
      slug: 'valorant', 
      categories: ['accounts', 'top-ups', 'boosting', 'coaching']
    },
    { 
      name: 'Warframe', 
      slug: 'warframe', 
      categories: ['accounts', 'top-ups']
    },
    { 
      name: 'World of Warcraft', 
      slug: 'world-of-warcraft', 
      categories: ['accounts', 'top-ups', 'boosting']
    }
  ]

  const games = await Promise.all(
    gamesList.map(game =>
      prisma.game.upsert({
        where: { slug: game.slug },
        update: {},
        create: {
          name: game.name,
          slug: game.slug,
          description: `Buy and sell ${game.name} accounts, keys, and services`
        }
      })
    )
  )

  // Create game-category relationships
  console.log('Creating game-category relationships...')
  
  for (let i = 0; i < gamesList.length; i++) {
    const gameData = gamesList[i]
    const game = games[i]
    
    for (const categorySlug of gameData.categories) {
      const category = categories.find(c => c.slug === categorySlug)
      if (category) {
        await prisma.gameCategory.upsert({
          where: {
            gameId_categoryId: {
              gameId: game.id,
              categoryId: category.id
            }
          },
          update: {},
          create: {
            gameId: game.id,
            categoryId: category.id
          }
        })
      }
    }
  }

  console.log('✅ Database seeded successfully!')
  console.log(`📁 Created ${categories.length} categories`)
  console.log(`🎮 Created ${games.length} games`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })