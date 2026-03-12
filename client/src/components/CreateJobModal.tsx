/* ==========================================================
   CreateJobModal — AgentEscrow ERC-8183
   Modal untuk membuat job baru — real on-chain + off-chain fallback
   ========================================================== */

import { useState } from "react";
import { X, Briefcase, AlertCircle, CheckCircle2, ExternalLink, Info } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { DEMO_TOKENS } from "@/lib/web3";
import { toast } from "sonner";
import { useEscrowContract, CONTRACT_DEPLOYED } from "@/hooks/useEscrowContract";
import { useChainId } from "wagmi";
import { parseUnits } from "viem";

interface CreateJobModalProps {
  onClose: () => void;
  onSuccess: () => void;
  walletAddress: string;
}

const EXPIRY_OPTIONS = [
  { label: "1 day", value: 86400 },
  { label: "3 days", value: 259200 },
  { label: "7 days", value: 604800 },
  { label: "14 days", value: 1209600 },
  { label: "30 days", value: 2592000 },
];

export default function CreateJobModal({ onClose, onSuccess, walletAddress }: CreateJobModalProps) {
  const [step, setStep] = useState<"form" | "confirm" | "success">("form");
  const [form, setForm] = useState({
    title: "",
    description: "",
    providerAddress: "",
    evaluatorAddress: "",
    tokenIndex: 0,
    amount: "",
    expirySeconds: 604800,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdJobId, setCreatedJobId] = useState<string>("");
  const [createdTxHash, setCreatedTxHash] = useState<string>("");

  const chainId = useChainId();
  const escrow = useEscrowContract();

  const createJobMutation = trpc.jobs.create.useMutation({
    onSuccess: (data) => {
      setCreatedJobId(data?.jobId ?? "");
      setStep("success");
      setIsSubmitting(false);
      onSuccess();
    },
    onError: (err) => {
      toast.error("Failed to save job", { description: err.message });
      setIsSubmitting(false);
    },
  });

  const selectedToken = DEMO_TOKENS[form.tokenIndex];

  const handleSubmit = async () => {
    if (!form.title || !form.amount) {
      toast.error("Please fill in all required fields");
      return;
    }
    setIsSubmitting(true);

    const expiryAt = Math.floor(Date.now() / 1000) + form.expirySeconds;
    const decimals = selectedToken?.decimals ?? 18;
    let amountWei: string;
    try {
      amountWei = parseUnits(form.amount, decimals).toString();
    } catch {
      amountWei = (parseFloat(form.amount) * Math.pow(10, decimals)).toFixed(0);
    }

    let txHash: string | undefined;
    let onChainJobId: string;

    if (CONTRACT_DEPLOYED) {
      // === REAL ON-CHAIN: call createJob ===
      try {
        const providerAddr = (form.providerAddress || walletAddress) as `0x${string}`;
        const evaluatorAddr = (form.evaluatorAddress || walletAddress) as `0x${string}`;
        const tokenAddr = (selectedToken?.address ?? "0x0000000000000000000000000000000000000000") as `0x${string}`;

        const hash = await escrow.createJob({
          provider: providerAddr,
          evaluator: evaluatorAddr,
          token: tokenAddr,
          amount: BigInt(amountWei),
          expiry: BigInt(expiryAt),
        });
        txHash = hash;
        // In production, parse jobId from tx receipt logs
        onChainJobId = `${Date.now()}`;
        setCreatedTxHash(hash);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (!msg.includes("User rejected") && !msg.includes("user rejected")) {
          toast.error("On-chain transaction failed", { description: msg.slice(0, 120) });
        }
        setIsSubmitting(false);
        return;
      }
    } else {
      // === DEMO MODE: simulate ===
      toast.info("Demo Mode", {
        description: "Contract not deployed. Simulating job creation...",
        duration: 3000,
      });
      await new Promise(r => setTimeout(r, 1000));
      onChainJobId = `${Date.now()}`;
      txHash = `0xdemo${Date.now().toString(16)}`;
    }

    // Save to database
    createJobMutation.mutate({
      jobId: onChainJobId,
      contractAddress: CONTRACT_DEPLOYED ? "0x0000000000000000000000000000000000000000" : "0x0000000000000000000000000000000000000000",
      chainId: chainId ?? 11155111,
      txHash,
      clientAddress: walletAddress,
      providerAddress: form.providerAddress || undefined,
      evaluatorAddress: form.evaluatorAddress || walletAddress,
      title: form.title,
      description: form.description,
      tokenAddress: selectedToken?.address ?? "0x0000000000000000000000000000000000000000",
      tokenSymbol: selectedToken?.symbol ?? "ETH",
      amount: amountWei,
      expiryAt,
    });
  };

  const explorerBase = chainId === 11155111 ? "https://sepolia.etherscan.io" : "https://etherscan.io";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg glass-card rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, rgba(45,212,191,0.2), rgba(129,140,248,0.2))" }}>
              <Briefcase className="w-4 h-4 text-teal-400" />
            </div>
            <div>
              <h2 className="text-white font-semibold">Create New Job</h2>
              <p className="text-slate-400 text-xs">ERC-8183 Escrow Job</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5">
          {["Details", "Confirm", "Done"].map((label, i) => {
            const currentStep = step === "form" ? 0 : step === "confirm" ? 1 : 2;
            return (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  i < currentStep ? "bg-teal-500 text-black" :
                  i === currentStep ? "bg-teal-500/30 text-teal-300 border border-teal-500/50" :
                  "bg-white/10 text-slate-500"
                }`}>
                  {i < currentStep ? "✓" : i + 1}
                </div>
                <span className={`text-xs ${i === currentStep ? "text-white" : "text-slate-500"}`}>{label}</span>
                {i < 2 && <div className="w-8 h-px bg-white/10" />}
              </div>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-5 max-h-[60vh] overflow-y-auto">
          {step === "form" && (
            <div className="space-y-4">
              {/* Demo mode notice */}
              {!CONTRACT_DEPLOYED && (
                <div className="p-3 rounded-xl flex gap-2" style={{ background: "rgba(251,146,60,0.1)", border: "1px solid rgba(251,146,60,0.25)" }}>
                  <Info className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                  <p className="text-orange-300 text-xs">
                    <strong>Demo Mode</strong> — Contract not deployed. Job will be saved off-chain only.
                    Visit <a href="/contract" className="underline">Contract Explorer</a> to deploy.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm text-slate-300 mb-1.5 font-medium">Job Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Build a DeFi analytics dashboard"
                  maxLength={200}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/60 transition-colors text-sm"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1.5 font-medium">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Describe work requirements, deliverables, and acceptance criteria..."
                  rows={3}
                  maxLength={2000}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/60 transition-colors text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5 font-medium">Token</label>
                  <select
                    value={form.tokenIndex}
                    onChange={(e) => setForm(f => ({ ...f, tokenIndex: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-teal-500/60 transition-colors text-sm"
                  >
                    {DEMO_TOKENS.map((token, i) => (
                      <option key={token.symbol} value={i} className="bg-slate-900">{token.symbol}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5 font-medium">Amount *</label>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))}
                    placeholder="0.0"
                    min="0"
                    step="0.001"
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/60 transition-colors text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1.5 font-medium">
                  Provider Address <span className="text-slate-500">(optional)</span>
                </label>
                <input
                  type="text"
                  value={form.providerAddress}
                  onChange={(e) => setForm(f => ({ ...f, providerAddress: e.target.value }))}
                  placeholder="0x... (leave empty for open bidding)"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/60 transition-colors text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1.5 font-medium">
                  Evaluator Address <span className="text-slate-500">(default: you)</span>
                </label>
                <input
                  type="text"
                  value={form.evaluatorAddress}
                  onChange={(e) => setForm(f => ({ ...f, evaluatorAddress: e.target.value }))}
                  placeholder={walletAddress}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/60 transition-colors text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1.5 font-medium">Job Expiry</label>
                <div className="flex gap-2 flex-wrap">
                  {EXPIRY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setForm(f => ({ ...f, expirySeconds: opt.value }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        form.expirySeconds === opt.value
                          ? "bg-teal-500/20 text-teal-300 border border-teal-500/40"
                          : "bg-white/5 text-slate-400 border border-white/10 hover:border-white/20"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === "confirm" && (
            <div className="space-y-4">
              <p className="text-slate-300 text-sm">Review your job details before {CONTRACT_DEPLOYED ? "sending the on-chain transaction" : "creating (demo mode)"}:</p>
              <div className="space-y-3 p-4 rounded-xl bg-white/5 border border-white/10 text-sm">
                {[
                  { label: "Title", value: form.title },
                  { label: "Amount", value: `${form.amount} ${selectedToken?.symbol}` },
                  { label: "Client", value: `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` },
                  { label: "Provider", value: form.providerAddress ? `${form.providerAddress.slice(0, 6)}...${form.providerAddress.slice(-4)}` : "Open (any)" },
                  { label: "Evaluator", value: form.evaluatorAddress ? `${form.evaluatorAddress.slice(0, 6)}...${form.evaluatorAddress.slice(-4)}` : `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)} (you)` },
                  { label: "Expiry", value: EXPIRY_OPTIONS.find(o => o.value === form.expirySeconds)?.label ?? "7 days" },
                  { label: "Mode", value: CONTRACT_DEPLOYED ? "🟢 On-chain (Sepolia)" : "🟠 Demo (off-chain)" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-start gap-4">
                    <span className="text-slate-400 flex-shrink-0">{label}</span>
                    <span className="text-white text-right break-all">{value}</span>
                  </div>
                ))}
              </div>
              {CONTRACT_DEPLOYED && (
                <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 flex gap-2">
                  <AlertCircle className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                  <p className="text-teal-300 text-xs">
                    Your wallet will prompt you to sign a transaction. Gas fees apply on Sepolia testnet.
                  </p>
                </div>
              )}
            </div>
          )}

          {step === "success" && (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: "linear-gradient(135deg, rgba(45,212,191,0.2), rgba(74,222,128,0.2))" }}>
                <CheckCircle2 className="w-8 h-8 text-teal-400" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Job Created!</h3>
              <p className="text-slate-400 text-sm mb-4">
                {CONTRACT_DEPLOYED ? "Your job has been created on-chain." : "Your job has been created (demo mode)."}
              </p>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-left mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Job ID</span>
                  <span className="text-white font-mono">#{createdJobId}</span>
                </div>
                {createdTxHash && !createdTxHash.startsWith("0xdemo") && (
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-slate-400">Tx Hash</span>
                    <a
                      href={`${explorerBase}/tx/${createdTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-400 hover:text-teal-300 font-mono text-xs flex items-center gap-1 transition-colors"
                    >
                      {createdTxHash.slice(0, 10)}...
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/10 flex gap-3">
          {step === "form" && (
            <>
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                Cancel
              </button>
              <button
                onClick={() => setStep("confirm")}
                disabled={!form.title || !form.amount}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #2dd4bf, #818cf8)", color: "#0a0f1e" }}
              >
                Review →
              </button>
            </>
          )}
          {step === "confirm" && (
            <>
              <button onClick={() => setStep("form")} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #2dd4bf, #818cf8)", color: "#0a0f1e" }}
              >
                {isSubmitting ? (
                  <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> {CONTRACT_DEPLOYED ? "Sending Tx..." : "Creating..."}</>
                ) : (
                  CONTRACT_DEPLOYED ? "🔗 Create On-Chain" : "Create Job (Demo)"
                )}
              </button>
            </>
          )}
          {step === "success" && (
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ background: "linear-gradient(135deg, #2dd4bf, #818cf8)", color: "#0a0f1e" }}
            >
              View Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
