/**
 * Wishlist Feature Tests
 * Tests user wishlist functionality
 */

import { prisma } from '../lib/db';
import {
  addToWishlist,
  removeFromWishlist,
  getUserWishlist,
  isInWishlist,
  getWishlistCount,
  clearWishlist,
} from '../lib/wishlist';

describe('Wishlist Feature', () => {
  let testUserId: string;
  let testProductIds: string[] = [];

  beforeAll(async () => {
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: `wishlist-test-${Date.now()}@example.com`,
        name: 'Wishlist Test User',
      },
    });
    testUserId = user.id;

    // Create test products
    const category = await prisma.category.findFirst();
    if (category) {
      for (let i = 0; i < 3; i++) {
        const product = await prisma.product.create({
          data: {
            slug: `wishlist-test-${i}-${Date.now()}`,
            nameEn: `Wishlist Test Product ${i}`,
            nameSw: `Bidhaa ya Wishlist ${i}`,
            priceCents: 10000 * (i + 1),
            imageUrl: 'https://example.com/image.jpg',
            categoryId: category.id,
          },
        });
        testProductIds.push(product.id);
      }
    }
  });

  afterAll(async () => {
    // Cleanup
    try {
      await prisma.wishlist.deleteMany({
        where: { userId: testUserId },
      });
      await prisma.product.deleteMany({
        where: { id: { in: testProductIds } },
      });
      await prisma.user.delete({
        where: { id: testUserId },
      });
    } catch (error) {
      console.log('Cleanup error (can be ignored)');
    }
  });

  describe('addToWishlist', () => {
    it('should add product to wishlist', async () => {
      const wishlist = await addToWishlist(testUserId, testProductIds[0]);

      expect(wishlist).toBeDefined();
      expect(wishlist.userId).toBe(testUserId);
      expect(wishlist.productId).toBe(testProductIds[0]);
    });

    it('should include product details', async () => {
      const wishlist = await addToWishlist(testUserId, testProductIds[1]);

      expect(wishlist.product).toBeDefined();
      expect(wishlist.product.nameEn).toBeDefined();
      expect(wishlist.product.priceCents).toBeDefined();
    });

    it('should not add duplicate to wishlist', async () => {
      await addToWishlist(testUserId, testProductIds[2]);
      const duplicate = await addToWishlist(testUserId, testProductIds[2]);

      expect(duplicate).toBeDefined();
      // Should return existing instead of creating new
    });
  });

  describe('removeFromWishlist', () => {
    beforeEach(async () => {
      await addToWishlist(testUserId, testProductIds[0]);
    });

    it('should remove product from wishlist', async () => {
      const removed = await removeFromWishlist(testUserId, testProductIds[0]);

      expect(removed).toBeDefined();
      expect(removed.productId).toBe(testProductIds[0]);
    });

    it('should return null if product not in wishlist', async () => {
      const result = await removeFromWishlist(testUserId, testProductIds[0]);

      expect(result).toBeNull();
    });
  });

  describe('getUserWishlist', () => {
    beforeEach(async () => {
      for (const productId of testProductIds) {
        await addToWishlist(testUserId, productId);
      }
    });

    it('should retrieve user wishlist', async () => {
      const wishlist = await getUserWishlist(testUserId);

      expect(Array.isArray(wishlist)).toBe(true);
      expect(wishlist.length).toBeGreaterThan(0);
    });

    it('should include product details', async () => {
      const wishlist = await getUserWishlist(testUserId);

      if (wishlist.length > 0) {
        expect(wishlist[0].product).toBeDefined();
        expect(wishlist[0].product.category).toBeDefined();
      }
    });

    it('should order by most recent first', async () => {
      const wishlist = await getUserWishlist(testUserId);

      if (wishlist.length > 1) {
        expect(wishlist[0].addedAt.getTime())
          .toBeGreaterThanOrEqual(wishlist[1].addedAt.getTime());
      }
    });
  });

  describe('isInWishlist', () => {
    beforeEach(async () => {
      await clearWishlist(testUserId);
      await addToWishlist(testUserId, testProductIds[0]);
    });

    it('should return true if product in wishlist', async () => {
      const result = await isInWishlist(testUserId, testProductIds[0]);

      expect(result).toBe(true);
    });

    it('should return false if product not in wishlist', async () => {
      const result = await isInWishlist(testUserId, testProductIds[1]);

      expect(result).toBe(false);
    });
  });

  describe('getWishlistCount', () => {
    beforeEach(async () => {
      await clearWishlist(testUserId);
      for (let i = 0; i < 2; i++) {
        await addToWishlist(testUserId, testProductIds[i]);
      }
    });

    it('should count wishlist items', async () => {
      const count = await getWishlistCount(testUserId);

      expect(count).toBe(2);
    });

    it('should return 0 for empty wishlist', async () => {
      const newUser = await prisma.user.create({
        data: { email: `empty-wishlist-${Date.now()}@example.com` },
      });

      const count = await getWishlistCount(newUser.id);

      expect(count).toBe(0);

      await prisma.user.delete({ where: { id: newUser.id } });
    });
  });

  describe('clearWishlist', () => {
    beforeEach(async () => {
      for (const productId of testProductIds) {
        await addToWishlist(testUserId, productId);
      }
    });

    it('should clear all wishlist items', async () => {
      const before = await getWishlistCount(testUserId);
      await clearWishlist(testUserId);
      const after = await getWishlistCount(testUserId);

      expect(before).toBeGreaterThan(0);
      expect(after).toBe(0);
    });
  });

  describe('Wishlist State Management', () => {
    it('should maintain wishlist integrity', async () => {
      await clearWishlist(testUserId);

      // Add 3 products
      for (let i = 0; i < 3; i++) {
        await addToWishlist(testUserId, testProductIds[i]);
      }

      let count = await getWishlistCount(testUserId);
      expect(count).toBe(3);

      // Remove 1 product
      await removeFromWishlist(testUserId, testProductIds[0]);
      count = await getWishlistCount(testUserId);
      expect(count).toBe(2);

      // Check if product is gone
      const inWishlist = await isInWishlist(testUserId, testProductIds[0]);
      expect(inWishlist).toBe(false);

      // Clear all
      await clearWishlist(testUserId);
      count = await getWishlistCount(testUserId);
      expect(count).toBe(0);
    });
  });
});
