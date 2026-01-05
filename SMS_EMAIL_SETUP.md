# 📧 Email & 📱 SMS Setup Guide - YaddPlast

## Overview

Your store now has email and SMS notification system ready! This guide helps you set up and configure the services.

---

## 🎯 What's Included

✅ **Email Service** - Order confirmation, shipping, delivery emails
✅ **SMS Service** - Text message notifications for customers in Kenya
✅ **Email Templates** - Beautiful HTML emails with order details
✅ **SMS Templates** - Pre-configured message templates
✅ **Notification Tracking** - See which emails/SMS were sent
✅ **Development Mode** - Test without real credentials

---

## 📧 PART 1: Email Setup (Resend)

### Step 1: Create Resend Account

1. Go to https://resend.com
2. Click **Sign Up**
3. Enter your email and create password
4. Verify your email
5. Log in to dashboard

### Step 2: Get API Key

1. In Resend dashboard, go to **API Keys** (left sidebar)
2. Click **Create New API Key**
3. Give it a name (e.g., "YaddPlast Store")
4. Copy the API key (starts with `re_`)
5. Save it safely

### Step 3: Verify Your Domain (Optional but Recommended)

1. Go to **Domains** in Resend
2. Click **Add Domain**
3. Enter: `yaddplast.store`
4. Copy the DNS records shown
5. Add them to your domain provider (Namecheap)
6. Wait for verification (5-10 minutes)

### Step 4: Add to Environment

Edit `.env.local`:

```
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=noreply@resend.dev
```

**For testing**, use `noreply@resend.dev` temporarily. After domain verification, use your custom domain.

### Pricing
- **Free tier**: 100 emails/day
- **Paid**: $20/month for unlimited

---

## 📱 PART 2: SMS Setup (Africa's Talking)

### Step 1: Create Account

1. Go to https://africastalking.com
2. Click **Sign Up**
3. Select **Kenya** as your country
4. Fill in details and verify email
5. Log in

### Step 2: Get Credentials

1. Go to **Settings** → **API Keys**
2. Copy your **API Key** (long string)
3. Note your **Username** (shown in account)
4. Go to **SMS** → **Sender IDs** (or **Long Codes**)
5. Create a sender ID named `YADDPLAST` or `YADDPLASTKO`
6. Wait for approval (usually instant)

### Step 3: Add to Environment

Edit `.env.local`:

```
SMS_PROVIDER=africas-talking
AFRICAS_TALKING_API_KEY=your_api_key_here
AFRICAS_TALKING_USERNAME=your_username_here
```

### Pricing
- **Free tier**: 1000 free SMS credits (when you sign up)
- **Cost**: ~KES 0.50 per SMS
- **No credit card required** for free tier

---

## 🔧 Configuration

### Current Setup in `.env.local`

```
# Email (Resend)
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_YOUR_API_KEY_HERE
EMAIL_FROM=noreply@resend.dev

# SMS (Africa's Talking)
SMS_PROVIDER=africas-talking
AFRICAS_TALKING_API_KEY=YOUR_API_KEY_HERE
AFRICAS_TALKING_USERNAME=YOUR_USERNAME_HERE
```

### Available Providers

**Email Options:**
- `resend` - Modern, fast (RECOMMENDED)
- `sendgrid` - Enterprise, reliable
- Leave blank - Logs to console (development)

**SMS Options:**
- `africas-talking` - Best for Kenya (RECOMMENDED)
- `twilio` - International
- Leave blank - Logs to console (development)

---

## 📨 Email Templates

### Included Templates

1. **Order Confirmation**
   - Sent immediately after order placed
   - Shows order details, items, total
   - Includes delivery address and estimated time

2. **Order Shipped**
   - Sent when order leaves warehouse
   - Shows estimated delivery date
   - Includes tracking link

3. **Order Delivered**
   - Sent when order arrives
   - Thanks customer for purchase
   - Includes review request

### Template Files
- Location: `lib/email-templates.ts`
- All templates are responsive and mobile-friendly
- Can be customized with your branding

---

## 📲 SMS Messages

### Included SMS Templates

1. **Order Confirmation SMS**
   ```
   Yadplast: Order #ABC123 confirmed! Total: KES 500. You'll receive tracking info soon. Thank you!
   ```

2. **Order Shipped SMS**
   ```
   Yadplast: Your order #ABC123 has shipped! Expected delivery: Tomorrow. Tracking info sent to email.
   ```

3. **Order Delivered SMS**
   ```
   Yadplast: Your order #ABC123 has been delivered! Thank you for shopping with us. Share your experience in a review.
   ```

4. **Payment Reminder SMS**
   ```
   Yadplast: Reminder - Your order #ABC123 is pending payment. Amount: KES 500. Complete payment now.
   ```

### SMS Template Files
- Location: `lib/sms-service.ts`
- Messages are kept under 160 characters (SMS limit)
- Can be customized for your business

---

## 🧪 Testing

### Test Email (Development Mode)

No credentials needed! Emails are logged to console:

```bash
# In your terminal, you'll see:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 EMAIL (Development Mode)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
To: customer@example.com
Subject: Order Confirmation - #123456
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[HTML content shown]
```

### Test SMS (Development Mode)

No credentials needed! SMS logged to console:

```bash
# In your terminal, you'll see:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📱 SMS (Development Mode)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
To: +254712345678
Message: Yadplast: Order #123456 confirmed!...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Test with Real Credentials

1. Add your Resend API key to `.env.local`
2. Add your Africa's Talking credentials to `.env.local`
3. Restart dev server: `pnpm dev`
4. Place a test order
5. Check your email and phone for notifications

---

## 🚀 Integration Points

### When Notifications Are Sent

**Order Confirmation (Email + SMS)**
- Triggered: Immediately after order placed
- File: `app/api/orders/create`

**Order Shipped (Email + SMS)**
- Triggered: When order status changed to "SHIPPED"
- File: `app/api/admin/orders/[id]/status`

**Order Delivered (Email + SMS)**
- Triggered: When order status changed to "DELIVERED"
- File: `app/api/admin/orders/[id]/status`

---

## 📊 Monitoring

### Check Email Logs

1. Log in to Resend dashboard
2. Go to **Emails** section
3. See all sent emails with status (delivered, bounced, etc)
4. View email content and analytics

### Check SMS Logs

1. Log in to Africa's Talking dashboard
2. Go to **SMS** → **Logs**
3. See all sent messages
4. View delivery status and costs

### Database Notifications

In your database, notifications are tracked:

```sql
-- View all notifications sent
SELECT * FROM Notification 
WHERE status = 'SENT' 
ORDER BY sentAt DESC;
```

---

## 🔒 Security Tips

1. **Keep API keys secret** - Never commit to git
2. **Use environment variables** - Already configured
3. **Test in development first** - Before going live
4. **Monitor costs** - Check SMS usage regularly
5. **Verify domains** - Use domain verification for better deliverability

---

## 💡 Troubleshooting

### Email not sending

**Problem**: "API key not configured"
- **Solution**: Add RESEND_API_KEY to .env.local and restart server

**Problem**: "Failed to send email"
- **Solution**: Check Resend API key is valid (starts with `re_`)
- **Solution**: Verify domain DNS records if using custom domain

### SMS not sending

**Problem**: "Africa's Talking error"
- **Solution**: Add AFRICAS_TALKING_API_KEY to .env.local
- **Solution**: Add AFRICAS_TALKING_USERNAME to .env.local
- **Solution**: Verify sender ID is approved in Africa's Talking dashboard

### Phone number format error

**Problem**: SMS to invalid number format
- **Solution**: Numbers are auto-formatted from 0712345678 → +254712345678
- **Solution**: Ensure customers provide 10-digit Kenyan numbers

---

## 📞 Support

### Resend Support
- Email: support@resend.com
- Docs: https://resend.com/docs

### Africa's Talking Support
- Email: support@africastalking.com
- Docs: https://africastalking.com/sms

---

## ✅ Checklist

- [ ] Created Resend account
- [ ] Got Resend API key
- [ ] (Optional) Verified domain with Resend
- [ ] Created Africa's Talking account
- [ ] Got Africa's Talking API key & username
- [ ] Added credentials to .env.local
- [ ] Tested email in development mode
- [ ] Tested SMS in development mode
- [ ] Placed test order
- [ ] Verified email received
- [ ] Verified SMS received (if credentials added)
- [ ] Checked Resend dashboard
- [ ] Checked Africa's Talking dashboard

---

**Your store is ready to send beautiful emails and SMS notifications!** 🎉
