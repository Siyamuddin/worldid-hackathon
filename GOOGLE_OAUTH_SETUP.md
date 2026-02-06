# Google OAuth Setup for Production Domain

## Error: origin_mismatch

This error occurs because `www.halalhaven.kr` is not registered in Google Cloud Console.

## Step-by-Step Fix

### 1. Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/apis/credentials
2. Make sure you're in the correct project
3. Find your OAuth 2.0 Client ID (the one with ID: `907137476909-hu02m87p1l62271uksres1ckugd43l0v`)
4. Click on it to edit

### 2. Add Authorized JavaScript Origins

In the **"Authorized JavaScript origins"** section, click **"+ Add URI"** and add:

```
https://www.halalhaven.kr
https://halalhaven.kr
```

**Important:** 
- Use `https://` (not `http://`)
- Include both `www.halalhaven.kr` and `halalhaven.kr` (without www)
- Keep your existing `http://localhost:5173` for local development

### 3. Add Authorized Redirect URIs (if needed)

In the **"Authorized redirect URIs"** section, add:

```
https://www.halalhaven.kr
https://halalhaven.kr
```

**Note:** Since you're using `@react-oauth/google` which handles OAuth client-side, you might not need redirect URIs, but it's good to add them just in case.

### 4. Save Changes

Click **"Save"** at the bottom of the page.

### 5. Wait for Propagation

Google says: "It may take 5 minutes to a few hours for settings to take effect"

Usually it's within 5-10 minutes.

## Current Configuration

Your OAuth Client ID: `907137476909-hu02m87p1l62271uksres1ckugd43l0v.apps.googleusercontent.com`

## Verification

After adding the domains, test by:
1. Visiting https://www.halalhaven.kr
2. Clicking "Sign in with Google"
3. The error should be gone

## Troubleshooting

If you still get the error after 10 minutes:
1. Double-check the URLs are exactly: `https://www.halalhaven.kr` and `https://halalhaven.kr`
2. Make sure there are no trailing slashes
3. Clear your browser cache
4. Try in an incognito/private window
