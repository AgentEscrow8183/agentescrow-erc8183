/* ==========================================================
   Register Page — AgentEscrow ERC-8183
   Pendaftaran profil pengguna setelah connect wallet
   ========================================================== */

import { useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { User, Briefcase, Shield, ArrowRight, CheckCircle2 } from "lucide-react";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663364387669/fEjhcY4s7LeuDVrQJHn5VB/ae-icon-v4-QFJAJsj8FMjz5GGVfkXy5E.webp";

const ROLES = [
  {
    id: "client",
    label: "Client",
    icon: User,
    description: "Create and fund escrow jobs. You hire providers and set evaluators to verify work.",
    color: "teal",
    gradient: "from-teal-500/20 to-teal-900/10",
    border: "border-teal-500/40",
    glow: "shadow-teal-500/20",
  },
  {
    id: "provider",
    label: "Provider",
    icon: Briefcase,
    description: "Accept jobs, deliver work, and receive payment upon successful evaluation.",
    color: "purple",
    gradient: "from-purple-500/20 to-purple-900/10",
    border: "border-purple-500/40",
    glow: "shadow-purple-500/20",
  },
  {
    id: "evaluator",
    label: "Evaluator",
    icon: Shield,
    description: "Attest work quality as a trusted third party. Approve or reject deliverables.",
    color: "blue",
    gradient: "from-blue-500/20 to-blue-900/10",
    border: "border-blue-500/40",
    glow: "shadow-blue-500/20",
  },
];

export default function Register() {
  const { address, isConnected } = useAccount();
  const [, navigate] = useLocation();
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const registerMutation = trpc.user.register.useMutation({
    onSuccess: () => {
      toast.success("Profile registered successfully!", {
        description: "Welcome to AgentEscrow ERC-8183",
      });
      navigate("/dashboard");
    },
    onError: (err) => {
      toast.error("Registration failed", { description: err.message });
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !selectedRole || !displayName.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    setIsSubmitting(true);
    registerMutation.mutate({
      walletAddress: address,
      displayName: displayName.trim(),
      role: selectedRole as "client" | "provider" | "evaluator",
      bio: bio.trim(),
    });
  };

  return (
    <div className="min-h-screen cosmic-bg flex flex-col items-center justify-center px-4 py-12">
      {/* Background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${4 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <a href="/" className="inline-flex items-center gap-3 mb-6">
            <img src={LOGO_URL} alt="AgentEscrow" className="w-12 h-12 rounded-xl" />
            <div className="text-left">
              <div className="text-white font-bold text-lg leading-tight">AgentEscrow</div>
              <div className="text-teal-400 text-xs font-mono">ERC-8183</div>
            </div>
          </a>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Create Your <span className="text-gradient">Profile</span>
          </h1>
          <p className="text-slate-400 text-base max-w-md mx-auto">
            Connect your wallet and register your role in the AgentEscrow protocol.
          </p>
        </div>

        {/* Main Card */}
        <div className="glass-card rounded-2xl p-6 sm:p-8">
          {/* Step 1: Connect Wallet */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isConnected ? "bg-teal-500 text-black" : "bg-white/10 text-white"}`}>
                {isConnected ? <CheckCircle2 className="w-4 h-4" /> : "1"}
              </div>
              <h2 className="text-white font-semibold text-lg">Connect Wallet</h2>
            </div>
            <div className="pl-11">
              {isConnected ? (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-teal-500/10 border border-teal-500/30">
                  <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                  <span className="text-teal-300 font-mono text-sm">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>
                  <span className="text-slate-400 text-sm ml-auto">Connected</span>
                </div>
              ) : (
                <div className="flex flex-col items-start gap-3">
                  <p className="text-slate-400 text-sm">Connect your Ethereum wallet to continue.</p>
                  <ConnectButton />
                </div>
              )}
            </div>
          </div>

          {/* Step 2: Choose Role */}
          <div className={`mb-8 transition-opacity ${isConnected ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${selectedRole ? "bg-teal-500 text-black" : "bg-white/10 text-white"}`}>
                {selectedRole ? <CheckCircle2 className="w-4 h-4" /> : "2"}
              </div>
              <h2 className="text-white font-semibold text-lg">Choose Your Role</h2>
            </div>
            <div className="pl-11 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {ROLES.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.id;
                return (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                      isSelected
                        ? `bg-gradient-to-br ${role.gradient} ${role.border} shadow-lg ${role.glow}`
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    <Icon className={`w-6 h-6 mb-2 ${isSelected ? `text-${role.color}-400` : "text-slate-400"}`} />
                    <div className={`font-semibold text-sm mb-1 ${isSelected ? "text-white" : "text-slate-300"}`}>
                      {role.label}
                    </div>
                    <div className="text-xs text-slate-400 leading-relaxed">{role.description}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Profile Details */}
          <form onSubmit={handleSubmit} className={`transition-opacity ${isConnected && selectedRole ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-white/10 text-white">3</div>
              <h2 className="text-white font-semibold text-lg">Profile Details</h2>
            </div>
            <div className="pl-11 space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2 font-medium">Display Name *</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Alice the Evaluator"
                  maxLength={50}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/60 focus:bg-white/8 transition-colors text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-2 font-medium">Bio <span className="text-slate-500">(optional)</span></label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Briefly describe your expertise or services..."
                  maxLength={200}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/60 focus:bg-white/8 transition-colors text-sm resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting || !displayName.trim() || !selectedRole}
                className="w-full py-3 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg, #2dd4bf, #818cf8)" }}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    Complete Registration
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">
          By registering, you agree to interact with the ERC-8183 smart contract protocol.
          <br />
          No personal data is stored on-chain — only your wallet address and role.
        </p>
      </div>
    </div>
  );
}
