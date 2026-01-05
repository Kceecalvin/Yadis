# Yadplast E-Commerce - Minimal Production Cost Setup

**Goal:** Deploy with ZERO initial costs using free tiers only

---

## 💰 Total Monthly Cost: $0 (Using Free Tiers)

| Service | Cost | Free Limit |
|---------|------|-----------|
| Email (Resend) | $0 | 100/day |
| SMS (Africa's Talking) | $0 | Pay-as-you-go (~KES 0.50/SMS) |
| Cache (Local Redis) | $0 | Self-hosted |
| **Total** | **$0** | **Unlimited growth** |

---

## 🚀 STEP 1: Email Service (FREE)

### **Option: Resend (RECOMMENDED)**

**Cost:** $0 (100 emails/day free)  
**Setup Time:** 5 minutes

#### Setup:

```bash
# 1. Go to https://resend.com
# 2. Click "Create Account"
# 3. Sign up with your email
# 4. Verify email
# 5. Go to Dashboard → API Keys
# 6. Create new API key
# 7. Copy the key
```

#### Environment Variables:

```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=noreply@yadplast.com
```

#### Test It:

```bash
# Create test-email.ts
import { sendEmail } from './lib/email-service';

await sendEmail({
  to: 'your-email@example.com',
  subject: 'Test Email',
  html: '<p>Email works!</p>'
});

# Run
pnpm tsx test-email.ts
```

**✅ 100 FREE EMAILS PER DAY = 3,000/month**

---

## 📱 STEP 2: SMS Service (ULTRA-CHEAP FOR KENYA)

### **Option: Africa's Talking (BEST FOR KENYA)**

**Cost:** ~KES 0.50 per SMS (~$0.004)  
**No monthly fee, pay-as-you-go**

#### Setup:

```bash
# 1. Go to https://africastalking.com
# 2. Sign up (business email recommended)
# 3. Verify email
# 4. Complete KYC (takes 5-10 min)
# 5. Go to Settings → API Key
# 6. Copy your API key
# 7. Note your username
```

#### Environment Variables:

```env
SMS_PROVIDER=africas-talking
AFRICAS_TALKING_API_KEY=your_api_key
AFRICAS_TALKING_USERNAME=YadplastStore
```

#### Cost Estimation:

```
1,000 SMS/month = KES 500 (~$4 USD)
2,000 SMS/month = KES 1,000 (~$8 USD)
5,000 SMS/month = KES 2,500 (~$20 USD)
10,000 SMS/month = KES 5,000 (~$40 USD)
```

#### Test It:

```bash
# Create test-sms.ts
import { sendSMS } from './lib/sms-service';

await sendSMS({
  phoneNumber: '+254712345678',
  message: 'Test SMS from Yadplast'
});

# Run
pnpm tsx test-sms.ts
```

**✅ PAY-AS-YOU-GO = Minimal costs during launch**

---

## ⚡ STEP 3: Caching (FREE - LOCAL REDIS)

### **Option: Self-Hosted Redis (ZERO COST)**

**Cost:** $0 (self-hosted on your server)  
**Performance:** Excellent for small-medium scale

#### Setup Options:

### **Option A: Docker (RECOMMENDED)**

```bash
# Install Docker (if not already installed)
# macOS:
brew install docker docker-compose

# Linux (Ubuntu/Debian):
sudo apt-get install docker.io docker-compose

# Run Redis container
docker run -d -p 6379:6379 --name yadplast-redis redis:latest

# Verify it's running
docker ps | grep redis
```

### **Option B: Direct Installation**

```bash
# macOS
brew install redis
redis-server

# Linux (Ubuntu/Debian)
sudo apt-get install redis-server
redis-server

# Windows (WSL2)
wsl
sudo apt-get install redis-server
redis-server
```

### **Option C: Binary Download**

```bash
# Download from https://redis.io/download
# Extract and run
./redis-server
```

#### Environment Variables:

```env
# Local development
REDIS_URL=redis://localhost:6379

# Or with password (optional)
REDIS_URL=redis://:password@localhost:6379
```

#### Test It:

```bash
# Create test-cache.ts
import { getCacheRedis, setCacheRedis } from './lib/redis-cache';

await setCacheRedis('test-key', { message: 'Hello' }, 300);
const value = await getCacheRedis('test-key');
console.log(value); // { message: 'Hello' }

# Run
pnpm tsx test-cache.ts
```

**✅ ZERO COST = Complete control over your data**

---

## 🔧 COMPLETE .env.local FOR MINIMAL COST

```env
# ============================================
# DATABASE (Already set up)
# ============================================
DATABASE_URL=postgresql://user:password@localhost:5432/yadplast

# ============================================
# EMAIL (Resend - FREE: 100/day)
# ============================================
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=noreply@yadplast.com

# ============================================
# SMS (Africa's Talking - PAY-AS-YOU-GO)
# ============================================
SMS_PROVIDER=africas-talking
AFRICAS_TALKING_API_KEY=your_api_key_here
AFRICAS_TALKING_USERNAME=YadplastStore

# ============================================
# CACHE (Local Redis - FREE)
# ============================================
REDIS_URL=redis://localhost:6379

# ============================================
# NEXTAUTH (Already configured)
# ============================================
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# ============================================
# FEATURE FLAGS (Enable all)
# ============================================
ENABLE_NOTIFICATIONS=true
ENABLE_EMAIL_NOTIFICATIONS=true
ENABLE_SMS_NOTIFICATIONS=true
ENABLE_INVENTORY_TRACKING=true
ENABLE_WISHLIST=true
ENABLE_REFERRAL_PROGRAM=true
ENABLE_ANALYTICS=true
```

---

## 📋 PRODUCTION DEPLOYMENT ON $0 BUDGET

### **Server Options (Still FREE):**

#### **Option 1: Vercel (Recommended for Next.js)**
- **Cost:** $0 (Hobby tier)
- **Includes:** Unlimited serverless functions, automatic deployments
- **Setup:** 2 minutes
- **Visit:** https://vercel.com

```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
vercel
```

#### **Option 2: Railway**
- **Cost:** $5 free monthly credits (plenty for small sites)
- **Includes:** Postgres, Node.js, Redis
- **Setup:** 5 minutes
- **Visit:** https://railway.app

#### **Option 3: Render**
- **Cost:** $0 (Free tier available)
- **Includes:** Postgres, Node.js
- **Setup:** 10 minutes
- **Visit:** https://render.com

#### **Option 4: Self-Hosted (Ultimate Free)**
- **Cost:** $0 (use your own server)
- **Requirements:** Linux server, Docker
- **Setup:** 30 minutes
- **Deploy:** Docker Compose

---

## 🚀 MINIMAL COST DEPLOYMENT CHECKLIST

### Week 1: Setup

- [ ] Sign up for Resend (FREE)
- [ ] Get Resend API key
- [ ] Sign up for Africa's Talking
- [ ] Get Africa's Talking API key & complete KYC
- [ ] Install local Redis (Docker recommended)
- [ ] Update .env.local with all keys
- [ ] Run full test suite: `pnpm test`
- [ ] Test email service: `pnpm tsx test-email.ts`
- [ ] Test SMS service: `pnpm tsx test-sms.ts`
- [ ] Test cache: `pnpm tsx test-cache.ts`

### Week 2: Staging

- [ ] Choose deployment platform (Vercel/Railway/Render/Self-hosted)
- [ ] Set up staging environment
- [ ] Deploy to staging
- [ ] Test all features in staging
- [ ] Monitor for 24 hours
- [ ] Check notification delivery
- [ ] Check cache performance

### Week 3: Production

- [ ] Deploy to production
- [ ] Set up monitoring (using free tools)
- [ ] Configure backups
- [ ] Test end-to-end flow
- [ ] Announce launch 🎉

---

## 💡 FREE MONITORING & OBSERVABILITY

### **Option 1: Vercel Analytics (FREE)**
```bash
# If using Vercel, analytics are automatic
# Dashboard → Analytics
```

### **Option 2: Open Source Monitoring**
```bash
# Prometheus + Grafana (self-hosted)
docker run -d -p 9090:9090 prom/prometheus
docker run -d -p 3000:3000 grafana/grafana
```

### **Option 3: Simple Logging**
```bash
# Use built-in Node.js logging
console.log('Event:', data);
```

---

## 📊 COST BREAKDOWN (MINIMAL SETUP)

| Item | Cost | Notes |
|------|------|-------|
| Email (Resend) | $0 | 100/day free |
| SMS (Africa's Talking) | ~$0-50/mo | Pay-as-you-go, low volume |
| Cache (Local Redis) | $0 | Self-hosted |
| Database (Neon) | $0 | Free tier (if not already set up) |
| Deployment | $0 | Vercel free tier |
| Domain | ~$10/yr | Optional, can use subdomain |
| **TOTAL** | **$0-60/month** | **VERY AFFORDABLE** |

---

## 🎯 WHEN TO UPGRADE

**Upgrade Email when:**
- You need more than 100 emails/day
- ➜ Cost: ~$20/month for SendGrid paid tier

**Upgrade SMS when:**
- You send more than 5,000 SMS/month
- ➜ Cost: ~$20-50/month

**Upgrade Cache when:**
- You have 1M+ daily visitors
- ➜ Cost: $15/month for Redis Cloud

**Upgrade Server when:**
- You need more than 100 concurrent requests
- ➜ Cost: $25/month for basic VPS

---

## 🔐 SECURITY BEST PRACTICES (FREE)

```bash
# 1. Never commit .env.local
echo ".env.local" >> .gitignore

# 2. Use strong API keys
# Resend: Auto-generated strong keys ✓
# Africa's Talking: Create separate key for prod ✓

# 3. Rotate keys monthly
# Go to dashboard → regenerate keys

# 4. Use HTTPS (automatic on Vercel/Railway/Render)

# 5. Monitor logs for unauthorized access
docker logs yadplast-redis | grep ERROR
```

---

## 📞 GETTING HELP

If something fails:

1. **Email not sending?**
   - Check Resend dashboard for errors
   - Verify email format is correct
   - Check spam folder

2. **SMS not sending?**
   - Verify phone number format (+254...)
   - Check Africa's Talking balance/credits
   - Check API key is correct

3. **Cache not working?**
   - Verify Redis is running: `docker ps`
   - Check REDIS_URL format
   - Try: `redis-cli ping` (should return PONG)

---

## ✨ SUMMARY

**Minimal Cost Setup:**
- ✅ Resend Email: FREE (100/day)
- ✅ Africa's Talking SMS: PAY-AS-YOU-GO (~$0-50/mo)
- ✅ Local Redis: FREE ($0)
- ✅ Vercel Deployment: FREE (or $5/mo on Railway)
- **= TOTAL: $0-60/MONTH**

**Scale to 100K users:**
- Email: Resend $20/mo
- SMS: Africa's Talking $50/mo
- Cache: Redis Cloud $15/mo
- Server: Vercel/Railway $25/mo
- **= TOTAL: $110/MONTH**

**Ready to launch on the absolute minimum budget!** 🚀

---

**Created:** December 31, 2025  
**Target:** $0 Initial Cost, Scalable Growth
