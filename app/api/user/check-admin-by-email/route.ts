import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    console.log('=== CHECK ADMIN BY EMAIL ===');
    console.log('Email:', email);

    if (!email) {
      console.log('❌ No email provided');
      return NextResponse.json({ isAdmin: false, reason: 'No email' });
    }

    // Query database directly
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        isPlatformAdmin: true,
      },
    });

    console.log('User found:', user ? {
      email: user.email,
      isPlatformAdmin: user.isPlatformAdmin,
    } : 'NOT FOUND');

    if (!user) {
      console.log('❌ User not found');
      return NextResponse.json({ isAdmin: false, reason: 'User not found' });
    }

    const isAdmin = user.isPlatformAdmin === true;
    console.log('✅ isAdmin:', isAdmin);

    return NextResponse.json({
      isAdmin,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json({ isAdmin: false, reason: 'Server error' }, { status: 500 });
  }
}
