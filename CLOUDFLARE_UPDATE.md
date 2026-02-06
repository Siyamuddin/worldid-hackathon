# Update Cloudflare Tunnel Configuration

## IMPORTANT: Update Your Cloudflare Dashboard

Now that nginx is handling routing, you need to update your Cloudflare tunnel configuration to point to nginx instead of the frontend.

## Steps

1. Go to **Cloudflare Dashboard** → **Zero Trust** → **Networks** → **Tunnels**
2. Find your tunnel and click **Configure**
3. **Delete all existing routes**
4. **Add ONE new route:**

   **Route 1 - All Traffic:**
   - **Hostname**: `www.halalhaven.kr`
   - **Path**: (leave empty or enter `/*`)
   - **Service**: `http://localhost:80`

5. **Save** the changes

## Why This Works

- Nginx listens on port 80
- Nginx automatically routes:
  - `/api/*` → Backend (port 8000)
  - Everything else → Frontend (port 5173)
- CORS is handled by nginx
- No need for multiple Cloudflare routes!

## Verification

After updating, wait 1-2 minutes, then test:

```bash
# Test frontend
curl https://www.halalhaven.kr/

# Test backend API
curl https://www.halalhaven.kr/api/health
```

Both should work correctly!
