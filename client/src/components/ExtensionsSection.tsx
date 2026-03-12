/* ==========================================================
   ExtensionsSection — AgentEscrow ERC-8183
   Design: Hooks, use cases, and extensions with escrow vault image
   ========================================================== */

import { Puzzle, Gavel, ArrowLeftRight, Star, Zap, ExternalLink } from "lucide-react";

const ESCROW_VAULT = "https://d2xsxph8kpxj0f.cloudfront.net/310519663364387669/fEjhcY4s7LeuDVrQJHn5VB/escrow-vault-mXYZEGUpx2xet6yAyC3guk.webp";

const hookUseCases = [
  {
    icon: <Gavel className="w-4 h-4 sm:w-5 sm:h-5" />,
    title: "KYC / Allowlist Gate",
    description: "Pre-fund validation — verify identity or whitelist status before allowing job funding.",
    color: "text-[oklch(0.72_0.18_195)]",
    bg: "bg-[oklch(0.72_0.18_195/0.08)]",
  },
  {
    icon: <Star className="w-4 h-4 sm:w-5 sm:h-5" />,
    title: "Reputation Updates",
    description: "Post-complete — write attestations to ERC-8004 reputation registry on job completion.",
    color: "text-[oklch(0.55_0.22_290)]",
    bg: "bg-[oklch(0.55_0.22_290/0.08)]",
  },
  {
    icon: <ArrowLeftRight className="w-4 h-4 sm:w-5 sm:h-5" />,
    title: "Fund Transfer Hook",
    description: "Two-phase escrow — provider deposits output tokens before job completes, released to buyer atomically.",
    color: "text-[oklch(0.78_0.18_75)]",
    bg: "bg-[oklch(0.78_0.18_75/0.08)]",
  },
  {
    icon: <Zap className="w-4 h-4 sm:w-5 sm:h-5" />,
    title: "Bidding Hook",
    description: "Open bidding — providers sign off-chain bids; hook verifies winning bid signature via setProvider.",
    color: "text-[oklch(0.7_0.18_145)]",
    bg: "bg-[oklch(0.7_0.18_145/0.08)]",
  },
  {
    icon: <Puzzle className="w-4 h-4 sm:w-5 sm:h-5" />,
    title: "Custom Fee Logic",
    description: "Override platform fee distribution — split payments, add milestone-based releases, or custom treasury routing.",
    color: "text-[oklch(0.65_0.22_25)]",
    bg: "bg-[oklch(0.65_0.22_25/0.08)]",
  },
];

const extensions = [
  {
    title: "ERC-8004 Reputation",
    badge: "Recommended",
    badgeColor: "bg-[oklch(0.72_0.18_195/0.15)] text-[oklch(0.85_0.18_195)] border border-[oklch(0.72_0.18_195/0.3)]",
    description:
      "Integrate with ERC-8004 (Trustless Agents) for on-chain reputation. Map job outcomes to trust signals: Completed → positive signal for provider, Rejected → negative/neutral signal.",
    href: "https://eips.ethereum.org/EIPS/eip-8004",
  },
  {
    title: "ERC-2771 Meta-Transactions",
    badge: "Optional",
    badgeColor: "bg-[oklch(0.55_0.22_290/0.15)] text-[oklch(0.75_0.22_290)] border border-[oklch(0.55_0.22_290/0.3)]",
    description:
      "Enable gasless transactions via trusted forwarders. Inherit from ERC2771Context and use _msgSender() for all authorization checks. Allows AI agents to transact without holding ETH.",
    href: "https://eips.ethereum.org/EIPS/eip-2771",
  },
  {
    title: "ERC-2612 Permit",
    badge: "Optional",
    badgeColor: "bg-[oklch(0.78_0.18_75/0.15)] text-[oklch(0.9_0.18_75)] border border-[oklch(0.78_0.18_75/0.3)]",
    description:
      "Use ERC-2612 permit for gasless single-transaction approve + fund flows. Client signs a permit off-chain; relayer calls permit() + fund() in one transaction.",
    href: "https://eips.ethereum.org/EIPS/eip-2612",
  },
];

export default function ExtensionsSection() {
  return (
    <section id="extensions" className="py-16 sm:py-24 relative">
      <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 rounded-full bg-[oklch(0.55_0.22_290/0.06)] blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 sm:w-80 h-64 sm:h-80 rounded-full bg-[oklch(0.72_0.18_195/0.04)] blur-3xl pointer-events-none" />

      <div className="container relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
          <p className="section-label mb-3">Extensions</p>
          <h2
            className="text-3xl sm:text-4xl font-bold text-white mb-4 sm:mb-5"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Composable by{" "}
            <span className="gradient-text-teal">Design</span>
          </h2>
          <p className="text-[oklch(0.65_0.03_220)] leading-relaxed text-sm sm:text-base">
            ERC-8183 is minimal by design. Extend it with hooks and integrations without modifying
            the core protocol — composability is a first-class feature.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-14 items-start">

          {/* Left: Hooks */}
          <div>
            {/* Hook interface */}
            <div className="glass-card p-4 sm:p-5 border border-white/[0.08] mb-5 sm:mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Puzzle className="w-4 h-4 text-[oklch(0.72_0.18_195)]" />
                <h3
                  className="text-sm sm:text-base font-bold text-white"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  IACPHook Interface
                </h3>
              </div>
              <div className="code-block p-3 sm:p-4 overflow-x-auto">
                <pre className="text-[oklch(0.72_0.18_195)] text-[11px] sm:text-xs leading-relaxed whitespace-pre">{`interface IACPHook {
  function beforeAction(
    uint256 jobId,
    bytes4  action,
    address caller,
    bytes calldata data
  ) external;

  function afterAction(
    uint256 jobId,
    bytes4  action,
    address caller,
    bytes calldata data
  ) external;
}`}</pre>
              </div>
            </div>

            {/* Hook use cases */}
            <div className="flex flex-col gap-3">
              {hookUseCases.map((uc) => (
                <div
                  key={uc.title}
                  className="glass-card glass-card-hover p-3.5 sm:p-4 flex items-start gap-3"
                >
                  <div className={`flex-shrink-0 p-2 rounded-lg ${uc.bg} ${uc.color}`}>
                    {uc.icon}
                  </div>
                  <div>
                    <h4 className="text-white text-xs sm:text-sm font-semibold mb-0.5">{uc.title}</h4>
                    <p className="text-[oklch(0.6_0.03_220)] text-xs leading-relaxed">{uc.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Extensions + Image */}
          <div className="flex flex-col gap-5 sm:gap-6">
            {/* Vault image */}
            <div className="rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl">
              <img
                src={ESCROW_VAULT}
                alt="Escrow Vault"
                className="w-full h-auto object-cover"
                loading="lazy"
              />
            </div>

            {/* Extension cards */}
            <div className="flex flex-col gap-3 sm:gap-4">
              {extensions.map((ext) => (
                <a
                  key={ext.title}
                  href={ext.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-card glass-card-hover p-4 sm:p-5 border border-white/[0.08] block group"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4
                        className="text-white text-sm sm:text-base font-bold group-hover:text-[oklch(0.85_0.18_195)] transition-colors"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        {ext.title}
                      </h4>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${ext.badgeColor}`}>
                        {ext.badge}
                      </span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-[oklch(0.45_0.03_220)] group-hover:text-[oklch(0.72_0.18_195)] transition-colors flex-shrink-0 mt-0.5" />
                  </div>
                  <p className="text-[oklch(0.6_0.03_220)] text-xs sm:text-sm leading-relaxed">{ext.description}</p>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
