# Production Deployment Checklist for WealthWise

## ✅ Pre-Deployment Steps

### 1. Environment Variables
Ensure ALL these variables are set in your hosting platform (Vercel/Netlify):

```bash
# Authentication
NEXTAUTH_URL=https://www.mywealthwise.tech
NEXTAUTH_SECRET=z3nYxy6Ii4PrNjvn2XRCdOom/JwROvJ6jddwldOatxA=

# Database
MONGODB_URI=mongodb+srv://vishwakarmaakashav17:AkashPython123@pythoncluster0.t9pop.mongodb.net/smart-financial-planner?retryWrites=true&w=majority

# Google OAuth
GOOGLE_CLIENT_ID=1057396927164-pbuul9j0frem2b5lo6lq86nj0hr4q4db.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=vishwakarmaakashav17@gmail.com
SMTP_PASSWORD=pfjk vvcd hljm xvcs

# Security
ENCRYPTION_SECRET=fdc6e144e71a4783be1f2b26c3bcd491c9a1a1fdfd621b5d8b0c9f4e1a7b2f35

# APIs
GEMINI_API_KEY=AIzaSyD2dRurJ0OVyUg5i-a10NHYfCnppZwoz54

# reCAPTCHA
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Ld5dMcrAAAAADYKH21AtWh-Ulv3mhYVKKskjoCZ
RECAPTCHA_SECRET_KEY=6Ld5dMcrAAAAADZFdNUaqXyrmQzS83iTLwjLKFjo

# Environment
NODE_ENV=production
```

### 2. Google Cloud Console Configuration
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to: APIs & Services > Credentials
3. Select your OAuth 2.0 Client ID
4. Configure:

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

5. Click **SAVE** and wait 5-10 minutes

### 3. MongoDB Atlas Configuration
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Select your cluster
3. Click "Network Access"
4. Add IP Addresses:
   - Click "Add IP Address"
   - Select "Allow Access from Anywhere" (`0.0.0.0/0`)
   - Or add your hosting provider's specific IPs
5. Click "Confirm"

### 4. Domain & DNS Configuration
Ensure your domain is properly configured:
- [ ] A record points to your hosting provider's IP
- [ ] CNAME for www subdomain (if using www)
- [ ] SSL certificate is active and valid
- [ ] Both www and non-www versions work

### 5. Local Build Test
```bash
# Install dependencies
npm install

# Build the project
npm run build

# Test production build locally
npm run start

# Visit http://localhost:3000 and test
```

## 🚀 Deployment Steps

### For Vercel:
```bash
# 1. Install Vercel CLI (if not already)
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel --prod

# Or simply push to main branch if connected to Git
git add .
git commit -m "feat: production-ready deployment"
git push origin main
```

### For Netlify:
```bash
# 1. Build the project
npm run build

# 2. Deploy via Netlify CLI
netlify deploy --prod

# Or use Netlify's Git integration
git push origin main
```

## ✅ Post-Deployment Verification

### 1. Environment Variables Check
Visit your deployment logs and verify:
```
✅ All required environment variables are set
📍 NEXTAUTH_URL: https://www.mywealthwise.tech
📍 NODE_ENV: production
📍 Google Client ID: SET
```

### 2. Database Connection
Check logs for:
```
✅ Connected to MongoDB
✅ Database indexes created successfully
```

### 3. Authentication Testing
Test each auth method:
- [ ] Email/Password Sign Up
- [ ] Email/Password Sign In
- [ ] Google OAuth Sign In
- [ ] Password Reset
- [ ] Email Verification

### 4. Google OAuth Specific Testing
1. Clear browser cache and cookies
2. Disable ad blockers and extensions
3. Open incognito/private window
4. Navigate to: `https://www.mywealthwise.tech/auth/signin`
5. Click "Sign in with Google"
6. Verify:
   - [ ] Google sign-in popup appears
   - [ ] No browser console errors
   - [ ] Successfully redirects back to app
   - [ ] User is authenticated

### 5. Page Load Testing
Test all major pages:
- [ ] Homepage loads
- [ ] Sign in page loads
- [ ] Sign up page loads
- [ ] Dashboard loads (after auth)
- [ ] No 404 errors
- [ ] No console errors

### 6. Security Headers
Check headers using: https://securityheaders.com/
- [ ] HTTPS is enforced
- [ ] Security headers are set
- [ ] Cookies are secure and httpOnly

## 🐛 Common Issues & Solutions

### Issue: "Configuration Error"
**Solutions:**
1. Verify all environment variables are set in hosting platform
2. Redeploy after setting variables
3. Check deployment logs for missing vars
4. Wait 5-10 minutes after deploying

### Issue: "ERR_BLOCKED_BY_CLIENT"
**Solutions:**
1. Disable ad blockers (uBlock, AdBlock, etc.)
2. Disable privacy extensions
3. Test in incognito mode
4. Try different browser

### Issue: Google OAuth Not Working
**Solutions:**
1. Verify redirect URIs in Google Console
2. Check that both www and non-www are added
3. Wait 5-10 minutes after Google Console changes
4. Clear browser cache
5. Verify NEXTAUTH_URL matches your domain

### Issue: Database Connection Failed
**Solutions:**
1. Check MongoDB URI format
2. Verify MongoDB Atlas IP whitelist
3. Test connection string locally
4. Check MongoDB Atlas cluster status

### Issue: Pages Not Loading
**Solutions:**
1. Check build logs for errors
2. Verify all dependencies are installed
3. Check server logs for runtime errors
4. Verify domain DNS is configured correctly

## 📊 Monitoring & Logs

### Where to Check Logs

**Vercel:**
- Dashboard > Your Project > Deployments > View Function Logs
- Real-time logs: `vercel logs`

**Netlify:**
- Dashboard > Your Site > Deploys > Deploy Log

**MongoDB Atlas:**
- Cluster > Metrics
- Database Access Logs

### What to Monitor
- [ ] Response times
- [ ] Error rates
- [ ] Authentication success/failure
- [ ] Database query performance
- [ ] API endpoint usage

## 🔒 Security Checklist

Post-deployment security verification:
- [ ] All sensitive data in environment variables (not code)
- [ ] HTTPS enforced everywhere
- [ ] Secure cookies enabled (`httpOnly`, `secure`)
- [ ] CSRF protection enabled
- [ ] Rate limiting on auth endpoints
- [ ] Input validation on all forms
- [ ] SQL/NoSQL injection protection
- [ ] XSS protection
- [ ] Regular dependency updates

## 📱 Testing Checklist

### Browser Testing
Test on multiple browsers:
- [ ] Chrome/Edge (Latest)
- [ ] Firefox (Latest)
- [ ] Safari (Latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Device Testing
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

### Feature Testing
- [ ] User registration flow
- [ ] Login flow (email & Google)
- [ ] Password reset
- [ ] Email verification
- [ ] Protected routes (require auth)
- [ ] Session persistence
- [ ] Logout functionality

## 🎯 Performance Optimization

Post-deployment optimizations:
- [ ] Enable CDN for static assets
- [ ] Optimize images (Next.js Image component)
- [ ] Enable compression (gzip/brotli)
- [ ] Set proper cache headers
- [ ] Monitor Core Web Vitals
- [ ] Lighthouse score > 90

## 📞 Support & Resources

- **NextAuth Documentation**: https://next-auth.js.org/
- **Google OAuth Guide**: https://developers.google.com/identity/protocols/oauth2
- **MongoDB Atlas Docs**: https://www.mongodb.com/docs/atlas/
- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs

## 🎉 Success Criteria

Your deployment is successful when:
- ✅ All pages load without errors
- ✅ Google OAuth works smoothly
- ✅ Email/password authentication works
- ✅ Database operations are fast
- ✅ No console errors
- ✅ HTTPS is enforced
- ✅ All environment variables are set
- ✅ Mobile responsive design works
- ✅ Performance metrics are good

## 📝 Final Notes

1. **Always test in production environment** - Some issues only appear in production
2. **Monitor logs regularly** - First 24 hours are critical
3. **Have a rollback plan** - Keep previous working version accessible
4. **Document any custom configurations** - For future reference
5. **Set up error monitoring** - Use services like Sentry or LogRocket
6. **Regular backups** - Set up automated MongoDB backups

---

**Last Updated**: October 2025  
**Version**: 1.0
