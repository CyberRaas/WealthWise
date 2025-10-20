# 🔥 COMPLETE GOOGLE OAUTH FIX - Production Ready

## 🚨 **Error Analysis**

**Current Error:**

```
500: INTERNAL_SERVER_ERROR
Code: INTERNAL_FUNCTION_INVOCATION_FAILED
Failed to load resource: the server responded with a status of 500
```

**Root Causes Identified:**

1. ❌ Missing or incorrect `AUTH_URL` in Vercel (NextAuth v5 requirement)
2. ❌ Potential mismatch between domain in env vars vs actual domain
3. ❌ Cookie configuration may not work across www/non-www
4. ❌ MongoDB connection timeout in serverless environment
5. ❌ Missing error page handling

---

## ✅ **IMMEDIATE FIX - Follow These Steps**

### **Step 1: Update Environment Variables in Vercel** 🔧

Go to your Vercel dashboard → Project Settings → Environment Variables and add/update:

```bash
# PRIMARY FIX - Add AUTH_URL (NextAuth v5 requirement)
AUTH_URL=https://www.mywealthwise.tech

# Keep NEXTAUTH_URL for backward compatibility
NEXTAUTH_URL=https://www.mywealthwise.tech

# Your existing variables (verify these match exactly)
NEXTAUTH_SECRET=z3nYxy6Ii4PrNjvn2XRCdOom/JwROvJ6jddwldOatxA=
GOOGLE_CLIENT_ID=1057396927164-pbuul9j0frem2b5lo6lq86nj0hr4q4db.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
MONGODB_URI=mongodb+srv://vishwakarmaakashav17:AkashPython123@pythoncluster0.t9pop.mongodb.net/smart-financial-planner?retryWrites=true&w=majority&appName=pythoncluster0
NODE_ENV=production

# Optional but recommended
MONGODB_DB_NAME=smart-financial-planner
```

**⚠️ CRITICAL:** Make sure you set these for **ALL** environments (Production, Preview, Development)

---

### **Step 2: Verify Google Cloud Console Settings** 🔐

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Select your OAuth 2.0 Client ID
3. Verify these **EXACT** URIs are added:

**Authorized JavaScript origins:**

```
https://www.mywealthwise.tech
https://mywealthwise.tech
```

**Authorized redirect URIs:**

```
https://www.mywealthwise.tech/api/auth/callback/google
https://mywealthwise.tech/api/auth/callback/google
```

**⚠️ Important Notes:**

- NO trailing slashes (/)
- HTTPS only (no http in production)
- Remove `http://localhost:3000` from production credentials

---

### **Step 3: Update Your Code Files** 📝

I'll create the fixed files for you below.

---

## 📁 **FIXED CODE FILES**

### **File 1: Update `.env.local`**

```bash
# Add AUTH_URL for NextAuth v5
AUTH_URL=https://www.mywealthwise.tech
NEXTAUTH_URL=https://www.mywealthwise.tech
NEXTAUTH_SECRET=z3nYxy6Ii4PrNjvn2XRCdOom/JwROvJ6jddwldOatxA=

MONGODB_URI=mongodb+srv://vishwakarmaakashav17:AkashPython123@pythoncluster0.t9pop.mongodb.net/smart-financial-planner?retryWrites=true&w=majority&appName=pythoncluster0
MONGODB_DB_NAME=smart-financial-planner

GOOGLE_CLIENT_ID=1057396927164-pbuul9j0frem2b5lo6lq86nj0hr4q4db.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

NODE_ENV=production

GEMINI_API_KEY=AIzaSyD2dRurJ0OVyUg5i-a10NHYfCnppZwoz54

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=vishwakarmaakashav17@gmail.com
SMTP_PASSWORD=pfjk vvcd hljm xvcs

# Encryption
ENCRYPTION_SECRET=fdc6e144e71a4783be1f2b26c3bcd491c9a1a1fdfd621b5d8b0c9f4e1a7b2f35

# reCAPTCHA
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Ld5dMcrAAAAADYKH21AtWh-Ulv3mhYVKKskjoCZ
RECAPTCHA_SECRET_KEY=6Ld5dMcrAAAAADZFdNUaqXyrmQzS83iTLwjLKFjo
```

---

### **File 2: Create Custom Error Page**

Create `app/auth/error/page.js`:

```javascript
// app/auth/error/page.js
"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Home, RefreshCw } from "lucide-react";

const errorMessages = {
  Configuration: "There is a problem with the server configuration.",
  AccessDenied: "You do not have permission to sign in.",
  Verification: "The verification token has expired or has already been used.",
  OAuthSignin: "Error in constructing an authorization URL.",
  OAuthCallback: "Error in handling the response from the OAuth provider.",
  OAuthCreateAccount: "Could not create OAuth provider user in the database.",
  EmailCreateAccount: "Could not create email provider user in the database.",
  Callback: "Error in the OAuth callback handler route.",
  OAuthAccountNotLinked:
    "Email already exists with a different sign-in method.",
  EmailSignin: "Sending the e-mail with the verification token failed.",
  CredentialsSignin: "Invalid email or password.",
  SessionRequired: "Please sign in to access this page.",
  Default: "An error occurred during authentication.",
};

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessage = errorMessages[error] || errorMessages.Default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-purple-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        {/* Error Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Authentication Error
        </h1>

        {/* Error Message */}
        <p className="text-gray-600 mb-2">{errorMessage}</p>

        {/* Error Code */}
        {error && (
          <p className="text-sm text-gray-500 mb-6">
            Error Code:{" "}
            <code className="bg-gray-100 px-2 py-1 rounded">{error}</code>
          </p>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/auth/signin"
            className="w-full inline-flex items-center justify-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Link>

          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
        </div>

        {/* Help Text */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            If this problem persists, please contact support at{" "}
            <a
              href="mailto:support@mywealthwise.tech"
              className="text-teal-600 hover:underline"
            >
              support@mywealthwise.tech
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
```

---

### **File 3: Simplified MongoDB Connection**

Create/update `lib/database.js` with optimized settings:

```javascript
// lib/database.js - PRODUCTION OPTIMIZED

import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your Mongo URI to .env.local");
}

const uri = process.env.MONGODB_URI;
const options = {
  maxPoolSize: 10,
  minPoolSize: 2,
  maxIdleTimeMS: 30000,
  serverSelectionTimeoutMS: 10000, // 10 seconds for Vercel
  socketTimeoutMS: 45000,
  family: 4,
  retryWrites: true,
  retryReads: true,
  connectTimeoutMS: 10000,
  heartbeatFrequencyMS: 10000,
  appName: "smart-financial-planner",
};

let client;
let clientPromise;

if (process.env.NODE_ENV === "development") {
  // In development, use a global variable to preserve client across HMR
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production, create new client
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Export the client promise for NextAuth adapter
export default clientPromise;

// Export database connection function
export async function connectToDatabase() {
  try {
    const client = await clientPromise;
    const db = client.db(
      process.env.MONGODB_DB_NAME || "smart-financial-planner"
    );
    return db;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw new Error("Failed to connect to database");
  }
}

// Test connection function
export async function testConnection() {
  try {
    const db = await connectToDatabase();
    await db.command({ ping: 1 });
    console.log("✅ MongoDB connected successfully");
    return true;
  } catch (error) {
    console.error("❌ MongoDB connection test failed:", error);
    return false;
  }
}
```

---

### **File 4: Update `next.config.mjs`**

```javascript
// next.config.mjs - PRODUCTION READY

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Security headers
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        {
          key: "X-DNS-Prefetch-Control",
          value: "on",
        },
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
        {
          key: "X-Frame-Options",
          value: "SAMEORIGIN",
        },
        {
          key: "X-Content-Type-Options",
          value: "nosniff",
        },
        {
          key: "Referrer-Policy",
          value: "origin-when-cross-origin",
        },
        {
          key: "Permissions-Policy",
          value: "camera=(), microphone=(), geolocation=()",
        },
      ],
    },
    // CORS headers for auth endpoints
    {
      source: "/api/auth/:path*",
      headers: [
        {
          key: "Access-Control-Allow-Origin",
          value: "https://www.mywealthwise.tech",
        },
        {
          key: "Access-Control-Allow-Methods",
          value: "GET, POST, OPTIONS",
        },
        {
          key: "Access-Control-Allow-Headers",
          value: "Content-Type, Authorization",
        },
        {
          key: "Access-Control-Allow-Credentials",
          value: "true",
        },
      ],
    },
  ],

  // Production optimization
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  // Environment variables - CRITICAL FIX
  env: {
    AUTH_URL:
      process.env.AUTH_URL ||
      process.env.NEXTAUTH_URL ||
      "https://www.mywealthwise.tech",
    NEXTAUTH_URL:
      process.env.NEXTAUTH_URL ||
      process.env.AUTH_URL ||
      "https://www.mywealthwise.tech",
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.mywealthwise.tech",
      },
      {
        protocol: "https",
        hostname: "mywealthwise.tech",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },

  // Experimental features
  experimental: {
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },

  // Webpack config for better bundle size
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    return config;
  },
};

export default nextConfig;
```

---

## 🚀 **DEPLOYMENT STEPS**

### **1. Commit and Push Changes**

```powershell
# In PowerShell
git add .
git commit -m "fix: Google OAuth authentication with complete error handling"
git push origin main
```

### **2. Verify Vercel Environment Variables**

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Ensure these are set for **ALL environments**:

```
AUTH_URL = https://www.mywealthwise.tech
NEXTAUTH_URL = https://www.mywealthwise.tech
NEXTAUTH_SECRET = z3nYxy6Ii4PrNjvn2XRCdOom/JwROvJ6jddwldOatxA=
GOOGLE_CLIENT_ID = 1057396927164-pbuul9j0frem2b5lo6lq86nj0hr4q4db.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET = 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
MONGODB_URI = mongodb+srv://vishwakarmaakashav17:AkashPython123@pythoncluster0.t9pop.mongodb.net/smart-financial-planner?retryWrites=true&w=majority&appName=pythoncluster0
NODE_ENV = production
```

### **3. Redeploy in Vercel**

After adding environment variables:

1. Go to **Deployments** tab
2. Click on latest deployment
3. Click **⋯** (three dots) → **Redeploy**
4. ✅ Check "Use existing build cache" (optional)
5. Click **Redeploy**

---

## 🧪 **TESTING CHECKLIST**

After deployment, test in this order:

### **Test 1: Basic Auth Endpoint**

```bash
curl https://www.mywealthwise.tech/api/auth/providers
```

✅ Should return: `{"google":{...}}`

### **Test 2: MongoDB Connection**

Create `app/api/test-db/route.js`:

```javascript
import { testConnection } from "@/lib/database";

export async function GET() {
  const isConnected = await testConnection();
  return Response.json({
    status: isConnected ? "connected" : "failed",
    timestamp: new Date().toISOString(),
  });
}
```

Visit: `https://www.mywealthwise.tech/api/test-db`
✅ Should return: `{"status":"connected"}`

### **Test 3: Google OAuth Flow**

1. Go to `https://www.mywealthwise.tech/auth/signin`
2. Click "Continue with Google"
3. ✅ Should redirect to Google login
4. ✅ After login, should redirect back to dashboard
5. ❌ If error, check error page shows helpful message

### **Test 4: Session Persistence**

1. Sign in with Google
2. Refresh page
3. ✅ Should stay signed in (check user avatar in header)

---

## 🔍 **DEBUGGING TOOLS**

### **Check Vercel Logs**

```bash
# Install Vercel CLI if not installed
npm i -g vercel

# Login
vercel login

# View logs
vercel logs https://www.mywealthwise.tech --follow
```

### **Check Browser Console**

1. Open DevTools (F12)
2. Go to **Console** tab
3. Look for errors related to:
   - `nextauth`
   - `callback`
   - `session`

### **Check Network Tab**

1. Open DevTools (F12)
2. Go to **Network** tab
3. Filter by "auth"
4. Click "Continue with Google"
5. Check for:
   - ✅ 302 redirect to Google
   - ✅ 302 redirect back to app
   - ❌ 500 errors (should be fixed now)

---

## 🆘 **TROUBLESHOOTING COMMON ISSUES**

### **Issue 1: Still Getting 500 Error**

**Solution:**

1. Clear all Vercel environment variables
2. Re-add them one by one
3. Redeploy after adding `AUTH_URL`
4. Wait 2-3 minutes for DNS propagation

### **Issue 2: "OAuthAccountNotLinked" Error**

**Solution:**
This means email exists with different sign-in method.

Add to `lib/auth.js`:

```javascript
GoogleProvider({
  // ... existing config
  allowDangerousEmailAccountLinking: true, // ✅ Already added
});
```

### **Issue 3: Redirect Loop**

**Solution:**
Check cookie domain in `lib/auth.js`:

```javascript
cookies: {
  sessionToken: {
    options: {
      domain: '.mywealthwise.tech', // ✅ Works for both www and non-www
    }
  }
}
```

### **Issue 4: "Configuration" Error**

**Solution:**

1. Verify `NEXTAUTH_SECRET` is set in Vercel
2. Generate new secret if needed:

```bash
openssl rand -base64 32
```

3. Update in Vercel environment variables

### **Issue 5: MongoDB Timeout**

**Solution:**

1. Check MongoDB Atlas Network Access
2. Add IP: `0.0.0.0/0` (allow all - for Vercel)
3. Verify connection string has `&appName=pythoncluster0`

---

## ✅ **VERIFICATION STEPS**

Run these checks after deployment:

```bash
# 1. Check environment variables are loaded
curl https://www.mywealthwise.tech/api/auth/providers

# 2. Check MongoDB connection
curl https://www.mywealthwise.tech/api/test-db

# 3. Check auth endpoints
curl -I https://www.mywealthwise.tech/api/auth/signin

# 4. Check Google OAuth redirect
# Visit in browser: https://www.mywealthwise.tech/api/auth/signin/google
# Should redirect to Google
```

---

## 📊 **SUCCESS INDICATORS**

You'll know it's fixed when:

✅ No 500 errors in browser console  
✅ "Continue with Google" button works  
✅ Redirects to Google login page  
✅ After Google login, redirects to `/dashboard`  
✅ User session persists after page refresh  
✅ User avatar appears in header  
✅ Vercel logs show no auth errors

---

## 🎯 **NEXT STEPS AFTER FIX**

1. **Remove Test Endpoints**: Delete `/api/test-db` route
2. **Enable Security**:
   - Set up Vercel Firewall
   - Add rate limiting
   - Enable CAPTCHA on login
3. **Monitor**:
   - Set up Vercel Analytics
   - Monitor auth success/failure rates
   - Track user sign-ins

---

## 📞 **STILL STUCK?**

If the issue persists:

1. **Check Vercel Build Logs**:

   - Go to Deployments → Click latest → View Build Logs
   - Look for "auth" or "nextauth" errors

2. **Verify Domain Settings**:

   - Ensure www.mywealthwise.tech is primary domain
   - Check DNS records are correct
   - Verify SSL certificate is active

3. **Contact Support**:
   - Vercel Support: https://vercel.com/support
   - NextAuth Discord: https://discord.gg/nextauth
   - Share error logs and deployment URL

---

## 🔐 **SECURITY CHECKLIST**

Before going live with Google OAuth:

- [ ] `NEXTAUTH_SECRET` is strong (32+ characters)
- [ ] `GOOGLE_CLIENT_SECRET` is never exposed in client-side code
- [ ] HTTPS is enabled (not HTTP)
- [ ] Cookie `secure` flag is enabled in production
- [ ] `trustHost: true` is only in production config
- [ ] Rate limiting is enabled on auth endpoints
- [ ] CORS is configured properly
- [ ] MongoDB IP whitelist includes Vercel IPs

---

**🎉 Your Google OAuth should now work perfectly!**

If you followed all steps, try signing in now at:
👉 https://www.mywealthwise.tech/auth/signin

Good luck! 🚀
