# Quick Start: Multi-Tenant Setup

## Option 1: Quick Test (Path-Based Routing)

This is the fastest way to test multi-tenant without DNS setup.

### Step 1: Update Schema
```bash
cd ecommerce-store

# Backup current schema
cp prisma/schema.prisma prisma/schema.prisma.backup

# Use the multi-tenant schema
cp prisma/schema-multitenant.prisma prisma/schema.prisma
```

### Step 2: Update Database Connection
```bash
# Edit .env file
# Change from SQLite to PostgreSQL for production-ready setup
# Or keep SQLite for testing

# For PostgreSQL (recommended):
DATABASE_PROVIDER=postgresql
DATABASE_URL="postgresql://user:password@localhost:5432/ecommerce_multitenant"

# For SQLite (testing only):
DATABASE_PROVIDER=sqlite
DATABASE_URL="file:./dev-multitenant.db"
```

### Step 3: Create Migration
```bash
# Generate Prisma client
pnpm exec prisma generate

# Create and run migration
pnpm exec prisma migrate dev --name add_multitenant_support
```

### Step 4: Create Seed Script
Create `prisma/seed-multitenant.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding multi-tenant database...');

  // Create shop owners
  const password = await bcrypt.hash('password123', 10);
  
  const owner1 = await prisma.shopOwner.create({
    data: {
      email: 'owner1@example.com',
      name: 'John Doe',
      password,
      emailVerified: true,
    },
  });

  const owner2 = await prisma.shopOwner.create({
    data: {
      email: 'owner2@example.com',
      name: 'Jane Smith',
      password,
      emailVerified: true,
    },
  });

  // Create shops
  const shop1 = await prisma.shop.create({
    data: {
      slug: 'electronics-hub',
      name: 'Electronics Hub',
      description: 'Your one-stop shop for electronics',
      ownerId: owner1.id,
      primaryColor: '#1E40AF',
      secondaryColor: '#3B82F6',
      accentColor: '#60A5FA',
      whatsappNumber: '+254700000001',
      email: 'contact@electronics-hub.com',
      plan: 'BASIC',
    },
  });

  const shop2 = await prisma.shop.create({
    data: {
      slug: 'fashion-store',
      name: 'Fashion Store',
      description: 'Latest fashion trends',
      ownerId: owner2.id,
      primaryColor: '#EC4899',
      secondaryColor: '#DB2777',
      accentColor: '#F472B6',
      whatsappNumber: '+254700000002',
      email: 'contact@fashion-store.com',
      plan: 'PRO',
    },
  });

  // Create categories for shop 1
  const electronicsCategory = await prisma.category.create({
    data: {
      slug: 'smartphones',
      titleEn: 'Smartphones',
      titleSw: 'Simu',
      section: 'ELECTRONICS',
      shopId: shop1.id,
    },
  });

  // Create categories for shop 2
  const fashionCategory = await prisma.category.create({
    data: {
      slug: 'dresses',
      titleEn: 'Dresses',
      titleSw: 'Mavazi',
      section: 'FASHION',
      shopId: shop2.id,
    },
  });

  // Create products for shop 1
  await prisma.product.createMany({
    data: [
      {
        slug: 'iphone-14',
        nameEn: 'iPhone 14',
        nameSw: 'iPhone 14',
        descriptionEn: 'Latest iPhone with amazing features',
        priceCents: 9999900,
        imageUrl: '/images/placeholder-phone.svg',
        categoryId: electronicsCategory.id,
        shopId: shop1.id,
        inStock: true,
        featured: true,
      },
      {
        slug: 'samsung-s23',
        nameEn: 'Samsung Galaxy S23',
        nameSw: 'Samsung Galaxy S23',
        descriptionEn: 'Powerful Android smartphone',
        priceCents: 8999900,
        imageUrl: '/images/placeholder-phone.svg',
        categoryId: electronicsCategory.id,
        shopId: shop1.id,
        inStock: true,
      },
    ],
  });

  // Create products for shop 2
  await prisma.product.createMany({
    data: [
      {
        slug: 'summer-dress',
        nameEn: 'Summer Dress',
        nameSw: 'Mavazi ya Majira ya Joto',
        descriptionEn: 'Beautiful summer dress',
        priceCents: 299900,
        imageUrl: '/images/placeholder-dress.svg',
        categoryId: fashionCategory.id,
        shopId: shop2.id,
        inStock: true,
        featured: true,
      },
    ],
  });

  console.log('✅ Seeding completed!');
  console.log('\nShop Credentials:');
  console.log('Shop 1 (Electronics Hub):');
  console.log('  Email: owner1@example.com');
  console.log('  Password: password123');
  console.log('  URL: http://localhost:3000/shop/electronics-hub');
  console.log('\nShop 2 (Fashion Store):');
  console.log('  Email: owner2@example.com');
  console.log('  Password: password123');
  console.log('  URL: http://localhost:3000/shop/fashion-store');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### Step 5: Run Seed
```bash
# Install bcryptjs if not installed
pnpm add bcryptjs
pnpm add -D @types/bcryptjs

# Run seed
pnpm exec tsx prisma/seed-multitenant.ts
```

### Step 6: Update API Routes

You need to update each API route to use shop context. Example:

```typescript
// app/api/products/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get shop slug from header (set by middleware)
    const shopSlug = request.headers.get('x-shop-slug');
    
    if (!shopSlug) {
      return new Response(JSON.stringify({ error: 'Shop not specified' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }
    
    // Get shop
    const shop = await prisma.shop.findUnique({
      where: { slug: shopSlug },
    });
    
    if (!shop) {
      return new Response(JSON.stringify({ error: 'Shop not found' }), {
        status: 404,
        headers: { 'content-type': 'application/json' },
      });
    }
    
    // Get products for this shop only
    const products = await prisma.product.findMany({
      where: { shopId: shop.id },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
    
    return new Response(JSON.stringify(products), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}
```

### Step 7: Test It!
```bash
# Start dev server
pnpm dev

# Visit shops:
# http://localhost:3000/shop/electronics-hub
# http://localhost:3000/shop/fashion-store
```

## Option 2: Full Subdomain Setup (Production)

### Step 1: Configure DNS
Add wildcard DNS record:
```
Type: CNAME
Name: *
Value: cname.vercel-dns.com
```

### Step 2: Configure Vercel
1. Go to Vercel project settings
2. Add domain: `*.yourdomain.com`
3. Wait for DNS propagation

### Step 3: Update Middleware
The middleware is already configured for subdomains!

### Step 4: Test
```
https://electronics-hub.yourdomain.com
https://fashion-store.yourdomain.com
```

## Common Issues & Solutions

### Issue: "Shop not found"
**Solution**: Check middleware is running and setting `x-shop-slug` header

### Issue: Products from all shops showing
**Solution**: Ensure all queries filter by `shopId`

### Issue: Admin panel not accessible
**Solution**: Add admin authentication and check shop ownership

### Issue: Middleware not working
**Solution**: Check `middleware.ts` is at project root and matcher is correct

## Testing Checklist

- [ ] Create 2 test shops
- [ ] Add products to each shop
- [ ] Verify data isolation (Shop A can't see Shop B products)
- [ ] Test cart functionality per shop
- [ ] Test admin access per shop
- [ ] Test subdomain/path routing
- [ ] Verify shop themes load correctly

## Next: Add Authentication

Install NextAuth:
```bash
pnpm add next-auth @auth/prisma-adapter
```

Create `app/api/auth/[...nextauth]/route.ts` - See full example in architecture docs.

## Support & Resources

- Architecture: `MULTI_TENANT_ARCHITECTURE.md`
- Migration: `MIGRATION_GUIDE.md`
- Implementation: `IMPLEMENTATION_SUMMARY.md`
- Shop Context: `lib/shop-context.ts`
- Middleware: `middleware.ts`
- Schema: `prisma/schema-multitenant.prisma`
