import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { NextRequest, NextResponse } from 'next/server';

interface Params {
  reviewId: string;
}

/**
 * POST /api/admin/reviews/[reviewId]/approve
 * Approve a review (admin only)
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
        isApproved: true,
        status: 'APPROVED',
      },
    });

    return NextResponse.json({
      success: true,
      review,
      message: 'Review approved!',
    });
  } catch (error) {
    console.error('Error approving review:', error);
    return NextResponse.json({ error: 'Failed to approve review' }, { status: 500 });
  }
}
