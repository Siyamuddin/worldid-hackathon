# Verify Cloudflare Tunnel Update

## Current Status

The tunnel logs show it's still using the old configuration:
```
"service":"http://localhost:5173"
```

## What You Need to Do

### 1. Double-Check the URL Format

In the Cloudflare dashboard, make sure the URL field shows:
```
http://localhost:80
```

**NOT:**
- ❌ `localhost:80` (missing `http://`)
- ❌ `http://localhost` (missing `:80`)
- ❌ `https://localhost:80` (wrong protocol)

### 2. Verify You Saved the Changes

1. Make sure you clicked **"Save"** button
2. Wait for a confirmation message
3. The page should show the updated configuration

### 3. Check for Multiple Routes

Make sure you only have **ONE route** for `www.halalhaven.kr`:
- Delete any duplicate routes
- Keep only the one pointing to `http://localhost:80`

### 4. Wait for Propagation

Cloudflare changes can take 1-5 minutes to propagate. After saving:
1. Wait 2-3 minutes
2. Check the tunnel logs: `docker-compose logs cloudflared --tail 5`
3. Look for: `"service":"http://localhost:80"`

### 5. Force Tunnel Reconnect

If it's still not updating after 5 minutes, restart the tunnel:

```bash
docker-compose restart cloudflared
```

Then check logs again:
```bash
docker-compose logs cloudflared --tail 10 | grep "Updated to new configuration"
```

You should see: `"service":"http://localhost:80"`

## Test After Update

Once the tunnel shows `localhost:80` in the logs:

```bash
# Should return JSON, not HTML
curl https://www.halalhaven.kr/api/health
```

Expected: `{"status":"healthy"}`

If you still get HTML, the tunnel hasn't updated yet.
