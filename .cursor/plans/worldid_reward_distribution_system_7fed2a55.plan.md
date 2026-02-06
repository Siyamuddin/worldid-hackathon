---
name: WorldID Reward Distribution System
overview: Build an event-based reward distribution system where organizers create reward-giving events and participants join to claim rewards. WorldID prevents duplicate claims, ensuring one person (verified by WorldID) can only claim rewards once per event, even if they try using multiple wallets. The system will support both ERC-20 tokens and NFTs on Ethereum, with organizer-controlled event and reward settings.
todos:
  - id: setup-backend
    content: Set up Python FastAPI backend framework, configure database connection (PostgreSQL with SQLAlchemy), and set up project structure
    status: completed
  - id: database-schema
    content: Create database schema with organizers, events, participants (WorldID→Wallet mapping), event_participants, rewards, and claims tables with proper constraints
    status: completed
    dependencies:
      - setup-backend
  - id: worldid-integration
    content: Integrate WorldID SDK, create verification service to verify proofs on backend, and implement nullifier checking
    status: completed
    dependencies:
      - setup-backend
  - id: event-join-api
    content: Implement event joining endpoint that verifies WorldID proof, enforces 1:1 WorldID→Wallet mapping, and registers participant for event
    status: completed
    dependencies:
      - database-schema
      - worldid-integration
  - id: blockchain-service
    content: Create blockchain service for ERC-20 token transfers and ERC-721/ERC-1155 NFT transfers on Ethereum, with transaction monitoring
    status: completed
    dependencies:
      - setup-backend
  - id: reward-claim-api
    content: Implement reward claiming endpoint that verifies WorldID proof per claim, checks duplicate claims per event, and executes blockchain transfers
    status: completed
    dependencies:
      - event-join-api
      - blockchain-service
  - id: organizer-api
    content: Create organizer endpoints for creating/managing events, setting rewards, viewing participants and claims
    status: completed
    dependencies:
      - database-schema
  - id: frontend-setup
    content: Set up React frontend with TypeScript, configure wallet connection (wagmi/ethers.js), and set up API client
    status: completed
  - id: worldid-widget
    content: Integrate WorldID widget in frontend for user verification flow
    status: completed
    dependencies:
      - frontend-setup
  - id: participant-ui
    content: Build participant interface for browsing events, joining events, claiming rewards with wallet connection, WorldID verification, and transaction status tracking
    status: completed
    dependencies:
      - worldid-widget
      - reward-claim-api
  - id: organizer-dashboard
    content: Create organizer dashboard for creating/managing events, setting rewards, viewing participants and claims statistics
    status: completed
    dependencies:
      - organizer-api
      - frontend-setup
  - id: security-testing
    content: Add rate limiting, input validation, error handling, logging, and write tests for duplicate prevention logic
    status: completed
    dependencies:
      - reward-claim-api
      - organizer-api
---

# WorldID Reward Distribution System

## System Architecture

The system is event-based with two main user roles:

- **Organizers**: Create events and define rewards for those events
- **Participants**: Join events and claim rewards (one claim per event per WorldID)

The system prevents duplicate reward claims by using WorldID's uniqueness verification. Each WorldID represents a unique human, ensuring that even if someone tries to use multiple wallets, they can only claim rewards once per event.

### Core Components

1. **Backend API** (Python FastAPI)

   - WorldID verification endpoint
   - Event management (organizer endpoints)
   - Event registration/joining (participant endpoints)
   - Reward claiming with WorldID verification
   - Database for tracking events, participants, and claims

2. **Database Schema**

   - `organizers` table: Organizer accounts (with authentication)
   - `events` table: Event definitions (created by organizers, contains reward info)
   - `participants` table: WorldID → Wallet mapping (1:1, can participate in multiple events)
   - `event_participants` table: Many-to-many relationship (participant joined event)
   - `claims` table: Claim history (WorldID, event_id, reward_id, status, transaction_hash)
   - `rewards` table: Reward definitions linked to events (tokens/NFTs, amounts)

3. **Frontend** (React)

   - Participant interface: Browse events, join events, claim rewards
   - Organizer interface: Create/manage events, set rewards, view participant stats
   - Wallet connection (MetaMask, WalletConnect)
   - WorldID verification flow

4. **Smart Contract Integration**

   - ERC-20 token transfer contracts
   - ERC-721/ERC-1155 NFT contracts
   - Optional: On-chain claim verification (if needed)

## Key Security Features

- **WorldID Verification**: Every claim requires fresh WorldID proof verification
- **One Wallet Per WorldID**: Database enforces 1:1 mapping (WorldID → Wallet)
- **Duplicate Prevention Per Event**: Check WorldID uniqueness per event before processing any claim
- **Event-Based Isolation**: Participants can join multiple events, but only claim once per event
- **Transaction Tracking**: Record all claims with transaction hashes for audit

## Data Flow

```mermaid
sequenceDiagram
    participant Organizer
    participant Participant
    participant Frontend
    participant Backend
    participant WorldID
    participant Database
    participant Blockchain

    Organizer->>Frontend: Create Event
    Frontend->>Backend: Create Event Request
    Backend->>Database: Save Event + Rewards
    Backend->>Frontend: Event Created
    
    Participant->>Frontend: Browse Events
    Frontend->>Backend: Get Available Events
    Backend->>Frontend: Return Events List
    
    Participant->>Frontend: Join Event
    Frontend->>Participant: Request Wallet Connection
    Participant->>Frontend: Connect Wallet
    Frontend->>Participant: Request WorldID Verification
    Participant->>WorldID: Verify Identity
    WorldID->>Frontend: Return Proof
    Frontend->>Backend: Join Event (Wallet + WorldID Proof + Event ID)
    Backend->>WorldID: Verify Proof
    WorldID->>Backend: Verification Result
    Backend->>Database: Check if WorldID exists
    alt WorldID Not Found
        Backend->>Database: Create Participant (WorldID → Wallet)
    else WorldID Exists
        Backend->>Database: Check Wallet Match
        alt Wallet Different
            Backend->>Frontend: Error: WorldID Already Linked to Different Wallet
        end
    end
    Backend->>Database: Register Participant for Event
    Backend->>Frontend: Successfully Joined Event
    
    Participant->>Frontend: Claim Reward from Event
    Frontend->>Backend: Claim Request (Event ID + WorldID Proof)
    Backend->>WorldID: Verify Proof
    Backend->>Database: Check if Already Claimed for This Event
    alt Already Claimed
        Backend->>Frontend: Error: Already Claimed This Event
    else Not Claimed
        Backend->>Database: Record Claim
        Backend->>Blockchain: Execute Transfer (Token/NFT)
        Blockchain->>Backend: Transaction Hash
        Backend->>Database: Update Claim Status
        Backend->>Frontend: Claim Success
    end
```

## Implementation Plan

### Phase 1: Backend Foundation

- Set up Python FastAPI backend framework
- Configure database (PostgreSQL with SQLAlchemy ORM)
- Implement WorldID SDK integration (Python library)
- Create database schema and migrations (Alembic)
- Set up environment configuration

### Phase 2: Core API Endpoints

**Organizer Endpoints:**

- `POST /api/organizers/register` - Register as organizer
- `POST /api/organizers/login` - Organizer authentication
- `POST /api/organizers/events` - Create new event with rewards
- `GET /api/organizers/events` - List organizer's events
- `GET /api/organizers/events/{event_id}/participants` - View event participants
- `GET /api/organizers/events/{event_id}/claims` - View event claims

**Participant Endpoints:**

- `POST /api/events/{event_id}/join` - Join event (with WorldID verification and wallet)
- `GET /api/events` - Browse available events
- `GET /api/events/{event_id}` - Get event details
- `POST /api/events/{event_id}/claim` - Claim reward from event (with WorldID verification)
- `GET /api/participants/profile` - Get participant's profile (wallet, joined events, claims)

### Phase 3: Blockchain Integration

- Set up Web3 provider (Web3.py)
- Implement ERC-20 token transfer function
- Implement ERC-721/ERC-1155 NFT transfer function
- Add transaction monitoring and confirmation
- Handle gas estimation and error handling

### Phase 4: Frontend Application

- Set up React project with TypeScript
- Integrate wallet connection (wagmi/ethers.js)
- Implement WorldID widget integration
- Build reward claiming UI
- Create admin dashboard
- Add transaction status tracking

### Phase 5: Security & Testing

- Add rate limiting and request validation
- Implement comprehensive error handling
- Add logging and monitoring
- Write unit and integration tests
- Security audit of WorldID verification flow

## File Structure

```
worldid-hackathon/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── config/
│   │   │   ├── __init__.py
│   │   │   ├── database.py
│   │   │   └── worldid.py
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── routes/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── organizers.py
│   │   │   │   ├── events.py
│   │   │   │   └── participants.py
│   │   │   └── dependencies.py
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── worldid_service.py
│   │   │   ├── wallet_service.py
│   │   │   ├── event_service.py
│   │   │   ├── rewards_service.py
│   │   │   └── blockchain_service.py
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── organizer.py
│   │   │   ├── event.py
│   │   │   ├── participant.py
│   │   │   ├── reward.py
│   │   │   └── claim.py
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── organizer.py
│   │   │   ├── event.py
│   │   │   ├── participant.py
│   │   │   ├── reward.py
│   │   │   └── claim.py
│   │   └── middleware/
│   │       ├── __init__.py
│   │       ├── auth.py
│   │       └── worldid.py
│   ├── alembic/
│   │   └── versions/
│   ├── alembic.ini
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── WalletConnect.tsx
│   │   │   ├── WorldIDVerification.tsx
│   │   │   ├── EventCard.tsx
│   │   │   ├── EventJoin.tsx
│   │   │   ├── RewardClaim.tsx
│   │   │   ├── OrganizerDashboard.tsx
│   │   │   └── EventCreate.tsx
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── Events.tsx
│   │   │   ├── EventDetail.tsx
│   │   │   └── OrganizerDashboard.tsx
│   │   ├── hooks/
│   │   │   ├── useWallet.ts
│   │   │   ├── useEvents.ts
│   │   │   └── useRewards.ts
│   │   ├── lib/
│   │   │   └── api.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts (or similar build config)
└── README.md
```

## Key Implementation Details

### WorldID Verification

- Use WorldID's SDK to verify proofs on each claim
- Store WorldID nullifier to detect duplicate attempts
- Verify proof freshness (timestamp validation)

### Database Constraints

- Unique constraint on `world_id_hash` in participants table
- Unique constraint on `wallet_address` in participants table (enforces 1:1)
- Composite unique constraint on `(participant_id, event_id)` in event_participants table (one join per event)
- Composite unique constraint on `(participant_id, event_id)` in claims table (one claim per event per participant)

### Event Management Logic

- Organizers create events with name, description, start/end dates
- Organizers add rewards to events (ERC-20 tokens or NFTs)
- Events can have multiple rewards (participants claim all rewards when they claim from an event)

### Event Participation Logic

- Participants browse available events
- To join an event: connect wallet + verify WorldID (first time only)
- WorldID → Wallet mapping is created/verified on first event join
- Participant is registered for the event

### Reward Claiming Logic

- Check if participant has joined the event
- Check if WorldID has already claimed from this event
- Verify WorldID proof is valid and fresh
- Execute blockchain transactions for all rewards in the event
- Record claim in database with transaction hash

### Organizer Features

- Register/login as organizer
- Create/edit/delete events
- Add/remove rewards to events
- Set reward types (token amount, NFT contract + token ID)
- View event participants and claim statistics
- Monitor event activity

## Technology Recommendations

- **Backend**: Python 3.11+ with FastAPI
- **Database**: PostgreSQL with SQLAlchemy ORM and Alembic for migrations
- **WorldID**: Python WorldID SDK (or direct API integration)
- **Blockchain**: Web3.py for Ethereum interactions
- **Frontend**: React 18+ with TypeScript, Vite for build tooling
- **Wallet Connection**: wagmi + viem or ethers.js
- **Styling**: Tailwind CSS or shadcn/ui
- **API Client**: Axios or fetch for React frontend

## Security Considerations

1. **WorldID Proof Verification**: Always verify on backend, never trust client
2. **Rate Limiting**: Prevent spam/abuse on claim endpoints
3. **Input Validation**: Validate all wallet addresses and WorldID proofs
4. **Transaction Safety**: Use nonces and proper gas estimation
5. **Organizer Authentication**: Secure organizer endpoints with proper auth (JWT tokens)
6. **Database Security**: Use parameterized queries, prevent SQL injection
7. **Environment Variables**: Store private keys and API keys securely