import { prisma } from '@/lib/db';

const categoryFallback: Record<string, string> = {
  // Food
  'ice-cream': 'https://images.unsplash.com/photo-1505253216365-9a62004aeb47?auto=format&fit=crop&w=800&q=70',
  'cakes-pastries-pizza': 'https://images.unsplash.com/photo-1548365328-9f547fb0953e?auto=format&fit=crop&w=800&q=70',
  'yogurt-juices': 'https://images.unsplash.com/photo-1510627498534-cf7e9002facc?auto=format&fit=crop&w=800&q=70',
  'snacks': 'https://images.unsplash.com/photo-1499028344343-cd173ffc68a9?auto=format&fit=crop&w=800&q=70',
  'hot-meals': 'https://images.unsplash.com/photo-1556761175-129418cb2dfe?auto=format&fit=crop&w=800&q=70',
  // Plastics
  'buckets': 'https://images.unsplash.com/photo-1617957901868-f9a9f9d7f504?auto=format&fit=crop&w=800&q=70',
  'brooms': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=70',
  'chairs': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=70',
  'spoons': 'https://images.unsplash.com/photo-1520208422220-7da6ffd4734b?auto=format&fit=crop&w=800&q=70',
  'potties': 'https://images.unsplash.com/photo-1608889175271-1d1ec2d96686?auto=format&fit=crop&w=800&q=70',
};

async function urlOk(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, { method: 'HEAD', signal: controller.signal });
    clearTimeout(id);
    return res.ok;
  } catch {
    return false;
  }
}

export async function POST() {
  const products = await prisma.product.findMany({ include: { category: { select: { slug: true } } } });
  let updated = 0;
  for (const p of products) {
    const img = p.imageUrl || '';
    const optimized = img.includes('images.unsplash.com') ? `${img}${img.includes('?') ? '&' : '?'}auto=format&fit=crop&w=800&q=70` : img;
    const good = optimized ? await urlOk(optimized) : false;
    if (!good) {
      const fallback = categoryFallback[p.category.slug] || '/images/logo.svg';
      await prisma.product.update({ where: { id: p.id }, data: { imageUrl: fallback } });
      updated++;
    } else if (optimized !== img) {
      await prisma.product.update({ where: { id: p.id }, data: { imageUrl: optimized } });
      updated++;
    }
  }
  return new Response(JSON.stringify({ ok: true, updated }), { headers: { 'content-type': 'application/json' } });
}

export async function GET() { return POST(); }
