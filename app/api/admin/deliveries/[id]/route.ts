import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const delivery = await prisma.orderTracking.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            items: {
              include: {
                product: {
                  include: {
                    category: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!delivery) {
      return NextResponse.json(
        { error: 'Delivery not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(delivery);
  } catch (error) {
    console.error('Error fetching delivery detail:', error);
    return NextResponse.json(
      { error: 'Failed to fetch delivery details' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { status, notes } = body;

    if (!status && notes === undefined) {
      return NextResponse.json(
        { error: 'No updates provided' },
        { status: 400 }
      );
    }

    // Validate status if provided
    if (status && !['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    // Build update object
    const updateData: any = {};

    if (status) {
      updateData.status = status;

      // Automatically set timestamps based on status
      if (status === 'CONFIRMED' && !updateData.confirmedAt) {
        updateData.confirmedAt = new Date();
      }
      if (status === 'SHIPPED' && !updateData.shippedAt) {
        updateData.shippedAt = new Date();
      }
      if (status === 'DELIVERED' && !updateData.deliveredAt) {
        updateData.deliveredAt = new Date();
      }
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const updatedDelivery = await prisma.orderTracking.update({
      where: { id },
      data: updateData,
      include: {
        order: {
          include: {
            items: {
              include: {
                product: {
                  include: {
                    category: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json(updatedDelivery);
  } catch (error) {
    console.error('Error updating delivery:', error);
    return NextResponse.json(
      { error: 'Failed to update delivery' },
      { status: 500 }
    );
  }
}
