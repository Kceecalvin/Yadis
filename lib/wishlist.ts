/**
 * Wishlist Service
 * Manages user wishlist functionality
 */

import { prisma } from './db';

/**
 * Add product to wishlist
 */
export async function addToWishlist(userId: string, productId: string) {
  try {
    // Check if already in wishlist
    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existing) {
      return existing;
    }

    return await prisma.wishlist.create({
      data: {
        user: { connect: { id: userId } },
        product: { connect: { id: productId } },
      },
      include: { product: true },
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    throw error;
  }
}

/**
 * Remove product from wishlist
 */
export async function removeFromWishlist(userId: string, productId: string) {
  try {
    return await prisma.wishlist.delete({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return null; // Not in wishlist
    }
    throw error;
  }
}

/**
 * Get user wishlist
 */
export async function getUserWishlist(userId: string) {
  return prisma.wishlist.findMany({
    where: { userId },
    include: {
      product: {
        include: {
          category: true,
          reviews: {
            where: { isApproved: true },
            select: { rating: true },
          },
        },
      },
    },
    orderBy: { addedAt: 'desc' },
  });
}

/**
 * Check if product is in wishlist
 */
export async function isInWishlist(userId: string, productId: string) {
  const wishlist = await prisma.wishlist.findUnique({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
  });

  return !!wishlist;
}

/**
 * Get wishlist count
 */
export async function getWishlistCount(userId: string) {
  return prisma.wishlist.count({
    where: { userId },
  });
}

/**
 * Clear wishlist
 */
export async function clearWishlist(userId: string) {
  return prisma.wishlist.deleteMany({
    where: { userId },
  });
}

/**
 * Get popular wishlist products (products wishlisted by many users)
 */
export async function getPopularWishlistProducts(limit: number = 10) {
  const result = await prisma.$queryRaw<any[]>`
    SELECT 
      p.*,
      COUNT(w.id) as wishlist_count
    FROM "Product" p
    LEFT JOIN "Wishlist" w ON p.id = w."productId"
    GROUP BY p.id
    ORDER BY wishlist_count DESC
    LIMIT ${limit}
  `;

  return result;
}

export default {
  addToWishlist,
  removeFromWishlist,
  getUserWishlist,
  isInWishlist,
  getWishlistCount,
  clearWishlist,
  getPopularWishlistProducts,
};
