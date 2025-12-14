import { prisma } from '@/lib/db';
import Link from 'next/link';

export default async function AdminProducts() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <div className="flex gap-2">
          <Link href="/admin/products/new" className="px-4 py-2 rounded bg-brand-primary text-white">Add Product</Link>
          <form action="/api/dev/fix-images" method="post">
            <button className="px-4 py-2 rounded border" type="submit">Fix Image URLs</button>
          </form>
        </div>
      </div>
      <div className="grid gap-3">
        {products.map((p) => (
          <div key={p.id} className="border rounded p-4 flex items-center justify-between">
            <div>
              <div className="font-semibold">{p.nameEn}</div>
              <div className="text-sm text-slate-600">KES {(p.priceCents / 100).toLocaleString()}</div>
            </div>
            <div className="flex gap-2">
              <Link href={`/admin/products/${p.id}`} className="px-3 py-1 border rounded">Edit</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
