import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  addJobStateHistory,
  createBlogPost,
  createJob,
  createNotification,
  getBlogPostBySlug,
  getChatHistory,
  getJobById,
  getJobStateHistory,
  getNotificationsForAddress,
  getWalletProfileByAddress,
  getWalletProfileByUserId,
  listAllJobs,
  listBlogPosts,
  listJobsByAddress,
  markNotificationsRead,
  saveChatMessage,
  updateBlogPost,
  updateJobState,
  upsertWalletProfile,
} from "./db";

// ── Auth Router ────────────────────────────────────────────────────────────

const authRouter = router({
  me: publicProcedure.query((opts) => opts.ctx.user),
  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true } as const;
  }),
});

// ── Wallet Profile Router ──────────────────────────────────────────────────

const walletRouter = router({
  getProfile: publicProcedure
    .input(z.object({ address: z.string().min(10) }))
    .query(async ({ input }) => {
      return getWalletProfileByAddress(input.address);
    }),

  getMyProfile: publicProcedure
    .input(z.object({ walletAddress: z.string().min(10) }))
    .query(async ({ input }) => {
      return getWalletProfileByAddress(input.walletAddress.toLowerCase());
    }),

  register: publicProcedure
    .input(
      z.object({
        walletAddress: z.string().min(10).max(42),
        displayName: z.string().min(1).max(128).optional(),
        rolePreference: z.enum(["client", "provider", "evaluator"]).optional(),
        bio: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ input }) => {
      await upsertWalletProfile({
        walletAddress: input.walletAddress.toLowerCase(),
        displayName: input.displayName,
        rolePreference: input.rolePreference ?? "client",
        bio: input.bio,
      });
      return { success: true };
    }),
});

// ── Jobs Router ────────────────────────────────────────────────────────────

const jobStateEnum = z.enum(["open", "funded", "submitted", "completed", "rejected", "expired", "cancelled"]);

const jobsRouter = router({
  list: publicProcedure
    .input(
      z.object({
        address: z.string().optional(),
        state: jobStateEnum.optional(),
        role: z.enum(["client", "provider", "evaluator", "all"]).optional(),
      })
    )
    .query(async ({ input }) => {
      if (input.address) {
        const all = await listJobsByAddress(input.address);
        let filtered = all;
        if (input.state) filtered = filtered.filter((j) => j.state === input.state);
        if (input.role && input.role !== "all") {
          const addr = input.address.toLowerCase();
          filtered = filtered.filter((j) => {
            if (input.role === "client") return j.clientAddress === addr;
            if (input.role === "provider") return j.providerAddress === addr;
            if (input.role === "evaluator") return j.evaluatorAddress === addr;
            return true;
          });
        }
        return filtered;
      }
      const all = await listAllJobs(50);
      if (input.state) return all.filter((j) => j.state === input.state);
      return all;
    }),

  getById: publicProcedure
    .input(z.object({ jobId: z.string() }))
    .query(async ({ input }) => {
      const job = await getJobById(input.jobId);
      if (!job) throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
      return job;
    }),

  getHistory: publicProcedure
    .input(z.object({ jobId: z.string() }))
    .query(async ({ input }) => {
      return getJobStateHistory(input.jobId);
    }),

  create: publicProcedure
    .input(
      z.object({
        providerAddress: z.string().min(10).max(42),
        evaluatorAddress: z.string().min(10).max(42),
        tokenAddress: z.string().min(10).max(42),
        amount: z.string().min(1),
        expiry: z.number().int().positive(),
        title: z.string().min(1).max(256).optional(),
        description: z.string().max(2000).optional(),
        clientAddress: z.string().min(10).max(42),
      })
    )
    .mutation(async ({ input }) => {
      const jobId = nanoid(16);
      const job = await createJob({
        jobId,
        clientAddress: input.clientAddress.toLowerCase(),
        providerAddress: input.providerAddress.toLowerCase(),
        evaluatorAddress: input.evaluatorAddress.toLowerCase(),
        tokenAddress: input.tokenAddress.toLowerCase(),
        amount: input.amount,
        expiry: input.expiry,
        title: input.title,
        description: input.description,
        state: "open",
      });

      await addJobStateHistory({
        jobId,
        toState: "open",
        actorAddress: input.clientAddress.toLowerCase(),
      });

      // Notify provider
      await createNotification({
        recipientAddress: input.providerAddress.toLowerCase(),
        jobId,
        message: `New job created for you: "${input.title ?? jobId}"`,
        type: "state_change",
      });

      return job;
    }),

  updateState: publicProcedure
    .input(
      z.object({
        jobId: z.string(),
        action: z.enum(["fund", "submit", "complete", "reject", "cancel"]),
        actorAddress: z.string().min(10).max(42),
        deliverableHash: z.string().optional(),
        txHash: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const job = await getJobById(input.jobId);
      if (!job) throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });

      const stateMap: Record<string, "funded" | "submitted" | "completed" | "rejected" | "cancelled"> = {
        fund: "funded",
        submit: "submitted",
        complete: "completed",
        reject: "rejected",
        cancel: "cancelled",
      };

      const validTransitions: Record<string, string[]> = {
        open: ["fund", "cancel"],
        funded: ["submit", "cancel"],
        submitted: ["complete", "reject"],
      };

      const allowed = validTransitions[job.state] ?? [];
      if (!allowed.includes(input.action)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Cannot perform "${input.action}" on a job in state "${job.state}"`,
        });
      }

      const newState = stateMap[input.action];
      await updateJobState(input.jobId, newState, {
        deliverableHash: input.deliverableHash,
        txHash: input.txHash,
      });

      await addJobStateHistory({
        jobId: input.jobId,
        fromState: job.state,
        toState: newState,
        actorAddress: input.actorAddress.toLowerCase(),
        txHash: input.txHash,
      });

      // Send notifications to all parties
      const notifMsg = `Job "${job.title ?? job.jobId}" state changed: ${job.state} → ${newState}`;
      const recipients = [job.clientAddress, job.providerAddress, job.evaluatorAddress].filter(
        (addr) => addr !== input.actorAddress.toLowerCase()
      );
      for (const addr of recipients) {
        await createNotification({
          recipientAddress: addr,
          jobId: input.jobId,
          message: notifMsg,
          type: newState as "funded" | "submitted" | "completed" | "rejected",
        });
      }

      return { success: true, newState };
    }),
});

// ── Notifications Router ───────────────────────────────────────────────────

const notificationsRouter = router({
  list: publicProcedure
    .input(z.object({ address: z.string().min(10) }))
    .query(async ({ input }) => {
      return getNotificationsForAddress(input.address.toLowerCase());
    }),

  markRead: publicProcedure
    .input(z.object({ address: z.string().min(10) }))
    .mutation(async ({ input }) => {
      await markNotificationsRead(input.address.toLowerCase());
      return { success: true };
    }),
});

// ── AI Chat Router ─────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are AgentBot, an expert AI assistant for the AgentEscrow ERC-8183 protocol.

You help users understand:
- The ERC-8183 trustless escrow standard for AI agent commerce
- Job lifecycle: OPEN → FUNDED → SUBMITTED → COMPLETED/REJECTED
- Three roles: Client (creates & funds jobs), Provider (executes work), Evaluator (attests quality)
- Smart contract interactions: createJob, fundJob, submitWork, completeJob, rejectJob, claimPayment
- Web3 wallet setup, Sepolia testnet, and gas fees
- ERC-20 token approvals and escrow mechanics
- Troubleshooting common issues

Be concise, technical when needed, and always helpful. Format responses with markdown.`;

const chatRouter = router({
  send: publicProcedure
    .input(
      z.object({
        sessionId: z.string().min(1).max(64),
        message: z.string().min(1).max(2000),
      })
    )
    .mutation(async ({ input }) => {
      await saveChatMessage(input.sessionId, "user", input.message);

      const history = await getChatHistory(input.sessionId, 10);
      const historyMessages = history
        .reverse()
        .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

      const response = await invokeLLM({
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...historyMessages,
          { role: "user", content: input.message },
        ],
      });

      const rawContent = response.choices?.[0]?.message?.content;
      const assistantContent = typeof rawContent === "string" ? rawContent : "Sorry, I could not generate a response.";

      await saveChatMessage(input.sessionId, "assistant", assistantContent);

      return { reply: assistantContent };
    }),

  history: publicProcedure
    .input(z.object({ sessionId: z.string().min(1).max(64) }))
    .query(async ({ input }) => {
      const msgs = await getChatHistory(input.sessionId, 30);
      return msgs.reverse();
    }),
});

/// ── Blog Router ─────────────────────────────────────────────────────────────

const blogRouter = router({
  list: publicProcedure
    .input(z.object({ category: z.string().optional(), limit: z.number().optional() }))
    .query(async ({ input }) => {
      return listBlogPosts({ category: input.category, limit: input.limit, publishedOnly: true });
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      return getBlogPostBySlug(input.slug);
    }),

  create: protectedProcedure
    .input(z.object({
      slug: z.string().min(3).max(128),
      title: z.string().min(3).max(256),
      summary: z.string().min(10),
      content: z.string().min(20),
      category: z.enum(["update", "roadmap", "announcement", "tutorial", "research"]),
      tags: z.string().optional(),
      authorName: z.string().optional(),
      coverImage: z.string().optional(),
      published: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new Error("Admin only");
      const post = await createBlogPost({
        slug: input.slug,
        title: input.title,
        summary: input.summary,
        content: input.content,
        category: input.category,
        tags: input.tags,
        authorName: input.authorName ?? "AgentEscrow Team",
        coverImage: input.coverImage,
        published: input.published ? 1 : 0,
        publishedAt: input.published ? new Date() : undefined,
      });
      return post;
    }),

  update: protectedProcedure
    .input(z.object({
      slug: z.string(),
      title: z.string().optional(),
      summary: z.string().optional(),
      content: z.string().optional(),
      category: z.enum(["update", "roadmap", "announcement", "tutorial", "research"]).optional(),
      tags: z.string().optional(),
      published: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new Error("Admin only");
      const { slug, published, ...rest } = input;
      const updates: Record<string, unknown> = { ...rest };
      if (published !== undefined) {
        updates.published = published ? 1 : 0;
        if (published) updates.publishedAt = new Date();
      }
      return updateBlogPost(slug, updates as Parameters<typeof updateBlogPost>[1]);
    }),
});

// ── App Router ─────────────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  wallet: walletRouter,
  jobs: jobsRouter,
  notifications: notificationsRouter,
  chat: chatRouter,
  blog: blogRouter,
});

export type AppRouter = typeof appRouter;
