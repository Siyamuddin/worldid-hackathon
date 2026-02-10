# Cloudflare Tunnel URL Format

## Important: URL Format

When configuring the Cloudflare tunnel service URL, make sure to use the **full URL format**:

### ✅ CORRECT Format:
```
http://localhost:80
```

### ❌ WRONG Formats:
- `localhost:80` (missing protocol)
- `http://localhost` (missing port)
- `https://localhost:80` (wrong protocol - use http for localhost)

## Steps to Verify

1. In Cloudflare Dashboard, go to your tunnel configuration
2. Check the **URL** field for the route
3. It should be exactly: `http://localhost:80`
4. Click **Save**
5. Wait 1-2 minutes for propagation

## Restart Tunnel (if needed)

After updating, you can restart the tunnel container to force it to reconnect:

```bash
docker-compose restart cloudflared
```

## Verification

After updating and waiting, test:

```bash
# Should return JSON (from backend via nginx)
curl https://www.halalhaven.kr/api/health

# Should return: {"status":"healthy"}
```

If it returns HTML, the tunnel is still pointing to the frontend.
