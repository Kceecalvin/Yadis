/**
 * Shop Context - Utilities for multi-tenant shop management
 * 
 * This module provides functions to:
 * - Extract current shop from request context
 * - Validate shop access permissions
 * - Get shop-specific data
 */

import { headers } from 'next/headers';
import { prisma } from './db';
import type { Shop } from '@prisma/client';

/**
 * Get current shop from request headers (set by middleware)
 * Works for both subdomain and path-based routing
 */
export async function getCurrentShop(): Promise<Shop | null> {
  try {
    const headersList = headers();
    const shopSlug = headersList.get('x-shop-slug');
    
    if (!shopSlug) {
      return null;
    }
    
    const shop = await prisma.shop.findUnique({
      where: { 
        slug: shopSlug,
        status: 'ACTIVE' // Only return active shops
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });
    
    return shop;
  } catch (error) {
    console.error('Error getting current shop:', error);
    return null;
  }
}

/**
 * Get shop by slug (for public pages)
 */
export async function getShopBySlug(slug: string): Promise<Shop | null> {
  try {
    return await prisma.shop.findUnique({
      where: { 
        slug,
        status: 'ACTIVE'
      }
    });
  } catch (error) {
    console.error('Error getting shop by slug:', error);
    return null;
  }
}

/**
 * Get all products for a shop
 */
export async function getShopProducts(shopId: string, filters?: {
  categoryId?: string;
  search?: string;
  inStock?: boolean;
  featured?: boolean;
}) {
  const where: any = { shopId };
  
  if (filters?.categoryId) {
    where.categoryId = filters.categoryId;
  }
  
  if (filters?.search) {
    where.OR = [
      { nameEn: { contains: filters.search, mode: 'insensitive' } },
      { nameSw: { contains: filters.search, mode: 'insensitive' } },
      { descriptionEn: { contains: filters.search, mode: 'insensitive' } },
    ];
  }
  
  if (filters?.inStock !== undefined) {
    where.inStock = filters.inStock;
  }
  
  if (filters?.featured !== undefined) {
    where.featured = filters.featured;
  }
  
  return await prisma.product.findMany({
    where,
    include: {
      category: {
        select: {
          slug: true,
          titleEn: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

/**
 * Get all categories for a shop
 */
export async function getShopCategories(shopId: string) {
  return await prisma.category.findMany({
    where: { shopId },
    orderBy: {
      titleEn: 'asc',
    },
  });
}

/**
 * Get shop orders (for shop owner dashboard)
 */
export async function getShopOrders(shopId: string, filters?: {
  status?: string;
  limit?: number;
}) {
  return await prisma.order.findMany({
    where: {
      shopId,
      ...(filters?.status && { status: filters.status }),
    },
    include: {
      items: {
        include: {
          product: {
            select: {
              nameEn: true,
              imageUrl: true,
            },
          },
        },
      },
      customer: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    ...(filters?.limit && { take: filters.limit }),
  });
}

/**
 * Check if user is shop owner
 */
export async function isShopOwner(userId: string, shopId: string): Promise<boolean> {
  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: { ownerId: true },
  });
  
  return shop?.ownerId === userId;
}

/**
 * Get shop statistics (for dashboard)
 */
export async function getShopStats(shopId: string) {
  const [
    totalProducts,
    totalOrders,
    pendingOrders,
    totalRevenue,
  ] = await Promise.all([
    prisma.product.count({ where: { shopId } }),
    prisma.order.count({ where: { shopId } }),
    prisma.order.count({ where: { shopId, status: 'PENDING' } }),
    prisma.order.aggregate({
      where: { shopId, paymentStatus: 'PAID' },
      _sum: { totalCents: true },
    }),
  ]);
  
  return {
    totalProducts,
    totalOrders,
    pendingOrders,
    totalRevenue: totalRevenue._sum.totalCents || 0,
  };
}

/**
 * Validate shop subscription status
 */
export async function validateShopSubscription(shopId: string): Promise<{
  isValid: boolean;
  plan: string;
  message?: string;
}> {
  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: {
      plan: true,
      subscriptionEndsAt: true,
      status: true,
    },
  });
  
  if (!shop) {
    return { isValid: false, plan: 'NONE', message: 'Shop not found' };
  }
  
  if (shop.status !== 'ACTIVE') {
    return { isValid: false, plan: shop.plan, message: 'Shop is not active' };
  }
  
  if (shop.subscriptionEndsAt && shop.subscriptionEndsAt < new Date()) {
    return { isValid: false, plan: shop.plan, message: 'Subscription expired' };
  }
  
  return { isValid: true, plan: shop.plan };
}

/**
 * Get shop theme settings
 */
export async function getShopTheme(shopId: string) {
  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: {
      primaryColor: true,
      secondaryColor: true,
      accentColor: true,
      logoUrl: true,
      bannerUrl: true,
    },
  });
  
  return shop || {
    primaryColor: '#8B4513',
    secondaryColor: '#A0522D',
    accentColor: '#D2691E',
    logoUrl: null,
    bannerUrl: null,
  };
}
