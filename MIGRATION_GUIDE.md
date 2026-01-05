# Migration Guide: Single Store → Multi-Tenant Platform

## Overview
This guide walks you through converting your current single e-commerce store into a multi-tenant platform.

## Pre-Migration Checklist

- [ ] Backup your current database
- [ ] Test the current system thoroughly
- [ ] Document any custom configurations
- [ ] Plan downtime window (if needed)

## Step-by-Step Migration

### Step 1: Backup Everything
```bash
# Backup database
sqlite3 prisma/dev.db ".backup 'prisma/dev.db.backup'"

# Or for PostgreSQL (production)
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Backup code
git add -A
git commit -m "Pre-migration backup"
git tag pre-multitenant-migration
```

### Step 2: Update Prisma Schema

```bash
# Backup current schema
cp prisma/schema.prisma prisma/schema.prisma.backup

# Review the new schema
cat prisma/schema-multitenant.prisma

# Decision point: Do you want to migrate existing data or start fresh?
```

**Option A: Migrate Existing Data** (Recommended)
- Keeps your current products/categories/orders
- Your store becomes the first shop in the platform

**Option B: Start Fresh**
- Clean slate for multi-tenant platform
- Move existing data to a separate backup

### Step 3: Create Migration SQL (Option A)

If migrating existing data, create this migration:

```sql
-- Add Shop and ShopOwner tables first
-- Then add shopId to existing tables
-- Finally, populate shopId for existing records

-- Create your shop
INSERT INTO Shop (id, slug, name, ownerId, ...) VALUES (...);

-- Update existing records with shopId
UPDATE Product SET shopId = 'your-shop-id';
UPDATE Category SET shopId = 'your-shop-id';
UPDATE Order SET shopId = 'your-shop-id';
```

### Step 4: Update Application Code

#### 4.1 Create Middleware for Tenant Detection
```typescript
// middleware.ts (already provided in architecture doc)
```

#### 4.2 Update API Routes
All API routes need to:
1. Extract shopId from context
2. Filter queries by shopId
3. Verify authorization

Example:
```typescript
// Before
const products = await prisma.product.findMany();

// After
const shopId = getShopIdFromRequest(request);
const products = await prisma.product.findMany({
  where: { shopId }
});
```

#### 4.3 Update Components
Components need to be shop-aware:
- Dynamic theming based on shop settings
- Shop-specific navigation
- Shop branding (logo, colors)

### Step 5: Add Authentication

You'll need:
1. Shop owner registration/login
2. Customer login (optional, or keep guest checkout)
3. Platform admin login (for you)

Libraries to consider:
- `next-auth` - Easy setup, multiple providers
- `lucia-auth` - Lightweight, full control
- Custom JWT implementation

### Step 6: Create Shop Management Dashboard

New pages needed:
- `/dashboard` - Shop owner overview
- `/dashboard/products` - Manage products
- `/dashboard/orders` - Manage orders
- `/dashboard/settings` - Shop settings
- `/dashboard/analytics` - Sales analytics

### Step 7: Testing

Test scenarios:
1. Create new shop
2. Add products to shop
3. Verify data isolation (Shop A can't see Shop B's data)
4. Test subdomain routing
5. Test admin access controls
6. Test checkout flow per shop

### Step 8: Deployment

#### Local Development
```bash
# Update environment variables
echo "NEXTAUTH_SECRET=your-secret" >> .env
echo "NEXTAUTH_URL=http://localhost:3000" >> .env

# Run migrations
pnpm exec prisma migrate dev --name add_multitenant

# Generate Prisma client
pnpm exec prisma generate

# Seed with test shops
pnpm exec tsx prisma/seed-multitenant.ts

# Start dev server
pnpm dev
```

#### Production (Vercel)
1. Update Vercel environment variables
2. Configure wildcard subdomain: `*.yourdomain.com`
3. Push to GitHub
4. Deploy

For subdomain setup on Vercel:
- Add wildcard domain in Vercel project settings
- Configure DNS: `*.yourdomain.com` → Vercel
- Update middleware to handle subdomains

## Migration Timeline Estimate

- **Phase 1**: Schema & Database (2-3 days)
- **Phase 2**: Authentication (2-3 days)
- **Phase 3**: Shop Dashboard (3-5 days)
- **Phase 4**: Frontend Updates (3-4 days)
- **Phase 5**: Testing & Bug Fixes (2-3 days)
- **Phase 6**: Deployment & Monitoring (1-2 days)

**Total**: 2-3 weeks for full migration

## Quick Start (Minimal Viable Multi-Tenant)

If you want to start simple:

1. Add `shopId` to Product, Category, Order tables
2. Create Shop and ShopOwner tables
3. Add basic authentication for shop owners
4. Filter all queries by `shopId`
5. Use path-based routing: `/shop/[slug]`

This gets you 80% there without complex subdomain setup.

## Rollback Plan

If something goes wrong:

```bash
# Restore database
sqlite3 prisma/dev.db < prisma/dev.db.backup

# Restore code
git checkout pre-multitenant-migration

# Restore dependencies
pnpm install
```

## Post-Migration Tasks

- [ ] Monitor error logs
- [ ] Test all features thoroughly
- [ ] Update documentation
- [ ] Train shop owners (if any)
- [ ] Set up monitoring/alerts
- [ ] Create shop owner onboarding flow

## Support During Migration

If you encounter issues:
1. Check the error logs
2. Verify database migrations completed
3. Ensure environment variables are set
4. Test with a single shop first
5. Ask for help with specific errors

## Cost Considerations

**Current Setup**: Single store, minimal hosting
**Multi-Tenant Setup**: 
- Same hosting costs (Vercel)
- Same database costs initially
- Will need to scale as shops grow
- Consider Redis for caching ($10-20/month)
- Email service for notifications ($0-50/month)

## Revenue Model

How to monetize:
1. **Subscription Plans**: FREE, BASIC ($29), PRO ($99)
2. **Transaction Fees**: 5% (FREE), 2% (BASIC), 0% (PRO)
3. **Setup Fees**: One-time $99 for custom setup
4. **Premium Features**: Advanced analytics, API access
5. **White Label**: $499/month for full rebrand

Example: 10 shops on BASIC plan = $290/month revenue
