import { prisma } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import fs from 'node:fs/promises';
import path from 'node:path';

export const dynamic = 'force-dynamic';

async function ensureUploadsDir() {
  const dir = path.join(process.cwd(), 'public', 'uploads');
  try { await fs.mkdir(dir, { recursive: true }); } catch {}
  return dir;
}

async function updateProduct(formData: FormData) {
  'use server';
  const id = String(formData.get('id') || '');
  const nameEn = String(formData.get('nameEn') || '').trim();
  const nameSw = String(formData.get('nameSw') || '').trim();
  const descriptionEn = String(formData.get('descriptionEn') || '').trim();
  const descriptionSw = String(formData.get('descriptionSw') || '').trim();
  const price = Number(formData.get('price') || 0);
  const categoryId = String(formData.get('categoryId') || '').trim();
  const slug = String(formData.get('slug') || '').trim();
  const imageFile = formData.get('image') as File | null;
  let imageUrl = String(formData.get('imageUrl') || '').trim();

  if (!id) throw new Error('Missing id');

  if (imageFile && typeof imageFile !== 'string' && imageFile.size > 0) {
    const uploadsDir = await ensureUploadsDir();
    const fileBuf = Buffer.from(await imageFile.arrayBuffer());
    const ext = (imageFile.name.split('.').pop() || 'png').toLowerCase();
    const filename = `${slug || id}-${Date.now()}.${ext}`.replace(/[^a-z0-9_.-]/gi, '');
    const filePath = path.join(uploadsDir, filename);
    await fs.writeFile(filePath, fileBuf);
    imageUrl = `/uploads/${filename}`;
  }

  await prisma.product.update({
    where: { id },
    data: {
      slug: slug || undefined,
      nameEn: nameEn || undefined,
      nameSw: nameSw || undefined,
      descriptionEn: descriptionEn || null,
      descriptionSw: descriptionSw || null,
      priceCents: price ? Math.round(price * 100) : undefined,
      imageUrl: imageUrl || undefined,
      categoryId: categoryId || undefined,
    },
  });

  revalidatePath('/admin/products');
  redirect('/admin/products');
}

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return notFound();
  const categories = await prisma.category.findMany({ orderBy: { titleEn: 'asc' } });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
      <form action={updateProduct} className="grid gap-4" encType="multipart/form-data">
        <input type="hidden" name="id" value={product.id} />
        <div className="grid md:grid-cols-2 gap-4">
          <label className="grid gap-1">
            <span className="text-sm font-medium">Name (English)</span>
            <input name="nameEn" defaultValue={product.nameEn} className="border rounded px-3 py-2" />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-medium">Name (Swahili)</span>
            <input name="nameSw" defaultValue={product.nameSw} className="border rounded px-3 py-2" />
          </label>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <label className="grid gap-1">
            <span className="text-sm font-medium">Slug</span>
            <input name="slug" defaultValue={product.slug} className="border rounded px-3 py-2" />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-medium">Price (KES)</span>
            <input name="price" type="number" min="0" step="0.01" defaultValue={(product.priceCents/100).toString()} className="border rounded px-3 py-2" />
          </label>
        </div>
        <label className="grid gap-1">
          <span className="text-sm font-medium">Category</span>
          <select name="categoryId" defaultValue={product.categoryId} className="border rounded px-3 py-2">
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.titleEn}</option>
            ))}
          </select>
        </label>
        <div className="grid md:grid-cols-2 gap-4">
          <label className="grid gap-1">
            <span className="text-sm font-medium">Upload Image</span>
            <input type="file" name="image" accept="image/*" className="border rounded px-3 py-2" />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-medium">Or Image URL</span>
            <input name="imageUrl" placeholder="https://... or /uploads/..." className="border rounded px-3 py-2" />
          </label>
        </div>
        <div className="grid gap-2">
          <span className="text-sm font-medium">Current Image</span>
          <img src={product.imageUrl} alt={product.nameEn} className="w-48 h-48 object-cover rounded" />
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded bg-brand-primary text-white" type="submit">Save</button>
          <a href="/admin/products" className="px-4 py-2 rounded border">Cancel</a>
        </div>
      </form>
    </div>
  );
}
