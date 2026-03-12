/* ==========================================================
   SpecificationSection — AgentEscrow ERC-8183
   Design: Technical specification with tabbed code examples
   ========================================================== */

import { useState } from "react";
import { Copy, Check } from "lucide-react";

const codeExamples = {
  "Job Data": `// Each job SHALL have at least:
struct Job {
  address client;       // Job creator & funder
  address provider;     // Work executor (MAY be zero at creation)
  address evaluator;    // Attestation authority
  string  description;  // Job brief, scope reference
  uint256 budget;       // Escrowed amount (ERC-20)
  uint256 expiredAt;    // Unix timestamp for expiry
  Status  status;       // Open | Funded | Submitted | ...
  address hook;         // Optional hook contract (or address(0))
}

enum Status {
  Open,
  Funded,
  Submitted,
  Completed,
  Rejected,
  Expired
}`,
  "Core Functions": `// Create a new job
function createJob(
  address provider,    // MAY be address(0) for bidding
  address evaluator,   // MUST NOT be zero
  uint256 expiredAt,   // MUST be in the future
  string calldata description,
  address hook         // OPTIONAL: address(0) = no hook
) external returns (uint256 jobId);

// Set provider (if not set at creation)
function setProvider(uint256 jobId, address provider) external;

// Agree on price
function setBudget(uint256 jobId, uint256 amount) external;

// Lock funds into escrow
function fund(uint256 jobId, uint256 expectedBudget) external;

// Provider submits work
function submit(uint256 jobId, bytes32 deliverable) external;

// Evaluator approves → releases escrow to provider
function complete(uint256 jobId, bytes32 reason) external;

// Evaluator/client rejects → refunds escrow to client
function reject(uint256 jobId, bytes32 reason) external;

// Claim refund after expiry (not hookable)
function claimRefund(uint256 jobId) external;`,
  "Events": `// Emitted on each lifecycle event
event JobCreated(
  uint256 indexed jobId,
  address indexed client,
  address provider,
  address evaluator,
  uint256 expiredAt
);

event ProviderSet(uint256 indexed jobId, address provider);
event BudgetSet(uint256 indexed jobId, uint256 amount);
event JobFunded(uint256 indexed jobId, address client, uint256 amount);

event JobSubmitted(
  uint256 indexed jobId,
  address provider,
  bytes32 deliverable
);

event JobCompleted(
  uint256 indexed jobId,
  address evaluator,
  bytes32 reason
);

event JobRejected(
  uint256 indexed jobId,
  address rejector,
  bytes32 reason
);

event JobExpired(uint256 indexed jobId);
event PaymentReleased(uint256 indexed jobId, address provider, uint256 amount);
event Refunded(uint256 indexed jobId, address client, uint256 amount);`,
  "Meta-TX (ERC-2771)": `import {ERC2771Context} from 
  "@openzeppelin/contracts/metatx/ERC2771Context.sol";

contract AgenticCommerce is ERC2771Context {
  constructor(address trustedForwarder)
    ERC2771Context(trustedForwarder) {}

  // Use _msgSender() instead of msg.sender
  // for ALL authorization checks
  function fund(
    uint256 jobId,
    uint256 expectedBudget
  ) external {
    Job storage job = jobs[jobId];
    // ✅ Correct: uses _msgSender()
    if (_msgSender() != job.client) revert Unauthorized();
    if (job.budget != expectedBudget) revert BudgetMismatch();
    // ... transfer tokens to escrow
  }
}`,
};

type SeverityLevel = "high" | "medium" | "low";

const securityConsiderations: { title: string; description: string; severity: SeverityLevel }[] = [
  {
    title: "Front-running Protection",
    description:
      "fund() requires expectedBudget == job.budget. If a provider changes the budget between setBudget and fund, the transaction reverts — protecting clients from bait-and-switch attacks.",
    severity: "high",
  },
  {
    title: "Evaluator Trust",
    description:
      "The evaluator is fully trusted. A malicious evaluator can reject valid work or complete invalid work. Choose evaluators carefully — or use a smart contract evaluator with verifiable logic.",
    severity: "high",
  },
  {
    title: "Hook Liveness",
    description:
      "A reverting hook blocks all hookable actions until expiredAt. This is by design — claimRefund() is the guaranteed recovery path and is deliberately not hookable.",
    severity: "medium",
  },
  {
    title: "Token Approval",
    description:
      "Client must approve the contract to pull job.budget tokens before calling fund(). Use ERC-2612 permit for gasless single-transaction approve + fund flows.",
    severity: "low",
  },
];

const severityColors = {
  high: "text-[oklch(0.65_0.22_25)] bg-[oklch(0.65_0.22_25/0.1)] border-[oklch(0.65_0.22_25/0.3)]",
  medium: "text-[oklch(0.78_0.18_75)] bg-[oklch(0.78_0.18_75/0.1)] border-[oklch(0.78_0.18_75/0.3)]",
  low: "text-[oklch(0.72_0.18_195)] bg-[oklch(0.72_0.18_195/0.1)] border-[oklch(0.72_0.18_195/0.3)]",
};

export default function SpecificationSection() {
  const [activeTab, setActiveTab] = useState<keyof typeof codeExamples>("Job Data");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(codeExamples[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="specification" className="py-16 sm:py-24 relative">
      {/* Ambient */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[oklch(0.72_0.18_195/0.04)] blur-3xl pointer-events-none" />

      <div className="container relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
          <p className="section-label mb-3">Specification</p>
          <h2
            className="text-3xl sm:text-4xl font-bold text-white mb-4 sm:mb-5"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Technical{" "}
            <span className="gradient-text-teal">Reference</span>
          </h2>
          <p className="text-[oklch(0.65_0.03_220)] leading-relaxed text-sm sm:text-base">
            Full Solidity interface, events, and security considerations for implementing ERC-8183.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Code examples — 2/3 width */}
          <div className="lg:col-span-2">
            <div className="glass-card overflow-hidden border border-white/[0.08]">
              {/* Tab bar */}
              <div className="flex items-center gap-1 px-4 py-3 border-b border-white/[0.06] overflow-x-auto">
                <div className="flex gap-1.5 mr-3 flex-shrink-0">
                  <div className="w-3 h-3 rounded-full bg-[oklch(0.65_0.22_25/0.6)]" />
                  <div className="w-3 h-3 rounded-full bg-[oklch(0.78_0.18_75/0.6)]" />
                  <div className="w-3 h-3 rounded-full bg-[oklch(0.7_0.18_145/0.6)]" />
                </div>
                {(Object.keys(codeExamples) as Array<keyof typeof codeExamples>).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all whitespace-nowrap ${
                      activeTab === tab
                        ? "bg-[oklch(0.72_0.18_195/0.15)] text-[oklch(0.85_0.18_195)]"
                        : "text-[oklch(0.55_0.03_220)] hover:text-[oklch(0.75_0.03_220)]"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
                <button
                  onClick={handleCopy}
                  className="ml-auto flex-shrink-0 p-1.5 rounded-md text-[oklch(0.55_0.03_220)] hover:text-white hover:bg-white/[0.05] transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[oklch(0.7_0.18_145)]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Code content */}
              <div className="p-5 overflow-x-auto">
                <pre className="text-xs font-mono text-[oklch(0.72_0.18_195)] leading-relaxed whitespace-pre">
                  {codeExamples[activeTab]}
                </pre>
              </div>
            </div>
          </div>

          {/* Security considerations — 1/3 width */}
          <div>
            <h3
              className="text-base font-bold text-white mb-4"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Security Considerations
            </h3>
            <div className="flex flex-col gap-3">
              {securityConsiderations.map((item) => (
                <div
                  key={item.title}
                  className={`p-4 rounded-xl border ${severityColors[item.severity]}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${severityColors[item.severity]}`}
                    >
                      {item.severity}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1.5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {item.title}
                  </h4>
                  <p className="text-xs text-[oklch(0.6_0.03_220)] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>

            {/* EIP link */}
            <div className="mt-6 glass-card p-4 border border-[oklch(0.72_0.18_195/0.15)]">
              <p className="text-xs text-[oklch(0.55_0.03_220)] mb-2">Official Specification</p>
              <a
                href="https://eips.ethereum.org/EIPS/eip-8183"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-[oklch(0.72_0.18_195)] hover:text-[oklch(0.85_0.18_195)] transition-colors"
              >
                eips.ethereum.org/EIPS/eip-8183 ↗
              </a>
              <p className="text-xs text-[oklch(0.5_0.03_220)] mt-1">
                Authors: Davide Crapis, Bryan Lim, Tay Weixiong, Chooi Zuhwa
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
