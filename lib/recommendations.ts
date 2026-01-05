import { prisma } from './db';

interface RecommendationScore {
  productId: string;
  score: number;
}

/**
 * Get smart product recommendations based on user interaction history
 * WITHOUT revealing that AI is doing the recommendation
 */
export async function getSmartRecommendations(
  userId: string,
  limit: number = 8
): Promise<any[]> {
  try {
    // Get user's interaction history
    const interactions = await prisma.productInteraction.findMany({
      where: { userId },
      include: { product: { include: { category: true } } },
      orderBy: { lastInteractionAt: 'desc' },
      take: 100,
    });

    if (interactions.length === 0) {
      // If no history, return trending/new products
      return await prisma.product.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { category: true },
      });
    }

    // Extract preferred categories from interactions
    const categoryScores: { [key: string]: number } = {};

    interactions.forEach((interaction) => {
      const categoryId = interaction.product.categoryId;
      const weight = getActionWeight(interaction.actionType) * interaction.frequency;
      categoryScores[categoryId] = (categoryScores[categoryId] || 0) + weight;
    });

    // Find products in preferred categories that user hasn't interacted with
    const interactedProductIds = interactions.map((i) => i.productId);

    const recommendations = await prisma.product.findMany({
      where: {
        id: { notIn: interactedProductIds },
        categoryId: { in: Object.keys(categoryScores) },
      },
      include: { category: true },
      take: limit * 2, // Get more to score
    });

    // Score products based on user preferences
    const scoredRecommendations: RecommendationScore[] = recommendations
      .map((product) => {
        let score = 0;
        score += (categoryScores[product.categoryId] || 0) * 10;
        return { productId: product.id, score };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    // Get the actual product objects
    const recommendedProducts = await Promise.all(
      scoredRecommendations.map((rec) =>
        prisma.product.findUnique({
          where: { id: rec.productId },
          include: { category: true },
        })
      )
    );

    return recommendedProducts.filter(Boolean);
  } catch (error) {
    console.error('Error getting recommendations:', error);
    // Fallback to recent products
    return await prisma.product.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    });
  }
}

/**
 * Weight different user actions for recommendation scoring
 */
function getActionWeight(actionType: string): number {
  const weights: { [key: string]: number } = {
    PURCHASE: 5, // Purchase is most valuable
    ADD_TO_CART: 2,
    WISHLIST: 1.5,
    VIEW: 0.5,
  };
  return weights[actionType] || 1;
}

/**
 * Create notification for product recommendations based on user preferences
 * This checks if a new product matches user's frequent purchases
 */
export async function checkAndNotifyRecommendations(productId: string): Promise<void> {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) return;

    // Find users who have purchased from this category before
    const userInteractions = await prisma.productInteraction.findMany({
      where: {
        product: {
          categoryId: product.categoryId,
        },
        actionType: 'PURCHASE',
      },
      select: { userId: true },
      distinct: ['userId'],
    });

    // Create notifications for these users
    const notifications = userInteractions.map((interaction) => ({
      userId: interaction.userId,
      type: 'NEW_ARRIVAL',
      title: 'New Item You Might Like',
      message: `A new ${product.nameEn || product.nameSw} has arrived in your favorite category!`,
      productId: product.id,
    }));

    if (notifications.length > 0) {
      await prisma.notification.createMany({
        data: notifications,
      });
    }
  } catch (error) {
    console.error('Error checking and notifying recommendations:', error);
  }
}

/**
 * Track product interaction from frontend
 * Should be called when user views, adds to cart, or purchases a product
 */
export async function trackProductInteraction(
  userId: string,
  productId: string,
  actionType: 'VIEW' | 'ADD_TO_CART' | 'PURCHASE' | 'WISHLIST'
): Promise<void> {
  try {
    await prisma.productInteraction.upsert({
      where: {
        userId_productId_actionType: {
          userId,
          productId,
          actionType,
        },
      },
      update: {
        frequency: { increment: 1 },
        lastInteractionAt: new Date(),
      },
      create: {
        userId,
        productId,
        actionType,
        frequency: 1,
      },
    });
  } catch (error) {
    console.error('Error tracking interaction:', error);
  }
}

/**
 * Get user preference summary
 */
export async function getUserPreferenceSummary(userId: string) {
  try {
    const interactions = await prisma.productInteraction.findMany({
      where: { userId },
      include: { product: true },
    });

    const categoryFrequency: { [key: string]: number } = {};
    const pricePoints: number[] = [];

    interactions.forEach((interaction) => {
      const categoryId = interaction.product.categoryId;
      categoryFrequency[categoryId] = (categoryFrequency[categoryId] || 0) + 1;
      pricePoints.push(interaction.product.priceCents);
    });

    const avgPrice = pricePoints.length > 0 ? Math.round(pricePoints.reduce((a, b) => a + b) / pricePoints.length) : 0;
    const maxPrice = pricePoints.length > 0 ? Math.max(...pricePoints) : 10000;

    return {
      topCategories: Object.entries(categoryFrequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3),
      preferredPriceRange: {
        min: Math.max(0, avgPrice - 5000),
        max: maxPrice + 5000,
      },
      totalInteractions: interactions.length,
    };
  } catch (error) {
    console.error('Error getting user preference summary:', error);
    return null;
  }
}
