import AdminJS from 'adminjs';
import { Database, Resource } from '@adminjs/prisma';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Register the Prisma adapter
AdminJS.registerAdapter({
  Database,
  Resource,
});

// AdminJS configuration
export const adminConfig = new AdminJS({
  resources: [
    {
      resource: {
        model: prisma.user,
        client: prisma,
      },
      options: {
        listProperties: ['id', 'username', 'email', 'role', 'createdAt'],
        showProperties: ['id', 'username', 'email', 'name', 'role', 'phoneNumber', 'city', 'createdAt', 'updatedAt'],
        editProperties: ['username', 'email', 'name', 'role', 'phoneNumber', 'city'],
        filterProperties: ['username', 'email', 'role', 'createdAt'],
        navigation: {
          name: 'User Management',
          icon: 'User',
        },
      },
    },
    {
      resource: {
        model: prisma.sellerProfile,
        client: prisma,
      },
      options: {
        listProperties: ['id', 'displayName', 'rating', 'totalSales', 'verified', 'createdAt'],
        showProperties: ['id', 'displayName', 'bio', 'rating', 'totalSales', 'verified', 'createdAt', 'updatedAt'],
        editProperties: ['displayName', 'bio', 'verified'],
        filterProperties: ['displayName', 'verified', 'rating'],
        navigation: {
          name: 'User Management',
          icon: 'Star',
        },
      },
    },
    {
      resource: {
        model: prisma.game,
        client: prisma,
      },
      options: {
        listProperties: ['id', 'name', 'slug', 'createdAt'],
        showProperties: ['id', 'name', 'slug', 'description', 'image', 'createdAt', 'updatedAt'],
        editProperties: ['name', 'slug', 'description', 'image'],
        filterProperties: ['name', 'slug'],
        navigation: {
          name: 'Games & Categories',
          icon: 'Gamepad2',
        },
      },
    },
    {
      resource: {
        model: prisma.category,
        client: prisma,
      },
      options: {
        listProperties: ['id', 'name', 'slug', 'createdAt'],
        showProperties: ['id', 'name', 'slug', 'description', 'icon', 'createdAt', 'updatedAt'],
        editProperties: ['name', 'slug', 'description', 'icon'],
        filterProperties: ['name', 'slug'],
        navigation: {
          name: 'Games & Categories',
          icon: 'Tag',
        },
      },
    },
    {
      resource: {
        model: prisma.gameCategory,
        client: prisma,
      },
      options: {
        listProperties: ['id', 'gameId', 'categoryId', 'createdAt'],
        showProperties: ['id', 'gameId', 'categoryId', 'createdAt'],
        editProperties: ['gameId', 'categoryId'],
        filterProperties: ['gameId', 'categoryId'],
        navigation: {
          name: 'Games & Categories',
          icon: 'Link',
        },
      },
    },
    {
      resource: {
        model: prisma.listing,
        client: prisma,
      },
      options: {
        listProperties: ['id', 'title', 'type', 'price', 'status', 'createdAt'],
        showProperties: [
          'id', 'title', 'description', 'price', 'type', 'status',
          'gameId', 'sellerId', 'images', 'accountLevel', 'accountDetails',
          'keyDetails', 'coinAmount', 'boostingFrom', 'boostingTo',
          'coachingHours', 'createdAt', 'updatedAt'
        ],
        editProperties: [
          'title', 'description', 'price', 'type', 'status', 'gameId',
          'sellerId', 'images', 'accountLevel', 'accountDetails',
          'keyDetails', 'coinAmount', 'boostingFrom', 'boostingTo',
          'coachingHours'
        ],
        filterProperties: ['title', 'type', 'status', 'sellerId', 'gameId', 'price'],
        navigation: {
          name: 'Marketplace',
          icon: 'ShoppingCart',
        },
      },
    },
    {
      resource: {
        model: prisma.order,
        client: prisma,
      },
      options: {
        listProperties: ['id', 'orderNumber', 'status', 'price', 'createdAt'],
        showProperties: [
          'id', 'orderNumber', 'listingId', 'buyerId', 'price', 'status',
          'paymentMethod', 'paymentId', 'deliveryInfo', 'notes',
          'createdAt', 'updatedAt', 'completedAt'
        ],
        editProperties: ['status', 'paymentMethod', 'deliveryInfo', 'notes'],
        filterProperties: ['orderNumber', 'status', 'buyerId', 'price', 'createdAt'],
        navigation: {
          name: 'Marketplace',
          icon: 'Package',
        },
      },
    },
    {
      resource: {
        model: prisma.review,
        client: prisma,
      },
      options: {
        listProperties: ['id', 'rating', 'sellerId', 'authorId', 'createdAt'],
        showProperties: ['id', 'rating', 'comment', 'orderId', 'sellerId', 'authorId', 'createdAt', 'updatedAt'],
        editProperties: ['rating', 'comment'],
        filterProperties: ['rating', 'sellerId', 'authorId', 'createdAt'],
        navigation: {
          name: 'Marketplace',
          icon: 'MessageSquare',
        },
      },
    },
  ],
  rootPath: '/admin',
  branding: {
    companyName: 'Pakistani Gaming Marketplace',
    softwareBrothers: false,
    logo: false,
  },
  dashboard: {
    component: false,
  },
});

export { prisma };