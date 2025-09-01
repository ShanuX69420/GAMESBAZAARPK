import { PrismaClient } from '@prisma/client';

// Create and export prisma instance for admin use
export const prisma = new PrismaClient();

// Simple resource configurations for the admin panel
export const adminResources = {
  user: {
    name: 'Users',
    model: 'user',
    icon: '👥',
    fields: {
      list: ['id', 'username', 'email', 'role', 'createdAt'],
      show: ['id', 'username', 'email', 'name', 'role', 'phoneNumber', 'city', 'createdAt', 'updatedAt'],
      edit: ['username', 'email', 'name', 'role', 'phoneNumber', 'city'],
      filter: ['username', 'email', 'role', 'createdAt'],
    },
  },
  sellerProfile: {
    name: 'Seller Profiles',
    model: 'sellerProfile',
    icon: '⭐',
    fields: {
      list: ['id', 'displayName', 'rating', 'totalSales', 'verified', 'createdAt'],
      show: ['id', 'displayName', 'bio', 'rating', 'totalSales', 'verified', 'createdAt', 'updatedAt'],
      edit: ['displayName', 'bio', 'verified'],
      filter: ['displayName', 'verified', 'rating'],
    },
  },
  game: {
    name: 'Games',
    model: 'game',
    icon: '🎮',
    fields: {
      list: ['id', 'name', 'slug', 'createdAt'],
      show: ['id', 'name', 'slug', 'description', 'image', 'createdAt', 'updatedAt'],
      edit: ['name', 'slug', 'description', 'image'],
      filter: ['name', 'slug'],
    },
  },
  category: {
    name: 'Categories',
    model: 'category',
    icon: '🏷️',
    fields: {
      list: ['id', 'name', 'slug', 'createdAt'],
      show: ['id', 'name', 'slug', 'description', 'icon', 'createdAt', 'updatedAt'],
      edit: ['name', 'slug', 'description', 'icon'],
      filter: ['name', 'slug'],
    },
  },
  listing: {
    name: 'Listings',
    model: 'listing',
    icon: '🛒',
    fields: {
      list: ['id', 'title', 'type', 'price', 'status', 'createdAt'],
      show: [
        'id', 'title', 'description', 'price', 'type', 'status',
        'gameId', 'sellerId', 'images', 'accountLevel', 'accountDetails',
        'keyDetails', 'coinAmount', 'boostingFrom', 'boostingTo',
        'coachingHours', 'createdAt', 'updatedAt'
      ],
      edit: [
        'title', 'description', 'price', 'type', 'status', 'gameId',
        'sellerId', 'images', 'accountLevel', 'accountDetails',
        'keyDetails', 'coinAmount', 'boostingFrom', 'boostingTo',
        'coachingHours'
      ],
      filter: ['title', 'type', 'status', 'sellerId', 'gameId', 'price'],
    },
  },
  order: {
    name: 'Orders',
    model: 'order',
    icon: '📦',
    fields: {
      list: ['id', 'orderNumber', 'status', 'price', 'createdAt'],
      show: [
        'id', 'orderNumber', 'listingId', 'buyerId', 'price', 'status',
        'paymentMethod', 'paymentId', 'deliveryInfo', 'notes',
        'createdAt', 'updatedAt', 'completedAt'
      ],
      edit: ['status', 'paymentMethod', 'deliveryInfo', 'notes'],
      filter: ['orderNumber', 'status', 'buyerId', 'price', 'createdAt'],
    },
  },
  review: {
    name: 'Reviews',
    model: 'review',
    icon: '💬',
    fields: {
      list: ['id', 'rating', 'sellerId', 'authorId', 'createdAt'],
      show: ['id', 'rating', 'comment', 'orderId', 'sellerId', 'authorId', 'createdAt', 'updatedAt'],
      edit: ['rating', 'comment'],
      filter: ['rating', 'sellerId', 'authorId', 'createdAt'],
    },
  },
};

// Admin configuration settings
export const adminSettings = {
  branding: {
    companyName: 'Pakistani Gaming Marketplace',
    softwareBrothers: false,
    logo: false,
  },
  rootPath: '/admin',
};