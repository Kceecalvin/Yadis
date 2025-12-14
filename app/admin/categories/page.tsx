import { prisma } from '@/lib/db';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminCategories() {
  const categories = await prisma.category.findMany({ orderBy: { titleEn: 'asc' } }).catch(() => []);
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Link href="/admin/categories/new" className="px-4 py-2 rounded bg-brand-primary text-white">Add Category</Link>
      </div>
      <div className="grid gap-3">
        {categories.map((c) => (
          <div key={c.id} className="border rounded p-4 flex items-center justify-between">
            <div>
              <div className="font-semibold">{c.titleEn}</div>
              <div className="text-xs text-slate-500">Slug: {c.slug}</div>
            </div>
            <Link href={`/admin/categories/${c.id}`} className="px-3 py-1 border rounded">Edit</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
