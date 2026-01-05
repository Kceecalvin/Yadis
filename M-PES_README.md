# M-Pesa Payment Integration for YADDPLAST

**Quick Links:**
- 🚀 [Quick Start](#quick-start)
- 📖 [Documentation](#documentation)
- ✅ [Checklist](#checklist)
- 🧪 [Testing](#testing)
- 📞 [Support](#support)

---

## Quick Start

### Your Details
- **Business:** YADDPLAST
- **PayBill:** 247247
- **Phone:** 0702987665
- **Payment Method:** M-Pesa STK Push

### 3-Step Setup (20 minutes)

#### Step 1: Get Credentials (10 min)
1. Register: https://developer.safaricom.co.ke/
2. Create app → Get Consumer Key & Secret
3. Get Passkey from M-Pesa Business portal

#### Step 2: Configure (2 min)
```bash
cd ecommerce-store
./setup-mpesa.sh
# Enter your credentials
```

#### Step 3: Test (5 min)
```bash
pnpm dev
# In another terminal:
curl -X POST http://localhost:3000/api/payments/mpesa \
  -H "Content-Type: application/json" \
  -d '{"orderId":"test-001","amount":50000,"phoneNumber":"0702987665"}'
```

---

## Documentation

### 📚 Start Here
**Choose based on your needs:**

| Document | Purpose | Read Time |
|----------|---------|-----------|
| **MPESA_CREDENTIALS_GUIDE.md** | Step-by-step to get credentials | 15 min |
| **MPESA_INTEGRATION_SUMMARY.md** | Complete overview & testing | 20 min |
| **MPESA_SETUP_CHECKLIST.md** | Track your progress | 5 min |
| **PAYMENT_SETUP_GUIDE.md** | Full payment system (includes Stripe) | 30 min |
| **PAYMENT_QUICK_START.md** | Quick reference | 5 min |

### 🎯 By Use Case

**I want to get started quickly**
→ Read: MPESA_CREDENTIALS_GUIDE.md

**I want to understand the whole system**
→ Read: MPESA_INTEGRATION_SUMMARY.md

**I want to track my setup progress**
→ Use: MPESA_SETUP_CHECKLIST.md

**I want to test the API**
→ Read: MPESA_INTEGRATION_SUMMARY.md (Testing section)

**I need production deployment help**
→ Read: MPESA_INTEGRATION_SUMMARY.md (Production section)

**I want to know about all payment methods**
→ Read: PAYMENT_SETUP_GUIDE.md

---

## Checklist

Use this to track your progress:

```
☐ Read MPESA_CREDENTIALS_GUIDE.md
☐ Register on Daraja: https://developer.safaricom.co.ke/
☐ Create app and get Consumer Key/Secret
☐ Get Passkey from M-Pesa Business
☐ Run: ./setup-mpesa.sh
☐ Restart application: pnpm dev
☐ Test payment endpoint (see Testing section)
☐ Verify M-Pesa prompt appears on phone
☐ Check order status updated to PAID
☐ Integrate into checkout page
☐ Test complete checkout flow
☐ Deploy to production (with live credentials)
```

Full checklist: See `MPESA_SETUP_CHECKLIST.md`

---

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
  "checkoutRequestId": "ws_CO_123...",
  "merchantRequestId": "29114...",
  "paymentId": "clx..."
}
```

### What Happens Next
1. **M-Pesa prompt** appears on your phone (0702987665)
2. **You enter** your M-Pesa PIN
3. **Payment processes** with Safaricom
4. **Callback received** by YADDPLAST
5. **Order status** updates to PAID automatically

### Common Test Responses

| Scenario | Response | Action |
|----------|----------|--------|
| Success | `"success": true` | Check your phone for prompt |
| Auth Failed | `"error": "Failed to authenticate"` | Check credentials in .env |
| Bad Request | `"error": "Invalid order or amount"` | Verify orderId and amount |
| Phone Missing | `"error": "Phone number required"` | Include phoneNumber |

---

## API Reference

### Endpoint: POST /api/payments/mpesa

**Initiates M-Pesa STK push**

#### Request
```json
{
  "orderId": "string (required)",
  "amount": "number in cents (required)",
  "phoneNumber": "string (required)"
}
```

#### Response (Success)
```json
{
  "success": true,
  "message": "STK push sent to your phone",
  "checkoutRequestId": "string",
  "merchantRequestId": "string",
  "paymentId": "string"
}
```

#### Response (Error)
```json
{
  "error": "error message"
}
```

### Endpoint: POST /api/payments/mpesa/callback

**Receives payment confirmation from Safaricom**
- Automatically called by Safaricom
- Updates Payment status
- Updates Order status
- Returns JSON confirmation

---

## File Structure

```
ecommerce-store/
├── M-PESA_README.md                    ← You are here
├── MPESA_CREDENTIALS_GUIDE.md          ← How to get credentials
├── MPESA_INTEGRATION_SUMMARY.md        ← Complete overview
├── MPESA_SETUP_CHECKLIST.md            ← Track progress
├── setup-mpesa.sh                      ← Setup script
├── .env                                ← Your configuration (don't commit)
├── .env.backup                         ← Automatic backup
├── app/
│   ├── api/payments/
│   │   ├── mpesa/route.ts             ← M-Pesa API
│   │   └── mpesa/callback/route.ts    ← Callback handler
│   └── components/
│       └── PaymentMethodSelector.tsx   ← UI component
└── prisma/
    └── schema.prisma                   ← Database schema
```

---

## Configuration

### Environment Variables

Add to `.env`:

```env
MPESA_CONSUMER_KEY=your_consumer_key_here
MPESA_CONSUMER_SECRET=your_consumer_secret_here
MPESA_SHORTCODE=247247
MPESA_PASSKEY=your_passkey_here
MPESA_CALLBACK_URL=http://localhost:3000/api/payments/mpesa/callback
```

### For Production

Update when deploying:

```env
MPESA_CONSUMER_KEY=production_key
MPESA_CONSUMER_SECRET=production_secret
MPESA_CALLBACK_URL=https://yourdomain.com/api/payments/mpesa/callback
```

---

## Troubleshooting

### Problem: "Failed to authenticate with M-Pesa"

**Cause:** Wrong credentials

**Solution:**
1. Double-check Consumer Key and Secret (no extra spaces)
2. Go to https://developer.safaricom.co.ke/
3. Verify app is active
4. Generate new credentials if needed

### Problem: "STK push not received"

**Cause:** Wrong phone or callback unreachable

**Solution:**
1. Verify phone is 0702987665
2. Ensure app is running on http://localhost:3000
3. Check firewall settings

### Problem: "Invalid shortcode"

**Cause:** Shortcode doesn't match PayBill

**Solution:**
1. Verify `MPESA_SHORTCODE=247247` in .env
2. No spaces or special characters
3. Must match your PayBill number

### Problem: "Callback not received"

**Cause:** Server not accessible or not running

**Solution:**
1. Verify app is running
2. Check MPESA_CALLBACK_URL is correct
3. Ensure firewall allows incoming requests
4. Check server logs for errors

---

## Database

### Payment Records

All M-Pesa payments stored in `payments` table:

```sql
SELECT * FROM payments 
WHERE method = 'MPESA' 
ORDER BY createdAt DESC;
```

### Check Payment Status

```sql
-- Completed payments
SELECT * FROM payments WHERE status = 'COMPLETED';

-- Failed payments
SELECT * FROM payments WHERE status = 'FAILED';

-- Pending (might indicate issues)
SELECT * FROM payments WHERE status = 'PENDING' 
  AND createdAt < NOW() - INTERVAL 1 HOUR;
```

---

## Security

⚠️ **Important:**

- Never share Consumer Secret or Passkey
- Don't commit .env file to git (it's in .gitignore)
- Use HTTPS for all endpoints in production
- Keep .env.backup in a safe location
- Always validate amounts server-side
- Log all payment attempts

---

## Support

### Getting Help

1. **Setup Issues**
   - Read: `MPESA_CREDENTIALS_GUIDE.md`
   - Use: `MPESA_SETUP_CHECKLIST.md`

2. **Testing Issues**
   - Read: `MPESA_INTEGRATION_SUMMARY.md` (Testing section)
   - Check: Troubleshooting section above

3. **API Issues**
   - Read: `PAYMENT_SETUP_GUIDE.md`
   - Check: API Reference section above

4. **Official Support**
   - Safaricom Daraja: https://developer.safaricom.co.ke/support
   - M-Pesa Business: Contact your account manager

---

## Next Steps

1. ✅ Read `MPESA_CREDENTIALS_GUIDE.md`
2. ✅ Get credentials from Safaricom
3. ✅ Run `./setup-mpesa.sh`
4. ✅ Test payment endpoint
5. ✅ Integrate into checkout
6. ✅ Test complete flow
7. ✅ Deploy to production

---

## Additional Resources

### Safaricom
- Main: https://developer.safaricom.co.ke/
- Docs: https://developer.safaricom.co.ke/docs
- Support: https://developer.safaricom.co.ke/support

### M-Pesa Business
- Website: https://www.safaricom.co.ke/business
- Online Tools: API Security Credentials

### YADDPLAST Project
- Checkout Component: `PaymentMethodSelector.tsx`
- Payment Routes: `app/api/payments/`
- Database Schema: `prisma/schema.prisma`

---

## Version Info

- **Version:** 1.0
- **Last Updated:** 2025-12-28
- **Platform:** YADDPLAST E-Commerce
- **Payment Method:** M-Pesa STK Push
- **Status:** Ready to Configure

---

**You're ready to go! Start with `MPESA_CREDENTIALS_GUIDE.md` 🚀**
