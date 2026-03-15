import { motion } from "framer-motion";
import { ArrowRight, Shield, Zap, Bot, Code2, ChevronRight, ExternalLink, Github, BarChart2 } from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import AIChatWidget from "@/components/AIChatWidget";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663367353410/AiMHYdbcTQcw9MdrNdMT2X/logo-agentescrow_432019ee.jpeg";
const ROLES_IMG_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663367353410/AiMHYdbcTQcw9MdrNdMT2X/roles-illustration_38c6a0eb.webp";
const STATE_MACHINE_IMG_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663367353410/AiMHYdbcTQcw9MdrNdMT2X/state-machine_b6b16ba3.webp";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1 },
  }),
};

const features = [
  {
    icon: Shield,
    title: "Trustless Escrow",
    desc: "Funds locked in smart contract until work is verified by evaluator attestation.",
    color: "oklch(0.72 0.22 195)",
  },
  {
    icon: Bot,
    title: "AI Agent Commerce",
    desc: "Autonomous agents create, fund, execute, and evaluate work agreements on-chain.",
    color: "oklch(0.68 0.28 295)",
  },
  {
    icon: Zap,
    title: "State Machine",
    desc: "Deterministic lifecycle: Open → Funded → Submitted → Completed/Rejected.",
    color: "oklch(0.75 0.22 55)",
  },
  {
    icon: Code2,
    title: "ERC-20 Support",
    desc: "Any ERC-20 token as payment. Hooks extension for custom business logic.",
    color: "oklch(0.78 0.22 145)",
  },
];

const roles = [
  {
    role: "Client",
    emoji: "💼",
    desc: "Creates and funds the job escrow. Defines the work requirements, selects a provider and evaluator, and deposits payment into the smart contract.",
    color: "oklch(0.72 0.22 195)",
  },
  {
    role: "Provider",
    emoji: "⚙️",
    desc: "Executes the work and submits deliverables. Receives payment once the evaluator confirms the work meets requirements.",
    color: "oklch(0.68 0.28 295)",
  },
  {
    role: "Evaluator",
    emoji: "🔍",
    desc: "Attests to quality and releases or rejects payment. Acts as a trusted third party to ensure fair outcomes for both client and provider.",
    color: "oklch(0.78 0.22 145)",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0 bg-grid opacity-30" />
        {/* Radial gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(0.72_0.22_195/0.12),transparent)]" />
        {/* Animated orbs */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-64 md:w-96 h-64 md:h-96 rounded-full bg-[oklch(0.72_0.22_195/0.05)] blur-3xl pointer-events-none"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-1/4 right-1/4 w-64 md:w-96 h-64 md:h-96 rounded-full bg-[oklch(0.68_0.28_295/0.05)] blur-3xl pointer-events-none"
        />

        <div className="container relative z-10 py-16 md:py-20 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            {/* Logo image */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0} className="flex justify-center mb-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-[oklch(0.78_0.22_195/0.5)] glow-cyan">
                <img src={LOGO_URL} alt="AgentEscrow" className="w-full h-full object-cover" />
              </div>
            </motion.div>

            {/* Badge */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1}>
              <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full border border-[oklch(0.78_0.22_195/0.3)] bg-[oklch(0.78_0.22_195/0.08)] text-[oklch(0.78_0.22_195)] text-[10px] sm:text-xs font-mono tracking-widest mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-[oklch(0.78_0.22_195)] animate-pulse" />
                ERC-8183 DRAFT · SEPOLIA TESTNET
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={2}
              className="text-4xl sm:text-5xl md:text-7xl font-['Orbitron'] font-black tracking-tight mb-4 sm:mb-6 leading-tight"
            >
              <span className="text-[oklch(0.92_0.02_200)]">AGENT</span>
              <br />
              <span className="gradient-text">ESCROW</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={3}
              className="text-base sm:text-lg md:text-xl text-[oklch(0.55_0.04_220)] max-w-2xl mx-auto mb-3 leading-relaxed px-2"
            >
              The open, permissionless standard for{" "}
              <span className="text-[oklch(0.78_0.22_195)]">AI agent commerce</span>.
              Trustless escrow with evaluator attestation — programmed directly into Ethereum smart contracts.
            </motion.p>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={4}
              className="text-xs sm:text-sm font-mono text-[oklch(0.55_0.04_220)] mb-8 sm:mb-10"
            >
              ERC-8183 · Solidity ^0.8.20 · wagmi v2 · React 19
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={5}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0"
            >
              <Link href="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-3 bg-[oklch(0.72_0.22_195)] text-[oklch(0.07_0.015_260)] font-['Orbitron'] font-bold text-sm tracking-wider rounded glow-cyan hover:bg-[oklch(0.78_0.22_195)] transition-all"
                >
                  LAUNCH APP <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
              <Link href="/contract">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-3 border border-[oklch(0.78_0.22_195/0.4)] text-[oklch(0.78_0.22_195)] font-['Orbitron'] font-bold text-sm tracking-wider rounded hover:bg-[oklch(0.78_0.22_195/0.08)] transition-all"
                >
                  CONTRACT <Code2 className="w-4 h-4" />
                </motion.button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={6}
              className="grid grid-cols-3 gap-4 sm:gap-6 mt-12 sm:mt-16 max-w-sm sm:max-w-lg mx-auto"
            >
              {[
                { val: "ERC-8183", label: "Standard" },
                { val: "3", label: "Roles" },
                { val: "7", label: "States" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-lg sm:text-2xl font-['Orbitron'] font-bold text-[oklch(0.78_0.22_195)] text-glow-cyan">
                    {stat.val}
                  </div>
                  <div className="text-[10px] sm:text-xs text-[oklch(0.55_0.04_220)] font-mono mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[oklch(0.55_0.04_220)]"
        >
          <span className="text-[10px] font-mono tracking-widest">SCROLL</span>
          <ChevronRight className="w-4 h-4 rotate-90" />
        </motion.div>
      </section>

      {/* ── Roles Section ─────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 relative overflow-hidden">
        <div className="container px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-['Orbitron'] font-bold text-[oklch(0.92_0.02_200)] mb-4">
              THREE ROLES. ONE PROTOCOL.
            </h2>
            <p className="text-sm sm:text-base text-[oklch(0.55_0.04_220)] max-w-xl mx-auto">
              Every job escrow involves three distinct participants, each with defined responsibilities.
            </p>
          </motion.div>

          {/* Illustration image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mb-10 sm:mb-14 rounded-xl overflow-hidden border border-[oklch(0.78_0.22_195/0.2)] max-w-4xl mx-auto"
          >
            <img
              src={ROLES_IMG_URL}
              alt="Client, Provider, Evaluator roles in AgentEscrow protocol"
              className="w-full h-auto object-cover"
              loading="lazy"
            />
          </motion.div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {roles.map((r, i) => (
              <motion.div
                key={r.role}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ y: -4 }}
                className="cyber-card rounded-xl p-5 sm:p-6"
              >
                <div
                  className="text-3xl sm:text-4xl mb-3 sm:mb-4"
                  style={{ filter: `drop-shadow(0 0 12px ${r.color})` }}
                >
                  {r.emoji}
                </div>
                <h3
                  className="text-base sm:text-lg font-['Orbitron'] font-bold mb-2"
                  style={{ color: r.color }}
                >
                  {r.role}
                </h3>
                <p className="text-xs sm:text-sm text-[oklch(0.55_0.04_220)] leading-relaxed">{r.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── State Machine Section ─────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[oklch(0.09_0.02_260)]" />
        <div className="container relative z-10 px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-14"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-['Orbitron'] font-bold text-[oklch(0.92_0.02_200)] mb-4">
              JOB STATE MACHINE
            </h2>
            <p className="text-sm sm:text-base text-[oklch(0.55_0.04_220)] max-w-xl mx-auto">
              Every job follows a deterministic lifecycle enforced by the smart contract.
            </p>
          </motion.div>

          {/* State machine image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-xl overflow-hidden border border-[oklch(0.78_0.22_195/0.2)] max-w-4xl mx-auto mb-8"
          >
            <img
              src={STATE_MACHINE_IMG_URL}
              alt="ERC-8183 Job State Machine: OPEN → FUNDED → SUBMITTED → COMPLETED/REJECTED"
              className="w-full h-auto object-cover"
              loading="lazy"
            />
          </motion.div>

          {/* State labels */}
          <div className="max-w-4xl mx-auto">
            <div className="cyber-card rounded-xl p-4 sm:p-6">
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-4">
                {[
                  { label: "OPEN", color: "oklch(0.82 0.05 200)", fn: "createJob()" },
                  { label: "FUNDED", color: "oklch(0.72 0.22 195)", fn: "fundJob()" },
                  { label: "SUBMITTED", color: "oklch(0.75 0.22 55)", fn: "submitWork()" },
                  { label: "COMPLETED", color: "oklch(0.78 0.22 145)", fn: "completeJob()" },
                  { label: "REJECTED", color: "oklch(0.62 0.25 25)", fn: "rejectJob()" },
                ].map((s) => (
                  <div key={s.label} className="flex flex-col items-center gap-1">
                    <span
                      className="px-3 py-1 rounded-full text-[10px] sm:text-xs font-['Orbitron'] font-bold border"
                      style={{ color: s.color, borderColor: `${s.color}60`, background: `${s.color}15` }}
                    >
                      {s.label}
                    </span>
                    <span className="text-[9px] font-mono text-[oklch(0.55_0.04_220)]">{s.fn}</span>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-[oklch(0.78_0.22_195/0.1)] flex flex-wrap justify-center gap-2">
                {["EXPIRED", "CANCELLED"].map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1 text-[10px] font-mono border border-[oklch(0.55_0.04_220/0.3)] text-[oklch(0.55_0.04_220)] rounded"
                  >
                    {s}
                  </span>
                ))}
                <span className="text-[10px] text-[oklch(0.55_0.04_220)] self-center">← additional terminal states</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Section ──────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24">
        <div className="container px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-['Orbitron'] font-bold text-[oklch(0.92_0.02_200)] mb-4">
              PROTOCOL FEATURES
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="cyber-card rounded-xl p-5 sm:p-6"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                  style={{ background: `${f.color}22`, border: `1px solid ${f.color}44` }}
                >
                  <f.icon className="w-5 h-5" style={{ color: f.color }} />
                </div>
                <h3 className="font-['Orbitron'] font-bold text-sm text-[oklch(0.92_0.02_200)] mb-2">
                  {f.title}
                </h3>
                <p className="text-xs text-[oklch(0.55_0.04_220)] leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Smart Contract Interface ──────────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-[oklch(0.09_0.02_260)]">
        <div className="container px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl sm:text-3xl font-['Orbitron'] font-bold text-[oklch(0.92_0.02_200)] mb-4">
                SMART CONTRACT INTERFACE
              </h2>
              <p className="text-sm sm:text-base text-[oklch(0.55_0.04_220)] mb-6 leading-relaxed">
                The ERC-8183 interface defines a standard set of functions for trustless job escrow.
                Deploy on any EVM-compatible chain.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/contract">
                  <button className="flex items-center gap-2 text-sm text-[oklch(0.78_0.22_195)] hover:text-[oklch(0.92_0.02_200)] transition-colors">
                    View Contract Explorer <ExternalLink className="w-3 h-3" />
                  </button>
                </Link>
                <a
                  href="https://github.com/AgentEscrow8183/agentescrow-erc8183"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-[oklch(0.55_0.04_220)] hover:text-[oklch(0.92_0.02_200)] transition-colors"
                >
                  GitHub <Github className="w-3 h-3" />
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="cyber-card rounded-xl overflow-hidden"
            >
              <div className="flex items-center gap-2 px-4 py-2 border-b border-[oklch(0.78_0.22_195/0.15)] bg-[oklch(0.09_0.02_260)]">
                <div className="w-2 h-2 rounded-full bg-[oklch(0.62_0.25_25)]" />
                <div className="w-2 h-2 rounded-full bg-[oklch(0.75_0.22_55)]" />
                <div className="w-2 h-2 rounded-full bg-[oklch(0.78_0.22_145)]" />
                <span className="text-xs font-mono text-[oklch(0.55_0.04_220)] ml-2">IERC8183.sol</span>
              </div>
              <pre className="p-4 text-[10px] sm:text-xs font-mono text-[oklch(0.82_0.05_200)] overflow-x-auto leading-relaxed">
{`interface IERC8183 {
  function createJob(
    address provider,
    address evaluator,
    address token,
    uint256 amount,
    uint256 expiry
  ) external returns (uint256 jobId);

  function fundJob(uint256 jobId) external;
  function submitWork(
    uint256 jobId,
    bytes32 deliverableHash
  ) external;
  function completeJob(uint256 jobId) external;
  function rejectJob(uint256 jobId) external;
  function claimPayment(uint256 jobId) external;
  function cancelJob(uint256 jobId) external;
}`}
              </pre>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Analytics CTA ─────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 border-t border-[oklch(0.78_0.22_195/0.1)]">
        <div className="container px-4 sm:px-6">
          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
            {[
              { icon: BarChart2, label: "View Analytics", desc: "Protocol stats & leaderboard", href: "/analytics", color: "oklch(0.72 0.22 195)" },
              { icon: Code2, label: "Contract Explorer", desc: "ABI viewer & deploy guide", href: "/contract", color: "oklch(0.68 0.28 295)" },
              { icon: Zap, label: "Start Building", desc: "Create your first job escrow", href: "/dashboard", color: "oklch(0.78 0.22 145)" },
            ].map((item) => (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ y: -3, scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="cyber-card rounded-xl p-5 sm:p-6 cursor-pointer group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ background: `${item.color}20`, border: `1px solid ${item.color}40` }}
                    >
                      <item.icon className="w-4 h-4" style={{ color: item.color }} />
                    </div>
                    <span className="font-['Orbitron'] font-bold text-sm text-[oklch(0.92_0.02_200)] group-hover:text-[oklch(0.78_0.22_195)] transition-colors">
                      {item.label}
                    </span>
                  </div>
                  <p className="text-xs text-[oklch(0.55_0.04_220)]">{item.desc}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ───────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,oklch(0.72_0.22_195/0.08),transparent)]" />
        <div className="container relative z-10 text-center px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-['Orbitron'] font-black text-[oklch(0.92_0.02_200)] mb-4 sm:mb-6">
              START BUILDING WITH<br />
              <span className="gradient-text">ERC-8183</span>
            </h2>
            <p className="text-sm sm:text-base text-[oklch(0.55_0.04_220)] max-w-lg mx-auto mb-8 sm:mb-10">
              Connect your wallet, create your first job escrow, and experience the future of AI agent commerce.
            </p>
            <Link href="/dashboard">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 sm:px-10 py-3 sm:py-4 bg-[oklch(0.72_0.22_195)] text-[oklch(0.07_0.015_260)] font-['Orbitron'] font-bold text-sm tracking-wider rounded glow-cyan hover:bg-[oklch(0.78_0.22_195)] transition-all"
              >
                OPEN DASHBOARD
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-[oklch(0.78_0.22_195/0.1)] py-6 sm:py-8">
        <div className="container px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full overflow-hidden border border-[oklch(0.78_0.22_195/0.4)]">
              <img src={LOGO_URL} alt="AgentEscrow" className="w-full h-full object-cover" />
            </div>
            <span className="font-['Orbitron'] text-xs sm:text-sm font-bold text-[oklch(0.55_0.04_220)]">
              AGENTESCROW ERC-8183
            </span>
          </div>
          <p className="text-[10px] sm:text-xs text-[oklch(0.55_0.04_220)] font-mono text-center">
            Built for the Ethereum ecosystem · ERC-8183 Draft · 2026
          </p>
          <div className="flex items-center gap-4 text-xs text-[oklch(0.55_0.04_220)]">
            <a href="https://github.com/AgentEscrow8183/agentescrow-erc8183" target="_blank" rel="noopener noreferrer" className="hover:text-[oklch(0.78_0.22_195)] transition-colors">GitHub</a>
            <a href="https://eips.ethereum.org/EIPS/eip-8183" target="_blank" rel="noopener noreferrer" className="hover:text-[oklch(0.78_0.22_195)] transition-colors">EIP-8183</a>
          </div>
        </div>
      </footer>

      {/* AI Chat Widget */}
      <AIChatWidget />
    </div>
  );
}
