# AgentEscrow ERC-8183 — TODO

- [x] Basic homepage layout dengan tema Glassmorphism Cosmic
- [x] Navbar dengan social links (X + GitHub)
- [x] HeroSection dengan cosmic background
- [x] OverviewSection
- [x] HowItWorksSection
- [x] StateMachineSection
- [x] RolesSection
- [x] ExtensionsSection
- [x] SpecificationSection
- [x] Footer
- [x] Logo baru (hexagonal AE dengan circuit board)
- [x] Responsivitas mobile dasar
- [x] Fitur Chat AI (floating widget + tRPC backend)
- [x] Logo v3 premium diintegrasikan ke seluruh website
- [x] Responsivitas menyeluruh diperbaiki (HP + PC)
- [x] Navbar mobile hamburger menu diperbaiki
- [x] Semua section responsif di layar kecil (320px - 768px)
- [x] Semua fitur diaktifkan dan berfungsi
- [x] Smooth scroll antar section
- [x] Animasi dan transisi dioptimalkan
- [x] Logo icon v4 (Mandala Blockchain) diintegrasikan ke seluruh website

## Fitur Web3 On-Chain

- [x] Install wagmi, viem, rainbowkit untuk Web3 integration
- [x] Setup WagmiProvider dan RainbowKit di App.tsx
- [x] Komponen ConnectWallet button di Navbar
- [x] Halaman Register/Profile pengguna (nama, role: Client/Provider/Evaluator)
- [x] Simpan profil user ke database setelah connect wallet
- [x] Halaman Dashboard: daftar jobs milik user
- [x] Fitur Create Job (on-chain: createJob dengan token, amount, evaluator)
- [x] Fitur Fund Job (on-chain: fundJob dengan ERC-20 approve + transfer)
- [x] Fitur Submit Work (on-chain: submitWork dengan deliverable hash)
- [x] Fitur Complete Job / Reject Job (on-chain: untuk evaluator)
- [x] Fitur Claim Payment (on-chain: untuk provider setelah completed)
- [x] Tampilan Job Detail dengan state machine visual
- [x] Notifikasi event on-chain (job state changes)

## Fitur Lanjutan

- [x] Smart contract ERC-8183 Solidity lengkap + halaman Contract Explorer
- [x] Notifikasi real-time polling untuk update status job otomatis
- [x] Panduan deploy dan tombol Publish website

## Real On-Chain & Register

- [ ] Audit semua file Web3 (web3.ts, JobDetail, Dashboard, Register)
- [ ] Implementasi writeContract real untuk createJob, fund (ERC-20 approve+transfer), submit, complete, reject, claimRefund
- [ ] Register user menyimpan ke database (wallet_profiles table)
- [ ] Alur register: connect wallet → isi form → simpan → redirect dashboard
- [ ] Dashboard menampilkan profil user dari database
- [ ] Job Detail menampilkan state real dari blockchain (jika contract deployed)
- [ ] Fallback graceful jika contract belum deploy (mode testnet/demo dengan pesan jelas)

## GitHub Repository Enhancements

- [x] GitHub Actions CI workflow (pnpm test on push/PR)
- [x] GitHub Release v0.1.0 dengan changelog
- [x] Issue templates (bug report, feature request)
- [x] Pull request template
- [x] Codeowners file

## Deploy & Repo Link

- [x] Link repo GitHub agentescrow-erc8183 ditambahkan ke Navbar
- [x] Link repo ditambahkan ke HeroSection CTA buttons
- [x] Link repo ditambahkan ke Footer
- [x] Link repo ditambahkan ke Contract Explorer
- [x] Checkpoint final untuk deploy

## Update Domain GitHub

- [x] Update README.md: ganti agentescrow-erc8183.manus.space → agentescrow.vip
- [x] Update homepage URL di GitHub repo settings → agentescrow.vip
