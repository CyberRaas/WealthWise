# 🎯 Visual Guide: Fix Google OAuth in Vercel

## 📸 **STEP-BY-STEP WITH SCREENSHOTS GUIDE**

Follow this exactly to fix your Google OAuth error in 5 minutes.

---

## 🟢 **STEP 1: Go to Vercel Dashboard**

### What to do:

1. Open browser
2. Go to: **https://vercel.com/dashboard**
3. Log in if needed
4. Find and click your project: **smart-financial-planner** or **wealthwise**

### What you'll see:

```
┌─────────────────────────────────────────┐
│  VERCEL DASHBOARD                       │
├─────────────────────────────────────────┤
│  Your Projects:                         │
│  ┌─────────────────────────────────┐   │
│  │ 📦 smart-financial-planner      │   │  ← CLICK THIS
│  │ www.mywealthwise.tech           │   │
│  │ Last deployed: 2 hours ago      │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## 🟢 **STEP 2: Navigate to Settings**

### What to do:

1. Click **Settings** tab (top navigation)
2. Look for **Environment Variables** in left sidebar
3. Click **Environment Variables**

### Navigation path:

```
Dashboard → Your Project → Settings → Environment Variables
```

### What you'll see:

```
┌─────────────────────────────────────────┐
│  ⚙️ Settings                            │
├─────────────────────────────────────────┤
│  General                                │
│  Domains                                │
│  Git                                    │
│  ► Environment Variables  ← CLICK THIS │
│  Build & Development                    │
│  Functions                              │
└─────────────────────────────────────────┘
```

---

## 🟢 **STEP 3: Check Existing Variables**

### What you'll see:

Your current environment variables (you should already have these):

```
┌────────────────────────────────────────────────────────────┐
│  Environment Variables                                     │
├────────────────────────────────────────────────────────────┤
│  ✅ NEXTAUTH_URL          [Production] [Preview] [Develop] │
│     https://www.mywealthwise.tech                          │
├────────────────────────────────────────────────────────────┤
│  ✅ NEXTAUTH_SECRET       [Production] [Preview] [Develop] │
│     z3nYxy6Ii4PrNjvn2X... (hidden)                         │
├────────────────────────────────────────────────────────────┤
│  ✅ GOOGLE_CLIENT_ID      [Production] [Preview] [Develop] │
│     1057396927164-pbuul9j0frem2b5lo6lq86nj0hr4q4db...     │
├────────────────────────────────────────────────────────────┤
│  ✅ GOOGLE_CLIENT_SECRET  [Production] [Preview] [Develop] │
│     GOCSPX-P-HPqZkgQi1w8K... (hidden)                      │
├────────────────────────────────────────────────────────────┤
│  ❌ AUTH_URL              NOT SET ← THIS IS MISSING!       │
└────────────────────────────────────────────────────────────┘
```

**⚠️ PROBLEM:** `AUTH_URL` is missing! This is why Google OAuth fails.

---

## 🟢 **STEP 4: Add AUTH_URL Variable**

### What to do:

1. Click **"Add New"** button (top right)
2. A form will appear

### Fill in the form EXACTLY like this:

```
┌─────────────────────────────────────────────────┐
│  Add Environment Variable                       │
├─────────────────────────────────────────────────┤
│                                                 │
│  Name:                                          │
│  ┌───────────────────────────────────────┐     │
│  │ AUTH_URL                              │     │  ← Type this
│  └───────────────────────────────────────┘     │
│                                                 │
│  Value:                                         │
│  ┌───────────────────────────────────────┐     │
│  │ https://www.mywealthwise.tech         │     │  ← Type this
│  └───────────────────────────────────────┘     │
│                                                 │
│  Environment:                                   │
│  ☑ Production    ☑ Preview    ☑ Development    │  ← Check ALL
│                                                 │
│  [Cancel]                [Save] ← Click this   │
└─────────────────────────────────────────────────┘
```

### ⚠️ **CRITICAL - Type EXACTLY:**

```
Name:  AUTH_URL
Value: https://www.mywealthwise.tech
```

**NO trailing slash!**  
**Must be HTTPS (not http)!**  
**Include www. prefix!**

---

## 🟢 **STEP 5: Save Variable**

### What to do:

1. Verify all 3 environment checkboxes are checked:
   - ☑ Production
   - ☑ Preview
   - ☑ Development
2. Click **"Save"** button
3. You'll see a confirmation message

### Success confirmation:

```
┌─────────────────────────────────────────┐
│  ✅ Environment variable added          │
│     AUTH_URL was successfully saved     │
└─────────────────────────────────────────┘
```

---

## 🟢 **STEP 6: Verify AUTH_URL is Added**

### What you should now see:

```
┌────────────────────────────────────────────────────────────┐
│  Environment Variables                                     │
├────────────────────────────────────────────────────────────┤
│  ✅ AUTH_URL              [Production] [Preview] [Develop] │  ← NEW!
│     https://www.mywealthwise.tech                          │
├────────────────────────────────────────────────────────────┤
│  ✅ NEXTAUTH_URL          [Production] [Preview] [Develop] │
│     https://www.mywealthwise.tech                          │
├────────────────────────────────────────────────────────────┤
│  ✅ NEXTAUTH_SECRET       [Production] [Preview] [Develop] │
│     z3nYxy6Ii4PrNjvn2X... (hidden)                         │
├────────────────────────────────────────────────────────────┤
│  ✅ GOOGLE_CLIENT_ID      [Production] [Preview] [Develop] │
│     1057396927164-pbuul9j0frem2b5lo6lq86nj0hr4q4db...     │
├────────────────────────────────────────────────────────────┤
│  ✅ GOOGLE_CLIENT_SECRET  [Production] [Preview] [Develop] │
│     GOCSPX-P-HPqZkgQi1w8K... (hidden)                      │
└────────────────────────────────────────────────────────────┘
```

**✅ Perfect! AUTH_URL is now set for all environments.**

---

## 🟢 **STEP 7: Redeploy Your Application**

### What to do:

1. Click **"Deployments"** tab (top navigation)
2. Find the most recent deployment (top of list)
3. Click on it to open deployment details
4. Click **⋯ (three dots menu)** in top right
5. Select **"Redeploy"**
6. Click **"Redeploy"** button in confirmation dialog

### Navigation:

```
Dashboard → Your Project → Deployments → Latest → ⋯ → Redeploy
```

### What you'll see:

```
┌─────────────────────────────────────────┐
│  Redeploy to Production                 │
├─────────────────────────────────────────┤
│  This will trigger a new deployment     │
│  using the current settings.            │
│                                         │
│  ☐ Use existing build cache             │
│                                         │
│  [Cancel]         [Redeploy] ← Click   │
└─────────────────────────────────────────┘
```

---

## 🟢 **STEP 8: Wait for Deployment**

### What happens:

1. Vercel will start building your app
2. Progress bar shows build status
3. Usually takes 1-3 minutes

### What you'll see:

```
┌─────────────────────────────────────────┐
│  🔄 Building...                         │
│  ████████████░░░░░░░░░░ 60%            │
│                                         │
│  Status: Running build command          │
│  Time: 1m 23s                           │
└─────────────────────────────────────────┘
```

### When complete:

```
┌─────────────────────────────────────────┐
│  ✅ Deployment Complete                 │
│  Your deployment is now live            │
│                                         │
│  https://www.mywealthwise.tech          │
└─────────────────────────────────────────┘
```

---

## 🟢 **STEP 9: Test Google Sign-In**

### What to do:

1. Open new browser tab
2. Go to: **https://www.mywealthwise.tech/auth/signin**
3. Click **"Continue with Google"** button
4. **Expected result**: Redirects to Google login page

### Test flow:

```
Your App                    Google                  Your App
┌──────────┐              ┌──────────┐            ┌──────────┐
│ Sign In  │  Redirect    │ Google   │  Callback  │Dashboard │
│ Page     │ ──────────>  │ Login    │ ────────>  │ Page     │
│          │              │ Page     │            │          │
└──────────┘              └──────────┘            └──────────┘
   Step 1                    Step 2                 Step 3
```

### ✅ **Success indicators:**

- Click "Continue with Google" → Redirects to Google
- Login with Google account → Redirects back to app
- See dashboard with your name/avatar
- Refresh page → Still signed in

### ❌ **If still failing:**

- See error page → Note the error code
- Check browser console (F12) for errors
- Jump to **TROUBLESHOOTING** section below

---

## 🔍 **VERIFICATION TESTS**

After successful sign-in, verify these endpoints:

### **Test 1: Check Configuration**

```
URL: https://www.mywealthwise.tech/api/test-auth-config

Expected Response:
{
  "status": "OK",
  "message": "✅ All required environment variables are set!",
  "missingVariables": []
}
```

### **Test 2: Check Auth Providers**

```
URL: https://www.mywealthwise.tech/api/auth/providers

Expected Response:
{
  "google": {
    "id": "google",
    "name": "Google",
    "type": "oauth"
  }
}
```

### **Test 3: Check Session**

```
URL: https://www.mywealthwise.tech/api/auth/session

Expected Response:
{
  "user": {
    "name": "Your Name",
    "email": "your@email.com",
    ...
  }
}
```

---

## ⚠️ **TROUBLESHOOTING**

### **Problem 1: Still getting 500 error**

**Solution A - Clear Build Cache:**

1. Go to Vercel Deployments
2. Redeploy again
3. This time **UNCHECK** "Use existing build cache"
4. Click Redeploy

**Solution B - Check Environment Variables Again:**

1. Go to Settings → Environment Variables
2. Verify `AUTH_URL` value is EXACTLY:
   ```
   https://www.mywealthwise.tech
   ```
3. No extra spaces, no trailing slash
4. Must have `www.` prefix

### **Problem 2: Error "Configuration"**

**Solution:**

1. Verify `NEXTAUTH_SECRET` is set in Vercel
2. Generate new secret if needed:
   ```powershell
   # In PowerShell
   $bytes = New-Object byte[] 32
   [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
   [Convert]::ToBase64String($bytes)
   ```
3. Update in Vercel
4. Redeploy

### **Problem 3: Error "OAuthCallback"**

**Solution:**

1. Check Google Cloud Console
2. Verify redirect URI is EXACTLY:
   ```
   https://www.mywealthwise.tech/api/auth/callback/google
   ```
3. Save in Google Console
4. Wait 5 minutes for changes to propagate
5. Try again

### **Problem 4: Browser shows "Blocked by client"**

**Solution:**

1. Disable ad blocker extensions
2. Enable third-party cookies:
   - Chrome: Settings → Privacy → Cookies → "Allow all cookies"
   - Firefox: Settings → Privacy → "Standard"
3. Try in incognito/private mode
4. Try different browser

---

## 📋 **CHECKLIST - Did You Do Everything?**

Before asking for help, verify:

- [ ] Added `AUTH_URL` to Vercel environment variables
- [ ] Set for ALL THREE environments (Production, Preview, Development)
- [ ] Value is EXACTLY: `https://www.mywealthwise.tech`
- [ ] Clicked "Save" button
- [ ] Redeployed application
- [ ] Waited for deployment to complete (green checkmark)
- [ ] Tested in new browser tab/incognito mode
- [ ] Cleared browser cache and cookies
- [ ] Disabled ad blocker and privacy extensions
- [ ] Verified Google Cloud Console redirect URIs are correct
- [ ] Checked `/api/test-auth-config` shows "OK"

---

## 🎉 **SUCCESS!**

If you can:

- ✅ Click "Continue with Google"
- ✅ See Google login page
- ✅ Login and redirect back to dashboard
- ✅ See your profile in header
- ✅ Stay signed in after refresh

**CONGRATULATIONS! Google OAuth is now working! 🚀**

---

## 📞 **STILL NEED HELP?**

If you completed ALL steps above and it still doesn't work:

1. **Check Vercel Logs:**

   ```powershell
   npm i -g vercel
   vercel login
   vercel logs https://www.mywealthwise.tech --follow
   ```

2. **Screenshot these:**

   - Vercel Environment Variables page (blur sensitive values)
   - Browser console errors (F12 → Console tab)
   - Network tab showing failed request (F12 → Network tab)
   - Error page with error code

3. **Get help:**
   - Vercel Support: https://vercel.com/support/tickets
   - NextAuth Discord: https://discord.gg/nextauth
   - Include: Error screenshots, Vercel logs, Google Console settings

---

## 📊 **SUMMARY**

**What was wrong:**

- Missing `AUTH_URL` environment variable in Vercel
- NextAuth v5 requires both `AUTH_URL` and `NEXTAUTH_URL`

**What we fixed:**

- Added `AUTH_URL=https://www.mywealthwise.tech` to Vercel
- Set for all environments (Production, Preview, Development)
- Redeployed application

**Time to fix:** 5 minutes
**Difficulty:** Easy ⭐

**Now go build something awesome! 🚀**
