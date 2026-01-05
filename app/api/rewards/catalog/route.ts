import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const rewards = await prisma.rewardCatalog.findMany({
      where: { isActive: true },
      orderBy: { minSpend: 'asc' },
    });

    return NextResponse.json(rewards);
  } catch (error) {
    console.error('Error fetching reward catalog:', error);
    return NextResponse.json({ error: 'Failed to fetch catalog' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const reward = await prisma.rewardCatalog.create({
      data: {
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        value: data.value || 100,
        minSpend: data.minSpend || 3000,
        quantity: data.quantity || 100,
      },
    });

    return NextResponse.json(reward);
  } catch (error) {
    console.error('Error creating reward:', error);
    return NextResponse.json({ error: 'Failed to create reward' }, { status: 500 });
  }
}
