/* ==========================================================
   HowItWorksSection — AgentEscrow ERC-8183
   Design: Step-by-step flow with animated connector lines
   Responsive: single column on mobile, 2-col on lg+
   ========================================================== */

const AGENT_NETWORK = "https://d2xsxph8kpxj0f.cloudfront.net/310519663364387669/fEjhcY4s7LeuDVrQJHn5VB/agent-network-RAmTHRzhEQWifvKEaC8rWf.webp";

const steps = [
  {
    num: "01",
    actor: "Client",
    actorColor: "text-[oklch(0.72_0.18_195)]",
    actorBg: "bg-[oklch(0.72_0.18_195/0.1)]",
    title: "Create & Fund Job",
    description:
      "Client calls createJob() specifying the provider, evaluator, expiry, and description. Then sets the budget and calls fund() to escrow tokens into the smart contract.",
    code: "createJob(provider, evaluator, expiredAt, description)\nsetBudget(jobId, amount)\nfund(jobId, expectedBudget)",
    state: "Open → Funded",
    stateColor: "state-funded",
  },
  {
    num: "02",
    actor: "Provider",
    actorColor: "text-[oklch(0.78_0.18_75)]",
    actorBg: "bg-[oklch(0.78_0.18_75/0.1)]",
    title: "Submit Work",
    description:
      "Provider completes the task off-chain and calls submit() with a deliverable reference — a bytes32 hash pointing to the work (IPFS CID, attestation commitment, etc.).",
    code: "submit(jobId, deliverable)\n// deliverable = bytes32 hash\n// e.g. IPFS CID or proof hash",
    state: "Funded → Submitted",
    stateColor: "state-submitted",
  },
  {
    num: "03",
    actor: "Evaluator",
    actorColor: "text-[oklch(0.55_0.22_290)]",
    actorBg: "bg-[oklch(0.55_0.22_290/0.1)]",
    title: "Evaluate & Attest",
    description:
      "Evaluator reviews the deliverable. If satisfied, calls complete() to release escrow to the provider. If not, calls reject() to refund the client.",
    code: "// If work is accepted:\ncomplete(jobId, reason?)\n// If work is rejected:\nreject(jobId, reason?)",
    state: "Submitted → Terminal",
    stateColor: "state-completed",
  },
  {
    num: "04",
    actor: "Anyone",
    actorColor: "text-[oklch(0.65_0.03_220)]",
    actorBg: "bg-[oklch(0.65_0.03_220/0.1)]",
    title: "Claim Refund (Expiry)",
    description:
      "If the job expires without resolution, anyone can call claimRefund() to return escrowed funds to the client. This path is deliberately not hookable.",
    code: "// After expiredAt timestamp:\nclaimRefund(jobId)\n// Funds returned to client",
    state: "Funded/Submitted → Expired",
    stateColor: "state-expired",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-16 sm:py-24 relative">
      <div className="absolute top-1/2 left-0 w-64 sm:w-80 h-64 sm:h-80 rounded-full bg-[oklch(0.72_0.18_195/0.04)] blur-3xl pointer-events-none" />

      <div className="container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">

          {/* Left: Image + intro */}
          <div className="lg:sticky lg:top-24">
            <p className="section-label mb-3">How It Works</p>
            <h2
              className="text-3xl sm:text-4xl font-bold text-white mb-4 sm:mb-5 leading-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Four Steps to{" "}
              <span className="gradient-text-teal">Trustless Commerce</span>
            </h2>
            <p className="text-[oklch(0.65_0.03_220)] leading-relaxed mb-6 sm:mb-8 text-sm sm:text-base">
              The protocol defines a minimal lifecycle: fund, work, submit, evaluate. Every
              transition is enforced on-chain — no party can skip steps or act out of sequence.
            </p>

            {/* Network image */}
            <div className="rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl">
              <img
                src={AGENT_NETWORK}
                alt="Agent Network"
                className="w-full h-auto object-cover"
                loading="lazy"
              />
            </div>
          </div>

          {/* Right: Steps */}
          <div className="flex flex-col gap-4 sm:gap-5">
            {steps.map((step, i) => (
              <div
                key={step.num}
                className="glass-card glass-card-hover p-4 sm:p-5 relative overflow-hidden"
              >
                {/* Step number watermark */}
                <div
                  className="absolute top-2 right-3 text-5xl sm:text-6xl font-black opacity-[0.04] select-none pointer-events-none"
                  style={{ fontFamily: "'Space Grotesk', sans-serif", color: "white" }}
                >
                  {step.num}
                </div>

                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-lg ${step.actorBg} flex items-center justify-center`}>
                    <span className={`text-xs font-bold font-mono ${step.actorColor}`}>{step.num}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold font-mono ${step.actorColor}`}>{step.actor}</span>
                      <span className={`${step.stateColor} px-2 py-0.5 rounded text-[10px] font-mono`}>{step.state}</span>
                    </div>
                    <h3
                      className="text-sm sm:text-base font-bold text-white leading-tight"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      {step.title}
                    </h3>
                  </div>
                </div>

                <p className="text-[oklch(0.65_0.03_220)] text-xs sm:text-sm leading-relaxed mb-3">
                  {step.description}
                </p>

                {/* Code snippet */}
                <div className="code-block p-3 overflow-x-auto">
                  <pre className="text-[oklch(0.72_0.18_195)] text-[11px] sm:text-xs leading-relaxed whitespace-pre">
                    {step.code}
                  </pre>
                </div>

                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="absolute -bottom-2.5 left-7 w-px h-5 bg-gradient-to-b from-white/[0.1] to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
