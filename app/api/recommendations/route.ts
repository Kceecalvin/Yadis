import { getSession } from '@/lib/auth';
import { getSmartRecommendations } from '@/lib/recommendations';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '8');

    const recommendations = await getSmartRecommendations(session.user.id, limit);

    return NextResponse.json({
      data: recommendations,
      count: recommendations.length,
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 });
  }
}
