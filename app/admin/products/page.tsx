import { prisma } from '@/lib/db';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminProducts() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } }).catch(() => []);
  
  return (
    <div className="min-h-screen bg-brand-light py-10">
      <div className="mx-auto max-w-7xl px-4">
        {/* Back Button */}
        <Link href="/admin" className="text-brand-primary hover:text-brand-secondary mb-4 inline-block font-semibold">
          ← Back to Admin Dashboard
        </Link>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-brand-dark">Manage Products</h1>
            <p className="text-brand-secondary mt-2">Add, edit, and manage your products</p>
          </div>
          <div className="flex gap-3">
            <Link 
              href="/admin/products/new" 
              className="px-6 py-3 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-secondary transition-colors"
            >
              + New Product
            </Link>
            <form action="/api/dev/fix-images" method="post">
              <button 
                className="px-6 py-3 bg-brand-light border border-brand-primary/30 text-brand-primary rounded-lg font-semibold hover:bg-brand-primary/10 transition-colors" 
                type="submit"
              >
                Fix Image URLs
              </button>
            </form>
          </div>
        </div>

        {/* Products Table */}
        {products.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md border border-brand-accent/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-brand-light border-b border-brand-accent/20">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-brand-dark">Product Name</th>
                    <th className="px-6 py-4 text-left font-semibold text-brand-dark">Price</th>
                    <th className="px-6 py-4 text-left font-semibold text-brand-dark">Stock</th>
                    <th className="px-6 py-4 text-left font-semibold text-brand-dark">Category</th>
                    <th className="px-6 py-4 text-left font-semibold text-brand-dark">Created</th>
                    <th className="px-6 py-4 text-left font-semibold text-brand-dark">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-b border-brand-accent/10 hover:bg-brand-light/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-brand-dark">{p.nameEn}</td>
                      <td className="px-6 py-4 font-semibold text-brand-primary">KES {(p.priceCents / 100).toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-brand-secondary">{p.stockCount || 0} units</td>
                      <td className="px-6 py-4 text-sm text-brand-secondary">{p.categoryId || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-brand-secondary">{new Date(p.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Link 
                            href={`/admin/products/${p.id}`} 
                            className="px-3 py-1 bg-brand-primary/10 text-brand-primary rounded text-sm hover:bg-brand-primary/20 transition-colors"
                          >
                            Edit
                          </Link>
                          <button
                            className="px-3 py-1 bg-red-100 text-red-600 rounded text-sm hover:bg-red-200 transition-colors"
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this product?')) {
                                // TODO: Implement delete
                              }
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md border border-brand-accent/20 p-8 text-center">
            <p className="text-brand-secondary mb-4">No products yet</p>
            <Link
              href="/admin/products/new"
              className="inline-block px-6 py-3 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-secondary transition-colors"
            >
              Create Your First Product
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
