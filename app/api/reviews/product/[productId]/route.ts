import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

interface Params {
  productId: string;
}

/**
 * GET /api/reviews/product/[productId]
 * Get all approved reviews for a product with stats
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { productId } = await params;

    // Get reviews
    const reviews = await prisma.productReview.findMany({
      where: {
        productId,
        isApproved: true,
      },
      include: {
        user: { select: { name: true, image: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Calculate stats
    const allReviews = await prisma.productReview.findMany({
      where: { productId, isApproved: true },
      select: { rating: true },
    });

    const totalReviews = allReviews.length;
    const averageRating =
      totalReviews > 0
        ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
        : 0;

    const ratingDistribution = {
      5: allReviews.filter((r) => r.rating === 5).length,
      4: allReviews.filter((r) => r.rating === 4).length,
      3: allReviews.filter((r) => r.rating === 3).length,
      2: allReviews.filter((r) => r.rating === 2).length,
      1: allReviews.filter((r) => r.rating === 1).length,
    };

    return NextResponse.json({
      success: true,
      reviews,
      stats: {
        totalReviews,
        averageRating,
        ratingDistribution,
      },
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}
