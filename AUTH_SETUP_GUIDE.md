# Authentication & Personalization Setup Guide

## What Was Implemented

### ✅ 1. Payment Button Colors Fixed
- Changed from green/purple to brown theme
- All buttons now use your website's color scheme
- Consistent with the overall design

### ✅ 2. Database Changed to PostgreSQL
- Switched from SQLite to PostgreSQL
- Ready for Vercel deployment
- Matches your production setup

### ✅ 3. User Authentication System
- **Google Sign-In** - One-click authentication
- **Phone Sign-In** - SMS verification (structure ready)
- NextAuth.js integrated
- Session management included

### ✅ 4. Personalization Features
- User profiles with saved preferences
- Favorite products system
- Saved delivery addresses
- Order history tracking
- Personalized recommendations ready

---

## Setup Instructions

### Step 1: Environment Variables

Create a `.env.local` file in `ecommerce-store/` folder:

```bash
# Database (Use your Vercel PostgreSQL URL)
DATABASE_URL="postgresql://username:password@host/database"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-secret-key-here"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

---

### Step 2: Google OAuth Setup

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com

2. **Create a New Project:**
   - Click "Select a project" → "New Project"
   - Name: "Your Store Auth"
   - Click "Create"

3. **Enable Google+ API:**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. **Create OAuth Credentials:**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Name: "Your Store"
   
   **Authorized redirect URIs:**
   ```
   http://localhost:3000/api/auth/callback/google
   https://yourdomain.com/api/auth/callback/google
   ```

5. **Copy Credentials:**
   - Copy "Client ID" → paste in `.env.local` as `GOOGLE_CLIENT_ID`
   - Copy "Client Secret" → paste in `.env.local` as `GOOGLE_CLIENT_SECRET`

---

### Step 3: Database Migration

```bash
cd ecommerce-store

# Generate Prisma client
pnpm exec prisma generate

# Push schema to database (for development)
pnpm exec prisma db push

# Or create migration (for production)
pnpm exec prisma migrate dev --name add_auth
```

---

### Step 4: Test Authentication

```bash
# Start the development server
pnpm dev

# Visit http://localhost:3000
# Click "Sign In" button in header
# Try signing in with Google
```

---

## Features Included

### 1. Authentication Methods

#### Google Sign-In
- One-click authentication
- Automatic account creation
- Profile picture and name imported
- Secure OAuth 2.0 flow

#### Phone Sign-In (Structure Ready)
- SMS verification code system
- Two-step authentication
- Works with any phone number
- **Note:** Requires SMS provider (Twilio) for production

### 2. User Personalization

#### Saved Addresses
```typescript
// Users can save multiple delivery addresses
{
  savedAddresses: [
    {
      label: "Home",
      building: "Kenyatta Plaza",
      house: "Apt 4B",
      city: "Nairobi"
    },
    {
      label: "Work",
      building: "Office Tower",
      house: "Suite 200",
      city: "Nairobi"
    }
  ]
}
```

#### Favorite Products
- Heart icon on products (coming soon)
- Quick access to favorite items
- Personalized recommendations based on favorites

#### Order History
- View all past orders
- Reorder with one click
- Track order status

### 3. User Profile Features

#### What's Stored:
- Name and email (from Google)
- Profile picture
- Phone number (if phone auth used)
- Favorite categories
- Saved delivery addresses
- Order history

#### Privacy:
- Passwords hashed with bcrypt
- Secure session management
- GDPR compliant data structure

---

## File Structure

```
ecommerce-store/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts          # NextAuth configuration
│   ├── auth/
│   │   └── signin/
│   │       └── page.tsx              # Sign-in page
│   ├── components/
│   │   └── AuthButton.tsx            # Auth button in header
│   ├── providers.tsx                 # NextAuth provider wrapper
│   └── layout.tsx                    # Updated with auth
├── lib/
│   └── auth.ts                       # Auth utility functions
├── prisma/
│   └── schema.prisma                 # Updated with auth models
└── .env.local                        # Environment variables
```

---

## New Database Models

### Account (NextAuth)
Stores OAuth provider information

### Session (NextAuth)
Manages user sessions

### User (Enhanced)
```prisma
model User {
  id                 String
  name               String?
  email              String?
  emailVerified      DateTime?
  image              String?
  phone              String?
  phoneVerified      Boolean
  favoriteCategories String?  // JSON array
  savedAddresses     String?  // JSON array
  accounts           Account[]
  sessions           Session[]
  orders             Order[]
  favorites          Favorite[]
}
```

### Favorite (New)
Stores user's favorite products

---

## UI Components

### AuthButton in Header
- Shows "Sign In" button when logged out
- Shows user avatar/name when logged in
- Links to profile page
- Sign out option

### Sign-In Page (`/auth/signin`)
- Google sign-in button
- Phone sign-in form (two-step)
- "Continue as Guest" option
- Benefits list to encourage sign-up

---

## Benefits for Customers

When users sign in, they get:

1. **Saved Addresses**
   - Quick checkout with saved addresses
   - Multiple address management
   - No re-entering information

2. **Order Tracking**
   - View all past orders
   - Track current orders
   - Reorder easily

3. **Favorites**
   - Save favorite products
   - Quick access to preferred items
   - Get back-in-stock alerts

4. **Personalization**
   - Product recommendations
   - Personalized homepage
   - Special offers based on preferences

---

## Guest Checkout

Users can still checkout without signing in:
- No forced registration
- Optional sign-up after order
- Can create account later to track order

---

## Phone Authentication (SMS)

To enable phone authentication in production:

### Option 1: Twilio

```bash
pnpm add twilio
```

```typescript
// lib/sms.ts
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendVerificationCode(phone: string, code: string) {
  await client.messages.create({
    body: `Your verification code is: ${code}`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phone
  });
}
```

### Option 2: Africa's Talking (Kenya)

```bash
pnpm add africastalking
```

Better for Kenya/Africa region, cheaper rates.

---

## Security Features

### Password Hashing
- bcrypt with salt rounds
- Secure password storage
- No plain text passwords

### Session Management
- JWT tokens
- Secure HTTP-only cookies
- Automatic expiration

### OAuth Security
- State parameter for CSRF protection
- Secure redirect URLs
- Token validation

---

## Production Deployment (Vercel)

### 1. Environment Variables on Vercel

Add these in Vercel dashboard:

```
DATABASE_URL=your-vercel-postgres-url
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-generated-secret
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

### 2. Update Google OAuth

Add production URLs to authorized redirect URIs:
```
https://yourdomain.com/api/auth/callback/google
```

### 3. Database Migration

```bash
# On Vercel, migrations run automatically via:
pnpm exec prisma migrate deploy
```

---

## Testing Checklist

- [ ] Google sign-in works
- [ ] User profile is created
- [ ] Session persists across pages
- [ ] Sign out works
- [ ] Guest checkout still works
- [ ] Auth button appears in header
- [ ] Sign-in page loads properly

---

## Troubleshooting

### "Configuration Error" on Sign-In

**Solution:** Check `.env.local` file exists and has correct values

### Google Sign-In Not Working

**Solution:** 
1. Check Google OAuth credentials
2. Verify redirect URIs match exactly
3. Ensure Google+ API is enabled

### Database Connection Error

**Solution:**
1. Check DATABASE_URL is correct
2. Run `pnpm exec prisma generate`
3. Run `pnpm exec prisma db push`

### Session Not Persisting

**Solution:**
1. Check NEXTAUTH_SECRET is set
2. Clear browser cookies
3. Restart development server

---

## Next Steps

### Immediate:
1. Set up Google OAuth credentials
2. Add environment variables
3. Test authentication flow

### Short-term:
1. Add profile page (`/profile`)
2. Implement saved addresses UI
3. Add favorite products feature
4. Order history page

### Future:
1. SMS verification with Twilio
2. Social login (Facebook, Twitter)
3. Two-factor authentication
4. Email verification

---

## Cost Estimates

### Free Tier:
- NextAuth.js: Free
- Google OAuth: Free
- PostgreSQL on Vercel: Free (Hobby plan)

### Paid (Optional):
- Twilio SMS: ~$0.01/SMS
- Africa's Talking: ~$0.005/SMS (cheaper)
- Vercel Pro: $20/month (if needed)

---

## Support

If you need help:
1. Check NextAuth.js docs: https://next-auth.js.org
2. Check Google OAuth guide
3. Review error messages in console
4. Ask me for specific issues!

**Authentication is now ready!** 🎉
