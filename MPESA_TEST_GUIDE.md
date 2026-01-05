# 🧪 M-Pesa Integration Testing Guide

## Current Status

✅ **M-Pesa Integration Code**: Ready
✅ **API Endpoints**: Implemented
- `/api/payments/mpesa` - Main payment endpoint
- `/api/payments/mpesa/callback` - Payment callback handler
- `/api/payments/mpesa/test` - Test endpoint

✅ **Payment UI**: PaymentMethodSelector component ready

---

## 🔑 Step 1: Check Your Credentials

### Check if credentials are set:
```bash
cd ~/ecommerce-store
cat .env.local | grep MPESA
```

### Required Environment Variables:
```bash
# Add these to .env.local if missing:

# Safaricom Daraja API Credentials (Sandbox)
MPESA_CONSUMER_KEY=your_consumer_key_here
MPESA_CONSUMER_SECRET=your_consumer_secret_here
MPESA_SHORTCODE=174379
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919

# Site URL for callbacks
NEXT_PUBLIC_SITE_URL=http://localhost:3001
```

---

## 📝 Step 2: Get Safaricom Daraja Credentials

If you **DON'T have credentials yet**:

### Option A: Use Sandbox (Testing)
1. Go to: https://developer.safaricom.co.ke
2. Create account / Login
3. Click "My Apps" → "Create New App"
4. Select "Lipa Na M-Pesa Sandbox"
5. Get your credentials:
   - **Consumer Key**
   - **Consumer Secret**
   - **Test Shortcode**: 174379
   - **Passkey**: bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919

### Option B: Production (Real Money)
1. Apply for M-Pesa Paybill/Till number
2. Register on Daraja API Portal
3. Get production credentials
4. Complete KYC verification

---

## 🧪 Step 3: Run Test Script

### Quick Test (Automated):
```bash
cd ~/ecommerce-store
./tmp_rovodev_test_mpesa.sh
```

This will:
1. ✅ Check if credentials are set
2. ✅ Verify server is running
3. ✅ Test M-Pesa API connection
4. ✅ Send test STK push to your phone

### Manual Test (API):
```bash
# Test with curl
curl -X POST http://localhost:3001/api/payments/mpesa/test \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "254708374149", "amount": 100}'
```

---

## 📱 Step 4: Test STK Push

### Sandbox Test Numbers:
Use these Safaricom sandbox numbers:
- `254708374149`
- `254708374150`
- `254708374151`

### Test Process:
1. Run the test script
2. Check your phone (or sandbox test number)
3. You should see: **"Enter M-Pesa PIN to pay KES 1.00"**
4. Enter sandbox PIN: `1234` (not real money!)
5. Wait for confirmation

---

## 🔍 Step 5: Verify Integration

### Check Server Logs:
```bash
# Your server is running, check logs in the terminal
# Look for:
# ✅ "STK push sent to your phone"
# ✅ "M-Pesa callback received"
# ✅ "Payment completed"
```

### Check Database:
```bash
cd ~/ecommerce-store
pnpm prisma studio
```
- Go to "Payment" table
- Find your test payment
- Status should change: PENDING → COMPLETED

---

## 🎯 Step 6: Test Full Order Flow

### Create Real Test Order:

1. **Go to**: http://localhost:3001

2. **Add items to cart** (2-3 products)

3. **Checkout** with details:
   ```
   Name: Test User
   Email: test@example.com
   Phone: 254708374149
   Address: Kutus Town, Main Street
   ```

4. **Select Payment Method**: M-Pesa 📱

5. **Complete Order** - Order created with PENDING status

6. **Pay via M-Pesa**:
   - You'll be redirected/prompted to pay
   - STK push sent to phone
   - Enter PIN
   - Payment confirmed

7. **Verify**:
   - Order status: PENDING → CONFIRMED
   - Payment status: PENDING → COMPLETED
   - Customer receives confirmation

---

## 🐛 Troubleshooting

### ❌ "Failed to authenticate with M-Pesa"
**Problem**: Wrong credentials

**Solution**:
```bash
# Check credentials in .env.local
cd ~/ecommerce-store
cat .env.local | grep MPESA

# Make sure they match your Daraja portal
```

### ❌ "Invalid Access Token"
**Problem**: Consumer Key/Secret incorrect

**Solution**:
- Re-check on https://developer.safaricom.co.ke
- Copy-paste carefully (no extra spaces)
- Restart server after changing .env.local

### ❌ "STK Push Failed"
**Problem**: Phone number not whitelisted or wrong format

**Solution**:
```bash
# Use Safaricom sandbox test numbers:
254708374149
254708374150
254708374151

# Or whitelist your number on Daraja portal
```

### ❌ "Callback URL not reachable"
**Problem**: Localhost not accessible from internet

**Solution**:
For local testing, M-Pesa callbacks won't work because localhost isn't public.

**Options**:
1. Use **ngrok** to expose local server:
   ```bash
   ngrok http 3001
   # Update NEXT_PUBLIC_SITE_URL to ngrok URL
   ```

2. Deploy to **Vercel** for testing:
   ```bash
   vercel
   # Use Vercel URL for callbacks
   ```

3. Use **sandbox auto-completion** (test only)

### ❌ Server Logs Show Errors
**Check common issues**:
```bash
# 1. Environment variables loaded?
cd ~/ecommerce-store && cat .env.local | grep MPESA

# 2. Server restarted after adding credentials?
pkill -f "next dev"
PORT=3001 pnpm dev

# 3. Prisma client generated?
pnpm prisma generate
```

---

## 📊 Test Results Checklist

### Environment Setup:
- [ ] MPESA_CONSUMER_KEY set
- [ ] MPESA_CONSUMER_SECRET set
- [ ] MPESA_SHORTCODE set
- [ ] MPESA_PASSKEY set
- [ ] NEXT_PUBLIC_SITE_URL set
- [ ] Server running on port 3001

### API Tests:
- [ ] `/api/payments/mpesa/test` returns success
- [ ] Access token generated successfully
- [ ] STK push request sent
- [ ] Phone receives payment prompt

### Database:
- [ ] Payment record created
- [ ] Transaction ID stored
- [ ] Metadata saved correctly

### Full Flow:
- [ ] Order created successfully
- [ ] Payment method selected
- [ ] M-Pesa payment initiated
- [ ] STK push received on phone
- [ ] Payment completed
- [ ] Order status updated
- [ ] Callback processed

---

## 🎓 Understanding the Flow

```
Customer                   Your System              Safaricom
   |                          |                         |
   |--- 1. Create Order ----->|                         |
   |                          |                         |
   |--- 2. Select M-Pesa ---->|                         |
   |                          |                         |
   |                          |--- 3. Request STK ----->|
   |                          |        Push             |
   |                          |                         |
   |<------------------------ 4. STK Push --------------|
   |    (Phone Prompt)        |      Notification       |
   |                          |                         |
   |--- 5. Enter PIN ----------------------->|
   |                          |                         |
   |                          |<--- 6. Payment ---------|
   |                          |      Confirmation       |
   |                          |                         |
   |<-- 7. Order Confirmed ---|                         |
   |                          |                         |
```

---

## 🚀 Next Steps After Testing

Once M-Pesa is working:

1. **Update Order Flow** - Add M-Pesa payment button to checkout
2. **Add Payment Status** - Show pending/completed states
3. **Email Notifications** - Send payment confirmations
4. **SMS Notifications** - Notify customer of payment status
5. **Admin Dashboard** - View M-Pesa transactions
6. **Reporting** - Track M-Pesa vs COD vs Card

---

## 💡 Quick Commands Reference

```bash
# Start server
cd ~/ecommerce-store && PORT=3001 pnpm dev &

# Run M-Pesa test
cd ~/ecommerce-store && ./tmp_rovodev_test_mpesa.sh

# Check credentials
cd ~/ecommerce-store && cat .env.local | grep MPESA

# View database
cd ~/ecommerce-store && pnpm prisma studio

# Check logs
# Just look at your terminal where server is running

# Test API directly
curl -X POST http://localhost:3001/api/payments/mpesa/test \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "254708374149", "amount": 100}'
```

---

## 📞 Support

**Need Help?**

1. Check `MPESA_SETUP_CHECKLIST.md` - Complete setup guide
2. Check `MPESA_INTEGRATION_SUMMARY.md` - Integration details
3. Safaricom Support: https://developer.safaricom.co.ke/support
4. Test in sandbox first, then move to production

---

**Status**: Ready to test! Run the test script above. 🚀
