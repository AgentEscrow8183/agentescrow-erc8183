/* ==========================================================
   RolesSection — AgentEscrow ERC-8183
   Design: Three-column role cards with permissions matrix
   Responsive: single column on mobile, 3-col on lg+
   ========================================================== */

import { User, Cpu, Scale, Check, X } from "lucide-react";

const roles = [
  {
    icon: <User className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: "Client",
    subtitle: "Job Creator & Funder",
    color: "text-[oklch(0.72_0.18_195)]",
    bg: "bg-[oklch(0.72_0.18_195/0.08)]",
    border: "border-[oklch(0.72_0.18_195/0.2)]",
    glow: "rgba(114, 232, 218, 0.1)",
    description:
      "Creates the job with description, sets the provider and evaluator, locks funds into escrow, and receives refund on rejection or expiry.",
    permissions: [
      { action: "createJob()", allowed: true },
      { action: "setProvider()", allowed: true },
      { action: "setBudget()", allowed: true },
      { action: "fund()", allowed: true },
      { action: "reject() [Open only]", allowed: true },
      { action: "submit()", allowed: false },
      { action: "complete()", allowed: false },
    ],
    note: "Can set evaluator = self to act as both client and evaluator (no third party needed).",
  },
  {
    icon: <Cpu className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: "Provider",
    subtitle: "Work Executor",
    color: "text-[oklch(0.78_0.18_75)]",
    bg: "bg-[oklch(0.78_0.18_75/0.08)]",
    border: "border-[oklch(0.78_0.18_75/0.2)]",
    glow: "rgba(200, 180, 80, 0.1)",
    description:
      "Executes the task off-chain and submits a deliverable reference (bytes32 hash). Receives payment when the evaluator marks the job completed.",
    permissions: [
      { action: "setBudget()", allowed: true },
      { action: "submit()", allowed: true },
      { action: "createJob()", allowed: false },
      { action: "fund()", allowed: false },
      { action: "complete()", allowed: false },
      { action: "reject()", allowed: false },
      { action: "claimRefund()", allowed: false },
    ],
    note: "May be set at job creation or later via setProvider(). Supports bidding flows.",
  },
  {
    icon: <Scale className="w-5 h-5 sm:w-6 sm:h-6" />,
    title: "Evaluator",
    subtitle: "Attestation Authority",
    color: "text-[oklch(0.55_0.22_290)]",
    bg: "bg-[oklch(0.55_0.22_290/0.08)]",
    border: "border-[oklch(0.55_0.22_290/0.2)]",
    glow: "rgba(139, 92, 246, 0.1)",
    description:
      "Single address per job. The only party who can mark a job Completed or Rejected after submission. Can be a smart contract that verifies ZK proofs.",
    permissions: [
      { action: "complete() [Submitted]", allowed: true },
      { action: "reject() [Funded/Submitted]", allowed: true },
      { action: "createJob()", allowed: false },
      { action: "fund()", allowed: false },
      { action: "submit()", allowed: false },
      { action: "setBudget()", allowed: false },
      { action: "setProvider()", allowed: false },
    ],
    note: "MAY be a smart contract — enables ZK proof verification, off-chain signal aggregation, or reputation-based evaluation.",
  },
];

export default function RolesSection() {
  return (
    <section id="roles" className="py-16 sm:py-24 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] rounded-full bg-[oklch(0.72_0.18_195/0.03)] blur-3xl pointer-events-none" />

      <div className="container relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
          <p className="section-label mb-3">Roles</p>
          <h2
            className="text-3xl sm:text-4xl font-bold text-white mb-4 sm:mb-5"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Three Roles,{" "}
            <span className="gradient-text-teal">One Protocol</span>
          </h2>
          <p className="text-[oklch(0.65_0.03_220)] leading-relaxed text-sm sm:text-base">
            Every job has exactly three participants. Each role has distinct permissions enforced
            by the smart contract — no role can perform another's actions.
          </p>
        </div>

        {/* Role cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
          {roles.map((role) => (
            <div
              key={role.title}
              className={`glass-card glass-card-hover p-5 sm:p-6 border ${role.border} flex flex-col`}
              style={{ boxShadow: `0 0 40px ${role.glow}` }}
            >
              {/* Role header */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`flex-shrink-0 p-2.5 rounded-xl ${role.bg} ${role.color}`}>
                  {role.icon}
                </div>
                <div>
                  <h3
                    className={`text-base sm:text-lg font-bold ${role.color}`}
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {role.title}
                  </h3>
                  <p className="text-[oklch(0.55_0.03_220)] text-xs">{role.subtitle}</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-[oklch(0.65_0.03_220)] text-xs sm:text-sm leading-relaxed mb-4">
                {role.description}
              </p>

              {/* Permissions */}
              <div className="flex-1 mb-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[oklch(0.5_0.03_220)] mb-2">
                  Permissions
                </p>
                <div className="flex flex-col gap-1.5">
                  {role.permissions.map((perm) => (
                    <div key={perm.action} className="flex items-center gap-2">
                      <div className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${
                        perm.allowed
                          ? "bg-[oklch(0.7_0.18_145/0.15)]"
                          : "bg-[oklch(0.65_0.22_25/0.1)]"
                      }`}>
                        {perm.allowed
                          ? <Check className="w-2.5 h-2.5 text-[oklch(0.7_0.18_145)]" />
                          : <X className="w-2.5 h-2.5 text-[oklch(0.65_0.22_25/0.6)]" />
                        }
                      </div>
                      <code className={`text-[11px] font-mono ${
                        perm.allowed ? "text-[oklch(0.75_0.03_220)]" : "text-[oklch(0.45_0.03_220)]"
                      }`}>
                        {perm.action}
                      </code>
                    </div>
                  ))}
                </div>
              </div>

              {/* Note */}
              <div className={`p-3 rounded-xl ${role.bg} border ${role.border} mt-auto`}>
                <p className={`text-[11px] leading-relaxed ${role.color} opacity-90`}>
                  {role.note}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
