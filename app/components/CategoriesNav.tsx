'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Category {
  id: string;
  slug: string;
  titleEn: string;
}

interface CategoriesNavProps {
  categories: Category[];
}

export default function CategoriesNav({ categories }: CategoriesNavProps) {
  const pathname = usePathname();

  const isActive = (slug: string) => {
    return pathname === `/shop/${slug}` || (pathname === '/feed' && slug === 'all');
  };

  return (
    <nav className="bg-white border-b border-brand-accent/20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex overflow-x-auto gap-2 py-3 pb-2">
          <Link
            href="/feed"
            className={`px-4 py-2 rounded-full font-semibold whitespace-nowrap transition-all ${
              pathname === '/feed'
                ? 'bg-brand-primary text-white'
                : 'bg-brand-light text-brand-dark hover:bg-brand-accent/20'
            }`}
          >
            All
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/shop/${category.slug}`}
              className={`px-4 py-2 rounded-full font-semibold whitespace-nowrap transition-all ${
                isActive(category.slug)
                  ? 'bg-brand-primary text-white'
                  : 'bg-brand-light text-brand-dark hover:bg-brand-accent/20'
              }`}
            >
              {category.titleEn}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
