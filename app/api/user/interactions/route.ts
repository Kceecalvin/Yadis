import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId, actionType } = await request.json();

    if (!productId || !actionType) {
      return NextResponse.json(
        { error: 'Product ID and action type required' },
        { status: 400 }
      );
    }

    // Upsert interaction (create or update frequency)
    const interaction = await prisma.productInteraction.upsert({
      where: {
        userId_productId_actionType: {
          userId: session.user.id,
          productId,
          actionType,
        },
      },
      update: {
        frequency: {
          increment: 1,
        },
        lastInteractionAt: new Date(),
      },
      create: {
        userId: session.user.id,
        productId,
        actionType,
        frequency: 1,
      },
    });

    return NextResponse.json(interaction);
  } catch (error) {
    console.error('Error tracking interaction:', error);
    return NextResponse.json({ error: 'Failed to track interaction' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const interactions = await prisma.productInteraction.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        product: true,
      },
      orderBy: {
        lastInteractionAt: 'desc',
      },
    });

    return NextResponse.json(interactions);
  } catch (error) {
    console.error('Error fetching interactions:', error);
    return NextResponse.json({ error: 'Failed to fetch interactions' }, { status: 500 });
  }
}
