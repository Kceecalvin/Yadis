# Payment System Quick Start

## What's Been Set Up

Your YADDPLAST e-commerce platform now has a complete payment infrastructure with support for:
- **M-Pesa** (Kenya mobile money)
- **Stripe** (International cards)
- **Cash on Delivery**

## File Structure

```
app/
├── api/payments/
│   ├── stripe/
│   │   └── route.ts           # Stripe payment endpoints
│   └── mpesa/
│       ├── route.ts           # M-Pesa payment initiation
│       └── callback/route.ts  # M-Pesa payment confirmation
└── components/
    └── PaymentMethodSelector.tsx  # UI component for payment selection

prisma/
└── schema.prisma              # Updated with Payment model
```

## Quick Configuration

### 1. Get Credentials

**M-Pesa:**
- Go to: https://developer.safaricom.co.ke/
- Create app → Copy Consumer Key & Secret
- Get Shortcode & Passkey from Safaricom

**Stripe:**
- Go to: https://dashboard.stripe.com/
- Get API Keys from dashboard

### 2. Add to .env

```bash
# M-Pesa
MPESA_CONSUMER_KEY=paste_here
MPESA_CONSUMER_SECRET=paste_here
MPESA_SHORTCODE=174379
MPESA_PASSKEY=paste_here

# Stripe
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_paste_here
STRIPE_SECRET_KEY=sk_test_paste_here
```

### 3. Test It

**M-Pesa Test:**
```bash
curl -X POST http://localhost:3000/api/payments/mpesa \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "test-order-123",
    "amount": 50000,
    "phoneNumber": "0712345678"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "STK push sent to your phone",
  "checkoutRequestId": "ws_CO_...",
  "paymentId": "clx..."
}
```

## Payment Flow

### For Customers

1. **Checkout**: Add items to cart
2. **Select Payment**: Choose M-Pesa, Stripe, or Cash on Delivery
3. **Confirm Payment**:
   - M-Pesa: Phone prompt appears → Enter PIN
   - Stripe: Enter card details
   - COD: No action needed
4. **Order Complete**: Receive confirmation

### For Backend

1. Create Order with PENDING status
2. Create Payment record
3. Route to payment provider
4. Receive confirmation/callback
5. Update Order to PAID status
6. Update rewards

## Database

Payment records tracked in `payments` table:

```sql
SELECT * FROM payments 
WHERE status = 'COMPLETED' 
ORDER BY createdAt DESC;
```

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/payments/mpesa` | Initiate M-Pesa STK push |
| POST | `/api/payments/mpesa/callback` | M-Pesa sends confirmation |
| POST | `/api/payments/stripe` | Create Stripe payment intent |
| PUT | `/api/payments/stripe` | Confirm Stripe payment |

## Monitoring

Check payment health:

```sql
-- Count payments by method
SELECT method, COUNT(*) FROM payments GROUP BY method;

-- Find failed payments
SELECT * FROM payments WHERE status = 'FAILED';

-- Check pending payments (might indicate issues)
SELECT * FROM payments 
WHERE status = 'PENDING' 
AND created_at < NOW() - INTERVAL 1 HOUR;
```

## Common Issues

**M-Pesa**: "Failed to authenticate"
- ✓ Check credentials in .env
- ✓ Verify app is active in Safaricom portal
- ✓ Use correct sandbox/production URL

**Stripe**: "Payment intent failed"
- ✓ Verify API keys are correct
- ✓ Check card details (use 4242... for testing)
- ✓ Ensure 3D Secure is disabled for testing

**Callback not received**
- ✓ Check callback URL is accessible
- ✓ Verify firewall allows incoming requests
- ✓ Check server logs for errors

## Next: Integrate into Checkout

Update `/app/checkout/page.tsx`:

```tsx
import PaymentMethodSelector from '@/app/components/PaymentMethodSelector';

// In your checkout component:
<PaymentMethodSelector 
  selectedMethod={paymentMethod}
  onMethodChange={setPaymentMethod}
  amount={totalAmount}
/>

// Handle payment based on method:
if (paymentMethod === 'mpesa') {
  await handleMpesaPayment(orderId, amount, phoneNumber);
} else if (paymentMethod === 'stripe') {
  await handleStripePayment(orderId, amount);
} else {
  // Cash on delivery - just confirm order
  confirmOrder(orderId);
}
```

## Full Documentation

For detailed information, see: `PAYMENT_SETUP_GUIDE.md`

## Support

Need help? Check:
- M-Pesa: https://developer.safaricom.co.ke/docs
- Stripe: https://stripe.com/docs
- Next.js: https://nextjs.org/docs

---

**Status**: ✅ Payment infrastructure ready
**Next**: Configure credentials → Test → Deploy
