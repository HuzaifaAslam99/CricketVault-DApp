# CricketVault DApp — Decentralized Event Ticketing

A decentralized ticketing platform for cricket events that 
guarantees ticket authenticity and prevents scalping using 
blockchain technology. Accepts both Native ETH and ERC-20 USDC.

## Live Demo
[cricket-vault-dapp.vercel.app](https://cricket-vault-dapp.vercel.app)

---

## The Core Challenge: Gas Fees & On-Chain Data Storage

For event tickets, we need to store dynamic metadata — seat 
numbers, match details, gate entries. Storing large JSON 
strings directly in Solidity is prohibitively expensive.

**The naive approach:**
Store full ticket JSON on-chain → costs hundreds of dollars in gas ❌

**The solution:**
Store ticket JSON on IPFS → store only the 32-byte hash on-chain ✅

---

## How It Works

```
User selects tickets
       ↓
MongoDB saves order as PENDING
       ↓
Ticket metadata (Match, Seat, Tier) uploaded to Pinata → returns IPFS CID
       ↓
Smart contract stores IPFS hash + payment amount on Base Sepolia
(User can safely close the browser here)
       ↓
Smart contract emits Deposit event on Base Sepolia
       ↓
Alchemy Webhook catches the payment event → pushes to Express backend
       ↓
Backend verifies HMAC cryptographic signature
       ↓
MongoDB updates ticket status to PAID ✅
```


## Smart Contract
| Contract | Network | Address |
|----------|---------|---------|
| CricketVault | Base Sepolia | [`0xD67cF1e96A8CEBfa44743156891C6660455A0Aa7`](https://sepolia.basescan.org/address/0xD67cF1e96A8CEBfa44743156891C6660455A0Aa7) |

---

## Reusable Architecture

This project uses the same bulletproof event-driven payment 
engine as my [Web3 Food Ordering DApp](https://github.com/HuzaifaAslam99/FoodAppMernBase), 
proving the architecture is reliable across entirely different 
Web3 domains — E-commerce vs. Event Ticketing.

---

## Tech Stack

### Frontend (Off-Chain UI)
| Technology | Purpose |
|-----------|---------|
| React.js + Vite | Fast, dynamic single-page application |
| Tailwind CSS | Responsive, mobile-first styling |
| Ethers.js | MetaMask wallet connectivity + transaction triggering |

### Backend & Database (Off-Chain Logic)
| Technology | Purpose |
|-----------|---------|
| Node.js + Express | Ticket inventory, auth, webhook verification |
| MongoDB | User profiles, match schedules, order state |
| Pinata (IPFS) | Decentralized storage for ticket metadata JSON |

### Blockchain (On-Chain Settlement)
| Technology | Purpose |
|-----------|---------|
| Solidity | Maps IPFS hashes to wallet addresses on payment |
| Base Sepolia (L2) | Low-cost, high-speed execution layer |
| Hardhat | Compilation, testing, deployment |
| Alchemy | RPC provider + Webhook listener |

---

## Hybrid Data Strategy

### MongoDB stores (Off-Chain)
- Event catalog — cricket matches, teams, dates, ticket prices
- User data — fan profiles, contact information
- Order state machine — PENDING → PAID → SCANNED

### Blockchain stores (On-Chain)
- IPFS CID — immutable hash pointing to full ticket JSON on Pinata
- Payment amount — exact USDC or ETH value paid
- Buyer wallet address — true, non-custodial ticket owner
- Transaction hash — permanent, unalterable proof of purchase

---

## Security Features

| Feature | Implementation |
|---------|---------------|
| Webhook HMAC Verification | Validates Alchemy's cryptographic signature before updating MongoDB |
| IPFS Immutability | Ticket metadata (seat, match) cannot be altered once stored on Pinata |
| CORS Protection | Strict origin checking to prevent unauthorized API access |
| Non-Custodial | Platform has zero control over user funds or purchased tickets |

---

## Performance
- Load tested to **12,000 req/min peak** throughput
- Averaging **1,800 req/min** under sustained load
- Tested using [Loader.io](https://loader.io)

---

## Run Locally

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npm run dev
```

### Smart Contract
```bash
cd blockchain
npm install
npx hardhat compile
npx hardhat ignition deploy ./ignition/modules/CricketVault.ts --network baseSepolia
```

### Environment Variables
```bash
# Backend .env
MONGODB_URI=your_mongodb_uri
ALCHEMY_WEBHOOK_SECRET=your_secret
CORS_ORIGIN= https://cricket-vault-dapp.vercel.app/

# Frontend .env
VITE_BACKEND_URL= https://cricket-vault-dapp-backend.vercel.app
VITE_CONTRACT_ADDRESS=0xD67cF1e96A8CEBfa44743156891C6660455A0Aa7
```

---

```
FoodAppMernBase/
├── frontend/          # React + Vite + Tailwind
│   └── src/
│       ├── components/
│       └── pages/
├── backend/           # Node.js + Express
│   └── routes/
│       └── webhook.js
└── blockchain/        # Solidity + Hardhat
    └── contracts/
        └── CricketVault.sol
```


## Author
**Huzaifa** — Web3 Full-Stack Engineer  
[Portfolio](https://portfolio-website-vr3v.vercel.app) · 
[GitHub](https://github.com/HuzaifaAslam99) · 
[LinkedIn](https://linkedin.com/in/huzaifa-aslam-4845152aa)
