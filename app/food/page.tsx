import { prisma } from '@/lib/db';
import Link from 'next/link';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

const categoryImages: Record<string, string> = {
  'ice-cream': 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=400&q=80',
  'cakes-pastries-pizza': 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=400&q=80',
  'yogurt-juices': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=400&q=80',
  'snacks': 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=400&q=80',
  'hot-meals': 'https://images.unsplash.com/photo-1585109649139-e9f5a5f5b4f9?auto=format&fit=crop&w=400&q=80',
};

export default async function FoodPage() {
  const categories = await prisma.category.findMany({
    where: { section: 'FOOD' },
    orderBy: { titleEn: 'asc' },
  }).catch(() => []);

  return (
    <div className="min-h-screen bg-brand-light">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white py-12">
        <div className="mx-auto max-w-7xl px-4">
          <h1 className="text-4xl font-bold mb-3">Food & Beverages</h1>
          <p className="text-lg text-white/90">
            Fresh food, delicious treats, and refreshing beverages - all delivered to your door
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-brand-dark mb-2">Choose a Category</h2>
          <p className="text-brand-secondary">Select from our wide variety of food items</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/shop/${category.slug}`}
              className="group"
            >
              <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-all border border-brand-accent/20">
                {/* Category Image */}
                <div className="relative w-full h-48 bg-brand-light overflow-hidden">
                  <img
                    src={categoryImages[category.slug] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'}
                    alt={category.titleEn}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>

                {/* Category Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-brand-dark mb-2">{category.titleEn}</h3>
                  <p className="text-sm text-brand-secondary mb-4">
                    {category.descriptionEn || 'Browse our selection'}
                  </p>
                  <button className="w-full px-4 py-2 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-secondary transition-colors">
                    Browse Items
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-brand-secondary text-lg">No food categories available</p>
          </div>
        )}
      </div>
    </div>
  );
}
