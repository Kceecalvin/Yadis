import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get or create a test user
    const testUser = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        email: 'test@example.com',
        name: 'Test User',
        phone: '+254712345678',
        phoneVerified: true,
      },
    });

    // Get some products
    const products = await prisma.product.findMany({ take: 10 });
    if (products.length === 0) {
      return NextResponse.json({ error: 'No products found' }, { status: 400 });
    }

    // Create test orders with different statuses
    const now = new Date();

    // Order 1: PENDING (placed today)
    const order1 = await prisma.order.create({
      data: {
        user: { connect: { id: testUser.id } },
        status: 'PENDING',
        totalCents: 5000,
        items: {
          create: [
            {
              productId: products[0].id,
              quantity: 2,
              priceCents: products[0].priceCents,
            },
          ],
        },
      },
    });

    // Order 2: CONFIRMED (placed 1 day ago)
    const order2 = await prisma.order.create({
      data: {
        userId: testUser.id,
        
        status: 'CONFIRMED',
        totalCents: 8500,
        
        
        
        
        
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        items: {
          create: [
            {
              productId: products[1].id,
              quantity: 1,
              priceCents: products[1].priceCents,
            },
            {
              productId: products[2].id,
              quantity: 3,
              priceCents: products[2].priceCents,
            },
          ],
        },
      },
    });

    // Order 3: PROCESSING (placed 2 days ago)
    const order3 = await prisma.order.create({
      data: {
        userId: testUser.id,
        
        status: 'PROCESSING',
        totalCents: 12000,
        
        
        
        
        
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        items: {
          create: [
            {
              productId: products[3].id,
              quantity: 2,
              priceCents: products[3].priceCents,
            },
          ],
        },
      },
    });

    // Order 4: SHIPPED (placed 3 days ago)
    const order4 = await prisma.order.create({
      data: {
        userId: testUser.id,
        
        status: 'SHIPPED',
        totalCents: 6500,
        
        
        
        
        
        createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        items: {
          create: [
            {
              productId: products[4].id,
              quantity: 1,
              priceCents: products[4].priceCents,
            },
            {
              productId: products[5].id,
              quantity: 2,
              priceCents: products[5].priceCents,
            },
          ],
        },
      },
    });

    // Order 5: DELIVERED (placed 5 days ago)
    const order5 = await prisma.order.create({
      data: {
        userId: testUser.id,
        
        status: 'DELIVERED',
        totalCents: 9800,
        
        
        
        
        
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        items: {
          create: [
            {
              productId: products[6].id,
              quantity: 3,
              priceCents: products[6].priceCents,
            },
          ],
        },
      },
    });

    // Order 6: CANCELLED (placed 1 day ago)
    const order6 = await prisma.order.create({
      data: {
        userId: testUser.id,
        
        status: 'CANCELLED',
        totalCents: 3500,
        
        
        
        
        
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        items: {
          create: [
            {
              productId: products[7].id,
              quantity: 1,
              priceCents: products[7].priceCents,
            },
          ],
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Test orders created successfully',
      orders: [
        { id: order1.id, status: 'PENDING' },
        { id: order2.id, status: 'CONFIRMED' },
        { id: order3.id, status: 'PROCESSING' },
        { id: order4.id, status: 'SHIPPED' },
        { id: order5.id, status: 'DELIVERED' },
        { id: order6.id, status: 'CANCELLED' },
      ],
      testUser: {
        email: testUser.email,
        phone: testUser.phone,
      },
    });
  } catch (error) {
    console.error('Error creating test orders:', error);
    return NextResponse.json(
      { error: 'Failed to create test orders', details: String(error) },
      { status: 500 }
    );
  }
}
