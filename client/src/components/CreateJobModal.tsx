import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Loader2, AlertCircle } from "lucide-react";
import { useAccount } from "wagmi";
import { trpc } from "@/lib/trpc";
import { SEPOLIA_TOKENS } from "@/lib/web3";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateJobModal({ open, onClose, onSuccess }: Props) {
  const { address } = useAccount();
  const [form, setForm] = useState({
    title: "",
    description: "",
    providerAddress: "",
    evaluatorAddress: "",
    tokenAddress: SEPOLIA_TOKENS[0].address,
    amount: "",
    expiryDays: "7",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createJob = trpc.jobs.create.useMutation({
    onSuccess: () => {
      toast.success("Job created successfully!", {
        description: "Your job escrow has been created.",
      });
      onSuccess();
      setForm({
        title: "",
        description: "",
        providerAddress: "",
        evaluatorAddress: "",
        tokenAddress: SEPOLIA_TOKENS[0].address,
        amount: "",
        expiryDays: "7",
      });
    },
    onError: (err) => {
      toast.error("Failed to create job", { description: err.message });
    },
  });

  const isAddress = (val: string) => /^0x[0-9a-fA-F]{40}$/.test(val);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!isAddress(form.providerAddress)) e.providerAddress = "Invalid Ethereum address";
    if (!isAddress(form.evaluatorAddress)) e.evaluatorAddress = "Invalid Ethereum address";
    if (!isAddress(form.tokenAddress)) e.tokenAddress = "Invalid token address";
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0)
      e.amount = "Enter a valid amount";
    if (!form.expiryDays || Number(form.expiryDays) < 1) e.expiryDays = "Minimum 1 day";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate() || !address) return;
    const expiry = Math.floor(Date.now() / 1000) + Number(form.expiryDays) * 86400;
    // Convert amount to wei (multiply by 1e18 for ETH-like tokens)
    const amountWei = BigInt(Math.floor(Number(form.amount) * 1e18)).toString();

    createJob.mutate({
      title: form.title,
      description: form.description,
      providerAddress: form.providerAddress,
      evaluatorAddress: form.evaluatorAddress,
      tokenAddress: form.tokenAddress,
      amount: amountWei,
      expiry,
      clientAddress: address,
    });
  };

  const inputClass =
    "w-full bg-[oklch(0.14_0.025_260)] border border-[oklch(0.2_0.03_260)] rounded px-3 py-2 text-sm text-[oklch(0.92_0.02_200)] placeholder:text-[oklch(0.55_0.04_220)] focus:outline-none focus:border-[oklch(0.72_0.22_195/0.5)] transition-colors font-mono";
  const labelClass = "block text-xs font-['Orbitron'] font-semibold text-[oklch(0.55_0.04_220)] mb-1 tracking-wider";
  const errorClass = "text-[10px] text-[oklch(0.62_0.25_25)] mt-1";

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full max-w-lg cyber-card rounded-xl overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[oklch(0.78_0.22_195/0.15)] bg-[oklch(0.09_0.02_260)]">
                <div>
                  <h2 className="font-['Orbitron'] font-bold text-[oklch(0.78_0.22_195)] tracking-wider">
                    CREATE JOB ESCROW
                  </h2>
                  <p className="text-xs text-[oklch(0.55_0.04_220)] mt-0.5">ERC-8183 Protocol</p>
                </div>
                <button
                  onClick={onClose}
                  className="text-[oklch(0.55_0.04_220)] hover:text-[oklch(0.92_0.02_200)] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Title */}
                <div>
                  <label className={labelClass}>JOB TITLE</label>
                  <input
                    className={inputClass}
                    placeholder="e.g. Build a React dashboard"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                  {errors.title && <p className={errorClass}>{errors.title}</p>}
                </div>

                {/* Description */}
                <div>
                  <label className={labelClass}>DESCRIPTION (OPTIONAL)</label>
                  <textarea
                    className={`${inputClass} resize-none`}
                    rows={2}
                    placeholder="Describe the work to be done..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                {/* Provider */}
                <div>
                  <label className={labelClass}>PROVIDER ADDRESS</label>
                  <input
                    className={inputClass}
                    placeholder="0x..."
                    value={form.providerAddress}
                    onChange={(e) => setForm({ ...form, providerAddress: e.target.value })}
                  />
                  {errors.providerAddress && <p className={errorClass}>{errors.providerAddress}</p>}
                </div>

                {/* Evaluator */}
                <div>
                  <label className={labelClass}>EVALUATOR ADDRESS</label>
                  <input
                    className={inputClass}
                    placeholder="0x..."
                    value={form.evaluatorAddress}
                    onChange={(e) => setForm({ ...form, evaluatorAddress: e.target.value })}
                  />
                  {errors.evaluatorAddress && <p className={errorClass}>{errors.evaluatorAddress}</p>}
                </div>

                {/* Token + Amount */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>TOKEN</label>
                    <select
                      className={inputClass}
                      value={form.tokenAddress}
                      onChange={(e) => setForm({ ...form, tokenAddress: e.target.value })}
                    >
                      {SEPOLIA_TOKENS.map((t) => (
                        <option key={t.address} value={t.address}>
                          {t.symbol}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>AMOUNT</label>
                    <input
                      className={inputClass}
                      type="number"
                      placeholder="0.0"
                      step="0.001"
                      min="0"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    />
                    {errors.amount && <p className={errorClass}>{errors.amount}</p>}
                  </div>
                </div>

                {/* Expiry */}
                <div>
                  <label className={labelClass}>EXPIRY (DAYS)</label>
                  <input
                    className={inputClass}
                    type="number"
                    min="1"
                    max="365"
                    value={form.expiryDays}
                    onChange={(e) => setForm({ ...form, expiryDays: e.target.value })}
                  />
                  {errors.expiryDays && <p className={errorClass}>{errors.expiryDays}</p>}
                </div>

                {/* Info box */}
                <div className="flex gap-2 p-3 bg-[oklch(0.72_0.22_195/0.08)] border border-[oklch(0.72_0.22_195/0.2)] rounded text-xs text-[oklch(0.55_0.04_220)]">
                  <AlertCircle className="w-4 h-4 text-[oklch(0.72_0.22_195)] shrink-0 mt-0.5" />
                  <span>
                    This creates an off-chain job record. To deploy on-chain, connect to Sepolia testnet and
                    call <code className="text-[oklch(0.78_0.22_195)]">createJob()</code> on the smart contract.
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-[oklch(0.78_0.22_195/0.15)] flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-2 border border-[oklch(0.2_0.03_260)] text-[oklch(0.55_0.04_220)] text-sm font-['Orbitron'] rounded hover:border-[oklch(0.78_0.22_195/0.3)] transition-colors"
                >
                  CANCEL
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  disabled={createJob.isPending}
                  className="flex-1 py-2 bg-[oklch(0.72_0.22_195)] text-[oklch(0.07_0.015_260)] text-sm font-['Orbitron'] font-bold rounded glow-cyan disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-[oklch(0.78_0.22_195)] transition-all"
                >
                  {createJob.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> CREATING...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> CREATE JOB
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
