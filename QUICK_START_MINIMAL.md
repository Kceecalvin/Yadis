# ⚡ Yadplast - Quick Start (Minimal Cost)

**Total Setup Time:** 15 minutes  
**Total Cost:** $0 (using free tiers)

---

## 🎯 30-Second Overview

```bash
# 1. Clone/Navigate to project
cd ecommerce-store

# 2. Run setup script
bash setup-minimal-cost.sh

# 3. Add API keys to .env.local
# (See Step 1-3 below)

# 4. Start development
pnpm dev

# 5. Deploy
vercel  # or railway/render
```

---

## 📋 Step-by-Step (15 minutes)

### **Step 1: Get Resend Email Key (5 min) - FREE**

```bash
# Go to: https://resend.com
# 1. Sign up
# 2. Verify email
# 3. Dashboard → API Keys → Create
# 4. Copy key (starts with "re_")
```

Add to `.env.local`:
```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_your_key_here
```

**Cost:** $0 (100 emails/day free)

---

### **Step 2: Get Africa's Talking SMS Key (5 min) - FREE**

```bash
# Go to: https://africastalking.com
# 1. Sign up
# 2. Verify email
# 3. Complete KYC (5-10 min form)
# 4. Settings → API Key
# 5. Copy key
```

Add to `.env.local`:
```env
SMS_PROVIDER=africas-talking
AFRICAS_TALKING_API_KEY=your_key_here
AFRICAS_TALKING_USERNAME=YadplastStore
```

**Cost:** Pay-as-you-go (~KES 0.50/SMS) - NO monthly fee

---

### **Step 3: Setup Local Redis (3 min) - FREE**

**Option A: Using Docker (RECOMMENDED)**
```bash
docker run -d -p 6379:6379 --name yadplast-redis redis:latest
```

**Option B: Direct installation**
```bash
# macOS
brew install redis && redis-server

# Ubuntu
sudo apt-get install redis-server && redis-server

# Windows: Download from https://redis.io/download
```

Add to `.env.local`:
```env
REDIS_URL=redis://localhost:6379
```

**Cost:** $0 (self-hosted)

---

### **Step 4: Complete .env.local**

```bash
# Copy template
cp .env.integrations.example .env.local

# Edit with your keys
nano .env.local  # or use your editor
```

Minimal required:
```env
DATABASE_URL=postgresql://...  # Already set
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_...
SMS_PROVIDER=africas-talking
AFRICAS_TALKING_API_KEY=...
AFRICAS_TALKING_USERNAME=YadplastStore
REDIS_URL=redis://localhost:6379
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret
```

---

### **Step 5: Test Everything**

```bash
# Start dev server
pnpm dev

# In another terminal, run tests
pnpm test

# Expected output: 50 passed ✓
```

---

## 🚀 Deploy to Production (FREE)

### **Option A: Vercel (EASIEST)**

```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
vercel

# It will:
# 1. Ask where to deploy
# 2. Connect your GitHub repo
# 3. Auto-deploy on every push
# Cost: $0 (Hobby tier)
```

### **Option B: Railway ($5/month free credit)**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway link
railway up

# Cost: $0 (free monthly credit covers everything)
```

### **Option C: Render**

```bash
# Go to https://render.com
# 1. Connect GitHub
# 2. New → Web Service
# 3. Select your repo
# 4. Deploy
# Cost: $0 (free tier available)
```

---

## 💰 Cost Breakdown

| Service | Free Tier | Cost |
|---------|-----------|------|
| Email (Resend) | 100/day | $0 |
| SMS (Africa's Talking) | Pay-per-use | ~$0-50/mo* |
| Cache (Local Redis) | Unlimited | $0 |
| Database (Neon/AWS) | Already set | $0 |
| Deployment (Vercel) | Unlimited | $0 |
| **TOTAL** | | **$0-50/mo** |

*Depends on SMS volume. Starting businesses use very little.

---

## 📊 Estimated SMS Costs

```
100 orders/month → 300 SMS → KES 150 (~$1.20)
500 orders/month → 1,500 SMS → KES 750 (~$6)
1,000 orders/month → 3,000 SMS → KES 1,500 (~$12)
```

---

## ✅ Verification Checklist

- [ ] `.env.local` has all 3 API keys
- [ ] Redis is running (`redis-cli ping` returns PONG)
- [ ] Database connection works (`pnpm prisma db execute --stdin < /dev/null`)
- [ ] Tests pass (`pnpm test` = 50 passed)
- [ ] Dev server starts (`pnpm dev`)
- [ ] Can send email (check RESEND_API_KEY)
- [ ] Can send SMS (check AFRICAS_TALKING_API_KEY)

---

## 🐛 Common Issues

**"Email not sending?"**
```bash
# Check API key
echo $RESEND_API_KEY

# Check email format
# Must be valid: user@domain.com

# Check spam folder
```

**"Redis connection refused?"**
```bash
# Start Redis
redis-server

# Or check Docker
docker ps | grep redis
```

**"SMS not sending?"**
```bash
# Check number format: +254712345678
# Check Africa's Talking balance
# Verify API key in dashboard
```

---

## 🔄 Scaling Path

As you grow:

| Users | Email | SMS | Cache | Server | Cost/mo |
|-------|-------|-----|-------|--------|---------|
| 0-1K | $0 | $0-20 | $0 | $0 | $0-20 |
| 1K-10K | $0 | $20-100 | $15 | $25 | $60 |
| 10K-100K | $20 | $100-500 | $50 | $50 | $220 |
| 100K+ | $100+ | $500+ | $200+ | $500+ | $1K+ |

---

## 📚 Quick Links

- 🔐 Resend: https://resend.com
- 📱 Africa's Talking: https://africastalking.com
- ⚡ Vercel: https://vercel.com
- 🚂 Railway: https://railway.app
- 🎨 Render: https://render.com
- 🔄 Redis: https://redis.io
- 📖 Full Setup: See MINIMAL_COST_SETUP.md

---

## 🎯 Production Checklist

Before going live:

- [ ] All services tested locally
- [ ] Database has production backup
- [ ] Monitoring set up (free options)
- [ ] Error tracking enabled (Sentry free tier)
- [ ] DNS configured
- [ ] HTTPS enabled (automatic)
- [ ] Rate limiting configured
- [ ] Support email working

---

## 📞 Support

**Issue?** Check the error in this order:

1. `.env.local` - Are all keys present?
2. Services running - Is Redis running?
3. Network - Can you reach the services?
4. Credentials - Are keys correct?
5. Logs - `docker logs yadplast-redis`

---

## ✨ You're Ready!

**Status:** 🚀 Ready to launch  
**Cost:** $0 (free tiers)  
**Setup Time:** ~15 minutes  
**Scale Anytime:** No lock-in

---

**Questions?** See MINIMAL_COST_SETUP.md for detailed guide
**Need Help?** Check INTEGRATIONS_SETUP.md for troubleshooting

Happy shipping! 🎉
