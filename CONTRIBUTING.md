# Contributing to AgentEscrow ERC-8183

Thank you for your interest in contributing to AgentEscrow! This document provides guidelines for contributing to the project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## How to Contribute

### Reporting Bugs

1. Check if the issue already exists in [GitHub Issues](https://github.com/AgentEscrow8183/agentescrow-erc8183/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable

### Suggesting Features

1. Open a [GitHub Discussion](https://github.com/AgentEscrow8183/agentescrow-erc8183/discussions)
2. Describe the feature and its use case
3. Discuss with the community before implementing

### Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes following the code style guidelines
4. Write or update tests as needed
5. Run `pnpm test` to ensure all tests pass
6. Commit with a descriptive message: `git commit -m 'feat: add amazing feature'`
7. Push to your fork: `git push origin feature/your-feature-name`
8. Open a Pull Request against the `main` branch

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/agentescrow-erc8183.git
cd agentescrow-erc8183

# Install dependencies
pnpm install

# Set up environment (copy and configure)
# See README.md for required environment variables

# Push database schema
pnpm db:push

# Start development server
pnpm dev
```

## Code Style Guidelines

- Use **TypeScript** for all new code
- Follow existing naming conventions (camelCase for variables, PascalCase for components)
- Use **Tailwind CSS** for styling — avoid inline styles unless necessary
- Write **tRPC procedures** for all backend API endpoints
- Add **Vitest** unit tests for new server-side procedures

## Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: resolve bug
docs: update documentation
style: formatting changes
refactor: code restructuring
test: add or update tests
chore: maintenance tasks
```

## Smart Contract Contributions

For Solidity contract changes:
- Follow [Solidity style guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- Write Foundry tests for all new functions
- Ensure compatibility with ERC-8183 specification
- Document all public functions with NatSpec comments

## Questions?

- Join the discussion on [Ethereum Magicians](https://ethereum-magicians.org/t/erc-8183-agentic-commerce/27902)
- Follow [@_agentescrow](https://x.com/_agentescrow) on X for updates
- Open a [GitHub Discussion](https://github.com/AgentEscrow8183/agentescrow-erc8183/discussions)
