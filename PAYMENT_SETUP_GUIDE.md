# Payment Setup Guide for YADDPLAST

This guide covers setting up both M-Pesa and Stripe payment integrations for the YADDPLAST e-commerce platform.

## Overview

YADDPLAST supports three payment methods:
1. **M-Pesa** - Mobile money payment (Kenya)
2. **Stripe** - Credit/Debit card payments (International)
3. **Cash on Delivery** - Pay when order arrives

## Architecture

### Payment Flow

```
1. Customer adds items to cart
2. Customer proceeds to checkout
3. Customer selects payment method
4. Order is created with PENDING status
5. Payment is initiated based on selected method
6. Upon successful payment, order status updates to PAID
7. Customer receives confirmation
```

### Database Schema

The `Payment` model tracks all payment transactions:

```prisma
model Payment {
  id            String   @id @default(cuid())
  orderId       String
  order         Order    @relation(fields: [orderId], references: [id])
  method        String   // STRIPE, MPESA, CASH_ON_DELIVERY
  status        String   // PENDING, COMPLETED, FAILED
  amount        Int      // In cents
  currency      String   @default("KES")
  transactionId String?  @unique
  metadata      Json?    // Provider-specific data
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

## M-Pesa Setup (Kenya)

### Step 1: Get Daraja Credentials

1. Go to [Safaricom Developer Portal](https://developer.safaricom.co.ke/)
2. Sign up for a developer account
3. Create a new app
4. Get your:
   - Consumer Key
   - Consumer Secret
   - Shortcode (e.g., 174379)
   - Passkey

### Step 2: Update Environment Variables

Add to `.env`:

```
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=https://yourdomain.com/api/payments/mpesa/callback
```

### Step 3: Configure Callback URL

1. In Safaricom Developer Portal
2. Go to your app settings
3. Set Callback URL to: `https://yourdomain.com/api/payments/mpesa/callback`
4. Ensure it's accessible and returns proper JSON responses

### How M-Pesa Payment Works

1. **STK Push**: Customer initiates payment, receives prompt on their phone
2. **Customer Action**: Customer enters M-Pesa PIN to authorize
3. **Callback**: Safaricom sends payment confirmation to your callback URL
4. **Payment Update**: Your system updates payment status in database

### Testing M-Pesa (Sandbox)

- Test phone number: `254712345678`
- Callback is instant in sandbox mode
- Check logs at: `/api/payments/mpesa/callback`

## Stripe Setup (International)

### Step 1: Create Stripe Account

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Sign up for a free account
3. Go to API Keys section
4. Get your:
   - Publishable Key (starts with `pk_`)
   - Secret Key (starts with `sk_`)

### Step 2: Update Environment Variables

Add to `.env`:

```
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_XXXXXXXX
STRIPE_SECRET_KEY=sk_test_XXXXXXXX
```

### Step 3: Configure Stripe (Frontend)

Install Stripe React library (already installed):

```bash
pnpm add @stripe/react-js @stripe/js
```

### How Stripe Payment Works

1. **Create Intent**: Backend creates a PaymentIntent
2. **Client Secret**: Frontend receives clientSecret
3. **Card Element**: Customer enters card details
4. **Confirmation**: Frontend confirms payment with Stripe
5. **Webhook**: Stripe sends confirmation to your backend

## API Endpoints

### Create M-Pesa Payment

**POST** `/api/payments/mpesa`

Request:
```json
{
  "orderId": "clx123...",
  "amount": 50000,
  "phoneNumber": "0712345678"
}
```

Response:
```json
{
  "success": true,
  "message": "STK push sent to your phone",
  "checkoutRequestId": "ws_CO_123...",
  "merchantRequestId": "29114...",
  "paymentId": "clx456..."
}
```

### M-Pesa Callback

**POST** `/api/payments/mpesa/callback`

Receives automatic updates from Safaricom when payment completes.

### Create Stripe Payment Intent

**POST** `/api/payments/stripe`

Request:
```json
{
  "orderId": "clx123...",
  "amount": 50000,
  "email": "customer@example.com"
}
```

Response:
```json
{
  "clientSecret": "pi_123_secret...",
  "paymentIntentId": "pi_123..."
}
```

### Confirm Stripe Payment

**PUT** `/api/payments/stripe`

Request:
```json
{
  "paymentIntentId": "pi_123...",
  "orderId": "clx123..."
}
```

## Frontend Implementation

### Payment Method Selector Component

Use the `PaymentMethodSelector` component:

```tsx
import PaymentMethodSelector from '@/app/components/PaymentMethodSelector';

export default function Checkout() {
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  
  return (
    <PaymentMethodSelector 
      selectedMethod={paymentMethod}
      onMethodChange={setPaymentMethod}
      amount={totalAmount}
    />
  );
}
```

### M-Pesa Payment Flow

```tsx
const handleMpesaPayment = async () => {
  const response = await fetch('/api/payments/mpesa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId,
      amount,
      phoneNumber,
    }),
  });
  
  const data = await response.json();
  if (data.success) {
    alert('Check your phone for M-Pesa prompt');
    // Poll for payment status
    pollPaymentStatus(data.paymentId);
  }
};
```

### Stripe Payment Flow

```tsx
import { loadStripe } from '@stripe/js';
import { CardElement, Elements, useStripe, useElements } from '@stripe/react-js';

const handleStripePayment = async () => {
  const response = await fetch('/api/payments/stripe', {
    method: 'POST',
    body: JSON.stringify({ orderId, amount, email }),
  });
  
  const { clientSecret } = await response.json();
  
  await stripe.confirmCardPayment(clientSecret, {
    payment_method: {
      card: elements.getElement(CardElement),
      billing_details: { name, email },
    },
  });
};
```

## Production Deployment

### Before Going Live

1. **Get Live Credentials**
   - Request production M-Pesa credentials from Safaricom
   - Get Stripe live keys from dashboard

2. **Update Environment Variables**
   ```
   MPESA_CONSUMER_KEY=production_key
   STRIPE_SECRET_KEY=sk_live_XXXXXXXX
   NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_XXXXXXXX
   ```

3. **Set Callback URLs**
   - M-Pesa: `https://yaddplast.com/api/payments/mpesa/callback`
   - Stripe: Configure in Stripe Dashboard

4. **Enable HTTPS**
   - All payment URLs must use HTTPS
   - Ensure SSL certificate is valid

5. **Test Payment**
   - Complete full payment flow with test transaction
   - Verify order status updates correctly
   - Check payment records in database

### Monitoring

Monitor payment health:

```sql
-- Check payment statuses
SELECT method, status, COUNT(*) FROM payments GROUP BY method, status;

-- Check failed payments
SELECT * FROM payments WHERE status = 'FAILED' ORDER BY createdAt DESC;

-- Check pending payments (might indicate callback issues)
SELECT * FROM payments WHERE status = 'PENDING' AND createdAt < NOW() - INTERVAL 1 HOUR;
```

## Troubleshooting

### M-Pesa Issues

**Issue**: "Failed to authenticate with M-Pesa"
- Check Consumer Key and Secret are correct
- Ensure app is active in Safaricom Developer Portal

**Issue**: Callback not received
- Verify callback URL is publicly accessible
- Check Safaricom logs for callback attempts
- Ensure server can accept POST requests

**Issue**: "Invalid shortcode"
- Verify shortcode is correct in .env
- For sandbox: use 174379
- For production: use your merchant shortcode

### Stripe Issues

**Issue**: "Failed to create payment intent"
- Check API keys are correct
- Verify Stripe account is active
- Check API key permissions

**Issue**: Card declined in production
- Ensure SSL/HTTPS is enabled
- Check Card network restrictions
- Verify 3D Secure if required

## Support

For issues or questions:
- M-Pesa: [Safaricom Developer Support](https://developer.safaricom.co.ke/support)
- Stripe: [Stripe Support](https://support.stripe.com/)
- YADDPLAST: Create an issue in the repository

## Security Notes

1. **Never commit credentials**: Keep `.env` secrets secure
2. **HTTPS Only**: All payment endpoints must use HTTPS
3. **Validate Amounts**: Always validate amounts server-side
4. **Signature Verification**: Verify webhook signatures from payment providers
5. **Rate Limiting**: Implement rate limiting on payment endpoints
6. **Audit Logs**: Log all payment attempts for compliance

## Next Steps

1. Set up M-Pesa credentials
2. Test M-Pesa in sandbox
3. Set up Stripe account
4. Test Stripe payments
5. Update checkout UI with payment selector
6. Test full payment flows
7. Deploy to production with live credentials
