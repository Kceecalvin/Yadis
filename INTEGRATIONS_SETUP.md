# Yadplast E-Commerce Platform - Free/Cheap Integrations Setup Guide

This guide covers setting up free and low-cost integrations for Email, SMS, and Caching.

---

## 📧 Email Integration (Free/Cheap Options)

### Option 1: **Resend** (RECOMMENDED FOR AFRICA) ⭐
**Cost:** Free tier: 100/day, Paid: $20/month for 10,000  
**Setup Time:** 5 minutes  
**Best For:** Production emails, good deliverability

#### Setup Steps:

1. **Create Account:**
   ```bash
   # Go to https://resend.com
   # Sign up and verify email
   ```

2. **Get API Key:**
   - Dashboard → API Keys → Create New
   - Copy the key

3. **Install Package:**
   ```bash
   cd ecommerce-store
   pnpm add resend
   ```

4. **Create Email Service:**
   ```typescript
   // lib/email-service.ts
   import { Resend } from 'resend';

   const resend = new Resend(process.env.RESEND_API_KEY);

   export async function sendEmail(
     to: string,
     subject: string,
     html: string
   ) {
     return resend.emails.send({
       from: 'noreply@yadplast.com',
       to,
       subject,
       html,
     });
   }
   ```

5. **Environment Variables:**
   ```env
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   ```

---

### Option 2: **SendGrid** (POPULAR)
**Cost:** Free tier: 100/day, Paid: $9.95+/month  
**Setup Time:** 10 minutes

#### Setup Steps:

1. **Create Account:** https://sendgrid.com/free
2. **Get API Key:** Settings → API Keys
3. **Install Package:**
   ```bash
   pnpm add @sendgrid/mail
   ```

4. **Create Service:**
   ```typescript
   // lib/email-service.ts
   import sgMail from '@sendgrid/mail';

   sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

   export async function sendEmail(
     to: string,
     subject: string,
     html: string
   ) {
     return sgMail.send({
       to,
       from: 'noreply@yadplast.com',
       subject,
       html,
     });
   }
   ```

5. **Environment Variables:**
   ```env
   SENDGRID_API_KEY=SG.xxxxxxxxx
   ```

---

### Option 3: **Mailtrap** (BEST FOR TESTING)
**Cost:** Free tier: 500/month, Paid: $25+/month  
**Best For:** Development and testing

#### Setup:
1. Sign up at https://mailtrap.io
2. Get SMTP credentials
3. Use Nodemailer with SMTP:

```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

export async function sendEmail(
  to: string,
  subject: string,
  html: string
) {
  return transporter.sendMail({
    from: 'noreply@yadplast.com',
    to,
    subject,
    html,
  });
}
```

---

## 📱 SMS Integration (Free/Cheap Options)

### Option 1: **Africa's Talking** (BEST FOR KENYA) ⭐
**Cost:** Pay-as-you-go, ~KES 0.50 per SMS  
**Setup Time:** 10 minutes  
**Best For:** Kenya, East Africa

#### Setup Steps:

1. **Create Account:** https://africastalking.com/
   - Sign up with business email
   - Complete KYC verification

2. **Get API Key:**
   - Dashboard → Settings → API Key
   - Copy the key

3. **Install Package:**
   ```bash
   pnpm add africastalking
   ```

4. **Create SMS Service:**
   ```typescript
   // lib/sms-service.ts
   import AfricasTalking from 'africastalking';

   const africastalking = AfricasTalking({
     apiKey: process.env.AFRICAS_TALKING_API_KEY,
     username: process.env.AFRICAS_TALKING_USERNAME,
   });

   export async function sendSMS(phoneNumber: string, message: string) {
     return africastalking.SMS.send({
       to: [phoneNumber],
       message,
     });
   }
   ```

5. **Environment Variables:**
   ```env
   AFRICAS_TALKING_API_KEY=xxxxxxxxxxxxx
   AFRICAS_TALKING_USERNAME=YadplastStore
   ```

6. **Format Phone Numbers:**
   ```typescript
   // Always use +254... format for Kenya
   const formatPhone = (phone: string) => {
     if (phone.startsWith('0')) {
       return '+254' + phone.slice(1);
     }
     return phone;
   };
   ```

---

### Option 2: **Twilio** (POPULAR GLOBALLY)
**Cost:** Free trial: $15 credit, Paid: ~$0.0075/SMS  
**Setup Time:** 15 minutes

#### Setup:
1. Sign up: https://www.twilio.com/
2. Get credentials from Console
3. Install package:
   ```bash
   pnpm add twilio
   ```

4. Create service:
   ```typescript
   // lib/sms-service.ts
   import twilio from 'twilio';

   const client = twilio(
     process.env.TWILIO_ACCOUNT_SID,
     process.env.TWILIO_AUTH_TOKEN
   );

   export async function sendSMS(phoneNumber: string, message: string) {
     return client.messages.create({
       body: message,
       from: process.env.TWILIO_PHONE_NUMBER,
       to: phoneNumber,
     });
   }
   ```

---

### Option 3: **Vonage (ex-Nexmo)** (COMPETITIVE PRICING)
**Cost:** Free trial, Paid: ~$0.06/SMS  
**Best For:** Global coverage

#### Setup:
```bash
pnpm add @vonage/server-sdk
```

---

## 🚀 Caching Integration (Free/Cheap Options)

### Option 1: **Redis Cloud** (RECOMMENDED) ⭐
**Cost:** Free tier: 30MB RAM, Paid: $15+/month  
**Setup Time:** 5 minutes

#### Setup Steps:

1. **Create Account:** https://redis.com/try-free/
   - Sign up (free tier available)
   - Create database

2. **Get Connection String:**
   - Database → Configuration
   - Copy Redis URI

3. **Install Package:**
   ```bash
   pnpm add redis
   ```

4. **Create Cache Service:**
   ```typescript
   // lib/redis-cache.ts
   import { createClient } from 'redis';

   const client = createClient({
     url: process.env.REDIS_URL,
   });

   client.on('error', (err) => console.error('Redis error:', err));

   export async function connectRedis() {
     if (!client.isOpen) {
       await client.connect();
     }
   }

   export async function setCacheRedis(
     key: string,
     value: any,
     ttl: number = 600
   ) {
     await connectRedis();
     return client.setEx(key, ttl, JSON.stringify(value));
   }

   export async function getCacheRedis(key: string) {
     await connectRedis();
     const value = await client.get(key);
     return value ? JSON.parse(value) : null;
   }

   export async function deleteCacheRedis(key: string) {
     await connectRedis();
     return client.del(key);
   }

   export default client;
   ```

5. **Environment Variables:**
   ```env
   REDIS_URL=redis://default:password@host:port
   ```

---

### Option 2: **Upstash Redis** (SIMPLE, SERVERLESS)
**Cost:** Free tier: 10k commands/day, $0.2/100k commands  
**Setup Time:** 5 minutes

#### Setup:
1. Sign up: https://upstash.com/
2. Create database
3. Copy REST API URL
4. Use same code as Redis Cloud

---

### Option 3: **Valkey (Open Source Alternative)**
**Cost:** Free (self-hosted)  
**Setup Time:** 10 minutes

For development/testing, run locally:
```bash
# Using Docker
docker run -d -p 6379:6379 valkey/valkey:latest

# Or install locally (macOS)
brew install valkey
valkey-server
```

---

## 🔌 Complete Integration Implementation

### Step 1: Update Notifications Service

```typescript
// lib/notifications-integrated.ts
import { sendEmail } from './email-service';
import { sendSMS } from './sms-service';

export async function sendNotification(notificationId: string) {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
    include: { user: true },
  });

  if (!notification) return;

  try {
    if (notification.sentVia === 'EMAIL') {
      await sendEmail(
        notification.user?.email!,
        notification.title,
        generateEmailTemplate(notification)
      );
    } else if (notification.sentVia === 'SMS') {
      await sendSMS(
        notification.user?.phone!,
        notification.message
      );
    }

    // Update status
    await prisma.notification.update({
      where: { id: notificationId },
      data: {
        status: 'SENT',
        sentAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Failed to send notification:', error);
    await prisma.notification.update({
      where: { id: notificationId },
      data: { status: 'FAILED' },
    });
  }
}

function generateEmailTemplate(notification: any): string {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background: white; padding: 20px;">
          <h2>${notification.title}</h2>
          <p>${notification.message}</p>
          <footer style="color: #666; font-size: 12px; margin-top: 20px;">
            © 2025 Yadplast. All rights reserved.
          </footer>
        </div>
      </body>
    </html>
  `;
}
```

### Step 2: Update Environment Variables

```env
# Email Service (choose one)
# For Resend
RESEND_API_KEY=re_xxxxx

# For SendGrid
SENDGRID_API_KEY=SG.xxxxx

# SMS Service (choose one)
# For Africa's Talking
AFRICAS_TALKING_API_KEY=xxxxx
AFRICAS_TALKING_USERNAME=YadplastStore

# For Twilio
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+1234567890

# Caching
REDIS_URL=redis://default:password@host:port
```

### Step 3: Test Integrations

```bash
# Create test file
cat > test-integrations.ts << 'EOF'
import { sendEmail } from './lib/email-service';
import { sendSMS } from './lib/sms-service';
import { getCacheRedis, setCacheRedis } from './lib/redis-cache';

async function testIntegrations() {
  console.log('Testing Email...');
  try {
    await sendEmail('test@example.com', 'Test Email', '<p>This is a test</p>');
    console.log('✅ Email sent successfully');
  } catch (e) {
    console.error('❌ Email failed:', e);
  }

  console.log('Testing SMS...');
  try {
    await sendSMS('+254712345678', 'Test SMS from Yadplast');
    console.log('✅ SMS sent successfully');
  } catch (e) {
    console.error('❌ SMS failed:', e);
  }

  console.log('Testing Cache...');
  try {
    await setCacheRedis('test-key', { message: 'Hello' }, 300);
    const value = await getCacheRedis('test-key');
    console.log('✅ Cache works:', value);
  } catch (e) {
    console.error('❌ Cache failed:', e);
  }
}

testIntegrations();
EOF

# Run test
pnpm tsx test-integrations.ts
```

---

## 💰 Cost Summary (Monthly)

| Service | Free Tier | Paid (Min) | Best For |
|---------|-----------|-----------|----------|
| Resend | 100 emails/day | $20 | Production emails |
| SendGrid | 100 emails/day | $10 | Reliable emails |
| Africa's Talking | Pay-as-you-go | ~KES 250/mo | Kenya SMS |
| Twilio | $15 credit | $0.0075/SMS | Global SMS |
| Redis Cloud | 30MB | $15 | Production cache |
| Upstash | 10k commands/day | $0.2/100k | Serverless |

**Estimated Monthly Cost (Small Business):**
- Email: $0-20 (depends on volume)
- SMS: $0-50 (depends on volume)
- Cache: $0-15
- **Total: $0-85/month**

---

## 🚀 Production Checklist

- [ ] Email service configured and tested
- [ ] SMS service configured and tested
- [ ] Redis/cache configured and tested
- [ ] Environment variables set in production
- [ ] Error handling implemented
- [ ] Monitoring/logging setup
- [ ] Rate limiting configured
- [ ] Fallback mechanisms in place

---

## 📞 Support & Troubleshooting

### Common Issues:

**Email not sending:**
- Check API key is valid
- Verify email addresses are correct
- Check spam folder
- Review service logs

**SMS delivery failing:**
- Verify phone number format (+254...)
- Check account has balance/credits
- Confirm number is active
- Check message length

**Cache not connecting:**
- Verify Redis URL is correct
- Check network/firewall rules
- Ensure Redis is running
- Test with simple key-value

---

**Last Updated:** December 31, 2025
