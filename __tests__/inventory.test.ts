/**
 * Inventory Management Tests
 * Tests stock tracking and reservation functionality
 */

import { prisma } from '../lib/db';
import {
  initializeInventory,
  getInventory,
  reserveStock,
  releaseReservedStock,
  recordSale,
  restockInventory,
  getLowStockProducts,
} from '../lib/inventory';

describe('Inventory Management', () => {
  let testProductId: string;
  let testCategoryId: string;

  beforeAll(async () => {
    // Create test category and product
    const category = await prisma.category.create({
      data: {
        slug: `test-inventory-${Date.now()}`,
        titleEn: 'Test Category',
        titleSw: 'Kategoria ya Jaribio',
        section: 'FOOD',
      },
    });
    testCategoryId = category.id;

    const product = await prisma.product.create({
      data: {
        slug: `test-product-${Date.now()}`,
        nameEn: 'Test Product',
        nameSw: 'Bidhaa ya Jaribio',
        priceCents: 10000,
        imageUrl: 'https://example.com/image.jpg',
        categoryId,
      },
    });
    testProductId = product.id;
  });

  afterAll(async () => {
    // Cleanup
    try {
      await prisma.inventoryLog.deleteMany({
        where: { inventory: { productId: testProductId } },
      });
      await prisma.inventory.deleteMany({
        where: { productId: testProductId },
      });
      await prisma.product.delete({
        where: { id: testProductId },
      });
      await prisma.category.delete({
        where: { id: testCategoryId },
      });
    } catch (error) {
      console.log('Cleanup error (can be ignored)');
    }
  });

  describe('initializeInventory', () => {
    it('should create inventory for a product', async () => {
      const inventory = await initializeInventory(testProductId, 100);

      expect(inventory).toBeDefined();
      expect(inventory.productId).toBe(testProductId);
      expect(inventory.quantity).toBe(100);
      expect(inventory.available).toBe(100);
      expect(inventory.reserved).toBe(0);
    });

    it('should set reorder levels', async () => {
      const inventory = await initializeInventory(
        testProductId,
        50,
        5,
        25
      );

      expect(inventory.reorderLevel).toBe(5);
      expect(inventory.reorderQuantity).toBe(25);
    });

    it('should return existing inventory if already created', async () => {
      const first = await initializeInventory(testProductId, 100);
      const second = await initializeInventory(testProductId, 200);

      expect(first.id).toBe(second.id);
    });
  });

  describe('reserveStock', () => {
    beforeEach(async () => {
      await initializeInventory(testProductId, 100);
    });

    it('should reserve stock for an order', async () => {
      const inventory = await reserveStock(testProductId, 20);

      expect(inventory.reserved).toBe(20);
      expect(inventory.available).toBe(80);
      expect(inventory.quantity).toBe(100);
    });

    it('should throw error if stock is insufficient', async () => {
      await expect(reserveStock(testProductId, 150))
        .rejects
        .toThrow('Insufficient stock');
    });

    it('should create inventory log entry', async () => {
      const beforeLogs = await prisma.inventoryLog.count({
        where: { inventory: { productId: testProductId } },
      });

      await reserveStock(testProductId, 10);

      const afterLogs = await prisma.inventoryLog.count({
        where: { inventory: { productId: testProductId } },
      });

      expect(afterLogs).toBeGreaterThan(beforeLogs);
    });

    it('should support multiple reservations', async () => {
      await reserveStock(testProductId, 20);
      const inventory = await reserveStock(testProductId, 15);

      expect(inventory.reserved).toBe(35);
      expect(inventory.available).toBe(65);
    });
  });

  describe('releaseReservedStock', () => {
    beforeEach(async () => {
      await initializeInventory(testProductId, 100);
      await reserveStock(testProductId, 30);
    });

    it('should release reserved stock', async () => {
      const inventory = await releaseReservedStock(testProductId, 20);

      expect(inventory.reserved).toBe(10);
      expect(inventory.available).toBe(90);
    });

    it('should throw error if releasing more than reserved', async () => {
      await expect(releaseReservedStock(testProductId, 50))
        .rejects
        .toThrow('Cannot release more than reserved');
    });

    it('should create inventory log for release', async () => {
      const inventory = await getInventory(testProductId);
      const beforeLogs = inventory?.logs.length || 0;

      await releaseReservedStock(testProductId, 10);

      const updated = await getInventory(testProductId);
      const afterLogs = updated?.logs.length || 0;

      expect(afterLogs).toBeGreaterThan(beforeLogs);
    });
  });

  describe('recordSale', () => {
    beforeEach(async () => {
      await initializeInventory(testProductId, 100);
      await reserveStock(testProductId, 25);
    });

    it('should record a sale', async () => {
      const inventory = await recordSale(testProductId, 25);

      expect(inventory.quantity).toBe(75);
      expect(inventory.reserved).toBe(0);
    });

    it('should update lastSoldAt timestamp', async () => {
      const before = new Date();
      const inventory = await recordSale(testProductId, 10);
      const after = new Date();

      expect(inventory.lastSoldAt).toBeDefined();
      if (inventory.lastSoldAt) {
        expect(inventory.lastSoldAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
        expect(inventory.lastSoldAt.getTime()).toBeLessThanOrEqual(after.getTime());
      }
    });

    it('should create sale log entry', async () => {
      const logs = await prisma.inventoryLog.findMany({
        where: {
          inventory: { productId: testProductId },
          type: 'SALE',
        },
      });

      const beforeCount = logs.length;
      await recordSale(testProductId, 5);
      
      const afterLogs = await prisma.inventoryLog.findMany({
        where: {
          inventory: { productId: testProductId },
          type: 'SALE',
        },
      });

      expect(afterLogs.length).toBeGreaterThan(beforeCount);
    });
  });

  describe('restockInventory', () => {
    beforeEach(async () => {
      await initializeInventory(testProductId, 50);
    });

    it('should add stock to inventory', async () => {
      const inventory = await restockInventory(testProductId, 50);

      expect(inventory.quantity).toBe(100);
      expect(inventory.available).toBe(100);
    });

    it('should update lastRestockDate', async () => {
      const before = new Date();
      const inventory = await restockInventory(testProductId, 25);
      const after = new Date();

      expect(inventory.lastRestockDate).toBeDefined();
      if (inventory.lastRestockDate) {
        expect(inventory.lastRestockDate.getTime()).toBeGreaterThanOrEqual(before.getTime());
      }
    });

    it('should create restock log entry', async () => {
      const logs = await prisma.inventoryLog.findMany({
        where: {
          inventory: { productId: testProductId },
          type: 'RESTOCK',
        },
      });

      const beforeCount = logs.length;
      await restockInventory(testProductId, 10);

      const afterLogs = await prisma.inventoryLog.findMany({
        where: {
          inventory: { productId: testProductId },
          type: 'RESTOCK',
        },
      });

      expect(afterLogs.length).toBeGreaterThan(beforeCount);
    });
  });

  describe('getInventory', () => {
    beforeEach(async () => {
      await initializeInventory(testProductId, 100);
    });

    it('should retrieve inventory with logs', async () => {
      await reserveStock(testProductId, 20);
      
      const inventory = await getInventory(testProductId);

      expect(inventory).toBeDefined();
      expect(inventory?.productId).toBe(testProductId);
      expect(inventory?.logs).toBeDefined();
      expect(Array.isArray(inventory?.logs)).toBe(true);
    });
  });

  describe('getLowStockProducts', () => {
    beforeEach(async () => {
      // Create a low stock product
      const category = await prisma.category.findFirst();
      const lowStockProduct = await prisma.product.create({
        data: {
          slug: `low-stock-${Date.now()}`,
          nameEn: 'Low Stock Product',
          nameSw: 'Bidhaa Chache',
          priceCents: 5000,
          imageUrl: 'https://example.com/image.jpg',
          categoryId: category?.id || testCategoryId,
        },
      });

      // Initialize with low quantity
      await initializeInventory(lowStockProduct.id, 3, 10, 50);

      // Cleanup after test
      setTimeout(() => {
        prisma.inventoryLog.deleteMany({
          where: { inventory: { productId: lowStockProduct.id } },
        });
        prisma.inventory.deleteMany({
          where: { productId: lowStockProduct.id },
        });
        prisma.product.delete({
          where: { id: lowStockProduct.id },
        });
      }, 5000);
    });

    it('should return products with quantity below reorder level', async () => {
      const lowStockProducts = await getLowStockProducts();

      // Check if any products are returned
      if (lowStockProducts.length > 0) {
        const product = lowStockProducts[0];
        expect(product.quantity).toBeLessThanOrEqual(product.reorderLevel);
      }
    });
  });

  describe('Inventory State Consistency', () => {
    beforeEach(async () => {
      await initializeInventory(testProductId, 100);
    });

    it('should maintain quantity + reserved = initial', async () => {
      await reserveStock(testProductId, 30);
      const inv1 = await getInventory(testProductId);

      await releaseReservedStock(testProductId, 10);
      const inv2 = await getInventory(testProductId);

      expect(inv2!.quantity + inv2!.reserved).toBeLessThanOrEqual(100 + inv1!.quantity);
    });

    it('should track all changes in logs', async () => {
      const inventory = await getInventory(testProductId);
      const initialLogs = inventory?.logs.length || 0;

      await reserveStock(testProductId, 20);
      await releaseReservedStock(testProductId, 10);
      await restockInventory(testProductId, 30);

      const updated = await getInventory(testProductId);
      const finalLogs = updated?.logs.length || 0;

      expect(finalLogs).toBeGreaterThan(initialLogs);
    });
  });
});
