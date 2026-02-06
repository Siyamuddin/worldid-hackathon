# WorldID Setup Instructions

## The Error You're Seeing

The error "World App was opened to handle a request from another app or website, but we couldn't find the request" occurs because:

1. **Your app is not registered** in the WorldID Developer Portal
2. **The app_id is using a placeholder** (`app_staging_123`) instead of a real registered app ID

## How to Fix This

### Step 1: Register Your App in WorldID Developer Portal

1. Go to **WorldID Developer Portal**: https://developer.worldcoin.org/
2. Sign in with your World App or create an account
3. Click **"Create App"** or **"New App"**
4. Fill in the app details:
   - **App Name**: WorldID Reward Distribution System (or your preferred name)
   - **Description**: Event-based reward distribution with WorldID verification
   - **Website URL**: `http://localhost:5173` (for development)
   - **Action Name**: `worldid-organizer-auth` (for organizer login)
   - **Action Name**: `worldid-reward-claim` (for participant rewards)

### Step 2: Get Your App ID

After creating the app, you'll receive:
- **App ID**: Something like `app_xxxxxxxxxxxxxxxxxxxxx`
- Copy this App ID

### Step 3: Update Your .env File

Add the following to your `.env` file:

```env
# WorldID Configuration
WORLDID_APP_ID=your_actual_app_id_here
WORLDID_ACTION=worldid-organizer-auth
VITE_WORLDID_APP_ID=your_actual_app_id_here
VITE_WORLDID_ACTION=worldid-organizer-auth
```

**Important**: Replace `your_actual_app_id_here` with the actual App ID from the Developer Portal.

### Step 4: Restart Your Application

After updating the `.env` file:

```bash
docker-compose down
docker-compose up --build
```

Or if running locally:
- Restart your frontend dev server
- Restart your backend server

## Multiple Actions

If you need different actions for different use cases:

1. **Organizer Authentication**: `worldid-organizer-auth`
2. **Participant Event Join**: `worldid-event-join`
3. **Reward Claiming**: `worldid-reward-claim`

You can create multiple actions in the same app, or use the same action for all.

## Testing Without Registration

**Note**: For development/testing, you might be able to use test credentials, but for production and proper integration, you **must** register your app in the Developer Portal.

## Troubleshooting

- **Still getting the error?**: Make sure the App ID in `.env` matches exactly what's in the Developer Portal
- **App ID not working?**: Verify the app is published/active in the Developer Portal
- **Different actions?**: Make sure the action names match between your code and the Developer Portal

## Quick Reference

- **Developer Portal**: https://developer.worldcoin.org/
- **Documentation**: https://docs.worldcoin.org/
- **Support**: Check WorldID Discord or GitHub
