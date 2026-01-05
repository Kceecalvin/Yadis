import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/support/tickets/create
 * Create a new support ticket
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, category, priority, orderId, productId } = await request.json();

    if (!title || !description || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate category
    const validCategories = ['PRODUCT', 'DELIVERY', 'PAYMENT', 'OTHER'];
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    // Validate priority
    const validPriorities = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];
    const ticketPriority = validPriorities.includes(priority) ? priority : 'NORMAL';

    // Create ticket
    const ticket = await prisma.supportTicket.create({
      data: {
        userId: session.user.id,
        title,
        description,
        category,
        priority: ticketPriority,
        orderId: orderId || undefined,
        productId: productId || undefined,
        status: 'OPEN',
      },
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json(
      {
        success: true,
        ticket,
        message: 'Support ticket created! We will respond soon.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
  }
}
