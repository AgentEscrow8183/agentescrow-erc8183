/* ==========================================================
   useJobPolling — Real-time polling hook untuk status job ERC-8183
   Polls every 10s, detects state changes, shows toast notifications
   ========================================================== */

import { useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export type JobState = "Open" | "Funded" | "Submitted" | "Completed" | "Rejected" | "Expired";

const STATE_LABELS: Record<JobState, string> = {
  Open: "Open",
  Funded: "Funded",
  Submitted: "Work Submitted",
  Completed: "Completed",
  Rejected: "Rejected",
  Expired: "Expired",
};

const STATE_EMOJIS: Record<JobState, string> = {
  Open: "📋",
  Funded: "💰",
  Submitted: "📤",
  Completed: "✅",
  Rejected: "❌",
  Expired: "⏰",
};

const POLL_INTERVAL_MS = 10_000; // 10 seconds

/**
 * Polls a single job for state changes and shows toast notifications.
 * @param jobId - The job ID to poll
 * @param enabled - Whether polling is active
 */
export function useJobPolling(jobId: string | null, enabled = true) {
  const prevStateRef = useRef<JobState | null>(null);
  const utils = trpc.useUtils();

  const { data: job, refetch } = trpc.jobs.getById.useQuery(
    { jobId: jobId ?? "" },
    {
      enabled: !!jobId && enabled,
      refetchInterval: POLL_INTERVAL_MS,
      refetchIntervalInBackground: false,
    }
  );

  // Detect state changes and notify
  useEffect(() => {
    if (!job) return;
    const currentState = job.state as JobState;
    const prevState = prevStateRef.current;

    if (prevState !== null && prevState !== currentState) {
      const emoji = STATE_EMOJIS[currentState] ?? "🔔";
      const label = STATE_LABELS[currentState] ?? currentState;

      if (currentState === "Completed") {
        toast.success(`${emoji} Job Completed!`, {
          description: `Job #${jobId} has been completed and payment released.`,
          duration: 6000,
        });
      } else if (currentState === "Rejected") {
        toast.error(`${emoji} Job Rejected`, {
          description: `Job #${jobId} was rejected. Funds returned to client.`,
          duration: 6000,
        });
      } else if (currentState === "Expired") {
        toast.warning(`${emoji} Job Expired`, {
          description: `Job #${jobId} has expired. You can now claim a refund.`,
          duration: 6000,
        });
      } else {
        toast.info(`${emoji} Job Status: ${label}`, {
          description: `Job #${jobId} moved to ${label} state.`,
          duration: 4000,
        });
      }

      // Invalidate related queries
      utils.jobs.getByWallet.invalidate();
      utils.jobs.getRecent.invalidate();
    }

    prevStateRef.current = currentState;
  }, [job?.state, jobId, utils]);

  return { job, refetch };
}

/**
 * Polls all jobs for a wallet and shows notifications for any state changes.
 * @param walletAddress - The wallet address to monitor
 * @param enabled - Whether polling is active
 */
export function useWalletJobsPolling(walletAddress: string | null, enabled = true) {
  const prevStatesRef = useRef<Map<string, JobState>>(new Map());
  const utils = trpc.useUtils();

  const { data: jobs = [], refetch } = trpc.jobs.getByWallet.useQuery(
    { walletAddress: walletAddress ?? "" },
    {
      enabled: !!walletAddress && enabled,
      refetchInterval: POLL_INTERVAL_MS,
      refetchIntervalInBackground: false,
    }
  );

  // Detect state changes for any job
  useEffect(() => {
    if (!jobs.length) return;
    const prevStates = prevStatesRef.current;
    let hasChanges = false;

    jobs.forEach((job) => {
      const currentState = job.state as JobState;
      const prevState = prevStates.get(job.jobId);

      if (prevState !== undefined && prevState !== currentState) {
        hasChanges = true;
        const emoji = STATE_EMOJIS[currentState] ?? "🔔";
        const label = STATE_LABELS[currentState] ?? currentState;
        const shortTitle = job.title.length > 30 ? job.title.slice(0, 30) + "..." : job.title;

        if (currentState === "Completed") {
          toast.success(`${emoji} Job Completed!`, {
            description: `"${shortTitle}" completed — payment released.`,
            duration: 6000,
            action: {
              label: "View",
              onClick: () => window.location.href = `/job/${job.jobId}`,
            },
          });
        } else if (currentState === "Rejected") {
          toast.error(`${emoji} Job Rejected`, {
            description: `"${shortTitle}" was rejected.`,
            duration: 6000,
            action: {
              label: "View",
              onClick: () => window.location.href = `/job/${job.jobId}`,
            },
          });
        } else if (currentState === "Funded") {
          toast.info(`${emoji} Job Funded`, {
            description: `"${shortTitle}" has been funded — ready to start!`,
            duration: 5000,
            action: {
              label: "View",
              onClick: () => window.location.href = `/job/${job.jobId}`,
            },
          });
        } else if (currentState === "Submitted") {
          toast.info(`${emoji} Work Submitted`, {
            description: `"${shortTitle}" — deliverable submitted for review.`,
            duration: 5000,
            action: {
              label: "Review",
              onClick: () => window.location.href = `/job/${job.jobId}`,
            },
          });
        }
      }

      prevStates.set(job.jobId, currentState);
    });

    if (hasChanges) {
      utils.jobs.getRecent.invalidate();
    }
  }, [jobs, utils]);

  return { jobs, refetch };
}

/**
 * Manual refresh with visual feedback
 */
export function useManualRefresh(refetch: () => void) {
  const isRefreshing = useRef(false);

  const refresh = useCallback(async () => {
    if (isRefreshing.current) return;
    isRefreshing.current = true;

    const toastId = toast.loading("Refreshing job status...");
    try {
      await refetch();
      toast.success("Status updated!", { id: toastId, duration: 2000 });
    } catch {
      toast.error("Failed to refresh", { id: toastId, duration: 3000 });
    } finally {
      isRefreshing.current = false;
    }
  }, [refetch]);

  return { refresh };
}
