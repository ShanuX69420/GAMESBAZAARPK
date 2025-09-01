import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'fps' },
      update: {},
      create: {
        name: 'FPS',
        slug: 'fps',
        description: 'First Person Shooter games'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'moba' },
      update: {},
      create: {
        name: 'MOBA',
        slug: 'moba',
        description: 'Multiplayer Online Battle Arena games'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'battle-royale' },
      update: {},
      create: {
        name: 'Battle Royale',
        slug: 'battle-royale',
        description: 'Battle Royale games'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'sports' },
      update: {},
      create: {
        name: 'Sports',
        slug: 'sports',
        description: 'Sports games'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'rpg' },
      update: {},
      create: {
        name: 'RPG',
        slug: 'rpg',
        description: 'Role Playing Games'
      }
    }),
    prisma.category.upsert({
      where: { slug: 'sandbox' },
      update: {},
      create: {
        name: 'Sandbox',
        slug: 'sandbox',
        description: 'Sandbox and Creative games'
      }
    })
  ])

  // Create games
  const games = await Promise.all([
    prisma.game.upsert({
      where: { slug: 'pubg-mobile' },
      update: {},
      create: {
        name: 'PUBG Mobile',
        slug: 'pubg-mobile',
        description: 'PlayerUnknown\'s Battlegrounds Mobile',
        categoryId: categories[2].id // Battle Royale
      }
    }),
    prisma.game.upsert({
      where: { slug: 'free-fire' },
      update: {},
      create: {
        name: 'Free Fire',
        slug: 'free-fire',
        description: 'Garena Free Fire',
        categoryId: categories[2].id // Battle Royale
      }
    }),
    prisma.game.upsert({
      where: { slug: 'call-of-duty-mobile' },
      update: {},
      create: {
        name: 'Call of Duty Mobile',
        slug: 'call-of-duty-mobile',
        description: 'Call of Duty Mobile',
        categoryId: categories[0].id // FPS
      }
    }),
    prisma.game.upsert({
      where: { slug: 'valorant' },
      update: {},
      create: {
        name: 'Valorant',
        slug: 'valorant',
        description: 'Valorant by Riot Games',
        categoryId: categories[0].id // FPS
      }
    }),
    prisma.game.upsert({
      where: { slug: 'fifa-24' },
      update: {},
      create: {
        name: 'FIFA 24',
        slug: 'fifa-24',
        description: 'EA Sports FC 24',
        categoryId: categories[3].id // Sports
      }
    }),
    prisma.game.upsert({
      where: { slug: 'gta-v' },
      update: {},
      create: {
        name: 'GTA V',
        slug: 'gta-v',
        description: 'Grand Theft Auto V',
        categoryId: categories[5].id // Sandbox
      }
    }),
    prisma.game.upsert({
      where: { slug: 'minecraft' },
      update: {},
      create: {
        name: 'Minecraft',
        slug: 'minecraft',
        description: 'Minecraft',
        categoryId: categories[5].id // Sandbox
      }
    }),
    prisma.game.upsert({
      where: { slug: 'fortnite' },
      update: {},
      create: {
        name: 'Fortnite',
        slug: 'fortnite',
        description: 'Fortnite Battle Royale',
        categoryId: categories[2].id // Battle Royale
      }
    }),
    prisma.game.upsert({
      where: { slug: 'apex-legends' },
      update: {},
      create: {
        name: 'Apex Legends',
        slug: 'apex-legends',
        description: 'Apex Legends',
        categoryId: categories[2].id // Battle Royale
      }
    }),
    prisma.game.upsert({
      where: { slug: 'league-of-legends' },
      update: {},
      create: {
        name: 'League of Legends',
        slug: 'league-of-legends',
        description: 'League of Legends',
        categoryId: categories[1].id // MOBA
      }
    })
  ])

  console.log('Seeded categories:', categories.length)
  console.log('Seeded games:', games.length)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })