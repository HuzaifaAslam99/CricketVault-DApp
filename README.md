Website Link-> https://cricket-vault-dapp.vercel.app

CricketVault: Decentralized Event Ticketing DApp

A decentralized ticketing platform for cricket events that guarantees ticket authenticity and prevents scalping using blockchain technology. Accepts Native ETH and ERC-20 USDC.

The Reusable Architecture
Instead of building a standard app, I designed a scalable, event-driven Web3 payment engine. This is the same bulletproof backend architecture used in my CryptoFoodWebApp project, proving its reliability across entirely different Web3 domains (E-commerce vs. Event Ticketing).

The Core Challenge: Gas Fees & Data Storage
In the Food App, storing small strings (Order IDs) on-chain was cheap. However, for event tickets, we need to store dynamic metadata (Seat numbers, Match details, Gate entries). Storing large JSON strings directly on a Solidity smart contract is prohibitively expensive due to gas limits.

The Solution: I integrated Pinata (IPFS) to handle heavy data off-chain, while keeping the proof of purchase on-chain.

User selects tickets → Data is saved to MongoDB as PENDING.
Ticket metadata (Match, Seat, Tier) is formatted as JSON and uploaded to Pinata, returning a cryptographic CID (IPFS Hash).
The smart contract is called, storing only this small IPFS hash and the payment amount on the Base Sepolia blockchain.
Backend independently verifies the payment via Alchemy Webhooks (HMAC verified) before updating MongoDB to PAID.

The Stack
Frontend (Off-Chain UI)
React.js & Vite: Fast, dynamic single-page application for browsing matches and selecting seats.
Tailwind CSS: Responsive, mobile-first styling.
Ethers.js: Seamless integration with MetaMask for wallet connectivity and transaction triggering.
Backend & Database (Off-Chain Logic)
Node.js & Express: Handles ticket inventory, user auth, and Webhook verification logic.
MongoDB: Stores user profiles, match schedules, and the PENDING ➔ PAID state machine.
Pinata (IPFS): Decentralized storage for ticket metadata JSON files.

Blockchain (On-Chain Settlement)
Solidity: Smart contract logic mapping IPFS hashes to wallet addresses upon successful USDC/ETH payment.
Base Sepolia (L2): Low-cost, high-speed execution layer.
Hardhat: Compilation, testing, and deployment framework.
Alchemy: RPC provider and Webhook listener for server-side event indexing.

Hybrid Data Strategy

What is stored in MongoDB? (Off-Chain)
Event Catalog: Cricket matches, teams, dates, and ticket prices.
User Data: Fan profiles and delivery/contact information.
Order State: Tracks if a ticket is PENDING, PAID, or SCANNED.

What is stored on the Blockchain? (On-Chain)
IPFS CID (Content Identifier): The immutable hash pointing to the full ticket JSON metadata stored on Pinata.
Payment Amount: The exact USDC or ETH value paid.
Buyer Wallet Address: The true, non-custodial owner of the ticket.
Transaction Hash: The permanent, unalterable proof of purchase.

Security Features
Webhook HMAC Verification: Prevents fake "payment successful" payloads from hitting the backend. Express server verifies Alchemy's cryptographic signature before touching MongoDB.
IPFS Immutability: Once a ticket's metadata is uploaded to Pinata and the hash is saved on Base, the ticket details (seat, match) cannot be altered by the platform or hackers.
CORS Protection: Strict origin checking to prevent unauthorized API access.
Non-Custodial: The platform has no control over the user's funds or their purchased tickets.
