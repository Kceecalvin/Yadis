import { prisma } from '@/lib/db';
import Link from 'next/link';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

interface Props { params: Promise<{ slug: string }> }

const subcatImage: Record<string, string> = {
  'ice-cream': 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=800&q=80',
  'cakes-pastries-pizza': 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80',
  'yogurt-juices': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80',
  snacks: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=800&q=80',
  'hot-meals': 'https://images.unsplash.com/photo-1585109649139-e9f5a5f5b4f9?auto=format&fit=crop&w=800&q=80',
  buckets: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=800&q=80',
  brooms: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?auto=format&fit=crop&w=800&q=80',
  chairs: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?auto=format&fit=crop&w=800&q=80',
  spoons: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=800&q=80',
  potties: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=800&q=80',
};

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const cat = await prisma.category.findUnique({ where: { slug } }).catch(() => null);
  const products = await prisma.product.findMany({
    where: { category: { slug } },
    orderBy: { createdAt: 'desc' },
    include: { category: { select: { slug: true } } },
  }).catch(() => []);

  let showSubcats = false;
  if (!products.length) {
    showSubcats = true;
  }

  const subcategories = showSubcats && cat ? await prisma.category.findMany({
    where: {
      section: cat.section,
      NOT: { slug: cat.slug },
    },
    orderBy: { titleEn: 'asc' },
  }).catch(() => []) : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{cat?.titleEn ?? 'Category'}</h1>

      {showSubcats ? (
        <div>
          <p className="mb-4 text-slate-600">Browse {cat?.titleEn?.toLowerCase()} categories:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {subcategories.map((s) => (
              <Link key={s.id} href={`/category/${s.slug}`} className="border rounded-lg overflow-hidden group bg-white">
                <Image src={subcatImage[s.slug] || '/images/logo.svg'} alt={s.titleEn} width={400} height={400} className="aspect-square w-full object-cover group-hover:scale-[1.02] transition-transform" />
                <div className="p-3 font-semibold">{s.titleEn}</div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((p) => {
            const displaySrc = p.imageUrl || subcatImage[p.category.slug] || '/images/logo.svg';
            return (
              <Link key={p.id} href={`/products/${p.slug}`} className="border rounded-lg overflow-hidden group">
                <Image src={displaySrc} alt={p.nameEn} width={400} height={400} className="w-full object-cover" />
                <div className="p-3">
                  <div className="font-semibold">{p.nameEn}</div>
                  <div className="text-brand-primary font-bold">KES {(p.priceCents / 100).toLocaleString()}</div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
