import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { sql } from "drizzle-orm";
import dotenv from "dotenv";
dotenv.config();

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

const posts = [
  {
    slug: "agentescrow-erc8183-v1-0-0-launch",
    title: "AgentEscrow ERC-8183 v1.0.0 — Initial Public Release",
    summary:
      "We are thrilled to announce the initial public release of AgentEscrow ERC-8183 — the open, permissionless standard for AI agent commerce on Ethereum. Today marks a major milestone in our mission to enable trustless, three-party escrow for the emerging AI agent economy.",
    content: `# AgentEscrow ERC-8183 v1.0.0 — Initial Public Release

We are thrilled to announce the **initial public release** of AgentEscrow ERC-8183 — the open, permissionless standard for AI agent commerce on Ethereum.

Today marks a major milestone in our mission to enable trustless, three-party escrow for the emerging AI agent economy.

## What is AgentEscrow ERC-8183?

ERC-8183 is a smart contract standard that defines a **three-party escrow protocol** for AI agent commerce:

| Role | Responsibility |
|---|---|
| **Client** | Creates and funds the job escrow |
| **Provider** | Delivers the work and submits a deliverable hash |
| **Evaluator** | Neutral third-party that approves or rejects the submission |

The protocol enforces a strict on-chain state machine:

\`\`\`
OPEN → FUNDED → SUBMITTED → COMPLETED
                           ↘ REJECTED
\`\`\`

Funds are locked in the smart contract and only released when the evaluator attests to successful delivery — creating a fully trustless commerce layer with no intermediaries.

## What's Included in v1.0.0

### Platform Features
- **Job Management Dashboard** — Create, fund, submit, and evaluate jobs with a clean Web3 UI
- **Web3 Wallet Integration** — Connect MetaMask, Coinbase Wallet, and 100+ wallets via RainbowKit
- **AI Chat Assistant** — Built-in protocol guidance powered by LLM
- **Analytics Dashboard** — Protocol statistics, leaderboard, and health metrics
- **Contract Explorer** — ABI viewer, deployment guide for Sepolia testnet
- **Documentation** — Full whitepaper with specification, use cases, and integration guide
- **Real-time Notifications** — Live job status updates

### Technical Stack
- React 19 + TypeScript + Tailwind CSS 4
- Express + tRPC 11 + Drizzle ORM
- wagmi + viem + RainbowKit
- Framer Motion for animations

## Getting Started

Visit **[escrowagent.vip](https://escrowagent.vip)** to explore the platform, or check out the source code on **[GitHub](https://github.com/AgentEscrow8183/agentescrow-erc8183)**.

To deploy the smart contract on Sepolia testnet, visit the [Contract Explorer](/contract) page for step-by-step instructions.

## What's Next

We are actively working on:

- **On-chain transaction signing** — Connecting UI actions to actual smart contract transactions
- **Multi-chain support** — Base, Arbitrum, and Optimism
- **Reputation system** — Provider and evaluator reputation scores
- **SDK** — TypeScript SDK for AI agent integration

## Follow Us

Stay updated on our progress:
- **X:** [@_agentescrow](https://x.com/_agentescrow)
- **GitHub:** [AgentEscrow8183](https://github.com/AgentEscrow8183)

Thank you for your support. The future of AI agent commerce starts here.

— The AgentEscrow Team`,
    category: "announcement",
    tags: "v1.0.0,launch,erc-8183,announcement",
    authorName: "AgentEscrow Team",
    coverImage:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663367353410/AiMHYdbcTQcw9MdrNdMT2X/roles-illustration_38c6a0eb.webp",
    published: 1,
    publishedAt: new Date(),
  },
  {
    slug: "erc-8183-protocol-roadmap-2026",
    title: "ERC-8183 Protocol Roadmap 2026",
    summary:
      "A detailed look at our development roadmap for 2026 — from on-chain transaction signing and multi-chain expansion to the reputation system and AI agent SDK. Here is what we are building and when.",
    content: `# ERC-8183 Protocol Roadmap 2026

As we launch v1.0.0, we want to be transparent about what comes next. Here is our development roadmap for 2026.

## Q1 2026 — Foundation (Current)

- [x] Core escrow state machine (OPEN → FUNDED → SUBMITTED → COMPLETED/REJECTED)
- [x] Web3 wallet integration (RainbowKit + wagmi)
- [x] Job management dashboard
- [x] AI chat assistant
- [x] Analytics & leaderboard
- [x] Blog & documentation
- [x] Public website at escrowagent.vip

## Q2 2026 — On-Chain Integration

The most critical next step is connecting the UI to actual smart contract transactions on Sepolia testnet.

- [ ] Deploy ERC-8183 reference contract to Sepolia
- [ ] Integrate \`useWriteContract\` from wagmi for all job actions
- [ ] On-chain event indexing for real-time status updates
- [ ] Transaction history page per wallet

## Q3 2026 — Multi-Chain Expansion

After proving the protocol on Sepolia, we will expand to L2 networks where gas costs are significantly lower — making micro-transactions viable for AI agent commerce.

- [ ] Base mainnet deployment
- [ ] Arbitrum One deployment
- [ ] Optimism deployment
- [ ] Cross-chain job routing

## Q4 2026 — Ecosystem Growth

- [ ] Reputation system for providers and evaluators
- [ ] Dispute resolution mechanism (DAO governance)
- [ ] TypeScript SDK for AI agent integration
- [ ] EIP submission for ERC-8183 standardization

## How You Can Help

We are an open-source project and welcome contributions at every stage. See our [Contributing Guide](https://github.com/AgentEscrow8183/agentescrow-erc8183/blob/main/CONTRIBUTING.md) to get started.

Follow us on [X @_agentescrow](https://x.com/_agentescrow) for weekly updates.

— The AgentEscrow Team`,
    category: "roadmap",
    tags: "roadmap,2026,multi-chain,on-chain,sdk",
    authorName: "AgentEscrow Team",
    coverImage:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663367353410/AiMHYdbcTQcw9MdrNdMT2X/state-machine-visual-EZGsJv5ewcEdpDMtmquJcu.webp",
    published: 1,
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    slug: "understanding-erc-8183-three-party-escrow",
    title: "Understanding ERC-8183: The Three-Party Escrow Model",
    summary:
      "A deep dive into the ERC-8183 protocol design — why we chose a three-party model with an independent evaluator, how the state machine works, and why this architecture is uniquely suited for AI agent commerce.",
    content: `# Understanding ERC-8183: The Three-Party Escrow Model

Traditional two-party escrow has a fundamental problem: **who decides if the work is done?**

In a standard escrow, either the client or the provider controls the release condition. This creates an inherent conflict of interest. ERC-8183 solves this with a **three-party model**.

## The Three Parties

### Client
The entity that needs work done. The client:
1. Creates the job with provider address, evaluator address, token, amount, and expiry
2. Funds the escrow by transferring tokens to the contract
3. Cannot unilaterally release or withhold payment after funding

### Provider
The entity that performs the work. The provider:
1. Accepts the job by performing the work
2. Submits a \`deliverableHash\` — a cryptographic hash of the work product (IPFS CID, content hash, etc.)
3. Cannot claim payment without evaluator approval

### Evaluator
The neutral third party. The evaluator:
1. Reviews the deliverable against the job specification
2. Calls \`completeJob()\` to release payment to the provider
3. Calls \`rejectJob()\` to return funds to the client

The evaluator can be a **human expert**, a **DAO multisig**, or an **AI oracle** — making the protocol flexible for different trust models.

## The State Machine

\`\`\`
OPEN
  │ fundJob() by client
  ▼
FUNDED
  │ submitWork() by provider
  ▼
SUBMITTED
  │ completeJob() by evaluator    │ rejectJob() by evaluator
  ▼                               ▼
COMPLETED                       REJECTED
(payment → provider)            (funds → client)
\`\`\`

Each state transition is enforced on-chain. No party can skip steps or bypass the evaluator.

## Why This Matters for AI Agents

As AI agents become capable of performing complex tasks — writing code, conducting research, generating content — they need a payment infrastructure that:

1. **Does not require trust** between client and provider agents
2. **Supports objective evaluation** by a third party (human or AI)
3. **Is fully on-chain** so agents can verify and interact programmatically

ERC-8183 provides exactly this. An AI agent can create a job, fund it, and receive payment — all without human intervention, with cryptographic guarantees at every step.

## Next Steps

Explore the full specification in our [Documentation](/docs) or try the [Dashboard](/dashboard) to create your first job.

— The AgentEscrow Team`,
    category: "research",
    tags: "erc-8183,protocol,design,ai-agent,escrow",
    authorName: "AgentEscrow Team",
    coverImage: null,
    published: 1,
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
  },
];

try {
  for (const post of posts) {
    await db.execute(
      sql`INSERT INTO blog_posts (slug, title, summary, content, category, tags, authorName, coverImage, published, publishedAt)
       VALUES (${post.slug}, ${post.title}, ${post.summary}, ${post.content}, ${post.category}, ${post.tags}, ${post.authorName}, ${post.coverImage ?? null}, ${post.published}, ${post.publishedAt})
       ON DUPLICATE KEY UPDATE title = VALUES(title)`
    );
    console.log(`✅ Seeded: ${post.slug}`);
  }
  console.log("\n🎉 All blog posts seeded successfully!");
} catch (err) {
  console.error("❌ Seed failed:", err);
} finally {
  await connection.end();
}
