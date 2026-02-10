# Testing Guide

## Quick Start Testing

### 1. Start the Application

```bash
# Using Docker Compose (Recommended)
docker-compose up

# Or manually:
# Terminal 1: Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
```

### 2. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## Testing Checklist

### Basic Functionality Tests

#### ✅ Test 1: Application Loads
- [ ] Open http://localhost:5173 in browser
- [ ] Home page loads correctly
- [ ] Navigation works
- [ ] No console errors

#### ✅ Test 2: Wallet Connection
- [ ] Click "Connect Wallet" button
- [ ] MetaMask/wallet prompt appears
- [ ] Wallet connects successfully
- [ ] Wallet address displays correctly

#### ✅ Test 3: Browse Events
- [ ] Navigate to Events page
- [ ] Events list loads (may be empty if no events created)
- [ ] Event cards display correctly

#### ✅ Test 4: Create Event (Organizer)
- [ ] Navigate to Organizer Dashboard
- [ ] Register/Login as organizer
- [ ] Create a new event
- [ ] Add rewards to event
- [ ] Event appears in events list

### WorldID Verification Tests

#### ✅ Test 5: WorldID Verification Flow
- [ ] Connect wallet
- [ ] Navigate to event detail page
- [ ] Click "Verify with WorldID" button
- [ ] WorldID widget opens
- [ ] Complete WorldID verification
- [ ] Verification success message appears
- [ ] Privacy notice is visible

**Note**: You need a valid WorldID app ID in `.env`:
```bash
VITE_WORLDID_APP_ID=your_app_id
WORLDID_APP_ID=your_app_id
```

#### ✅ Test 6: Join Event
- [ ] Connect wallet
- [ ] Verify with WorldID
- [ ] Click "Join Event" button
- [ ] Success message appears
- [ ] Event join is recorded in database

#### ✅ Test 7: Claim Rewards
- [ ] After joining event
- [ ] Verify with WorldID again (fresh proof)
- [ ] Click "Claim Rewards" button
- [ ] Claim is processed
- [ ] Success message with transaction hash appears

### Anti-Abuse Tests

#### ✅ Test 8: Duplicate Prevention - Same Event
- [ ] Join an event and claim rewards
- [ ] Try to claim again from the same event
- [ ] Error message: "Rewards for this event have already been claimed"
- [ ] Second claim is rejected

#### ✅ Test 9: Duplicate Prevention - Different Wallet
- [ ] Join event with Wallet A
- [ ] Try to join same event with Wallet B (different wallet)
- [ ] If same WorldID: Error "WorldID already linked to different wallet"
- [ ] If different WorldID: Should work (different person)

#### ✅ Test 10: Proof Reuse Prevention
- [ ] Generate WorldID proof
- [ ] Use proof to claim rewards
- [ ] Try to use same proof again
- [ ] WorldID API should reject stale proof
- [ ] Or backend should detect duplicate nullifier hash

#### ✅ Test 11: Rate Limiting
- [ ] Make multiple rapid requests to join endpoint
- [ ] After 5 requests in 60 seconds, should get rate limit error
- [ ] Wait 60 seconds, requests should work again

### Privacy Tests

#### ✅ Test 12: Privacy Indicators
- [ ] Privacy notice is visible on event detail page
- [ ] Privacy information is clear
- [ ] "What we collect" and "What we don't collect" are shown

#### ✅ Test 13: Data Minimization
- [ ] Check database after joining event
- [ ] Verify only nullifier hash is stored (not identity)
- [ ] Verify wallet address is stored (public data)
- [ ] Verify no personal information is stored

### Mobile/Mini-App Tests

#### ✅ Test 14: Mobile Responsiveness
- [ ] Open in mobile browser (or Chrome DevTools mobile view)
- [ ] UI is responsive and usable
- [ ] Touch targets are large enough (44px minimum)
- [ ] Text is readable
- [ ] Forms are usable

#### ✅ Test 15: QR Code Access
- [ ] Deploy frontend to public URL (see deployment.md)
- [ ] Generate QR code for deployed URL
- [ ] Scan QR code with phone camera
- [ ] App opens correctly
- [ ] Complete flow works on mobile

#### ✅ Test 16: Mini-App Mode
- [ ] Add `?miniapp=true` to URL
- [ ] Or set `localStorage.setItem('miniapp_mode', 'true')`
- [ ] Refresh page
- [ ] Mini-app optimizations are active
- [ ] Body has `miniapp-mode` class

### End-to-End Flow Tests

#### ✅ Test 17: Complete User Journey
1. [ ] Open app (via QR code on mobile)
2. [ ] Connect wallet
3. [ ] Browse events
4. [ ] View event details
5. [ ] Join event (WorldID verification)
6. [ ] Claim rewards (WorldID verification)
7. [ ] Verify duplicate prevention works
8. [ ] Check privacy indicators throughout

#### ✅ Test 18: Organizer Flow
1. [ ] Register as organizer
2. [ ] Login
3. [ ] Create event
4. [ ] Add rewards (ERC-20 tokens or NFTs)
5. [ ] View event participants
6. [ ] View claims statistics

## Testing with Test Data

### Create Test Event

Use the API or Organizer Dashboard:

```bash
# Register organizer
curl -X POST http://localhost:8000/api/organizers/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "organizer@test.com",
    "password": "test123"
  }'

# Login
curl -X POST http://localhost:8000/api/organizers/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "organizer@test.com",
    "password": "test123"
  }'
# Save the access_token from response

# Create event
curl -X POST http://localhost:8000/api/organizers/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "Test Event",
    "description": "Testing WorldID rewards",
    "start_date": "2026-01-01T00:00:00",
    "end_date": "2026-12-31T23:59:59",
    "rewards": [
      {
        "reward_type": "ERC20",
        "token_address": "0x1234567890123456789012345678901234567890",
        "amount": 100
      }
    ]
  }'
```

## Testing WorldID Verification

### Using Staging App ID

For testing, you can use WorldID's staging app ID:

```bash
# Frontend .env
VITE_WORLDID_APP_ID=app_staging_123
VITE_WORLDID_ACTION=worldid-reward-claim

# Backend .env
WORLDID_APP_ID=app_staging_123
WORLDID_ACTION=worldid-reward-claim
WORLDID_VERIFY_URL=https://developer.worldcoin.org/api/v1/verify
```

**Note**: Staging app ID may have limitations. For production, register your own app at https://developer.worldcoin.org/

### Testing Without Real WorldID

For development/testing without real WorldID verification:

1. **Mock WorldID Service** (for development only):
   - Create a mock that returns success
   - Only use for UI/UX testing
   - **Never use in production**

2. **Use Test Mode**:
   - Some WorldID SDKs have test mode
   - Check WorldID documentation

## Automated Testing

### Backend API Tests

```bash
# Install pytest
cd backend
pip install pytest pytest-asyncio httpx

# Run tests (if you create test files)
pytest
```

### Frontend Tests

```bash
# Install testing dependencies
cd frontend
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest

# Run tests (if you create test files)
npm test
```

## Testing Checklist for Hackathon Submission

Before submitting, ensure:

- [ ] ✅ App loads on iOS device
- [ ] ✅ App loads on Android device
- [ ] ✅ QR code scanning works
- [ ] ✅ Wallet connection works
- [ ] ✅ WorldID verification works
- [ ] ✅ Join event flow works
- [ ] ✅ Claim rewards flow works
- [ ] ✅ Duplicate prevention works
- [ ] ✅ Privacy indicators visible
- [ ] ✅ Error messages are clear
- [ ] ✅ UI is responsive on mobile
- [ ] ✅ Complete flow works end-to-end
- [ ] ✅ No console errors
- [ ] ✅ Backend API is accessible
- [ ] ✅ Database is working

## Common Issues and Solutions

### Issue: WorldID Verification Fails

**Solution**:
- Check `WORLDID_APP_ID` is set correctly
- Verify `WORLDID_VERIFY_URL` is correct
- Check network connectivity
- Verify app ID is registered with WorldID

### Issue: Wallet Connection Fails

**Solution**:
- Ensure MetaMask/wallet extension is installed
- Check wallet is unlocked
- Verify network (should be Ethereum mainnet or testnet)
- Check browser console for errors

### Issue: CORS Errors

**Solution**:
- Update backend CORS settings in `main.py`
- Add frontend URL to allowed origins
- Check backend is running

### Issue: Database Connection Fails

**Solution**:
- Verify PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- Test connection: `psql $DATABASE_URL`

### Issue: Build Fails

**Solution**:
- Check Node version (18+)
- Delete `node_modules` and reinstall
- Check for TypeScript errors
- Verify all dependencies are installed

## Performance Testing

### Load Testing

```bash
# Install Apache Bench or use similar tool
ab -n 100 -c 10 http://localhost:8000/api/events
```

### Stress Testing

- Test with multiple concurrent users
- Test rate limiting under load
- Test database performance with many events/claims

## Security Testing

### Test Input Validation

- [ ] Try invalid wallet addresses
- [ ] Try invalid event IDs
- [ ] Try SQL injection attempts (should fail)
- [ ] Try XSS attempts (should be sanitized)

### Test Authentication

- [ ] Try accessing organizer endpoints without token
- [ ] Try accessing with invalid token
- [ ] Verify JWT expiration works

## Next Steps

After testing:

1. **Fix any issues** found during testing
2. **Document known limitations** if any
3. **Prepare demo video** showing working flow
4. **Deploy to production** for QR code access
5. **Generate QR code** and test on real devices
6. **Submit** before deadline

## Quick Test Script

Create `test.sh`:

```bash
#!/bin/bash

echo "🧪 Testing WorldID Reward Distribution System"

# Check if backend is running
echo "Checking backend..."
curl -f http://localhost:8000/health || echo "❌ Backend not running"

# Check if frontend is running
echo "Checking frontend..."
curl -f http://localhost:5173 || echo "❌ Frontend not running"

# Check API endpoints
echo "Testing API endpoints..."
curl -f http://localhost:8000/api/events || echo "❌ Events endpoint failed"

echo "✅ Basic checks complete"
echo "Open http://localhost:5173 to test manually"
```

Make it executable:
```bash
chmod +x test.sh
./test.sh
```
