# Google OAuth Configuration Error - Troubleshooting Guide

## Current Error
**Error**: Configuration Error with Google OAuth Sign-in  
**Browser Error**: `ERR_BLOCKED_BY_CLIENT` / `Failed to load resource: net::ERR_BLOCKED_BY_CLIENT`

## Root Causes & Solutions

### 1. Ad Blocker or Browser Extension Blocking OAuth
**Symptoms**: `ERR_BLOCKED_BY_CLIENT` error in console  
**Solution**:
- Disable ad blockers (uBlock Origin, AdBlock Plus, etc.)
- Disable privacy extensions (Privacy Badger, Ghostery, etc.)
- Try in incognito/private browsing mode
- Test in a different browser

### 2. Environment Variables Not Set in Production
**Problem**: Your hosting platform (Vercel, Netlify, etc.) might not have environment variables configured

**Solution for Vercel**:
```bash
# Add these environment variables in Vercel Dashboard:
# Settings > Environment Variables

NEXTAUTH_URL=https://www.mywealthwise.tech
NEXTAUTH_SECRET=z3nYxy6Ii4PrNjvn2XRCdOom/JwROvJ6jddwldOatxA=
MONGODB_URI=mongodb+srv://...
GOOGLE_CLIENT_ID=1057396927164-pbuul9j0frem2b5lo6lq86nj0hr4q4db.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
NODE_ENV=production
```

### 3. Google OAuth Redirect URI Mismatch
**Current Google Console Settings**:
- ✅ Authorized JavaScript origins: `https://www.mywealthwise.tech` AND `https://mywealthwise.tech`
- ✅ Authorized redirect URIs: 
  - `https://www.mywealthwise.tech/api/auth/callback/google`
  - `https://mywealthwise.tech/api/auth/callback/google`

**Verify**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to: APIs & Services > Credentials
3. Click on your OAuth 2.0 Client ID
4. Ensure BOTH www and non-www versions are added
5. Click "Save" and wait 5 minutes for propagation

### 4. Domain Cookie Configuration
**Issue**: Cookies might not work across www/non-www domains

**Solution Applied**:
- Added `domain: '.mywealthwise.tech'` to cookie configuration
- This allows cookies to work on both www and non-www versions

### 5. HTTPS/Mixed Content Issues
**Verify**:
- All URLs must use `https://` not `http://`
- Check browser console for mixed content warnings
- Ensure your site has a valid SSL certificate

### 6. MongoDB Connection Issues
**Problem**: Database connection might be failing in production

**Check**:
```bash
# Verify MongoDB URI has correct format:
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
```

**Whitelist IP**:
1. Go to MongoDB Atlas Dashboard
2. Network Access > Add IP Address
3. Add `0.0.0.0/0` (allow from anywhere) for testing
4. Or add your hosting provider's IPs

## Testing Steps

### Step 1: Test Environment Variables
Visit: `https://www.mywealthwise.tech/api/debug/auth-config`
(Only works in development mode for security)

### Step 2: Check Server Logs
Look for these messages in deployment logs:
```
✅ All required environment variables are set
📍 NEXTAUTH_URL: https://www.mywealthwise.tech
📍 NODE_ENV: production
📍 Google Client ID: SET
```

### Step 3: Test Google OAuth
1. Clear browser cache and cookies
2. Disable ALL browser extensions
3. Try signing in with Google
4. Check browser console for errors
5. Check network tab for failed requests

### Step 4: Verify Database Connection
Check deployment logs for:
```
✅ Connected to MongoDB
✅ Database indexes created successfully
```

## Deployment Checklist

### Before Deploying:
- [ ] All environment variables set in hosting platform
- [ ] Google OAuth credentials verified in Google Console
- [ ] MongoDB IP whitelist configured
- [ ] SSL certificate is valid
- [ ] Domain DNS configured correctly

### After Deploying:
- [ ] Wait 5-10 minutes for DNS propagation
- [ ] Clear browser cache
- [ ] Test in incognito mode
- [ ] Test with ad blockers disabled
- [ ] Check deployment logs for errors

## Quick Fixes

### Fix 1: Redeploy with Environment Variables
```bash
# In your deployment platform, ensure all env vars are set
# Then redeploy:
git push origin main
```

### Fix 2: Force HTTPS Redirect
Add to `next.config.mjs`:
```javascript
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=31536000; includeSubDomains'
        }
      ]
    }
  ]
}
```

### Fix 3: Test Without OAuth
Try signing in with email/password first to verify the app works

## Debug Mode

Enable debug logging:
1. Add `DEBUG=true` to environment variables
2. Redeploy
3. Check logs for detailed NextAuth debug info

## Support

If issues persist:
1. Check browser console (F12 > Console tab)
2. Check network tab (F12 > Network tab)
3. Check deployment platform logs
4. Verify all steps in this guide

## Common Error Messages

### "Configuration Error"
→ Missing environment variables OR Google OAuth misconfiguration

### "ERR_BLOCKED_BY_CLIENT"
→ Ad blocker or browser extension blocking request

### "Access Denied"
→ Google OAuth consent screen or permissions issue

### "Database connection failed"
→ MongoDB URI incorrect or IP not whitelisted

## Production Deployment Commands

```bash
# 1. Build locally to test
npm run build

# 2. Check for build errors
npm run start

# 3. If successful, deploy
git add .
git commit -m "fix: Google OAuth configuration"
git push origin main
```

## Important Notes

1. **Wait Time**: After changing Google OAuth settings, wait 5-10 minutes
2. **Cache**: Always test in incognito mode or clear cache
3. **Ad Blockers**: Disable all extensions when testing
4. **Logs**: Always check server logs for detailed error messages
5. **Environment**: Ensure NODE_ENV=production is set correctly
