# Quick Vercel Setup Guide

## 🚀 Quick Setup (5 minutes)

### 1. Get PostgreSQL Database (Required)

Vercel doesn't support SQLite, so you need PostgreSQL:

**Free Option: Neon.tech**
1. Visit: https://neon.tech
2. Sign up (no credit card needed)
3. Create new project → Copy connection string

**Alternative: Vercel Postgres**
1. In Vercel project → Storage → Create Database
2. Select "Postgres" → Copy connection string

### 2. Set Environment Variables in Vercel

Go to: **Project Settings → Environment Variables**

Add this variable:

```
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require
```

Replace with your actual connection string from Neon.

### 3. Deploy

Click **"Deploy"** or push to main branch.

The build will automatically:
- ✅ Install dependencies
- ✅ Generate Prisma Client
- ✅ Run database migrations (create tables)
- ✅ Build Next.js app

### 4. Seed Sample Products

After first deployment, run locally:

```bash
export DATABASE_URL="your-production-connection-string"
npm run prisma:seed
```

Or add products manually via `/admin/products/new`

## ✅ Verification Checklist

- [ ] PostgreSQL database created (Neon or Vercel Postgres)
- [ ] `DATABASE_URL` environment variable set in Vercel
- [ ] Build completed successfully
- [ ] Website loads (even if empty)
- [ ] Sample products added via seed script or admin panel
- [ ] Products visible on homepage

## 🐛 Common Issues

### Error: "table does not exist"
- **Solution**: Make sure `DATABASE_URL` is set in Vercel environment variables
- The build script automatically runs migrations if DATABASE_URL is set

### Error: "Invalid connection string"
- **Solution**: Check your DATABASE_URL format
- Should be: `postgresql://user:pass@host:5432/db?sslmode=require`
- No extra spaces or quotes

### Build succeeds but site is empty
- **Solution**: Run the seed script to add sample products
- Or add products manually via admin panel

## 📝 Environment Variables Reference

| Variable | Required | Example |
|----------|----------|---------|
| `DATABASE_URL` | ✅ Yes | `postgresql://...?sslmode=require` |
| `NEXT_PUBLIC_SITE_URL` | Optional | `https://your-store.vercel.app` |
| `STRIPE_PUBLIC_KEY` | Optional | `pk_live_...` (for payments) |
| `STRIPE_SECRET_KEY` | Optional | `sk_live_...` (for payments) |

## 🔄 Continuous Deployment

Every push to `main` branch automatically deploys to Vercel!

```bash
git add .
git commit -m "Update products"
git push origin main
```

## 🎉 You're Done!

Your e-commerce store is now live on Vercel!

- 🌐 Visit: `https://your-project.vercel.app`
- 🛠️ Admin: `https://your-project.vercel.app/admin/products`
- 📊 Debug: `https://your-project.vercel.app/debug/products`
