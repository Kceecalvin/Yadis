import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, adminSecret } = await request.json();

    // Simple secret check for security
    const secret = process.env.ADMIN_SECRET || 'admin-secret-key';
    if (adminSecret !== secret) {
      return NextResponse.json({ error: 'Invalid admin secret' }, { status: 401 });
    }

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email },
    }).catch(() => null);

    if (!user) {
      // Create user if doesn't exist
      user = await prisma.user.create({
        data: {
          email,
          isPlatformAdmin: true,
        },
      });
      return NextResponse.json({
        message: `User created and made admin: ${email}`,
        user,
      });
    }

    // Update existing user
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { isPlatformAdmin: true },
    });

    return NextResponse.json({
      message: `Successfully made ${email} an admin`,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error making admin:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to make admin', details: errorMessage },
      { status: 500 }
    );
  }
}
