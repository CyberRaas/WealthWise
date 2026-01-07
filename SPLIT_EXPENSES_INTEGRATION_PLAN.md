# Split Expenses - Production-Ready Integration Plan

## Executive Summary
This document outlines the complete production-ready implementation plan for integrating Splitwise-style expense splitting into the WealthWise platform.

## Current Status Assessment

### ✅ Completed
1. Core data models created (SplitGroup, SplitExpense, Settlement, RiskProfile, InvestmentRecommendation)
2. Basic API routes implemented
3. UI components scaffolded
4. Sidebar navigation updated

### ⚠️ Issues Fixed
1. **Model Field Mismatches** - Fixed `userId` → `user`, added `balance` field
2. **Virtual Getter Errors** - Added defensive checks and `.lean()` queries
3. **API-Model Alignment** - Corrected all field references across API routes
4. **Population Issues** - Disabled virtuals when populating with limited fields

### 🔴 Critical Remaining Work

## Phase 1: Data Layer Fixes (HIGH PRIORITY)

### 1.1 Fix SplitGroup Model
**File**: `models/SplitGroup.js`

```javascript
// Fix indexes to use 'user' instead of 'userId'
splitGroupSchema.index({ 'members.user': 1, isActive: 1 })  // Line 216

// Remove unused balanceSchema (member.balance handles this now)
// Lines 73-87 can be removed

// Update methods to use correct field names
// isMember, isAdmin methods need updating (Lines 226-241)
```

### 1.2 Add Missing Indexes
```javascript
// Add compound indexes for performance
splitGroupSchema.index({ 'members.user': 1, createdAt: -1 })
splitGroupSchema.index({ isSettled: 1, updatedAt: -1 })

// SplitExpense model needs indexes
splitExpenseSchema.index({ groupId: 1, date: -1 })
splitExpenseSchema.index({ 'paidBy.memberId': 1, createdAt: -1 })
splitExpenseSchema.index({ 'splitAmong.memberId': 1 })
```

## Phase 2: API Layer Enhancements

### 2.1 Add Proper Error Handling
**Pattern to apply across all routes**:

```javascript
try {
  // API logic
} catch (error) {
  console.error(`[${routeName}] Error:`, error)
  
  // Send appropriate error response
  if (error.name === 'ValidationError') {
    return NextResponse.json(
      { error: error.message, details: error.errors },
      { status: 400 }
    )
  }
  
  if (error.name === 'CastError') {
    return NextResponse.json(
      { error: 'Invalid ID format' },
      { status: 400 }
    )
  }
  
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}
```

### 2.2 Add Request Validation
Use Zod schemas for validation:

```javascript
import { z } from 'zod'

const createGroupSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(200).optional(),
  type: z.enum(['trip', 'home', 'couple', 'event', 'project', 'other']),
  memberEmails: z.array(z.string().email()).optional(),
  currency: z.enum(['INR', 'USD', 'EUR', 'GBP']).default('INR')
})

// In route handler
const validated = createGroupSchema.safeParse(body)
if (!validated.success) {
  return NextResponse.json(
    { error: 'Validation failed', details: validated.error.issues },
    { status: 400 }
  )
}
```

### 2.3 Fix All Populate Calls
**Pattern**: Always use `.lean()` to avoid virtual getter issues

```javascript
const group = await SplitGroup.findById(id)
  .populate({
    path: 'members.user',
    select: 'name email avatar'
  })
  .lean()
```

## Phase 3: UI/UX Integration

### 3.1 Integrate into Expenses Page
**Approach**: Use Tabs to switch between Personal and Split expenses

**File Structure**:
```
app/dashboard/expenses/page.js (main container with tabs)
components/expenses/ExpensesContent.jsx (existing personal expenses)
components/split/SplitExpensesContent.jsx (NEW - split expenses main view)
```

### 3.2 Match Design System
**Colors** (from globals.css):
- Primary: `emerald-500` / `emerald-600` (#10b981)
- Success: `green-500`
- Warning: `yellow-500` / `amber-500`
- Error: `red-500` / `rose-500`
- Background: `slate-50` (light) / `slate-900` (dark)
- Text: `slate-900` (light) / `white` (dark)
- Muted: `slate-600` (light) / `slate-400` (dark)

**Component Patterns**:
```jsx
// Card
<Card className="border-slate-200 dark:border-slate-700">
  <CardHeader className="border-b border-slate-200 dark:border-slate-700">
    // ...
  </CardHeader>
  <CardContent className="p-6">
    // ...
  </CardContent>
</Card>

// Button Primary
<Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
  Primary Action
</Button>

// Button Secondary
<Button variant="outline" className="border-slate-300 dark:border-slate-600">
  Secondary Action
</Button>

// Badge
<Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
  Status
</Badge>
```

### 3.3 Add Loading States
```jsx
// Skeleton loader
{loading && (
  <div className="space-y-4">
    {[...Array(3)].map((_, i) => (
      <Card key={i} className="animate-pulse">
        <CardHeader>
          <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
)}
```

### 3.4 Add Empty States
```jsx
{groups.length === 0 && !loading && (
  <Card className="border-2 border-dashed border-slate-300 dark:border-slate-700">
    <CardContent className="flex flex-col items-center justify-center py-12">
      <Users className="h-16 w-16 text-slate-400 mb-4" />
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
        No groups yet
      </h3>
      <p className="text-slate-600 dark:text-slate-400 text-center mb-6">
        Create your first group to start splitting expenses
      </p>
      <Button onClick={() => setShowCreateModal(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Create Group
      </Button>
    </CardContent>
  </Card>
)}
```

## Phase 4: Mobile Responsiveness

### 4.1 Responsive Breakpoints
```jsx
// Mobile-first approach
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Cards */}
</div>

// Responsive padding
<div className="p-4 md:p-6 lg:p-8">

// Responsive text
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">

// Hide on mobile
<div className="hidden md:block">

// Show only on mobile
<div className="block md:hidden">
```

### 4.2 Mobile Navigation
```jsx
// Drawer for mobile, sidebar for desktop
const [sidebarOpen, setSidebarOpen] = useState(false)

<button 
  onClick={() => setSidebarOpen(true)}
  className="md:hidden fixed bottom-4 right-4 z-50 bg-emerald-600 text-white p-4 rounded-full shadow-lg"
>
  <Menu className="h-6 w-6" />
</button>
```

## Phase 5: Error Handling & User Feedback

### 5.1 Toast Notifications
```jsx
import toast from 'react-hot-toast'

// Success
toast.success('Group created successfully!', {
  duration: 3000,
  icon: '✅'
})

// Error
toast.error('Failed to create group', {
  duration: 4000,
  icon: '❌'
})

// Loading
const loadingToast = toast.loading('Creating group...')
// Later
toast.dismiss(loadingToast)
toast.success('Group created!')
```

### 5.2 Error Boundaries
```jsx
// components/ErrorBoundary.js already exists
// Wrap Split components in it

<ErrorBoundary fallback={<ErrorFallback />}>
  <SplitExpensesContent />
</ErrorBoundary>
```

## Phase 6: Performance Optimization

### 6.1 Memoization
```jsx
import { useMemo, useCallback } from 'react'

const sortedGroups = useMemo(() => {
  return groups.sort((a, b) => b.updatedAt - a.updatedAt)
}, [groups])

const handleCreateGroup = useCallback(async (data) => {
  // ... logic
}, [/* dependencies */])
```

### 6.2 Pagination
```javascript
// API
const limit = parseInt(searchParams.get('limit')) || 20
const page = parseInt(searchParams.get('page')) || 1
const skip = (page - 1) * limit

const groups = await SplitGroup.find(query)
  .skip(skip)
  .limit(limit)
  .lean()

const total = await SplitGroup.countDocuments(query)

return {
  groups,
  pagination: {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
    hasMore: page < Math.ceil(total / limit)
  }
}
```

### 6.3 Debouncing Search
```jsx
import { useState, useEffect } from 'react'

const [searchTerm, setSearchTerm] = useState('')
const [debouncedSearch, setDebouncedSearch] = useState('')

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(searchTerm)
  }, 300)
  
  return () => clearTimeout(timer)
}, [searchTerm])

useEffect(() => {
  if (debouncedSearch) {
    fetchGroups(debouncedSearch)
  }
}, [debouncedSearch])
```

## Phase 7: Testing Checklist

### 7.1 Unit Tests
- [ ] Model validation tests
- [ ] API route tests
- [ ] Utility function tests
- [ ] Component rendering tests

### 7.2 Integration Tests
- [ ] Create group → Add members → Add expense → Settle up flow
- [ ] Edit expense updates balances correctly
- [ ] Delete expense reverses balances
- [ ] Settlement marks debts as paid

### 7.3 E2E Tests
- [ ] Full user journey from login to settled group
- [ ] Mobile navigation works
- [ ] Dark mode works
- [ ] Offline resilience (PWA)

### 7.4 Edge Cases
- [ ] Group with single member
- [ ] Expense with unequal splits
- [ ] Rounding errors in splits
- [ ] Non-registered member invitations
- [ ] Concurrent expense additions
- [ ] Network failures

## Phase 8: Deployment Checklist

### 8.1 Database
- [ ] Run migration to add indexes
- [ ] Backup existing data
- [ ] Test rollback procedure

### 8.2 Environment
- [ ] Set all environment variables
- [ ] Configure CORS if needed
- [ ] Set up monitoring (Sentry)

### 8.3 Performance
- [ ] Run Lighthouse audit
- [ ] Check bundle size
- [ ] Test on 3G network
- [ ] Verify image optimization

### 8.4 Security
- [ ] Validate all user inputs
- [ ] Check rate limiting
- [ ] Verify authentication on all routes
- [ ] Test authorization logic
- [ ] SQL injection prevention
- [ ] XSS prevention

## Implementation Priority

### Sprint 1 (Week 1): Core Fixes
1. ✅ Fix all model-API field mismatches
2. ⚠️ Add proper error handling to all routes
3. ⚠️ Fix indexes in SplitGroup model
4. ⚠️ Add request validation with Zod

### Sprint 2 (Week 2): UI Integration
1. Create ExpensesContent component (extract from page)
2. Create SplitExpensesContent component
3. Update expenses page with Tabs
4. Match design system colors and components
5. Add loading states and skeletons

### Sprint 3 (Week 3): Polish & Testing
1. Add mobile responsiveness
2. Add empty states
3. Add error boundaries
4. Implement pagination
5. Add debounced search
6. Write tests

### Sprint 4 (Week 4): Production Release
1. Performance optimization
2. Security audit
3. User acceptance testing
4. Documentation
5. Deployment

## Files Requiring Updates

### Critical (Must Fix)
1. `models/SplitGroup.js` - Fix indexes, remove unused code
2. `models/SplitExpense.js` - Add indexes
3. `app/api/split/expenses/route.js` - Already mostly fixed
4. `app/api/split/groups/route.js` - Add validation
5. `app/dashboard/expenses/page.js` - Add tabs integration

### Important (Should Fix)
6. All API routes - Add comprehensive error handling
7. `components/split/GroupList.jsx` - Match design system
8. `components/split/AddExpenseModal.jsx` - Improve UX
9. `components/split/SettleUpModal.jsx` - Add validation
10. Create `components/split/SplitExpensesContent.jsx`

### Nice to Have
11. Add expense splitting in-app tutorial
12. Add export to CSV feature
13. Add expense receipts upload
14. Add push notifications for settlements
15. Add email notifications

## Success Metrics

- ✅ Zero runtime errors in production
- ✅ < 3s page load time
- ✅ 95+ Lighthouse score
- ✅ Mobile responsive on all screens
- ✅ Accessible (WCAG AA)
- ✅ 100% API test coverage
- ✅ User can complete full flow without confusion

## Next Steps

1. **Immediately**: Run through all existing code and apply error handling pattern
2. **Today**: Fix model indexes and add Zod validation
3. **This Week**: Integrate into expenses page with proper design system
4. **Next Week**: Mobile optimization and testing
5. **Production**: After full QA and security audit

## Notes

- The foundation is solid - main issues are polish and integration
- Design system is well-established - just need to follow patterns
- Most API routes work - just need error handling and edge case fixes
- UI components exist - need to match existing design language
- Mobile responsiveness critical for user adoption

---

**Status**: Ready for Sprint 1 implementation
**Last Updated**: January 8, 2026
**Owner**: Development Team
