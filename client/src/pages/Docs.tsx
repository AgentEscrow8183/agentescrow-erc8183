import { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen, Code2, Zap, Shield, Bot, FileText, ChevronRight,
  Copy, CheckCheck, ExternalLink, Layers, GitBranch, Terminal,
  AlertTriangle, CheckCircle2, ArrowRight, Hash, Globe
} from "lucide-react";
import Navbar from "@/components/Navbar";
import AIChatWidget from "@/components/AIChatWidget";
import { toast } from "sonner";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08 },
  }),
};

const sections = [
  { id: "overview", label: "Overview", icon: BookOpen },
  { id: "motivation", label: "Motivation", icon: Zap },
  { id: "specification", label: "Specification", icon: FileText },
  { id: "state-machine", label: "State Machine", icon: GitBranch },
  { id: "roles", label: "Roles & Actors", icon: Bot },
  { id: "interface", label: "Interface (ABI)", icon: Code2 },
  { id: "events", label: "Events", icon: Hash },
  { id: "security", label: "Security", icon: Shield },
  { id: "use-cases", label: "Use Cases", icon: Layers },
  { id: "integration", label: "Integration Guide", icon: Terminal },
  { id: "reference", label: "Reference", icon: Globe },
];

const CODE_INTERFACE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title IERC8183 — AI Agent Commerce Escrow Standard
/// @notice Trustless escrow with evaluator attestation for AI agent workflows
interface IERC8183 {
    // ── Enums ──────────────────────────────────────────────────────────
    enum JobStatus { OPEN, FUNDED, SUBMITTED, COMPLETED, REJECTED }

    // ── Structs ────────────────────────────────────────────────────────
    struct Job {
        uint256 jobId;
        address client;
        address provider;
        address evaluator;
        address token;        // ERC-20 token address (address(0) = ETH)
        uint256 amount;
        JobStatus status;
        bytes32 deliverableHash; // keccak256 of submitted work
        uint256 expiry;          // Unix timestamp
        uint256 createdAt;
    }

    // ── Core Functions ─────────────────────────────────────────────────
    function createJob(
        address provider,
        address evaluator,
        address token,
        uint256 amount,
        uint256 expiry
    ) external returns (uint256 jobId);

    function fundJob(uint256 jobId) external payable;

    function submitWork(
        uint256 jobId,
        bytes32 deliverableHash
    ) external;

    function completeJob(uint256 jobId) external;

    function rejectJob(uint256 jobId) external;

    function expireJob(uint256 jobId) external;

    function getJob(uint256 jobId) external view returns (Job memory);

    // ── Events ─────────────────────────────────────────────────────────
    event JobCreated(uint256 indexed jobId, address indexed client,
                     address indexed provider, address evaluator,
                     address token, uint256 amount, uint256 expiry);
    event JobFunded(uint256 indexed jobId, uint256 amount);
    event WorkSubmitted(uint256 indexed jobId, bytes32 deliverableHash);
    event JobCompleted(uint256 indexed jobId, address provider,
                       uint256 amount);
    event JobRejected(uint256 indexed jobId, address evaluator);
    event JobExpired(uint256 indexed jobId, address client,
                     uint256 refundAmount);
}`;

const CODE_DEPLOY = `// Deploy with Hardhat / Foundry
// 1. Install dependencies
npm install --save-dev hardhat @openzeppelin/contracts

// 2. Compile
npx hardhat compile

// 3. Deploy to Sepolia testnet
npx hardhat run scripts/deploy.js --network sepolia

// foundry alternative:
forge create --rpc-url $SEPOLIA_RPC \\
  --private-key $PRIVATE_KEY \\
  src/AgentEscrow8183.sol:AgentEscrow8183`;

const CODE_INTEGRATION = `import { createPublicClient, createWalletClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { ESCROW_ABI } from './abi';

const CONTRACT = '0xYourDeployedContractAddress';

// 1. Create a job (client side)
const jobId = await walletClient.writeContract({
  address: CONTRACT,
  abi: ESCROW_ABI,
  functionName: 'createJob',
  args: [
    providerAddress,   // address provider
    evaluatorAddress,  // address evaluator
    tokenAddress,      // address(0) for ETH
    parseEther('1.0'), // uint256 amount
    BigInt(Math.floor(Date.now() / 1000) + 86400 * 7), // 7 days expiry
  ],
});

// 2. Fund the job (client sends ETH)
await walletClient.writeContract({
  address: CONTRACT,
  abi: ESCROW_ABI,
  functionName: 'fundJob',
  args: [jobId],
  value: parseEther('1.0'),
});

// 3. Provider submits work
const deliverableHash = keccak256(toHex('ipfs://QmYourDeliverable'));
await walletClient.writeContract({
  address: CONTRACT,
  abi: ESCROW_ABI,
  functionName: 'submitWork',
  args: [jobId, deliverableHash],
});

// 4. Evaluator approves → funds released to provider
await walletClient.writeContract({
  address: CONTRACT,
  abi: ESCROW_ABI,
  functionName: 'completeJob',
  args: [jobId],
});`;

const CODE_AGENT = `// AI Agent integration example (TypeScript)
import OpenAI from 'openai';

const tools = [
  {
    type: 'function',
    function: {
      name: 'create_escrow_job',
      description: 'Create a new escrow job on ERC-8183 protocol',
      parameters: {
        type: 'object',
        properties: {
          provider: { type: 'string', description: 'Provider wallet address' },
          evaluator: { type: 'string', description: 'Evaluator wallet address' },
          amount: { type: 'string', description: 'Payment amount in ETH' },
          description: { type: 'string', description: 'Job description' },
        },
        required: ['provider', 'evaluator', 'amount'],
      },
    },
  },
];

// Agent autonomously creates and manages escrow jobs
const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Hire an AI agent to write a smart contract audit report' }],
  tools,
  tool_choice: 'auto',
});`;

function CodeBlock({ code, lang = "solidity" }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group rounded-xl overflow-hidden border border-[oklch(0.78_0.22_195/0.15)] bg-[oklch(0.06_0.01_260)]">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[oklch(0.78_0.22_195/0.1)] bg-[oklch(0.08_0.015_260)]">
        <span className="text-[10px] font-mono text-[oklch(0.55_0.04_220)] uppercase tracking-widest">{lang}</span>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 text-[10px] text-[oklch(0.55_0.04_220)] hover:text-[oklch(0.78_0.22_195)] transition-colors"
        >
          {copied ? <CheckCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="p-4 text-xs font-mono text-[oklch(0.82_0.04_200)] overflow-x-auto leading-relaxed whitespace-pre">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function SectionAnchor({ id }: { id: string }) {
  return <div id={id} className="scroll-mt-20" />;
}

export default function Docs() {
  const [activeSection, setActiveSection] = useState("overview");

  const scrollTo = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-[oklch(0.07_0.015_260)] text-[oklch(0.92_0.02_200)]">
      <Navbar />

      <div className="container px-4 sm:px-6 pt-24 pb-16">
        {/* Header */}
        <motion.div
          initial="hidden" animate="visible" variants={fadeUp}
          className="mb-10 sm:mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[oklch(0.78_0.22_195/0.3)] bg-[oklch(0.78_0.22_195/0.06)] mb-4">
            <BookOpen className="w-3.5 h-3.5 text-[oklch(0.78_0.22_195)]" />
            <span className="text-xs font-mono text-[oklch(0.78_0.22_195)] uppercase tracking-widest">ERC-8183 Draft Specification</span>
          </div>
          <h1 className="font-['Orbitron'] text-3xl sm:text-4xl lg:text-5xl font-black mb-4">
            <span className="text-[oklch(0.92_0.02_200)]">AGENT</span>
            <span className="bg-gradient-to-r from-[oklch(0.72_0.22_195)] to-[oklch(0.65_0.28_290)] bg-clip-text text-transparent">ESCROW</span>
            <br />
            <span className="text-[oklch(0.55_0.04_220)] text-2xl sm:text-3xl">Whitepaper & Documentation</span>
          </h1>
          <p className="text-sm sm:text-base text-[oklch(0.65_0.04_220)] max-w-2xl leading-relaxed">
            A comprehensive specification for the ERC-8183 AI Agent Commerce Protocol — enabling trustless, programmable escrow between autonomous AI agents on Ethereum.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar TOC */}
          <aside className="lg:w-56 xl:w-64 shrink-0">
            <div className="lg:sticky lg:top-24">
              <p className="text-[10px] font-mono text-[oklch(0.45_0.03_220)] uppercase tracking-widest mb-3 px-2">Contents</p>
              <nav className="flex flex-col gap-0.5">
                {sections.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => scrollTo(s.id)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-all ${
                      activeSection === s.id
                        ? "text-[oklch(0.78_0.22_195)] bg-[oklch(0.78_0.22_195/0.1)] border border-[oklch(0.78_0.22_195/0.2)]"
                        : "text-[oklch(0.55_0.04_220)] hover:text-[oklch(0.82_0.04_200)] hover:bg-[oklch(0.78_0.22_195/0.04)]"
                    }`}
                  >
                    <s.icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{s.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0 space-y-14">

            {/* Overview */}
            <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <SectionAnchor id="overview" />
              <h2 className="font-['Orbitron'] text-xl sm:text-2xl font-bold text-[oklch(0.78_0.22_195)] mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5" /> Overview
              </h2>
              <div className="prose-custom space-y-4 text-sm sm:text-base text-[oklch(0.72_0.04_220)] leading-relaxed">
                <p>
                  <strong className="text-[oklch(0.88_0.04_200)]">ERC-8183</strong> is a draft Ethereum Improvement Proposal that defines a standard interface for <strong className="text-[oklch(0.88_0.04_200)]">AI agent commerce escrow</strong>. It enables autonomous agents — and human principals — to create, fund, execute, and evaluate work agreements entirely on-chain, without requiring trust between parties.
                </p>
                <p>
                  The protocol introduces a three-party model: a <strong className="text-[oklch(0.72_0.22_195)]">Client</strong> who funds work, a <strong className="text-[oklch(0.78_0.22_195)]">Provider</strong> who executes it, and an <strong className="text-[oklch(0.65_0.28_290)]">Evaluator</strong> who attests to completion. Funds are locked in a smart contract and released only upon evaluator approval, creating a fully trustless commerce layer for the emerging AI agent economy.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
                  {[
                    { label: "Trustless", desc: "No intermediaries. Funds locked in smart contract.", color: "oklch(0.72_0.22_195)" },
                    { label: "Permissionless", desc: "Any address can participate as any role.", color: "oklch(0.65_0.28_290)" },
                    { label: "Composable", desc: "Integrates with any ERC-20 token or ETH.", color: "oklch(0.72_0.22_130)" },
                  ].map((item) => (
                    <div key={item.label} className="p-4 rounded-xl border border-[oklch(0.2_0.03_260)] bg-[oklch(0.09_0.015_260)]">
                      <div className="text-sm font-bold mb-1" style={{ color: item.color }}>{item.label}</div>
                      <div className="text-xs text-[oklch(0.55_0.04_220)]">{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>

            {/* Motivation */}
            <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <SectionAnchor id="motivation" />
              <h2 className="font-['Orbitron'] text-xl sm:text-2xl font-bold text-[oklch(0.78_0.22_195)] mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5" /> Motivation
              </h2>
              <div className="space-y-4 text-sm sm:text-base text-[oklch(0.72_0.04_220)] leading-relaxed">
                <p>
                  The rapid proliferation of autonomous AI agents capable of executing complex tasks creates an urgent need for a standardized payment and verification layer. Existing payment protocols lack the evaluator attestation mechanism necessary for AI-generated deliverables, where quality verification cannot be automated without a trusted third party.
                </p>
                <p>
                  ERC-8183 addresses this gap by encoding the full job lifecycle — creation, funding, submission, and evaluation — into an immutable state machine on Ethereum. This enables:
                </p>
                <ul className="space-y-2 ml-4">
                  {[
                    "Autonomous agent-to-agent commerce without human intermediaries",
                    "Verifiable deliverable hashes stored on-chain for auditability",
                    "Automatic refund mechanism via expiry timestamps",
                    "Composability with existing DeFi infrastructure (ERC-20 tokens, multisig evaluators)",
                    "A foundation for AI agent reputation and credit scoring systems",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-[oklch(0.72_0.22_195)] mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.section>

            {/* Specification */}
            <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <SectionAnchor id="specification" />
              <h2 className="font-['Orbitron'] text-xl sm:text-2xl font-bold text-[oklch(0.78_0.22_195)] mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" /> Specification
              </h2>
              <div className="space-y-4 text-sm sm:text-base text-[oklch(0.72_0.04_220)] leading-relaxed mb-6">
                <p>
                  The following Solidity interface defines the complete ERC-8183 standard. Conforming implementations MUST implement all functions and emit all events as specified.
                </p>
              </div>
              <CodeBlock code={CODE_INTERFACE} lang="solidity" />
            </motion.section>

            {/* State Machine */}
            <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <SectionAnchor id="state-machine" />
              <h2 className="font-['Orbitron'] text-xl sm:text-2xl font-bold text-[oklch(0.78_0.22_195)] mb-4 flex items-center gap-2">
                <GitBranch className="w-5 h-5" /> State Machine
              </h2>
              <div className="space-y-4 text-sm text-[oklch(0.72_0.04_220)] leading-relaxed mb-6">
                <p>Every job progresses through a deterministic state machine. Transitions are enforced at the contract level — invalid transitions revert.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-[oklch(0.2_0.03_260)]">
                      <th className="text-left py-3 px-4 text-[oklch(0.55_0.04_220)] font-mono text-xs uppercase tracking-wider">From State</th>
                      <th className="text-left py-3 px-4 text-[oklch(0.55_0.04_220)] font-mono text-xs uppercase tracking-wider">To State</th>
                      <th className="text-left py-3 px-4 text-[oklch(0.55_0.04_220)] font-mono text-xs uppercase tracking-wider">Function</th>
                      <th className="text-left py-3 px-4 text-[oklch(0.55_0.04_220)] font-mono text-xs uppercase tracking-wider">Actor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { from: "—", to: "OPEN", fn: "createJob()", actor: "Client", fromColor: "oklch(0.55_0.04_220)", toColor: "oklch(0.72_0.04_220)" },
                      { from: "OPEN", to: "FUNDED", fn: "fundJob()", actor: "Client", fromColor: "oklch(0.72_0.04_220)", toColor: "oklch(0.72_0.22_195)" },
                      { from: "FUNDED", to: "SUBMITTED", fn: "submitWork()", actor: "Provider", fromColor: "oklch(0.72_0.22_195)", toColor: "oklch(0.78_0.22_50)" },
                      { from: "SUBMITTED", to: "COMPLETED", fn: "completeJob()", actor: "Evaluator", fromColor: "oklch(0.78_0.22_50)", toColor: "oklch(0.72_0.22_130)" },
                      { from: "SUBMITTED", to: "REJECTED", fn: "rejectJob()", actor: "Evaluator", fromColor: "oklch(0.78_0.22_50)", toColor: "oklch(0.65_0.22_25)" },
                      { from: "FUNDED / SUBMITTED", to: "OPEN (refund)", fn: "expireJob()", actor: "Anyone", fromColor: "oklch(0.72_0.22_195)", toColor: "oklch(0.72_0.04_220)" },
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-[oklch(0.12_0.02_260)] hover:bg-[oklch(0.09_0.015_260)] transition-colors">
                        <td className="py-3 px-4 font-mono text-xs" style={{ color: row.fromColor }}>{row.from}</td>
                        <td className="py-3 px-4 font-mono text-xs font-bold" style={{ color: row.toColor }}>{row.to}</td>
                        <td className="py-3 px-4 font-mono text-xs text-[oklch(0.65_0.22_195)]">{row.fn}</td>
                        <td className="py-3 px-4 text-xs text-[oklch(0.65_0.04_220)]">{row.actor}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.section>

            {/* Roles */}
            <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <SectionAnchor id="roles" />
              <h2 className="font-['Orbitron'] text-xl sm:text-2xl font-bold text-[oklch(0.78_0.22_195)] mb-4 flex items-center gap-2">
                <Bot className="w-5 h-5" /> Roles & Actors
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    role: "Client",
                    color: "oklch(0.72_0.22_195)",
                    border: "oklch(0.72_0.22_195/0.3)",
                    bg: "oklch(0.72_0.22_195/0.06)",
                    desc: "Creates and funds the job. Defines the scope, payment amount, token, provider, evaluator, and expiry. Receives refund if job expires.",
                    perms: ["createJob()", "fundJob()", "expireJob() (if expired)"],
                  },
                  {
                    role: "Provider",
                    color: "oklch(0.78_0.22_195)",
                    border: "oklch(0.78_0.22_195/0.3)",
                    bg: "oklch(0.78_0.22_195/0.06)",
                    desc: "Executes the work and submits a cryptographic hash of the deliverable. Receives payment upon evaluator approval.",
                    perms: ["submitWork(jobId, deliverableHash)"],
                  },
                  {
                    role: "Evaluator",
                    color: "oklch(0.65_0.28_290)",
                    border: "oklch(0.65_0.28_290/0.3)",
                    bg: "oklch(0.65_0.28_290/0.06)",
                    desc: "Trusted third party (human, DAO, or AI oracle) that verifies the deliverable and either releases or withholds payment.",
                    perms: ["completeJob(jobId)", "rejectJob(jobId)"],
                  },
                ].map((r) => (
                  <div key={r.role} className="p-5 rounded-xl border" style={{ borderColor: r.border, backgroundColor: r.bg }}>
                    <div className="text-base font-bold font-['Orbitron'] mb-2" style={{ color: r.color }}>{r.role}</div>
                    <p className="text-xs text-[oklch(0.65_0.04_220)] leading-relaxed mb-3">{r.desc}</p>
                    <div className="space-y-1">
                      {r.perms.map((p) => (
                        <div key={p} className="flex items-center gap-1.5 text-xs font-mono" style={{ color: r.color }}>
                          <ArrowRight className="w-3 h-3 shrink-0" />
                          <span>{p}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Interface ABI */}
            <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <SectionAnchor id="interface" />
              <h2 className="font-['Orbitron'] text-xl sm:text-2xl font-bold text-[oklch(0.78_0.22_195)] mb-4 flex items-center gap-2">
                <Code2 className="w-5 h-5" /> Interface (ABI)
              </h2>
              <p className="text-sm text-[oklch(0.65_0.04_220)] mb-4 leading-relaxed">
                The full Solidity interface and ABI are available on the <a href="/contract" className="text-[oklch(0.78_0.22_195)] hover:underline">Contract Explorer</a> page. Below is a summary of each function's purpose and access control.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-[oklch(0.2_0.03_260)]">
                      <th className="text-left py-3 px-4 text-[oklch(0.55_0.04_220)] font-mono text-xs uppercase tracking-wider">Function</th>
                      <th className="text-left py-3 px-4 text-[oklch(0.55_0.04_220)] font-mono text-xs uppercase tracking-wider">Access</th>
                      <th className="text-left py-3 px-4 text-[oklch(0.55_0.04_220)] font-mono text-xs uppercase tracking-wider">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { fn: "createJob(...)", access: "Anyone", desc: "Creates a new job and assigns roles. Returns jobId." },
                      { fn: "fundJob(jobId)", access: "Client only", desc: "Locks payment in contract. Transitions OPEN → FUNDED." },
                      { fn: "submitWork(jobId, hash)", access: "Provider only", desc: "Records deliverable hash. Transitions FUNDED → SUBMITTED." },
                      { fn: "completeJob(jobId)", access: "Evaluator only", desc: "Releases funds to provider. Transitions SUBMITTED → COMPLETED." },
                      { fn: "rejectJob(jobId)", access: "Evaluator only", desc: "Refunds client. Transitions SUBMITTED → REJECTED." },
                      { fn: "expireJob(jobId)", access: "Anyone", desc: "Refunds client if past expiry timestamp." },
                      { fn: "getJob(jobId)", access: "Public view", desc: "Returns full Job struct for a given jobId." },
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-[oklch(0.12_0.02_260)] hover:bg-[oklch(0.09_0.015_260)] transition-colors">
                        <td className="py-3 px-4 font-mono text-xs text-[oklch(0.72_0.22_195)]">{row.fn}</td>
                        <td className="py-3 px-4 text-xs text-[oklch(0.65_0.28_290)]">{row.access}</td>
                        <td className="py-3 px-4 text-xs text-[oklch(0.65_0.04_220)]">{row.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.section>

            {/* Events */}
            <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <SectionAnchor id="events" />
              <h2 className="font-['Orbitron'] text-xl sm:text-2xl font-bold text-[oklch(0.78_0.22_195)] mb-4 flex items-center gap-2">
                <Hash className="w-5 h-5" /> Events
              </h2>
              <p className="text-sm text-[oklch(0.65_0.04_220)] mb-4 leading-relaxed">
                All state transitions emit events. Indexers and frontends SHOULD listen to these events for real-time updates.
              </p>
              <div className="space-y-2">
                {[
                  { name: "JobCreated", args: "jobId, client, provider, evaluator, token, amount, expiry", trigger: "createJob()" },
                  { name: "JobFunded", args: "jobId, amount", trigger: "fundJob()" },
                  { name: "WorkSubmitted", args: "jobId, deliverableHash", trigger: "submitWork()" },
                  { name: "JobCompleted", args: "jobId, provider, amount", trigger: "completeJob()" },
                  { name: "JobRejected", args: "jobId, evaluator", trigger: "rejectJob()" },
                  { name: "JobExpired", args: "jobId, client, refundAmount", trigger: "expireJob()" },
                ].map((ev) => (
                  <div key={ev.name} className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-lg border border-[oklch(0.15_0.02_260)] bg-[oklch(0.08_0.01_260)]">
                    <span className="font-mono text-xs font-bold text-[oklch(0.78_0.22_50)] w-36 shrink-0">{ev.name}</span>
                    <span className="font-mono text-xs text-[oklch(0.55_0.04_220)] flex-1">({ev.args})</span>
                    <span className="text-[10px] text-[oklch(0.45_0.03_220)] font-mono">← {ev.trigger}</span>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Security */}
            <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <SectionAnchor id="security" />
              <h2 className="font-['Orbitron'] text-xl sm:text-2xl font-bold text-[oklch(0.78_0.22_195)] mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" /> Security Considerations
              </h2>
              <div className="space-y-4">
                {[
                  {
                    title: "Evaluator Trust",
                    type: "warning",
                    desc: "The evaluator is a trusted role. Implementations should consider using multisig wallets, DAOs, or ZK-proof oracles as evaluators to minimize single-point-of-failure risk.",
                  },
                  {
                    title: "Reentrancy Protection",
                    type: "info",
                    desc: "All fund-transferring functions (completeJob, rejectJob, expireJob) MUST use the checks-effects-interactions pattern or OpenZeppelin ReentrancyGuard to prevent reentrancy attacks.",
                  },
                  {
                    title: "Expiry Mechanism",
                    type: "info",
                    desc: "The expiry timestamp is set at job creation and cannot be modified. Clients should set reasonable expiry windows (e.g., 7–30 days) to balance provider flexibility with capital efficiency.",
                  },
                  {
                    title: "Deliverable Hash Integrity",
                    type: "warning",
                    desc: "The deliverableHash is a keccak256 hash stored on-chain. The actual deliverable (e.g., IPFS CID) must be stored off-chain. Evaluators must independently verify the hash matches the submitted work.",
                  },
                  {
                    title: "ERC-20 Token Safety",
                    type: "info",
                    desc: "When using ERC-20 tokens, implementations must handle non-standard tokens (fee-on-transfer, rebasing). Use safeTransfer from OpenZeppelin's SafeERC20 library.",
                  },
                ].map((item) => (
                  <div key={item.title} className={`flex gap-3 p-4 rounded-xl border ${
                    item.type === "warning"
                      ? "border-[oklch(0.78_0.22_50/0.3)] bg-[oklch(0.78_0.22_50/0.05)]"
                      : "border-[oklch(0.72_0.22_195/0.2)] bg-[oklch(0.72_0.22_195/0.04)]"
                  }`}>
                    <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${item.type === "warning" ? "text-[oklch(0.78_0.22_50)]" : "text-[oklch(0.72_0.22_195)]"}`} />
                    <div>
                      <div className={`text-sm font-bold mb-1 ${item.type === "warning" ? "text-[oklch(0.78_0.22_50)]" : "text-[oklch(0.72_0.22_195)]"}`}>{item.title}</div>
                      <p className="text-xs text-[oklch(0.65_0.04_220)] leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Use Cases */}
            <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <SectionAnchor id="use-cases" />
              <h2 className="font-['Orbitron'] text-xl sm:text-2xl font-bold text-[oklch(0.78_0.22_195)] mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5" /> Use Cases
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { title: "AI Code Generation", desc: "Client agent hires provider agent to write and test a smart contract. Evaluator (audit DAO) verifies the code passes all tests before releasing payment.", icon: "⚙️" },
                  { title: "Data Labeling", desc: "ML training pipeline hires human labelers via provider agents. AI evaluator checks label quality against ground truth before approving payment.", icon: "🏷️" },
                  { title: "Content Creation", desc: "Marketing DAO hires AI writer to produce articles. Human editor acts as evaluator, approving content that meets brand guidelines.", icon: "✍️" },
                  { title: "Research & Analysis", desc: "DeFi protocol hires research agent to produce market analysis reports. Multisig committee evaluates accuracy before payment release.", icon: "📊" },
                  { title: "Bug Bounties", desc: "Protocol treasury creates jobs for security researchers. Smart contract evaluator automatically verifies PoC exploits on a fork before rewarding.", icon: "🔍" },
                  { title: "Translation Services", desc: "Global DAO hires translation agents for governance proposals. Community vote acts as evaluator for quality assessment.", icon: "🌐" },
                ].map((uc) => (
                  <div key={uc.title} className="p-4 rounded-xl border border-[oklch(0.15_0.02_260)] bg-[oklch(0.09_0.015_260)] hover:border-[oklch(0.78_0.22_195/0.2)] transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{uc.icon}</span>
                      <span className="text-sm font-bold text-[oklch(0.88_0.04_200)]">{uc.title}</span>
                    </div>
                    <p className="text-xs text-[oklch(0.55_0.04_220)] leading-relaxed">{uc.desc}</p>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Integration Guide */}
            <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <SectionAnchor id="integration" />
              <h2 className="font-['Orbitron'] text-xl sm:text-2xl font-bold text-[oklch(0.78_0.22_195)] mb-4 flex items-center gap-2">
                <Terminal className="w-5 h-5" /> Integration Guide
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-[oklch(0.82_0.04_200)] mb-3 flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-[oklch(0.78_0.22_195)]" /> 1. Deploy the Contract
                  </h3>
                  <CodeBlock code={CODE_DEPLOY} lang="bash" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[oklch(0.82_0.04_200)] mb-3 flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-[oklch(0.78_0.22_195)]" /> 2. Interact via viem / ethers.js
                  </h3>
                  <CodeBlock code={CODE_INTEGRATION} lang="typescript" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[oklch(0.82_0.04_200)] mb-3 flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-[oklch(0.78_0.22_195)]" /> 3. AI Agent Integration
                  </h3>
                  <CodeBlock code={CODE_AGENT} lang="typescript" />
                </div>
              </div>
            </motion.section>

            {/* Reference */}
            <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <SectionAnchor id="reference" />
              <h2 className="font-['Orbitron'] text-xl sm:text-2xl font-bold text-[oklch(0.78_0.22_195)] mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5" /> Reference
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: "GitHub Repository", url: "https://github.com/AgentEscrow8183/agentescrow-erc8183", desc: "Source code, contracts, and examples" },
                  { label: "Release v1.0.0", url: "https://github.com/AgentEscrow8183/agentescrow-erc8183/releases/tag/v1.0.0", desc: "Download stable release — changelog and source archive" },
                  { label: "X / Twitter", url: "https://x.com/_agentescrow", desc: "Protocol updates and announcements" },
                  { label: "Ethereum EIPs", url: "https://eips.ethereum.org/", desc: "Ethereum Improvement Proposals registry" },
                  { label: "Sepolia Testnet", url: "https://sepolia.etherscan.io/", desc: "Block explorer for Sepolia testnet" },
                  { label: "OpenZeppelin Contracts", url: "https://docs.openzeppelin.com/contracts/", desc: "Security-audited Solidity libraries" },
                  { label: "wagmi Documentation", url: "https://wagmi.sh/", desc: "React hooks for Ethereum" },
                ].map((ref) => (
                  <a
                    key={ref.label}
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 p-4 rounded-xl border border-[oklch(0.15_0.02_260)] bg-[oklch(0.09_0.015_260)] hover:border-[oklch(0.78_0.22_195/0.3)] hover:bg-[oklch(0.78_0.22_195/0.04)] transition-all group"
                  >
                    <ExternalLink className="w-4 h-4 text-[oklch(0.55_0.04_220)] group-hover:text-[oklch(0.78_0.22_195)] mt-0.5 shrink-0 transition-colors" />
                    <div>
                      <div className="text-sm font-medium text-[oklch(0.82_0.04_200)] group-hover:text-[oklch(0.78_0.22_195)] transition-colors">{ref.label}</div>
                      <div className="text-xs text-[oklch(0.45_0.03_220)] mt-0.5">{ref.desc}</div>
                    </div>
                  </a>
                ))}
              </div>
            </motion.section>

          </main>
        </div>
      </div>

      <AIChatWidget />
    </div>
  );
}
