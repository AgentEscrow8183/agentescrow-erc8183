/* ==========================================================
   JobDetail Page — AgentEscrow ERC-8183
   Real on-chain transactions via useEscrowContract hook
   ========================================================== */

import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useAccount, useChainId } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  ArrowLeft, Wallet, Upload, CheckCircle2, XCircle,
  Clock, ExternalLink, Copy, AlertCircle, Shield, User,
  Briefcase, RefreshCw, Zap, Info, Hash
} from "lucide-react";
import { useEscrowContract, CONTRACT_DEPLOYED } from "@/hooks/useEscrowContract";
import { useJobPolling } from "@/hooks/useJobPolling";
import { DEMO_TOKENS } from "@/lib/web3";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663364387669/fEjhcY4s7LeuDVrQJHn5VB/ae-icon-v4-QFJAJsj8FMjz5GGVfkXy5E.webp";

const STATE_COLORS: Record<string, string> = {
  open: "#2dd4bf", funded: "#818cf8", submitted: "#fb923c",
  completed: "#4ade80", rejected: "#f87171", expired: "#94a3b8", cancelled: "#64748b",
};

const STATE_LABELS: Record<string, string> = {
  open: "Open", funded: "Funded", submitted: "Submitted",
  completed: "Completed", rejected: "Rejected", expired: "Expired", cancelled: "Cancelled",
};

function truncateAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function formatAmount(amount: string, symbol: string) {
  try {
    const decimals = symbol === "USDC" || symbol === "USDT" ? 6 : 18;
    const num = parseFloat(amount) / Math.pow(10, decimals);
    return `${num.toFixed(4)} ${symbol}`;
  } catch {
    return `${amount} ${symbol}`;
  }
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
  toast.success("Copied to clipboard");
}

const SEPOLIA_EXPLORER = "https://sepolia.etherscan.io";

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deliverableUrl, setDeliverableUrl] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  // Real-time polling
  const { job, refetch } = useJobPolling(id ?? null, !!id);

  // On-chain contract hooks
  const escrow = useEscrowContract();

  // Off-chain state sync mutations
  const updateStateMutation = trpc.jobs.updateState.useMutation({
    onSuccess: () => {
      refetch();
      setActionLoading(null);
      setDeliverableUrl("");
      setRejectReason("");
      setShowRejectForm(false);
    },
    onError: (err) => {
      toast.error("State sync failed", { description: err.message });
      setActionLoading(null);
    },
  });

  /**
   * Execute on-chain action, then sync state to DB
   */
  const handleAction = async (
    action: "fund" | "submit" | "complete" | "reject" | "cancel" | "claim",
    extraData?: { deliverableUrl?: string; rejectReason?: string }
  ) => {
    if (!job || !address) return;
    setActionLoading(action);

    const stateMap: Record<string, "open" | "funded" | "submitted" | "completed" | "rejected" | "expired" | "cancelled"> = {
      fund: "funded",
      submit: "submitted",
      complete: "completed",
      reject: "rejected",
      cancel: "cancelled",
      claim: "completed",
    };

    try {
      let txHash: `0x${string}` | undefined;
      const jobIdBigInt = BigInt(job.jobId);

      if (CONTRACT_DEPLOYED) {
        // === REAL ON-CHAIN TRANSACTIONS ===
        if (action === "fund") {
          const token = DEMO_TOKENS.find(t => t.address.toLowerCase() === job.tokenAddress.toLowerCase());
          txHash = await escrow.approveAndFundJob({
            jobId: jobIdBigInt,
            tokenAddress: job.tokenAddress as `0x${string}`,
            amount: BigInt(job.amount),
            isNative: token?.native ?? false,
          });
        } else if (action === "submit") {
          if (!extraData?.deliverableUrl?.trim()) {
            toast.error("Please enter a deliverable URL or hash");
            setActionLoading(null);
            return;
          }
          txHash = await escrow.submitWork({
            jobId: jobIdBigInt,
            deliverableUrl: extraData.deliverableUrl,
          });
        } else if (action === "complete") {
          txHash = await escrow.completeJob(jobIdBigInt);
        } else if (action === "reject") {
          if (!extraData?.rejectReason?.trim()) {
            toast.error("Please provide a rejection reason");
            setActionLoading(null);
            return;
          }
          txHash = await escrow.rejectJob(jobIdBigInt, extraData.rejectReason);
        } else if (action === "cancel") {
          txHash = await escrow.cancelJob(jobIdBigInt);
        } else if (action === "claim") {
          txHash = await escrow.claimPayment(jobIdBigInt);
        }
      } else {
        // === DEMO MODE (contract not deployed) ===
        toast.info("Demo Mode", {
          description: "Contract not deployed. Simulating transaction...",
          duration: 3000,
        });
        await new Promise(r => setTimeout(r, 1500)); // simulate delay
        txHash = `0xdemo${Date.now().toString(16)}` as `0x${string}`;
      }

      // Sync state to database
      await updateStateMutation.mutateAsync({
        jobId: job.jobId,
        state: stateMap[action] ?? "open",
        txHash: txHash,
        deliverableUrl: extraData?.deliverableUrl,
        rejectReason: extraData?.rejectReason,
      });

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes("User rejected") && !msg.includes("user rejected")) {
        toast.error(`${action} failed`, { description: msg.slice(0, 120) });
      }
      setActionLoading(null);
    }
  };

  if (!id || !job) {
    if (!id) return null;
    return (
      <div className="min-h-screen cosmic-bg flex flex-col items-center justify-center px-4">
        {job === undefined ? (
          <div className="w-8 h-8 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
        ) : (
          <>
            <AlertCircle className="w-12 h-12 text-slate-600 mb-4" />
            <h2 className="text-white text-xl font-bold mb-2">Job Not Found</h2>
            <p className="text-slate-400 text-sm mb-6">Job #{id} does not exist or has been removed.</p>
            <button onClick={() => navigate("/dashboard")} className="text-teal-400 hover:text-teal-300 text-sm transition-colors flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </button>
          </>
        )}
      </div>
    );
  }

  const stateColor = STATE_COLORS[job.state] ?? "#94a3b8";
  const isClient = address?.toLowerCase() === job.clientAddress;
  const isProvider = address?.toLowerCase() === job.providerAddress;
  const isEvaluator = address?.toLowerCase() === job.evaluatorAddress;

  const canFund = job.state === "open" && isClient;
  const canSubmit = job.state === "funded" && isProvider;
  const canComplete = job.state === "submitted" && isEvaluator;
  const canReject = job.state === "submitted" && (isEvaluator || isClient);
  const canCancel = job.state === "open" && isClient;
  const canClaim = job.state === "completed" && isProvider;

  const STATE_FLOW = ["open", "funded", "submitted", "completed"];
  const currentStateIndex = STATE_FLOW.indexOf(job.state);

  const explorerBase = chainId === 11155111 ? SEPOLIA_EXPLORER : `https://etherscan.io`;

  return (
    <div className="min-h-screen cosmic-bg">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="particle" style={{ left: `${(i * 11) % 100}%`, top: `${(i * 17) % 100}%`, animationDelay: `${i * 0.5}s` }} />
        ))}
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 glass-card border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/dashboard")} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <a href="/" className="flex items-center gap-2">
              <img src={LOGO_URL} alt="AgentEscrow" className="w-7 h-7 rounded-lg" />
              <span className="text-white font-bold text-sm hidden sm:block">AgentEscrow</span>
            </a>
          </div>
          <div className="flex items-center gap-2">
            {/* Contract status badge */}
            <div
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
              style={{
                background: CONTRACT_DEPLOYED ? "rgba(74,222,128,0.15)" : "rgba(251,146,60,0.15)",
                color: CONTRACT_DEPLOYED ? "#4ade80" : "#fb923c",
              }}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${CONTRACT_DEPLOYED ? "bg-green-400" : "bg-orange-400 animate-pulse"}`} />
              {CONTRACT_DEPLOYED ? "Mainnet" : "Demo Mode"}
            </div>
            <ConnectButton accountStatus="avatar" chainStatus="icon" showBalance={false} />
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10">

        {/* Demo mode banner */}
        {!CONTRACT_DEPLOYED && (
          <div
            className="mb-5 p-4 rounded-xl flex items-start gap-3"
            style={{ background: "rgba(251,146,60,0.1)", border: "1px solid rgba(251,146,60,0.3)" }}
          >
            <Info className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-orange-300 text-sm font-medium">Demo Mode — Contract Not Deployed</p>
              <p className="text-orange-400/70 text-xs mt-0.5">
                All actions simulate on-chain transactions. Deploy the ERC-8183 contract to Sepolia and update{" "}
                <code className="bg-orange-500/20 px-1 rounded">ESCROW_CONTRACT_ADDRESS</code> in{" "}
                <code className="bg-orange-500/20 px-1 rounded">web3.ts</code> to enable real transactions.
                Visit <a href="/contract" className="underline">Contract Explorer</a> for deployment guide.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-5">

            {/* Job Header */}
            <div className="glass-card rounded-2xl p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{ background: `${stateColor}20`, color: stateColor }}
                    >
                      {STATE_LABELS[job.state] ?? job.state}
                    </span>
                    <span className="text-slate-500 text-xs font-mono">#{job.jobId}</span>
                  </div>
                  <h1 className="text-white font-bold text-xl sm:text-2xl leading-tight break-words">{job.title}</h1>
                  {job.description && (
                    <p className="text-slate-400 text-sm mt-2 leading-relaxed">{job.description}</p>
                  )}
                </div>
                <button
                  onClick={() => refetch()}
                  className="p-2 rounded-xl hover:bg-white/10 transition-colors text-slate-400 hover:text-white flex-shrink-0"
                  title="Refresh"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {/* State progress bar */}
              <div className="mt-4">
                <div className="flex items-center gap-0 mb-2">
                  {STATE_FLOW.map((state, idx) => {
                    const isDone = idx <= currentStateIndex;
                    const isCurrent = idx === currentStateIndex;
                    return (
                      <div key={state} className="flex items-center flex-1">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all"
                          style={{
                            background: isDone ? stateColor : "rgba(255,255,255,0.1)",
                            color: isDone ? "#0a0f1e" : "#64748b",
                            boxShadow: isCurrent ? `0 0 12px ${stateColor}60` : "none",
                          }}
                        >
                          {isDone ? <CheckCircle2 className="w-3 h-3" /> : idx + 1}
                        </div>
                        {idx < STATE_FLOW.length - 1 && (
                          <div
                            className="h-0.5 flex-1 mx-1 rounded-full transition-all"
                            style={{ background: idx < currentStateIndex ? stateColor : "rgba(255,255,255,0.1)" }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  {STATE_FLOW.map(s => <span key={s} className="capitalize">{s}</span>)}
                </div>
              </div>
            </div>

            {/* Action Panel */}
            {isConnected && (canFund || canSubmit || canComplete || canReject || canCancel || canClaim) && (
              <div className="glass-card rounded-2xl p-5 sm:p-6">
                <h2 className="text-white font-semibold text-base mb-4 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-teal-400" />
                  Available Actions
                </h2>

                <div className="space-y-3">
                  {/* Fund Job */}
                  {canFund && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-white text-sm font-medium">Fund Job</p>
                          <p className="text-slate-400 text-xs">
                            {CONTRACT_DEPLOYED
                              ? `Approve ${formatAmount(job.amount, job.tokenSymbol ?? "ETH")} and lock into escrow`
                              : `Simulate funding ${formatAmount(job.amount, job.tokenSymbol ?? "ETH")} (demo mode)`}
                          </p>
                        </div>
                        <button
                          onClick={() => handleAction("fund")}
                          disabled={actionLoading === "fund"}
                          className="px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 flex items-center gap-2 flex-shrink-0"
                          style={{ background: "linear-gradient(135deg, #818cf8, #6366f1)", color: "white" }}
                        >
                          {actionLoading === "fund" ? (
                            <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Funding...</>
                          ) : (
                            <><Wallet className="w-3.5 h-3.5" /> Fund</>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Submit Work */}
                  {canSubmit && (
                    <div className="space-y-2">
                      <p className="text-white text-sm font-medium">Submit Work</p>
                      <p className="text-slate-400 text-xs">
                        {CONTRACT_DEPLOYED
                          ? "Deliverable URL will be hashed (keccak256) and stored on-chain"
                          : "Enter deliverable URL (demo mode — not stored on-chain)"}
                      </p>
                      <input
                        type="text"
                        value={deliverableUrl}
                        onChange={(e) => setDeliverableUrl(e.target.value)}
                        placeholder="https://github.com/... or IPFS hash"
                        className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-500/60 transition-colors"
                      />
                      <button
                        onClick={() => handleAction("submit", { deliverableUrl })}
                        disabled={actionLoading === "submit" || !deliverableUrl.trim()}
                        className="px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
                        style={{ background: "linear-gradient(135deg, #fb923c, #f97316)", color: "white" }}
                      >
                        {actionLoading === "submit" ? (
                          <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
                        ) : (
                          <><Upload className="w-3.5 h-3.5" /> Submit Work</>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Complete / Reject */}
                  {(canComplete || canReject) && (
                    <div className="space-y-3">
                      {job.deliverableUrl && (
                        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                          <p className="text-slate-400 text-xs mb-1">Deliverable</p>
                          <a
                            href={job.deliverableUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-teal-400 text-sm hover:underline flex items-center gap-1.5 break-all"
                          >
                            <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                            {job.deliverableUrl}
                          </a>
                        </div>
                      )}

                      <div className="flex gap-2">
                        {canComplete && (
                          <button
                            onClick={() => handleAction("complete")}
                            disabled={!!actionLoading}
                            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            style={{ background: "linear-gradient(135deg, #4ade80, #22c55e)", color: "#0a0f1e" }}
                          >
                            {actionLoading === "complete" ? (
                              <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            ) : (
                              <><CheckCircle2 className="w-3.5 h-3.5" /> Approve & Complete</>
                            )}
                          </button>
                        )}
                        {canReject && (
                          <button
                            onClick={() => setShowRejectForm(!showRejectForm)}
                            disabled={!!actionLoading}
                            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            style={{ background: "rgba(248,113,113,0.2)", color: "#f87171", border: "1px solid rgba(248,113,113,0.3)" }}
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        )}
                      </div>

                      {showRejectForm && canReject && (
                        <div className="space-y-2">
                          <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Reason for rejection..."
                            rows={2}
                            className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-red-500/30 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-red-500/60 transition-colors resize-none"
                          />
                          <button
                            onClick={() => handleAction("reject", { rejectReason })}
                            disabled={actionLoading === "reject" || !rejectReason.trim()}
                            className="w-full py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            style={{ background: "rgba(248,113,113,0.3)", color: "#f87171" }}
                          >
                            {actionLoading === "reject" ? (
                              <div className="w-3.5 h-3.5 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                            ) : "Confirm Rejection"}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Claim Payment */}
                  {canClaim && (
                    <div>
                      <p className="text-white text-sm font-medium mb-1">Claim Payment</p>
                      <p className="text-slate-400 text-xs mb-2">
                        {CONTRACT_DEPLOYED ? "Withdraw your payment from escrow" : "Simulate claiming payment (demo mode)"}
                      </p>
                      <button
                        onClick={() => handleAction("claim")}
                        disabled={actionLoading === "claim"}
                        className="px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
                        style={{ background: "linear-gradient(135deg, #2dd4bf, #0d9488)", color: "#0a0f1e" }}
                      >
                        {actionLoading === "claim" ? (
                          <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        ) : (
                          <><Wallet className="w-3.5 h-3.5" /> Claim {formatAmount(job.amount, job.tokenSymbol ?? "ETH")}</>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Cancel Job */}
                  {canCancel && (
                    <div className="pt-2 border-t border-white/5">
                      <button
                        onClick={() => handleAction("cancel")}
                        disabled={!!actionLoading}
                        className="text-slate-500 hover:text-red-400 text-xs transition-colors flex items-center gap-1.5"
                      >
                        <XCircle className="w-3 h-3" /> Cancel Job
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Not your role notice */}
            {isConnected && !canFund && !canSubmit && !canComplete && !canReject && !canCancel && !canClaim &&
              ["open", "funded", "submitted"].includes(job.state) && (
              <div
                className="glass-card rounded-2xl p-4 flex items-center gap-3"
                style={{ border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <Info className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <p className="text-slate-400 text-sm">
                  You are not a participant in this job. Connect with the client, provider, or evaluator wallet to take action.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Job Details */}
            <div className="glass-card rounded-2xl p-5">
              <h3 className="text-white font-semibold text-sm mb-4">Job Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Amount</span>
                  <span className="text-white font-mono font-medium">{formatAmount(job.amount, job.tokenSymbol ?? "ETH")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Token</span>
                  <span className="text-white font-mono">{job.tokenSymbol ?? "ETH"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Chain</span>
                  <span className="text-white">{job.chainId === 11155111 ? "Sepolia" : job.chainId === 1 ? "Mainnet" : `Chain ${job.chainId}`}</span>
                </div>
                {job.expiryAt && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Expires</span>
                    <span className="text-white text-xs">{new Date(job.expiryAt).toLocaleDateString()}</span>
                  </div>
                )}
                {job.txHash && (
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-slate-400">Tx Hash</span>
                    <a
                      href={`${explorerBase}/tx/${job.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-400 hover:text-teal-300 font-mono text-xs flex items-center gap-1 transition-colors"
                    >
                      {job.txHash.slice(0, 8)}...
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Participants */}
            <div className="glass-card rounded-2xl p-5">
              <h3 className="text-white font-semibold text-sm mb-4">Participants</h3>
              <div className="space-y-3">
                {[
                  { label: "Client", addr: job.clientAddress, icon: User, color: "#2dd4bf" },
                  { label: "Provider", addr: job.providerAddress, icon: Briefcase, color: "#818cf8" },
                  { label: "Evaluator", addr: job.evaluatorAddress, icon: Shield, color: "#60a5fa" },
                ].map(({ label, addr, icon: Icon, color }) => addr && (
                  <div key={label} className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}20` }}>
                      <Icon className="w-3.5 h-3.5" style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-slate-400 text-xs">{label}</div>
                      <div className="flex items-center gap-1">
                        <span className="text-white font-mono text-xs">{truncateAddress(addr)}</span>
                        {addr.toLowerCase() === address?.toLowerCase() && (
                          <span className="text-xs px-1.5 py-0.5 rounded-full text-black font-medium" style={{ background: color }}>You</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(addr)}
                      className="p-1 rounded hover:bg-white/10 transition-colors text-slate-500 hover:text-white flex-shrink-0"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Deliverable hash if submitted */}
            {job.deliverableHash && (
              <div className="glass-card rounded-2xl p-5">
                <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                  <Hash className="w-3.5 h-3.5 text-teal-400" />
                  Deliverable Hash
                </h3>
                <p className="text-slate-400 font-mono text-xs break-all leading-relaxed">{job.deliverableHash}</p>
              </div>
            )}

            {/* Timeline */}
            <div className="glass-card rounded-2xl p-5">
              <h3 className="text-white font-semibold text-sm mb-4">Timeline</h3>
              <div className="space-y-2 text-xs">
                {[
                  { label: "Created", date: job.createdAt },
                  { label: "Funded", date: job.fundedAt },
                  { label: "Submitted", date: job.submittedAt },
                  { label: "Completed", date: job.completedAt },
                ].filter(e => e.date).map(({ label, date }) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-slate-400">{label}</span>
                    <span className="text-white">{new Date(date!).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
