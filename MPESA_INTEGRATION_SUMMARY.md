# M-Pesa Integration Summary for YADDPLAST

## Overview

Your M-Pesa payment system is ready to be configured. This document provides everything you need to get started.

## Your Business Details

| Item | Value |
|------|-------|
| **Business Name** | YADDPLAST |
| **PayBill Number** | 247247 |
| **Phone Number** | 0702987665 |
| **Payment Method** | M-Pesa STK Push |

## What You Have Now

✅ **Payment Infrastructure Ready:**
- API endpoint for M-Pesa payments: `/api/payments/mpesa`
- Callback handler: `/api/payments/mpesa/callback`
- Database schema for tracking payments
- UI component for payment method selection

✅ **Setup Guides Created:**
- `MPESA_CREDENTIALS_GUIDE.md` - Detailed step-by-step guide
- `setup-mpesa.sh` - Automated setup script
- This summary document

## What You Need to Do

### Phase 1: Get Credentials (5-10 minutes)

1. **Register on Safaricom Daraja Portal**
   - Go to: https://developer.safaricom.co.ke/
   - Sign up with your email and phone (0702987665)

2. **Create App on Daraja**
   - Go to "My Apps"
   - Create new app named "YADDPLAST Payments"
   - Get your **Consumer Key** and **Consumer Secret**

3. **Get Passkey from M-Pesa Business**
   - Go to: https://www.safaricom.co.ke/business
   - Navigate to "Online Tools" → "API Security Credentials"
   - Generate and copy your **Passkey**

### Phase 2: Configure in YADDPLAST (2 minutes)

**Option A: Automatic Setup (Recommended)**
```bash
cd ecommerce-store
./setup-mpesa.sh
```
Then enter your credentials when prompted.

**Option B: Manual Setup**
Edit `ecommerce-store/.env` and add:
```
MPESA_CONSUMER_KEY=your_consumer_key_here
MPESA_CONSUMER_SECRET=your_consumer_secret_here
MPESA_SHORTCODE=247247
MPESA_PASSKEY=your_passkey_here
MPESA_CALLBACK_URL=http://localhost:3000/api/payments/mpesa/callback
```

### Phase 3: Test (5 minutes)

1. Restart your application
2. Run the test curl command (provided below)
3. Check your phone for M-Pesa prompt

## Testing

### Test Payment Request

```bash
curl -X POST http://localhost:3000/api/payments/mpesa \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "test-order-001",
    "amount": 50000,
    "phoneNumber": "0702987665"
  }'
```

### Expected Response (Success)

```json
{
  "success": true,
  "message": "STK push sent to your phone",
  "checkoutRequestId": "ws_CO_123456789",
  "merchantRequestId": "29114",
  "paymentId": "clx1234567890abcdef"
}
```

**What happens next:**
1. You'll receive an M-Pesa prompt on phone 0702987665
2. Enter your M-Pesa PIN
3. Payment confirmation sent to `/api/payments/mpesa/callback`
4. Order status automatically updates to PAID

### Test Responses (by scenario)

**Authentication Failed:**
```json
{
  "error": "Failed to authenticate with M-Pesa"
}
```
→ Check Consumer Key and Secret are correct

**Invalid Phone Number:**
```json
{
  "error": "Phone number required"
}
```
→ Ensure phone number is provided in request

**Payment Successful:**
- Order status: PAID ✓
- Payment status: COMPLETED ✓
- Receipt number: Stored in database ✓

## API Flow

```
┌──────────────┐
│  Customer    │
│ (Web App)    │
└──────┬───────┘
       │ 1. Click "Pay with M-Pesa"
       │ 2. Enter phone: 0702987665
       ▼
┌──────────────────────────────┐
│   YADDPLAST Backend          │
│  /api/payments/mpesa         │
└──────┬───────────────────────┘
       │ 3. Create Daraja token
       │ 4. Send STK push
       ▼
┌──────────────────────────────┐
│  Safaricom Daraja API        │
│  (sandbox)                   │
└──────┬───────────────────────┘
       │ 5. Send to M-Pesa
       ▼
┌──────────────────────────────┐
│  Customer Phone              │
│  M-Pesa Prompt Appears       │
└──────┬───────────────────────┘
       │ 6. Customer enters PIN
       ▼
┌──────────────────────────────┐
│  Safaricom Processes         │
│  Payment                     │
└──────┬───────────────────────┘
       │ 7. Sends callback
       ▼
┌──────────────────────────────┐
│   YADDPLAST Backend          │
│  /api/payments/mpesa/callback│
└──────┬───────────────────────┘
       │ 8. Update payment status
       │ 9. Update order to PAID
       ▼
┌──────────────┐
│   SUCCESS    │
│  Order PAID  │
└──────────────┘
```

## Database

### Payment Records

All M-Pesa payments are tracked in the `payments` table:

```sql
SELECT * FROM payments 
WHERE method = 'MPESA' 
ORDER BY createdAt DESC;
```

### Payment Status Workflow

```
PENDING → COMPLETED  (successful payment)
       → FAILED      (user cancelled or error)
```

## Troubleshooting

### Issue: "Failed to authenticate with M-Pesa"

**Cause:** Wrong Consumer Key or Secret

**Solution:**
1. Verify credentials copied correctly (no extra spaces)
2. Go to https://developer.safaricom.co.ke/
3. Check your app is active
4. Generate new credentials if needed

### Issue: "STK push not received"

**Cause:** Wrong phone number or callback URL unreachable

**Solution:**
1. Verify phone is 0702987665 or your actual M-Pesa phone
2. Ensure app is running on http://localhost:3000
3. Check firewall allows incoming requests

### Issue: "Invalid shortcode"

**Cause:** Shortcode doesn't match PayBill

**Solution:**
1. Verify MPESA_SHORTCODE=247247 in .env
2. Ensure it matches your PayBill number
3. Don't include spaces or special characters

### Issue: Payment not updating order status

**Cause:** Callback not received or processed

**Solution:**
1. Check server logs for callback errors
2. Verify MPESA_CALLBACK_URL is correct
3. Ensure app is accessible from internet (for production)

## Security

⚠️ **Important Security Notes:**

1. **Never share credentials:**
   - Consumer Secret must be kept private
   - Passkey must be kept private
   - These are as important as passwords

2. **Environment variables:**
   - .env file is in .gitignore (don't commit it)
   - Keep .env file safe on your server
   - Backup .env.backup file is created

3. **For Production:**
   - Get production credentials from Safaricom (different from sandbox)
   - Update MPESA_CALLBACK_URL to your production domain
   - Use HTTPS for all endpoints
   - Test thoroughly before going live

4. **Best Practices:**
   - Validate amounts server-side
   - Log all payment attempts
   - Implement rate limiting
   - Use environment variables for secrets

## Production Deployment

When ready to go live:

1. **Request Production Credentials**
   - Contact Safaricom for production Consumer Key/Secret
   - These are different from sandbox credentials

2. **Update Configuration**
   ```
   MPESA_CONSUMER_KEY=production_key
   MPESA_CONSUMER_SECRET=production_secret
   MPESA_CALLBACK_URL=https://yourdomain.com/api/payments/mpesa/callback
   ```

3. **Setup SSL/HTTPS**
   - All payment URLs must use HTTPS
   - Ensure SSL certificate is valid

4. **Test with Real Transaction**
   - Make a small test payment
   - Verify payment is processed
   - Check order status updates

5. **Monitor & Support**
   - Set up error alerts
   - Document payment procedures
   - Train support team

## Support Resources

**Safaricom Daraja Documentation:**
- Main Site: https://developer.safaricom.co.ke/
- API Docs: https://developer.safaricom.co.ke/docs
- Support: https://developer.safaricom.co.ke/support

**M-Pesa Business Support:**
- Website: https://www.safaricom.co.ke/business
- Contact: Your M-Pesa account manager

**Next.js & Prisma:**
- Next.js: https://nextjs.org/docs
- Prisma: https://www.prisma.io/docs

## Quick Reference

| Item | Details |
|------|---------|
| **Payment Method** | M-Pesa STK Push |
| **Shortcode** | 247247 (PayBill) |
| **Phone** | 0702987665 |
| **API Endpoint** | POST /api/payments/mpesa |
| **Callback** | POST /api/payments/mpesa/callback |
| **Database** | payments table |
| **Test URL** | http://localhost:3000 |
| **Documentation** | MPESA_CREDENTIALS_GUIDE.md |
| **Setup Script** | ./setup-mpesa.sh |

## Next Steps

1. ✅ Get credentials from Safaricom Daraja (5-10 min)
2. ✅ Run setup-mpesa.sh or update .env manually (2 min)
3. ✅ Restart application (1 min)
4. ✅ Test payment flow (5 min)
5. ✅ Integrate into checkout page
6. ✅ Go live!

---

**Status:** 🔴 Waiting for credentials → 🟡 Setup → 🟢 Testing → 🟢 Production

**Last Updated:** 2025-12-28
**Platform:** YADDPLAST E-Commerce
**Version:** 1.0
