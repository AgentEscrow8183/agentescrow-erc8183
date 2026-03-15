# AgentEscrow ERC-8183 — Project TODO

## Phase 1: Setup & Schema
- [x] Database schema: jobs, wallet_profiles, job_notifications, chat_messages tables
- [x] Install wagmi, viem, @rainbow-me/rainbowkit, framer-motion
- [x] Run DB migration

## Phase 2: Backend (tRPC Routers)
- [x] Jobs router: create, list, getById, getHistory, updateState
- [x] Wallet profiles router: register, getProfile, getMyProfile
- [x] AI chat router: send (LLM integration), history
- [x] Notifications router: list, markRead
- [x] Vitest tests for all routers (19 tests passing)

## Phase 3: Frontend Core
- [x] Global cyberpunk styling (dark bg, neon accents, Orbitron + Share Tech Mono fonts)
- [x] Navbar with wallet connect button and notification bell
- [x] Landing page: Hero section with animated title and CTAs
- [x] Landing page: Features overview section (4 feature cards)
- [x] Landing page: State machine visualization (interactive bubbles)
- [x] Landing page: Smart contract interface code preview
- [x] Landing page: Three roles section (Client, Provider, Evaluator)
- [x] Footer with links

## Phase 4: Feature Pages
- [x] Dashboard page: job list table with filters (role, status)
- [x] Dashboard page: Create Job modal/form
- [x] Job Detail page: full job info, deliverable hash, action buttons
- [x] Register page: wallet profile form (name, role preference, bio)
- [x] Contract Explorer page: contract address, ABI viewer, deploy guide

## Phase 5: Web3 & Widgets
- [x] Web3 wallet integration (wagmi + RainbowKit) with cyberpunk theme
- [x] AI Chat widget (floating, collapsible, LLM-powered AgentBot)
- [x] Notification bell with dropdown (polling every 15s)
- [x] State transition validation in backend

## Phase 6: Polish & Testing
- [x] Framer Motion animations on all pages (hero, cards, modals)
- [x] Responsive design (mobile-first with Tailwind)
- [x] Error handling and loading states
- [x] Final vitest tests (19/19 passing)
- [x] Checkpoint saved
