import { prisma } from '@/lib/db';

export async function GET() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
  return new Response(JSON.stringify(products), {
    headers: { 'content-type': 'application/json' },
  });
}
