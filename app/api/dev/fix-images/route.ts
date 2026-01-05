import { prisma } from '@/lib/db';

export async function POST() {
  const products = await prisma.product.findMany();
  const updates = products.map((p) => {
    let url = p.imageUrl || '';
    if (url.endsWith('.jpg')) url = url.slice(0, -4) + '.svg';
    if (!url) url = '/images/logo.svg';
    return prisma.product.update({ where: { id: p.id }, data: { imageUrl: url } });
  });
  await Promise.all(updates);
  return new Response(JSON.stringify({ ok: true, updated: updates.length }), { headers: { 'content-type': 'application/json' } });
}

export async function GET() { return POST(); }
