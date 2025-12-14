import { prisma } from '@/lib/db';

const localBySlug: Record<string, string> = {
  'chips-masala': '/images/food/chips-masala.svg',
  'pilau': '/images/food/pilau.svg',
  'biriyani': '/images/food/biriyani.svg',
  'viazi-karai': '/images/food/viazi-karai.svg',
  'chapo': '/images/food/chapo.svg',
  'vanilla-ice-cream-500ml': '/images/food/ice-cream.svg',
  'margherita-pizza-medium': '/images/food/pizza.svg',
  'fresh-yogurt-1l': '/images/food/yogurt.svg',
  'mango-juice-1l': '/images/food/juice.svg',
  'crisps-150g': '/images/food/snacks.svg',
};

export async function POST() {
  const products = await prisma.product.findMany();
  const updates = await Promise.all(
    products.map((p) => {
      const url = localBySlug[p.slug];
      return url ? prisma.product.update({ where: { id: p.id }, data: { imageUrl: url } }) : null;
    })
  );
  const updated = updates.filter(Boolean).length;
  return new Response(JSON.stringify({ ok: true, updated }), { headers: { 'content-type': 'application/json' } });
}

export async function GET() { return POST(); }
