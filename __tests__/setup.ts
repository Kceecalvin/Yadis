import { PrismaClient } from '@prisma/client';

// Create a test database client
export const prisma = new PrismaClient();

// Test utilities
export const cleanupDatabase = async () => {
  const tables = [
    'ProductReview',
    'CouponUsage',
    'CouponCode',
    'OrderTracking',
    'SavedSearchFilter',
  ];

  for (const table of tables) {
    try {
      await (prisma as any)[table.charAt(0).toLowerCase() + table.slice(1)].deleteMany({});
    } catch (err) {
      console.error(`Error cleaning up ${table}:`, err);
    }
  }
};

// Create test user
export const createTestUser = async () => {
  return prisma.user.create({
    data: {
      email: `test-${Date.now()}@example.com`,
      name: 'Test User',
    },
  });
};

// Create test product
export const createTestProduct = async () => {
  const category = await prisma.category.findFirst();
  
  if (!category) {
    throw new Error('No category found. Seed database first.');
  }

  return prisma.product.create({
    data: {
      nameEn: `Test Product ${Date.now()}`,
      descriptionEn: 'Test description',
      priceCents: 5000,
      vendorId: 'test-vendor',
      categoryId: category.id,
    },
  });
};

// Create test order
export const createTestOrder = async (userId: string, productId: string) => {
  return prisma.order.create({
    data: {
      userId,
      totalCents: 5000,
      items: {
        create: [
          {
            productId,
            quantity: 1,
            priceCents: 5000,
          },
        ],
      },
    },
  });
};
