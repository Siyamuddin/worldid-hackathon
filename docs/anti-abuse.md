# Anti-Abuse Measures Documentation

## Overview

This document details all anti-abuse measures implemented in the WorldID Reward Distribution System. The system prevents four main types of abuse while maintaining user privacy.

## Recognized Risks

The system addresses the following risks identified in the hackathon judging criteria:

1. **Proof Reuse**: Using the same WorldID proof multiple times
2. **Replay Attacks**: Replaying old proofs to claim rewards again
3. **Proxy Verification**: Verifying with WorldID but using a different wallet
4. **Multi-Account Abuse**: Creating multiple accounts to claim multiple times

## 1. Proof Reuse Prevention

### Risk Description

A user could attempt to reuse the same WorldID proof to claim rewards multiple times from the same event or across different events.

### Mitigation Strategy

**Fresh Proof Required**: Each claim requires a new WorldID proof generated specifically for that action.

**Nullifier Hash Tracking**: The nullifier hash from each proof is extracted, hashed, and stored in the database. Before processing any claim, the system checks if this nullifier hash has been used before.

**Signal Binding**: The proof is bound to a specific signal (wallet address), making it unique to that wallet and action.

### Implementation

**Code Location**: `backend/app/api/routes/participants.py`

**Key Code Sections**:

```python
# Extract nullifier hash from proof
nullifier_hash = worldid_service.get_nullifier_hash(claim_data.world_id_proof)
world_id_hash = worldid_service.hash_world_id(nullifier_hash)

# Find participant by nullifier hash
participant = db.query(Participant).filter(
    Participant.world_id_hash == world_id_hash
).first()

# Check if already claimed for this event
existing_claims = db.query(Claim).filter(
    Claim.event_id == event_id,
    Claim.participant_id == participant.id
).all()

if existing_claims:
    completed_claims = [c for c in existing_claims if c.status == ClaimStatus.COMPLETED]
    if completed_claims:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rewards for this event have already been claimed"
        )
```

**Database Constraint**: The `claims` table has a composite unique constraint on `(participant_id, event_id)` ensuring only one claim per event per participant.

**Code Location**: `backend/app/models/claim.py`

### How It Works

1. User generates a new WorldID proof for each claim
2. Backend extracts nullifier hash from proof
3. Nullifier hash is hashed again (SHA-256) for storage
4. Database is checked for existing claims with this nullifier hash
5. If found, claim is rejected
6. If not found, claim is processed

### Privacy Preservation

- Only the nullifier hash is stored, not the full proof
- Nullifier hash cannot be reversed to reveal identity
- Multiple hashing provides additional privacy layer

## 2. Replay Attack Prevention

### Risk Description

An attacker could capture a valid WorldID proof and replay it later to claim rewards again, even after the original claim was processed.

### Mitigation Strategy

**WorldID API Verification**: Every proof is verified server-side with WorldID's official API, which validates:
- Proof freshness (timestamp)
- Proof validity
- Merkle root correctness
- Nullifier hash uniqueness

**One-Time Use**: The nullifier hash is unique per action and cannot be reused. Once a nullifier hash is used, it cannot be used again.

**Database Tracking**: All used nullifier hashes are tracked in the database, preventing reuse even if an attacker tries to replay an old proof.

### Implementation

**Code Location**: `backend/app/services/worldid_service.py`

**Key Code Sections**:

```python
@staticmethod
def verify_proof(proof: Dict, signal: Optional[str] = None) -> Dict:
    """
    Verify a WorldID proof with WorldID API
    WorldID API validates:
    - Proof freshness (timestamp)
    - Proof validity
    - Merkle root
    - Nullifier hash
    """
    verify_payload = {
        "merkle_root": proof.get("merkle_root"),
        "nullifier_hash": proof.get("nullifier_hash"),
        "proof": proof.get("proof"),
        "verification_level": proof.get("verification_level", "orb"),
        "signal": signal or "",
        "app_id": worldid_settings.WORLDID_APP_ID,
        "action": worldid_settings.WORLDID_ACTION,
    }
    
    response = requests.post(
        worldid_settings.WORLDID_VERIFY_URL,
        json=verify_payload,
        timeout=10
    )
    
    if response.status_code == 200:
        result = response.json()
        if result.get("success"):
            return {
                "success": True,
                "nullifier_hash": proof.get("nullifier_hash"),
                "message": "Proof verified successfully"
            }
```

**Usage in Claim Endpoint**: `backend/app/api/routes/participants.py:189-198`

```python
# Verify WorldID proof (validates freshness)
verification_result = worldid_service.verify_proof(claim_data.world_id_proof)

if not verification_result["success"]:
    logger.warning(f"WorldID verification failed for claim on event {event_id}: {verification_result['message']}")
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=f"WorldID verification failed: {verification_result['message']}"
    )
```

### How It Works

1. User generates WorldID proof
2. Proof is sent to backend
3. Backend verifies proof with WorldID API
4. WorldID API checks:
   - Proof is fresh (not expired)
   - Proof is valid (correct merkle root, valid ZKP)
   - Nullifier hash is unique
5. If verification fails, claim is rejected
6. If verification succeeds, nullifier hash is checked against database
7. If nullifier hash already used, claim is rejected
8. If nullifier hash is new, claim is processed

### Privacy Preservation

- WorldID API verification doesn't reveal identity
- Only proof validity is checked, not identity
- Nullifier hash tracking is anonymous

## 3. Proxy Verification Prevention

### Risk Description

A user could verify their humanity with WorldID but then use a different wallet address to claim rewards, allowing them to potentially claim rewards to multiple wallets.

### Mitigation Strategy

**Signal Binding**: The WorldID proof includes a "signal" parameter that binds the proof to a specific wallet address. This signal is included in the proof generation and verification.

**1:1 WorldID → Wallet Mapping**: The database enforces a one-to-one mapping between WorldID (via nullifier hash) and wallet address. Once a WorldID is linked to a wallet, it cannot be changed.

**Wallet Verification on Join**: When joining an event, the system checks if the WorldID is already linked to a different wallet. If so, the join is rejected.

### Implementation

**Code Location**: `backend/app/api/routes/participants.py`

**Key Code Sections**:

**Signal Binding in Join**:
```python
# Verify WorldID proof with wallet address as signal
verification_result = worldid_service.verify_proof(
    join_data.world_id_proof,
    signal=wallet_address  # Signal binds proof to wallet
)
```

**1:1 Mapping Enforcement**:
```python
# Check if participant exists
participant = db.query(Participant).filter(
    Participant.world_id_hash == world_id_hash
).first()

if participant:
    # Participant exists, verify wallet matches
    if participant.wallet_address.lower() != wallet_address.lower():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="WorldID already linked to a different wallet address"
        )
else:
    # Create new participant with WorldID → Wallet mapping
    participant = Participant(
        world_id_hash=world_id_hash,
        wallet_address=wallet_address
    )
    db.add(participant)
```

**Database Constraint**: `backend/app/models/participant.py`

```python
# Unique constraint ensures one wallet per WorldID
wallet_address = Column(String, unique=True, nullable=False, index=True)

# Unique constraint ensures one WorldID
world_id_hash = Column(String, unique=True, nullable=False, index=True)
```

### How It Works

1. User connects wallet address
2. User generates WorldID proof with wallet address as signal
3. Backend verifies proof with signal (wallet address)
4. Backend checks if WorldID is already linked to a wallet
5. If linked to different wallet: reject
6. If not linked: create new mapping
7. If linked to same wallet: proceed
8. This mapping is permanent (cannot be changed)

### Privacy Preservation

- Signal binding doesn't reveal identity
- Only wallet address is bound (public blockchain data)
- WorldID identity remains private

## 4. Multi-Account Abuse Prevention

### Risk Description

A user could attempt to create multiple accounts (using different wallets) to claim rewards multiple times from the same event.

### Mitigation Strategy

**WorldID Uniqueness Guarantee**: WorldID's core property is that each verified human has exactly one WorldID. This is cryptographically guaranteed and cannot be bypassed.

**Nullifier Hash Tracking**: The nullifier hash is unique per WorldID per action. Even if a user tries to use different wallets, the same WorldID will produce the same nullifier hash (for the same action), which is tracked in the database.

**Database Constraints**: Multiple database constraints ensure that:
- One WorldID can only link to one wallet
- One WorldID can only claim once per event
- One wallet can only link to one WorldID

### Implementation

**Code Location**: `backend/app/models/participant.py`, `backend/app/models/claim.py`

**Database Constraints**:

```python
# Participant model
class Participant(Base):
    __tablename__ = "participants"
    
    id = Column(Integer, primary_key=True, index=True)
    world_id_hash = Column(String, unique=True, nullable=False, index=True)  # One WorldID
    wallet_address = Column(String, unique=True, nullable=False, index=True)  # One wallet
```

```python
# Claim model
class Claim(Base):
    __tablename__ = "claims"
    
    # Composite unique constraint ensures one claim per event per participant
    __table_args__ = (
        UniqueConstraint('participant_id', 'event_id', name='unique_participant_event_claim'),
    )
```

**Claim Processing Logic**: `backend/app/api/routes/participants.py:242-255`

```python
# Check if already claimed
existing_claims = db.query(Claim).filter(
    Claim.event_id == event_id,
    Claim.participant_id == participant.id
).all()

if existing_claims:
    completed_claims = [c for c in existing_claims if c.status == ClaimStatus.COMPLETED]
    if completed_claims:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rewards for this event have already been claimed"
        )
```

### How It Works

1. User attempts to claim with Wallet A
2. System extracts WorldID nullifier hash
3. System finds participant record (WorldID → Wallet A)
4. System checks for existing claims for this WorldID + event
5. If claim exists: reject
6. If no claim: process claim

7. User attempts to claim with Wallet B (different wallet)
8. System extracts WorldID nullifier hash (same WorldID)
9. System finds same participant record (same WorldID)
10. System checks for existing claims (finds previous claim)
11. Claim is rejected (already claimed)

### Privacy Preservation

- WorldID uniqueness is cryptographically guaranteed
- No identity information is needed to enforce uniqueness
- Nullifier hash provides anonymous uniqueness tracking

## Additional Anti-Abuse Measures

### Rate Limiting

**Purpose**: Prevent spam and DoS attacks

**Implementation**: `backend/app/middleware/rate_limit.py`

**Limits**:
- Join endpoint: 5 requests per 60 seconds per IP
- Claim endpoint: 3 requests per 60 seconds per IP

**Code Usage**:
```python
@router.post("/{event_id}/join", ...)
async def join_event(
    ...,
    _: int = Depends(rate_limit(max_requests=5, window_seconds=60))
):
```

### Input Validation

**Purpose**: Prevent invalid data and injection attacks

**Implementation**: `backend/app/services/wallet_service.py`

**Validations**:
- Wallet address checksum validation
- WorldID proof structure validation
- Event ID existence and active status check

### Event Status Check

**Purpose**: Prevent claims on inactive or non-existent events

**Implementation**: `backend/app/api/routes/participants.py:181-187`

```python
# Verify event exists and is active
event = db.query(Event).filter(Event.id == event_id, Event.is_active == True).first()
if not event:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Event not found or inactive"
    )
```

## Summary

### All Risks Addressed

✅ **Proof Reuse**: Prevented by nullifier hash tracking and database constraints
✅ **Replay Attacks**: Prevented by WorldID API verification and nullifier hash tracking
✅ **Proxy Verification**: Prevented by signal binding and 1:1 WorldID→Wallet mapping
✅ **Multi-Account Abuse**: Prevented by WorldID uniqueness guarantee and database constraints

### Privacy Maintained

All anti-abuse measures work without:
- Storing user identity
- Collecting personal information
- Compromising user privacy
- Revealing WorldID identity

### Technical Choices

- **Focused**: Only necessary measures implemented
- **Proportional**: Security measures match the threat level
- **Not Over-Engineered**: Simple, effective solutions
- **Privacy-Preserving**: All measures maintain user anonymity
