import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Wallet } from "lucide-react";

interface ManusDialogProps {
  title?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  // Legacy props kept for compatibility but unused
  logo?: string;
  onLogin?: () => void;
}

/**
 * Dialog shown when a wallet connection is required.
 * Wallet-based auth only — no Manus OAuth redirect.
 */
export function ManusDialog({
  open = false,
  onOpenChange,
  onClose,
  title = "Connect Your Wallet",
}: ManusDialogProps) {
  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange?.(nextOpen);
    if (!nextOpen) onClose?.();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-[oklch(0.09_0.015_260)] border border-[oklch(0.78_0.22_195/0.2)] text-[oklch(0.92_0.02_200)] max-w-sm">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-14 h-14 rounded-full bg-[oklch(0.78_0.22_195/0.1)] border border-[oklch(0.78_0.22_195/0.3)] flex items-center justify-center">
              <Wallet className="w-7 h-7 text-[oklch(0.78_0.22_195)]" />
            </div>
          </div>
          <DialogTitle className="text-center font-['Orbitron'] text-[oklch(0.78_0.22_195)]">
            {title}
          </DialogTitle>
          <DialogDescription className="text-center text-[oklch(0.55_0.04_220)] text-sm leading-relaxed">
            Connect your wallet to continue. Your wallet address is your identity on the AgentEscrow protocol.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center pt-2">
          <ConnectButton
            accountStatus="avatar"
            chainStatus="none"
            showBalance={false}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
