# WorldID Request Cancellation Fix

## Problem
World App keeps canceling the verification request automatically.

## Common Causes

### 1. Verification Level Mismatch ⚠️ MOST COMMON
- **Code uses**: `VerificationLevel.Orb`
- **Action in portal**: Set to `Device` (or vice versa)
- **Solution**: I've changed the code to use `VerificationLevel.Device` which is more widely available

### 2. Action Not Created
- The action `worldid-organizer-auth` doesn't exist in your WorldID Developer Portal
- **Solution**: Create the action in the portal (see URGENT_WORLDID_FIX.md)

### 3. Action Verification Level Mismatch
- Action exists but verification level doesn't match
- **Solution**: Check action settings in portal and match the code

### 4. User Doesn't Have Required Verification
- User only has Device verification, but code requests Orb
- **Solution**: Using Device level now (more accessible)

## What I Fixed

1. ✅ Changed verification level from `Orb` to `Device` in both components
   - `OrganizerWorldIDLogin.tsx`
   - `WorldIDVerification.tsx`

2. ✅ Improved error handling to catch cancellation errors

3. ✅ Added better error logging for debugging

## Next Steps

### Step 1: Update Action in WorldID Portal

1. Go to WorldID Developer Portal
2. Open your app "InHuman"
3. Go to **Actions** section
4. Find or create action `worldid-organizer-auth`
5. **IMPORTANT**: Set **Verification Level** to `Device` (not Orb)
6. Save the action

### Step 2: Restart Services

```bash
docker-compose restart frontend
```

### Step 3: Test Again

1. Clear browser cache
2. Try WorldID verification
3. Should work with Device verification now

## If Still Canceling

### Check Action Configuration

In WorldID Developer Portal, verify:
- ✅ Action name: `worldid-organizer-auth` (exact match)
- ✅ Verification Level: `Device` (matches code)
- ✅ Action is active/enabled
- ✅ Max Verifications: `Unlimited` (for testing)

### Try Different Verification Level

If Device doesn't work, you can try Orb:
1. Update action in portal to use `Orb`
2. Change code back to `VerificationLevel.Orb`
3. Make sure you have Orb verification in your World App

### Check World App Status

1. Open World App on your phone
2. Check if you have Device verification available
3. Try verifying with another app to test your World App

## Debugging

Check browser console for detailed error messages:
```javascript
// Open browser console (F12)
// Look for WorldID error messages
```

Common error codes:
- `verification_rejected` - User cancelled (normal)
- `request_cancelled` - Request was cancelled (check action config)
- `verification_failed` - Verification failed (check verification level)

## Alternative: Use Orb (if available)

If you have Orb verification and want to use it:

1. In WorldID Portal, set action verification level to `Orb`
2. Change code back to `VerificationLevel.Orb`
3. Restart frontend

But for now, Device is more accessible and should work for most users.
