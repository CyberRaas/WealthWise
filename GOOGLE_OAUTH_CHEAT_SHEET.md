# 🚨 GOOGLE OAUTH FIX - ONE-PAGE CHEAT SHEET

**Print this page and follow step-by-step** ✂️

---

## ⚡ THE FIX (2 Minutes)

### Step 1: Open Vercel

```
https://vercel.com/dashboard
→ Select your project
→ Settings
→ Environment Variables
```

### Step 2: Add Variable

```
Click "Add New"

Name:  AUTH_URL
Value: https://www.mywealthwise.tech

☑ Production
☑ Preview
☑ Development

Click "Save"
```

### Step 3: Redeploy

```
→ Deployments tab
→ Click latest deployment
→ ⋯ (three dots)
→ Redeploy
→ Wait 2-3 minutes
```

### Step 4: Test

```
Visit: https://www.mywealthwise.tech/auth/signin
Click: "Continue with Google"
✅ Should work!
```

---

## 🔍 VERIFICATION

Check these URLs:

```
✅ https://www.mywealthwise.tech/api/test-auth-config
   Should return: {"status": "OK"}

✅ https://www.mywealthwise.tech/api/auth/providers
   Should return: {"google": {...}}

✅ https://www.mywealthwise.tech/auth/signin
   Click Google → Should redirect to Google login
```

---

## ⚠️ TROUBLESHOOTING

### Still 500 error?

→ Check AUTH_URL has NO trailing slash
→ Must be: `https://www.mywealthwise.tech`
→ NOT: `https://www.mywealthwise.tech/`

### Still not working?

→ Clear browser cache
→ Try incognito mode
→ Disable ad blocker
→ Try different browser

### Need help?

→ Read: GOOGLE_OAUTH_QUICK_FIX.md
→ Or: GOOGLE_OAUTH_VISUAL_GUIDE.md

---

## 📋 REQUIRED ENV VARS

**In Vercel (all 3 environments):**

```bash
AUTH_URL = https://www.mywealthwise.tech
NEXTAUTH_URL = https://www.mywealthwise.tech
NEXTAUTH_SECRET = z3nYxy6Ii4PrNjvn2XRCdOom/JwROvJ6jddwldOatxA=
GOOGLE_CLIENT_ID = 1057396927164-pbuul9j0frem2b5lo6lq86nj0hr4q4db.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET = 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
MONGODB_URI = mongodb+srv://vishwakarmaakashav17:AkashPython123@pythoncluster0.t9pop.mongodb.net/smart-financial-planner?retryWrites=true&w=majority&appName=pythoncluster0
NODE_ENV = production
```

---

## 🎯 GOOGLE CLOUD CONSOLE

**Already correct - NO CHANGES NEEDED**

Redirect URIs:

```
✅ https://www.mywealthwise.tech/api/auth/callback/google
✅ https://mywealthwise.tech/api/auth/callback/google
```

---

## ✅ SUCCESS CHECKLIST

- [ ] Added AUTH_URL to Vercel
- [ ] Set for all 3 environments
- [ ] Saved variable
- [ ] Redeployed app
- [ ] Waited for deployment
- [ ] Tested Google sign-in
- [ ] Sign-in redirects to Google ✅
- [ ] Can login and see dashboard ✅
- [ ] User stays signed in after refresh ✅

---

**That's it! 🎉**

**Time: 5 minutes | Difficulty: Easy**

---

## 📞 STILL STUCK?

**Run this command to see logs:**

```powershell
npm i -g vercel
vercel login
vercel logs https://www.mywealthwise.tech --follow
```

**Get help:**

- Vercel: https://vercel.com/support/tickets
- NextAuth: https://discord.gg/nextauth

---

**Cut along this line** ✂️ **and keep handy!**
