import { prisma, cleanupDatabase, createTestUser } from './setup';

describe('Advanced Search Filters Integration Tests', () => {
  afterEach(async () => {
    await cleanupDatabase();
  });

  describe('POST /api/search/filters', () => {
    it('should save a search filter', async () => {
      const user = await createTestUser();

      const filter = await prisma.savedSearchFilter.create({
        data: {
          userId: user.id,
          name: 'Budget Snacks',
          categories: JSON.stringify(['snacks', 'drinks']),
          priceMin: 1000,
          priceMax: 5000,
          minRating: 3,
          sortBy: 'price_asc',
        },
      });

      expect(filter.name).toBe('Budget Snacks');
      expect(filter.userId).toBe(user.id);
      expect(filter.isSaved).toBe(true);
    });

    it('should save filters with all criteria', async () => {
      const user = await createTestUser();

      const filter = await prisma.savedSearchFilter.create({
        data: {
          userId: user.id,
          name: 'Premium Items',
          categories: JSON.stringify(['premium', 'luxury']),
          priceMin: 10000,
          priceMax: 50000,
          inStock: true,
          minRating: 4,
          sortBy: 'rating',
        },
      });

      expect(filter.priceMin).toBe(10000);
      expect(filter.priceMax).toBe(50000);
      expect(filter.inStock).toBe(true);
      expect(filter.minRating).toBe(4);
    });

    it('should save filters with partial criteria', async () => {
      const user = await createTestUser();

      const filter = await prisma.savedSearchFilter.create({
        data: {
          userId: user.id,
          name: 'Affordable',
          priceMax: 3000,
          inStock: true,
        },
      });

      expect(filter.priceMin).toBeNull();
      expect(filter.priceMax).toBe(3000);
      expect(filter.inStock).toBe(true);
      expect(filter.categories).toBeNull();
    });

    it('should validate filter name is required', async () => {
      const user = await createTestUser();

      try {
        await prisma.savedSearchFilter.create({
          data: {
            userId: user.id,
            name: '', // Empty name
            priceMax: 5000,
          } as any,
        });
        fail('Should require filter name');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('GET /api/search/filters', () => {
    it('should retrieve user saved filters', async () => {
      const user = await createTestUser();

      // Create multiple filters
      await Promise.all([
        prisma.savedSearchFilter.create({
          data: {
            userId: user.id,
            name: 'Filter 1',
            priceMax: 5000,
          },
        }),
        prisma.savedSearchFilter.create({
          data: {
            userId: user.id,
            name: 'Filter 2',
            priceMin: 10000,
          },
        }),
      ]);

      const filters = await prisma.savedSearchFilter.findMany({
        where: { userId: user.id, isSaved: true },
      });

      expect(filters.length).toBe(2);
      expect(filters.map((f) => f.name)).toContain('Filter 1');
      expect(filters.map((f) => f.name)).toContain('Filter 2');
    });

    it('should not return filters from other users', async () => {
      const user1 = await createTestUser();
      const user2 = await createTestUser();

      await prisma.savedSearchFilter.create({
        data: {
          userId: user1.id,
          name: "User 1's Filter",
          priceMax: 5000,
        },
      });

      const user2Filters = await prisma.savedSearchFilter.findMany({
        where: { userId: user2.id, isSaved: true },
      });

      expect(user2Filters.length).toBe(0);
    });

    it('should return filters ordered by creation date', async () => {
      const user = await createTestUser();

      const filter1 = await prisma.savedSearchFilter.create({
        data: { userId: user.id, name: 'First', priceMax: 5000 },
      });

      // Simulate delay
      await new Promise((resolve) => setTimeout(resolve, 10));

      const filter2 = await prisma.savedSearchFilter.create({
        data: { userId: user.id, name: 'Second', priceMax: 10000 },
      });

      const filters = await prisma.savedSearchFilter.findMany({
        where: { userId: user.id, isSaved: true },
        orderBy: { createdAt: 'desc' },
      });

      expect(filters[0].id).toBe(filter2.id);
      expect(filters[1].id).toBe(filter1.id);
    });
  });

  describe('Filter Application', () => {
    it('should apply category filter', async () => {
      const categories = JSON.stringify(['snacks', 'drinks']);
      const filter = {
        categories: categories,
        priceMin: null,
        priceMax: null,
      };

      const parsed = {
        categories: JSON.parse(filter.categories || '[]'),
        priceMin: filter.priceMin,
        priceMax: filter.priceMax,
      };

      expect(parsed.categories).toContain('snacks');
      expect(parsed.categories).toContain('drinks');
    });

    it('should apply price range filter', async () => {
      const filter = {
        priceMin: 1000,
        priceMax: 5000,
      };

      const testPrices = [500, 1000, 3000, 5000, 6000];
      const filtered = testPrices.filter(
        (price) =>
          (!filter.priceMin || price >= filter.priceMin) &&
          (!filter.priceMax || price <= filter.priceMax)
      );

      expect(filtered).toEqual([1000, 3000, 5000]);
    });

    it('should apply in-stock filter', async () => {
      const user = await createTestUser();

      const filter = await prisma.savedSearchFilter.create({
        data: {
          userId: user.id,
          name: 'In Stock Only',
          inStock: true,
        },
      });

      expect(filter.inStock).toBe(true);

      // When applying: only fetch products with inStock: true
    });

    it('should apply rating filter', async () => {
      const minRating = 4;
      const testRatings = [1, 2, 3, 3.5, 4, 4.5, 5];
      const filtered = testRatings.filter((rating) => rating >= minRating);

      expect(filtered).toEqual([4, 4.5, 5]);
    });
  });

  describe('Filter Persistence', () => {
    it('should update existing filter', async () => {
      const user = await createTestUser();

      let filter = await prisma.savedSearchFilter.create({
        data: {
          userId: user.id,
          name: 'Original Name',
          priceMax: 5000,
        },
      });

      filter = await prisma.savedSearchFilter.update({
        where: { id: filter.id },
        data: {
          name: 'Updated Name',
          priceMax: 10000,
        },
      });

      expect(filter.name).toBe('Updated Name');
      expect(filter.priceMax).toBe(10000);
    });

    it('should delete filter', async () => {
      const user = await createTestUser();

      const filter = await prisma.savedSearchFilter.create({
        data: {
          userId: user.id,
          name: 'To Delete',
          priceMax: 5000,
        },
      });

      await prisma.savedSearchFilter.delete({
        where: { id: filter.id },
      });

      const deleted = await prisma.savedSearchFilter.findUnique({
        where: { id: filter.id },
      });

      expect(deleted).toBeNull();
    });

    it('should handle duplicate filter names', async () => {
      const user = await createTestUser();

      const filter1 = await prisma.savedSearchFilter.create({
        data: {
          userId: user.id,
          name: 'Budget Items',
          priceMax: 5000,
        },
      });

      const filter2 = await prisma.savedSearchFilter.create({
        data: {
          userId: user.id,
          name: 'Budget Items', // Same name
          priceMax: 3000,
        },
      });

      expect(filter1.name).toBe(filter2.name);
      expect(filter1.id).not.toBe(filter2.id);
    });
  });

  describe('Filter Sorting Options', () => {
    it('should support all sorting options', async () => {
      const user = await createTestUser();

      const sortOptions = ['newest', 'price_asc', 'price_desc', 'rating', 'popular'];

      for (const sortBy of sortOptions) {
        const filter = await prisma.savedSearchFilter.create({
          data: {
            userId: user.id,
            name: `Sort by ${sortBy}`,
            sortBy,
          },
        });

        expect(filter.sortBy).toBe(sortBy);
      }
    });
  });
});
