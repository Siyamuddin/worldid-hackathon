---
name: WorldID Reward Distribution System
overview: Build a reward distribution system using WorldID to prevent duplicate claims, ensuring one person (verified by WorldID) can only claim rewards once, even if they try using multiple wallets. The system will support both ERC-20 tokens and NFTs on Ethereum, with admin-controlled reward settings and user-facing claim interface.
todos:
  - id: setup-backend
    content: Set up backend framework (Node.js/Express or Python/FastAPI) with TypeScript, configure database connection, and set up project structure
    status: pending
  - id: database-schema
    content: Create database schema with users (WorldID→Wallet mapping), rewards, claims, and distribution_rules tables with proper constraints
    status: pending
    dependencies:
      - setup-backend
  - id: worldid-integration
    content: Integrate WorldID SDK, create verification service to verify proofs on backend, and implement nullifier checking
    status: pending
    dependencies:
      - setup-backend
  - id: wallet-linking-api
    content: Implement wallet linking endpoint that verifies WorldID proof and enforces 1:1 WorldID→Wallet mapping in database
    status: pending
    dependencies:
      - database-schema
      - worldid-integration
  - id: blockchain-service
    content: Create blockchain service for ERC-20 token transfers and ERC-721/ERC-1155 NFT transfers on Ethereum, with transaction monitoring
    status: pending
    dependencies:
      - setup-backend
  - id: reward-claim-api
    content: Implement reward claiming endpoint that verifies WorldID proof per claim, checks duplicate claims, and executes blockchain transfers
    status: pending
    dependencies:
      - wallet-linking-api
      - blockchain-service
  - id: admin-api
    content: Create admin endpoints for creating/updating rewards, viewing claims, and managing distribution rules
    status: pending
    dependencies:
      - database-schema
  - id: frontend-setup
    content: Set up Next.js frontend with TypeScript, configure wallet connection (wagmi), and set up API client
    status: pending
  - id: worldid-widget
    content: Integrate WorldID widget in frontend for user verification flow
    status: pending
    dependencies:
      - frontend-setup
  - id: claim-ui
    content: Build user-facing reward claiming interface with wallet connection, WorldID verification, and transaction status tracking
    status: pending
    dependencies:
      - worldid-widget
      - reward-claim-api
  - id: admin-dashboard
    content: Create admin dashboard for managing rewards, viewing claims, and monitoring system activity
    status: pending
    dependencies:
      - admin-api
      - frontend-setup
  - id: security-testing
    content: Add rate limiting, input validation, error handling, logging, and write tests for duplicate prevention logic
    status: pending
    dependencies:
      - reward-claim-api
      - admin-api
---

# WorldID Reward Distribution System

## System Architecture

The system prevents duplicate reward claims by using WorldID's uniqueness verification. Each WorldID represents a unique human, and we enforce a strict 1:1 mapping between WorldID and crypto wallet addresses.

### Core Components

1. **Backend API** (Node.js/Express or Python/FastAPI)

   - WorldID verification endpoint
   - Wallet linking and validation
   - Reward distribution logic
   - Admin management endpoints
   - Database for tracking claims and mappings

2. **Database Schema**

   - `users` table: WorldID → Wallet mapping (1:1)
   - `rewards` table: Reward definitions (tokens/NFTs, amounts, distribution rules)
   - `claims` table: Claim history (WorldID, reward_id, status, transaction_hash)
   - `distribution_rules` table: Rules for different distribution types

3. **Frontend** (React/Next.js)

   - User wallet connection (MetaMask, WalletConnect)
   - WorldID verification flow
   - Reward claiming interface
   - Admin dashboard for reward management

4. **Smart Contract Integration**

   - ERC-20 token transfer contracts
   - ERC-721/ERC-1155 NFT contracts
   - Optional: On-chain claim verification (if needed)

## Key Security Features

- **WorldID Verification**: Every claim requires fresh WorldID proof verification
- **One Wallet Per WorldID**: Database enforces 1:1 mapping (WorldID → Wallet)
- **Duplicate Prevention**: Check WorldID uniqueness before processing any claim
- **Transaction Tracking**: Record all claims with transaction hashes for audit

## Data Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant WorldID
    participant Database
    participant Blockchain

    User->>Frontend: Connect Wallet
    Frontend->>User: Request WorldID Verification
    User->>WorldID: Verify Identity
    WorldID->>Frontend: Return Proof
    Frontend->>Backend: Submit Wallet + WorldID Proof
    Backend->>WorldID: Verify Proof
    WorldID->>Backend: Verification Result
    Backend->>Database: Check if WorldID exists
    alt WorldID Not Found
        Backend->>Database: Create User (WorldID → Wallet)
        Backend->>Frontend: Wallet Linked Successfully
    else WorldID Exists
        Backend->>Database: Check Wallet Match
        alt Wallet Matches
            Backend->>Frontend: Wallet Already Linked
        else Wallet Different
            Backend->>Frontend: Error: WorldID Already Linked to Different Wallet
        end
    end
    
    User->>Frontend: Claim Reward
    Frontend->>Backend: Claim Request + WorldID Proof
    Backend->>WorldID: Verify Proof
    Backend->>Database: Check Claim History
    alt Already Claimed
        Backend->>Frontend: Error: Reward Already Claimed
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

- Set up backend framework (Node.js/Express or Python/FastAPI)
- Configure database (PostgreSQL recommended)
- Implement WorldID SDK integration
- Create database schema and migrations
- Set up environment configuration

### Phase 2: Core API Endpoints

- `POST /api/auth/worldid-verify` - Verify WorldID proof and link wallet
- `GET /api/user/profile` - Get user's linked wallet and claim history
- `POST /api/rewards/claim` - Claim a reward (with WorldID verification)
- `GET /api/rewards/available` - List available rewards for user
- `POST /api/admin/rewards` - Create/update reward (admin only)
- `GET /api/admin/claims` - View all claims (admin only)

### Phase 3: Blockchain Integration

- Set up Web3 provider (Ethers.js or Web3.py)
- Implement ERC-20 token transfer function
- Implement ERC-721/ERC-1155 NFT transfer function
- Add transaction monitoring and confirmation
- Handle gas estimation and error handling

### Phase 4: Frontend Application

- Set up React/Next.js project
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
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   └── worldid.ts
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── rewards.controller.ts
│   │   │   └── admin.controller.ts
│   │   ├── services/
│   │   │   ├── worldid.service.ts
│   │   │   ├── wallet.service.ts
│   │   │   ├── rewards.service.ts
│   │   │   └── blockchain.service.ts
│   │   ├── models/
│   │   │   ├── user.model.ts
│   │   │   ├── reward.model.ts
│   │   │   └── claim.model.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   └── worldid.middleware.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── rewards.routes.ts
│   │   │   └── admin.routes.ts
│   │   └── app.ts
│   ├── prisma/ (or migrations/)
│   │   └── schema.prisma
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── WalletConnect.tsx
│   │   │   ├── WorldIDVerification.tsx
│   │   │   ├── RewardClaim.tsx
│   │   │   └── AdminDashboard.tsx
│   │   ├── pages/
│   │   │   ├── index.tsx
│   │   │   └── admin.tsx
│   │   ├── hooks/
│   │   │   ├── useWallet.ts
│   │   │   └── useRewards.ts
│   │   └── lib/
│   │       └── api.ts
│   └── package.json
└── README.md
```

## Key Implementation Details

### WorldID Verification

- Use WorldID's SDK to verify proofs on each claim
- Store WorldID nullifier to detect duplicate attempts
- Verify proof freshness (timestamp validation)

### Database Constraints

- Unique constraint on `world_id_hash` in users table
- Unique constraint on `wallet_address` in users table (enforces 1:1)
- Composite unique constraint on `(world_id_hash, reward_id)` in claims table

### Reward Distribution Logic

- Check if WorldID has already claimed this reward
- Verify WorldID proof is valid and fresh
- Check reward distribution rules (one-time, action-based, etc.)
- Execute blockchain transaction
- Record claim in database with transaction hash

### Admin Features

- Create/edit/delete rewards
- Set reward types (token amount, NFT contract + token ID)
- Configure distribution rules (one-time, recurring schedule, etc.)
- View claim statistics and user activity

## Technology Recommendations

- **Backend**: Node.js with Express + TypeScript, or Python with FastAPI
- **Database**: PostgreSQL with Prisma ORM (or SQLAlchemy for Python)
- **WorldID**: `@worldcoin/world-id-lite` SDK
- **Blockchain**: Ethers.js v6 (or Web3.py)
- **Frontend**: Next.js 14 with TypeScript, wagmi for wallet connection
- **Styling**: Tailwind CSS or shadcn/ui

## Security Considerations

1. **WorldID Proof Verification**: Always verify on backend, never trust client
2. **Rate Limiting**: Prevent spam/abuse on claim endpoints
3. **Input Validation**: Validate all wallet addresses and WorldID proofs
4. **Transaction Safety**: Use nonces and proper gas estimation
5. **Admin Authentication**: Secure admin endpoints with proper auth
6. **Database Security**: Use parameterized queries, prevent SQL injection
7. **Environment Variables**: Store private keys and API keys securely