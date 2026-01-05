import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth-config';
import { prisma } from '@/lib/db';
import { getUserNotifications, getUnreadNotificationCount } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const [notifications, unreadCount] = await Promise.all([
      getUserNotifications(session.user.id, limit, offset),
      getUnreadNotificationCount(session.user.id),
    ]);

    return NextResponse.json({
      notifications,
      unreadCount,
      total: await prisma.notification.count({
        where: { userId: session.user.id },
      }),
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}
