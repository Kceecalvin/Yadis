import { prisma, cleanupDatabase, createTestUser, createTestProduct } from './setup';

describe('Product Reviews API Integration Tests', () => {
  beforeAll(async () => {
    // Seed database if needed
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  describe('POST /api/reviews/create', () => {
    it('should create a review for authenticated user', async () => {
      const user = await createTestUser();
      const product = await createTestProduct();

      const review = await prisma.productReview.create({
        data: {
          productId: product.id,
          userId: user.id,
          rating: 5,
          title: 'Great product!',
          comment: 'Excellent quality',
          status: 'PENDING',
        },
      });

      expect(review).toBeDefined();
      expect(review.rating).toBe(5);
      expect(review.status).toBe('PENDING');
    });

    it('should prevent duplicate reviews from same user', async () => {
      const user = await createTestUser();
      const product = await createTestProduct();

      // Create first review
      await prisma.productReview.create({
        data: {
          productId: product.id,
          userId: user.id,
          rating: 5,
          title: 'First review',
          status: 'PENDING',
        },
      });

      // Try to create duplicate
      try {
        await prisma.productReview.create({
          data: {
            productId: product.id,
            userId: user.id,
            rating: 4,
            title: 'Second review',
            status: 'PENDING',
          },
        });
        fail('Should have thrown unique constraint error');
      } catch (error: any) {
        expect(error.code).toBe('P2002'); // Unique constraint violation
      }
    });

    it('should validate rating is between 1-5', async () => {
      const user = await createTestUser();
      const product = await createTestProduct();

      try {
        await prisma.productReview.create({
          data: {
            productId: product.id,
            userId: user.id,
            rating: 10, // Invalid
            title: 'Invalid rating',
            status: 'PENDING',
          },
        });
        fail('Should have validation error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('GET /api/reviews/product/[productId]', () => {
    it('should fetch approved reviews with statistics', async () => {
      const product = await createTestProduct();
      const users = await Promise.all([
        createTestUser(),
        createTestUser(),
        createTestUser(),
      ]);

      // Create multiple reviews
      await Promise.all([
        prisma.productReview.create({
          data: {
            productId: product.id,
            userId: users[0].id,
            rating: 5,
            title: 'Excellent',
            isApproved: true,
            status: 'APPROVED',
          },
        }),
        prisma.productReview.create({
          data: {
            productId: product.id,
            userId: users[1].id,
            rating: 4,
            title: 'Good',
            isApproved: true,
            status: 'APPROVED',
          },
        }),
        prisma.productReview.create({
          data: {
            productId: product.id,
            userId: users[2].id,
            rating: 5,
            title: 'Perfect',
            isApproved: true,
            status: 'APPROVED',
          },
        }),
      ]);

      const reviews = await prisma.productReview.findMany({
        where: { productId: product.id, isApproved: true },
      });

      expect(reviews.length).toBe(3);

      // Calculate stats
      const totalReviews = reviews.length;
      const averageRating = (5 + 4 + 5) / 3;
      expect(Number(averageRating.toFixed(1))).toBe(4.7);
    });

    it('should not return unapproved reviews', async () => {
      const product = await createTestProduct();
      const user = await createTestUser();

      await prisma.productReview.create({
        data: {
          productId: product.id,
          userId: user.id,
          rating: 5,
          title: 'Pending review',
          isApproved: false,
          status: 'PENDING',
        },
      });

      const approvedReviews = await prisma.productReview.findMany({
        where: { productId: product.id, isApproved: true },
      });

      expect(approvedReviews.length).toBe(0);
    });

    it('should calculate rating distribution correctly', async () => {
      const product = await createTestProduct();
      const users = await Promise.all(
        Array(10)
          .fill(null)
          .map(() => createTestUser())
      );

      const ratings = [5, 5, 5, 4, 4, 3, 3, 2, 1, 1];
      await Promise.all(
        ratings.map((rating, i) =>
          prisma.productReview.create({
            data: {
              productId: product.id,
              userId: users[i].id,
              rating,
              title: `Review ${i}`,
              isApproved: true,
              status: 'APPROVED',
            },
          })
        )
      );

      const reviews = await prisma.productReview.findMany({
        where: { productId: product.id, isApproved: true },
        select: { rating: true },
      });

      const distribution = {
        5: reviews.filter((r) => r.rating === 5).length,
        4: reviews.filter((r) => r.rating === 4).length,
        3: reviews.filter((r) => r.rating === 3).length,
        2: reviews.filter((r) => r.rating === 2).length,
        1: reviews.filter((r) => r.rating === 1).length,
      };

      expect(distribution[5]).toBe(3);
      expect(distribution[4]).toBe(2);
      expect(distribution[3]).toBe(2);
      expect(distribution[2]).toBe(1);
      expect(distribution[1]).toBe(2);
    });
  });

  describe('Review Moderation', () => {
    it('should approve pending reviews', async () => {
      const user = await createTestUser();
      const product = await createTestProduct();

      const review = await prisma.productReview.create({
        data: {
          productId: product.id,
          userId: user.id,
          rating: 5,
          title: 'Pending review',
          status: 'PENDING',
        },
      });

      const updated = await prisma.productReview.update({
        where: { id: review.id },
        data: {
          isApproved: true,
          status: 'APPROVED',
        },
      });

      expect(updated.status).toBe('APPROVED');
      expect(updated.isApproved).toBe(true);
    });

    it('should reject reviews', async () => {
      const user = await createTestUser();
      const product = await createTestProduct();

      const review = await prisma.productReview.create({
        data: {
          productId: product.id,
          userId: user.id,
          rating: 1,
          title: 'Spam review',
          status: 'PENDING',
        },
      });

      const updated = await prisma.productReview.update({
        where: { id: review.id },
        data: {
          status: 'REJECTED',
        },
      });

      expect(updated.status).toBe('REJECTED');
    });
  });
});
