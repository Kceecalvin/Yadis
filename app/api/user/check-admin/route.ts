import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth-config';

export async function GET() {
  try {
    console.log('=== CHECK ADMIN ENDPOINT CALLED ===');
    const session = await getServerSession(authOptions);

    console.log('Session:', {
      exists: !!session,
      userEmail: session?.user?.email,
      userId: session?.user?.id,
    });

    if (!session?.user?.email) {
      console.log('❌ No session or email - returning false');
      return NextResponse.json({ isAdmin: false, user: null, reason: 'No session' });
    }

    // Directly query database for admin status
    console.log('Querying database for:', session.user.email);
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        isPlatformAdmin: true,
      },
    });

    console.log('User from DB:', user ? {
      email: user.email,
      isPlatformAdmin: user.isPlatformAdmin,
      type: typeof user.isPlatformAdmin
    } : 'NOT FOUND');

    if (!user) {
      console.log('❌ User not found in database');
      return NextResponse.json({ isAdmin: false, user: null, reason: 'User not found' });
    }

    const isAdmin = user.isPlatformAdmin === true;
    console.log('✅ Returning isAdmin:', isAdmin);

    return NextResponse.json({
      isAdmin,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('❌ Error checking admin status:', error);
    return NextResponse.json({ isAdmin: false, user: null, reason: 'Server error' }, { status: 500 });
  }
}
