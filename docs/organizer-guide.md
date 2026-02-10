# Organizer Guide

## How to Register and Use the System

### Step 1: Register as an Organizer

#### Option A: Using the Web Interface (Easiest)

1. **Start the application**:
   ```bash
   docker-compose up
   # Or manually start backend and frontend
   ```

2. **Open the Organizer Dashboard**:
   - Navigate to http://localhost:5173
   - Click **"Organizer Dashboard"** in the navigation menu
   - Or go directly to: http://localhost:5173/#/organizer

3. **Register**:
   - Click **"Don't have an account? Register"**
   - Fill in the registration form:
     - **Name**: Your organization name (e.g., "My Event Company")
     - **Email**: Your email address (e.g., "organizer@example.com")
     - **Password**: A secure password (minimum 6 characters)
   - Click **"Register"**
   - You'll see a success message

4. **Login**:
   - After registration, you'll be redirected to the login form
   - Enter your email and password
   - Click **"Login"**
   - You'll be logged in and see the dashboard

#### Option B: Using the API Directly

```bash
# Register
curl -X POST http://localhost:8000/api/organizers/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "organizer@example.com",
    "password": "securepassword123",
    "name": "My Organization"
  }'

# Response will be:
# {
#   "id": 1,
#   "email": "organizer@example.com",
#   "name": "My Organization",
#   "is_active": true,
#   "created_at": "2026-01-01T00:00:00"
# }
```

### Step 2: Login

#### Using Web Interface

1. Go to Organizer Dashboard
2. Enter your email and password
3. Click "Login"
4. You'll be logged in automatically

#### Using API

```bash
# Login
curl -X POST http://localhost:8000/api/organizers/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "organizer@example.com",
    "password": "securepassword123"
  }'

# Response will include access_token:
# {
#   "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "token_type": "bearer"
# }
```

**Save the `access_token`** - you'll need it for authenticated API requests.

### Step 3: Create an Event

Once logged in, you can create events:

#### Using Web Interface

1. In the Organizer Dashboard, click **"Create Event"** button
2. Fill in the form:
   - **Event Name**: e.g., "Summer Festival 2026"
   - **Description**: e.g., "Join us for an amazing summer festival"
3. Click **"Create Event"**
4. The event will appear in your events list

#### Using API

```bash
# Create event (replace YOUR_TOKEN with your access_token)
curl -X POST http://localhost:8000/api/organizers/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Summer Festival 2026",
    "description": "Join us for an amazing summer festival",
    "start_date": "2026-06-01T00:00:00",
    "end_date": "2026-06-30T23:59:59",
    "rewards": []
  }'
```

### Step 4: Add Rewards to Event

You can add rewards when creating an event or update an existing event:

#### Using API (Add Rewards)

```bash
# Add ERC-20 token reward
curl -X POST http://localhost:8000/api/organizers/events/1/rewards \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "reward_type": "ERC20",
    "token_address": "0x1234567890123456789012345678901234567890",
    "amount": 100,
    "name": "Festival Token",
    "description": "100 Festival Tokens"
  }'

# Add ERC-721 NFT reward
curl -X POST http://localhost:8000/api/organizers/events/1/rewards \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "reward_type": "ERC721",
    "token_address": "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    "token_id": 1,
    "name": "Festival NFT",
    "description": "Exclusive Festival NFT"
  }'
```

### Step 5: View Event Statistics

#### View Participants

```bash
# Get event participants
curl -X GET http://localhost:8000/api/organizers/events/1/participants \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### View Claims

```bash
# Get event claims
curl -X GET http://localhost:8000/api/organizers/events/1/claims \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Complete Example Workflow

### 1. Register and Login

```bash
# Register
curl -X POST http://localhost:8000/api/organizers/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "myorg@example.com",
    "password": "mypassword123",
    "name": "My Event Organization"
  }'

# Login and save token
TOKEN=$(curl -s -X POST http://localhost:8000/api/organizers/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "myorg@example.com",
    "password": "mypassword123"
  }' | jq -r '.access_token')

echo "Token: $TOKEN"
```

### 2. Create Event with Rewards

```bash
# Create event
curl -X POST http://localhost:8000/api/organizers/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Test Event",
    "description": "Testing WorldID rewards",
    "start_date": "2026-01-01T00:00:00",
    "end_date": "2026-12-31T23:59:59",
    "rewards": [
      {
        "reward_type": "ERC20",
        "token_address": "0x1234567890123456789012345678901234567890",
        "amount": 100,
        "name": "Test Token",
        "description": "100 Test Tokens"
      }
    ]
  }'
```

### 3. View Your Events

```bash
# List all your events
curl -X GET http://localhost:8000/api/organizers/events \
  -H "Authorization: Bearer $TOKEN"
```

## Web Interface Features

### Organizer Dashboard

Once logged in, you can:

1. **View Your Events**: See all events you've created
2. **Create New Event**: Click "Create Event" button
3. **View Event Details**: Click on an event to see details
4. **Logout**: Click "Logout" button to sign out

### Creating Events via Web Interface

1. Click **"Create Event"** button
2. Fill in:
   - Event Name
   - Description
3. Click **"Create Event"**
4. Event appears in your list

**Note**: Currently, the web interface creates events without rewards. To add rewards, use the API or update the frontend code.

## Troubleshooting

### "Email already registered"

- The email is already in use
- Try a different email or login with existing account

### "Incorrect email or password"

- Check your email and password
- Make sure you're using the correct credentials
- If you forgot your password, you'll need to register a new account (password reset not implemented yet)

### "Unauthorized" when creating events

- Make sure you're logged in
- Check that your token is valid
- Token expires after 30 minutes (default)
- Login again to get a new token

### Can't see events

- Make sure you're logged in
- Check that events were created successfully
- Refresh the page

## Next Steps

After registering and creating events:

1. **Test the participant flow**: 
   - Open the app in a different browser/incognito
   - Browse events
   - Join an event
   - Claim rewards

2. **View statistics**:
   - Check how many participants joined
   - See claim statistics
   - Monitor event activity

3. **Create more events**:
   - Add different types of rewards
   - Test with multiple events
   - Experiment with different configurations

## API Documentation

For complete API documentation:

- **Interactive API Docs**: http://localhost:8000/docs
- **OpenAPI Schema**: http://localhost:8000/openapi.json

## Security Notes

- **Password**: Choose a strong password (minimum 6 characters, but longer is better)
- **Token**: Keep your access token secure
- **HTTPS**: In production, always use HTTPS
- **Token Expiration**: Tokens expire after 30 minutes (default), login again to get a new token
