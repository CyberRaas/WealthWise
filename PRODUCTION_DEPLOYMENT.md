# Production Deployment Guide for Smart Financial Planner

## Critical: Environment Variables Setup

Your application is showing a **Configuration Error** because the environment variables are not properly set in your production environment.

### Required Environment Variables

You MUST set these environment variables in your hosting platform (Vercel, Netlify, AWS, etc.):

```bash
# NextAuth Configuration (CRITICAL - App won't work without these)
NEXTAUTH_SECRET=z3nYxy6Ii4PrNjvn2XRCdOom/JwROvJ6jddwldOatxA=
NEXTAUTH_URL=https://www.mywealthwise.tech

# Database
MONGODB_URI=mongodb+srv://vishwakarmaakashav17:AkashPython123@pythoncluster0.t9pop.mongodb.net/smart-financial-planner?retryWrites=true&w=majority

# Google OAuth (Required for "Sign in with Google")
GOOGLE_CLIENT_ID=1057396927164-pbuul9j0frem2b5lo6lq86nj0hr4q4db.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=vishwakarmaakashav17@gmail.com
SMTP_PASSWORD=pfjk vvcd hljm xvcs

# Security
ENCRYPTION_SECRET=fdc6e144e71a4783be1f2b26c3bcd491c9a1a1fdfd621b5d8b0c9f4e1a7b2f35

# Node Environment
NODE_ENV=production

# AI Service
GEMINI_API_KEY=AIzaSyD2dRurJ0OVyUg5i-a10NHYfCnppZwoz54

# reCAPTCHA
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Ld5dMcrAAAAADYKH21AtWh-Ulv3mhYVKKskjoCZ
RECAPTCHA_SECRET_KEY=6Ld5dMcrAAAAADZFdNUaqXyrmQzS83iTLwjLKFjo

# Optional - Redis (if using)
REDIS_URL=redis://localhost:6379
```

---

## Google OAuth Configuration

### Step 1: Add Authorized Redirect URIs

Go to [Google Cloud Console](https://console.cloud.google.com/) and add these redirect URIs:

**For your production domain:**
```
https://www.mywealthwise.tech/api/auth/callback/google
https://mywealthwise.tech/api/auth/callback/google
```

**For testing (if needed):**
```
http://localhost:3000/api/auth/callback/google
```

### Step 2: Add Authorized JavaScript Origins

Add these origins in your Google OAuth credentials:
```
https://www.mywealthwise.tech
https://mywealthwise.tech
```

---

## Platform-Specific Instructions

### Vercel Deployment

1. Go to your project settings: `https://vercel.com/[your-username]/[project-name]/settings/environment-variables`
2. Add each environment variable listed above
3. Make sure to add them for the **Production** environment
4. Redeploy your application after adding variables

### Netlify Deployment

1. Go to Site settings > Build & deploy > Environment
2. Click "Edit variables"
3. Add each environment variable
4. Trigger a new deployment

### AWS/DigitalOcean/Other Platforms

1. Set environment variables according to your platform's documentation
2. Ensure `NEXTAUTH_URL` matches your production domain exactly
3. Restart your application after setting variables

---

## Domain Configuration

### Important Domain Notes

- Your main domain: `https://www.mywealthwise.tech`
- Ensure your `NEXTAUTH_URL` matches exactly (including `www` or without)
- If using both www and non-www, pick ONE for `NEXTAUTH_URL` and redirect the other

### SSL Certificate

Ensure your domain has a valid SSL certificate (HTTPS). Most hosting platforms provide this automatically.

---

## Testing After Deployment

### 1. Check Environment Variables

After deployment, verify environment variables are loaded:
```bash
# Check if the variables are accessible
curl https://www.mywealthwise.tech/api/test-env
```

### 2. Test Google OAuth

1. Go to: `https://www.mywealthwise.tech/auth/signin`
2. Click "Continue with Google"
3. Should redirect to Google's consent screen
4. After authorizing, should redirect back to your app

### 3. Common Issues

**Configuration Error:**
- ✅ Check `NEXTAUTH_SECRET` is set
- ✅ Check `NEXTAUTH_URL` matches your domain
- ✅ Verify Google OAuth redirect URIs are correct

**"Redirect URI mismatch" from Google:**
- ✅ Add the exact redirect URI shown in the error to Google Console
- Format should be: `https://your-domain.com/api/auth/callback/google`

**Database Connection Failed:**
- ✅ Check MongoDB URI is correct
- ✅ Verify MongoDB allows connections from your hosting platform's IPs
- ✅ Check MongoDB Atlas network access settings

---

## Security Checklist

- [ ] All environment variables are set in production
- [ ] `NODE_ENV=production` is set
- [ ] Google OAuth redirect URIs only include production domains
- [ ] MongoDB has proper network access restrictions
- [ ] SSL certificate is active and valid
- [ ] Secrets are not exposed in client-side code
- [ ] Error messages don't leak sensitive information

---

## Troubleshooting

### If you see "Configuration Error"

1. **Check server logs** for detailed error messages
2. **Verify environment variables** are set correctly
3. **Ensure NEXTAUTH_URL** matches your domain exactly
4. **Check Google OAuth credentials** are correct

### If Google Sign-in doesn't work

1. Open browser console (F12) and check for errors
2. Verify the redirect URI in the error message
3. Add that exact URI to Google Cloud Console
4. Wait 5 minutes for Google's cache to update
5. Try again

### If the app shows a blank page

1. Check browser console for JavaScript errors
2. Verify all required environment variables are set
3. Check build logs for any errors
4. Ensure the build completed successfully

---

## Contact Support

If issues persist after following this guide:
- Email: vishwakarmaakashav17@gmail.com
- Include: Error messages, browser console logs, and what you've tried

---

## Quick Fix Commands

### Regenerate NextAuth Secret (if needed)
```bash
openssl rand -base64 32
```

### Test MongoDB Connection
```bash
mongosh "mongodb+srv://vishwakarmaakashav17:AkashPython123@pythoncluster0.t9pop.mongodb.net/smart-financial-planner"
```

---

**Last Updated:** 2025-10-02
**Version:** 1.0
