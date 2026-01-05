import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { NextRequest, NextResponse } from 'next/server';

interface Params {
  reviewId: string;
}

/**
 * POST /api/admin/reviews/[reviewId]/reject
 * Reject a review (admin only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !session.user.isPlatformAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { reviewId } = await params;

    const review = await prisma.productReview.update({
      where: { id: reviewId },
      data: {
        isApproved: false,
        status: 'REJECTED',
      },
    });

    return NextResponse.json({
      success: true,
      review,
      message: 'Review rejected!',
    });
  } catch (error) {
    console.error('Error rejecting review:', error);
    return NextResponse.json({ error: 'Failed to reject review' }, { status: 500 });
  }
}
