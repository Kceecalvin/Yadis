import { prisma } from '@/lib/db';

const staticBySlug: Record<string, string> = {
  // Hot meals - real food images
  'chips-masala': 'https://images.unsplash.com/photo-1585109649139-e9f5a5f5b4f9?auto=format&fit=crop&w=800&q=80',
  'pilau': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
  'biriyani': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
  'viazi-karai': 'https://images.unsplash.com/photo-1639024471283-03518883512d?auto=format&fit=crop&w=800&q=80',
  'chapo': 'https://images.unsplash.com/photo-1617195920950-1145bf9a9c72?auto=format&fit=crop&w=800&q=80',
  // Ice cream, pizza, yogurt, juice, snacks - real images
  'vanilla-ice-cream-500ml': 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=800&q=80',
  'margherita-pizza-medium': 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80',
  'fresh-yogurt-1l': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80',
  'mango-juice-1l': 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=800&q=80',
  'crisps-150g': 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=800&q=80',
  // Plastics - real household items
  'deluxe-bucket-20l': 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=800&q=80',
  'plastic-chair': 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?auto=format&fit=crop&w=800&q=80',
  'soft-broom': 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?auto=format&fit=crop&w=800&q=80',
  'plastic-spoons-set-6': 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=800&q=80',
  'baby-potty': 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=800&q=80',
};

export async function POST() {
  const products = await prisma.product.findMany();
  const updates = await Promise.all(
    products.map((p) => {
      const staticUrl = staticBySlug[p.slug];
      if (staticUrl) {
        return prisma.product.update({ where: { id: p.id }, data: { imageUrl: staticUrl } });
      }
      return null;
    })
  );
  const updated = updates.filter(Boolean).length;
  return new Response(JSON.stringify({ ok: true, updated, message: 'All products now use fast static images' }), { 
    headers: { 'content-type': 'application/json' } 
  });
}

export async function GET() { return POST(); }