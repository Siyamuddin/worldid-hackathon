# ⚠️ URGENT: Fix "Couldn't Find the Request" Error

## The Error You're Seeing

**"World App was opened to handle a request from another app or website, but we couldn't find the request."**

This error means: **The action `worldid-reward-claim` doesn't exist in your WorldID Developer Portal.**

## Quick Fix (5 minutes)

### Step 1: Go to WorldID Developer Portal
1. Open: https://developer.worldcoin.org/
2. Sign in with your World App
3. You should see your app: **"InHuman"** (or similar name)
4. App ID: `app_2c1d85cd742db32847cb795c3fffaa9f`

### Step 2: Find Actions Section
1. Click on your app
2. Look for **"Actions"** in the sidebar or menu
3. If you don't see it, check:
   - Settings → Actions
   - Advanced Settings → Actions
   - Or look for a tab/section called "Actions"

### Step 3: Create the Action
Click **"Create Action"** or **"Add Action"** and enter:

- **Action Name**: `worldid-reward-claim`
  - ⚠️ **MUST be exactly this** (case-sensitive, lowercase, with hyphens)
  - No spaces, no capital letters
  - Copy-paste this exactly: `worldid-reward-claim`

- **Description**: "Participant event joining and reward claiming"

- **Verification Level**: 
  - Select **`Device`** (this matches what the code uses)
  - ⚠️ **IMPORTANT**: Must be `Device`, not `Orb`

- **Max Verifications**: 
  - For testing: `Unlimited`
  - For production: `1 per user per action` (prevents duplicate claims)

### Step 4: Save and Verify
1. Click **"Save"** or **"Create"**
2. You should now see `worldid-reward-claim` in your actions list
3. Verify it shows:
   - ✅ Name: `worldid-reward-claim`
   - ✅ Verification Level: `Device`
   - ✅ Status: Active/Enabled

### Step 5: Test Again
1. Go back to your app
2. Click "Verify with WorldID"
3. Scan the QR code
4. It should work now! ✅

## If You Still See the Error

### Check 1: Action Name
- Make sure it's exactly: `worldid-reward-claim` (no typos)
- Check for extra spaces before/after
- Make sure it's lowercase

### Check 2: Verification Level
- Must be `Device` (not `Orb`)
- The code uses `VerificationLevel.Device`

### Check 3: App ID
- Your App ID should be: `app_2c1d85cd742db32847cb795c3fffaa9f`
- Check the browser console to see what App ID is being used

### Check 4: Action Status
- Make sure the action is **Active** or **Enabled**
- Some portals have a toggle to enable/disable actions

## Still Not Working?

1. **Clear browser cache** and try again
2. **Restart the frontend container**:
   ```bash
   docker compose restart frontend
   ```
3. **Check browser console** for any error messages
4. **Verify in Developer Portal** that the action exists and is active

## What This Action Does

The `worldid-reward-claim` action is used when participants claim rewards from events. It:
- Verifies the user is a unique human (prevents duplicate claims)
- Uses Device-level verification (works on mobile phones)
- Can be used once per user per action (prevents abuse)

## Need Help?

If you've followed all steps and it still doesn't work:
1. Take a screenshot of your Actions page in the Developer Portal
2. Check the browser console for error messages
3. Verify the App ID matches: `app_2c1d85cd742db32847cb795c3fffaa9f`
