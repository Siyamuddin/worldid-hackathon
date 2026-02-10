# Deployment Guide

## Quick Deployment for Hackathon

### Frontend Deployment (Mini-App)

The frontend needs to be deployed to a public URL for QR code access.

#### Option 1: Vercel (Easiest)

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend
cd frontend

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No
# - Project name? worldid-rewards
# - Directory? ./
# - Override settings? No

# After deployment, you'll get a URL like:
# https://worldid-rewards.vercel.app
```

**Environment Variables in Vercel**:
1. Go to Vercel dashboard
2. Select your project
3. Settings → Environment Variables
4. Add:
   - `VITE_API_BASE_URL` = Your backend URL
   - `VITE_WORLDID_APP_ID` = Your WorldID app ID
   - `VITE_WORLDID_ACTION` = worldid-reward-claim

#### Option 2: Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Navigate to frontend
cd frontend

# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist

# Follow prompts to create site
```

**Environment Variables in Netlify**:
1. Go to Netlify dashboard
2. Site settings → Environment variables
3. Add same variables as Vercel

#### Option 3: GitHub Pages

```bash
# Build frontend
cd frontend
npm run build

# Install gh-pages
npm install --save-dev gh-pages

# Add to package.json scripts:
# "deploy": "gh-pages -d dist"

# Deploy
npm run deploy
```

### Backend Deployment

The backend API needs to be accessible from the deployed frontend.

#### Option 1: Railway

1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Select your repository
4. Add environment variables
5. Deploy

#### Option 2: Render

1. Go to https://render.com
2. New → Web Service
3. Connect GitHub repository
4. Configure:
   - Build Command: `cd backend && pip install -r requirements.txt`
   - Start Command: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables
6. Deploy

#### Option 3: Fly.io

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Create app
fly launch

# Deploy
fly deploy
```

#### Option 4: Docker on Cloud Provider

```bash
# Build and push to container registry
docker build -t worldid-rewards-backend ./backend
docker tag worldid-rewards-backend your-registry/worldid-rewards-backend
docker push your-registry/worldid-rewards-backend

# Deploy to cloud provider (AWS ECS, GCP Cloud Run, Azure Container Instances)
```

### Database Setup

For production, use a managed PostgreSQL service:

- **Supabase** (Free tier available)
- **Neon** (Free tier available)
- **Railway** (PostgreSQL addon)
- **Render** (PostgreSQL addon)
- **AWS RDS** (Paid)
- **Google Cloud SQL** (Paid)

Update `DATABASE_URL` in backend environment variables.

## Environment Variables

### Frontend (.env.production)

```bash
VITE_API_BASE_URL=https://your-backend-url.com
VITE_WORLDID_APP_ID=your_worldid_app_id
VITE_WORLDID_ACTION=worldid-reward-claim
```

### Backend (.env)

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# WorldID
WORLDID_APP_ID=your_worldid_app_id
WORLDID_ACTION=worldid-reward-claim
WORLDID_VERIFY_URL=https://developer.worldcoin.org/api/v1/verify

# Blockchain
ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/your-key
PRIVATE_KEY=your_private_key  # Optional, for sending transactions

# Security
SECRET_KEY=your-secret-key-change-this
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## CORS Configuration

If frontend and backend are on different domains, update CORS in backend:

```python
# backend/app/main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend-url.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Testing Deployment

1. **Test Frontend**:
   - Open deployed URL in browser
   - Test on mobile device
   - Scan QR code
   - Verify app loads

2. **Test Backend**:
   - Check API health: `https://your-backend-url.com/health`
   - Test API docs: `https://your-backend-url.com/docs`
   - Test endpoints from frontend

3. **Test Complete Flow**:
   - Connect wallet
   - Verify with WorldID
   - Join event
   - Claim rewards
   - Test duplicate prevention

## QR Code Generation

After deployment, generate QR code:

1. **Online**: https://www.qr-code-generator.com/
2. **Enter URL**: Your deployed frontend URL
3. **Download**: Save as `qr-code.png`
4. **Test**: Scan with phone to verify

## Troubleshooting

### Frontend Issues

- **Build fails**: Check Node version (18+)
- **Environment variables not working**: Ensure `VITE_` prefix
- **CORS errors**: Update backend CORS settings
- **WorldID not working**: Check `VITE_WORLDID_APP_ID` is set

### Backend Issues

- **Database connection fails**: Check `DATABASE_URL`
- **WorldID verification fails**: Check `WORLDID_APP_ID` and `WORLDID_VERIFY_URL`
- **Port issues**: Use environment variable for port (e.g., `PORT`)

### QR Code Issues

- **QR code doesn't work**: Ensure URL is accessible
- **App doesn't load**: Check HTTPS (required for WorldID)
- **CORS errors**: Update backend CORS configuration

## Production Checklist

- [ ] Frontend deployed to public URL
- [ ] Backend deployed and accessible
- [ ] Database configured and accessible
- [ ] Environment variables set
- [ ] CORS configured correctly
- [ ] HTTPS enabled (required for WorldID)
- [ ] QR code generated and tested
- [ ] Tested on iOS device
- [ ] Tested on Android device
- [ ] Complete flow tested
- [ ] Duplicate prevention tested

## Quick Deploy Script

Create `deploy.sh`:

```bash
#!/bin/bash

# Build frontend
cd frontend
npm run build

# Deploy to Vercel (or your preferred platform)
vercel --prod

# Get deployment URL
echo "Frontend deployed! URL:"
vercel ls | grep worldid-rewards

# Generate QR code
echo "Generate QR code at: https://www.qr-code-generator.com/"
```
