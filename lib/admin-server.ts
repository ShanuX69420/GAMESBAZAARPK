import AdminJS from 'adminjs'
import AdminJSExpress from '@adminjs/express'
import { adminConfig } from './adminjs'
import express from 'express'

// Create Express app for AdminJS
const app = express()

// Setup AdminJS with authentication
const admin = adminConfig

export const adminRouter = AdminJSExpress.buildAuthenticatedRouter(admin, {
  authenticate: async (email: string, password: string) => {
    // This is a basic authentication - in production, you should use proper credentials
    // For now, we'll integrate with your existing auth system
    if (email === 'admin@admin.com' && password === 'admin123') {
      return { id: 'admin', email: 'admin@admin.com', role: 'ADMIN' }
    }
    return null
  },
  cookiePassword: process.env.ADMIN_COOKIE_SECRET || 'supersecret-admin-cookie-password-change-in-production',
})

export { admin }