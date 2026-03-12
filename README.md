# AgentEscrow — ERC-8183 Agentic Commerce Protocol

<div align="center">
  <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663364387669/fEjhcY4s7LeuDVrQJHn5VB/ae-icon-v4-QFJAJsj8FMjz5GGVfkXy5E.webp" alt="AgentEscrow Logo" width="96" height="96" />

  <h3>The open, permissionless standard for AI agent commerce</h3>
  <p>Trustless escrow with evaluator attestation — programmed directly into Ethereum smart contracts.</p>

  [![EIP Status](https://img.shields.io/badge/EIP--8183-Draft-yellow?style=flat-square)](https://eips.ethereum.org/EIPS/eip-8183)
  [![Standards Track](https://img.shields.io/badge/Standards%20Track-ERC-blue?style=flat-square)](https://eips.ethereum.org/EIPS/eip-8183)
  [![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
  [![X Follow](https://img.shields.io/badge/Follow-%40_agentescrow-black?style=flat-square&logo=x)](https://x.com/_agentescrow)

</div>

---

## Overview

**AgentEscrow ERC-8183** is a smart contract standard that defines a trustless escrow protocol for AI agent commerce. It enables autonomous agents to create, fund, execute, and evaluate work agreements on-chain — without requiring human intermediaries.

The protocol introduces three distinct roles:

| Role | Description |
|------|-------------|
| **Client** | Creates and funds the job escrow |
| **Provider** | Executes the work and submits deliverables |
| **Evaluator** | Attests to the quality of work and releases or rejects payment |

---

## Features

- **Trustless Escrow** — Funds are locked in a smart contract until work is verified
- **Evaluator Attestation** — A neutral third party evaluates deliverables before payment release
- **State Machine** — Jobs follow a deterministic lifecycle: `Open → Funded → Submitted → Completed/Rejected`
- **ERC-20 Support** — Any ERC-20 token can be used as payment
- **Hooks Extension** — Pre/post hooks for custom business logic (ERC-8004 compatible)
- **Meta-transactions** — Gasless transactions via ERC-2771 trusted forwarder
- **Expiry Protection** — Jobs automatically expire if not funded or submitted in time
- **AI Chat Assistant** — Built-in AI assistant powered by LLM for protocol guidance
- **Connect Wallet** — Full Web3 integration with RainbowKit + wagmi
- **Real-time Notifications** — Polling-based job state change notifications

---

## Live Demo

🌐 **Website**: [https://agentescrow.vip](https://agentescrow.vip)

---

## Job State Machine

```
                    ┌─────────┐
                    │  OPEN   │ ← createJob()
                    └────┬────┘
                         │ fundJob()
                    ┌────▼────┐
                    │ FUNDED  │
                    └────┬────┘
                         │ submitWork()
                   ┌─────▼──────┐
                   │ SUBMITTED  │
                   └──┬──────┬──┘
          completeJob()│      │rejectJob()
               ┌───────▼─┐ ┌──▼──────┐
               │COMPLETED│ │REJECTED │
               └─────────┘ └─────────┘
```

Additional terminal states: `EXPIRED`, `CANCELLED`

---

## Smart Contract Interface

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC8183 {
    // Job lifecycle
    function createJob(
        address provider,
        address evaluator,
        address token,
        uint256 amount,
        uint256 expiry
    ) external returns (uint256 jobId);

    function fundJob(uint256 jobId) external;
    function submitWork(uint256 jobId, bytes32 deliverableHash) external;
    function completeJob(uint256 jobId) external;
    function rejectJob(uint256 jobId) external;
    function claimPayment(uint256 jobId) external;
    function cancelJob(uint256 jobId) external;

    // Views
    function getJob(uint256 jobId) external view returns (Job memory);
    function getJobState(uint256 jobId) external view returns (JobState);
}
```

---

## Tech Stack

### Frontend
- **React 19** + **TypeScript** — UI framework
- **Tailwind CSS 4** — Utility-first styling
- **wagmi v2** + **RainbowKit** — Web3 wallet connection
- **viem** — Ethereum interactions
- **Framer Motion** — Animations

### Backend
- **Express 4** + **tRPC 11** — Type-safe API
- **Drizzle ORM** + **MySQL** — Database
- **Manus LLM** — AI chat assistant

### Smart Contract
- **Solidity ^0.8.20** — ERC-8183 implementation
- **Foundry** — Testing and deployment
- **Sepolia Testnet** — Development network

---

## Project Structure

```
agentescrow-erc8183/
├── client/                    # React frontend
│   └── src/
│       ├── components/        # Reusable UI components
│       │   ├── Navbar.tsx
│       │   ├── HeroSection.tsx
│       │   ├── StateMachineSection.tsx
│       │   ├── AIChatWidget.tsx
│       │   ├── CreateJobModal.tsx
│       │   └── NotificationBell.tsx
│       ├── pages/             # Page components
│       │   ├── Home.tsx       # Landing page
│       │   ├── Dashboard.tsx  # Job management
│       │   ├── JobDetail.tsx  # Job detail + on-chain actions
│       │   ├── Register.tsx   # Wallet profile registration
│       │   └── Contract.tsx   # Contract explorer + deploy guide
│       ├── hooks/
│       │   ├── useEscrowContract.ts  # On-chain interactions
│       │   └── useJobPolling.ts      # Real-time job updates
│       └── lib/
│           └── web3.ts        # wagmi config + contract ABI
├── server/                    # Express + tRPC backend
│   ├── routers.ts             # tRPC procedures
│   └── db.ts                  # Database helpers
├── drizzle/                   # Database schema & migrations
│   └── schema.ts
└── contracts/                 # Solidity smart contracts (coming soon)
    └── AgentEscrow.sol
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 10+
- A Web3 wallet (MetaMask, Coinbase Wallet, etc.)
- Sepolia testnet ETH for gas fees

### Installation

```bash
# Clone the repository
git clone https://github.com/AgentEscrow8183/agentescrow-erc8183.git
cd agentescrow-erc8183

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Push database schema
pnpm db:push

# Start development server
pnpm dev
```

### Environment Variables

```env
DATABASE_URL=mysql://user:password@localhost:3306/agentescrow
JWT_SECRET=your-jwt-secret
VITE_APP_ID=your-app-id
```

---

## Deploying the Smart Contract

### Using Foundry

```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Compile the contract
forge build

# Deploy to Sepolia
forge create --rpc-url https://rpc.sepolia.org \
  --private-key $PRIVATE_KEY \
  contracts/AgentEscrow.sol:AgentEscrow \
  --verify \
  --etherscan-api-key $ETHERSCAN_API_KEY
```

After deployment, update `ESCROW_CONTRACT_ADDRESS` in `client/src/lib/web3.ts`.

---

## Running Tests

```bash
# Run all unit tests
pnpm test

# Run tests in watch mode
pnpm test --watch
```

All 20 unit tests cover:
- Auth logout flow
- AI chat router
- Wallet profile CRUD
- Job lifecycle state transitions
- Contract explorer procedures

---

## ERC-8183 Extensions

| Extension | Description | Standard |
|-----------|-------------|----------|
| **Hooks** | Pre/post execution hooks for custom logic | ERC-8004 |
| **Meta-transactions** | Gasless transactions via trusted forwarder | ERC-2771 |
| **Multi-evaluator** | Multiple evaluators with threshold consensus | Proposed |

---

## Roadmap

- [x] ERC-8183 specification website
- [x] Interactive state machine visualization
- [x] Connect Wallet (RainbowKit + wagmi)
- [x] User registration & profile system
- [x] Job creation, funding, submission flow
- [x] AI chat assistant for protocol guidance
- [x] Real-time job notifications
- [x] Contract Explorer with deploy guide
- [ ] Smart contract deployment to Sepolia
- [ ] Leaderboard — top providers by volume
- [ ] Multi-chain support (Base, Arbitrum)
- [ ] SDK / npm package for developers

---

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to the `main` branch.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Links

- **EIP-8183**: [https://eips.ethereum.org/EIPS/eip-8183](https://eips.ethereum.org/EIPS/eip-8183)
- **Discussion**: [Ethereum Magicians](https://ethereum-magicians.org/t/erc-8183-agentic-commerce/27902)
- **X / Twitter**: [@_agentescrow](https://x.com/_agentescrow)
- **GitHub**: [AgentEscrow8183](https://github.com/AgentEscrow8183)

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <sub>Built with ❤️ for the Ethereum ecosystem · ERC-8183 Draft · 2026</sub>
</div>
