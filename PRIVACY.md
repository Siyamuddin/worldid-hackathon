# Privacy-by-Design Documentation

## Overview

The WorldID Reward Distribution System is built with privacy as a core principle. We use Zero-Knowledge Proofs (ZKPs) to verify human uniqueness without collecting or storing any personal identifying information.

## Data Minimization

### What We Collect

**Minimal Data Only:**
- **Nullifier Hash**: A cryptographic hash derived from WorldID's nullifier. This is NOT your identity - it's a unique but anonymous identifier that prevents duplicate claims.
- **Wallet Address**: Your Ethereum wallet address (e.g., `0x1234...`) - required only for delivering rewards. This is public blockchain information, not private data.
- **Event Participation Records**: Which events you've joined and claimed rewards from (linked to your nullifier hash, not your identity).

### What We DON'T Collect

**We explicitly do NOT collect:**
- ❌ Your name or any personal information
- ❌ Your email address
- ❌ Your phone number
- ❌ Your date of birth
- ❌ Your location or IP address (beyond standard web server logs)
- ❌ Your WorldID identity or any biometric data
- ❌ Any information that could identify you personally

### Data Storage

All data is stored in our PostgreSQL database with the following privacy guarantees:

1. **Nullifier Hash Only**: We store a SHA-256 hash of the WorldID nullifier, not the nullifier itself or any identity information.
2. **No Personal Linking**: There is no way to link the stored data back to your real-world identity.
3. **Wallet Address**: Stored for reward delivery only. Wallet addresses are public on the blockchain anyway.

## Zero-Knowledge Proofs (ZKP)

### How ZKPs Work in This System

WorldID uses Zero-Knowledge Proofs to prove that:
- You are a unique human (one person, one WorldID)
- You have verified your humanity through WorldID's Orb verification
- **Without revealing who you are**

### The Verification Process

1. **User Action**: You generate a WorldID proof using the World App
2. **Proof Generation**: WorldID creates a cryptographic proof that:
   - Proves you're a verified human
   - Includes a nullifier hash (unique per action)
   - Does NOT include your identity
3. **Backend Verification**: Our server verifies the proof with WorldID's API
4. **Storage**: We only store the nullifier hash (hashed again for extra security)

### What the Proof Contains

A WorldID proof contains:
- `merkle_root`: Root of the WorldID merkle tree (proves membership)
- `nullifier_hash`: Unique identifier for this specific action
- `proof`: The zero-knowledge proof itself
- `verification_level`: Level of verification (Orb = highest)

**What it does NOT contain:**
- Your identity
- Your biometric data
- Any personal information
- Any way to identify you

### Nullifier Hash Explained

The nullifier hash is a cryptographic construct that:
- ✅ Is unique per WorldID per action
- ✅ Prevents proof reuse (same nullifier = already used)
- ✅ Cannot be linked to your identity
- ✅ Cannot be reversed to reveal your WorldID

We hash the nullifier hash again before storage for an additional layer of privacy:
```python
world_id_hash = hashlib.sha256(nullifier_hash.encode()).hexdigest()
```

## User Trust & Transparency

### Privacy Indicators in UI

The application includes clear privacy indicators:
- **What data is collected**: Displayed before verification
- **What data is NOT collected**: Explicitly shown
- **Why verification is needed**: Explained in simple terms
- **How your privacy is protected**: Visual indicators of ZKP usage

### Transparency Measures

1. **Open Source**: All code is available for review
2. **Clear Documentation**: This privacy document explains everything
3. **No Hidden Tracking**: We don't use analytics or tracking beyond standard server logs
4. **Data Access**: You can see what data we have about you (via your wallet address)

### User Control

- **One Wallet Per WorldID**: You can link one wallet to your WorldID
- **No Data Sharing**: We don't share your data with third parties
- **Event-Based**: You only participate in events you choose to join

## Security Measures

### Proof Verification

Every WorldID proof is verified server-side with WorldID's official API:
- ✅ Fresh proof required for each claim
- ✅ Proof timestamp validated
- ✅ Signal binding (wallet address) prevents proxy verification
- ✅ Nullifier hash checked to prevent reuse

### Database Security

- **Encrypted Connections**: All database connections use SSL/TLS
- **Parameterized Queries**: SQL injection prevention
- **Access Control**: Only authorized backend services can access the database
- **No Personal Data**: Database contains no personally identifiable information

### Anti-Abuse Without Privacy Compromise

We prevent abuse while maintaining privacy:
- **Duplicate Prevention**: Nullifier hash prevents multiple claims
- **Rate Limiting**: Prevents spam without tracking users
- **1:1 Mapping**: WorldID → Wallet mapping prevents multi-account abuse
- **No Identity Required**: All protections work without knowing who you are

## Compliance & Best Practices

### GDPR Compliance

While we don't collect personal data, we follow GDPR principles:
- **Data Minimization**: Only collect what's necessary
- **Purpose Limitation**: Data used only for reward distribution
- **Storage Limitation**: Data retained only as long as needed
- **Transparency**: Clear documentation of data practices

### Best Practices

1. **Privacy by Design**: Privacy built into the system architecture
2. **Zero-Knowledge**: Use ZKPs to minimize data collection
3. **User Control**: Users control their participation
4. **Transparency**: Clear communication about data practices

## Questions & Concerns

If you have questions about privacy:
1. Review this document
2. Check the code (it's open source)
3. Contact the development team

## Technical Details

### WorldID Verification Flow

```
User → World App → Generate ZKP Proof → Backend Verification → WorldID API
                                                                    ↓
                                                              Verify Proof
                                                                    ↓
                                                          Store Nullifier Hash Only
```

### Data Flow Diagram

See `docs/privacy-flow.md` for a detailed visual diagram of the privacy-preserving data flow.

## Summary

**Your Privacy is Protected Because:**
1. ✅ We only store a hashed nullifier (not your identity)
2. ✅ We use Zero-Knowledge Proofs (prove uniqueness without revealing identity)
3. ✅ We don't collect personal information
4. ✅ We don't track you across the web
5. ✅ We don't share your data with third parties
6. ✅ You control your participation

**What You Prove:**
- You are a unique human (via WorldID)
- You haven't claimed this reward before (via nullifier hash)

**What You Don't Reveal:**
- Who you are
- Where you're from
- Any personal information
- Your WorldID identity
