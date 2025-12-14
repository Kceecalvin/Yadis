# 🚀 Vercel Deployment Checklist

## ✅ Fixes Applied (Already Done)

- [x] Updated build script to run database migrations
- [x] Created debug page files to prevent prerender errors
- [x] Changed database provider from SQLite to PostgreSQL
- [x] Updated documentation with PostgreSQL setup instructions
- [x] Created quick setup guide (VERCEL_SETUP.md)

## 📋 Your Action Items

### Step 1: Set Up PostgreSQL Database (5 minutes)

**Option A: Neon (Recommended - Free)**
1. Go to: https://neon.tech
2. Sign up (no credit card required)
3. Click "Create Project"
4. Project name: `ecommerce-store`
5. Region: Choose closest to your users
6. Click "Create Project"
7. Copy the connection string (looks like: `postgresql://user:pass@...`)

**Option B: Vercel Postgres**
1. In Vercel dashboard → Your Project → Storage
2. Click "Create Database" → Select "Postgres"
3. Copy the connection string

### Step 2: Commit and Push Changes

```bash
cd ~/ecommerce-store

# Add all changes
git add .

# Commit with descriptive message
git commit -m "Fix: Add database migrations to build script and switch to PostgreSQL

- Updated build script to run 'prisma migrate deploy'
- Created debug page components to prevent prerender errors
- Switched from SQLite to PostgreSQL for production compatibility
- Enhanced deployment documentation with PostgreSQL setup guide"

# Push to trigger deployment
git push origin main
```

### Step 3: Configure Vercel Environment Variables

1. Go to: https://vercel.com
2. Open your project
3. Go to: **Settings → Environment Variables**
4. Add this variable:
   - **Name**: `DATABASE_URL`
   - **Value**: `postgresql://user:password@host:5432/dbname?sslmode=require`
   - **Environment**: Select all (Production, Preview, Development)
5. Click "Save"

### Step 4: Redeploy (if already deployed)

If you already have a deployment:
1. Go to: **Deployments** tab
2. Click the 3 dots on the latest deployment
3. Click "Redeploy"

OR just push your changes (from Step 2) and it will auto-deploy.

### Step 5: Monitor the Build

Watch the build logs:
1. Go to your project in Vercel
2. Click on the latest deployment
3. Watch for these success messages:
   - ✅ `Running "prisma generate"`
   - ✅ `Running "prisma migrate deploy"`
   - ✅ `Compiled successfully`
   - ✅ `Generating static pages`

### Step 6: Seed the Database

After successful deployment:

```bash
# Set your production DATABASE_URL
export DATABASE_URL="postgresql://your-connection-string"

# Run the seed script
cd ~/ecommerce-store
npm run prisma:seed
```

### Step 7: Verify Deployment

Visit your site and check:
- [ ] Homepage loads: `https://your-project.vercel.app`
- [ ] Products page loads: `https://your-project.vercel.app/products`
- [ ] Debug page loads: `https://your-project.vercel.app/debug/products`
- [ ] Products are visible on homepage (after seeding)
- [ ] Search works
- [ ] Categories work

## 🐛 Troubleshooting

### If build still fails with "table does not exist":
1. Verify `DATABASE_URL` is set in Vercel environment variables
2. Make sure you've pushed the latest changes (with updated package.json)
3. Check that the DATABASE_URL format is correct (PostgreSQL, not SQLite)

### If build succeeds but site is empty:
1. Run the seed script (Step 6 above)
2. Or manually add products via: `https://your-project.vercel.app/admin/products/new`

### If connection errors:
1. Verify your database is active (Neon dashboard)
2. Check DATABASE_URL has `?sslmode=require` at the end
3. Ensure no extra spaces in the connection string

## 📚 Documentation

- **Full Guide**: See `DEPLOYMENT.md`
- **Quick Reference**: See `VERCEL_SETUP.md`
- **Technical Details**: See `FIXES_APPLIED.md`

## ✨ You're All Set!

Once completed, your e-commerce store will be live and fully functional on Vercel!

Questions? Check the documentation files above.
