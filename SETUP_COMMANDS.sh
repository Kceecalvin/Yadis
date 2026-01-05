#!/bin/bash
# Referral Gamification System - Setup Script

echo "🎮 Setting up Referral Gamification System..."
echo ""

# Step 1: Database Migration
echo "📦 Step 1: Running database migration..."
npx prisma migrate dev --name add_points_system
npx prisma generate
echo "✅ Migration complete!"
echo ""

# Step 2: Seed Gamification Data
echo "🌱 Step 2: Seeding gamification data..."
npx tsx prisma/seed-referral-gamification.ts
echo "✅ Seed complete!"
echo ""

# Step 3: Verify setup
echo "🔍 Step 3: Verifying setup..."
echo "Checking database models..."
npx prisma studio &
STUDIO_PID=$!
sleep 2
echo "✅ Prisma Studio launched (PID: $STUDIO_PID)"
echo ""

echo "🎉 Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Start dev server: npm run dev"
echo "2. Visit /referral-new for the new gamified dashboard"
echo "3. Visit /rewards-store for the points redemption store"
echo "4. Visit /gamification for the overall gamification hub"
echo ""
echo "📖 Documentation: See REFERRAL_GAMIFICATION_IMPLEMENTATION.md"
