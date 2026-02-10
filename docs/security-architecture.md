# Security Architecture

## Overview

This document describes the security architecture of the WorldID Reward Distribution System, focusing on how we prevent abuse while maintaining user privacy.

## System Architecture

```
┌──────────────┐
│   Frontend   │
│  (React)     │
└──────┬───────┘
       │ HTTPS
       ▼
┌──────────────┐      ┌──────────────┐
│   Backend    │──────│  WorldID API │
│  (FastAPI)   │      │ (Verification)│
└──────┬───────┘      └──────────────┘
       │
       │ Encrypted Connection
       ▼
┌──────────────┐
│  PostgreSQL  │
│  Database    │
└──────────────┘
```

## Security Layers

### Layer 1: WorldID Verification

**Purpose**: Prove human uniqueness without revealing identity

**Implementation**:
- Every claim requires fresh WorldID proof
- Proof verified server-side with WorldID API
- Signal binding (wallet address) prevents proxy verification

**Code Reference**: `backend/app/services/worldid_service.py`

### Layer 2: Nullifier Hash Tracking

**Purpose**: Prevent proof reuse

**Implementation**:
- Nullifier hash extracted from proof
- Hashed again before storage (SHA-256)
- Checked against database before processing claims

**Code Reference**: `backend/app/api/routes/participants.py:111-119`

### Layer 3: Database Constraints

**Purpose**: Enforce business rules at database level

**Implementation**:
- Unique constraint on `world_id_hash` (one WorldID)
- Unique constraint on `wallet_address` (1:1 mapping)
- Composite unique constraint on `(participant_id, event_id)` in claims

**Code Reference**: `backend/app/models/participant.py`, `backend/app/models/claim.py`

### Layer 4: Rate Limiting

**Purpose**: Prevent spam and abuse

**Implementation**:
- Rate limiting on join endpoint: 5 requests per 60 seconds
- Rate limiting on claim endpoint: 3 requests per 60 seconds
- IP-based rate limiting

**Code Reference**: `backend/app/middleware/rate_limit.py`

### Layer 5: Input Validation

**Purpose**: Prevent injection attacks and invalid data

**Implementation**:
- Wallet address validation and checksum
- WorldID proof structure validation
- Event ID validation
- SQL parameterized queries

**Code Reference**: `backend/app/services/wallet_service.py`

## Anti-Abuse Measures

### 1. Proof Reuse Prevention

**Threat**: User reuses same proof multiple times

**Mitigation**:
- Fresh proof required for each claim
- Nullifier hash checked against database
- Signal (wallet address) bound to proof

**Implementation**:
```python
# backend/app/api/routes/participants.py:242-255
existing_claims = db.query(Claim).filter(
    Claim.event_id == event_id,
    Claim.participant_id == participant.id
).all()

if existing_claims:
    completed_claims = [c for c in existing_claims if c.status == ClaimStatus.COMPLETED]
    if completed_claims:
        raise HTTPException(...)  # Already claimed
```

### 2. Replay Attack Prevention

**Threat**: Attacker replays old proof

**Mitigation**:
- Each proof verified with WorldID API (checks freshness)
- Proof timestamp validated by WorldID API
- One claim per event per WorldID enforced

**Implementation**:
```python
# backend/app/api/routes/participants.py:189-198
verification_result = worldid_service.verify_proof(claim_data.world_id_proof)

if not verification_result["success"]:
    raise HTTPException(...)  # Proof invalid or stale
```

### 3. Proxy Verification Prevention

**Threat**: User verifies with WorldID but uses different wallet

**Mitigation**:
- Signal binding: wallet address included in proof
- 1:1 WorldID → Wallet mapping enforced
- Cannot change wallet after first verification

**Implementation**:
```python
# backend/app/api/routes/participants.py:126-132
if participant:
    if participant.wallet_address.lower() != wallet_address.lower():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="WorldID already linked to a different wallet address"
        )
```

### 4. Multi-Account Abuse Prevention

**Threat**: User creates multiple accounts to claim multiple times

**Mitigation**:
- WorldID uniqueness guarantee (one person = one WorldID)
- Database constraints prevent duplicate claims
- Nullifier hash tracking across all events

**Implementation**:
```python
# backend/app/models/participant.py
# Unique constraint on world_id_hash ensures one WorldID
# Unique constraint on wallet_address ensures 1:1 mapping
```

## Security Flow Diagram

```
User Request
    │
    ▼
[Rate Limiting Check]
    │
    ▼
[Input Validation]
    │
    ▼
[WorldID Proof Verification]
    │
    │ ┌─────────────────┐
    │ │ WorldID API      │
    │ │ - Validates proof│
    │ │ - Checks freshness│
    │ │ - Verifies signal│
    │ └─────────────────┘
    │
    ▼
[Extract Nullifier Hash]
    │
    ▼
[Hash Nullifier Hash]
    │
    ▼
[Check Database for Existing Claim]
    │
    │ ┌─────────────────┐
    │ │ Database Query   │
    │ │ - Check nullifier│
    │ │ - Check event    │
    │ │ - Check wallet   │
    │ └─────────────────┘
    │
    ▼
[Enforce Business Rules]
    │
    │ - One claim per event
    │ - 1:1 WorldID:Wallet
    │ - Event must be active
    │
    ▼
[Process Claim]
    │
    ▼
[Blockchain Transaction]
    │
    ▼
[Update Database]
    │
    ▼
[Return Success]
```

## Database Security

### Constraints

1. **Participant Table**:
   - `world_id_hash`: UNIQUE (one WorldID)
   - `wallet_address`: UNIQUE (one wallet per WorldID)

2. **Event Participant Table**:
   - `(participant_id, event_id)`: UNIQUE (one join per event)

3. **Claim Table**:
   - `(participant_id, event_id)`: UNIQUE (one claim per event)

### Access Control

- Database only accessible from backend service
- Encrypted connections (SSL/TLS)
- Parameterized queries (SQL injection prevention)
- No direct user access

## API Security

### Authentication

- Organizer endpoints: JWT token authentication
- Participant endpoints: WorldID proof verification (no traditional auth needed)

### Rate Limiting

- Join endpoint: 5 requests per 60 seconds per IP
- Claim endpoint: 3 requests per 60 seconds per IP
- Prevents spam and abuse

### Input Validation

- Wallet address: Checksum validation
- WorldID proof: Structure validation
- Event ID: Existence and active status check

## Privacy-Security Balance

### How We Secure Without Compromising Privacy

1. **No Identity Required**: We secure the system without knowing who users are
2. **Cryptographic Guarantees**: WorldID's ZKP provides security guarantees
3. **Anonymous Tracking**: Nullifier hash allows tracking without identity
4. **Public Data Only**: We use public blockchain data (wallet addresses)

## Threat Model

### Addressed Threats

✅ **Multi-Account Abuse**: Prevented by WorldID uniqueness
✅ **Proof Reuse**: Prevented by nullifier hash tracking
✅ **Replay Attacks**: Prevented by WorldID API verification
✅ **Proxy Verification**: Prevented by signal binding
✅ **Spam/DoS**: Prevented by rate limiting
✅ **SQL Injection**: Prevented by parameterized queries
✅ **Identity Theft**: Not applicable (no identity stored)

### Not Applicable Threats

- **Identity Theft**: We don't store identity
- **Data Breach (Personal Info)**: We don't have personal info to breach
- **Privacy Violation**: Privacy is built into the architecture

## Summary

**Security is achieved through:**
1. WorldID's cryptographic guarantees
2. Nullifier hash tracking
3. Database constraints
4. Rate limiting
5. Input validation
6. Server-side verification

**Privacy is maintained because:**
1. No identity stored
2. Anonymous identifiers only
3. Zero-knowledge proofs
4. Minimal data collection

**Result**: Secure system that prevents abuse while maintaining complete user privacy.
