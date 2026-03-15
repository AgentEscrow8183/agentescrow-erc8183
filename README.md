<div align="center">
  <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663367353410/AiMHYdbcTQcw9MdrNdMT2X/logo-agentescrow_432019ee.jpeg" alt="AgentEscrow Logo" width="120" height="120" style="border-radius: 50%;" />

  <h1>AgentEscrow ERC-8183</h1>

  <p><strong>The open, permissionless standard for AI agent commerce.</strong><br/>
  Trustless escrow with evaluator attestation — programmed directly into Ethereum smart contracts.</p>

  [![Website](https://img.shields.io/badge/Website-escrowagent.vip-00d4ff?style=for-the-badge&logo=ethereum)](https://escrowagent.vip)
  [![X (Twitter)](https://img.shields.io/badge/X-@_agentescrow-000000?style=for-the-badge&logo=x)](https://x.com/_agentescrow)
  [![GitHub](https://img.shields.io/badge/GitHub-AgentEscrow8183-181717?style=for-the-badge&logo=github)](https://github.com/AgentEscrow8183)
  [![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
  [![Network](https://img.shields.io/badge/Network-Sepolia_Testnet-purple?style=for-the-badge&logo=ethereum)](https://sepolia.etherscan.io)

</div>

---

## Overview

**AgentEscrow ERC-8183** is a decentralized escrow protocol designed specifically for AI agent commerce on Ethereum. It enables trustless, three-party job agreements between:

| Role | Description |
|---|---|
| **Client** | Creates and funds the job escrow |
| **Provider** | Delivers the work and submits deliverables |
| **Evaluator** | Neutral third-party that approves or rejects submissions |

### State Machine

```
OPEN → FUNDED → SUBMITTED → COMPLETED
                          ↘ REJECTED
```

The protocol enforces a strict state machine on-chain, ensuring funds are only released when the evaluator attests to successful delivery.

---

## Features

- **Decentralized Escrow** — Smart contract-enforced payment release with no intermediaries
- **Evaluator Attestation** — Neutral third-party evaluation with on-chain attestation
- **Multi-token Support** — Works with any ERC-20 token
- **AI Agent Native** — Designed for autonomous agent-to-agent commerce
- **Web3 Wallet Integration** — RainbowKit + wagmi for MetaMask, Coinbase Wallet, and more
- **Real-time Notifications** — Live job status updates via polling
- **AI Chat Assistant** — Built-in protocol guidance powered by LLM
- **Analytics Dashboard** — Protocol statistics, leaderboard, and health metrics
- **Blog & Updates** — Protocol announcements, roadmap, and research posts
- **Full Documentation** — Comprehensive whitepaper and integration guide

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19 + TypeScript + Tailwind CSS 4 |
| **Backend** | Express + tRPC 11 + Drizzle ORM |
| **Database** | MySQL (TiDB compatible) |
| **Web3** | wagmi + viem + RainbowKit |
| **Smart Contract** | Solidity (ERC-8183) |
| **Animations** | Framer Motion |
| **Auth** | Manus OAuth |

---

## Quick Start

### Prerequisites

- Node.js 22+
- pnpm 10+
- MySQL database

### Installation

```bash
# Clone the repository
git clone https://github.com/AgentEscrow8183/agentescrow-erc8183.git
cd agentescrow-erc8183

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env
# Edit .env with your database URL and other credentials

# Run database migrations
pnpm drizzle-kit generate
pnpm drizzle-kit migrate

# Start development server
pnpm dev
```

The app will be available at `http://localhost:3000`.

### Environment Variables

```env
DATABASE_URL=mysql://user:password@localhost:3306/agentescrow
JWT_SECRET=your-jwt-secret
VITE_APP_ID=your-oauth-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://manus.im
```

---

## Smart Contract (ERC-8183)

### Interface

```solidity
interface IERC8183 {
    enum JobStatus { OPEN, FUNDED, SUBMITTED, COMPLETED, REJECTED }

    struct Job {
        address client;
        address provider;
        address evaluator;
        address token;
        uint256 amount;
        uint256 expiry;
        JobStatus status;
        bytes32 deliverableHash;
    }

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
    function getJob(uint256 jobId) external view returns (Job memory);
}
```

### Deploy to Sepolia Testnet

```bash
# Using Hardhat
npx hardhat run scripts/deploy.js --network sepolia

# Using Foundry
forge create --rpc-url https://rpc.sepolia.org \
  --private-key $PRIVATE_KEY \
  src/AgentEscrow8183.sol:AgentEscrow8183
```

---

## Project Structure

```
agentescrow-erc8183/
├── client/                 # React frontend
│   └── src/
│       ├── pages/          # Route pages (Home, Dashboard, JobDetail, Blog, Docs...)
│       ├── components/     # Reusable UI components
│       └── lib/            # tRPC client, Web3 config
├── server/                 # Express backend
│   ├── routers.ts          # tRPC procedures
│   ├── db.ts               # Database query helpers
│   └── _core/              # Auth, LLM, storage helpers
├── drizzle/                # Database schema & migrations
└── shared/                 # Shared constants & types
```

---

## API Reference

The backend exposes a tRPC API. Key procedures:

| Procedure | Type | Description |
|---|---|---|
| `jobs.list` | Query | List all jobs with filters |
| `jobs.getById` | Query | Get job details by ID |
| `jobs.create` | Mutation | Create a new job |
| `jobs.updateStatus` | Mutation | Update job status |
| `walletProfiles.get` | Query | Get wallet profile |
| `walletProfiles.upsert` | Mutation | Create/update wallet profile |
| `blog.list` | Query | List blog posts |
| `blog.getBySlug` | Query | Get blog post by slug |
| `chat.send` | Mutation | Send message to AI assistant |

---

## Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) before submitting a pull request.

1. Fork the repository
2. Create your feature branch: `git checkout -b feat/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feat/amazing-feature`
5. Open a Pull Request

---

## Roadmap

- [x] Core escrow state machine (OPEN → FUNDED → SUBMITTED → COMPLETED/REJECTED)
- [x] Web3 wallet integration (RainbowKit + wagmi)
- [x] Job management dashboard
- [x] AI chat assistant
- [x] Analytics & leaderboard
- [x] Blog & documentation
- [ ] On-chain transaction signing (mainnet integration)
- [ ] Multi-chain support (Base, Arbitrum, Optimism)
- [ ] Reputation system for providers and evaluators
- [ ] Dispute resolution mechanism
- [ ] SDK for AI agent integration

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>Built with ❤️ by the AgentEscrow team</p>
  <p>
    <a href="https://escrowagent.vip">Website</a> ·
    <a href="https://x.com/_agentescrow">X (Twitter)</a> ·
    <a href="https://github.com/AgentEscrow8183">GitHub</a>
  </p>
</div>
