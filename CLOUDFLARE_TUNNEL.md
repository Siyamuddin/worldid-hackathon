# Cloudflare Tunnel Configuration

## Overview

The application is now configured to be accessible via Cloudflare Tunnel at **www.halalhave.kr**.

## Configuration

### Environment Variables

The following variables are set in `.env`:

```env
CLOUDFLARE_TUNNEL_TOKEN=eyJhIjoiNTRkNWRlOWFiZGRjN2E3NmZjMTRkY2U0NzliZmIyZTQiLCJ0IjoiZTJhNDE4NWUtNjE3MC00NGZiLTg5N2EtNzdmODBhODI3ZmVhIiwicyI6Ik9XUmxZak0zWmpJdE5UQTRNaTAwTURFekxXSTFabUl0WlRjM1pETmpNalZoWXpZeiJ9
DOMAIN=www.halalhave.kr
```

### Docker Compose

The Cloudflare tunnel service is configured in `docker-compose.yml`:

- **Service**: `cloudflared`
- **Image**: `cloudflare/cloudflared:latest`
- **Command**: `tunnel --no-autoupdate run --token ${CLOUDFLARE_TUNNEL_TOKEN}`
- **Depends on**: `frontend` and `backend` services

### Routing

The tunnel automatically routes traffic based on the configuration in your Cloudflare dashboard:

- **Frontend**: `https://www.halalhave.kr` → `frontend:5173`
- **Backend API**: `https://www.halalhave.kr/api/*` → `backend:8000`

## Starting the Application

To start the application with Cloudflare tunnel:

```bash
docker-compose up -d
```

This will start:
1. PostgreSQL database
2. Backend API
3. Frontend
4. Cloudflare tunnel

## Accessing the Application

Once started, the application will be accessible at:

- **Frontend**: https://www.halalhave.kr
- **Backend API**: https://www.halalhave.kr/api
- **API Docs**: https://www.halalhave.kr/api/docs

## Important Notes

### Google OAuth Configuration

You need to update your Google OAuth settings to include the domain:

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Edit your OAuth 2.0 Client ID
3. Add to **Authorized JavaScript origins**:
   - `https://www.halalhave.kr`
   - `https://halalhave.kr`
4. Add to **Authorized redirect URIs**:
   - `https://www.halalhave.kr`
   - `https://halalhave.kr`

### WorldID Configuration

Make sure your WorldID app is configured to allow the domain:

1. Go to [WorldID Developer Portal](https://developer.worldcoin.org/)
2. Edit your app
3. Add `https://www.halalhave.kr` to allowed domains

### CORS

The backend CORS is configured to allow:
- `https://www.halalhave.kr`
- `https://halalhave.kr`
- `http://localhost:5173` (for local development)

## Troubleshooting

### Tunnel not connecting

1. Check if the token is valid in Cloudflare dashboard
2. Verify the tunnel is active: `docker-compose logs cloudflared`
3. Check Cloudflare dashboard for tunnel status

### Domain not resolving

1. Verify DNS is pointing to Cloudflare
2. Check Cloudflare dashboard for tunnel routing configuration
3. Ensure the domain is added to your Cloudflare account

### API calls failing

1. Check CORS settings in backend
2. Verify `VITE_API_BASE_URL` is set correctly
3. Check browser console for CORS errors

### Frontend can't connect to backend

1. Verify the tunnel routing in Cloudflare dashboard
2. Check that `/api/*` routes to `backend:8000`
3. Test backend directly: `curl https://www.halalhave.kr/api/health`

## Local Development

For local development, you can still access:

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:8000

The Cloudflare tunnel runs alongside local services, so both are accessible.
