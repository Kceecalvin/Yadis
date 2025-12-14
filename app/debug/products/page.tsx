import { prisma } from '@/lib/db';

export default async function DebugProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      category: true,
    },
    take: 10,
  });

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Debug: Products</h1>
      <pre className="bg-gray-100 p-4 rounded overflow-auto">
        {JSON.stringify(products, null, 2)}
      </pre>
    </div>
  );
}
