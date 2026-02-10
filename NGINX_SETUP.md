# Nginx Reverse Proxy Setup

## Overview

Nginx now acts as a reverse proxy that:
- Receives all requests from Cloudflare tunnel
- Routes `/api/*` to the backend (port 8000)
- Routes everything else to the frontend (port 5173)
- Handles CORS headers for all responses

## Architecture

```
Cloudflare Tunnel → Nginx (port 80) → Backend (port 8000) or Frontend (port 5173)
```

## Cloudflare Tunnel Configuration

Now you only need **ONE route** in Cloudflare:

### Route 1 - All Traffic
- **Hostname**: `www.halalhaven.kr`
- **Path**: (empty or `/*`)
- **Service**: `http://localhost:80`

That's it! Nginx handles all the routing internally:
- `/api/*` → Backend (port 8000)
- Everything else → Frontend (port 5173)

## CORS Configuration

CORS is now handled at the nginx level with these headers:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH`
- `Access-Control-Allow-Headers: Authorization, Content-Type, Accept, Origin, X-Requested-With`
- `Access-Control-Allow-Credentials: true`

Preflight OPTIONS requests are handled automatically.

## Ports

- **Nginx**: Port 80 (exposed to host)
- **Backend**: Port 8000 (internal only, accessed via nginx)
- **Frontend**: Port 5173 (internal only, accessed via nginx)

## Testing

After starting the services:

1. **Test nginx health:**
   ```bash
   curl http://localhost/health
   ```
   Should return: `healthy`

2. **Test backend via nginx:**
   ```bash
   curl http://localhost/api/health
   ```
   Should return: `{"status":"healthy"}`

3. **Test frontend via nginx:**
   ```bash
   curl http://localhost/
   ```
   Should return HTML from the frontend

## Restart Services

After adding nginx, restart all services:

```bash
docker-compose down
docker-compose up -d --build
```

## Troubleshooting

### Check nginx logs:
```bash
docker-compose logs nginx
```

### Check nginx configuration:
```bash
docker-compose exec nginx nginx -t
```

### Reload nginx config (if you change it):
```bash
docker-compose exec nginx nginx -s reload
```

## Benefits

1. **Simplified Cloudflare routing** - Only one route needed
2. **Centralized CORS handling** - All in nginx config
3. **Better production setup** - More scalable architecture
4. **Easier debugging** - All requests go through nginx first
