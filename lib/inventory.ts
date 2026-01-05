/**
 * Inventory Management Service
 * Handles stock tracking and management
 */

import { prisma } from './db';

/**
 * Initialize inventory for a product
 */
export async function initializeInventory(
  productId: string,
  quantity: number = 0,
  reorderLevel: number = 10,
  reorderQuantity: number = 50
) {
  try {
    return await prisma.inventory.create({
      data: {
        productId,
        quantity,
        available: quantity,
        reserved: 0,
        reorderLevel,
        reorderQuantity,
      },
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      // Already exists
      return prisma.inventory.findUnique({ where: { productId } });
    }
    throw error;
  }
}

/**
 * Get product inventory
 */
export async function getInventory(productId: string) {
  return prisma.inventory.findUnique({
    where: { productId },
    include: {
      logs: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });
}

/**
 * Reserve stock for an order
 */
export async function reserveStock(
  productId: string,
  quantity: number,
  reason: string = 'ORDER_RESERVATION'
) {
  try {
    const inventory = await prisma.inventory.findUnique({
      where: { productId },
    });

    if (!inventory) {
      throw new Error('Inventory not found');
    }

    if (inventory.available < quantity) {
      throw new Error('Insufficient stock');
    }

    // Update inventory
    const updated = await prisma.inventory.update({
      where: { productId },
      data: {
        reserved: { increment: quantity },
        available: { decrement: quantity },
      },
    });

    // Log the action
    await prisma.inventoryLog.create({
      data: {
        inventoryId: inventory.id,
        type: 'RESERVATION',
        quantityChange: -quantity,
        reason,
      },
    });

    return updated;
  } catch (error) {
    console.error('Error reserving stock:', error);
    throw error;
  }
}

/**
 * Release reserved stock (for cancelled orders)
 */
export async function releaseReservedStock(
  productId: string,
  quantity: number,
  reason: string = 'ORDER_CANCELLED'
) {
  try {
    const inventory = await prisma.inventory.findUnique({
      where: { productId },
    });

    if (!inventory) {
      throw new Error('Inventory not found');
    }

    if (inventory.reserved < quantity) {
      throw new Error('Cannot release more than reserved');
    }

    // Update inventory
    const updated = await prisma.inventory.update({
      where: { productId },
      data: {
        reserved: { decrement: quantity },
        available: { increment: quantity },
      },
    });

    // Log the action
    await prisma.inventoryLog.create({
      data: {
        inventoryId: inventory.id,
        type: 'RESERVATION',
        quantityChange: quantity,
        reason,
      },
    });

    return updated;
  } catch (error) {
    console.error('Error releasing reserved stock:', error);
    throw error;
  }
}

/**
 * Record a sale (reduce available stock)
 */
export async function recordSale(productId: string, quantity: number) {
  try {
    const inventory = await prisma.inventory.findUnique({
      where: { productId },
    });

    if (!inventory) {
      throw new Error('Inventory not found');
    }

    // Update inventory
    const updated = await prisma.inventory.update({
      where: { productId },
      data: {
        reserved: { decrement: Math.min(quantity, inventory.reserved) },
        quantity: { decrement: quantity },
        lastSoldAt: new Date(),
      },
    });

    // Recalculate available
    const final = await prisma.inventory.update({
      where: { productId },
      data: {
        available: updated.quantity - (updated.reserved - Math.min(quantity, inventory.reserved)),
      },
    });

    // Log the action
    await prisma.inventoryLog.create({
      data: {
        inventoryId: inventory.id,
        type: 'SALE',
        quantityChange: -quantity,
        reason: 'ORDER_COMPLETED',
      },
    });

    // Check if needs reorder
    if (final.available <= final.reorderLevel) {
      console.warn(
        `⚠️  Low stock alert for product ${productId}: ${final.available} units remaining`
      );
    }

    return final;
  } catch (error) {
    console.error('Error recording sale:', error);
    throw error;
  }
}

/**
 * Restock inventory
 */
export async function restockInventory(
  productId: string,
  quantity: number,
  reason: string = 'MANUAL_RESTOCK'
) {
  try {
    const inventory = await prisma.inventory.findUnique({
      where: { productId },
    });

    if (!inventory) {
      throw new Error('Inventory not found');
    }

    // Update inventory
    const updated = await prisma.inventory.update({
      where: { productId },
      data: {
        quantity: { increment: quantity },
        available: { increment: quantity },
        lastRestockDate: new Date(),
      },
    });

    // Log the action
    await prisma.inventoryLog.create({
      data: {
        inventoryId: inventory.id,
        type: 'RESTOCK',
        quantityChange: quantity,
        reason,
      },
    });

    return updated;
  } catch (error) {
    console.error('Error restocking inventory:', error);
    throw error;
  }
}

/**
 * Get low stock products
 */
export async function getLowStockProducts() {
  return prisma.inventory.findMany({
    where: {
      quantity: {
        lte: prisma.raw(`"reorderLevel"`),
      },
    },
    include: {
      product: {
        select: {
          id: true,
          nameEn: true,
          priceCents: true,
        },
      },
    },
    orderBy: {
      quantity: 'asc',
    },
  });
}

/**
 * Get inventory analytics
 */
export async function getInventoryAnalytics() {
  const analytics = await prisma.$queryRaw<any[]>`
    SELECT 
      COUNT(*) as total_products,
      SUM(quantity) as total_quantity,
      SUM(available) as total_available,
      SUM(reserved) as total_reserved,
      AVG(quantity) as avg_quantity,
      MIN(quantity) as min_quantity,
      MAX(quantity) as max_quantity
    FROM "Inventory"
  `;

  return analytics[0];
}

export default {
  initializeInventory,
  getInventory,
  reserveStock,
  releaseReservedStock,
  recordSale,
  restockInventory,
  getLowStockProducts,
  getInventoryAnalytics,
};
