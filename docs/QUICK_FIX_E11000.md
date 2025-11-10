# Quick Fix Guide - E11000 Duplicate Profile Error

## Error You're Seeing

```
E11000 duplicate key error
GET /api/profile 500
PUT /api/profile 409
```

## What I Fixed (Already Done ✅)

1. **Profile API Code** - Now handles duplicates gracefully
2. **Race Conditions** - Multiple requests won't create duplicates anymore
3. **Query Method** - Uses userId (unique field) instead of email

## What You Need To Do (One-Time Cleanup)

### Quick Method - MongoDB Compass

1. **Open MongoDB Compass** and connect to your database

2. **Navigate to Collection**:

   - Database: `smart-financial-planner`
   - Collection: `userprofiles`

3. **Filter for your duplicates**:

   ```
   { userId: ObjectId('68f79d23c1fc5f16390b5d86') }
   ```

4. **Look at the results** - You'll see 2+ profiles with same userId

5. **Keep ONE profile**:

   - Keep the one with: ✅ `onboardingCompleted: true`
   - Or keep the one with: ✅ `monthlyIncome` value
   - Or keep the one with: ✅ Most recent `updatedAt`

6. **Delete the others**:
   - Click on each duplicate profile
   - Click "Delete Document"

### Alternative - MongoDB Shell Script

1. Open MongoDB Compass "MONGOSH" tab at bottom
2. Copy/paste from: `scripts/cleanup-duplicates.mongodb.js`
3. Hit Enter - it will auto-clean everything

## Verify Fix Works

1. **Refresh Browser**: Press `Ctrl+Shift+R` (hard refresh)
2. **Check Console**: Should see no errors
3. **Test Profile Page**: Navigate to `/dashboard/profile`
4. **Try Updating**: Change name, save - should work!

## If You Still See Errors

The code now handles duplicates automatically, but if you see errors:

1. **Clear browser cache**: Settings → Clear browsing data
2. **Check database**: Make sure only ONE profile per userId exists
3. **Restart dev server**: Stop and run `npm run dev` again

## Prevention

✅ **Already done** - Code now prevents duplicate creation even with:

- Multiple simultaneous requests
- Browser refreshes during loading
- Network issues/retries

## Files Changed

- ✅ `app/api/profile/route.js` - Main fix
- ✅ `scripts/cleanup-duplicates.mongodb.js` - Cleanup script
- ✅ `E11000_DUPLICATE_KEY_FIX.md` - Full technical details

## Status

🟢 **Code Fixed** - No more duplicates will be created
🟡 **Database Cleanup Needed** - One-time manual cleanup required
🔵 **Then Production Ready** - After cleanup, fully working!

---

**Need Help?** Read `E11000_DUPLICATE_KEY_FIX.md` for detailed explanation.
