# 🚀 Deployment Guide - GitHub & Vercel

## Prerequisites
- GitHub account
- Vercel account (sign up at vercel.com)
- Database (Neon, PlanetScale, or Supabase)

## Step 1: Prepare for Deployment

### Clean up temporary files
```bash
rm -f tmp_rovodev_*.* test-*.js check-*.js debug-*.js
rm -f /tmp/next-server.log
```

### Create .gitignore (if not exists)
```bash
cat >> .gitignore << 'GITIGNORE'
# Environment
.env.local
.env*.local

# Logs
*.log
/tmp/

# Testing files
tmp_rovodev_*
test-*.js
check-*.js
debug-*.js
GITIGNORE
```

## Step 2: Push to GitHub

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Complete gamification system with referral rewards"

# Add remote (replace with your repo)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Vercel

### Option A: Via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Option B: Via Vercel Dashboard (Recommended)
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: .next

## Step 4: Configure Environment Variables on Vercel

Add these in Vercel Dashboard → Settings → Environment Variables:

```env
# Database
DATABASE_URL=your_production_database_url

# NextAuth
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=generate_new_with_openssl_rand_base64_32

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Optional: Email/SMS (if configured)
RESEND_API_KEY=your_resend_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number
```

## Step 5: Update Google OAuth Redirect URIs

In Google Cloud Console, add:
- https://your-app.vercel.app/api/auth/callback/google

## Step 6: Run Database Migrations on Production

```bash
# Push schema to production database
npx prisma db push

# Seed data (optional)
npx tsx prisma/seed-referral-gamification.ts
```

## Step 7: Verify Deployment

Test these URLs:
- https://your-app.vercel.app
- https://your-app.vercel.app/auth/signin
- https://your-app.vercel.app/referral-new
- https://your-app.vercel.app/rewards

## 🔧 Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in package.json
- Run `npm run build` locally first

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check database allows connections from Vercel IPs
- For Neon: Enable connection pooling

### OAuth Not Working
- Verify redirect URIs in Google Console
- Check NEXTAUTH_URL matches your domain
- Ensure NEXTAUTH_SECRET is set

## 📊 Post-Deployment Checklist

- [ ] Test user signup flow
- [ ] Test Google OAuth
- [ ] Test referral system
- [ ] Verify points system works
- [ ] Check rewards redemption
- [ ] Test on mobile devices
- [ ] Set up monitoring (Vercel Analytics)
- [ ] Configure custom domain (optional)

## 🎉 You're Live!

Share your referral link:
https://your-app.vercel.app/signup?ref=YOUR_CODE

