# Deployment Guide to Vercel

## Quick Deploy (5 minutes)

### Step 1: Push to GitHub

1. **Create a new repository on GitHub:**
   - Go to https://github.com/new
   - Name: `ecommerce-store` (or your preferred name)
   - Make it Public or Private
   - Don't initialize with README (we already have files)
   - Click "Create repository"

2. **Push your code:**
   ```bash
   cd ~/ecommerce-store
   git remote add origin https://github.com/YOUR_USERNAME/ecommerce-store.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Set Up Database FIRST (Required for Vercel)

⚠️ **IMPORTANT**: Vercel's serverless environment doesn't support SQLite. You MUST use PostgreSQL for production.

**Get Free PostgreSQL from Neon (Recommended):**

1. Go to https://neon.tech
2. Sign up for free (no credit card required)
3. Create a new project (e.g., "ecommerce-store")
4. Copy the connection string (looks like: `postgresql://user:pass@host/db`)

### Step 3: Deploy to Vercel

1. **Go to Vercel:**
   - Visit https://vercel.com
   - Sign up / Log in with GitHub

2. **Import Project:**
   - Click "Add New..." → "Project"
   - Select your `ecommerce-store` repository
   - Click "Import"

3. **Configure Project:**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (leave default)
   - Build Command: Leave default (uses package.json script)
   - Output Directory: `.next` (auto-detected)
   - Install Command: Leave default

4. **Environment Variables** (REQUIRED):
   - Click "Environment Variables"
   - Add the following:
     ```
     DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require
     NEXT_PUBLIC_SITE_URL=https://your-project.vercel.app
     ```
   - Replace `DATABASE_URL` with your Neon connection string

5. **Deploy:**
   - Click "Deploy"
   - Wait 2-3 minutes for build
   - The build will automatically run migrations and create tables
   - Your site will be live at: `https://your-project.vercel.app`

### Step 4: Seed the Database (Add Sample Products)

After your first successful deployment:

1. **Option A: Run seed script locally** (Recommended):
   ```bash
   cd ecommerce-store
   # Set your production database URL
   export DATABASE_URL="postgresql://your-connection-string"
   npm run prisma:seed
   ```

2. **Option B: Add products manually**:
   - Visit `https://your-project.vercel.app/admin/products/new`
   - Add products through the admin interface

3. **Verify**:
   - Visit your site at `https://your-project.vercel.app`
   - You should see products on the homepage

### Step 5: Test Your Site

Visit your Vercel URL and test:
- ✅ Browse products
- ✅ Search functionality
- ✅ Add items to cart
- ✅ AI Chatbot
- ✅ AI Recommendations
- ✅ Mobile responsive

## Troubleshooting

**Build fails with "table does not exist":**
- ✅ **Fixed in latest version**: The build script now runs `prisma migrate deploy`
- Make sure you have the latest `package.json` with updated build script
- Ensure `DATABASE_URL` environment variable is set in Vercel
- The migrations will run automatically during build

**Build fails with "Invalid connection string":**
- Verify your `DATABASE_URL` is correct
- Format should be: `postgresql://user:pass@host:5432/dbname?sslmode=require`
- Make sure there are no extra spaces or quotes

**Build succeeds but no products showing:**
- Run the seed script to add sample products (see Step 4 above)
- Or manually add products via `/admin/products/new`

**Database connection errors:**
- For PostgreSQL: verify connection string format
- Check that your Neon database is active
- Ensure environment variables are set correctly in Vercel

**Images not loading:**
- Images from Unsplash should work automatically
- For custom uploads: ensure public/uploads exists
- Check Vercel logs for any image optimization errors

## Custom Domain (Optional)

1. Go to Vercel project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

## Continuous Deployment

Every push to `main` branch will automatically deploy to Vercel!

```bash
git add .
git commit -m "Update features"
git push origin main
```

## Support

Need help? Check:
- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Prisma Docs: https://www.prisma.io/docs
