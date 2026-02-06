# WorldID Reward Distribution System

An event-based reward distribution system that uses WorldID to prevent duplicate claims, ensuring one person (verified by WorldID) can only claim rewards once per event, even if they try using multiple wallets.

**Built for World Build Korea 2026 Hackathon**

## 📚 Documentation

- **[PROBLEM.md](PROBLEM.md)** - Problem statement and real-world use cases
- **[PRIVACY.md](PRIVACY.md)** - Privacy-by-design documentation
- **[SUBMISSION.md](SUBMISSION.md)** - Hackathon submission checklist
- **[docs/why-worldid.md](docs/why-worldid.md)** - Why WorldID is essential
- **[docs/anti-abuse.md](docs/anti-abuse.md)** - Anti-abuse measures documentation
- **[docs/privacy-flow.md](docs/privacy-flow.md)** - Privacy flow visualization
- **[docs/security-architecture.md](docs/security-architecture.md)** - Security architecture

## Features

- **Event-Based System**: Organizers create events with rewards, participants join and claim
- **WorldID Verification**: Prevents duplicate claims using WorldID's uniqueness verification
- **Blockchain Integration**: Supports ERC-20 tokens, ERC-721, and ERC-1155 NFTs on Ethereum
- **Secure**: Rate limiting, input validation, and comprehensive error handling

## Tech Stack

### Backend
- Python 3.11+
- FastAPI
- PostgreSQL with SQLAlchemy
- Alembic for migrations
- Web3.py for blockchain interactions

### Frontend
- React 18+ with TypeScript
- Vite
- wagmi + viem for wallet connection
- WorldID IDKit for verification
- Tailwind CSS

## Quick Start with Docker Compose

The easiest way to run the entire system is using Docker Compose:

1. **Create environment file:**
```bash
cp .env.example .env
# Edit .env with your configuration (WorldID app ID, blockchain RPC URL, etc.)
```

2. **Start all services:**
```bash
# Start in background
docker-compose up -d

# Start in foreground (see logs)
docker-compose up
```

3. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

4. **Stop services:**
```bash
docker-compose down

# To remove volumes (database data)
docker-compose down -v
```

5. **Quick setup script:**
```bash
./setup.sh
```

**Note:** For production, make sure to:
- Set strong `SECRET_KEY` in `.env`
- Configure proper `WORLDID_APP_ID` and `ETHEREUM_RPC_URL`
- Set `PRIVATE_KEY` if you want to send blockchain transactions
- Use a reverse proxy (nginx/traefik) for production deployment

## Manual Setup

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. Set up database:
```bash
# Make sure PostgreSQL is running
# Update DATABASE_URL in .env
# Run migrations (when Alembic is configured)
```

6. Run the server:
```bash
uvicorn app.main:app --reload
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create .env file
VITE_API_BASE_URL=http://localhost:8000
VITE_WORLDID_APP_ID=your_worldid_app_id
VITE_WORLDID_ACTION=worldid-reward-claim
```

4. Run the development server:
```bash
npm run dev
```

## API Endpoints

### Organizer Endpoints
- `POST /api/organizers/register` - Register as organizer
- `POST /api/organizers/login` - Organizer authentication
- `POST /api/organizers/events` - Create new event with rewards
- `GET /api/organizers/events` - List organizer's events
- `GET /api/organizers/events/{event_id}/participants` - View event participants
- `GET /api/organizers/events/{event_id}/claims` - View event claims

### Participant Endpoints
- `GET /api/events` - Browse available events
- `GET /api/events/{event_id}` - Get event details
- `POST /api/events/{event_id}/join` - Join event (with WorldID verification)
- `POST /api/events/{event_id}/claim` - Claim reward from event (with WorldID verification)
- `GET /api/participants/profile/{wallet_address}` - Get participant profile

## Security Features

1. **WorldID Proof Verification**: Every claim requires fresh WorldID proof verification on the backend
2. **One Wallet Per WorldID**: Database enforces 1:1 mapping (WorldID → Wallet)
3. **Duplicate Prevention Per Event**: Check WorldID uniqueness per event before processing any claim
4. **Rate Limiting**: Prevents spam/abuse on claim endpoints
5. **Input Validation**: Validates all wallet addresses and WorldID proofs
6. **Transaction Safety**: Uses nonces and proper gas estimation

See [docs/anti-abuse.md](docs/anti-abuse.md) for detailed anti-abuse measures.

## Privacy Features

- **Zero-Knowledge Proofs**: Verify uniqueness without revealing identity
- **Data Minimization**: Only store nullifier hash (anonymous) and wallet address (public)
- **No Personal Information**: Never collect name, email, phone, or identity data
- **Privacy-by-Design**: Built into the system architecture

See [PRIVACY.md](PRIVACY.md) for comprehensive privacy documentation.

## Database Schema

- `organizers` - Organizer accounts
- `events` - Event definitions
- `participants` - WorldID → Wallet mapping (1:1)
- `event_participants` - Many-to-many relationship (participant joined event)
- `rewards` - Reward definitions linked to events
- `claims` - Claim history with transaction hashes

## Docker Services

The Docker Compose setup includes:

- **PostgreSQL Database**: Persistent data storage
- **Backend API**: FastAPI application with hot reload enabled
- **Frontend**: React application with Vite dev server (hot reload enabled)

**Note:** This setup is optimized for development with hot reload. For production deployment, consider:
- Using production Dockerfiles (Dockerfile instead of Dockerfile.dev)
- Setting up Nginx reverse proxy
- Disabling hot reload
- Using environment-specific configurations

### Database Migrations

The database schema is automatically created on first startup. For production, consider using Alembic migrations:

```bash
docker-compose exec backend alembic upgrade head
```

## License

MIT
