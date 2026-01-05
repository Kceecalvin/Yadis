# M-Pesa Setup Checklist for YADDPLAST

Use this checklist to track your progress through the M-Pesa setup process.

## Phase 1: Prepare 🟡
- [ ] Read `MPESA_CREDENTIALS_GUIDE.md`
- [ ] Understand the setup process
- [ ] Have your PayBill number ready: **247247**
- [ ] Have your phone number ready: **0702987665**
- [ ] Have access to your M-Pesa Business account

## Phase 2: Get Credentials from Safaricom 🟡

### Daraja Portal Registration
- [ ] Visit https://developer.safaricom.co.ke/
- [ ] Click "Sign Up"
- [ ] Enter email address
- [ ] Create username
- [ ] Create strong password
- [ ] Enter phone: 0702987665
- [ ] Enter organization: YADDPLAST
- [ ] Confirm email verification link
- [ ] Successfully log in to Daraja portal

### Create Daraja App
- [ ] Navigate to "My Apps" section
- [ ] Click "Create New App" button
- [ ] App Name: `YADDPLAST Payments`
- [ ] Description: `E-commerce payment integration for YADDPLAST`
- [ ] Click "Create App"
- [ ] **Copy Consumer Key**: ________________
- [ ] **Copy Consumer Secret**: ________________

### Get Passkey
- [ ] Visit https://www.safaricom.co.ke/business
- [ ] Log in with your M-Pesa Business credentials
- [ ] Navigate to "Online Tools"
- [ ] Select "API Security Credentials"
- [ ] Click "Generate New Passkey"
- [ ] Follow OTP verification
- [ ] **Copy your Passkey**: ________________

## Phase 3: Configure YADDPLAST 🟡

### Automatic Setup (Recommended)
- [ ] Open terminal
- [ ] Navigate: `cd ecommerce-store`
- [ ] Run: `./setup-mpesa.sh`
- [ ] Enter Consumer Key when prompted
- [ ] Enter Consumer Secret when prompted
- [ ] Enter Passkey when prompted
- [ ] Press Enter for phone number (use default)
- [ ] Script creates .env.backup ✓
- [ ] Script updates .env ✓
- [ ] Review the summary output

### OR Manual Setup
- [ ] Open `ecommerce-store/.env`
- [ ] Find M-Pesa section
- [ ] Add `MPESA_CONSUMER_KEY=your_key`
- [ ] Add `MPESA_CONSUMER_SECRET=your_secret`
- [ ] Add `MPESA_SHORTCODE=247247`
- [ ] Add `MPESA_PASSKEY=your_passkey`
- [ ] Add `MPESA_CALLBACK_URL=http://localhost:3000/api/payments/mpesa/callback`
- [ ] Save file
- [ ] Verify .env.backup was created

## Phase 4: Start Application 🟡
- [ ] Stop current server (Ctrl+C)
- [ ] Run: `cd ecommerce-store && pnpm dev`
- [ ] Wait for build to complete
- [ ] Verify: "ready - started server on 0.0.0.0:3000"
- [ ] Application is running ✓

## Phase 5: Test Payment Endpoint 🟡

### Run Test Request
- [ ] Open new terminal window
- [ ] Copy and run test curl command:
```bash
curl -X POST http://localhost:3000/api/payments/mpesa \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "test-order-001",
    "amount": 50000,
    "phoneNumber": "0702987665"
  }'
```
- [ ] You receive response without error

### Verify Response
- [ ] Response contains: `"success": true`
- [ ] Response contains: `"message": "STK push sent to your phone"`
- [ ] Response contains: `"checkoutRequestId"`
- [ ] Response contains: `"paymentId"`

### On Your Phone
- [ ] M-Pesa prompt appears on 0702987665
- [ ] Prompt shows order amount in KES
- [ ] Enter your M-Pesa PIN
- [ ] Payment is processed

### Verify Payment Status
- [ ] Order status changes to PAID
- [ ] Payment record created in database
- [ ] Receipt number stored
- [ ] No error messages in server logs

## Phase 6: Integration 🟡

### Update Checkout Page
- [ ] Import PaymentMethodSelector component
- [ ] Add payment method selection UI
- [ ] Handle M-Pesa payment flow
- [ ] Add success/error messages
- [ ] Test complete checkout flow

### Test Complete Flow
- [ ] Add items to cart
- [ ] Go to checkout
- [ ] Select M-Pesa payment
- [ ] Complete payment
- [ ] Order status updates
- [ ] Customer receives confirmation

## Phase 7: Production Preparation 🟡

### Get Production Credentials
- [ ] Contact Safaricom for production credentials
- [ ] Request live Consumer Key
- [ ] Request live Consumer Secret
- [ ] Get production Passkey
- [ ] Store securely (never commit to git)

### Update Production Configuration
- [ ] Update .env with production credentials
- [ ] Change MPESA_CALLBACK_URL to production domain
- [ ] Enable HTTPS on production domain
- [ ] Verify SSL certificate is valid

### Final Testing
- [ ] Test with small real transaction
- [ ] Verify payment is processed
- [ ] Check order status updates
- [ ] Monitor error logs

### Deploy to Production
- [ ] Deploy code to production server
- [ ] Verify environment variables are set
- [ ] Test payment flow on production
- [ ] Monitor for issues
- [ ] Enable error alerts

## Troubleshooting 🔴

If you encounter issues, check:

### Authentication Error
- [ ] Consumer Key is correct (copied fully)
- [ ] Consumer Secret is correct (copied fully)
- [ ] No extra spaces in credentials
- [ ] App is active in Daraja portal
- [ ] Generated new credentials if needed

### Phone Number Issues
- [ ] Phone number is correct: 0702987665
- [ ] Phone number format is: 0XXXXXXXXX
- [ ] You have M-Pesa enabled on this number
- [ ] Number has enough M-Pesa balance

### Callback Issues
- [ ] Callback URL is correct: http://localhost:3000/api/payments/mpesa/callback
- [ ] Server is running and accessible
- [ ] Firewall allows incoming requests
- [ ] Check server logs for errors

### Database Issues
- [ ] Database connection is working
- [ ] Payment table exists in database
- [ ] Order table exists in database
- [ ] No permission issues

## Support Resources 📚

- [ ] Read: `MPESA_CREDENTIALS_GUIDE.md`
- [ ] Read: `MPESA_INTEGRATION_SUMMARY.md`
- [ ] Read: `PAYMENT_SETUP_GUIDE.md`
- [ ] Visit: https://developer.safaricom.co.ke/docs
- [ ] Contact: Safaricom support if needed

## Sign-Off ✅

**Date Completed**: _______________

**Tested By**: _______________

**Status**: 
- [ ] Development (Sandbox)
- [ ] Production

**Notes**:
_____________________________________________________________________________
_____________________________________________________________________________
_____________________________________________________________________________

---

## Quick Summary

| Phase | Status | Time | Details |
|-------|--------|------|---------|
| 1. Prepare | ⬜ | 5 min | Read guides, prepare info |
| 2. Get Credentials | ⬜ | 10 min | Register & create app |
| 3. Configure | ⬜ | 5 min | Run setup script or manual update |
| 4. Start App | ⬜ | 2 min | Restart application |
| 5. Test Endpoint | ⬜ | 5 min | Send test payment request |
| 6. Integration | ⬜ | 30 min | Integrate into checkout |
| 7. Production | ⬜ | Variable | Deploy to production |
| **TOTAL** | ⬜ | ~60 min | Complete setup |

---

**Good luck with your M-Pesa integration! 🚀**

For questions or issues, refer to the comprehensive guides in your project folder.
