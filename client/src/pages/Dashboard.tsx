/* ==========================================================
   Dashboard Page — AgentEscrow ERC-8183
   Daftar jobs, create job, dan aksi on-chain
   ========================================================== */

import { useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Plus, Briefcase, Clock, CheckCircle2, XCircle,
  ArrowRight, ExternalLink, RefreshCw, User, Shield,
  Wallet, ChevronRight, AlertCircle, Code2
} from "lucide-react";
import { JOB_STATES, DEMO_TOKENS } from "@/lib/web3";
import CreateJobModal from "@/components/CreateJobModal";
import NotificationBell from "@/components/NotificationBell";
import { useWalletJobsPolling } from "@/hooks/useJobPolling";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663364387669/fEjhcY4s7LeuDVrQJHn5VB/ae-icon-v4-QFJAJsj8FMjz5GGVfkXy5E.webp";

const STATE_ICONS: Record<string, React.ReactNode> = {
  open: <Clock className="w-3.5 h-3.5" />,
  funded: <Wallet className="w-3.5 h-3.5" />,
  submitted: <Briefcase className="w-3.5 h-3.5" />,
  completed: <CheckCircle2 className="w-3.5 h-3.5" />,
  rejected: <XCircle className="w-3.5 h-3.5" />,
  expired: <AlertCircle className="w-3.5 h-3.5" />,
  cancelled: <XCircle className="w-3.5 h-3.5" />,
};

const STATE_COLORS: Record<string, string> = {
  open: "#2dd4bf",
  funded: "#818cf8",
  submitted: "#fb923c",
  completed: "#4ade80",
  rejected: "#f87171",
  expired: "#94a3b8",
  cancelled: "#64748b",
};

function truncateAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function formatAmount(amount: string, symbol: string) {
  try {
    const num = parseFloat(amount) / 1e18;
    return `${num.toFixed(4)} ${symbol}`;
  } catch {
    return `${amount} ${symbol}`;
  }
}

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const [, navigate] = useLocation();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "client" | "provider" | "evaluator">("all");

  const profileQuery = trpc.user.getProfile.useQuery(
    { walletAddress: address ?? "" },
    { enabled: !!address }
  );

  // Real-time polling with notifications
  const { jobs: myJobsPolled, refetch: refetchJobs } = useWalletJobsPolling(address ?? null, !!address);

  const recentJobsQuery = trpc.jobs.getRecent.useQuery({ limit: 20 });

  const profile = profileQuery.data;
  const myJobs = myJobsPolled;
  const recentJobs = recentJobsQuery.data ?? [];

  const filteredJobs = activeTab === "all" ? myJobs : myJobs.filter(job => {
    const addr = address?.toLowerCase() ?? "";
    if (activeTab === "client") return job.clientAddress === addr;
    if (activeTab === "provider") return job.providerAddress === addr;
    if (activeTab === "evaluator") return job.evaluatorAddress === addr;
    return true;
  });

  const stats = {
    total: myJobs.length,
    active: myJobs.filter(j => ["open", "funded", "submitted"].includes(j.state)).length,
    completed: myJobs.filter(j => j.state === "completed").length,
    asClient: myJobs.filter(j => j.clientAddress === address?.toLowerCase()).length,
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen cosmic-bg flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <img src={LOGO_URL} alt="AgentEscrow" className="w-16 h-16 rounded-2xl mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-white mb-3">Connect Your Wallet</h1>
          <p className="text-slate-400 mb-8">Connect your Ethereum wallet to access the AgentEscrow dashboard and interact with ERC-8183 jobs.</p>
          <ConnectButton />
          <div className="mt-6">
            <a href="/" className="text-teal-400 hover:text-teal-300 text-sm transition-colors">← Back to Home</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen cosmic-bg">
      {/* Fixed particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div key={i} className="particle" style={{ left: `${(i * 7) % 100}%`, top: `${(i * 13) % 100}%`, animationDelay: `${i * 0.4}s` }} />
        ))}
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 glass-card border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <img src={LOGO_URL} alt="AgentEscrow" className="w-8 h-8 rounded-lg" />
            <div>
              <div className="text-white font-bold text-sm leading-tight">AgentEscrow</div>
              <div className="text-teal-400 text-xs font-mono">ERC-8183</div>
            </div>
          </a>
          <div className="flex items-center gap-3">
            <a
              href="/contract"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all text-slate-400 hover:text-teal-300 hover:bg-white/5"
            >
              <Code2 className="w-3.5 h-3.5" />
              Contract
            </a>
            <NotificationBell walletAddress={address} />
            <ConnectButton accountStatus="avatar" chainStatus="icon" showBalance={false} />
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              {profile ? `Welcome, ${profile.displayName}` : "Dashboard"}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-slate-400 text-sm font-mono">{truncateAddress(address!)}</span>
              {profile && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium capitalize"
                  style={{ background: "rgba(45,212,191,0.15)", color: "#2dd4bf", border: "1px solid rgba(45,212,191,0.3)" }}>
                  {profile.role}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!profile && (
              <button
                onClick={() => navigate("/register")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white border border-white/20 hover:border-teal-500/50 hover:bg-white/5 transition-all"
              >
                <User className="w-4 h-4" />
                Complete Profile
              </button>
            )}
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-black transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #2dd4bf, #818cf8)" }}
            >
              <Plus className="w-4 h-4" />
              Create Job
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Jobs", value: stats.total, icon: Briefcase, color: "#2dd4bf" },
            { label: "Active", value: stats.active, icon: Clock, color: "#818cf8" },
            { label: "Completed", value: stats.completed, icon: CheckCircle2, color: "#4ade80" },
            { label: "As Client", value: stats.asClient, icon: User, color: "#fb923c" },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="glass-card rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-xs">{stat.label}</span>
                  <Icon className="w-4 h-4" style={{ color: stat.color }} />
                </div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* My Jobs */}
          <div className="lg:col-span-2">
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white font-semibold text-lg">My Jobs</h2>
                  <button
                    onClick={() => refetchJobs()}
                    className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
                {/* Tabs */}
                <div className="flex gap-1 p-1 rounded-xl bg-white/5">
                  {(["all", "client", "provider", "evaluator"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium capitalize transition-all ${
                        activeTab === tab ? "bg-teal-500/20 text-teal-300" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="divide-y divide-white/5">
                {false ? (
                  <div className="p-8 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin mx-auto mb-3" />
                    Loading jobs...
                  </div>
                ) : filteredJobs.length === 0 ? (
                  <div className="p-8 text-center">
                    <Briefcase className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm mb-4">No jobs found</p>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="text-teal-400 hover:text-teal-300 text-sm flex items-center gap-1 mx-auto transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Create your first job
                    </button>
                  </div>
                ) : (
                  filteredJobs.map((job) => {
                    const stateColor = STATE_COLORS[job.state] ?? "#94a3b8";
                    const stateIcon = STATE_ICONS[job.state];
                    return (
                      <div
                        key={job.id}
                        className="p-4 hover:bg-white/5 transition-colors cursor-pointer group"
                        onClick={() => navigate(`/job/${job.jobId}`)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                                style={{ background: `${stateColor}20`, color: stateColor, border: `1px solid ${stateColor}30` }}
                              >
                                {stateIcon}
                                {job.state.charAt(0).toUpperCase() + job.state.slice(1)}
                              </span>
                              <span className="text-slate-500 text-xs font-mono">#{job.jobId}</span>
                            </div>
                            <h3 className="text-white text-sm font-medium truncate">{job.title}</h3>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-slate-400 text-xs">{formatAmount(job.amount, job.tokenSymbol ?? "ETH")}</span>
                              {job.providerAddress && (
                                <span className="text-slate-500 text-xs">Provider: {truncateAddress(job.providerAddress)}</span>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-teal-400 transition-colors flex-shrink-0 mt-1" />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Profile Card */}
            <div className="glass-card rounded-2xl p-5">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-teal-400" />
                Profile
              </h3>
              {profile ? (
                <div className="space-y-3">
                  <div>
                    <div className="text-slate-400 text-xs mb-1">Display Name</div>
                    <div className="text-white text-sm font-medium">{profile.displayName}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-xs mb-1">Role</div>
                    <span className="px-2 py-1 rounded-lg text-xs font-medium capitalize"
                      style={{ background: "rgba(45,212,191,0.15)", color: "#2dd4bf" }}>
                      {profile.role}
                    </span>
                  </div>
                  {profile.bio && (
                    <div>
                      <div className="text-slate-400 text-xs mb-1">Bio</div>
                      <div className="text-slate-300 text-xs leading-relaxed">{profile.bio}</div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                    <div className="text-center">
                      <div className="text-white font-bold text-lg">{profile.jobsCompleted}</div>
                      <div className="text-slate-500 text-xs">Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white font-bold text-lg">{profile.reputation}</div>
                      <div className="text-slate-500 text-xs">Reputation</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-2">
                  <p className="text-slate-400 text-sm mb-3">No profile yet</p>
                  <button
                    onClick={() => navigate("/register")}
                    className="text-teal-400 hover:text-teal-300 text-sm flex items-center gap-1 mx-auto transition-colors"
                  >
                    Register Profile <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Recent Activity Feed */}
            <div className="glass-card rounded-2xl p-5">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-400" />
                Recent Jobs
              </h3>
              <div className="space-y-2">
                {recentJobsQuery.isLoading ? (
                  <div className="text-slate-400 text-xs text-center py-4">Loading...</div>
                ) : recentJobs.length === 0 ? (
                  <div className="text-slate-400 text-xs text-center py-4">No jobs yet on-chain</div>
                ) : (
                  recentJobs.slice(0, 5).map((job) => {
                    const stateColor = STATE_COLORS[job.state] ?? "#94a3b8";
                    return (
                      <div
                        key={job.id}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                        onClick={() => navigate(`/job/${job.jobId}`)}
                      >
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: stateColor }} />
                        <div className="flex-1 min-w-0">
                          <div className="text-white text-xs truncate">{job.title}</div>
                          <div className="text-slate-500 text-xs">{truncateAddress(job.clientAddress)}</div>
                        </div>
                        <ExternalLink className="w-3 h-3 text-slate-600 flex-shrink-0" />
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div className="glass-card rounded-2xl p-5">
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2">
                {[
                  { label: "EIP-8183 Spec", href: "https://eips.ethereum.org/EIPS/eip-8183" },
                  { label: "GitHub", href: "https://github.com/AgentEscrow8183" },
                  { label: "Follow @_agentescrow", href: "https://x.com/_agentescrow" },
                  { label: "Ethereum Magicians", href: "https://ethereum-magicians.org/t/erc-8183-agentic-commerce/27902" },
                ].map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors group"
                  >
                    <span className="text-slate-300 text-xs group-hover:text-white transition-colors">{link.label}</span>
                    <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-teal-400 transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Job Modal */}
      {showCreateModal && (
        <CreateJobModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            refetchJobs();
            toast.success("Job created successfully!");
          }}
          walletAddress={address ?? ""}
        />
      )}
    </div>
  );
}
