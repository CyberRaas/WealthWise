# Google Authentication Configuration Error - Complete Fix Guide

## 🔍 Issues Identified

### 1. **404 Error on `/contact` Route**

- **Error**: `GET https://www.mywealthwise.tech/contact?_rsc=13k66 404 (Not Found)`
- **Root Cause**: Error page was linking to non-existent `/contact` route
- **Fix Applied**: Changed to `mailto:support@mywealthwise.tech` link

### 2. **Cloudflare Insights Blocked**

- **Error**: `GET https://static.cloudflareinsights.com/beacon.min.js/vcd15cbe… net::ERR_BLOCKED_BY_CLIENT`
- **Root Cause**: Ad blocker/browser extension blocking Cloudflare analytics
- **Impact**: Non-critical, doesn't affect authentication
- **Solution**: Can be ignored or disable ad blocker for testing

### 3. **Google OAuth Configuration Error**

- **Error**: "Configuration Error - There is a problem with the authentication configuration"
- **Root Cause**: Missing or misconfigured Google OAuth redirect URIs

## ✅ Fixes Applied

### 1. Fixed Contact Link in Error Page

```javascript
// Before:
<Link href="/contact" className="...">Contact Support</Link>

// After:
<a href="mailto:support@mywealthwise.tech" className="...">Contact Support</a>
```

### 2. Enhanced Auth Configuration

- Added comprehensive error logging
- Added environment variable validation
- Added proper redirect callbacks
- Enhanced cookie security for production

## 🔧 Required Configuration Steps

### Step 1: Verify Environment Variables

Check your `.env.local` or `.env.production` file has:

```bash
# Required for NextAuth
NEXTAUTH_URL=https://www.mywealthwise.tech
NEXTAUTH_SECRET=z3nYxy6Ii4PrNjvn2XRCdOom/JwROvJ6jddwldOatxA=

# Google OAuth Credentials
GOOGLE_CLIENT_ID=1057396927164-pbuul9j0frem2b5lo6lq86nj0hr4q4db.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# MongoDB Connection
MONGODB_URI=mongodb+srv://vishwakarmaakashav17:AkashPython123@pythoncluster0.t9pop.mongodb.net/smart-financial-planner?retryWrites=true&w=majority

# Environment
NODE_ENV=production
```

### Step 2: Configure Google Cloud Console

**CRITICAL**: Add these Authorized Redirect URIs in Google Cloud Console:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Navigate to: **APIs & Services** → **Credentials**
4. Click on your OAuth 2.0 Client ID
5. Under **Authorized redirect URIs**, add these URLs:

```
https://www.mywealthwise.tech/api/auth/callback/google
https://mywealthwise.tech/api/auth/callback/google
http://localhost:3000/api/auth/callback/google
```

6. Under **Authorized JavaScript origins**, add:

```
https://www.mywealthwise.tech
https://mywealthwise.tech
http://localhost:3000
```

### Step 3: Verify DNS & Domain Configuration

Ensure your domain is properly configured:

```bash
# DNS Records should include:
A Record: mywealthwise.tech → Your server IP
CNAME: www.mywealthwise.tech → mywealthwise.tech

# Or for Vercel:
CNAME: mywealthwise.tech → cname.vercel-dns.com
CNAME: www.mywealthwise.tech → cname.vercel-dns.com
```

### Step 4: Clear Browser Cache & Cookies

```javascript
// Steps:
1. Open DevTools (F12)
2. Go to Application tab
3. Clear all cookies for mywealthwise.tech
4. Clear localStorage
5. Clear sessionStorage
6. Hard refresh (Ctrl + Shift + R)
```

### Step 5: Test Authentication Flow

1. **Local Testing**:

   ```bash
   npm run dev
   # Visit http://localhost:3000/auth/signin
   # Try Google Sign In
   ```

2. **Production Testing**:
   - Clear browser cache
   - Visit https://www.mywealthwise.tech/auth/signin
   - Click "Sign in with Google"
   - Check browser console for errors

## 🐛 Debugging Steps

### Check Server Logs

If deployed on Vercel:

```bash
vercel logs <your-deployment-url> --follow
```

Look for these log messages:

- ✅ All required environment variables are set
- ✅ MongoDB Adapter created successfully
- 🔐 Google OAuth profile received
- ✅ JWT Callback: User created/updated

### Common Error Messages & Solutions

#### Error: "Configuration"

**Cause**: Missing environment variables or invalid Google credentials
**Solution**:

1. Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
2. Check `NEXTAUTH_URL` matches your domain exactly
3. Ensure `NEXTAUTH_SECRET` is set

#### Error: "Callback"

**Cause**: Redirect URI mismatch
**Solution**:

1. Add exact callback URL to Google Console
2. Format: `https://YOUR_DOMAIN/api/auth/callback/google`
3. No trailing slashes

#### Error: "OAuthAccountNotLinked"

**Cause**: Email already exists with different provider
**Solution**:

- Already handled with `allowDangerousEmailAccountLinking: true`

#### Error: "AccessDenied"

**Cause**: User cancelled OAuth flow or insufficient permissions
**Solution**: Try again with proper Google account

## 📝 Updated Auth Configuration

The auth configuration now includes:

### Enhanced Error Logging

```javascript
logger: {
  error(code, ...message) {
    console.error('❌ NextAuth Error:', code)
    // Detailed error logging
  }
}
```

### Proper Redirect Handling

```javascript
async redirect({ url, baseUrl }) {
  // Allows relative callback URLs
  if (url.startsWith("/")) return `${baseUrl}${url}`
  // Allows callback URLs on the same origin
  else if (new URL(url).origin === baseUrl) return url
  return baseUrl
}
```

### Production-Ready Cookies

```javascript
cookies: {
  sessionToken: {
    name: process.env.NODE_ENV === 'production'
      ? `__Secure-next-auth.session-token`
      : `next-auth.session-token`,
    options: {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      domain: process.env.NODE_ENV === 'production' ? '.mywealthwise.tech' : undefined
    }
  }
}
```

### Environment Variable Validation

```javascript
const requiredEnvVars = [
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
  "MONGODB_URI",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
];

const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);
if (missingVars.length > 0) {
  console.error(
    "❌ Missing required environment variables:",
    missingVars.join(", ")
  );
}
```

## 🔒 Security Checklist

- [x] NEXTAUTH_SECRET is strong and random
- [x] HTTPS enabled in production
- [x] Secure cookies enabled in production
- [x] HttpOnly cookies to prevent XSS
- [x] SameSite=lax to prevent CSRF
- [x] Domain restriction for cookies
- [x] Email verification for OAuth users
- [x] Password hashing for credentials

## 🧪 Testing Checklist

### Local Development

- [ ] Sign in with Google works on localhost
- [ ] User created in MongoDB
- [ ] Session created correctly
- [ ] Redirected to onboarding (new users) or dashboard

### Production

- [ ] Sign in with Google works on production domain
- [ ] HTTPS certificate valid
- [ ] Cookies set correctly
- [ ] No console errors
- [ ] User redirected properly after auth
- [ ] Session persists across page reloads

## 🚀 Deployment Steps

### For Vercel Deployment:

1. **Set Environment Variables in Vercel**:

   ```bash
   vercel env add NEXTAUTH_SECRET production
   vercel env add NEXTAUTH_URL production
   vercel env add GOOGLE_CLIENT_ID production
   vercel env add GOOGLE_CLIENT_SECRET production
   vercel env add MONGODB_URI production
   ```

2. **Redeploy**:

   ```bash
   git add .
   git commit -m "fix: Google OAuth configuration"
   git push origin main
   ```

3. **Verify Deployment**:
   - Check deployment logs for errors
   - Test authentication flow
   - Monitor error logs

## 📊 Expected Log Output (Success)

```
✅ All required environment variables are set
📍 NEXTAUTH_URL: https://www.mywealthwise.tech
📍 NODE_ENV: production
📍 Google Client ID: SET
📍 MongoDB URI: SET
✅ MongoDB Adapter created successfully
🔌 Connecting to MongoDB...
✅ Connected to MongoDB successfully
✅ Database indexes verified/created successfully
🔐 Google OAuth profile received: { email: 'user@example.com', name: 'User Name' }
🔍 JWT Callback: Processing Google OAuth for user@example.com
✅ JWT Callback: Database connected
🔍 JWT Callback: User search result: Found
🔄 JWT Callback: Updating existing user
✅ JWT Callback: User updated
User signed in: user@example.com
```

## 🔄 Next Steps

1. ✅ **Fixed contact link** - No more 404 errors
2. ⚠️ **Configure Google Cloud Console** - Add redirect URIs
3. 🧪 **Test authentication** - Clear cache and try
4. 📊 **Monitor logs** - Check for errors
5. ✨ **Verify user creation** - Check MongoDB

## 💡 Additional Tips

### For Debugging on Production

1. **Enable debug mode temporarily**:

   ```javascript
   debug: true; // In auth.js (already enabled)
   ```

2. **Check browser console**:

   - Look for redirect URL mismatches
   - Check for CORS errors
   - Verify cookie settings

3. **Use network tab**:
   - Monitor `/api/auth/signin/google` request
   - Check `/api/auth/callback/google` response
   - Verify session cookie is set

### Common Gotchas

1. **Trailing slashes**: Never add trailing slashes to redirect URIs
2. **HTTP vs HTTPS**: Always use HTTPS in production
3. **www vs non-www**: Add both variants to Google Console
4. **Domain mismatches**: NEXTAUTH_URL must match exactly
5. **Environment variables**: Must restart server after changes

## 📞 Support

If issues persist after following this guide:

1. Check server logs for specific error codes
2. Verify all environment variables are set correctly
3. Ensure Google OAuth credentials are valid
4. Test with a different Google account
5. Clear all browser data and try again

## ✨ Success Indicators

You'll know it's working when:

- ✅ No "Configuration Error" message
- ✅ Google OAuth popup opens successfully
- ✅ User can select Google account
- ✅ Redirected to onboarding/dashboard after auth
- ✅ Session persists across page reloads
- ✅ No errors in browser console
- ✅ User appears in MongoDB database
