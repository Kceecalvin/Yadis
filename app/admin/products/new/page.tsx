import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import fs from 'node:fs/promises';
import path from 'node:path';

export const dynamic = 'force-dynamic';

async function ensureUploadsDir() {
  const dir = path.join(process.cwd(), 'public', 'uploads');
  try { await fs.mkdir(dir, { recursive: true }); } catch {}
  return dir;
}

async function getCategories() {
  return prisma.category.findMany({ orderBy: { titleEn: 'asc' } });
}

async function createProduct(formData: FormData) {
  'use server';
  const nameEn = String(formData.get('nameEn') || '').trim();
  const nameSw = String(formData.get('nameSw') || '').trim();
  const descriptionEn = String(formData.get('descriptionEn') || '').trim();
  const descriptionSw = String(formData.get('descriptionSw') || '').trim();
  const price = Number(formData.get('price') || 0);
  const categoryId = String(formData.get('categoryId') || '').trim();
  const slug = String(formData.get('slug') || '').trim();
  const imageFile = formData.get('image') as File | null;
  let imageUrl = String(formData.get('imageUrl') || '').trim();

  if (!nameEn || !nameSw || !slug || !categoryId || !price) {
    throw new Error('Missing required fields');
  }

  if (imageFile && typeof imageFile !== 'string' && imageFile.size > 0) {
    const uploadsDir = await ensureUploadsDir();
    const fileBuf = Buffer.from(await imageFile.arrayBuffer());
    const ext = (imageFile.name.split('.').pop() || 'png').toLowerCase();
    const filename = `${slug}-${Date.now()}.${ext}`.replace(/[^a-z0-9_.-]/gi, '');
    const filePath = path.join(uploadsDir, filename);
    await fs.writeFile(filePath, fileBuf);
    imageUrl = `/uploads/${filename}`;
  }

  if (!imageUrl) {
    imageUrl = '/images/food/chips-masala.svg';
  }

  await prisma.product.create({
    data: {
      slug,
      nameEn,
      nameSw,
      descriptionEn: descriptionEn || null,
      descriptionSw: descriptionSw || null,
      priceCents: Math.round(price * 100),
      imageUrl,
      categoryId,
    },
  });

  revalidatePath('/admin/products');
  redirect('/admin/products');
}

export default async function NewProductPage() {
  const categories = await getCategories();
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Add Product</h1>
      <form action={createProduct} className="grid gap-4" encType="multipart/form-data">
        <div className="grid md:grid-cols-2 gap-4">
          <label className="grid gap-1">
            <span className="text-sm font-medium">Name (English)</span>
            <input name="nameEn" className="border rounded px-3 py-2" required />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-medium">Name (Swahili)</span>
            <input name="nameSw" className="border rounded px-3 py-2" required />
          </label>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <label className="grid gap-1">
            <span className="text-sm font-medium">Slug</span>
            <input name="slug" className="border rounded px-3 py-2" placeholder="e.g. deluxe-bucket-20l" required />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-medium">Price (KES)</span>
            <input name="price" type="number" min="0" step="0.01" className="border rounded px-3 py-2" required />
          </label>
        </div>
        <label className="grid gap-1">
          <span className="text-sm font-medium">Category</span>
          <select name="categoryId" className="border rounded px-3 py-2" required>
            <option value="">Select category</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.titleEn}</option>
            ))}
          </select>
        </label>
        <div className="grid md:grid-cols-2 gap-4">
          <label className="grid gap-1">
            <span className="text-sm font-medium">Description (English)</span>
            <textarea name="descriptionEn" className="border rounded px-3 py-2" rows={3} />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-medium">Description (Swahili)</span>
            <textarea name="descriptionSw" className="border rounded px-3 py-2" rows={3} />
          </label>
        </div>
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
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded bg-brand-primary text-white" type="submit">Create</button>
          <a href="/admin/products" className="px-4 py-2 rounded border">Cancel</a>
        </div>
      </form>
    </div>
  );
}
