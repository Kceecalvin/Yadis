# Google OAuth Setup Guide

## Quick Setup

### 1. Get Google OAuth Credentials

1. Go to https://console.cloud.google.com/
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure consent screen (required first time)
6. Choose "Web application"
7. Add authorized redirect URIs:
   - http://localhost:3001/api/auth/callback/google
   - http://localhost:3000/api/auth/callback/google (backup)
   - YOUR_PRODUCTION_URL/api/auth/callback/google (when deploying)

### 2. Add to .env.local

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your_actual_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_actual_client_secret_here

# NextAuth (keep existing or generate new)
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret-key-here
```

### 3. Generate NEXTAUTH_SECRET (if needed)

```bash
openssl rand -base64 32
```

### 4. Restart Server

```bash
pkill -f "next dev"
npm run dev
```

## Testing

Visit: http://localhost:3001/signup
Click "Sign up with Google" - should now work!

## Common Issues

- **"Sign up with Google" doesn't work**: Check credentials in .env.local
- **Redirect URI mismatch**: Ensure callback URL matches in Google Console
- **"Invalid client"**: Double-check GOOGLE_CLIENT_ID

