/* ==========================================================
   OverviewSection — AgentEscrow ERC-8183
   Design: Abstract + motivation section with glass cards
   Responsive: mobile-first single column, 2-col on md+
   ========================================================== */

import { Lock, CheckCircle, Clock, Layers } from "lucide-react";

const features = [
  {
    icon: <Lock className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: "Trustless Escrow",
    description:
      "Client locks funds on-chain. Funds are only released when the evaluator attests completion — no intermediaries, no trust required.",
    color: "text-[oklch(0.72_0.18_195)]",
    bg: "bg-[oklch(0.72_0.18_195/0.08)]",
    border: "border-[oklch(0.72_0.18_195/0.2)]",
  },
  {
    icon: <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: "Evaluator Attestation",
    description:
      "A single evaluator address per job — can be the client, a third party, or a smart contract that verifies ZK proofs or aggregates off-chain signals.",
    color: "text-[oklch(0.55_0.22_290)]",
    bg: "bg-[oklch(0.55_0.22_290/0.08)]",
    border: "border-[oklch(0.55_0.22_290/0.2)]",
  },
  {
    icon: <Clock className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: "Automatic Expiry",
    description:
      "Jobs have an expiredAt timestamp. After expiry, anyone can trigger claimRefund — ensuring clients always have a recovery path without explicit rejection.",
    color: "text-[oklch(0.78_0.18_75)]",
    bg: "bg-[oklch(0.78_0.18_75/0.08)]",
    border: "border-[oklch(0.78_0.18_75/0.2)]",
  },
  {
    icon: <Layers className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: "Composable Hooks",
    description:
      "Optional hook contracts extend the protocol without modifying the core. Add bidding, KYC checks, reputation updates, or custom fee logic via IACPHook.",
    color: "text-[oklch(0.7_0.18_145)]",
    bg: "bg-[oklch(0.7_0.18_145/0.08)]",
    border: "border-[oklch(0.7_0.18_145/0.2)]",
  },
];

export default function OverviewSection() {
  return (
    <section id="overview" className="py-16 sm:py-24 relative">
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/4 w-64 sm:w-96 h-64 sm:h-96 rounded-full bg-[oklch(0.55_0.22_290/0.05)] blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-64 sm:w-96 h-64 sm:h-96 rounded-full bg-[oklch(0.72_0.18_195/0.05)] blur-3xl pointer-events-none" />

      <div className="container relative z-10">
        {/* Header */}
        <div className="max-w-2xl mb-10 sm:mb-16">
          <p className="section-label mb-3">Abstract</p>
          <h2
            className="text-3xl sm:text-4xl font-bold text-white mb-4 sm:mb-5 leading-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            The Minimal Protocol for{" "}
            <span className="gradient-text-teal">Agent Commerce</span>
          </h2>
          <p className="text-[oklch(0.65_0.03_220)] text-base sm:text-lg leading-relaxed">
            ERC-8183 defines the <strong className="text-white">Agentic Commerce Protocol</strong>: a job with
            escrowed budget, four states (Open → Funded → Submitted → Terminal), and an evaluator
            who alone may mark the job completed. Designed to be small, composable, and trustless.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {features.map((feature) => (
            <div
              key={feature.title}
              className={`glass-card glass-card-hover p-5 sm:p-6 border ${feature.border}`}
            >
              <div className={`inline-flex p-2.5 sm:p-3 rounded-xl ${feature.bg} ${feature.color} mb-3 sm:mb-4`}>
                {feature.icon}
              </div>
              <h3
                className="text-base sm:text-lg font-bold text-white mb-2"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {feature.title}
              </h3>
              <p className="text-[oklch(0.65_0.03_220)] text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Quote block */}
        <div className="mt-8 sm:mt-12 gradient-border p-5 sm:p-8">
          <blockquote className="text-[oklch(0.75_0.03_220)] text-base sm:text-lg leading-relaxed italic">
            "Many use cases need only: client locks funds, provider submits work, one attester
            (evaluator) signals 'done' and triggers payment — or client rejects or timeout triggers
            refund. The Agentic Commerce Protocol specifies that minimal surface so implementations
            stay small and composable."
          </blockquote>
          <div className="mt-4 flex items-center gap-3">
            <div className="w-6 sm:w-8 h-px bg-[oklch(0.72_0.18_195/0.5)]" />
            <span className="text-xs sm:text-sm text-[oklch(0.55_0.03_220)] font-mono">
              ERC-8183 Motivation
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
