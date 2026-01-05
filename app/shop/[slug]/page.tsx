import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ProductCard from '../../components/ProductCard';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ShopPage({ params }: Props) {
  const { slug } = await params;
  
  // Get category and products from Yadplast
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      products: {
        where: { inStock: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!category) {
    return notFound();
  }

  return (
    <div className="min-h-screen">
      {/* Shop Header */}
      <div className="relative bg-gradient-to-r from-brand-primary to-brand-secondary">
        <div className="mx-auto max-w-7xl px-4 py-12">
          {/* Back Button */}
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Marketplace
          </Link>

          {/* Category Info */}
          <div className="flex items-start gap-6">
            {/* Icon */}
            <div className="w-24 h-24 bg-white rounded-full shadow-xl flex items-center justify-center">
              <span className="text-4xl font-bold text-brand-primary">
                {category.titleEn.charAt(0)}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 text-white">
              <h1 className="text-4xl font-bold mb-2">{category.titleEn}</h1>
              <p className="text-xl text-white/90 mb-3">Yadplast - Quality Fresh Food</p>
              <div className="flex items-center gap-4 text-sm text-white/80">
                <span>{category.products.length} Products</span>
                <span>•</span>
                <span className="capitalize">{category.section}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="bg-brand-light min-h-screen">
        <div className="mx-auto max-w-7xl px-4 py-8">
          {category.products.length === 0 ? (
            // No products yet
            <div className="text-center py-24">
              <div className="w-24 h-24 mx-auto mb-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-12 h-12 text-brand-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-brand-dark mb-3">No Products Yet</h2>
              <p className="text-brand-secondary mb-6">This category is getting ready! Check back soon.</p>
              <Link 
                href="/"
                className="inline-block px-6 py-3 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-secondary transition-colors"
              >
                Browse Other Categories
              </Link>
            </div>
          ) : (
            <>
              {/* Products Header */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-brand-dark">{category.titleEn}</h2>
                <p className="text-brand-secondary">{category.products.length} items available</p>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {category.products.map((product) => (
                  <ProductCard 
                    key={product.id}
                    id={product.id}
                    slug={product.slug}
                    name={product.nameEn}
                    price={product.priceCents / 100}
                    imageUrl={product.imageUrl}
                    inStock={product.inStock}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="py-8 text-white bg-gradient-to-r from-brand-primary to-brand-secondary">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h3 className="text-2xl font-bold mb-2">Yadplast</h3>
          <p className="text-white/80">Your trusted source for quality fresh food</p>
        </div>
      </div>
    </div>
  );
}
