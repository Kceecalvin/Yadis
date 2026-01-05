import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const slug = searchParams.get('slug');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    // If slug is provided, return single product
    if (slug) {
      const product = await prisma.product.findUnique({
        where: { slug },
        include: {
          category: {
            select: {
              slug: true,
              titleEn: true,
            },
          },
        },
      });

      if (!product) {
        return new Response(JSON.stringify({ error: 'Product not found' }), {
          status: 404,
          headers: { 'content-type': 'application/json' },
        });
      }

      return new Response(JSON.stringify(product), {
        headers: { 'content-type': 'application/json' },
      });
    }

    // Otherwise return list of products with optional filters
    const where: any = {};
    
    if (category) {
      where.category = { slug: category };
    }
    
    if (search) {
      where.OR = [
        { nameEn: { contains: search, mode: 'insensitive' } },
        { nameSw: { contains: search, mode: 'insensitive' } },
        { descriptionEn: { contains: search, mode: 'insensitive' } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            slug: true,
            titleEn: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }).catch(() => []);

    return new Response(JSON.stringify(products), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch products' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}
