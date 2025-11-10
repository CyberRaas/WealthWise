# 📱 PWA Quick Reference Guide

## 🚀 Quick Start

### **Step 1: Generate Icons**

```bash
npm install sharp --save-dev
node scripts/generate-pwa-icons.js
```

### **Step 2: Build & Test**

```bash
npm run build
npm start
```

### **Step 3: Test on Mobile**

- Open app on mobile device
- Wait 3 seconds for install prompt
- Tap "Install Now"
- Test offline functionality

---

## 📋 Installation Methods

### **Android (Chrome/Edge)**

```
Method 1: Install Prompt
- Open app → Wait 3 seconds → Tap "Install Now"

Method 2: Browser Menu
- Chrome menu (⋮) → "Add to Home screen" → Confirm
```

### **iOS (Safari)**

```
1. Tap Share button (□↑)
2. Scroll down
3. Tap "Add to Home Screen"
4. Tap "Add"
```

### **Desktop (Chrome/Edge/Firefox)**

```
- Look for install icon in address bar
- Click → "Install" → Confirm
```

---

## 🔧 Key Files

```
✅ public/manifest.json              - PWA configuration
✅ public/sw.js                      - Service Worker
✅ components/PWAInstallPrompt.js    - Install prompt UI
✅ components/PWARegister.js         - SW registration
✅ app/offline/page.js               - Offline fallback
✅ scripts/generate-pwa-icons.js     - Icon generator
```

---

## 🎨 Customization

### **Change App Name:**

```json
// public/manifest.json
{
  "name": "Your App Name",
  "short_name": "YourApp"
}
```

### **Change Theme Color:**

```json
// public/manifest.json
{
  "theme_color": "#your-color",
  "background_color": "#your-bg-color"
}
```

### **Change Start URL:**

```json
// public/manifest.json
{
  "start_url": "/your-page"
}
```

### **Modify Install Prompt Timing:**

```javascript
// components/PWAInstallPrompt.js
setTimeout(() => {
  setShowPrompt(true);
}, 3000); // Change 3000 to your desired milliseconds
```

---

## 🧪 Testing Checklist

### **Desktop Testing:**

- [ ] Open Chrome DevTools → Application tab
- [ ] Check Manifest loads correctly
- [ ] Verify Service Worker is active
- [ ] Test offline mode (Network → Offline)
- [ ] Run Lighthouse PWA audit (score 90+)

### **Mobile Testing:**

- [ ] Install prompt appears after 3 seconds
- [ ] Install app on home screen
- [ ] App opens in standalone mode
- [ ] Offline functionality works
- [ ] Icons display correctly

---

## 🐛 Common Issues & Fixes

### **Install Prompt Not Showing:**

```javascript
// Clear dismissed state
localStorage.removeItem("pwa-prompt-dismissed");
localStorage.removeItem("pwa-prompt-dismissed-time");

// Then refresh page
```

### **Service Worker Not Registering:**

```bash
# Clear cache and rebuild
rm -rf .next
npm run build
npm start
```

### **Icons Not Loading:**

```bash
# Generate icons
node scripts/generate-pwa-icons.js

# Then rebuild
npm run build
```

### **Manifest Not Found:**

```bash
# Check file exists
ls public/manifest.json

# Check browser console for errors
F12 → Console
```

---

## 📊 Performance Tips

### **Cache Management:**

```javascript
// Update cache version in public/sw.js
const CACHE_NAME = "wealthwise-v1.0.1"; // Increment version
```

### **Clear All Caches:**

```javascript
// Run in browser console
caches.keys().then((keys) => {
  keys.forEach((key) => caches.delete(key));
});
```

### **Force Service Worker Update:**

```javascript
// Run in browser console
navigator.serviceWorker.getRegistrations().then((regs) => {
  regs.forEach((reg) => reg.update());
});
```

---

## 🎯 Best Practices

### **Do's:**

✅ Test on real devices
✅ Use HTTPS (or localhost for dev)
✅ Keep service worker cache size reasonable
✅ Update cache version on each deploy
✅ Provide offline fallback
✅ Show install prompt smartly (3s delay)

### **Don'ts:**

❌ Don't show prompt immediately
❌ Don't show prompt too frequently
❌ Don't cache API responses excessively
❌ Don't forget to test offline mode
❌ Don't skip icon generation
❌ Don't ignore browser console errors

---

## 🚀 Deployment

### **Pre-Deployment Checklist:**

- [ ] Icons generated (8 sizes)
- [ ] Manifest.json configured
- [ ] Service Worker tested
- [ ] Install prompt working
- [ ] Offline mode tested
- [ ] Built for production (`npm run build`)

### **Post-Deployment:**

- [ ] Test installation on Android
- [ ] Test installation on iOS
- [ ] Test installation on Desktop
- [ ] Verify offline functionality
- [ ] Check Lighthouse PWA score
- [ ] Monitor install analytics

---

## 📈 Analytics Tracking

### **Track Installation:**

```javascript
// components/PWAInstallPrompt.js
// Already implemented!
if (outcome === "accepted") {
  localStorage.setItem("pwa-installed", "true");
  // Add your analytics event here
  // gtag('event', 'pwa_install', { ... })
}
```

### **Track Offline Usage:**

```javascript
// Add to your analytics
if (!navigator.onLine) {
  // Track offline usage
}
```

---

## 🔗 Resources

- **PWA Builder:** https://www.pwabuilder.com/
- **Lighthouse:** Chrome DevTools → Lighthouse
- **Icon Generator:** https://www.pwabuilder.com/imageGenerator
- **Testing:** Chrome DevTools → Application → Manifest

---

## 🎊 Success Criteria

Your PWA is ready when:
✅ Install prompt appears after 3 seconds
✅ App can be installed on home screen
✅ App works offline
✅ Icons display correctly
✅ Lighthouse PWA score > 90
✅ Service Worker is active

---

**Quick Help:**

- **Icons:** `node scripts/generate-pwa-icons.js`
- **Build:** `npm run build && npm start`
- **Test:** Chrome DevTools → Application tab
- **Deploy:** Push to production with HTTPS

**Status:** ✅ PWA Ready to Deploy!
