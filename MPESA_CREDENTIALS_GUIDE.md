# M-Pesa Daraja Credentials Guide for YADDPLAST

## Your PayBill Details
- **PayBill Number**: 247247
- **Phone Number**: 0702987665

## Step-by-Step: Getting Daraja Credentials

### STEP 1: Register on Safaricom Developer Portal

1. Go to: **https://developer.safaricom.co.ke/**
2. Click **"Sign Up"** or **"Register"**
3. Fill in your details:
   - **Email**: Your business email
   - **Username**: Choose a username
   - **Password**: Strong password
   - **Phone**: 0702987665
   - **Organization**: YADDPLAST
4. Check your email for verification link
5. Click the link to verify your account

### STEP 2: Create a New App

1. Log in to the Developer Portal: https://developer.safaricom.co.ke/
2. Go to **"My Apps"** section
3. Click **"Create New App"** button
4. Fill in app details:
   - **App Name**: `YADDPLAST Payments`
   - **Description**: `E-commerce payment integration for YADDPLAST`
5. Click **"Create App"**

### STEP 3: Get Your Credentials

After creating the app, you'll see your credentials:

1. **Consumer Key** ← Copy this
   - Will look like: `abcd1234efgh5678ijkl9012mnop3456`
   
2. **Consumer Secret** ← Copy this
   - Will look like: `wxyz7890abcd1234efgh5678ijkl9012`

📋 **Save these in a safe place!**

### STEP 4: Set Up Your PayBill in Daraja

Since you're using PayBill 247247:

1. In your app settings, look for **"Shortcode"** field
2. Your shortcode is your **PayBill: 247247**
3. Enter: `247247`

### STEP 5: Generate Your Passkey

The Passkey is a security code you create:

**Option A: Safaricom Portal (Recommended)**
1. Log into M-Pesa Business Portal: https://www.safaricom.co.ke/business
2. Go to **"Online Tools"** → **"API Security Credentials"**
3. Click **"Generate New Passkey"**
4. Follow the steps:
   - Select your account
   - Confirm with OTP
   - Your passkey will be displayed
5. Copy and save your passkey ← This is important!

**Option B: If you already have a passkey**
- Check your M-Pesa Business account
- Look for "API Security" or "Online Tools"
- Your passkey should be there

### STEP 6: Update Your .env File

Once you have all credentials, update `/ecommerce-store/.env`:

```bash
# M-Pesa Daraja Configuration
MPESA_CONSUMER_KEY=paste_your_consumer_key_here
MPESA_CONSUMER_SECRET=paste_your_consumer_secret_here
MPESA_SHORTCODE=247247
MPESA_PASSKEY=paste_your_passkey_here
MPESA_CALLBACK_URL=http://localhost:3000/api/payments/mpesa/callback
```

### STEP 7: Test Your Credentials

Once updated, restart your application:

```bash
# Stop the current server (Ctrl+C)
# Then run:
cd ecommerce-store
pnpm dev
```

Then test with curl:

```bash
curl -X POST http://localhost:3000/api/payments/mpesa \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "test-order-001",
    "amount": 50000,
    "phoneNumber": "0702987665"
  }'
```

Expected response if credentials are correct:
```json
{
  "success": true,
  "message": "STK push sent to your phone",
  "checkoutRequestId": "ws_CO_...",
  "paymentId": "clx..."
}
```

If you get an error, double-check your credentials are correct.

---

## Credentials Checklist

Before proceeding, you should have:

- [ ] Consumer Key (from Daraja portal)
- [ ] Consumer Secret (from Daraja portal)
- [ ] Shortcode: 247247 ✓
- [ ] Passkey (from M-Pesa Business portal)
- [ ] Phone Number: 0702987665 ✓
- [ ] Updated .env file

---

## Troubleshooting

### "Failed to authenticate with M-Pesa"
- Check Consumer Key and Secret are copied correctly (no extra spaces)
- Verify app is active in Daraja portal
- Try generating new credentials

### "Invalid shortcode"
- Verify you entered 247247 (without spaces or formatting)
- Check it matches your PayBill number

### "Invalid passkey"
- Ensure passkey is correctly copied
- Check it's the current passkey (not an old one)
- Regenerate if unsure

### "Callback URL error"
- Make sure your app is running
- Check that http://localhost:3000 is accessible
- For production, update to your actual domain

---

## Getting Help

If you need support:

1. **Safaricom Daraja Support**: https://developer.safaricom.co.ke/support
2. **M-Pesa Business Support**: Contact your M-Pesa account manager
3. **Phone**: Call Safaricom customer care

---

## Next Steps

Once you have your credentials:
1. Update .env file
2. Restart the application
3. Test the payment flow
4. Integrate payment selector into checkout
5. Test with actual payments

---

**Important Notes:**
- Your passkey is sensitive - never share it
- Don't commit .env file to git (it's in .gitignore)
- Test credentials work in sandbox mode
- For production, you'll need to request different credentials

Good luck with your M-Pesa integration! 🚀
