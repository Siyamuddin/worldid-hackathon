# World Build Korea 2026 - Presentation Template

## Instructions

1. Create this presentation in **Google Slides**
2. Set sharing to **Public** (anyone with link can view)
3. Maximum **6 slides** (mandatory order)
4. **English slides recommended**
5. Keep slides concise and visual

---

## Slide 1: Problem (One Sentence)

**Title**: The Problem

**Content**:
- **One clear, real problem**
- **Immediately understandable in a real-world context**

**Example**:
```
Event organizers lose millions to multi-account abuse 
where users create multiple accounts to claim rewards 
multiple times, making fair reward distribution impossible 
without proof of personhood.
```

**Visual**: 
- Image showing multi-account abuse
- Chart showing losses from abuse
- Real-world scenario illustration

---

## Slide 2: Solution (One Sentence + Visual)

**Title**: Our Solution

**Content**:
- **One sentence describing what your mini-app solves**
- **Visual: Diagrams, flows, or UI mockups strongly recommended**

**Example**:
```
WorldID Reward Distribution System ensures one person = 
one reward using WorldID's proof of personhood, enabling 
fair, private, sybil-resistant reward distribution.
```

**Visual Options**:
- System architecture diagram
- User flow diagram
- UI mockup/screenshot
- How it works illustration

**Recommended Visual**:
```
┌─────────────┐
│   User      │
│  (Human)    │
└──────┬──────┘
       │
       │ WorldID Proof
       ▼
┌─────────────┐
│  Backend    │
│ Verification│
└──────┬──────┘
       │
       │ One Claim
       ▼
┌─────────────┐
│   Reward    │
│ Distributed │
└─────────────┘
```

---

## Slide 3: Why Human-Only / Why World ID

**Title**: Why WorldID is Essential

**Content**:
- **Why the solution does NOT work without WorldID**
- **Do NOT frame this as simple login or convenience**
- **Clearly state the core reason**:
  - Bot prevention
  - Sybil resistance
  - Proxy abuse prevention
  - Multi-account abuse prevention

**Example**:
```
WorldID is NOT optional—it's the foundation.

Without WorldID:
❌ Multi-account abuse makes fair distribution impossible
❌ Bots and Sybil attacks drain resources
❌ System cannot guarantee one person = one reward

With WorldID:
✅ Cryptographic proof of human uniqueness
✅ Sybil-resistant system
✅ Privacy-preserving verification
✅ System cannot function without it
```

**Visual**:
- Comparison: With vs Without WorldID
- Architecture showing WorldID as core dependency
- Diagram showing what breaks without WorldID

---

## Slide 4: Demo

**Title**: Demo

**Content**:
- **At least one required**: GIF, Screen-recorded video, or Clickable mockup
- **Optional**: Live demo
- **Clarity of flow matters more than perfect implementation**

**What to Show**:
1. User opens mini-app (via QR code)
2. User connects wallet
3. User verifies with WorldID
4. User joins event
5. User claims reward
6. Show duplicate prevention (try to claim again - fails)

**Demo Script**: See `docs/demo-script.md` for detailed script

**Visual**:
- Embedded video/GIF showing complete flow
- Screenshots of key steps
- Annotations highlighting important features

**Recommended Format**:
- Screen recording from real iOS/Android device
- 2-3 minutes maximum
- Show complete flow clearly
- Highlight privacy indicators

---

## Slide 5: Privacy & Risk Mitigation

**Title**: Privacy & Risk Mitigation

**Content**:
- **Whether Yes/No or attribute proofs are used**
- **What data is explicitly NOT collected**
- **Basic handling of reuse, proxy verification, and abuse risks**

**Example**:
```
Privacy-by-Design:
✅ Zero-Knowledge Proofs (prove uniqueness without identity)
✅ Data Minimization (nullifier hash only, no personal info)
✅ No Identity Storage (cannot identify users)

What We Collect:
- Nullifier hash (anonymous)
- Wallet address (public blockchain data)

What We DON'T Collect:
❌ Name, email, phone
❌ Identity or biometric data
❌ Personal information

Risk Mitigation:
✅ Proof reuse: Nullifier hash tracking
✅ Replay attacks: WorldID API verification
✅ Proxy verification: Signal binding (wallet address)
✅ Multi-account abuse: WorldID uniqueness guarantee
```

**Visual**:
- Privacy flow diagram
- Data minimization illustration
- Risk mitigation checklist

---

## Slide 6: Future Plans (Including Go-to-Market)

**Title**: Future Plans & Go-to-Market

**Content**:
- **What you will build after the hackathon**
- **Real usage scenarios** (stores, events, communities, DAOs)
- **Simple deployment and scaling plan**

**Example**:
```
Phase 1: Launch (Next 3 Months)
- Deploy to production
- Partner with 3 event organizers
- Launch beta with 100 users

Phase 2: Scale (3-6 Months)
- Integrate with major event platforms
- Support for NFT rewards
- Mobile app optimization

Phase 3: Expand (6-12 Months)
- Multi-chain support (Polygon, Base)
- DAO governance integration
- Enterprise features

Real-World Use Cases:
🏪 Offline stores: One coupon per person
🎫 Event ticketing: Prevent bot tickets
🎁 Airdrops: Fair token distribution
🏛️ DAO voting: One person, one vote
```

**Visual**:
- Roadmap timeline
- Use case illustrations
- Deployment architecture

---

## Presentation Tips

1. **Keep it Simple**: Each slide should be understandable in 10 seconds
2. **Visual First**: Use diagrams, screenshots, and visuals
3. **Practice Timing**: 5 minutes total, ~50 seconds per slide
4. **Be Clear**: Avoid jargon, explain technical terms
5. **Show Impact**: Emphasize real-world use cases
6. **Demonstrate**: Show it working, not just describe it

## Q&A Preparation (2 minutes)

Be ready to answer:
- How does WorldID verification work?
- What happens if someone tries to claim twice?
- How do you ensure privacy?
- What are the technical challenges?
- How will you deploy this?

---

## Submission

1. Create in Google Slides
2. Set to **Public** access
3. Get shareable link
4. Include link in submission form

**Deadline**: February 7, 2026, 13:00
