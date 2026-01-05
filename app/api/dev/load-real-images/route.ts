import { prisma } from '@/lib/db';

const urls: Record<string, string> = {
  'chips-masala': 'https://images.unsplash.com/photo-1556761175-129418cb2dfe?auto=format&fit=crop&w=1200&q=80',
  'pilau': 'https://images.unsplash.com/photo-1617195737499-8a04a835a0c2?auto=format&fit=crop&w=1200&q=80',
  'biriyani': 'https://images.unsplash.com/photo-1604908177072-d79c3f7d3a4a?auto=format&fit=crop&w=1200&q=80',
  'viazi-karai': 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=1200&q=80',
  'chapo': 'https://images.unsplash.com/photo-1546549039-49fa3b6d8a06?auto=format&fit=crop&w=1200&q=80',
  'vanilla-ice-cream-500ml': 'https://images.unsplash.com/photo-1505253216365-9a62004aeb47?auto=format&fit=crop&w=1200&q=80',
  'margherita-pizza-medium': 'https://images.unsplash.com/photo-1548365328-9f547fb0953e?auto=format&fit=crop&w=1200&q=80',
  'fresh-yogurt-1l': 'https://images.unsplash.com/photo-1520981825232-ece5fae45120?auto=format&fit=crop&w=1200&q=80',
  'mango-juice-1l': 'https://images.unsplash.com/photo-1510627498534-cf7e9002facc?auto=format&fit=crop&w=1200&q=80',
  'crisps-150g': 'https://images.unsplash.com/photo-1499028344343-cd173ffc68a9?auto=format&fit=crop&w=1200&q=80',
  // Plastics
  'deluxe-bucket-20l': 'https://images.unsplash.com/photo-1617957901868-f9a9f9d7f504?auto=format&fit=crop&w=1200&q=80',
  'plastic-chair': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
  'soft-broom': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80',
  'plastic-spoons-set-6': 'https://images.unsplash.com/photo-1520208422220-7da6ffd4734b?auto=format&fit=crop&w=1200&q=80',
  'baby-potty': 'https://images.unsplash.com/photo-1608889175271-1d1ec2d96686?auto=format&fit=crop&w=1200&q=80',
};

export async function POST() {
  const updates = await Promise.all(
    Object.entries(urls).map(([slug, imageUrl]) =>
      prisma.product.update({ where: { slug }, data: { imageUrl } }).catch(() => null)
    )
  );
  const updated = updates.filter(Boolean).length;
  return new Response(JSON.stringify({ ok: true, updated }), { headers: { 'content-type': 'application/json' } });
}

export async function GET() { return POST(); }
