import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/reviews/create
 * Create a new product review
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId, rating, title, comment } = await request.json();

    if (!productId || !rating || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    // Check if user already reviewed this product
    const existingReview = await prisma.productReview.findUnique({
      where: {
        productId_userId: {
          productId,
          userId: session.user.id,
        },
      },
    });

    if (existingReview) {
      return NextResponse.json({ error: 'You already reviewed this product' }, { status: 400 });
    }

    // Create review
    const review = await prisma.productReview.create({
      data: {
        productId,
        userId: session.user.id,
        rating,
        title,
        comment,
        isApproved: false, // Requires admin approval
      },
      include: {
        user: { select: { name: true, image: true } },
      },
    });

    return NextResponse.json({
      success: true,
      review,
      message: 'Review submitted successfully! It will appear after admin approval.',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}
