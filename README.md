# 🌍 InHuman - Proof-of-Human Token Distribution for Real-World Events

## 🧠 Overview

**InHuman** is a Web3 system that ensures **only real
humans** can claim event rewards --- not bots, scripts, or Sybil
attackers.

We combine:

-   🧬 **World ID** → Proof of personhood\
-   🪙 **ERC-20 Reward Token** → On-chain incentive\
-   🔐 **Smart Contracts** → Trustless, automated reward distribution

This allows event organizers to distribute tokens fairly, securely, and
transparently.

------------------------------------------------------------------------

## ❗ Problem

Web3 reward systems are broken.

  Issue                  What Happens
  ---------------------- ----------------------------------------------
  🤖 Sybil attacks       One person claims rewards multiple times
  🧍 Fake users          Bots farm tokens meant for real participants
  💸 Wasted funds        Projects distribute tokens to non-humans
  📉 Token devaluation   Rewards lose meaning and value

**Web3 incentives only work if rewards reach real people.**

------------------------------------------------------------------------

## ✅ Our Solution

We built a **proof-of-human reward system** using World ID.

### 🔄 Flow

1.  User verifies they are human using **World ID**
2.  User connects wallet
3.  User submits proof to our smart contract
4.  Contract verifies proof on-chain
5.  If valid and unused → user receives tokens 🎉

One human = one reward. Always.

------------------------------------------------------------------------

## 🏗 Architecture

**Smart Contracts**

  Contract            Purpose
  ------------------- ------------------------------------------
  `RewardToken.sol`   ERC-20 token used as event reward
  `HumanReward.sol`   Verifies World ID proof and mints tokens

**External Integration**

  Service    Role
  ---------- ------------------------------
  World ID   Provides proof of personhood
  MetaMask   User wallet
  Sepolia    Test network deployment

------------------------------------------------------------------------

## 📜 Smart Contracts

### 🪙 RewardToken.sol

ERC-20 token that represents event rewards.

-   Mintable\
-   Ownership transferred to HumanReward contract\
-   Name: **Human Reward Token (HRT)**

------------------------------------------------------------------------

### 🧑‍🚀 HumanReward.sol

Core logic of the system.

**Responsibilities:**

✔ Verifies World ID proof\
✔ Prevents double claims using nullifier hash\
✔ Mints reward tokens to verified humans

**Key Security Feature**

``` solidity
mapping(uint256 => bool) public nullifierHashes;
```

Prevents the same human from claiming twice.

------------------------------------------------------------------------

## 🚀 Deployment (Sepolia)

### 1️⃣ Deploy Reward Token

Deploy `RewardToken.sol`

Save the contract address.

------------------------------------------------------------------------

### 2️⃣ Deploy Human Reward

Constructor parameters:

  ----------------------------------------------------------------------------------------
  Parameter                                 Value
  ----------------------------------------- ----------------------------------------------
  `_worldId`                                `0x469449f251692E0779667583026b5A1E99512157`
                                            (World ID Sepolia Router)

  `_rewardToken`                            Address of deployed RewardToken
  ----------------------------------------------------------------------------------------

------------------------------------------------------------------------

### 3️⃣ Transfer Token Ownership

Call on `RewardToken`:

    transferOwnership(<HumanReward Contract Address>)

Now only the HumanReward contract can mint tokens.

------------------------------------------------------------------------

## 🧪 How Users Claim Rewards

1.  User opens event app\
2.  Connects wallet\
3.  Verifies with World ID\
4.  Frontend generates proof\
5.  Calls:

```{=html}
<!-- -->
```
    claimReward(root, nullifierHash, proof)

If successful → 🎁 Tokens are minted

------------------------------------------------------------------------

## 🔐 Security Features

  Protection             How
  ---------------------- -------------------------
  One reward per human   Nullifier hash tracking
  No bot farming         World ID proof
  Trustless minting      Smart contract logic
  Transparent            On-chain verification

------------------------------------------------------------------------

## 🌎 Use Cases

-   🎟 Hackathon participation rewards\
-   🎉 Event attendance incentives\
-   🧑‍🏫 Proof-of-learning rewards\
-   🌍 DAO onboarding bonuses\
-   🎮 Play-to-earn anti-bot protection

------------------------------------------------------------------------

## 🧩 Future Improvements

-   Event-specific reward pools\
-   NFT badges for participation\
-   Off-chain reputation scoring\
-   Multi-event reward dashboard\
-   AI-based event recommendations

------------------------------------------------------------------------

## 👥 Vision

We believe **Web3 rewards should go to humans, not bots.**

Human Reward Protocol brings **real identity, real fairness, and real
incentives** to decentralized ecosystems.

------------------------------------------------------------------------

## 📄 Credits

Das Prithwis, Banu Sabira, Uddin Siyam, 성현
