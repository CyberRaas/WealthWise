# Profile API Fix - userId Validation Error

## Issue

```
Profile fetch error: Error: UserProfile validation failed: userId: Path `userId` is required.
GET /api/profile 500 (Internal Server Error)
```

## Root Cause

The Profile API (`app/api/profile/route.js`) was creating UserProfile documents **without the required `userId` field**:

- **GET Method**: Created default profiles with only email, name, and image
- **PUT Method**: Only handled existing profiles, returned 404 for new ones
- **Missing**: Neither method was fetching the User document to get the `_id` for the userId field

The UserProfile model **requires** `userId` to be set:

```javascript
userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  required: true,  // ← This validation was failing
  unique: true
}
```

## Solution Applied

### 1. Added User Model Import

```javascript
import User from "@/models/User";
```

### 2. Updated GET Method

**Before:**

```javascript
if (!userProfile) {
  userProfile = await UserProfile.create({
    email: session.user.email,
    name: session.user.name || "",
    // ❌ Missing userId!
  });
}
```

**After:**

```javascript
// Get the User document first
const user = await User.findOne({ email: session.user.email });

if (!user) {
  return NextResponse.json({ error: "User not found" }, { status: 404 });
}

if (!userProfile) {
  userProfile = await UserProfile.create({
    userId: user._id, // ✅ Now includes userId
    email: session.user.email,
    name: session.user.name || "",
    profileImage: session.user.image || "",
  });
}
```

### 3. Updated PUT Method

**Before:**

```javascript
let profile = await UserProfile.findOne({ email: session.user.email });

if (profile) {
  // Update fields
  await profile.save();
} else {
  return NextResponse.json(
    { error: "Profile not found. Please complete onboarding first." },
    { status: 404 } // ❌ Returns error instead of creating profile
  );
}
```

**After:**

```javascript
// Get the User document first
const user = await User.findOne({ email: session.user.email });

if (!user) {
  return NextResponse.json({ error: "User not found" }, { status: 404 });
}

let profile = await UserProfile.findOne({ email: session.user.email });

if (profile) {
  // Update existing profile
  if (!profile.userId) {
    profile.userId = user._id; // ✅ Ensure userId is set
  }
  await profile.save();
} else {
  // Create new profile with userId
  profile = await UserProfile.create({
    userId: user._id, // ✅ Includes userId
    email: session.user.email,
    name: name || session.user.name || "",
    phone: phone || "",
    // ... other fields
  });
}
```

## Why This Happened

1. **Session Data Limitation**: The NextAuth session only provides `session.user.email`, not the MongoDB `_id`
2. **Model Mismatch**: The Profile API was querying by email, but UserProfile model requires userId
3. **Missing User Lookup**: We weren't fetching the User document to get the `_id` for the userId field

## Data Flow

```
NextAuth Session
    ↓
session.user.email
    ↓
User.findOne({ email })  ← NEW: Added this step
    ↓
user._id
    ↓
UserProfile.create({ userId: user._id })  ← Now includes required field
```

## Testing

1. **Before Fix:**

   - ❌ GET /api/profile → 500 error
   - ❌ PUT /api/profile → 404 error
   - ❌ Console: "UserProfile validation failed: userId is required"

2. **After Fix:**
   - ✅ GET /api/profile → 200 success
   - ✅ PUT /api/profile → 200 success
   - ✅ Profile data loads correctly
   - ✅ Profile updates save successfully

## Related Files Modified

- `app/api/profile/route.js` - Added User lookup and userId field

## Prevention

To prevent similar issues:

1. Always check model requirements before creating documents
2. Query the User collection when you need the MongoDB `_id`
3. Don't rely solely on session data for required fields
4. Test both GET and PUT endpoints after schema changes

## Status

✅ **FIXED** - Profile API now correctly creates and updates profiles with userId field
