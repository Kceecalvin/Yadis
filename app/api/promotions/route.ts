import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Return empty promotions array for now - model doesn't exist yet
    return NextResponse.json([]);
  } catch (error) {
    console.error('Error fetching promotions:', error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    // Only admins can create promotions
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { title, description, imageUrl, type, targetUrl, startDate, endDate } = data;

    if (!title || !imageUrl || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const promotion = await prisma.promotion.create({
      data: {
        title,
        description,
        imageUrl,
        type: type || 'PROMOTION',
        targetUrl,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });

    return NextResponse.json(promotion);
  } catch (error) {
    console.error('Error creating promotion:', error);
    return NextResponse.json({ error: 'Failed to create promotion' }, { status: 500 });
  }
}
