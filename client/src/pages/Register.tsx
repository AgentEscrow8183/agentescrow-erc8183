import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { User, Wallet, CheckCircle2, Loader2, Edit3 } from "lucide-react";
import Navbar from "@/components/Navbar";
import AIChatWidget from "@/components/AIChatWidget";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type RolePreference = "client" | "provider" | "evaluator";

const roleOptions: { value: RolePreference; label: string; desc: string; color: string; emoji: string }[] = [
  {
    value: "client",
    label: "Client",
    desc: "I create and fund job escrows for AI agents to complete.",
    color: "oklch(0.72 0.22 195)",
    emoji: "💼",
  },
  {
    value: "provider",
    label: "Provider",
    desc: "I execute work and submit deliverables for payment.",
    color: "oklch(0.68 0.28 295)",
    emoji: "⚙️",
  },
  {
    value: "evaluator",
    label: "Evaluator",
    desc: "I attest to work quality and release or reject payments.",
    color: "oklch(0.78 0.22 145)",
    emoji: "🔍",
  },
];

export default function Register() {
  const { address, isConnected } = useAccount();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [rolePreference, setRolePreference] = useState<RolePreference>("client");
  const [saved, setSaved] = useState(false);

  const { data: existingProfile, refetch } = trpc.wallet.getMyProfile.useQuery(undefined, {
    enabled: isConnected,
  });

  const register = trpc.wallet.register.useMutation({
    onSuccess: () => {
      toast.success("Profile saved!", { description: "Your wallet profile has been registered." });
      setSaved(true);
      refetch();
    },
    onError: (err) => toast.error("Failed to save profile", { description: err.message }),
  });

  useEffect(() => {
    if (existingProfile) {
      setDisplayName(existingProfile.displayName ?? "");
      setBio(existingProfile.bio ?? "");
      setRolePreference(existingProfile.rolePreference as RolePreference);
    }
  }, [existingProfile]);

  const handleSubmit = () => {
    if (!address) return;
    if (!displayName.trim()) {
      toast.error("Display name is required");
      return;
    }
    register.mutate({
      walletAddress: address,
      displayName,
      bio,
      rolePreference,
    });
  };

  const inputClass =
    "w-full bg-[oklch(0.14_0.025_260)] border border-[oklch(0.2_0.03_260)] rounded px-4 py-3 text-sm text-[oklch(0.92_0.02_200)] placeholder:text-[oklch(0.55_0.04_220)] focus:outline-none focus:border-[oklch(0.72_0.22_195/0.5)] transition-colors";
  const labelClass =
    "block text-xs font-['Orbitron'] font-semibold text-[oklch(0.55_0.04_220)] mb-2 tracking-wider";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
          <div className="container py-6 sm:py-12 max-w-2xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl font-['Orbitron'] font-black text-[oklch(0.92_0.02_200)] mb-2">
              WALLET PROFILE
            </h1>
            <p className="text-[oklch(0.55_0.04_220)]">
              Register your wallet identity on the AgentEscrow protocol.
            </p>
          </motion.div>

          {!isConnected ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="cyber-card rounded-xl p-12 text-center"
            >
              <Wallet className="w-12 h-12 text-[oklch(0.78_0.22_195)] mx-auto mb-4" />
              <h2 className="text-lg font-['Orbitron'] font-bold text-[oklch(0.92_0.02_200)] mb-2">
                CONNECT WALLET FIRST
              </h2>
              <p className="text-sm text-[oklch(0.55_0.04_220)] mb-6">
                You need to connect your Web3 wallet to register a profile.
              </p>
              <ConnectButton />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Wallet address display */}
              <div className="cyber-card rounded-xl p-3 sm:p-4 flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-full bg-[oklch(0.72_0.22_195/0.15)] border border-[oklch(0.72_0.22_195/0.3)] flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-[oklch(0.78_0.22_195)]" />
                </div>
                <div>
                  <p className="text-xs text-[oklch(0.55_0.04_220)]">Connected Wallet</p>
                  <p className="text-xs sm:text-sm font-mono text-[oklch(0.92_0.02_200)] truncate max-w-[160px] sm:max-w-full">{address}</p>
                </div>
                {existingProfile && (
                  <div className="ml-auto flex items-center gap-1 text-xs text-[oklch(0.78_0.22_145)]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Registered
                  </div>
                )}
              </div>

              {/* Form */}
              <div className="cyber-card rounded-xl p-6 space-y-6">
                <h2 className="text-sm font-['Orbitron'] font-bold text-[oklch(0.78_0.22_195)] tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {existingProfile ? "UPDATE PROFILE" : "CREATE PROFILE"}
                </h2>

                {/* Display Name */}
                <div>
                  <label className={labelClass}>DISPLAY NAME *</label>
                  <input
                    className={inputClass}
                    placeholder="Your name or handle"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className={labelClass}>BIO (OPTIONAL)</label>
                  <textarea
                    className={`${inputClass} resize-none`}
                    rows={3}
                    placeholder="Tell others about yourself and your expertise..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    maxLength={500}
                  />
                  <p className="text-[10px] text-[oklch(0.55_0.04_220)] mt-1 text-right">{bio.length}/500</p>
                </div>

                {/* Role Preference */}
                <div>
                  <label className={labelClass}>ROLE PREFERENCE</label>
                  <div className="grid gap-3">
                    {roleOptions.map((r) => (
                      <motion.button
                        key={r.value}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setRolePreference(r.value)}
                        className={`flex items-center gap-4 p-4 rounded-lg border text-left transition-all ${
                          rolePreference === r.value
                            ? "border-opacity-60 bg-opacity-15"
                            : "border-[oklch(0.2_0.03_260)] hover:border-[oklch(0.78_0.22_195/0.2)]"
                        }`}
                        style={
                          rolePreference === r.value
                            ? {
                                borderColor: `${r.color}`,
                                background: `${r.color}15`,
                              }
                            : {}
                        }
                      >
                        <span className="text-2xl">{r.emoji}</span>
                        <div className="flex-1">
                          <p
                            className="text-sm font-['Orbitron'] font-bold"
                            style={{ color: rolePreference === r.value ? r.color : "oklch(0.82 0.05 200)" }}
                          >
                            {r.label}
                          </p>
                          <p className="text-xs text-[oklch(0.55_0.04_220)] mt-0.5">{r.desc}</p>
                        </div>
                        {rolePreference === r.value && (
                          <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: r.color }} />
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={register.isPending}
                className="w-full py-4 bg-[oklch(0.72_0.22_195)] text-[oklch(0.07_0.015_260)] font-['Orbitron'] font-bold tracking-wider rounded glow-cyan disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-[oklch(0.78_0.22_195)] transition-all"
              >
                {register.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> SAVING...
                  </>
                ) : saved ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" /> PROFILE SAVED
                  </>
                ) : (
                  <>
                    <Edit3 className="w-5 h-5" />
                    {existingProfile ? "UPDATE PROFILE" : "REGISTER PROFILE"}
                  </>
                )}
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
      <AIChatWidget />
    </div>
  );
}
