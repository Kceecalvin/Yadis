import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import Image from 'next/image';

interface Props { params: { slug: string } }

export default async function ProductPage({ params }: Props) {
  const product = await prisma.product.findUnique({ where: { slug: params.slug }, include: { category: { select: { slug: true } } } });
  if (!product) return notFound();
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 grid md:grid-cols-2 gap-8">
      <img src={product.imageUrl} alt={product.nameEn} className="aspect-square w-full object-cover rounded-lg" />
      <div>
        <h1 className="text-3xl font-bold">{product.nameEn}</h1>
        <div className="mt-2 text-slate-600">{product.descriptionEn}</div>
        <div className="mt-4 text-2xl font-extrabold text-brand-primary">KES {(product.priceCents / 100).toLocaleString()}</div>
        <form className="mt-6 flex gap-2">
          <input type="number" min={1} defaultValue={1} className="w-24 border rounded px-3 py-2" />
          <button className="px-5 py-3 bg-brand-primary text-white rounded">Add to Cart</button>
        </form>
        <div className="mt-6 flex gap-3">
          <button className="px-4 py-2 border rounded">Order via WhatsApp</button>
        </div>
      </div>
    </div>
  );
}
