# 🚀 Google OAuth Deployment Checklist

## Critical Fix Applied ✅

The Google OAuth "Configuration Error" was caused by **middleware interfering with OAuth callbacks**. This has been fixed.

---

## ⚡ Required Actions Before Deployment

### 1. **Verify Google Cloud Console Settings**

Go to: [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)

**Authorized JavaScript origins:**
```
https://mywealthwise.tech
https://www.mywealthwise.tech
```

**Authorized redirect URIs:**
```
https://mywealthwise.tech/api/auth/callback/google
https://www.mywealthwise.tech/api/auth/callback/google
```

⚠️ **Important**: After saving, wait 5-10 minutes for changes to propagate.

---

### 2. **Set Production Environment Variables**

You MUST set these environment variables in your hosting platform (Vercel/Netlify/etc.):

```bash
NEXTAUTH_URL=https://mywealthwise.tech
NEXTAUTH_SECRET=z3nYxy6Ii4PrNjvn2XRCdOom/JwROvJ6jddwldOatxA=
GOOGLE_CLIENT_ID=1057396927164-pbuul9j0frem2b5lo6lq86nj0hr4q4db.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
MONGODB_URI=mongodb+srv://vishwakarmaakashav17:AkashPython123@pythoncluster0.t9pop.mongodb.net/smart-financial-planner?retryWrites=true&w=majority
NODE_ENV=production
```

#### If using Vercel:
1. Go to your project settings
2. Click "Environment Variables"
3. Add each variable above
4. Redeploy your application

#### If using Netlify:
1. Site settings → Environment Variables
2. Add each variable
3. Trigger new deploy

---

### 3. **Verify Files Changed**

Make sure these files are committed and deployed:

- ✅ `middleware.js` - Fixed OAuth callback handling
- ✅ `lib/auth.js` - Updated NextAuth v5 configuration
- ✅ `next.config.mjs` - Added CORS headers
- ✅ `app/auth/error/page.js` - Better error page

---

### 4. **Test the OAuth Flow**

After deploying:

1. ✅ Wait 5-10 minutes after Google Console changes
2. ✅ Clear browser cache or use Incognito mode
3. ✅ Disable ad blockers and privacy extensions
4. ✅ Go to `https://mywealthwise.tech/auth/signin`
5. ✅ Click "Continue with Google"
6. ✅ Should redirect to Google
7. ✅ After selecting account, should redirect back and sign in

---

## 🐛 Troubleshooting

### If you still see "Configuration Error":

**1. Check Production Logs**
- Vercel: Go to Deployments → Select latest → Functions → Check logs
- Look for NextAuth errors

**2. Verify Environment Variables in Production**
```bash
# Add this temporary route to check (remove after testing)
# Create: app/api/check-env/route.js
export async function GET() {
  return Response.json({
    hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
    hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasGoogleSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    nodeEnv: process.env.NODE_ENV
  })
}
```

Visit: `https://mywealthwise.tech/api/check-env`

Should return:
```json
{
  "hasNextAuthUrl": true,
  "hasGoogleClientId": true,
  "hasGoogleSecret": true,
  "nodeEnv": "production"
}
```

**3. ERR_BLOCKED_BY_CLIENT Error**
- This is a browser extension blocking Google's resources
- Disable: uBlock Origin, AdBlock, Privacy Badger, Ghostery
- Try in Incognito/Private mode
- Try different browser

**4. Check Google OAuth Consent Screen**
- Make sure your OAuth consent screen is published (not in testing mode)
- Or add your test email to the test users list

---

## 📝 What Was Fixed

### The Root Cause
Your `middleware.js` was redirecting authenticated users away from all `/auth/*` routes, including the OAuth callback route `/api/auth/callback/google`. This broke the OAuth flow.

### The Fix
1. **Middleware** - Now allows `/api/auth/*` routes to pass through first
2. **Auth Config** - Simplified Google Provider for NextAuth v5 compatibility
3. **Added basePath** - Explicitly set basePath for clarity
4. **Debug mode** - Enabled to see detailed errors in production logs
5. **Cookie config** - Proper secure cookie settings for production

---

## ✅ Deploy Now

```bash
# Commit changes
git add .
git commit -m "fix: resolve Google OAuth configuration error"
git push origin main
```

Then:
1. Wait for deployment to complete
2. Wait 5-10 minutes for Google changes to propagate
3. Test in incognito mode
4. Success! 🎉

---

## 📞 Still Having Issues?

Check your production logs for the actual error message. The error page will now show helpful information.

If the error persists, verify:
1. ✅ Environment variables are set in production
2. ✅ Google Console redirect URIs match exactly
3. ✅ NEXTAUTH_URL doesn't have trailing slash
4. ✅ Latest code is deployed
