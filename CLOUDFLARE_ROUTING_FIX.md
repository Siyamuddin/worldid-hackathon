# Cloudflare Tunnel Routing Fix - CRITICAL

## Problem
The Cloudflare tunnel is routing ALL traffic to the frontend (`localhost:5173`), so API requests to `/api/*` are getting 404 errors because the frontend doesn't have those routes.

## Current Configuration (WRONG)
```
Route 1: www.halalhaven.kr → http://localhost:5173 (ALL traffic)
Route 2: Catch-all → http_status:404
```

## Required Configuration (CORRECT)

You MUST update your Cloudflare dashboard routing. The routes must be in this exact order:

### Route 1 - API Routes (MUST BE FIRST!)
- **Hostname**: `www.halalhaven.kr`
- **Path**: `/api/*`
- **Service**: `http://localhost:8000`

### Route 2 - Frontend (Catch-all)
- **Hostname**: `www.halalhaven.kr`
- **Path**: (empty or `/*`)
- **Service**: `http://localhost:5173`

### Route 3 - Catch-all 404
- **Service**: `http_status:404`

## How to Fix

1. Go to **Cloudflare Dashboard** → **Zero Trust** → **Networks** → **Tunnels**
2. Find your tunnel (tunnelID: `e4b788b2-3033-4a09-98ab-001291a51155`)
3. Click **Configure**
4. Under **Public Hostname**, you should see the current route
5. **Delete the existing route** that routes everything to `localhost:5173`
6. **Add Route 1** (API routes) - MUST BE FIRST:
   - Click **"Add a public hostname"**
   - **Hostname**: `www.halalhaven.kr`
   - **Path**: `/api/*`
   - **Service**: `http://localhost:8000`
   - Click **Save hostname**
7. **Add Route 2** (Frontend):
   - Click **"Add a public hostname"** again
   - **Hostname**: `www.halalhaven.kr`
   - **Path**: (leave empty or enter `/*`)
   - **Service**: `http://localhost:5173`
   - Click **Save hostname**
8. **Add Route 3** (Catch-all):
   - The catch-all route should already be there, or add:
   - **Service**: `http_status:404`
9. **Save** all changes

## Why Order Matters

Cloudflare matches routes **in order**. If the frontend route comes first, it will catch ALL requests including `/api/*`, which is why you're getting 404s.

## Verification

After updating, wait 1-2 minutes, then test:
```bash
curl https://www.halalhaven.kr/api/health
```

Should return: `{"status":"healthy"}`

If it returns HTML or 404, the routing is still wrong.

## Current Status

Your tunnel logs show:
```
"ingress":[{"hostname":"www.halalhaven.kr","service":"http://localhost:5173"},{"service":"http_status:404"}]
```

This is WRONG - there's no route for `/api/*` to the backend!
