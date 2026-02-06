# ⚠️ URGENT: WorldID Action Setup Required

## Problem Identified

Your app exists in WorldID Developer Portal (`app_2c1d85cd742db32847cb795c3fffaa9f`), but the **Actions are missing**. The World App needs actions to know what verification to perform.

## What I Fixed

1. ✅ Updated `.env` to use the correct App ID: `app_2c1d85cd742db32847cb795c3fffaa9f`
2. ✅ Restarted services to load the new configuration

## What YOU Need to Do NOW

### Step 1: Go to Actions Section

1. In your WorldID Developer Portal (https://developer.worldcoin.org/)
2. Open your app "InHuman" (ID: `app_2c1d85cd742db32847cb795c3fffaa9f`)
3. Look for **"Actions"** in the sidebar or app settings
4. If you don't see it, check:
   - App settings
   - Advanced settings
   - Or it might be under a different tab

### Step 2: Create Action 1 - Organizer Authentication

Click **"Create Action"** or **"Add Action"** and enter:

- **Action Name**: `worldid-organizer-auth` 
  - ⚠️ MUST be exactly this (case-sensitive, with hyphens)
  - No spaces, no capital letters
  
- **Description**: "Organizer authentication for WorldID Reward System"

- **Verification Level**: 
  - Choose `Orb` if available (more secure)
  - Choose `Device` if you only have device verification (for testing)

- **Max Verifications**: 
  - `Unlimited` (for testing/hackathon)
  - OR `1 per user per action` (for production - prevents duplicate logins)

Click **"Save"** or **"Create"**

### Step 3: Create Action 2 - Participant Verification

Create another action:

- **Action Name**: `worldid-reward-claim`
  - ⚠️ MUST be exactly this (case-sensitive)
  
- **Description**: "Participant event joining and reward claiming"

- **Verification Level**: `Orb` (or `Device` for testing)

- **Max Verifications**: `1 per user per action` 
  - ⚠️ This is CRITICAL - prevents duplicate reward claims

Click **"Save"** or **"Create"**

### Step 4: Verify Actions Are Created

You should now see both actions listed:
- ✅ `worldid-organizer-auth`
- ✅ `worldid-reward-claim`

### Step 5: Test

1. Wait 1-2 minutes for changes to propagate
2. Clear your browser cache
3. Try WorldID verification again
4. The World App should now recognize the request!

## Why This Fixes It

- **Before**: App exists but no actions → World App doesn't know what to verify → "couldn't find request"
- **After**: App + Actions exist → World App knows what verification to perform → ✅ Works!

## Still Not Working?

1. **Double-check action names** - they must match EXACTLY:
   - `worldid-organizer-auth` (not `worldid_organizer_auth` or `WorldID-Organizer-Auth`)
   - `worldid-reward-claim` (not `worldid_reward_claim`)

2. **Verify App ID matches** - Should be `app_2c1d85cd742db32847cb795c3fffaa9f`

3. **Wait for propagation** - Changes can take 1-2 minutes

4. **Restart World App** on your phone

5. **Clear browser cache completely**

## Quick Checklist

- [ ] Actions section found in Developer Portal
- [ ] Action `worldid-organizer-auth` created
- [ ] Action `worldid-reward-claim` created
- [ ] Action names match exactly (case-sensitive)
- [ ] Actions are saved/active
- [ ] Waited 1-2 minutes
- [ ] Cleared browser cache
- [ ] Tested again
