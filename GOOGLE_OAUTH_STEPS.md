# Google OAuth Setup - Final Steps

## ✅ What's Already Done

1. `.env.local` file created with generated secret
2. Payment buttons redesigned with cool icons (no prices shown)
3. All code is ready!

---

## 🔑 Complete Google OAuth Setup

### From Your Screenshot:

I can see you're on the **"Create OAuth client ID"** page. Here's what to do:

### Step 1: Fill the Form

**Application type:** 
- Already selected: ✅ Web application

**Name:**
- Already filled: ✅ "Kcee"

### Step 2: Add Authorized Redirect URIs

Click the **"+ Add URI"** button under **"Authorised redirect URIs"** and add:

**For Development:**
```
http://localhost:3000/api/auth/callback/google
```

**For Production (when deployed):**
```
https://yourdomain.vercel.app/api/auth/callback/google
```

### Step 3: Create

Click the blue **"Create"** button at the bottom.

### Step 4: Copy Credentials

After clicking create, you'll see a popup with:
- **Client ID** - Long string ending in `.apps.googleusercontent.com`
- **Client Secret** - Shorter random string

**Copy both of these!**

### Step 5: Update .env.local

Open `ecommerce-store/.env.local` and replace:

```bash
# Replace this line:
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"

# With your actual Client ID (from the popup):
GOOGLE_CLIENT_ID="123456789-abcdefghijk.apps.googleusercontent.com"

# Replace this line:
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# With your actual Client Secret:
GOOGLE_CLIENT_SECRET="GOCSPX-your-actual-secret"
```

---

## 🚀 Test It!

```bash
cd ecommerce-store

# Install dependencies (if not already done)
pnpm install

# Generate Prisma client
pnpm exec prisma generate

# Start the server
pnpm dev
```

Then:
1. Visit http://localhost:3000
2. Click **"Sign In"** button in header
3. Click **"Continue with Google"**
4. Sign in with your Google account
5. You should be redirected back and logged in!

---

## 🎨 Payment Buttons - What Changed

**Before:**
```
Pay with M-Pesa — KES 1,500
Pay with Card — KES 1,500
Pay on Delivery — KES 1,500
```

**After:**
```
[Money Icon] M-Pesa                    [→]
[Card Icon]  Credit / Debit Card      [→]
[Cash Icon]  Pay on Delivery          [→]
```

**Features:**
- ✅ No prices shown (cleaner look)
- ✅ Cool animated icons
- ✅ Hover effects (lift up slightly)
- ✅ Icon scaling on hover
- ✅ Arrow slides right on hover
- ✅ Professional and interactive

---

## 📁 Files Ready

**Environment:**
- `.env.local` ✅ Created with secret
- Waiting for your Google credentials

**Payment:**
- `app/checkout/page.tsx` ✅ Updated with icons

**Authentication:**
- `app/api/auth/[...nextauth]/route.ts` ✅
- `app/auth/signin/page.tsx` ✅
- `app/components/AuthButton.tsx` ✅
- All ready!

---

## ⚠️ Important Notes

### Database URL

In `.env.local`, you need to update:
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/ecommerce?schema=public"
```

Replace with:
- **For local development:** Your local PostgreSQL URL
- **For Vercel:** Use your Vercel Postgres URL from the Vercel dashboard

### NEXTAUTH_SECRET

Already generated and added: ✅
```
esFdQgOp/JYaqekgQkvw4LOh7ZZlroIui4+4TsUkDhQ=
```

---

## 🐛 Troubleshooting

### "Configuration not found"
- Make sure `.env.local` is in the `ecommerce-store/` folder
- Restart the dev server after adding credentials

### "Redirect URI mismatch"
- Double check the redirect URI in Google Console matches exactly:
  `http://localhost:3000/api/auth/callback/google`

### Sign-in button doesn't appear
- Clear browser cache
- Restart dev server
- Check console for errors

---

## ✨ What Happens After Sign-In

1. User clicks "Sign In" in header
2. Redirected to sign-in page
3. Clicks "Continue with Google"
4. Google OAuth popup appears
5. User authorizes the app
6. Redirected back to your site
7. User is now logged in!
8. Header shows user avatar/name
9. User can access personalization features

---

## 🎯 Next Steps

After Google OAuth is working:

1. **Test the flow:** Sign in and out
2. **Add profile page:** Where users manage their info
3. **Implement saved addresses:** Quick select at checkout
4. **Add favorites:** Heart icon on products
5. **Order history:** View past orders

---

**Almost there!** Just add your Google credentials and you're ready to go! 🚀
