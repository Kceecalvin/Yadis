import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/search/filters
 * Save a search filter
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, categories, priceMin, priceMax, inStock, minRating, sortBy } =
      await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Filter name required' }, { status: 400 });
    }

    const filter = await prisma.savedSearchFilter.create({
      data: {
        userId: session.user.id,
        name,
        categories: categories ? JSON.stringify(categories) : null,
        priceMin,
        priceMax,
        inStock,
        minRating,
        sortBy,
      },
    });

    return NextResponse.json({
      success: true,
      filter,
      message: 'Search filter saved successfully!',
    }, { status: 201 });
  } catch (error) {
    console.error('Error saving filter:', error);
    return NextResponse.json({ error: 'Failed to save filter' }, { status: 500 });
  }
}

/**
 * GET /api/search/filters
 * Get user's saved search filters
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const filters = await prisma.savedSearchFilter.findMany({
      where: {
        userId: session.user.id,
        isSaved: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Parse JSON fields
    const parsedFilters = filters.map((f) => ({
      ...f,
      categories: f.categories ? JSON.parse(f.categories) : [],
    }));

    return NextResponse.json({
      success: true,
      filters: parsedFilters,
    });
  } catch (error) {
    console.error('Error fetching filters:', error);
    return NextResponse.json({ error: 'Failed to fetch filters' }, { status: 500 });
  }
}
