# Your Store - E-commerce Platform

A modern, full-featured e-commerce website built with Next.js 15, Prisma, and Tailwind CSS.

## Features

- 🛍️ Full product catalog (Food & Household items)
- 🔍 Search functionality
- 🎨 Minimalistic brown design theme
- 📱 Fully responsive
- 🚚 Free delivery on all orders
- ⭐ Customer reviews
- 🎁 Rewards program

## Tech Stack

- **Framework**: Next.js 15.1.6
- **Database**: SQLite (dev) / PostgreSQL (production)
- **ORM**: Prisma
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up the database:
   ```bash
   pnpm exec prisma generate
   pnpm exec prisma migrate dev --name init
   pnpm exec tsx prisma/seed.ts
   ```

4. Start the development server:
   ```bash
   pnpm dev
   ```

5. Open http://localhost:3000

## Deployment to Vercel

1. Push code to GitHub
2. Import project to Vercel
3. Set environment variables:
   - `DATABASE_PROVIDER=postgresql`
   - `DATABASE_URL=<your-postgres-url>`
4. Deploy

## Project Structure

```
ecommerce-store/
├── app/                    # Next.js app directory
│   ├── components/         # React components
│   ├── api/               # API routes
│   └── ...
├── prisma/                # Database schema & seeds
├── public/                # Static assets
└── lib/                   # Utility functions
```

## License

MIT
