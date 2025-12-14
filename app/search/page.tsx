import { prisma } from '@/lib/db';
import ProductCard from '../components/ProductCard';

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q || '';
  
  const products = query ? await prisma.product.findMany({
    where: {
      OR: [
        { nameEn: { contains: query, mode: 'insensitive' } },
        { nameSw: { contains: query, mode: 'insensitive' } },
        { descriptionEn: { contains: query, mode: 'insensitive' } },
      ],
    },
    take: 20,
  }) : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-2 text-brand-dark">Search Results</h1>
      <p className="text-brand-secondary mb-6">
        {query ? `Found ${products.length} result(s) for "${query}"` : 'Enter a search term to find products'}
      </p>
      
      {products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              id={p.id}
              slug={p.slug}
              name={p.nameEn}
              price={p.priceCents / 100}
              imageUrl={p.imageUrl || ''}
              inStock={p.inStock}
            />
          ))}
        </div>
      ) : query ? (
        <div className="text-center py-12">
          <svg className="mx-auto w-24 h-24 text-brand-accent mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-brand-secondary text-lg">No products found. Try a different search term.</p>
        </div>
      ) : null}
    </div>
  );
}
