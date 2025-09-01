# Games Bazaar PK - Pakistani Gaming Marketplace

A digital marketplace for Pakistani gamers to buy and sell game accounts, keys, top-ups, coins, boosting, and coaching services.

## Features

### Core Functionality
- **User Authentication**: Secure registration and login system with NextAuth
- **Game Listings**: Create, browse, and filter listings for various gaming services
- **User Profiles**: Public profiles with ratings and seller statistics
- **Categories**: Support for multiple listing types (Accounts, Keys, Top-ups, Coins, Boosting, Coaching)
- **Search & Filter**: Find listings by game or category
- **Seller Dashboard**: Track your listings, sales, and statistics

### Supported Games
- PUBG Mobile
- Free Fire
- Call of Duty Mobile
- Valorant
- FIFA 24
- GTA V
- Minecraft
- Fortnite
- Apex Legends
- League of Legends
- And more...

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **Payment**: Stripe (Ready for integration)

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL installed locally
- npm or yarn package manager

### Installation

1. Clone the repository
```bash
git clone https://github.com/ShanuX69420/GAMESBAZAARPK.git
cd GAMESBAZAARPK
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/gamesbazaar?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

4. Set up the database
```bash
# Run migrations
npx prisma migrate dev

# Seed the database with categories and games
npx prisma db seed
```

5. Start the development server
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Project Structure

```
pakistani-gaming-marketplace/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── browse/            # Browse listings page
│   ├── dashboard/         # User dashboard
│   ├── login/             # Login page
│   ├── profile/           # User profile management
│   ├── register/          # Registration page
│   ├── sell/              # Create listing page
│   └── user/              # Public user profiles
├── components/            # React components
├── lib/                   # Utility functions and configurations
├── prisma/                # Database schema and migrations
├── types/                 # TypeScript type definitions
└── public/                # Static assets
```

## Database Schema

The application uses the following main models:
- **User**: User accounts with authentication
- **SellerProfile**: Extended profile for sellers
- **Category**: Game categories (FPS, MOBA, etc.)
- **Game**: Individual games
- **Listing**: Items/services for sale
- **Order**: Purchase transactions
- **Review**: User ratings and reviews

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run seed` - Seed database with sample data
- `npx prisma studio` - Open Prisma Studio to view/edit database

## Features in Development

- [ ] Payment integration (JazzCash, Easypaisa)
- [ ] Real-time chat between buyers and sellers
- [ ] Email notifications
- [ ] Advanced search filters
- [ ] Admin panel
- [ ] Mobile app
- [ ] Escrow system for secure transactions
- [ ] Dispute resolution system

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Contact

For any queries or support, please reach out through GitHub issues.

## Deployment

The application is ready for deployment on platforms like:
- Vercel (Recommended for Next.js)
- DigitalOcean App Platform
- Railway
- Render

Make sure to set up environment variables on your hosting platform.

## Security

- All passwords are hashed using bcrypt
- Environment variables are used for sensitive data
- SQL injection prevention through Prisma ORM
- CSRF protection with NextAuth

---

Made with ❤️ for Pakistani Gaming Community