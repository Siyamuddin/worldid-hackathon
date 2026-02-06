# Troubleshooting Registration Issues

## Common Issues and Solutions

### Issue 1: "Internal Server Error"

**Symptoms**: Registration fails with "Internal Server Error" or 500 error

**Possible Causes**:
1. Database not running or not accessible
2. Database tables not created
3. Missing dependencies
4. Environment variables not set

**Solutions**:

1. **Check if database is running**:
   ```bash
   docker-compose ps
   # Should show db, backend, and frontend services running
   ```

2. **Check database connection**:
   ```bash
   # Check backend logs
   docker-compose logs backend --tail 50
   
   # Look for database connection errors
   ```

3. **Recreate database tables**:
   ```bash
   # Stop services
   docker-compose down
   
   # Remove database volume (WARNING: deletes all data)
   docker-compose down -v
   
   # Start again (tables will be created automatically)
   docker-compose up
   ```

4. **Check environment variables**:
   ```bash
   # Make sure .env file exists
   cat .env
   
   # Should have at least:
   # DATABASE_URL=postgresql://postgres:postgres@db:5432/worldid_rewards
   ```

### Issue 2: "Email already registered"

**Symptoms**: Error message says email is already in use

**Solutions**:
- Use a different email address
- Or delete the existing organizer from database:
  ```sql
  -- Connect to database
  docker-compose exec db psql -U postgres -d worldid_rewards
  
  -- Delete organizer
  DELETE FROM organizers WHERE email = 'your-email@example.com';
  ```

### Issue 3: CORS Error

**Symptoms**: Browser console shows CORS error

**Solutions**:
1. Check backend CORS settings in `backend/app/main.py`
2. Make sure frontend URL is in allowed origins
3. Restart backend after changes

### Issue 4: Network Error / Connection Refused

**Symptoms**: "Network Error" or "Connection Refused"

**Solutions**:
1. **Check if backend is running**:
   ```bash
   curl http://localhost:8000/health
   # Should return: {"status":"healthy"}
   ```

2. **Check if frontend can reach backend**:
   - Open browser console (F12)
   - Check Network tab for failed requests
   - Verify `VITE_API_BASE_URL` in frontend `.env`

3. **Restart services**:
   ```bash
   docker-compose restart
   ```

### Issue 5: Password Validation Error

**Symptoms**: Error about password requirements

**Solutions**:
- Password must be at least 6 characters
- Use a stronger password

### Issue 6: Form Not Submitting

**Symptoms**: Clicking Register does nothing

**Solutions**:
1. **Check browser console** for JavaScript errors
2. **Check network tab** to see if request is sent
3. **Verify form fields** are filled correctly
4. **Check if backend is accessible**

## Debugging Steps

### Step 1: Check Backend Logs

```bash
# View backend logs
docker-compose logs backend --tail 100

# Or if running manually
# Check terminal where backend is running
```

### Step 2: Test API Directly

```bash
# Test registration endpoint
curl -X POST http://localhost:8000/api/organizers/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "name": "Test Organization"
  }'

# Check response
# If it works, issue is in frontend
# If it fails, issue is in backend
```

### Step 3: Check Database

```bash
# Connect to database
docker-compose exec db psql -U postgres -d worldid_rewards

# Check if organizers table exists
\dt

# Check organizers
SELECT * FROM organizers;
```

### Step 4: Check Frontend Console

1. Open browser developer tools (F12)
2. Go to Console tab
3. Try to register
4. Look for errors

### Step 5: Check Network Requests

1. Open browser developer tools (F12)
2. Go to Network tab
3. Try to register
4. Check the registration request:
   - Status code
   - Request payload
   - Response

## Quick Fixes

### Reset Everything

```bash
# Stop all services
docker-compose down

# Remove all volumes (deletes data)
docker-compose down -v

# Rebuild and start
docker-compose up --build
```

### Manual Database Setup

```bash
# Connect to database
docker-compose exec db psql -U postgres -d worldid_rewards

# Create tables manually (if needed)
# Tables should be created automatically, but if not:
\i /path/to/schema.sql
```

### Check Environment Variables

```bash
# Backend .env should have:
DATABASE_URL=postgresql://postgres:postgres@db:5432/worldid_rewards
SECRET_KEY=your-secret-key
WORLDID_APP_ID=your-app-id

# Frontend .env should have:
VITE_API_BASE_URL=http://localhost:8000
VITE_WORLDID_APP_ID=your-app-id
```

## Still Not Working?

1. **Check the exact error message** in browser console
2. **Check backend logs** for detailed error
3. **Test API directly** with curl to isolate the issue
4. **Verify all services are running**: `docker-compose ps`
5. **Check database connection**: `docker-compose exec db psql -U postgres -d worldid_rewards -c "SELECT 1;"`

## Getting Help

If you're still having issues:

1. **Collect information**:
   - Error message from browser console
   - Backend logs
   - Network request details
   - Database status

2. **Check**:
   - All services are running
   - Database is accessible
   - Environment variables are set
   - No port conflicts

3. **Try**:
   - Restart all services
   - Clear browser cache
   - Try in incognito mode
   - Test API directly with curl
