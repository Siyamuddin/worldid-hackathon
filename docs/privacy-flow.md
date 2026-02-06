# Privacy Flow Documentation

## Visual Privacy Flow

This document illustrates how privacy is preserved throughout the WorldID Reward Distribution System.

## High-Level Privacy Flow

```
┌─────────────┐
│   User      │
│  (Human)    │
└──────┬──────┘
       │
       │ 1. Generate WorldID Proof
       │    (via World App)
       ▼
┌─────────────────────┐
│   WorldID Service   │
│  (Zero-Knowledge)   │
└──────┬──────────────┘
       │
       │ 2. Returns ZKP Proof
       │    Contains:
       │    - merkle_root
       │    - nullifier_hash
       │    - proof (ZKP)
       │    - NO identity data
       ▼
┌─────────────────────┐
│   Frontend          │
│  (User's Device)    │
└──────┬──────────────┘
       │
       │ 3. Send Proof + Wallet Address
       │    (signal = wallet address)
       ▼
┌─────────────────────┐
│   Backend API       │
│  (Our Server)       │
└──────┬──────────────┘
       │
       │ 4. Verify Proof
       │    (with WorldID API)
       ▼
┌─────────────────────┐
│   WorldID API       │
│  (Verification)     │
└──────┬──────────────┘
       │
       │ 5. Returns: Valid/Invalid
       │    (NO identity data)
       ▼
┌─────────────────────┐
│   Backend           │
│  (Processing)       │
└──────┬──────────────┘
       │
       │ 6. Hash nullifier_hash
       │    world_id_hash = SHA256(nullifier_hash)
       │
       │ 7. Store in Database:
       │    - world_id_hash (hashed)
       │    - wallet_address (public)
       │    - event_id
       │    - NO identity data
       ▼
┌─────────────────────┐
│   Database          │
│  (PostgreSQL)       │
│                     │
│  Stored Data:       │
│  - world_id_hash    │
│  - wallet_address   │
│  - event_id         │
│  - claim_status     │
│                     │
│  NOT Stored:        │
│  - Identity         │
│  - Personal Info    │
│  - Biometric Data   │
└─────────────────────┘
```

## Data Minimization Flow

### What Flows Through the System

```
User Identity (WorldID)
    │
    │ ❌ NEVER transmitted
    │ ❌ NEVER stored
    │ ❌ NEVER accessible
    │
    ▼
WorldID Proof (ZKP)
    │
    │ ✅ Contains: nullifier_hash
    │ ✅ Does NOT contain: identity
    │
    ▼
Backend Processing
    │
    │ ✅ Stores: hashed(nullifier_hash)
    │ ✅ Stores: wallet_address (public)
    │ ❌ Does NOT store: identity
    │
    ▼
Database
    │
    │ ✅ world_id_hash (anonymous)
    │ ✅ wallet_address (public blockchain data)
    │ ❌ NO personal information
```

## Zero-Knowledge Proof Flow

### What the ZKP Proves

```
WorldID ZKP Proves:
┌─────────────────────────────────────┐
│ ✅ You are a verified human         │
│ ✅ You are unique (one person)      │
│ ✅ You haven't used this proof      │
│                                     │
│ ❌ Does NOT prove:                  │
│    - Who you are                    │
│    - Where you're from              │
│    - Your name                      │
│    - Any personal information       │
└─────────────────────────────────────┘
```

### Proof Structure

```
WorldID Proof:
{
  "merkle_root": "0xabc...",      // Proves membership in WorldID tree
  "nullifier_hash": "0xdef...",    // Unique per action, NOT identity
  "proof": "0x123...",             // The ZKP itself
  "verification_level": "orb",    // Level of verification
  "signal": "0xwallet..."         // Bound to wallet (prevents proxy)
}
```

## Privacy Guarantees at Each Step

### Step 1: User Generates Proof
- **Privacy**: Proof generated locally on user's device
- **Data**: No data sent to our system yet
- **Control**: User initiates the process

### Step 2: WorldID Service
- **Privacy**: WorldID doesn't share identity with us
- **Data**: Only proof structure, no identity
- **Control**: WorldID's privacy-preserving architecture

### Step 3: Frontend Transmission
- **Privacy**: Proof + wallet address only
- **Data**: No personal information included
- **Control**: User sees what's being sent

### Step 4: Backend Verification
- **Privacy**: Proof verified without identity
- **Data**: Verification result only (valid/invalid)
- **Control**: Server-side verification ensures security

### Step 5: Database Storage
- **Privacy**: Only anonymous identifiers stored
- **Data**: Hashed nullifier + public wallet address
- **Control**: No way to link back to identity

## Comparison: With vs Without Privacy-by-Design

### ❌ Without Privacy-by-Design (Traditional System)
```
User → Name, Email, Phone → Database
                            ↓
                    Personal Info Stored
                            ↓
                    Can Identify User
                            ↓
                    Privacy Risk
```

### ✅ With Privacy-by-Design (Our System)
```
User → WorldID Proof (ZKP) → Hashed Nullifier
                            ↓
                    Anonymous Identifier
                            ↓
                    Cannot Identify User
                            ↓
                    Privacy Protected
```

## Nullifier Hash Privacy

### How Nullifier Hash Preserves Privacy

```
Original Nullifier Hash (from WorldID)
    │
    │ Example: "0xabc123def456..."
    │
    ▼
SHA-256 Hash (our additional layer)
    │
    │ Example: "a1b2c3d4e5f6..."
    │
    ▼
Stored in Database
    │
    │ ✅ Unique per WorldID per action
    │ ✅ Prevents duplicate claims
    │ ❌ Cannot be reversed to identity
    │ ❌ Cannot be linked to WorldID
    │ ❌ Provides no personal information
```

## User Trust Indicators

### What Users See

```
┌─────────────────────────────────────┐
│ Privacy Notice                      │
│                                     │
│ ✅ We collect:                      │
│    - Nullifier hash (anonymous)     │
│    - Wallet address (public)       │
│                                     │
│ ❌ We DON'T collect:                │
│    - Your name                      │
│    - Your email                     │
│    - Your identity                  │
│    - Personal information           │
│                                     │
│ 🔒 Your privacy is protected by:    │
│    - Zero-Knowledge Proofs         │
│    - Data minimization              │
│    - No identity storage            │
└─────────────────────────────────────┘
```

## Summary

**Privacy is preserved because:**

1. **Identity Never Leaves WorldID**: Your identity stays with WorldID, never shared with us
2. **ZKP Proves Uniqueness**: We prove you're human without knowing who you are
3. **Nullifier Hash is Anonymous**: The hash we store cannot identify you
4. **Minimal Data Collection**: We only collect what's necessary for reward distribution
5. **No Personal Information**: We don't collect or store any personal data
6. **Transparent Process**: You can see exactly what data flows through the system

**Result**: You can claim rewards while maintaining complete privacy and anonymity.
