import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/admin/set-admin
 * Make user an admin (for initial setup only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { email } = await request.json();

    // If no email provided, use current user
    const targetEmail = email || session?.user?.email;

    if (!targetEmail) {
      return NextResponse.json({ error: 'Email required or please sign in' }, { status: 400 });
    }

    // Update user to admin by email
    const user = await prisma.user.updateMany({
      where: { email: targetEmail },
      data: { isPlatformAdmin: true },
    });

    return NextResponse.json({
      success: true,
      message: `User with email ${targetEmail} is now an admin!`,
      updated: user.count,
    });
  } catch (error: any) {
    console.error('Error setting admin:', error);
    return NextResponse.json({ error: 'Failed to set admin status' }, { status: 500 });
  }
}
