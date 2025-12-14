import Link from 'next/link';

export default function AdminHome() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid md:grid-cols-3 gap-4">
        <Link href="/admin/products" className="border rounded p-6 hover:bg-slate-50">Manage Products</Link>
        <Link href="/admin/categories" className="border rounded p-6 hover:bg-slate-50">Manage Categories</Link>
        <Link href="/admin/promotions" className="border rounded p-6 hover:bg-slate-50">Promotions</Link>
      </div>
    </div>
  );
}
