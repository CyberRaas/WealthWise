# Google Cloud Console - Step-by-Step Visual Guide

## 🔐 Adding Authorized Redirect URIs

### Step 1: Access Google Cloud Console

1. Go to: https://console.cloud.google.com
2. Sign in with your Google account
3. Select your project (or create one if needed)

### Step 2: Navigate to Credentials

```
Google Cloud Console
├── APIs & Services (left sidebar)
    └── Credentials
        └── OAuth 2.0 Client IDs
            └── Your Client ID (1057396927164-pbuul9j0frem2b5lo6lq86nj0hr4q4db.apps.googleusercontent.com)
```

### Step 3: Edit OAuth Client

When you click on your OAuth 2.0 Client ID, you'll see:

```
┌─────────────────────────────────────────────────┐
│ Edit OAuth client                               │
├─────────────────────────────────────────────────┤
│ Name: [Your App Name]                          │
│                                                 │
│ Authorized JavaScript origins                  │
│ ┌────────────────────────────────────────────┐ │
│ │ https://www.mywealthwise.tech              │ │
│ │ https://mywealthwise.tech                  │ │
│ │ http://localhost:3000                      │ │
│ └────────────────────────────────────────────┘ │
│ [+ ADD URI]                                     │
│                                                 │
│ Authorized redirect URIs                       │
│ ┌────────────────────────────────────────────┐ │
│ │ https://www.mywealthwise.tech/api/auth/    │ │
│ │   callback/google                           │ │
│ │ https://mywealthwise.tech/api/auth/        │ │
│ │   callback/google                           │ │
│ │ http://localhost:3000/api/auth/            │ │
│ │   callback/google                           │ │
│ └────────────────────────────────────────────┘ │
│ [+ ADD URI]                                     │
│                                                 │
│ [CANCEL]                            [SAVE]     │
└─────────────────────────────────────────────────┘
```

### Step 4: Add Authorized JavaScript Origins

Click "+ ADD URI" under "Authorized JavaScript origins" and add:

1. `https://www.mywealthwise.tech`
2. `https://mywealthwise.tech`
3. `http://localhost:3000`

**IMPORTANT NOTES**:

- ❌ NO trailing slash: `https://www.mywealthwise.tech/` (WRONG)
- ✅ Correct format: `https://www.mywealthwise.tech` (RIGHT)
- ❌ NO path: `https://www.mywealthwise.tech/home` (WRONG)
- ✅ Just domain: `https://www.mywealthwise.tech` (RIGHT)

### Step 5: Add Authorized Redirect URIs

Click "+ ADD URI" under "Authorized redirect URIs" and add:

1. `https://www.mywealthwise.tech/api/auth/callback/google`
2. `https://mywealthwise.tech/api/auth/callback/google`
3. `http://localhost:3000/api/auth/callback/google`

**IMPORTANT NOTES**:

- ✅ MUST include full path: `/api/auth/callback/google`
- ✅ MUST match exactly (case-sensitive)
- ❌ NO trailing slash: `...callback/google/` (WRONG)
- ✅ Correct format: `...callback/google` (RIGHT)

### Step 6: Save Changes

1. Click **[SAVE]** button at the bottom
2. Wait for "Client saved" confirmation
3. You may need to wait 5-10 minutes for changes to propagate

## 🔍 Verification

After saving, you should see:

```
OAuth 2.0 Client IDs
┌───────────────────────────────────────────────────────┐
│ Name: Your App Name                                   │
│ Client ID: 1057396927164-pbuul9j0fr...                │
│ Creation time: [Date]                                 │
│ Authorized redirect URIs: 3                           │
│ Authorized JavaScript origins: 3                      │
└───────────────────────────────────────────────────────┘
```

## 🚨 Common Mistakes to Avoid

### ❌ WRONG Examples

```javascript
// Wrong: Trailing slash
https://www.mywealthwise.tech/

// Wrong: Missing protocol
www.mywealthwise.tech

// Wrong: Wrong protocol in production
http://www.mywealthwise.tech

// Wrong: Extra path in origin
https://www.mywealthwise.tech/api

// Wrong: Trailing slash in redirect
https://www.mywealthwise.tech/api/auth/callback/google/

// Wrong: Missing path in redirect
https://www.mywealthwise.tech
```

### ✅ CORRECT Examples

```javascript
// Origins (no path, no trailing slash)
https://www.mywealthwise.tech
https://mywealthwise.tech
http://localhost:3000

// Redirect URIs (with full path, no trailing slash)
https://www.mywealthwise.tech/api/auth/callback/google
https://mywealthwise.tech/api/auth/callback/google
http://localhost:3000/api/auth/callback/google
```

## 📋 Pre-Flight Checklist

Before clicking SAVE, verify:

- [ ] Exactly 3 JavaScript origins added
- [ ] Exactly 3 redirect URIs added
- [ ] No trailing slashes anywhere
- [ ] HTTPS for production domains
- [ ] HTTP only for localhost
- [ ] Exact path: `/api/auth/callback/google`
- [ ] No typos in domain name

## ⏱️ Propagation Time

After saving:

- ⚡ Immediate: Changes saved in console
- 🕐 2-5 minutes: Changes active globally
- 🧪 Test: Try authentication after 5 minutes

## 🧪 Testing After Configuration

### Test 1: Local Development

```bash
# Start server
npm run dev

# Visit
http://localhost:3000/auth/signin

# Click "Sign in with Google"
# Should open Google OAuth popup
```

### Test 2: Production

```bash
# Visit
https://www.mywealthwise.tech/auth/signin

# Click "Sign in with Google"
# Should redirect to Google
# Then back to your app
```

## 🔍 Debugging Failed Attempts

If authentication still fails, check:

1. **Browser Console** (F12 → Console):

   ```javascript
   // Look for:
   Failed to load resource: the server responded with a status of 400
   // Or:
   redirect_uri_mismatch
   ```

2. **Error Message**:

   ```
   Error: redirect_uri_mismatch

   The redirect URI in the request:
   https://www.mywealthwise.tech/api/auth/callback/google

   does not match the ones authorized for the OAuth client.
   ```

   **Solution**: The exact URI shown in error must be in Google Console

3. **Network Tab** (F12 → Network):
   - Look for request to `/api/auth/signin/google`
   - Check response status (should be 302 redirect)
   - Check redirect location header

## 📸 Screenshot Reference Points

When in Google Cloud Console, look for:

1. **Left Sidebar**: "APIs & Services" → "Credentials"
2. **Main Area**: "OAuth 2.0 Client IDs" section
3. **Client Card**: Your client ID ending in `.apps.googleusercontent.com`
4. **Edit Screen**: Two sections - "Authorized JavaScript origins" and "Authorized redirect URIs"
5. **Save Button**: Bottom right corner

## ✅ Success Indicators

You know it worked when:

1. ✅ Clicking "Sign in with Google" opens OAuth popup
2. ✅ Can select Google account without errors
3. ✅ Redirected back to your application
4. ✅ User logged in successfully
5. ✅ No errors in browser console
6. ✅ Session persists after page reload

## 🆘 If Still Not Working

1. **Double-check URIs** in Google Console
2. **Copy-paste** from this guide (don't type manually)
3. **Wait 10 minutes** after saving
4. **Clear browser cache** completely
5. **Try incognito mode** to rule out cache issues
6. **Check server logs** for specific errors
7. **Verify environment variables** are loaded

## 📞 Support Resources

- Google OAuth Documentation: https://developers.google.com/identity/protocols/oauth2
- NextAuth.js Google Provider: https://next-auth.js.org/providers/google
- Common OAuth Errors: https://developers.google.com/identity/protocols/oauth2/web-server#error-codes

---

**Remember**: The most critical part is ensuring the redirect URIs match EXACTLY between Google Console and your application!
