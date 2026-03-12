/* ==========================================================
   Contract Explorer — AgentEscrow ERC-8183
   Kode Solidity lengkap, panduan deploy, dan verifikasi
   ========================================================== */

import { useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { toast } from "sonner";
import {
  Copy, CheckCircle2, ExternalLink, Code2, BookOpen,
  Rocket, Shield, ArrowLeft, ChevronDown, ChevronUp, Terminal
} from "lucide-react";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663364387669/fEjhcY4s7LeuDVrQJHn5VB/ae-icon-v4-QFJAJsj8FMjz5GGVfkXy5E.webp";

// Full ERC-8183 Solidity contract
const SOLIDITY_CONTRACT = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title IACPHook — Hook interface for ERC-8183 extensions
interface IACPHook {
    function beforeAction(uint256 jobId, bytes4 action, address caller) external;
    function afterAction(uint256 jobId, bytes4 action, address caller) external;
}

/// @title AgentEscrow — ERC-8183 Agentic Commerce Protocol
/// @notice Trustless escrow for AI agent commerce with evaluator attestation
/// @dev Implements the ERC-8183 standard for agentic job lifecycle management
contract AgentEscrow is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ─── Enums ──────────────────────────────────────────────────────────────
    enum JobState { Open, Funded, Submitted, Completed, Rejected, Expired }

    // ─── Structs ─────────────────────────────────────────────────────────────
    struct Job {
        address client;       // Creates and funds the job
        address provider;     // Executes work and submits deliverable
        address evaluator;    // Attests completion or rejects (FULLY TRUSTED)
        address token;        // ERC-20 token used for payment
        uint256 budget;       // Agreed payment amount (in token units)
        uint256 expiredAt;    // Unix timestamp after which refund is claimable
        bytes32 deliverable;  // bytes32 hash of submitted work
        JobState state;
        address hook;         // Optional IACPHook for composable extensions
        string description;   // Off-chain job description or IPFS CID
    }

    // ─── State ───────────────────────────────────────────────────────────────
    uint256 public jobCount;
    mapping(uint256 => Job) public jobs;

    // ─── Events ──────────────────────────────────────────────────────────────
    event JobCreated(
        uint256 indexed jobId,
        address indexed client,
        address indexed provider,
        address evaluator,
        address token,
        uint256 expiredAt
    );
    event ProviderSet(uint256 indexed jobId, address provider);
    event BudgetSet(uint256 indexed jobId, uint256 amount);
    event JobFunded(uint256 indexed jobId, uint256 amount);
    event WorkSubmitted(uint256 indexed jobId, bytes32 deliverableHash);
    event JobCompleted(uint256 indexed jobId, string reason);
    event JobRejected(uint256 indexed jobId, string reason);
    event RefundClaimed(uint256 indexed jobId, address client, uint256 amount);

    // ─── Errors ──────────────────────────────────────────────────────────────
    error Unauthorized();
    error InvalidState(JobState current, JobState required);
    error BudgetMismatch(uint256 expected, uint256 actual);
    error JobExpired();
    error JobNotExpired();
    error ZeroAddress();
    error InvalidExpiry();

    // ─── Modifiers ───────────────────────────────────────────────────────────
    modifier onlyClient(uint256 jobId) {
        if (msg.sender != jobs[jobId].client) revert Unauthorized();
        _;
    }

    modifier onlyProvider(uint256 jobId) {
        if (msg.sender != jobs[jobId].provider) revert Unauthorized();
        _;
    }

    modifier onlyEvaluator(uint256 jobId) {
        if (msg.sender != jobs[jobId].evaluator) revert Unauthorized();
        _;
    }

    modifier inState(uint256 jobId, JobState required) {
        if (jobs[jobId].state != required)
            revert InvalidState(jobs[jobId].state, required);
        _;
    }

    modifier notExpired(uint256 jobId) {
        if (block.timestamp >= jobs[jobId].expiredAt) revert JobExpired();
        _;
    }

    // ─── Hook helper ─────────────────────────────────────────────────────────
    function _callHook(uint256 jobId, bytes4 action, bool before) internal {
        address hook = jobs[jobId].hook;
        if (hook == address(0)) return;
        if (before) IACPHook(hook).beforeAction(jobId, action, msg.sender);
        else        IACPHook(hook).afterAction(jobId, action, msg.sender);
    }

    // ─── Core Functions ──────────────────────────────────────────────────────

    /// @notice Create a new escrow job
    /// @param provider Address of the service provider (can be address(0) for open bidding)
    /// @param evaluator Address of the trusted evaluator (can be client itself)
    /// @param token ERC-20 token address for payment
    /// @param expiredAt Unix timestamp for job expiry
    /// @param description Off-chain description or IPFS CID
    /// @param hook Optional hook contract address (address(0) to disable)
    /// @return jobId The ID of the newly created job
    function createJob(
        address provider,
        address evaluator,
        address token,
        uint256 expiredAt,
        string calldata description,
        address hook
    ) external returns (uint256 jobId) {
        if (evaluator == address(0)) revert ZeroAddress();
        if (token == address(0)) revert ZeroAddress();
        if (expiredAt <= block.timestamp) revert InvalidExpiry();

        jobId = ++jobCount;
        jobs[jobId] = Job({
            client: msg.sender,
            provider: provider,
            evaluator: evaluator,
            token: token,
            budget: 0,
            expiredAt: expiredAt,
            deliverable: bytes32(0),
            state: JobState.Open,
            hook: hook,
            description: description
        });

        emit JobCreated(jobId, msg.sender, provider, evaluator, token, expiredAt);
    }

    /// @notice Set or update the provider (for bidding flows)
    function setProvider(uint256 jobId, address provider)
        external
        onlyClient(jobId)
        inState(jobId, JobState.Open)
    {
        _callHook(jobId, this.setProvider.selector, true);
        jobs[jobId].provider = provider;
        emit ProviderSet(jobId, provider);
        _callHook(jobId, this.setProvider.selector, false);
    }

    /// @notice Set the agreed budget for the job
    function setBudget(uint256 jobId, uint256 amount)
        external
        onlyClient(jobId)
        inState(jobId, JobState.Open)
    {
        _callHook(jobId, this.setBudget.selector, true);
        jobs[jobId].budget = amount;
        emit BudgetSet(jobId, amount);
        _callHook(jobId, this.setBudget.selector, false);
    }

    /// @notice Fund the job — locks ERC-20 tokens into escrow
    /// @param jobId The job to fund
    /// @param expectedBudget Must match job.budget to prevent front-running
    function fund(uint256 jobId, uint256 expectedBudget)
        external
        nonReentrant
        onlyClient(jobId)
        inState(jobId, JobState.Open)
        notExpired(jobId)
    {
        Job storage job = jobs[jobId];
        if (job.budget != expectedBudget)
            revert BudgetMismatch(job.budget, expectedBudget);

        _callHook(jobId, this.fund.selector, true);
        IERC20(job.token).safeTransferFrom(msg.sender, address(this), job.budget);
        job.state = JobState.Funded;
        emit JobFunded(jobId, job.budget);
        _callHook(jobId, this.fund.selector, false);
    }

    /// @notice Provider submits work deliverable hash
    /// @param jobId The funded job
    /// @param deliverableHash bytes32 hash of the deliverable (IPFS CID, file hash, etc.)
    function submit(uint256 jobId, bytes32 deliverableHash)
        external
        onlyProvider(jobId)
        inState(jobId, JobState.Funded)
        notExpired(jobId)
    {
        _callHook(jobId, this.submit.selector, true);
        jobs[jobId].deliverable = deliverableHash;
        jobs[jobId].state = JobState.Submitted;
        emit WorkSubmitted(jobId, deliverableHash);
        _callHook(jobId, this.submit.selector, false);
    }

    /// @notice Evaluator approves work — releases escrow to provider
    /// @param jobId The submitted job
    /// @param reason Human-readable approval reason
    function complete(uint256 jobId, string calldata reason)
        external
        nonReentrant
        onlyEvaluator(jobId)
        inState(jobId, JobState.Submitted)
    {
        _callHook(jobId, this.complete.selector, true);
        Job storage job = jobs[jobId];
        job.state = JobState.Completed;
        IERC20(job.token).safeTransfer(job.provider, job.budget);
        emit JobCompleted(jobId, reason);
        _callHook(jobId, this.complete.selector, false);
    }

    /// @notice Evaluator or client rejects work — refunds client
    /// @param jobId The submitted job
    /// @param reason Human-readable rejection reason
    function reject(uint256 jobId, string calldata reason)
        external
        nonReentrant
        inState(jobId, JobState.Submitted)
    {
        Job storage job = jobs[jobId];
        if (msg.sender != job.evaluator && msg.sender != job.client)
            revert Unauthorized();

        _callHook(jobId, this.reject.selector, true);
        job.state = JobState.Rejected;
        IERC20(job.token).safeTransfer(job.client, job.budget);
        emit JobRejected(jobId, reason);
        _callHook(jobId, this.reject.selector, false);
    }

    /// @notice Claim refund after expiry — NOT hookable (guaranteed recovery)
    /// @param jobId The expired job (must be in Open or Funded state)
    function claimRefund(uint256 jobId) external nonReentrant {
        Job storage job = jobs[jobId];
        if (block.timestamp < job.expiredAt) revert JobNotExpired();
        if (job.state != JobState.Open && job.state != JobState.Funded)
            revert InvalidState(job.state, JobState.Funded);

        uint256 amount = job.budget;
        job.state = JobState.Expired;
        if (amount > 0) {
            IERC20(job.token).safeTransfer(job.client, amount);
        }
        emit RefundClaimed(jobId, job.client, amount);
    }

    /// @notice Get full job details
    function getJob(uint256 jobId) external view returns (Job memory) {
        return jobs[jobId];
    }
}`;

const DEPLOY_STEPS = [
  {
    step: "1",
    title: "Install Foundry",
    color: "#2dd4bf",
    command: "curl -L https://foundry.paradigm.xyz | bash\nfoundryup",
    description: "Foundry adalah toolkit Solidity modern untuk compile, test, dan deploy smart contract.",
  },
  {
    step: "2",
    title: "Clone & Setup",
    color: "#818cf8",
    command: "git clone https://github.com/AgentEscrow8183/agentescrow-erc8183\ncd agentescrow-erc8183\nforge install",
    description: "Clone repository kontrak dan install dependensi OpenZeppelin.",
  },
  {
    step: "3",
    title: "Compile Contract",
    color: "#fb923c",
    command: "forge build\nforge test -vv",
    description: "Compile kontrak dan jalankan test suite untuk memverifikasi semua fungsi ERC-8183.",
  },
  {
    step: "4",
    title: "Deploy ke Sepolia",
    color: "#4ade80",
    command: `forge create --rpc-url https://sepolia.infura.io/v3/YOUR_KEY \\
  --private-key $PRIVATE_KEY \\
  src/AgentEscrow.sol:AgentEscrow \\
  --verify`,
    description: "Deploy ke Sepolia testnet dengan verifikasi otomatis di Etherscan.",
  },
  {
    step: "5",
    title: "Update Contract Address",
    color: "#f472b6",
    command: `// client/src/lib/web3.ts
export const ESCROW_CONTRACT_ADDRESS = 
  "0xYOUR_DEPLOYED_ADDRESS" as \`0x\${string}\`;`,
    description: "Update alamat kontrak di konfigurasi web3.ts setelah deploy berhasil.",
  },
];

const VERIFIED_CONTRACTS = [
  {
    network: "Sepolia Testnet",
    address: "0x0000000000000000000000000000000000000000",
    status: "Demo (Not Deployed)",
    color: "#fb923c",
    explorer: "https://sepolia.etherscan.io",
  },
];

function CodeBlock({ code, language = "solidity" }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple syntax highlighting via CSS classes
  const lines = code.split("\n");

  return (
    <div className="relative rounded-xl overflow-hidden border border-white/10" style={{ background: "rgba(0,0,0,0.5)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10" style={{ background: "rgba(255,255,255,0.03)" }}>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/60" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
          <div className="w-3 h-3 rounded-full bg-green-500/60" />
          <span className="text-slate-500 text-xs ml-2 font-mono">AgentEscrow.sol</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
          style={{
            background: copied ? "rgba(74,222,128,0.15)" : "rgba(255,255,255,0.05)",
            color: copied ? "#4ade80" : "#94a3b8",
            border: `1px solid ${copied ? "rgba(74,222,128,0.3)" : "rgba(255,255,255,0.1)"}`,
          }}
        >
          {copied ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      {/* Code */}
      <div className="overflow-x-auto">
        <pre className="p-4 text-xs font-mono leading-relaxed">
          {lines.map((line, i) => {
            // Basic color coding
            let colored = line
              .replace(/(\/\/.*$)/g, '<span style="color:#64748b">$1</span>')
              .replace(/\b(pragma|import|contract|interface|library|function|modifier|event|error|struct|enum|mapping|address|uint256|bytes32|string|bool|memory|storage|calldata|external|internal|public|private|view|pure|payable|nonpayable|returns|return|if|else|for|while|revert|emit|new|delete|this)\b/g, '<span style="color:#818cf8">$1</span>')
              .replace(/\b(uint256|uint8|bytes32|bytes4|address|bool|string)\b/g, '<span style="color:#2dd4bf">$1</span>')
              .replace(/"([^"]*)"/g, '<span style="color:#4ade80">"$1"</span>')
              .replace(/\b(\d+)\b/g, '<span style="color:#fb923c">$1</span>');

            return (
              <div key={i} className="flex">
                <span className="select-none text-slate-600 w-8 text-right mr-4 flex-shrink-0">{i + 1}</span>
                <span dangerouslySetInnerHTML={{ __html: colored || "&nbsp;" }} style={{ color: "#e2e8f0" }} />
              </div>
            );
          })}
        </pre>
      </div>
    </div>
  );
}

function CommandBlock({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="relative rounded-xl overflow-hidden border border-white/10" style={{ background: "rgba(0,0,0,0.4)" }}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
        <div className="flex items-center gap-1.5">
          <Terminal className="w-3 h-3 text-slate-500" />
          <span className="text-slate-500 text-xs font-mono">terminal</span>
        </div>
        <button
          onClick={() => {
            navigator.clipboard.writeText(command);
            setCopied(true);
            toast.success("Copied!");
            setTimeout(() => setCopied(false), 2000);
          }}
          className="text-slate-500 hover:text-teal-400 transition-colors"
        >
          {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
      <pre className="p-3 text-xs font-mono text-green-300 overflow-x-auto leading-relaxed whitespace-pre-wrap">{command}</pre>
    </div>
  );
}

export default function Contract() {
  const [activeTab, setActiveTab] = useState<"contract" | "deploy" | "abi">("contract");
  const [expandedStep, setExpandedStep] = useState<string | null>("1");

  const ABI_JSON = JSON.stringify([
    { type: "function", name: "createJob", inputs: [{ name: "provider", type: "address" }, { name: "evaluator", type: "address" }, { name: "token", type: "address" }, { name: "expiredAt", type: "uint256" }, { name: "description", type: "string" }, { name: "hook", type: "address" }], outputs: [{ name: "jobId", type: "uint256" }], stateMutability: "nonpayable" },
    { type: "function", name: "setBudget", inputs: [{ name: "jobId", type: "uint256" }, { name: "amount", type: "uint256" }], outputs: [], stateMutability: "nonpayable" },
    { type: "function", name: "fund", inputs: [{ name: "jobId", type: "uint256" }, { name: "expectedBudget", type: "uint256" }], outputs: [], stateMutability: "nonpayable" },
    { type: "function", name: "submit", inputs: [{ name: "jobId", type: "uint256" }, { name: "deliverableHash", type: "bytes32" }], outputs: [], stateMutability: "nonpayable" },
    { type: "function", name: "complete", inputs: [{ name: "jobId", type: "uint256" }, { name: "reason", type: "string" }], outputs: [], stateMutability: "nonpayable" },
    { type: "function", name: "reject", inputs: [{ name: "jobId", type: "uint256" }, { name: "reason", type: "string" }], outputs: [], stateMutability: "nonpayable" },
    { type: "function", name: "claimRefund", inputs: [{ name: "jobId", type: "uint256" }], outputs: [], stateMutability: "nonpayable" },
    { type: "function", name: "getJob", inputs: [{ name: "jobId", type: "uint256" }], outputs: [{ name: "", type: "tuple", components: [{ name: "client", type: "address" }, { name: "provider", type: "address" }, { name: "evaluator", type: "address" }, { name: "token", type: "address" }, { name: "budget", type: "uint256" }, { name: "expiredAt", type: "uint256" }, { name: "deliverable", type: "bytes32" }, { name: "state", type: "uint8" }, { name: "hook", type: "address" }, { name: "description", type: "string" }] }], stateMutability: "view" },
    { type: "function", name: "jobCount", inputs: [], outputs: [{ name: "", type: "uint256" }], stateMutability: "view" },
  ], null, 2);

  return (
    <div className="min-h-screen cosmic-bg">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="particle" style={{ left: `${(i * 9) % 100}%`, top: `${(i * 14) % 100}%`, animationDelay: `${i * 0.45}s` }} />
        ))}
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 glass-card border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/dashboard" className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
              <ArrowLeft className="w-4 h-4" />
            </a>
            <a href="/" className="flex items-center gap-2">
              <img src={LOGO_URL} alt="AgentEscrow" className="w-7 h-7 rounded-lg" />
              <div>
                <div className="text-white font-bold text-sm">AgentEscrow</div>
                <div className="text-teal-400 text-xs font-mono">ERC-8183</div>
              </div>
            </a>
          </div>
          <ConnectButton accountStatus="avatar" chainStatus="icon" showBalance={false} />
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, rgba(45,212,191,0.2), rgba(129,140,248,0.2))", border: "1px solid rgba(45,212,191,0.3)" }}>
              <Code2 className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Contract Explorer</h1>
              <p className="text-slate-400 text-sm">AgentEscrow ERC-8183 Smart Contract</p>
            </div>
          </div>

          {/* Contract addresses */}
          <div className="flex flex-wrap gap-3 mt-4">
            {VERIFIED_CONTRACTS.map((c) => (
              <div key={c.network} className="flex items-center gap-2 px-3 py-2 rounded-xl glass-card">
                <div className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                <span className="text-slate-300 text-xs font-medium">{c.network}</span>
                <span className="text-slate-500 text-xs font-mono">{c.address.slice(0, 10)}...</span>
                <span className="px-1.5 py-0.5 rounded text-xs font-medium"
                  style={{ background: `${c.color}20`, color: c.color }}>{c.status}</span>
                <a href={c.explorer} target="_blank" rel="noopener noreferrer"
                  className="text-slate-600 hover:text-teal-400 transition-colors">
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl glass-card mb-6 w-fit">
          {[
            { id: "contract", label: "Solidity Code", icon: Code2 },
            { id: "deploy", label: "Deploy Guide", icon: Rocket },
            { id: "abi", label: "ABI / Interface", icon: BookOpen },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === id
                  ? "text-white"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
              style={activeTab === id ? {
                background: "linear-gradient(135deg, rgba(45,212,191,0.2), rgba(129,140,248,0.2))",
                border: "1px solid rgba(45,212,191,0.3)",
              } : {}}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Contract Code Tab */}
        {activeTab === "contract" && (
          <div className="space-y-4">
            <div className="glass-card rounded-2xl p-4 flex flex-wrap items-center gap-4">
              {[
                { label: "Solidity", value: "^0.8.24" },
                { label: "License", value: "MIT" },
                { label: "Standard", value: "ERC-8183" },
                { label: "Dependencies", value: "OpenZeppelin 5.x" },
                { label: "Audit", value: "Pending" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="text-slate-500 text-xs">{label}:</span>
                  <span className="text-teal-300 text-xs font-mono font-medium">{value}</span>
                </div>
              ))}
            </div>
            <CodeBlock code={SOLIDITY_CONTRACT} />
          </div>
        )}

        {/* Deploy Guide Tab */}
        {activeTab === "deploy" && (
          <div className="space-y-4">
            <div className="glass-card rounded-2xl p-5 border border-blue-500/20" style={{ background: "rgba(59,130,246,0.05)" }}>
              <div className="flex gap-3">
                <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-white font-semibold mb-1">Testnet First</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Always deploy to Sepolia testnet first. Get free test ETH from{" "}
                    <a href="https://sepoliafaucet.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">sepoliafaucet.com</a>{" "}
                    before deploying to mainnet. Never use your main wallet private key directly — use a dedicated deployer wallet.
                  </p>
                </div>
              </div>
            </div>

            {DEPLOY_STEPS.map((step) => (
              <div key={step.step} className="glass-card rounded-2xl overflow-hidden">
                <button
                  onClick={() => setExpandedStep(expandedStep === step.step ? null : step.step)}
                  className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{ background: `${step.color}20`, color: step.color, border: `1px solid ${step.color}30` }}
                    >
                      {step.step}
                    </div>
                    <div className="text-left">
                      <div className="text-white font-semibold text-sm">{step.title}</div>
                      <div className="text-slate-400 text-xs">{step.description}</div>
                    </div>
                  </div>
                  {expandedStep === step.step
                    ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  }
                </button>
                {expandedStep === step.step && (
                  <div className="px-5 pb-5">
                    <CommandBlock command={step.command} />
                  </div>
                )}
              </div>
            ))}

            <div className="glass-card rounded-2xl p-5">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Rocket className="w-4 h-4 text-teal-400" />
                After Deployment
              </h3>
              <div className="space-y-2">
                {[
                  { label: "Verify on Etherscan", href: "https://sepolia.etherscan.io", desc: "Verify source code for transparency" },
                  { label: "Submit to ERC-8183 Registry", href: "https://github.com/AgentEscrow8183/agentescrow-erc8183/issues/new?template=feature_request.md", desc: "Add your deployment to the official registry" },
                  { label: "Join Discussion", href: "https://ethereum-magicians.org/t/erc-8183-agentic-commerce/27902", desc: "Share your deployment with the community" },
                ].map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group"
                  >
                    <div>
                      <div className="text-white text-sm group-hover:text-teal-300 transition-colors">{item.label}</div>
                      <div className="text-slate-500 text-xs">{item.desc}</div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-teal-400 transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ABI Tab */}
        {activeTab === "abi" && (
          <div className="space-y-4">
            <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold">Contract ABI</h3>
                <p className="text-slate-400 text-xs mt-0.5">JSON interface for interacting with AgentEscrow</p>
              </div>
              <button
                onClick={() => { navigator.clipboard.writeText(ABI_JSON); toast.success("ABI copied!"); }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-teal-300 transition-all hover:bg-teal-500/10"
                style={{ border: "1px solid rgba(45,212,191,0.3)" }}
              >
                <Copy className="w-3.5 h-3.5" />
                Copy ABI
              </button>
            </div>

            {/* Function signatures */}
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <h3 className="text-white font-semibold text-sm">Function Signatures</h3>
              </div>
              <div className="divide-y divide-white/5">
                {[
                  { name: "createJob", type: "Write", color: "#818cf8", params: "(address provider, address evaluator, address token, uint256 expiredAt, string description, address hook) → uint256 jobId" },
                  { name: "setBudget", type: "Write", color: "#818cf8", params: "(uint256 jobId, uint256 amount)" },
                  { name: "fund", type: "Write", color: "#fb923c", params: "(uint256 jobId, uint256 expectedBudget)" },
                  { name: "submit", type: "Write", color: "#fb923c", params: "(uint256 jobId, bytes32 deliverableHash)" },
                  { name: "complete", type: "Write", color: "#4ade80", params: "(uint256 jobId, string reason)" },
                  { name: "reject", type: "Write", color: "#f87171", params: "(uint256 jobId, string reason)" },
                  { name: "claimRefund", type: "Write", color: "#f87171", params: "(uint256 jobId)" },
                  { name: "getJob", type: "Read", color: "#2dd4bf", params: "(uint256 jobId) → Job memory" },
                  { name: "jobCount", type: "Read", color: "#2dd4bf", params: "() → uint256" },
                ].map((fn) => (
                  <div key={fn.name} className="p-4 flex flex-col sm:flex-row sm:items-start gap-2">
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className="px-2 py-0.5 rounded text-xs font-medium"
                        style={{ background: `${fn.color}20`, color: fn.color }}
                      >
                        {fn.type}
                      </span>
                      <code className="text-white text-sm font-mono font-semibold">{fn.name}</code>
                    </div>
                    <code className="text-slate-400 text-xs font-mono leading-relaxed">{fn.params}</code>
                  </div>
                ))}
              </div>
            </div>

            {/* Raw ABI */}
            <div className="relative rounded-xl overflow-hidden border border-white/10" style={{ background: "rgba(0,0,0,0.5)" }}>
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10" style={{ background: "rgba(255,255,255,0.03)" }}>
                <span className="text-slate-500 text-xs font-mono">ABI JSON</span>
                <button
                  onClick={() => { navigator.clipboard.writeText(ABI_JSON); toast.success("ABI copied!"); }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-slate-400 hover:text-teal-300 transition-colors"
                  style={{ border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  <Copy className="w-3 h-3" />
                  Copy
                </button>
              </div>
              <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-64 leading-relaxed">{ABI_JSON}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
