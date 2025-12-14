import { prisma } from '@/lib/db';

export default async function DebugProducts() {
  const products = await prisma.product.findMany({ include: { category: true }, orderBy: { createdAt: 'desc' } });
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Debug Products</h1>
      <div className="grid gap-3">
        {products.map((p) => (
          <div key={p.id} className="border rounded p-4 flex items-center gap-4">
            <img src={p.imageUrl || '/images/logo.svg'} alt={p.nameEn} className="w-20 h-20 object-cover rounded" />
            <div>
              <div className="font-semibold">{p.nameEn}</div>
              <div className="text-xs text-slate-500">Slug: {p.slug} | Category: {p.category?.slug}</div>
              <div className="text-xs break-all">{p.imageUrl}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
