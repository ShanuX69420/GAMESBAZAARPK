import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (existingAdmin) {
      console.log('✅ Admin user already exists:', existingAdmin.email)
      return
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 12)

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@pakistanigaming.com',
        username: 'admin',
        name: 'Admin User',
        password: hashedPassword,
        role: 'ADMIN',
        emailVerified: new Date(),
      }
    })

    console.log('✅ Admin user created successfully!')
    console.log('📧 Email: admin@pakistanigaming.com')
    console.log('🔑 Password: admin123')
    console.log('👤 Username:', adminUser.username)
    console.log('🆔 ID:', adminUser.id)

  } catch (error) {
    console.error('❌ Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()