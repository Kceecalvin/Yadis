# 🚀 Quick Deployment to Vercel

## Option 1: Deploy via Vercel CLI (Fastest - 2 minutes)

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
cd ~/ecommerce-store
vercel

# Follow prompts:
# - Link to existing project? N
# - What's your project's name? your-store (or any name)
# - In which directory is your code located? ./
# - Want to override settings? N

# Your site will be live at: https://your-store-xxx.vercel.app
```

## Option 2: Deploy via GitHub + Vercel Dashboard (3 minutes)

### Step 1: Push to GitHub
```bash
# Create repo at: https://github.com/new
# Then run:
cd ~/ecommerce-store
git remote add origin https://github.com/YOUR_USERNAME/ecommerce-store.git
git branch -M main
git push -u origin main
```

### Step 2: Import to Vercel
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Click "Deploy"
4. Done! Your site is live

## Option 3: Deploy with ZIP Upload

1. Zip the ecommerce-store folder
2. Go to https://vercel.com/new
3. Choose "Deploy from ZIP"
4. Upload and deploy

## What's Deployed?

✅ Full e-commerce website
✅ AI Shopping Assistant Chatbot
✅ Shopping Cart functionality
✅ AI Product Recommendations
✅ Search with instant results
✅ 15+ sample products (Food & Household)
✅ Mobile responsive design
✅ Brown minimalist theme

## After Deployment

Your site will have these features working immediately:
- Browse products by category
- Search for items
- Chat with AI assistant
- Add items to cart
- View cart and proceed to checkout
- Get AI recommendations

## Next Steps (Optional)

1. **Add Custom Domain:**
   - Vercel Dashboard → Settings → Domains
   - Add yourstore.com

2. **Set up PostgreSQL** (for production persistence):
   - Get free DB from https://neon.tech
   - Add DATABASE_URL to Vercel env vars
   - Redeploy

3. **Configure Payments:**
   - Add Stripe keys
   - Add M-Pesa credentials
   - Enable checkout

## Need Help?

See full deployment guide: DEPLOYMENT.md
