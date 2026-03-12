/* ==========================================================
   NotificationBell — Real-time job notifications widget
   Shows unread count badge + dropdown with recent job updates
   ========================================================== */

import { useState, useEffect, useRef } from "react";
import { Bell, BellRing, CheckCircle2, XCircle, Clock, DollarSign, Upload, X } from "lucide-react";
import { trpc } from "@/lib/trpc";

type NotifEntry = {
  id: string;
  jobId: string;
  title: string;
  state: string;
  timestamp: number;
  read: boolean;
};

const STATE_ICONS: Record<string, React.ReactNode> = {
  Completed: <CheckCircle2 className="w-4 h-4 text-green-400" />,
  Rejected:  <XCircle className="w-4 h-4 text-red-400" />,
  Expired:   <Clock className="w-4 h-4 text-orange-400" />,
  Funded:    <DollarSign className="w-4 h-4 text-teal-400" />,
  Submitted: <Upload className="w-4 h-4 text-blue-400" />,
  Open:      <Bell className="w-4 h-4 text-slate-400" />,
};

const STATE_COLORS: Record<string, string> = {
  Completed: "rgba(74,222,128,0.15)",
  Rejected:  "rgba(248,113,113,0.15)",
  Expired:   "rgba(251,146,60,0.15)",
  Funded:    "rgba(45,212,191,0.15)",
  Submitted: "rgba(96,165,250,0.15)",
  Open:      "rgba(148,163,184,0.1)",
};

const STORAGE_KEY = "agentescrow_notifications";

function loadNotifs(): NotifEntry[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveNotifs(notifs: NotifEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifs.slice(0, 20)));
}

interface NotificationBellProps {
  walletAddress?: string;
}

export default function NotificationBell({ walletAddress }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<NotifEntry[]>(loadNotifs);
  const prevStatesRef = useRef<Map<string, string>>(new Map());
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Poll jobs every 10s
  const { data: jobs = [] } = trpc.jobs.getByWallet.useQuery(
    { walletAddress: walletAddress ?? "" },
    {
      enabled: !!walletAddress,
      refetchInterval: 10_000,
      refetchIntervalInBackground: false,
    }
  );

  // Detect state changes
  useEffect(() => {
    if (!jobs.length) return;
    const prevStates = prevStatesRef.current;
    const newNotifs: NotifEntry[] = [];

    jobs.forEach((job) => {
      const currentState = job.state;
      const prevState = prevStates.get(job.jobId);

      if (prevState !== undefined && prevState !== currentState) {
        newNotifs.push({
          id: `${job.jobId}-${currentState}-${Date.now()}`,
          jobId: job.jobId,
          title: job.title,
          state: currentState,
          timestamp: Date.now(),
          read: false,
        });
      }
      prevStates.set(job.jobId, currentState);
    });

    if (newNotifs.length > 0) {
      setNotifs((prev) => {
        const updated = [...newNotifs, ...prev].slice(0, 20);
        saveNotifs(updated);
        return updated;
      });
    }
  }, [jobs]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const unreadCount = notifs.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifs((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      saveNotifs(updated);
      return updated;
    });
  };

  const clearAll = () => {
    setNotifs([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    if (diff < 60_000) return "just now";
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
    return `${Math.floor(diff / 86_400_000)}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={() => { setOpen(!open); if (!open) markAllRead(); }}
        className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-white/10"
        style={{ color: unreadCount > 0 ? "#2dd4bf" : "#64748b" }}
        title="Notifications"
      >
        {unreadCount > 0 ? <BellRing className="w-5 h-5 animate-pulse" /> : <Bell className="w-5 h-5" />}
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-black"
            style={{ background: "#2dd4bf" }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-12 w-80 rounded-2xl overflow-hidden z-50 shadow-2xl"
          style={{
            background: "rgba(8,12,30,0.97)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(24px)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-teal-400" />
              <span className="text-white font-semibold text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-xs font-medium text-black" style={{ background: "#2dd4bf" }}>
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {notifs.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-slate-500 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-500/10"
                  title="Clear all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Notifications list */}
          <div className="max-h-72 overflow-y-auto">
            {notifs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <Bell className="w-8 h-8 text-slate-600 mb-3" />
                <p className="text-slate-400 text-sm font-medium">No notifications yet</p>
                <p className="text-slate-600 text-xs mt-1">Job status changes will appear here</p>
              </div>
            ) : (
              notifs.map((notif) => (
                <a
                  key={notif.id}
                  href={`/job/${notif.jobId}`}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                  onClick={() => setOpen(false)}
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: STATE_COLORS[notif.state] ?? "rgba(148,163,184,0.1)" }}
                  >
                    {STATE_ICONS[notif.state] ?? <Bell className="w-4 h-4 text-slate-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-white text-xs font-semibold truncate">{notif.title}</span>
                      {!notif.read && (
                        <div className="w-1.5 h-1.5 rounded-full bg-teal-400 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Status changed to <span className="font-medium" style={{ color: STATE_COLORS[notif.state] ? Object.entries(STATE_COLORS).find(([k]) => k === notif.state)?.[1]?.replace("0.15", "1") : "#94a3b8" }}>{notif.state}</span>
                    </p>
                    <p className="text-slate-600 text-xs mt-0.5">{formatTime(notif.timestamp)}</p>
                  </div>
                </a>
              ))
            )}
          </div>

          {/* Footer */}
          {notifs.length > 0 && (
            <div className="px-4 py-2.5 border-t border-white/10">
              <p className="text-slate-600 text-xs text-center">
                Polling every 10s · {jobs.length} active job{jobs.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
