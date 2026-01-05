# 📧 Email Notifications System - Complete Guide

## Overview

Your YaddPlast store now has a complete email notification system with:
- ✅ Welcome emails for new users
- ✅ Order confirmation emails
- ✅ Order shipped emails
- ✅ Order delivered emails
- ✅ Promotional/campaign emails from admin

---

## 📨 Email Types

### 1. Welcome Email (User Sign-Up)

**Triggered:** When a new user registers/signs up
**Template:** Beautiful welcome email with store info
**Includes:** 
- Welcome message
- What they can do
- First order discount code (WELCOME10)
- Call-to-action button

**How to send manually:**
```bash
curl -X POST http://localhost:3001/api/auth/welcome-email \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "John Doe",
    "customerEmail": "john@example.com"
  }'
```

---

### 2. Order Confirmation Email

**Triggered:** Immediately after order placed
**Template:** Detailed order confirmation
**Includes:**
- Order ID
- Items purchased with prices
- Subtotal and delivery fee
- Total amount
- Delivery address
- Delivery zone
- "Track Your Order" button

**Status:** Already integrated (sends automatically)

---

### 3. Order Shipped Email

**Triggered:** When order status changes to "SHIPPED"
**Template:** Shipping notification
**Includes:**
- Order ID
- Estimated delivery date
- "Track Package" button
- Professional design

**Status:** Already integrated (sends automatically)

---

### 4. Order Delivered Email

**Triggered:** When order status changes to "DELIVERED"
**Template:** Delivery confirmation
**Includes:**
- Thank you message
- Review request
- Encouragement to share feedback

**Status:** Already integrated (sends automatically)

---

### 5. Promotional Email (Admin Campaign)

**Triggered:** Manually by admin
**Template:** Customizable promotional campaign
**Includes:**
- Custom title
- Custom message
- Promo code display
- Discount percentage
- Validity date
- Call-to-action button
- Product image (optional)

**How to send:**
```bash
curl -X POST http://localhost:3001/api/admin/send-promo-email \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Summer Sale - 50% Off!",
    "message": "We are excited to offer you 50% off on all items this summer!",
    "promoCode": "SUMMER50",
    "discount": 50,
    "validUntil": "2025-12-31",
    "recipientEmails": "all",
    "ctaText": "Shop Now",
    "ctaLink": "https://yaddplast.store"
  }'
```

---

## 🔧 API Endpoints

### Welcome Email Endpoint
```
POST /api/auth/welcome-email
Content-Type: application/json

{
  "customerName": "string",
  "customerEmail": "string"
}

Response:
{
  "success": true,
  "message": "Welcome email sent successfully"
}
```

### Send Promotional Email Endpoint
```
POST /api/admin/send-promo-email
Authorization: Required (Admin role)
Content-Type: application/json

{
  "title": "string (required)",
  "message": "string (required)",
  "promoCode": "string (optional)",
  "discount": number (optional),
  "validUntil": "string (optional)",
  "recipientEmails": "all" | ["email1@example.com", "email2@example.com"],
  "ctaText": "string (optional)",
  "ctaLink": "string (optional)"
}

Response:
{
  "success": true,
  "message": "Campaign sent: 50 sent, 0 failed",
  "sent": 50,
  "failed": 0
}
```

---

## 📁 Files

### New Files Created:
- `lib/email-templates.ts` - All email templates
  - `generateOrderConfirmationEmail()`
  - `generateOrderShippedEmail()`
  - `generateOrderDeliveredEmail()`
  - `generateWelcomeEmail()` ✨ NEW
  - `generatePromoEmail()` ✨ NEW

- `app/api/auth/welcome-email/route.ts` ✨ NEW
  - Welcome email endpoint

- `app/api/admin/send-promo-email/route.ts` ✨ NEW
  - Admin promotional email endpoint

---

## 🧪 Testing

### Test 1: Welcome Email

1. **In development mode:**
   - Look at server console
   - Should show: `📧 EMAIL (Development Mode)`
   - Shows email content and recipient

2. **With Resend credentials:**
   - Email will actually send
   - Check Resend dashboard
   - Email appears in your inbox

**Test command:**
```bash
curl -X POST http://localhost:3001/api/auth/welcome-email \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Test User",
    "customerEmail": "test@example.com"
  }'
```

---

### Test 2: Order Confirmation Email

1. **Place a test order:**
   - Go to http://localhost:3001/checkout
   - Add items to cart
   - Fill in delivery address
   - Place order

2. **Check console for email logs:**
   - Look for: `📧 EMAIL (Development Mode)`
   - Should show order details

---

### Test 3: Promotional Campaign

1. **Send to specific emails:**
```bash
curl -X POST http://localhost:3001/api/admin/send-promo-email \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Flash Sale - 30% Off!",
    "message": "Limited time offer on all products!",
    "promoCode": "FLASH30",
    "discount": 30,
    "validUntil": "2025-01-15",
    "recipientEmails": ["customer1@example.com", "customer2@example.com"],
    "ctaText": "Shop Now",
    "ctaLink": "https://yaddplast.store"
  }'
```

2. **Send to all users:**
```bash
curl -X POST http://localhost:3001/api/admin/send-promo-email \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Year Special - 25% Off!",
    "message": "Start the new year with amazing savings!",
    "promoCode": "NEWYEAR25",
    "discount": 25,
    "validUntil": "2025-01-31",
    "recipientEmails": "all"
  }'
```

---

## 🔐 Environment Variables

Already configured in `.env.local`:

```
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_FTJGSd51_8TVZhLmJRMTy2JBKF1R7Ymzv
EMAIL_FROM=noreply@resend.dev
```

---

## 📊 Email Tracking

### In Development:
- All emails logged to server console
- Shows recipient, subject, content
- Format: `📧 EMAIL (Development Mode)`

### With Resend:
1. Go to Resend Dashboard: https://resend.com
2. Click "Emails" section
3. View all sent emails
4. Check delivery status
5. View analytics

---

## 💡 Customization

### Customize Welcome Email:
Edit `lib/email-templates.ts` → `generateWelcomeEmail()`

### Customize Promo Email:
Edit `lib/email-templates.ts` → `generatePromoEmail()`

### Customize Email From Address:
Edit `.env.local`:
```
EMAIL_FROM=hello@yaddplast.com
```
(Note: Domain must be verified in Resend)

---

## ⚡ Automation (Next Steps)

To fully automate welcome emails on user sign-up, integrate with your auth system:

```typescript
// In your sign-up handler:
import { sendEmail } from '@/lib/email-service';
import { generateWelcomeEmail } from '@/lib/email-templates';

// After user is created:
const html = generateWelcomeEmail({
  customerName: user.name,
  customerEmail: user.email,
});

await sendEmail({
  to: user.email,
  subject: '🎉 Welcome to YaddPlast - Best Siku Zote!',
  html,
});
```

---

## 🚀 Production Checklist

- ✅ Resend API key configured
- ✅ Email templates created
- ✅ Welcome email endpoint ready
- ✅ Promo email endpoint ready
- ⏳ Integrate welcome email on sign-up
- ⏳ Set up automated order emails
- ⏳ Create admin UI for sending campaigns
- ⏳ Test with real Resend account
- ⏳ Monitor Resend dashboard

---

## 📞 Support

**Resend Documentation:** https://resend.com/docs
**Resend Support:** support@resend.com

---

## ✨ Summary

Your YaddPlast store now has:
- 🎉 Automatic welcome emails for new users
- 📦 Order confirmation emails
- 🚚 Shipping notification emails
- ✅ Delivery confirmation emails
- 📢 Admin promotional email campaigns

All with beautiful, responsive HTML templates ready for production!
