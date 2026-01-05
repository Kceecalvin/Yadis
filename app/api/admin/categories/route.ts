import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { titleEn, slug, descriptionEn, userEmail } = body;

    console.log('Category POST - Request body email:', userEmail);

    // If email provided in body, verify it's an admin
    if (userEmail) {
      const user = await prisma.user.findUnique({
        where: { email: userEmail },
        select: { isPlatformAdmin: true, email: true },
      });

      console.log('Category POST - User from DB:', user);

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 401 });
      }

      if (!user.isPlatformAdmin) {
        return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
      }

      console.log('✅ User verified as admin via email:', userEmail);
    } else {
      // Fallback to old method
      return NextResponse.json({ error: 'No user email provided' }, { status: 401 });
    }

    // Validate required fields
    if (!titleEn || !slug) {
      return NextResponse.json(
        { error: 'Title and slug are required' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingCategory = await prisma.category.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'A category with this slug already exists' },
        { status: 409 }
      );
    }

    // Create category
    const category = await prisma.category.create({
      data: {
        titleEn,
        slug,
        descriptionEn: descriptionEn || '',
        titleAr: titleEn, // Default to English for now
        descriptionAr: descriptionEn || '', // Default to English for now
      },
    });

    console.log('✅ Category created successfully:', category);
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('❌ Error creating category:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Failed to create category', 
        details: errorMessage,
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { titleEn: 'asc' },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json([], { status: 200 });
  }
}
