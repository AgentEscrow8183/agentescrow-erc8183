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

## Phase 7: Responsive + Gambar + Fitur Tambahan
- [x] Upload 3 gambar ke CDN (logo, roles, state machine)
- [x] Pasang logo bulat (IMG_6615) di Navbar menggantikan icon default
- [x] Pasang gambar 3 roles (IMG_6616) di section Roles landing page
- [x] Pasang gambar state machine (IMG_6617) di section state machine landing page
- [x] Perbaiki responsive Navbar (hamburger menu untuk mobile)
- [x] Perbaiki responsive Landing page (hero, sections)
- [x] Perbaiki responsive Dashboard (tabel scroll horizontal di mobile)
- [x] Perbaiki responsive Job Detail page
- [x] Tambah halaman Analytics/Stats (total jobs, TVL, top providers, leaderboard)
- [x] Tambah fitur search/filter di Dashboard
- [x] Perbaiki footer responsive
- [x] Perbaiki AIChatWidget dan NotificationBell responsive di mobile

## Phase 8: Social Links
- [x] Tambah link X (@_agentescrow) dan GitHub (AgentEscrow8183) di Navbar
- [x] Tambah link X dan GitHub di Footer (Home.tsx)
- [x] Tambah link X dan GitHub di Contract Explorer page

## Phase 9: SEO & Meta Tags
- [x] Tambah Open Graph meta tags (og:title, og:description, og:image, og:url)
- [x] Tambah Twitter Card meta tags
- [x] Tambah favicon, canonical URL, dan meta description
- [x] Tambah Google Fonts (Orbitron + Share Tech Mono)

## Phase 10: Canonical URL + Whitepaper/Docs
- [x] Update canonical URL ke https://escrowagent.vip di index.html
- [x] Update og:url dan twitter:url ke escrowagent.vip
- [x] Buat halaman Docs/Whitepaper dengan spesifikasi teknis ERC-8183
- [x] Tambahkan route /docs ke App.tsx
- [x] Tambahkan link Docs di Navbar

## Phase 11: Blog + URL Fix
- [x] Ganti semua agentescrow.vip → escrowagent.vip di seluruh codebase
- [x] Buat tabel blog_posts di database schema
- [x] Buat tRPC router untuk blog (list, getBySlug, create admin)
- [x] Buat halaman /blog dengan daftar post dan filter kategori
- [x] Buat halaman /blog/:slug untuk detail post
- [x] Tambah link Blog di Navbar
- [x] Seed beberapa post awal (Protocol Update, Roadmap, Announcement)

## Phase 12: GitHub Topics + Release Link + Blog Post
- [x] Tambahkan GitHub Topics (ethereum, erc-8183, escrow, web3, ai-agent, defi, solidity, typescript, react, trpc)
- [x] Tambahkan link GitHub Release v1.0.0 di halaman Docs
- [x] Tambahkan link GitHub Release v1.0.0 di halaman Contract Explorer
- [x] Seed 3 blog posts: Launch Announcement, Roadmap 2026, Protocol Deep Dive
