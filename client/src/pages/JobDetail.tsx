import { useState } from "react";
import { motion } from "framer-motion";
import { useParams, Link } from "wouter";
import { useAccount } from "wagmi";
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  DollarSign,
  Upload,
  Loader2,
  Hash,
  User,
  AlertCircle,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import AIChatWidget from "@/components/AIChatWidget";
import { trpc } from "@/lib/trpc";
import { JOB_STATE_BADGE, type JobState } from "@/lib/web3";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function StateBadge({ state }: { state: JobState }) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded border text-xs font-mono font-semibold uppercase tracking-wider ${JOB_STATE_BADGE[state]}`}
    >
      {state}
    </span>
  );
}

export default function JobDetail() {
  const { jobId } = useParams<{ jobId: string }>();
  const { address } = useAccount();
  const [deliverableHash, setDeliverableHash] = useState("");
  const [showHashInput, setShowHashInput] = useState(false);

  const { data: job, isLoading, refetch } = trpc.jobs.getById.useQuery(
    { jobId: jobId ?? "" },
    { enabled: !!jobId, refetchInterval: 15_000 }
  );

  const { data: history = [] } = trpc.jobs.getHistory.useQuery(
    { jobId: jobId ?? "" },
    { enabled: !!jobId }
  );

  const updateState = trpc.jobs.updateState.useMutation({
    onSuccess: (data) => {
      toast.success(`Job state updated to ${data.newState}`);
      refetch();
      setShowHashInput(false);
      setDeliverableHash("");
    },
    onError: (err) => toast.error("Action failed", { description: err.message }),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[oklch(0.78_0.22_195)] animate-spin" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-[oklch(0.55_0.04_220)]">Job not found.</p>
          <Link href="/dashboard">
            <button className="mt-4 text-sm text-[oklch(0.78_0.22_195)] hover:underline">← Back to Dashboard</button>
          </Link>
        </div>
      </div>
    );
  }

  const myAddr = address?.toLowerCase();
  const isClient = job.clientAddress === myAddr;
  const isProvider = job.providerAddress === myAddr;
  const isEvaluator = job.evaluatorAddress === myAddr;

  const canFund = isClient && job.state === "open";
  const canSubmit = isProvider && job.state === "funded";
  const canComplete = isEvaluator && job.state === "submitted";
  const canReject = isEvaluator && job.state === "submitted";
  const canCancel = isClient && ["open", "funded"].includes(job.state);

  const doAction = (action: "fund" | "submit" | "complete" | "reject" | "cancel") => {
    if (!address) return;
    if (action === "submit" && !deliverableHash.trim()) {
      toast.error("Enter a deliverable hash first");
      return;
    }
    updateState.mutate({
      jobId: job.jobId,
      action,
      actorAddress: address,
      deliverableHash: action === "submit" ? deliverableHash : undefined,
    });
  };

  const amountDisplay = (Number(job.amount) / 1e18).toFixed(4);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
          <div className="container py-4 sm:py-6 px-4 sm:px-6">
          {/* Back */}
          <Link href="/dashboard">
            <button className="flex items-center gap-2 text-sm text-[oklch(0.55_0.04_220)] hover:text-[oklch(0.78_0.22_195)] transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </button>
          </Link>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="cyber-card rounded-xl p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <StateBadge state={job.state as JobState} />
                      {isClient && (
                        <span className="text-[10px] font-mono text-[oklch(0.72_0.22_195)] border border-[oklch(0.72_0.22_195/0.3)] px-1.5 py-0.5 rounded">
                          YOUR JOB
                        </span>
                      )}
                    </div>
                    <h1 className="text-xl font-['Orbitron'] font-bold text-[oklch(0.92_0.02_200)]">
                      {job.title ?? `Job #${job.jobId.slice(0, 8)}`}
                    </h1>
                    <p className="text-xs font-mono text-[oklch(0.55_0.04_220)] mt-1">ID: {job.jobId}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-['Orbitron'] font-bold text-[oklch(0.78_0.22_195)]">
                      {amountDisplay}
                    </div>
                    <div className="text-xs font-mono text-[oklch(0.55_0.04_220)]">
                      {shortAddr(job.tokenAddress)}
                    </div>
                  </div>
                </div>

                {job.description && (
                  <p className="text-sm text-[oklch(0.82_0.05_200)] leading-relaxed border-t border-[oklch(0.78_0.22_195/0.1)] pt-4">
                    {job.description}
                  </p>
                )}
              </motion.div>

              {/* Parties */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="cyber-card rounded-xl p-6"
              >
                <h2 className="text-xs font-['Orbitron'] font-bold text-[oklch(0.55_0.04_220)] tracking-wider mb-4">
                  PARTIES
                </h2>
                <div className="space-y-3">
                  {[
                    { role: "Client", addr: job.clientAddress, color: "oklch(0.72 0.22 195)" },
                    { role: "Provider", addr: job.providerAddress, color: "oklch(0.68 0.28 295)" },
                    { role: "Evaluator", addr: job.evaluatorAddress, color: "oklch(0.78 0.22 145)" },
                  ].map((p) => (
                    <div key={p.role} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center"
                          style={{ background: `${p.color}22`, border: `1px solid ${p.color}44` }}
                        >
                          <User className="w-3.5 h-3.5" style={{ color: p.color }} />
                        </div>
                        <span className="text-xs font-['Orbitron'] font-semibold" style={{ color: p.color }}>
                          {p.role}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-[oklch(0.82_0.05_200)] truncate max-w-[120px] sm:max-w-full">{shortAddr(p.addr)}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Deliverable Hash */}
              {job.deliverableHash && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="cyber-card rounded-xl p-6"
                >
                  <h2 className="text-xs font-['Orbitron'] font-bold text-[oklch(0.55_0.04_220)] tracking-wider mb-3">
                    DELIVERABLE HASH
                  </h2>
                  <div className="flex items-center gap-2 p-3 bg-[oklch(0.14_0.025_260)] rounded border border-[oklch(0.2_0.03_260)]">
                    <Hash className="w-4 h-4 text-[oklch(0.75_0.22_55)] shrink-0" />
                    <code className="text-xs text-[oklch(0.75_0.22_55)] break-all">{job.deliverableHash}</code>
                  </div>
                </motion.div>
              )}

              {/* State History */}
              {history.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="cyber-card rounded-xl p-6"
                >
                  <h2 className="text-xs font-['Orbitron'] font-bold text-[oklch(0.55_0.04_220)] tracking-wider mb-4">
                    STATE HISTORY
                  </h2>
                  <div className="space-y-3">
                    {history.map((h, i) => (
                      <div key={h.id} className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-[oklch(0.78_0.22_195)] mt-1.5 shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 text-xs">
                            {h.fromState && (
                              <>
                                <span className="font-mono text-[oklch(0.55_0.04_220)]">{h.fromState}</span>
                                <span className="text-[oklch(0.55_0.04_220)]">→</span>
                              </>
                            )}
                            <span className="font-mono font-bold text-[oklch(0.78_0.22_195)]">{h.toState}</span>
                          </div>
                          {h.actorAddress && (
                            <p className="text-[10px] font-mono text-[oklch(0.55_0.04_220)] mt-0.5">
                              by {shortAddr(h.actorAddress)}
                            </p>
                          )}
                          <p className="text-[10px] text-[oklch(0.55_0.04_220)] mt-0.5">
                            {formatDistanceToNow(new Date(h.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar: Actions + Details */}
            <div className="space-y-6">
              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="cyber-card rounded-xl p-6"
              >
                <h2 className="text-xs font-['Orbitron'] font-bold text-[oklch(0.55_0.04_220)] tracking-wider mb-4">
                  ACTIONS
                </h2>

                {!address ? (
                  <p className="text-xs text-[oklch(0.55_0.04_220)]">Connect wallet to perform actions.</p>
                ) : !isClient && !isProvider && !isEvaluator ? (
                  <p className="text-xs text-[oklch(0.55_0.04_220)]">You are not a party to this job.</p>
                ) : (
                  <div className="space-y-3">
                    {canFund && (
                      <ActionButton
                        label="FUND JOB"
                        icon={DollarSign}
                        color="oklch(0.72 0.22 195)"
                        loading={updateState.isPending}
                        onClick={() => doAction("fund")}
                        desc="Lock funds in escrow to activate the job."
                      />
                    )}

                    {canSubmit && (
                      <>
                        {!showHashInput ? (
                          <ActionButton
                            label="SUBMIT WORK"
                            icon={Upload}
                            color="oklch(0.75 0.22 55)"
                            loading={false}
                            onClick={() => setShowHashInput(true)}
                            desc="Submit your deliverable hash for evaluation."
                          />
                        ) : (
                          <div className="space-y-2">
                            <input
                              className="w-full bg-[oklch(0.14_0.025_260)] border border-[oklch(0.2_0.03_260)] rounded px-3 py-2 text-xs font-mono text-[oklch(0.92_0.02_200)] placeholder:text-[oklch(0.55_0.04_220)] focus:outline-none focus:border-[oklch(0.75_0.22_55/0.5)]"
                              placeholder="0x deliverable hash (bytes32)"
                              value={deliverableHash}
                              onChange={(e) => setDeliverableHash(e.target.value)}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => setShowHashInput(false)}
                                className="flex-1 py-1.5 text-xs border border-[oklch(0.2_0.03_260)] text-[oklch(0.55_0.04_220)] rounded hover:border-[oklch(0.78_0.22_195/0.3)] transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => doAction("submit")}
                                disabled={updateState.isPending}
                                className="flex-1 py-1.5 text-xs bg-[oklch(0.75_0.22_55/0.2)] border border-[oklch(0.75_0.22_55/0.4)] text-[oklch(0.75_0.22_55)] rounded hover:bg-[oklch(0.75_0.22_55/0.3)] transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                              >
                                {updateState.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                                Submit
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {canComplete && (
                      <ActionButton
                        label="COMPLETE JOB"
                        icon={CheckCircle2}
                        color="oklch(0.78 0.22 145)"
                        loading={updateState.isPending}
                        onClick={() => doAction("complete")}
                        desc="Approve work and release payment to provider."
                      />
                    )}

                    {canReject && (
                      <ActionButton
                        label="REJECT JOB"
                        icon={XCircle}
                        color="oklch(0.62 0.25 25)"
                        loading={updateState.isPending}
                        onClick={() => doAction("reject")}
                        desc="Reject work and return funds to client."
                      />
                    )}

                    {canCancel && (
                      <ActionButton
                        label="CANCEL JOB"
                        icon={XCircle}
                        color="oklch(0.55 0.04 220)"
                        loading={updateState.isPending}
                        onClick={() => doAction("cancel")}
                        desc="Cancel this job and return funds."
                      />
                    )}

                    {!canFund && !canSubmit && !canComplete && !canReject && !canCancel && (
                      <div className="flex items-center gap-2 p-3 bg-[oklch(0.14_0.025_260)] rounded border border-[oklch(0.2_0.03_260)]">
                        <AlertCircle className="w-4 h-4 text-[oklch(0.55_0.04_220)]" />
                        <p className="text-xs text-[oklch(0.55_0.04_220)]">
                          No actions available for your role in the current state.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>

              {/* Job Details */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="cyber-card rounded-xl p-6"
              >
                <h2 className="text-xs font-['Orbitron'] font-bold text-[oklch(0.55_0.04_220)] tracking-wider mb-4">
                  JOB DETAILS
                </h2>
                <div className="space-y-3 text-xs">
                  <DetailRow label="Job ID" value={job.jobId} mono />
                  <DetailRow label="Amount" value={`${amountDisplay} tokens`} />
                  <DetailRow label="Token" value={shortAddr(job.tokenAddress)} mono />
                  <DetailRow
                    label="Expiry"
                    value={format(new Date(job.expiry * 1000), "MMM dd, yyyy HH:mm")}
                  />
                  <DetailRow
                    label="Created"
                    value={formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                  />
                  {job.txHash && <DetailRow label="Tx Hash" value={shortAddr(job.txHash)} mono />}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      <AIChatWidget />
    </div>
  );
}

function ActionButton({
  label,
  icon: Icon,
  color,
  loading,
  onClick,
  desc,
}: {
  label: string;
  icon: React.ElementType;
  color: string;
  loading: boolean;
  onClick: () => void;
  desc: string;
}) {
  return (
    <div>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        disabled={loading}
        className="w-full py-2.5 rounded border text-xs font-['Orbitron'] font-bold tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        style={{
          background: `${color}22`,
          borderColor: `${color}55`,
          color,
        }}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />}
        {label}
      </motion.button>
      <p className="text-[10px] text-[oklch(0.55_0.04_220)] mt-1 text-center">{desc}</p>
    </div>
  );
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[oklch(0.55_0.04_220)]">{label}</span>
      <span className={`text-[oklch(0.82_0.05_200)] ${mono ? "font-mono" : ""} text-right`}>{value}</span>
    </div>
  );
}
