# WorldID Action Setup - CRITICAL

## Your App Status
✅ App ID: `app_2c1d85cd742db32847cb795c3fffaa9f` (exists)
✅ App URL: `https://www.halalhaven.kr` (configured)
⚠️ Status: "Not verified" (this is OK for testing)
⚠️ Developer Preview (this is OK for testing)

## The Problem

Your app exists, but the **Actions** are likely not created yet. The World App needs actions to know what verification to perform.

## Required Actions

You need to create **TWO actions** in your WorldID app:

### Action 1: Organizer Authentication

1. In your WorldID Developer Portal, go to your app settings
2. Look for **"Actions"** section (usually in the sidebar or under app settings)
3. Click **"Create Action"** or **"Add Action"**
4. Fill in:
   - **Action Name**: `worldid-organizer-auth` (MUST match exactly, case-sensitive)
   - **Description**: "Organizer authentication for WorldID Reward System"
   - **Verification Level**: 
     - Select `Orb` if you have Orb verification
     - Select `Device` if you only have Device verification (for testing)
   - **Max Verifications**: 
     - `Unlimited` (for testing)
     - `1 per user per action` (for production - prevents duplicate logins)
5. Click **"Create"** or **"Save"**

### Action 2: Participant Verification (for joining events and claiming rewards)

1. Create another action:
   - **Action Name**: `worldid-reward-claim` (MUST match exactly)
   - **Description**: "Participant event joining and reward claiming"
   - **Verification Level**: `Orb` (or `Device` for testing)
   - **Max Verifications**: `1 per user per action` (critical for preventing duplicate claims)
2. Click **"Create"** or **"Save"**

## Verify Actions Are Created

After creating the actions, you should see them listed in the "Actions" section of your app. They should show:
- ✅ Action name
- ✅ Verification level
- ✅ Max verifications setting

## Current Configuration Check

Your `.env` file should have:
```env
WORLDID_APP_ID=app_2c1d85cd742db32847cb795c3fffaa9f
WORLDID_ACTION=worldid-organizer-auth
VITE_WORLDID_APP_ID=app_2c1d85cd742db32847cb795c3fffaa9f
VITE_WORLDID_ACTION=worldid-organizer-auth
```

## After Creating Actions

1. **Restart your services:**
   ```bash
   docker-compose restart frontend backend
   ```

2. **Clear browser cache** and try again

3. The World App should now recognize the request!

## Common Issues

### Issue: Can't find "Actions" section
**Solution**: Look in:
- App settings/sidebar
- Advanced settings
- Or check if you need to enable "Actions" feature first

### Issue: Action name doesn't work
**Solution**: 
- Make sure it matches EXACTLY (case-sensitive)
- No spaces or special characters
- Use lowercase with hyphens: `worldid-organizer-auth`

### Issue: Still getting "couldn't find request"
**Solution**:
1. Double-check action names match exactly
2. Make sure actions are saved/created (not just typed in)
3. Wait 1-2 minutes for changes to propagate
4. Try restarting the World App on your phone
5. Clear browser cache completely

## Testing

After creating the actions:
1. Go to your app: `https://www.halalhaven.kr`
2. Try organizer login with WorldID
3. The World App should now open and show the verification request

## Still Not Working?

If you've created the actions and it still doesn't work:
1. Check the action names in Developer Portal match your `.env` exactly
2. Verify the App ID in `.env` matches the one in the portal
3. Make sure you're using the same World App account that created the app
4. Try creating a fresh action with a different name to test
