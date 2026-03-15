# Contributing to AgentEscrow ERC-8183

Thank you for your interest in contributing to AgentEscrow ERC-8183! This document provides guidelines and instructions for contributing to the project.

---

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. We expect all contributors to:

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Accept constructive criticism gracefully
- Focus on what is best for the community

---

## How to Contribute

### Reporting Bugs

Before creating a bug report, please check the [existing issues](https://github.com/AgentEscrow8183/agentescrow-erc8183/issues) to avoid duplicates.

When filing a bug report, include:

1. **Clear title** — A concise description of the issue
2. **Steps to reproduce** — Exact steps to reproduce the behavior
3. **Expected behavior** — What you expected to happen
4. **Actual behavior** — What actually happened
5. **Environment** — OS, browser, Node.js version
6. **Screenshots** — If applicable

### Suggesting Features

Feature requests are welcome! Please open an issue with:

1. **Use case** — Why is this feature needed?
2. **Proposed solution** — How should it work?
3. **Alternatives considered** — What other approaches did you consider?

### Submitting Pull Requests

1. **Fork** the repository
2. **Create a branch** from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```
3. **Make your changes** following the coding standards below
4. **Write tests** for new functionality
5. **Run the test suite**: `pnpm test`
6. **Check TypeScript**: `pnpm check`
7. **Commit** with a descriptive message (see Commit Convention below)
8. **Push** your branch and open a Pull Request

---

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/agentescrow-erc8183.git
cd agentescrow-erc8183

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your local credentials

# Run migrations
pnpm drizzle-kit generate && pnpm drizzle-kit migrate

# Start dev server
pnpm dev
```

---

## Coding Standards

### TypeScript

- Use strict TypeScript — no `any` types unless absolutely necessary
- Define interfaces and types in `shared/` when used across client and server
- Use Zod for runtime validation in tRPC procedures

### Frontend (React)

- Use functional components with hooks
- Use `trpc.*.useQuery/useMutation` for all data fetching — no raw fetch/axios
- Follow the cyberpunk dark theme with OKLCH color values
- Ensure all new pages are responsive (mobile-first)
- Use shadcn/ui components from `@/components/ui/*`
- Add Framer Motion animations for new UI sections

### Backend (tRPC)

- Define procedures in `server/routers.ts` (or split into `server/routers/` for large features)
- Add database helpers in `server/db.ts`
- Use `protectedProcedure` for authenticated routes
- Validate all inputs with Zod schemas

### Database

- Update `drizzle/schema.ts` for schema changes
- Generate migrations with `pnpm drizzle-kit generate`
- Never store file bytes in the database — use S3 storage

### Smart Contract

- Follow Solidity best practices and the ERC-8183 specification
- Include NatSpec documentation for all public functions
- Write comprehensive tests before submitting contract changes

---

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**

| Type | Description |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Code style changes (formatting, etc.) |
| `refactor` | Code refactoring |
| `test` | Adding or updating tests |
| `chore` | Build process or tooling changes |
| `contract` | Smart contract changes |

**Examples:**

```bash
feat(dashboard): add job search and filter by wallet address
fix(notifications): prevent dropdown from overflowing on mobile
docs(readme): add deployment guide for Sepolia testnet
contract(escrow): add dispute resolution mechanism
```

---

## Pull Request Guidelines

- **One feature per PR** — Keep PRs focused and small
- **Update tests** — All new features must have corresponding tests
- **Update documentation** — Update README or Docs page if needed
- **No breaking changes** without prior discussion in an issue
- **Pass CI checks** — TypeScript must compile cleanly and all tests must pass

### PR Title Format

Follow the same Conventional Commits format:
```
feat(blog): add markdown editor for post creation
```

---

## Areas Where Help is Needed

We especially welcome contributions in these areas:

- **On-chain integration** — Connecting UI actions to actual smart contract transactions via wagmi `useWriteContract`
- **Multi-chain support** — Adding Base, Arbitrum, and Optimism network configurations
- **Reputation system** — Designing and implementing provider/evaluator reputation scores
- **SDK development** — Building a TypeScript SDK for AI agent integration
- **Smart contract auditing** — Security review of the ERC-8183 contract implementation
- **Translations** — Internationalizing the UI for non-English speakers

---

## Questions?

- Open a [GitHub Discussion](https://github.com/AgentEscrow8183/agentescrow-erc8183/discussions)
- Follow us on [X @_agentescrow](https://x.com/_agentescrow)
- Visit [escrowagent.vip](https://escrowagent.vip)

Thank you for contributing to the future of AI agent commerce!
