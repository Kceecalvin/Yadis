# 🚀 Quick Start - Referral Gamification

## Setup (5 minutes)

```bash
# 1. Run migration
npx prisma migrate dev --name add_points_system
npx prisma generate

# 2. Seed data
npx tsx prisma/seed-referral-gamification.ts

# 3. Start server
npm run dev
```

## Access Points

- **Gamified Referral Dashboard**: http://localhost:3000/referral-new
- **Rewards Store**: http://localhost:3000/rewards-store
- **Gamification Hub**: http://localhost:3000/gamification

## What You Get

✅ Points system with rewards store  
✅ Leaderboards (weekly/monthly/all-time)  
✅ Progress bars & milestones  
✅ Badge collection system  
✅ Monthly contests with prizes  
✅ Spin wheel integration  

## Key Files

- `lib/points-service.ts` - Points logic
- `lib/referral.ts` - Gamification hooks
- `app/referral-new/page.tsx` - New UI
- `prisma/schema.prisma` - Database models

## Testing

1. Sign in as a user
2. Visit `/referral-new`
3. Copy referral code
4. Create new user with code
5. Watch points, badges, and progress update!

**Full docs**: `REFERRAL_GAMIFICATION_IMPLEMENTATION.md`
