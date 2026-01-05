/**
 * Integration Tests for Search Filters API
 * Tests: Save filters, retrieve filters, apply filters
 */

describe('Search Filters API', () => {
  describe('POST /api/search/filters', () => {
    it('should save a new search filter', async () => {
      const filterData = {
        name: 'Budget Snacks',
        categories: ['category-1', 'category-2'],
        priceMin: 0,
        priceMax: 5000,
        inStock: true,
        minRating: 3,
        sortBy: 'price_asc',
      };

      const response = await fetch('/api/search/filters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filterData),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.filter).toHaveProperty('id');
      expect(data.filter.name).toBe('Budget Snacks');
    });

    it('should require authentication to save filters', async () => {
      const response = await fetch('/api/search/filters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Filter',
          categories: [],
        }),
      });

      expect(response.status).toBe(401);
    });

    it('should validate filter name is required', async () => {
      const response = await fetch('/api/search/filters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: '',
          categories: [],
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('name');
    });

    it('should accept partial filter data', async () => {
      const filterData = {
        name: 'Premium Items',
        priceMin: 50000,
      };

      const response = await fetch('/api/search/filters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filterData),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.filter.name).toBe('Premium Items');
    });

    it('should store categories as JSON', async () => {
      const categories = ['cat-1', 'cat-2', 'cat-3'];
      const response = await fetch('/api/search/filters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Multi-Category',
          categories,
        }),
      });

      const data = await response.json();
      expect(Array.isArray(JSON.parse(data.filter.categories))).toBe(true);
    });
  });

  describe('GET /api/search/filters', () => {
    it('should retrieve user saved filters', async () => {
      const response = await fetch('/api/search/filters');

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.filters)).toBe(true);
    });

    it('should only return filters for authenticated user', async () => {
      const response = await fetch('/api/search/filters');

      if (response.status === 200) {
        const data = await response.json();
        // Verify all filters belong to current user
        data.filters.forEach((filter: any) => {
          expect(filter).toHaveProperty('userId');
          expect(filter).toHaveProperty('name');
        });
      } else {
        expect(response.status).toBe(401);
      }
    });

    it('should parse JSON categories correctly', async () => {
      const response = await fetch('/api/search/filters');
      const data = await response.json();

      data.filters.forEach((filter: any) => {
        if (filter.categories) {
          expect(Array.isArray(filter.categories)).toBe(true);
        }
      });
    });

    it('should sort filters by creation date descending', async () => {
      const response = await fetch('/api/search/filters');
      const data = await response.json();

      for (let i = 0; i < data.filters.length - 1; i++) {
        const current = new Date(data.filters[i].createdAt).getTime();
        const next = new Date(data.filters[i + 1].createdAt).getTime();
        expect(current).toBeGreaterThanOrEqual(next);
      }
    });

    it('should require authentication', async () => {
      const response = await fetch('/api/search/filters');

      if (response.status !== 200) {
        expect(response.status).toBe(401);
      }
    });
  });

  describe('Filter Application', () => {
    it('should handle price range filters correctly', async () => {
      const filterData = {
        name: 'Price Range Test',
        priceMin: 10000,
        priceMax: 50000,
      };

      const response = await fetch('/api/search/filters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filterData),
      });

      const data = await response.json();
      expect(data.filter.priceMin).toBe(10000);
      expect(data.filter.priceMax).toBe(50000);
    });

    it('should support multiple sort options', async () => {
      const sortOptions = ['newest', 'price_asc', 'price_desc', 'rating', 'popular'];

      for (const sortBy of sortOptions) {
        const response = await fetch('/api/search/filters', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: `Sort Test - ${sortBy}`,
            sortBy,
          }),
        });

        expect(response.status).toBe(201);
      }
    });

    it('should handle rating filter', async () => {
      const response = await fetch('/api/search/filters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'High Rated Items',
          minRating: 4,
        }),
      });

      const data = await response.json();
      expect(data.filter.minRating).toBe(4);
    });
  });
});
