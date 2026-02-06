# ⚠️ URGENT: Fix Cloudflare Tunnel Configuration

## Problem
Your Cloudflare tunnel is still pointing to `localhost:5173` (frontend) instead of `localhost:80` (nginx). This is why you're getting 404 errors for API requests.

## Current Configuration (WRONG)
```
"service":"http://localhost:5173"
```

## Required Configuration (CORRECT)
```
"service":"http://localhost:80"
```

## How to Fix (5 minutes)

### Step 1: Go to Cloudflare Dashboard
1. Visit: https://one.dash.cloudflare.com/
2. Navigate to: **Zero Trust** → **Networks** → **Tunnels**
3. Find your tunnel (tunnelID: `e4b788b2-3033-4a09-98ab-001291a51155`)

### Step 2: Edit the Tunnel
1. Click on your tunnel name
2. Click **"Configure"** button
3. You should see a route for `www.halalhaven.kr`

### Step 3: Update the Service
1. Click on the existing route
2. Change the **Service** from:
   - ❌ `http://localhost:5173`
   - ✅ `http://localhost:80`
3. Click **Save**

### Step 4: Wait for Propagation
- Wait 1-2 minutes for the change to propagate
- The tunnel will automatically reconnect with the new configuration

## Verification

After updating, test:

```bash
# This should return HTML (frontend)
curl https://www.halalhaven.kr/

# This should return {"status":"healthy"} (backend via nginx)
curl https://www.halalhaven.kr/api/health
```

## Why This Fixes It

- **Before**: Cloudflare → Frontend (port 5173) → No API routes → 404
- **After**: Cloudflare → Nginx (port 80) → Routes `/api/*` to backend → ✅

Nginx is already configured and working correctly. You just need to point Cloudflare to it!

## Quick Test (Before Fixing Cloudflare)

You can test locally that nginx is working:
```bash
curl http://localhost/api/auth/google/verify -X POST -H "Content-Type: application/json" -d '{"token":"test"}'
```

This should return: `{"detail":"Invalid Google token"}` (which means it reached the backend!)
