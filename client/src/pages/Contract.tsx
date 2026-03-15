import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, CheckCheck, ExternalLink, Code2, BookOpen, Zap, Terminal } from "lucide-react";
import Navbar from "@/components/Navbar";
import AIChatWidget from "@/components/AIChatWidget";
import { ESCROW_ABI, ESCROW_CONTRACT_ADDRESS } from "@/lib/web3";
import { toast } from "sonner";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="p-1.5 text-[oklch(0.55_0.04_220)] hover:text-[oklch(0.78_0.22_195)] transition-colors"
    >
      {copied ? <CheckCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}

const INTERFACE_SOLIDITY = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title IERC8183 - AI Agent Job Escrow Standard
/// @notice Interface for the ERC-8183 job escrow protocol
interface IERC8183 {
    // ── Events ────────────────────────────────────────────────
    event JobCreated(
        uint256 indexed jobId,
        address indexed client,
        address indexed provider
    );
    event JobStateChanged(
        uint256 indexed jobId,
        JobState newState
    );
    event PaymentReleased(
        uint256 indexed jobId,
        address indexed recipient,
        uint256 amount
    );

    // ── Enums ─────────────────────────────────────────────────
    enum JobState {
        OPEN,       // 0 - Created, awaiting funding
        FUNDED,     // 1 - Funded, provider can work
        SUBMITTED,  // 2 - Work submitted, awaiting evaluation
        COMPLETED,  // 3 - Approved, payment released
        REJECTED,   // 4 - Rejected, funds returned
        EXPIRED,    // 5 - Expired, funds returned
        CANCELLED   // 6 - Cancelled by client
    }

    // ── Structs ───────────────────────────────────────────────
    struct Job {
        address client;
        address provider;
        address evaluator;
        address token;
        uint256 amount;
        uint256 expiry;
        JobState state;
        bytes32 deliverableHash;
    }

    // ── Core Functions ────────────────────────────────────────
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

    // ── View Functions ────────────────────────────────────────
    function getJob(uint256 jobId)
        external view returns (Job memory);

    function getJobState(uint256 jobId)
        external view returns (JobState);
}`;

const DEPLOYMENT_GUIDE = `# Deploy AgentEscrow on Sepolia Testnet

## Prerequisites
- Node.js 18+, Foundry or Hardhat
- Sepolia ETH (from faucet.sepolia.dev)
- MetaMask connected to Sepolia

## Using Foundry

\`\`\`bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Clone & compile
git clone https://github.com/AgentEscrow8183/agentescrow-erc8183
cd agentescrow-erc8183/contracts
forge build

# Deploy to Sepolia
forge create src/AgentEscrow.sol:AgentEscrow \\
  --rpc-url https://rpc.sepolia.org \\
  --private-key $PRIVATE_KEY \\
  --verify \\
  --etherscan-api-key $ETHERSCAN_KEY
\`\`\`

## Using Hardhat

\`\`\`bash
npm install
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
\`\`\`

## After Deployment
1. Copy the contract address
2. Update ESCROW_CONTRACT_ADDRESS in client/src/lib/web3.ts
3. Verify on Etherscan Sepolia
4. Test with small amounts first`;

const tabs = ["Interface", "ABI", "Deploy Guide"] as const;
type Tab = (typeof tabs)[number];

export default function Contract() {
  const [activeTab, setActiveTab] = useState<Tab>("Interface");
  const [expandedFn, setExpandedFn] = useState<string | null>(null);

  const functions = ESCROW_ABI.filter((item) => item.type === "function");
  const events = ESCROW_ABI.filter((item) => item.type === "event");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        <div className="container py-8">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-[oklch(0.72_0.22_195/0.1)] border border-[oklch(0.72_0.22_195/0.3)] flex items-center justify-center">
                <Code2 className="w-5 h-5 text-[oklch(0.78_0.22_195)]" />
              </div>
              <div>
                <h1 className="text-2xl font-['Orbitron'] font-black text-[oklch(0.92_0.02_200)]">
                  CONTRACT EXPLORER
                </h1>
                <p className="text-xs text-[oklch(0.55_0.04_220)]">ERC-8183 Smart Contract Interface</p>
              </div>
            </div>
          </motion.div>

          {/* Contract Address Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="cyber-card rounded-xl p-5 mb-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-['Orbitron'] text-[oklch(0.55_0.04_220)] tracking-wider mb-1">
                  CONTRACT ADDRESS (SEPOLIA)
                </p>
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono text-[oklch(0.78_0.22_195)]">
                    {ESCROW_CONTRACT_ADDRESS}
                  </code>
                  <CopyButton text={ESCROW_CONTRACT_ADDRESS} />
                </div>
                <p className="text-[10px] text-[oklch(0.55_0.04_220)] mt-1">
                  ⚠️ Placeholder address — deploy your own instance
                </p>
              </div>
              <div className="flex gap-3">
                <a
                  href={`https://sepolia.etherscan.io/address/${ESCROW_CONTRACT_ADDRESS}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-[oklch(0.55_0.04_220)] hover:text-[oklch(0.78_0.22_195)] transition-colors border border-[oklch(0.2_0.03_260)] px-3 py-1.5 rounded hover:border-[oklch(0.78_0.22_195/0.3)]"
                >
                  <ExternalLink className="w-3 h-3" /> Etherscan
                </a>
                <a
                  href="https://github.com/AgentEscrow8183/agentescrow-erc8183"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-[oklch(0.55_0.04_220)] hover:text-[oklch(0.78_0.22_195)] transition-colors border border-[oklch(0.2_0.03_260)] px-3 py-1.5 rounded hover:border-[oklch(0.78_0.22_195/0.3)]"
                >
                  <Zap className="w-3 h-3" /> GitHub
                </a>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Functions", val: functions.length, color: "oklch(0.72 0.22 195)" },
              { label: "Events", val: events.length, color: "oklch(0.68 0.28 295)" },
              { label: "States", val: 7, color: "oklch(0.75 0.22 55)" },
              { label: "Roles", val: 3, color: "oklch(0.78 0.22 145)" },
            ].map((s) => (
              <div key={s.label} className="cyber-card rounded-lg p-4">
                <div
                  className="text-2xl font-['Orbitron'] font-bold"
                  style={{ color: s.color }}
                >
                  {s.val}
                </div>
                <div className="text-xs text-[oklch(0.55_0.04_220)] mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 border-b border-[oklch(0.78_0.22_195/0.1)]">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-xs font-['Orbitron'] font-semibold tracking-wider transition-all ${
                  activeTab === tab
                    ? "text-[oklch(0.78_0.22_195)] border-b-2 border-[oklch(0.78_0.22_195)] -mb-px"
                    : "text-[oklch(0.55_0.04_220)] hover:text-[oklch(0.92_0.02_200)]"
                }`}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {activeTab === "Interface" && (
              <div className="cyber-card rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-[oklch(0.78_0.22_195/0.15)] bg-[oklch(0.09_0.02_260)]">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[oklch(0.62_0.25_25)]" />
                    <div className="w-2 h-2 rounded-full bg-[oklch(0.75_0.22_55)]" />
                    <div className="w-2 h-2 rounded-full bg-[oklch(0.78_0.22_145)]" />
                    <span className="text-xs font-mono text-[oklch(0.55_0.04_220)] ml-2">IERC8183.sol</span>
                  </div>
                  <CopyButton text={INTERFACE_SOLIDITY} />
                </div>
                <pre className="p-6 text-xs font-mono text-[oklch(0.82_0.05_200)] overflow-x-auto leading-relaxed max-h-[600px] overflow-y-auto">
                  <code>{INTERFACE_SOLIDITY}</code>
                </pre>
              </div>
            )}

            {activeTab === "ABI" && (
              <div className="space-y-4">
                {/* Functions */}
                <div>
                  <h3 className="text-xs font-['Orbitron'] font-bold text-[oklch(0.55_0.04_220)] tracking-wider mb-3">
                    FUNCTIONS ({functions.length})
                  </h3>
                  <div className="space-y-2">
                    {functions.map((fn) => (
                      <div key={fn.name} className="cyber-card rounded-lg overflow-hidden">
                        <button
                          onClick={() => setExpandedFn(expandedFn === fn.name ? null : fn.name)}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-[oklch(0.78_0.22_195/0.03)] transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                                fn.stateMutability === "view"
                                  ? "text-[oklch(0.78_0.22_145)] border-[oklch(0.78_0.22_145/0.3)] bg-[oklch(0.78_0.22_145/0.1)]"
                                  : "text-[oklch(0.75_0.22_55)] border-[oklch(0.75_0.22_55/0.3)] bg-[oklch(0.75_0.22_55/0.1)]"
                              }`}
                            >
                              {fn.stateMutability}
                            </span>
                            <span className="text-sm font-mono text-[oklch(0.78_0.22_195)]">{fn.name}</span>
                          </div>
                          <Terminal className="w-3.5 h-3.5 text-[oklch(0.55_0.04_220)]" />
                        </button>
                        {expandedFn === fn.name && (
                          <div className="px-4 pb-4 border-t border-[oklch(0.78_0.22_195/0.1)]">
                            <div className="mt-3 space-y-2">
                              {fn.inputs && fn.inputs.length > 0 && (
                                <div>
                                  <p className="text-[10px] text-[oklch(0.55_0.04_220)] mb-1">INPUTS</p>
                                  {fn.inputs.map((inp: any) => (
                                    <div key={inp.name} className="flex gap-3 text-xs font-mono">
                                      <span className="text-[oklch(0.68_0.28_295)]">{inp.type}</span>
                                      <span className="text-[oklch(0.82_0.05_200)]">{inp.name}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {fn.outputs && fn.outputs.length > 0 && (
                                <div>
                                  <p className="text-[10px] text-[oklch(0.55_0.04_220)] mb-1">OUTPUTS</p>
                                  {fn.outputs.map((out: any, i: number) => (
                                    <div key={i} className="flex gap-3 text-xs font-mono">
                                      <span className="text-[oklch(0.72_0.22_195)]">{out.type}</span>
                                      {out.name && <span className="text-[oklch(0.82_0.05_200)]">{out.name}</span>}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Events */}
                <div>
                  <h3 className="text-xs font-['Orbitron'] font-bold text-[oklch(0.55_0.04_220)] tracking-wider mb-3">
                    EVENTS ({events.length})
                  </h3>
                  <div className="space-y-2">
                    {events.map((ev) => (
                      <div key={ev.name} className="cyber-card rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border text-[oklch(0.72_0.22_195)] border-[oklch(0.72_0.22_195/0.3)] bg-[oklch(0.72_0.22_195/0.1)]">
                            event
                          </span>
                          <span className="text-sm font-mono text-[oklch(0.78_0.22_195)]">{ev.name}</span>
                        </div>
                        {ev.inputs && ev.inputs.map((inp: any) => (
                          <div key={inp.name} className="flex gap-3 text-xs font-mono ml-4">
                            <span className="text-[oklch(0.68_0.28_295)]">{inp.type}</span>
                            {inp.indexed && (
                              <span className="text-[oklch(0.55_0.04_220)] text-[10px]">indexed</span>
                            )}
                            <span className="text-[oklch(0.82_0.05_200)]">{inp.name}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Full ABI JSON */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-['Orbitron'] font-bold text-[oklch(0.55_0.04_220)] tracking-wider">
                      FULL ABI (JSON)
                    </h3>
                    <CopyButton text={JSON.stringify(ESCROW_ABI, null, 2)} />
                  </div>
                  <div className="cyber-card rounded-xl overflow-hidden">
                    <pre className="p-4 text-xs font-mono text-[oklch(0.82_0.05_200)] overflow-x-auto max-h-64 overflow-y-auto leading-relaxed">
                      {JSON.stringify(ESCROW_ABI, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Deploy Guide" && (
              <div className="cyber-card rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-[oklch(0.78_0.22_195/0.15)] bg-[oklch(0.09_0.02_260)]">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[oklch(0.78_0.22_195)]" />
                    <span className="text-xs font-mono text-[oklch(0.55_0.04_220)]">deployment-guide.md</span>
                  </div>
                  <CopyButton text={DEPLOYMENT_GUIDE} />
                </div>
                <pre className="p-6 text-xs font-mono text-[oklch(0.82_0.05_200)] overflow-x-auto leading-relaxed whitespace-pre-wrap">
                  {DEPLOYMENT_GUIDE}
                </pre>
              </div>
            )}
          </motion.div>
        </div>
      </div>
      <AIChatWidget />
    </div>
  );
}
