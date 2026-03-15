import { Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount } from "wagmi";
import { trpc } from "@/lib/trpc";
import { formatDistanceToNow } from "date-fns";

export default function NotificationBell() {
  const { address } = useAccount();
  const [open, setOpen] = useState(false);

  const { data: notifications = [], refetch } = trpc.notifications.list.useQuery(
    { address: address ?? "" },
    { enabled: !!address, refetchInterval: 15_000 }
  );

  const markRead = trpc.notifications.markRead.useMutation({
    onSuccess: () => refetch(),
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    if (open && unreadCount > 0 && address) {
      markRead.mutate({ address });
    }
  }, [open]);

  if (!address) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-[oklch(0.55_0.04_220)] hover:text-[oklch(0.78_0.22_195)] transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-1 right-1 w-4 h-4 bg-[oklch(0.62_0.25_25)] rounded-full text-[9px] font-bold text-white flex items-center justify-center"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-80 z-50 cyber-card rounded-lg shadow-xl"
            >
              <div className="p-3 border-b border-[oklch(0.78_0.22_195/0.15)]">
                <h3 className="text-xs font-['Orbitron'] font-semibold text-[oklch(0.78_0.22_195)] tracking-wider">
                  NOTIFICATIONS
                </h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-[oklch(0.55_0.04_220)] text-sm">
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 border-b border-[oklch(0.2_0.03_260)] last:border-0 ${
                        !n.isRead ? "bg-[oklch(0.78_0.22_195/0.05)]" : ""
                      }`}
                    >
                      <p className="text-xs text-[oklch(0.82_0.05_200)]">{n.message}</p>
                      <p className="text-[10px] text-[oklch(0.55_0.04_220)] mt-1 font-mono">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
