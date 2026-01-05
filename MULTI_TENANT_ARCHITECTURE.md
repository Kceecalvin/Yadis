# Multi-Tenant E-commerce Architecture

## Overview
Transform the single-store e-commerce system into a multi-tenant platform where multiple shop owners can create and manage their own stores.

## Architecture Design

### 1. Tenant Isolation Model
**Schema-based Multi-tenancy** (Recommended for your use case)
- Each shop gets its own subdomain: `shop-name.yourdomain.com`
- Shared database with tenant ID in every table
- Cost-effective and easier to maintain
- Good performance with proper indexing

### 2. Database Schema Changes

#### New Tables:
```prisma
model Shop {
  id          String   @id @default(cuid())
  slug        String   @unique  // For subdomain: shop-slug.domain.com
  name        String
  description String?
  logoUrl     String?
  
  // Owner information
  ownerId     String
  owner       ShopOwner @relation(fields: [ownerId], references: [id])
  
  // Customization
  primaryColor   String  @default("#8B4513")
  secondaryColor String  @default("#A0522D")
  
  // Business details
  whatsappNumber String?
  email          String?
  address        String?
  
  // Subscription & Status
  plan           String   @default("FREE") // FREE, BASIC, PRO
  status         String   @default("ACTIVE") // ACTIVE, SUSPENDED, CLOSED
  subscriptionEndsAt DateTime?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  categories  Category[]
  products    Product[]
  orders      Order[]
}

model ShopOwner {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  phone     String?
  password  String   // Hashed
  
  // Verification
  emailVerified Boolean  @default(false)
  phoneVerified Boolean  @default(false)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  shops     Shop[]
}
```

#### Updated Existing Tables:
- Add `shopId` to: Product, Category, Order, User (as customer)
- Add indexes on `shopId` for performance
- Add composite indexes for common queries

### 3. URL Structure

**Option A: Subdomain-based** (Recommended)
- Main Platform: `yourdomain.com`
- Shop 1: `electronics-hub.yourdomain.com`
- Shop 2: `fashion-store.yourdomain.com`
- Admin: `shop-slug.yourdomain.com/admin`

**Option B: Path-based** (Simpler setup)
- Main Platform: `yourdomain.com`
- Shop 1: `yourdomain.com/shop/electronics-hub`
- Shop 2: `yourdomain.com/shop/fashion-store`
- Admin: `yourdomain.com/shop/electronics-hub/admin`

### 4. Features by Plan

#### FREE Plan
- Up to 50 products
- Basic customization (colors, logo)
- Standard support
- 5% transaction fee

#### BASIC Plan ($29/month)
- Up to 500 products
- Custom domain support
- Priority support
- 2% transaction fee
- Analytics dashboard

#### PRO Plan ($99/month)
- Unlimited products
- Advanced customization
- API access
- 24/7 support
- 0% transaction fee
- Marketing tools

### 5. Implementation Steps

#### Phase 1: Database Migration
1. Update Prisma schema with Shop and ShopOwner models
2. Add shopId to existing tables
3. Run migrations
4. Create seed data for testing

#### Phase 2: Authentication & Authorization
1. Implement shop owner registration/login
2. Create middleware to identify tenant from subdomain/path
3. Implement role-based access control (RBAC)
   - Platform Admin (you)
   - Shop Owner
   - Shop Customer

#### Phase 3: Shop Management
1. Shop creation flow
2. Shop settings dashboard
3. Product management per shop
4. Order management per shop
5. Analytics per shop

#### Phase 4: Frontend Updates
1. Dynamic theming based on shop settings
2. Shop-specific layouts
3. Shop discovery/marketplace page
4. Customer accounts per shop

#### Phase 5: Billing & Subscriptions
1. Integrate payment gateway (Stripe/M-Pesa)
2. Subscription management
3. Plan upgrades/downgrades
4. Usage monitoring

### 6. Middleware Implementation

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl;
  
  // Extract subdomain
  const subdomain = hostname.split('.')[0];
  
  // Main platform
  if (subdomain === 'www' || subdomain === 'yourdomain') {
    return NextResponse.next();
  }
  
  // Shop subdomain
  // Store shop slug in header for use in API routes
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-shop-slug', subdomain);
  
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

### 7. Data Isolation Strategy

```typescript
// lib/shop-context.ts
import { headers } from 'next/headers';
import { prisma } from './db';

export async function getCurrentShop() {
  const headersList = headers();
  const shopSlug = headersList.get('x-shop-slug');
  
  if (!shopSlug) {
    return null;
  }
  
  return await prisma.shop.findUnique({
    where: { slug: shopSlug },
  });
}

export async function getShopProducts(shopId: string) {
  return await prisma.product.findMany({
    where: { shopId },
    include: { category: true },
  });
}
```

### 8. Security Considerations

1. **Data Isolation**: Always filter by shopId in queries
2. **Authorization**: Verify shop owner can only access their shop
3. **Rate Limiting**: Per shop and per IP
4. **SQL Injection**: Use Prisma's parameterized queries
5. **XSS Protection**: Sanitize user inputs
6. **CORS**: Configure per shop if needed

### 9. Scalability Considerations

1. **Database**: 
   - Index all foreign keys
   - Partition large tables by shopId
   - Consider read replicas for heavy loads

2. **Caching**:
   - Redis for session management
   - Cache shop settings per subdomain
   - Cache product listings with short TTL

3. **CDN**: 
   - Use CDN for static assets
   - Cache shop-specific assets

4. **Monitoring**:
   - Track per-shop performance
   - Monitor database query performance
   - Set up alerts for shop downtime

### 10. Migration Strategy for Current Store

Your current store becomes:
1. A template/demo shop
2. Your own first shop
3. A testing ground for new features

Steps:
1. Create a Shop record for your current store
2. Update all existing products/categories/orders with the shopId
3. Test thoroughly before launching multi-tenant features

## Next Steps

1. **Immediate**: Fix the add-to-cart bug (DONE ✅)
2. **Short-term**: Implement basic multi-tenant schema
3. **Medium-term**: Build shop owner dashboard
4. **Long-term**: Add billing and marketplace features

Would you like me to start implementing the multi-tenant schema?
