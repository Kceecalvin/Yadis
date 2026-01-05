import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const section = searchParams.get('section');

    if (!section || !['FOOD', 'HOUSEHOLD'].includes(section)) {
      return NextResponse.json(
        { error: 'Invalid or missing section parameter' },
        { status: 400 }
      );
    }

    // Fetch orders with their tracking information, filtered by section
    const deliveries = await prisma.orderTracking.findMany({
      where: {
        order: {
          items: {
            some: {
              product: {
                category: {
                  section: section,
                },
              },
            },
          },
        },
      },
      include: {
        order: {
          include: {
            items: {
              include: {
                product: {
                  include: {
                    category: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(deliveries);
  } catch (error) {
    console.error('Error fetching deliveries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deliveries' },
      { status: 500 }
    );
  }
}
