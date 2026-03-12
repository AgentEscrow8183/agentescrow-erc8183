/* ==========================================================
   StateMachineSection — AgentEscrow ERC-8183
   Design: Interactive state machine diagram with transitions
   Responsive: mobile-first, scrollable table on small screens
   ========================================================== */

import { useState } from "react";

const STATE_MACHINE_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663364387669/fEjhcY4s7LeuDVrQJHn5VB/state-machine-visual-EZGsJv5ewcEdpDMtmquJcu.webp";

const states = [
  {
    id: "open",
    label: "Open",
    className: "state-open",
    description: "Job created. Budget not yet set or not yet funded. Client may set budget, then fund or reject.",
    transitions: ["→ Funded (setBudget + fund)", "→ Rejected (client calls reject)"],
  },
  {
    id: "funded",
    label: "Funded",
    className: "state-funded",
    description: "Budget escrowed. Provider may submit work. Evaluator may reject. After expiredAt, anyone may trigger refund.",
    transitions: ["→ Submitted (provider calls submit)", "→ Rejected (evaluator calls reject)", "→ Expired (claimRefund after expiry)"],
  },
  {
    id: "submitted",
    label: "Submitted",
    className: "state-submitted",
    description: "Provider has submitted work. Only evaluator may complete or reject. After expiredAt, anyone may trigger refund.",
    transitions: ["→ Completed (evaluator calls complete)", "→ Rejected (evaluator calls reject)", "→ Expired (claimRefund after expiry)"],
  },
  {
    id: "completed",
    label: "Completed",
    className: "state-completed",
    description: "Terminal state. Escrow released to provider (minus optional platform fee). Job is done.",
    transitions: ["(Terminal — no further transitions)"],
  },
  {
    id: "rejected",
    label: "Rejected",
    className: "state-rejected",
    description: "Terminal state. Escrow refunded to client. Can be triggered by client (Open) or evaluator (Funded/Submitted).",
    transitions: ["(Terminal — no further transitions)"],
  },
  {
    id: "expired",
    label: "Expired",
    className: "state-expired",
    description: "Terminal state. Same as Rejected — escrow refunded to client. Triggered by claimRefund after expiredAt.",
    transitions: ["(Terminal — no further transitions)"],
  },
];

const transitions = [
  { from: "Open", to: "Funded", fn: "setBudget() + fund()", caller: "Client" },
  { from: "Open", to: "Rejected", fn: "reject()", caller: "Client" },
  { from: "Funded", to: "Submitted", fn: "submit()", caller: "Provider" },
  { from: "Funded", to: "Rejected", fn: "reject()", caller: "Evaluator" },
  { from: "Funded", to: "Expired", fn: "claimRefund()", caller: "Anyone" },
  { from: "Submitted", to: "Completed", fn: "complete()", caller: "Evaluator" },
  { from: "Submitted", to: "Rejected", fn: "reject()", caller: "Evaluator" },
  { from: "Submitted", to: "Expired", fn: "claimRefund()", caller: "Anyone" },
];

export default function StateMachineSection() {
  const [activeState, setActiveState] = useState<string | null>(null);
  const activeStateData = states.find((s) => s.id === activeState);

  return (
    <section id="state-machine" className="py-16 sm:py-24 relative">
      <div className="absolute top-1/3 right-0 w-64 sm:w-96 h-64 sm:h-96 rounded-full bg-[oklch(0.55_0.22_290/0.06)] blur-3xl pointer-events-none" />

      <div className="container relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
          <p className="section-label mb-3">State Machine</p>
          <h2
            className="text-3xl sm:text-4xl font-bold text-white mb-4 sm:mb-5"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Six States,{" "}
            <span className="gradient-text-teal">Eight Transitions</span>
          </h2>
          <p className="text-[oklch(0.65_0.03_220)] leading-relaxed text-sm sm:text-base">
            Every job follows a strict state machine. No shortcuts, no ambiguity — each transition
            is enforced by the smart contract.
          </p>
        </div>

        {/* Visual diagram */}
        <div className="rounded-2xl overflow-hidden border border-white/[0.08] mb-8 sm:mb-12 shadow-2xl">
          <img
            src={STATE_MACHINE_IMG}
            alt="ERC-8183 State Machine Diagram"
            className="w-full h-auto"
          />
        </div>

        {/* Interactive state cards */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3 mb-6 sm:mb-8">
          {states.map((state) => (
            <button
              key={state.id}
              onClick={() => setActiveState(activeState === state.id ? null : state.id)}
              className={`${state.className} px-2 sm:px-3 py-2.5 sm:py-3 rounded-xl text-center font-semibold text-xs sm:text-sm transition-all hover:scale-105 ${
                activeState === state.id ? "ring-2 ring-white/30 scale-105" : ""
              }`}
            >
              {state.label}
            </button>
          ))}
        </div>

        {/* State detail panel */}
        {activeStateData && (
          <div className="glass-card p-4 sm:p-6 border border-white/[0.08] mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
              <span className={`${activeStateData.className} px-3 py-1.5 rounded-lg text-sm font-bold flex-shrink-0`}>
                {activeStateData.label}
              </span>
              <div>
                <p className="text-[oklch(0.75_0.03_220)] mb-3 text-sm sm:text-base">{activeStateData.description}</p>
                <div className="flex flex-wrap gap-2">
                  {activeStateData.transitions.map((t) => (
                    <span
                      key={t}
                      className="text-xs font-mono px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[oklch(0.6_0.03_220)]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transitions table */}
        <div className="glass-card overflow-hidden border border-white/[0.08]">
          <div className="px-4 sm:px-6 py-4 border-b border-white/[0.06]">
            <h3
              className="text-sm sm:text-base font-bold text-white"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Allowed Transitions
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left px-4 sm:px-6 py-3 text-[oklch(0.55_0.03_220)] font-medium text-xs uppercase tracking-wider">From</th>
                  <th className="text-left px-4 sm:px-6 py-3 text-[oklch(0.55_0.03_220)] font-medium text-xs uppercase tracking-wider">To</th>
                  <th className="text-left px-4 sm:px-6 py-3 text-[oklch(0.55_0.03_220)] font-medium text-xs uppercase tracking-wider">Function</th>
                  <th className="text-left px-4 sm:px-6 py-3 text-[oklch(0.55_0.03_220)] font-medium text-xs uppercase tracking-wider">Caller</th>
                </tr>
              </thead>
              <tbody>
                {transitions.map((t, i) => (
                  <tr key={i} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 sm:px-6 py-3">
                      <span className={`state-${t.from.toLowerCase()} px-2 py-0.5 rounded text-xs font-mono`}>{t.from}</span>
                    </td>
                    <td className="px-4 sm:px-6 py-3">
                      <span className={`state-${t.to.toLowerCase()} px-2 py-0.5 rounded text-xs font-mono`}>{t.to}</span>
                    </td>
                    <td className="px-4 sm:px-6 py-3">
                      <code className="text-[oklch(0.72_0.18_195)] text-xs font-mono">{t.fn}</code>
                    </td>
                    <td className="px-4 sm:px-6 py-3">
                      <span className="text-[oklch(0.65_0.03_220)] text-xs">{t.caller}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
