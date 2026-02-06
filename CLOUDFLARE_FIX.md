# Fixing Cloudflare Tunnel Bad Gateway Error

## Problem

The tunnel is getting "connection refused" errors because:
1. The tunnel runs in a Docker container and can't access `localhost` on the host
2. The Cloudflare dashboard routing needs to be configured correctly
3. Domain mismatch: Dashboard shows `www.halalhaven.kr` but should be `www.halalhave.kr`

## Solution: Update Cloudflare Dashboard Routing

**IMPORTANT**: You need to update the routing in your Cloudflare dashboard:

1. Go to **Cloudflare Dashboard** → **Zero Trust** → **Networks** → **Tunnels**
2. Find your tunnel and click **Configure**
3. Update the **Public Hostname** routing:

   **Route 1 - API Routes (MUST BE FIRST):**
   - **Hostname**: `www.halalhaven.kr`
   - **Path**: `/api/*`
   - **Service**: `http://localhost:8000`

   **Route 2 - Frontend (Catch-all):**
   - **Hostname**: `www.halalhaven.kr`
   - **Path**: (leave empty or `/*`)
   - **Service**: `http://localhost:5173`

   **Route 3 - Catch-all (404):**
   - **Service**: `http_status:404`

**Note**: Routes are matched in order, so API routes must come BEFORE the frontend route!

### Option 2: Use Host Networking (Quick Fix)

I've updated `docker-compose.yml` to use `network_mode: "host"` for the tunnel. This allows it to access `localhost` on the host machine.

**Restart the services:**
```bash
docker-compose down
docker-compose up -d
```

### Option 3: Use Docker Service Names (Requires Config File)

If you want to use Docker service names, you need to create a config file instead of using a token. This is more complex but better for Docker setups.

## Current Status

The tunnel is now configured with `network_mode: "host"` which should allow it to access services on the host.

**Next Steps:**
1. Restart the services: `docker-compose restart cloudflared`
2. Check if it works: Visit `https://www.halalhave.kr`
3. If still not working, update the Cloudflare dashboard routing as described in Option 1

## Verify It's Working

Check the tunnel logs:
```bash
docker-compose logs cloudflared --tail 50
```

You should see successful connections instead of "connection refused" errors.
