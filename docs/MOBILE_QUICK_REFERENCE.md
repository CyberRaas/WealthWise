# 📱 Mobile Components - Quick Reference Card

## 🎯 **Essential Components**

---

### **1. MobileButton**

```jsx
import MobileButton from '@/components/ui/MobileButton'
import { Plus, Check, Trash2 } from 'lucide-react'

// Primary button
<MobileButton variant="primary" size="lg" fullWidth>
  Add Expense
</MobileButton>

// With icon
<MobileButton variant="secondary" icon={Check} iconPosition="left">
  Save
</MobileButton>

// Loading state
<MobileButton variant="primary" loading={true}>
  Processing...
</MobileButton>

// Danger action
<MobileButton variant="danger" icon={Trash2}>
  Delete
</MobileButton>
```

**Variants:** `primary` | `secondary` | `outline` | `ghost` | `danger` | `success`  
**Sizes:** `sm` (40px) | `default` (44px) | `lg` (52px) | `xl` (60px)

---

### **2. MobileInput**

```jsx
import MobileInput from '@/components/ui/MobileInput'
import { Mail, Lock, DollarSign, Phone } from 'lucide-react'

// Basic input
<MobileInput
  label="Email"
  type="email"
  placeholder="your@email.com"
  icon={Mail}
  required
/>

// Password with toggle
<MobileInput
  label="Password"
  type="password"
  placeholder="Enter password"
  icon={Lock}
/>

// With error
<MobileInput
  label="Amount"
  type="number"
  icon={DollarSign}
  error="Amount must be positive"
/>

// With success
<MobileInput
  label="Username"
  icon={User}
  success="Username available!"
/>

// Number input
<MobileInput
  type="number"
  inputMode="decimal"
  placeholder="0.00"
/>
```

**Types:** `text` | `email` | `password` | `number` | `tel` | `search`

---

### **3. MobileCard**

```jsx
import MobileCard from '@/components/ui/MobileCard'
import { Wallet, Target, PieChart } from 'lucide-react'

// Basic card
<MobileCard title="Total Balance">
  <div className="text-3xl font-bold">₹45,280</div>
</MobileCard>

// With icon and link
<MobileCard
  title="Recent Expenses"
  subtitle="Last 7 days"
  icon={Wallet}
  href="/dashboard/expenses"
  interactive
>
  <div>Content here</div>
</MobileCard>

// Feature card (highlighted)
<MobileCard
  variant="feature"
  title="Savings Goal"
  icon={Target}
>
  <div>Progress bar here</div>
</MobileCard>

// With action button
<MobileCard
  title="Budget Analysis"
  icon={PieChart}
  action={
    <MobileButton variant="secondary" size="sm" fullWidth>
      View Details
    </MobileButton>
  }
>
  <p>Your analysis content</p>
</MobileCard>
```

**Variants:** `default` | `compact` | `spacious` | `feature`

---

## 🎨 **CSS Classes**

### **Touch Targets**

```jsx
<button className="tap-target">          // 44px minimum
<button className="tap-target-lg">       // 56px minimum
```

### **Touch Feedback**

```jsx
<button className="touch-feedback">      // Visual + haptic
<div className="no-select">              // Prevent text selection
```

### **Safe Areas**

```jsx
<div className="safe-area-inset-top">    // Top notch
<div className="safe-area-inset-bottom"> // Bottom bar
<div className="safe-area-insets">       // All sides
```

### **Scrolling**

```jsx
<div className="smooth-scroll">          // Smooth iOS scroll
<div className="hide-scrollbar">         // Hide scrollbar
<div className="mobile-scroll-x">        // Horizontal scroll
```

### **Layout**

```jsx
<div className="mobile-card-spacing">    // Optimized padding
<div className="mobile-compact">         // Compact padding
<div className="mobile-full-screen">     // Full viewport height
<div className="bottom-nav-padding">     // Accounts for nav
```

---

## 📐 **Responsive Patterns**

### **Grid to Horizontal Scroll**

```jsx
<div className="mobile-scroll-x gap-4 sm:grid sm:grid-cols-2">
  <MobileCard className="w-72 sm:w-auto">Card 1</MobileCard>
  <MobileCard className="w-72 sm:w-auto">Card 2</MobileCard>
  <MobileCard className="w-72 sm:w-auto">Card 3</MobileCard>
</div>
```

### **Responsive Grid**

```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  <MobileCard>Card 1</MobileCard>
  <MobileCard>Card 2</MobileCard>
  <MobileCard>Card 3</MobileCard>
</div>
```

### **Stack Buttons on Mobile**

```jsx
<div className="flex flex-col sm:flex-row gap-3">
  <MobileButton variant="outline" fullWidth>
    Cancel
  </MobileButton>
  <MobileButton variant="primary" fullWidth>
    Confirm
  </MobileButton>
</div>
```

---

## 🎯 **Common Patterns**

### **Add Form**

```jsx
<form className="space-y-4" onSubmit={handleSubmit}>
  <MobileInput
    label="Amount"
    type="number"
    icon={DollarSign}
    placeholder="0.00"
    inputMode="decimal"
  />

  <MobileInput
    label="Category"
    type="text"
    icon={Tag}
    placeholder="Food & Dining"
  />

  <MobileButton
    variant="primary"
    size="lg"
    fullWidth
    type="submit"
    loading={isSubmitting}
  >
    Add Expense
  </MobileButton>
</form>
```

### **Dashboard Card Grid**

```jsx
<div className="mobile-scroll-x gap-4 pb-4 sm:grid sm:grid-cols-2 lg:grid-cols-3">
  <MobileCard title="Total Balance" icon={Wallet} className="w-72 sm:w-auto">
    <div className="text-3xl font-bold">₹45,280</div>
  </MobileCard>

  <MobileCard title="This Month" icon={Calendar} className="w-72 sm:w-auto">
    <div className="text-3xl font-bold">₹32,450</div>
  </MobileCard>

  <MobileCard title="Savings" icon={TrendingUp} className="w-72 sm:w-auto">
    <div className="text-3xl font-bold">₹12,830</div>
  </MobileCard>
</div>
```

### **Action List**

```jsx
<div className="space-y-3">
  <MobileCard interactive onClick={() => navigate("/expenses")}>
    <div className="flex items-center gap-3">
      <Wallet className="h-6 w-6 text-emerald-600" />
      <div className="flex-1">
        <h3 className="font-semibold">Expenses</h3>
        <p className="text-sm text-gray-500">Track your spending</p>
      </div>
    </div>
  </MobileCard>

  <MobileCard interactive onClick={() => navigate("/goals")}>
    <div className="flex items-center gap-3">
      <Target className="h-6 w-6 text-blue-600" />
      <div className="flex-1">
        <h3 className="font-semibold">Goals</h3>
        <p className="text-sm text-gray-500">Monitor progress</p>
      </div>
    </div>
  </MobileCard>
</div>
```

---

## ⚡ **Performance Tips**

### **Lazy Load Heavy Components**

```jsx
import dynamic from "next/dynamic";

const HeavyChart = dynamic(() => import("./HeavyChart"), {
  loading: () => <div>Loading...</div>,
  ssr: false,
});
```

### **Optimize Images**

```jsx
import Image from "next/image";

<Image
  src="/image.jpg"
  alt="Description"
  width={300}
  height={200}
  loading="lazy"
  placeholder="blur"
/>;
```

### **Debounce Search**

```jsx
import { useState, useEffect } from 'react'
import { debounce } from 'lodash'

const [search, setSearch] = useState('')
const debouncedSearch = debounce((value) => {
  // API call here
}, 300)

<MobileInput
  type="search"
  value={search}
  onChange={(e) => {
    setSearch(e.target.value)
    debouncedSearch(e.target.value)
  }}
/>
```

---

## 🔍 **Debugging**

### **Check Tap Target Size**

```css
/* Add to globals.css temporarily */
.tap-target {
  outline: 2px solid red !important;
}
```

### **Visualize Safe Areas**

```css
.safe-area-inset-top {
  background: rgba(255, 0, 0, 0.2) !important;
}
.safe-area-inset-bottom {
  background: rgba(0, 255, 0, 0.2) !important;
}
```

### **Test Touch Events**

```jsx
<button
  onClick={() => console.log("Clicked")}
  onTouchStart={() => console.log("Touch started")}
  onTouchEnd={() => console.log("Touch ended")}
>
  Test Touch
</button>
```

---

## 📏 **Size Reference**

### **Minimum Touch Targets**

- Buttons: **44px × 44px**
- Large buttons: **56px × 56px**
- Text inputs: **44px height**
- Icons (interactive): **24px with 10px padding**

### **Font Sizes**

- Body text: **16px** (prevents zoom)
- Small text: **14px** minimum
- Headings: **24px+**
- Buttons: **16px**

### **Spacing**

- Mobile padding: **1rem (16px)**
- Touch spacing: **0.75rem (12px)**
- Card gap: **1rem (16px)**
- Form fields: **1rem (16px)**

---

## ✅ **Quick Checklist**

Mobile-ready when:

- [ ] All buttons use `MobileButton`
- [ ] All inputs use `MobileInput`
- [ ] Cards use `MobileCard` or have `tap-target`
- [ ] Text is ≥ 14px
- [ ] Touch targets are ≥ 44px
- [ ] Forms have proper `inputMode`
- [ ] Fixed elements use `safe-area-inset`
- [ ] Page tested on real device
- [ ] No zoom on input focus
- [ ] Scrolling is smooth

---

## 🎉 **You're Ready!**

Use this reference card while building mobile-first features!

**Happy coding! 📱✨**
