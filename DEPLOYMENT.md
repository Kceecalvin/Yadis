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

### Step 2: Deploy to Vercel

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
   - Build Command: `pnpm build` (auto-detected)
   - Output Directory: `.next` (auto-detected)
   - Install Command: `pnpm install` (auto-detected)

4. **Environment Variables** (Optional for basic demo):
   For basic demo, you can skip this. The site will work with SQLite.
   
   For production with PostgreSQL:
   - Click "Environment Variables"
   - Add:
     ```
     DATABASE_PROVIDER=postgresql
     DATABASE_URL=postgresql://...your-connection-string...
     ```

5. **Deploy:**
   - Click "Deploy"
   - Wait 2-3 minutes for build
   - Your site will be live at: `https://your-project.vercel.app`

### Step 3: Set Up Database (For Production)

**Option A: Use SQLite (Quick Demo)**
- No setup needed
- Database will be created automatically
- Perfect for demo/testing
- ⚠️ Note: Data resets on each deployment

**Option B: Use PostgreSQL (Production)**

1. **Get Free PostgreSQL from Neon:**
   - Go to https://neon.tech
   - Sign up for free
   - Create a new project
   - Copy the connection string

2. **Add to Vercel:**
   - Go to your Vercel project → Settings → Environment Variables
   - Add:
     ```
     DATABASE_PROVIDER=postgresql
     DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
     ```
   - Redeploy

3. **Run migrations:**
   ```bash
   # Connect to production database
   DATABASE_URL="postgresql://..." npx prisma migrate deploy
   DATABASE_URL="postgresql://..." npx tsx prisma/seed.ts
   ```

### Step 4: Test Your Site

Visit your Vercel URL and test:
- ✅ Browse products
- ✅ Search functionality
- ✅ Add items to cart
- ✅ AI Chatbot
- ✅ AI Recommendations
- ✅ Mobile responsive

## Troubleshooting

**Build fails:**
- Check build logs in Vercel
- Ensure all dependencies are in package.json
- Verify Node version compatibility

**Database errors:**
- For SQLite: ensure DATABASE_URL=file:./production.db
- For PostgreSQL: verify connection string format
- Check environment variables are set correctly

**Images not loading:**
- Images from Unsplash should work automatically
- For custom uploads: ensure public/uploads exists

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
