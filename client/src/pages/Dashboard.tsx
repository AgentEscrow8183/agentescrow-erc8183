import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Link } from "wouter";
import { Plus, Filter, RefreshCw, ExternalLink, Clock, Wallet } from "lucide-react";
import Navbar from "@/components/Navbar";
import AIChatWidget from "@/components/AIChatWidget";
import CreateJobModal from "@/components/CreateJobModal";
import { trpc } from "@/lib/trpc";
import { JOB_STATE_BADGE, type JobState } from "@/lib/web3";
import { formatDistanceToNow } from "date-fns";

type RoleFilter = "all" | "client" | "provider" | "evaluator";
type StateFilter = "all" | JobState;

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function StateBadge({ state }: { state: JobState }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-mono font-semibold uppercase tracking-wider ${JOB_STATE_BADGE[state]}`}
    >
      {state}
    </span>
  );
}

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [stateFilter, setStateFilter] = useState<StateFilter>("all");
  const [showCreate, setShowCreate] = useState(false);

  const { data: jobs = [], isLoading, refetch } = trpc.jobs.list.useQuery(
    {
      address: address ?? undefined,
      role: roleFilter !== "all" ? roleFilter : undefined,
      state: stateFilter !== "all" ? stateFilter : undefined,
    },
    { enabled: true, refetchInterval: 30_000 }
  );

  const roleFilters: { value: RoleFilter; label: string }[] = [
    { value: "all", label: "All Jobs" },
    { value: "client", label: "As Client" },
    { value: "provider", label: "As Provider" },
    { value: "evaluator", label: "As Evaluator" },
  ];

  const stateFilters: { value: StateFilter; label: string }[] = [
    { value: "all", label: "All States" },
    { value: "open", label: "Open" },
    { value: "funded", label: "Funded" },
    { value: "submitted", label: "Submitted" },
    { value: "completed", label: "Completed" },
    { value: "rejected", label: "Rejected" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        {/* Header */}
        <div className="border-b border-[oklch(0.78_0.22_195/0.1)] bg-[oklch(0.09_0.02_260)]">
          <div className="container py-4 sm:py-6 px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-['Orbitron'] font-bold text-[oklch(0.92_0.02_200)]">
                  JOB DASHBOARD
                </h1>
                <p className="text-sm text-[oklch(0.55_0.04_220)] mt-1">
                  {isConnected
                    ? `Connected: ${shortAddr(address!)}`
                    : "Connect wallet to manage your jobs"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => refetch()}
                  className="p-2 text-[oklch(0.55_0.04_220)] hover:text-[oklch(0.78_0.22_195)] transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                {isConnected && (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowCreate(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[oklch(0.72_0.22_195)] text-[oklch(0.07_0.015_260)] font-['Orbitron'] font-bold text-xs tracking-wider rounded glow-cyan hover:bg-[oklch(0.78_0.22_195)] transition-all"
                  >
                    <Plus className="w-4 h-4" /> CREATE JOB
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container py-4 sm:py-6 px-4 sm:px-6">
          {!isConnected ? (
            /* Not connected state */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-24 gap-6"
            >
              <div className="w-16 h-16 rounded-full bg-[oklch(0.72_0.22_195/0.1)] border border-[oklch(0.72_0.22_195/0.3)] flex items-center justify-center glow-cyan">
                <Wallet className="w-8 h-8 text-[oklch(0.78_0.22_195)]" />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-['Orbitron'] font-bold text-[oklch(0.92_0.02_200)] mb-2">
                  CONNECT YOUR WALLET
                </h2>
                <p className="text-sm text-[oklch(0.55_0.04_220)] max-w-sm">
                  Connect your Web3 wallet to view and manage your job escrows on the ERC-8183 protocol.
                </p>
              </div>
              <ConnectButton />
            </motion.div>
          ) : (
            <>
              {/* Filters */}
              <div className="flex flex-col gap-3 mb-5 sm:mb-6">
                <div className="flex items-center gap-2 flex-wrap">
                  <Filter className="w-4 h-4 text-[oklch(0.55_0.04_220)] shrink-0" />
                  <div className="flex gap-1 flex-wrap">
                    {roleFilters.map((f) => (
                      <button
                        key={f.value}
                        onClick={() => setRoleFilter(f.value)}
                        className={`px-3 py-1 text-xs font-mono rounded border transition-all ${
                          roleFilter === f.value
                            ? "bg-[oklch(0.72_0.22_195/0.2)] border-[oklch(0.72_0.22_195/0.5)] text-[oklch(0.78_0.22_195)]"
                            : "border-[oklch(0.2_0.03_260)] text-[oklch(0.55_0.04_220)] hover:border-[oklch(0.78_0.22_195/0.3)]"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {stateFilters.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setStateFilter(f.value)}
                      className={`px-3 py-1 text-xs font-mono rounded border transition-all ${
                        stateFilter === f.value
                          ? "bg-[oklch(0.65_0.28_295/0.2)] border-[oklch(0.65_0.28_295/0.5)] text-[oklch(0.68_0.28_295)]"
                          : "border-[oklch(0.2_0.03_260)] text-[oklch(0.55_0.04_220)] hover:border-[oklch(0.65_0.28_295/0.3)]"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-5 sm:mb-6">
                {[
                  { label: "Total Jobs", val: jobs.length },
                  { label: "Active", val: jobs.filter((j) => ["open", "funded", "submitted"].includes(j.state)).length },
                  { label: "Completed", val: jobs.filter((j) => j.state === "completed").length },
                  { label: "Rejected", val: jobs.filter((j) => j.state === "rejected").length },
                ].map((s) => (
                  <div key={s.label} className="cyber-card rounded-lg p-4">
                    <div className="text-2xl font-['Orbitron'] font-bold text-[oklch(0.78_0.22_195)]">{s.val}</div>
                    <div className="text-xs text-[oklch(0.55_0.04_220)] mt-1">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Job table */}
              {isLoading ? (
                <div className="flex items-center justify-center py-16 gap-3 text-[oklch(0.55_0.04_220)]">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span className="font-mono text-sm">Loading jobs...</span>
                </div>
              ) : jobs.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="cyber-card rounded-xl p-12 text-center"
                >
                  <p className="text-[oklch(0.55_0.04_220)] mb-4">No jobs found for the current filters.</p>
                  <button
                    onClick={() => setShowCreate(true)}
                    className="text-sm text-[oklch(0.78_0.22_195)] hover:underline"
                  >
                    Create your first job →
                  </button>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {jobs.map((job, i) => {
                      const myRole =
                        job.clientAddress === address?.toLowerCase()
                          ? "Client"
                          : job.providerAddress === address?.toLowerCase()
                          ? "Provider"
                          : job.evaluatorAddress === address?.toLowerCase()
                          ? "Evaluator"
                          : null;

                      return (
                        <motion.div
                          key={job.jobId}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="cyber-card rounded-lg p-4 hover:border-[oklch(0.78_0.22_195/0.4)] transition-all group"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-1">
                                <StateBadge state={job.state as JobState} />
                                {myRole && (
                                  <span className="text-[10px] font-mono text-[oklch(0.68_0.28_295)] border border-[oklch(0.68_0.28_295/0.3)] px-1.5 py-0.5 rounded">
                                    {myRole}
                                  </span>
                                )}
                              </div>
                              <h3 className="font-['Orbitron'] font-semibold text-sm text-[oklch(0.92_0.02_200)] truncate">
                                {job.title ?? `Job #${job.jobId.slice(0, 8)}`}
                              </h3>
                              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1 text-[10px] font-mono text-[oklch(0.55_0.04_220)]">
                                <span>Client: {shortAddr(job.clientAddress)}</span>
                                <span className="hidden sm:inline">Provider: {shortAddr(job.providerAddress)}</span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <div className="text-sm font-['Orbitron'] font-bold text-[oklch(0.78_0.22_195)]">
                                  {Number(job.amount) / 1e18} ETH
                                </div>
                                <div className="text-[10px] font-mono text-[oklch(0.55_0.04_220)]">
                                  {shortAddr(job.tokenAddress)}
                                </div>
                              </div>
                              <Link href={`/jobs/${job.jobId}`}>
                                <button className="p-2 text-[oklch(0.55_0.04_220)] hover:text-[oklch(0.78_0.22_195)] transition-colors group-hover:text-[oklch(0.78_0.22_195)]">
                                  <ExternalLink className="w-4 h-4" />
                                </button>
                              </Link>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Create Job Modal */}
      <CreateJobModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={() => {
          setShowCreate(false);
          refetch();
        }}
      />

      <AIChatWidget />
    </div>
  );
}
