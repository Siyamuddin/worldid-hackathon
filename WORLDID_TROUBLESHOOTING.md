# WorldID "Couldn't Find the Request" Error - Troubleshooting

## Error Message
"World App was opened to handle a request from another app or website, but we couldn't find the request."

## What This Means
The World App cannot find a verification request for your App ID. This usually means:
1. The App ID is not registered in WorldID Developer Portal
2. The action name doesn't exist in your app
3. The app is not properly configured

## Current Configuration
- **App ID**: `app_2c1d85cd742db32847cb795c3fffaa9f`
- **Action**: `worldid-organizer-auth`

## Step-by-Step Fix

### 1. Verify App ID in WorldID Developer Portal

1. Go to: https://developer.worldcoin.org/
2. Sign in with your World App
3. Navigate to **"Apps"** section
4. Check if you have an app with ID: `app_2c1d85cd742db32847cb795c3fffaa9f`
5. If you don't see this app, you need to create it

### 2. Create App (if it doesn't exist)

1. Click **"Create App"** or **"New App"**
2. Give it a name (e.g., "World Build Korea Rewards")
3. Copy the **App ID** you receive
4. Update your `.env` file with the new App ID:
   ```
   WORLDID_APP_ID=your_new_app_id_here
   VITE_WORLDID_APP_ID=your_new_app_id_here
   ```

### 3. Create Required Actions

In your app's settings, go to **"Actions"** section and create:

**Action 1: Organizer Authentication**
- **Name**: `worldid-organizer-auth`
- **Description**: "Organizer authentication for WorldID Reward System"
- **Verification Level**: `Orb` (recommended) or `Device` (for testing)
- **Max Verifications**: `Unlimited` (for testing) or `1 per user per action` (for production)
- Click **"Create"**

**Action 2: Participant Verification** (if needed)
- **Name**: `worldid-reward-claim`
- **Description**: "Participant event joining and reward claiming"
- **Verification Level**: `Orb`
- **Max Verifications**: `1 per user per action`
- Click **"Create"**

### 4. Verify Action Names Match

Make sure the action names in your `.env` file match exactly with the actions you created:
- `VITE_WORLDID_ACTION=worldid-organizer-auth` (must match action name in portal)
- Backend uses `WORLDID_ACTION` which should also match

### 5. Restart Services

After updating `.env`:
```bash
docker-compose restart frontend backend
```

### 6. Test Again

1. Clear your browser cache
2. Try the WorldID verification again
3. The World App should now recognize the request

## Common Issues

### Issue: App ID doesn't exist
**Solution**: Create a new app in WorldID Developer Portal and update `.env`

### Issue: Action name mismatch
**Solution**: Check that action names in `.env` exactly match the action names in the portal (case-sensitive)

### Issue: App not published/active
**Solution**: Make sure your app is active in the Developer Portal

### Issue: Wrong verification level
**Solution**: If you don't have Orb verification, use `VerificationLevel.Device` in the code temporarily

## Quick Test

To verify your App ID is correct, you can test it:
1. Open browser console
2. Check if `VITE_WORLDID_APP_ID` is loaded:
   ```javascript
   console.log(import.meta.env.VITE_WORLDID_APP_ID)
   ```
3. It should show: `app_2c1d85cd742db32847cb795c3fffaa9f`

## Still Not Working?

1. Double-check the App ID in `.env` matches the one in Developer Portal
2. Verify the action name exists in your app
3. Make sure you're using the same World App account that created the app
4. Try creating a fresh app with a new App ID
5. Check WorldID Developer Portal for any error messages or warnings
