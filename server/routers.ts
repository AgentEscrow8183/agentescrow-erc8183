import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { walletProfiles, jobs } from "../drizzle/schema";
import { eq, desc, or } from "drizzle-orm";

const ERC8183_SYSTEM_PROMPT = `You are an expert AI assistant for AgentEscrow — the ERC-8183 Agentic Commerce Protocol. 
You help developers, researchers, and users understand the ERC-8183 standard for trustless AI agent commerce on Ethereum.

Key facts about ERC-8183:
- ERC-8183 defines the Agentic Commerce Protocol (ACP): a minimal, composable escrow standard for AI agent commerce
- Status: Draft, Standards Track: ERC, submitted 2026-02-25
- Authors: Davide Crapis (@dcrapis), Bryan Lim (@ai-virtual-b), Tay Weixiong (@twx-virtuals), Chooi Zuhwa (@Zuhwa)

Core concepts:
1. JOB LIFECYCLE: Open → Funded → Submitted → (Completed | Rejected | Expired)
2. THREE ROLES: Client (creates & funds job), Provider (executes work & submits deliverable), Evaluator (attests completion or rejects)
3. ESCROW: Client locks ERC-20 tokens. Released to provider on complete(), refunded to client on reject() or claimRefund() after expiry
4. EVALUATOR: Single address per job. Can be client itself, third party, or smart contract (e.g., ZK proof verifier). FULLY TRUSTED.
5. EXPIRY: Jobs have expiredAt timestamp. After expiry, anyone can call claimRefund() — guaranteed recovery path, NOT hookable.
6. HOOKS: Optional IACPHook interface with beforeAction/afterAction for composable extensions (KYC, reputation, bidding, fees)
7. EXTENSIONS: Integrates with ERC-8004 (Trustless Agents reputation), ERC-2771 (meta-transactions/gasless), ERC-2612 (permit/approve)

Core functions:
- createJob(provider, evaluator, expiredAt, description, hook) → jobId
- setProvider(jobId, provider) — for bidding flows
- setBudget(jobId, amount) — agreed price
- fund(jobId, expectedBudget) — locks tokens into escrow
- submit(jobId, deliverable) — provider submits bytes32 hash of work
- complete(jobId, reason) — evaluator approves, releases escrow to provider
- reject(jobId, reason) — evaluator/client rejects, refunds to client
- claimRefund(jobId) — after expiry, refunds to client (not hookable)

Security considerations:
- fund() requires expectedBudget == job.budget (front-running protection)
- Evaluator is fully trusted — use smart contract evaluators for verifiable logic
- Reverting hook blocks all hookable actions; claimRefund() is the guaranteed recovery path
- Use ERC-2612 permit for gasless approve+fund in single transaction

Social & links:
- X/Twitter: @_agentescrow (https://x.com/_agentescrow)
- GitHub: https://github.com/AgentEscrow8183
- EIP spec: https://eips.ethereum.org/EIPS/eip-8183
- Discussion: https://ethereum-magicians.org/t/erc-8183-agentic-commerce/27902
- Related: Virtuals Protocol uses ERC-8183

Answer questions clearly and concisely. Use technical precision for developer questions. For general questions, explain concepts simply.
Always be helpful, accurate, and focused on ERC-8183 and related Ethereum/AI agent topics.
If asked about something unrelated, politely redirect to ERC-8183 topics.`;

const messageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // AI Chat for ERC-8183
  ai: router({
    chat: publicProcedure
      .input(z.object({ messages: z.array(messageSchema).max(50) }))
      .mutation(async ({ input }) => {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: ERC8183_SYSTEM_PROMPT },
            ...input.messages,
          ],
        });
        const content = response.choices?.[0]?.message?.content ?? "Sorry, I could not generate a response. Please try again.";
        return { content };
      }),
  }),

  // User / Wallet Profile
  user: router({
    // Register wallet profile
    register: publicProcedure
      .input(z.object({
        walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid wallet address"),
        displayName: z.string().min(2).max(100),
        role: z.enum(["client", "provider", "evaluator"]),
        bio: z.string().max(500).optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");

        // Upsert profile
        await db.insert(walletProfiles).values({
          walletAddress: input.walletAddress.toLowerCase(),
          displayName: input.displayName,
          role: input.role,
          bio: input.bio ?? null,
        }).onDuplicateKeyUpdate({
          set: {
            displayName: input.displayName,
            role: input.role,
            bio: input.bio ?? null,
          },
        });

        const profile = await db.select().from(walletProfiles)
          .where(eq(walletProfiles.walletAddress, input.walletAddress.toLowerCase()))
          .limit(1);

        return profile[0];
      }),

    // Get profile by wallet address
    getProfile: publicProcedure
      .input(z.object({ walletAddress: z.string() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return null;

        const profile = await db.select().from(walletProfiles)
          .where(eq(walletProfiles.walletAddress, input.walletAddress.toLowerCase()))
          .limit(1);

        return profile[0] ?? null;
      }),
  }),

  // Jobs — off-chain mirror of on-chain ERC-8183 jobs
  jobs: router({
    // Create job record (called after on-chain tx confirmed)
    create: publicProcedure
      .input(z.object({
        jobId: z.string(),
        contractAddress: z.string(),
        chainId: z.number(),
        txHash: z.string().optional(),
        clientAddress: z.string(),
        providerAddress: z.string().optional(),
        evaluatorAddress: z.string().optional(),
        title: z.string().min(3).max(200),
        description: z.string().max(2000).optional(),
        tokenAddress: z.string(),
        tokenSymbol: z.string().max(20).optional(),
        amount: z.string(),
        expiryAt: z.number().optional(), // Unix timestamp
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");

        await db.insert(jobs).values({
          jobId: input.jobId,
          contractAddress: input.contractAddress.toLowerCase(),
          chainId: input.chainId,
          txHash: input.txHash,
          clientAddress: input.clientAddress.toLowerCase(),
          providerAddress: input.providerAddress?.toLowerCase(),
          evaluatorAddress: input.evaluatorAddress?.toLowerCase(),
          title: input.title,
          description: input.description,
          tokenAddress: input.tokenAddress.toLowerCase(),
          tokenSymbol: input.tokenSymbol ?? "ETH",
          amount: input.amount,
          state: "open",
          expiryAt: input.expiryAt ? new Date(input.expiryAt * 1000) : null,
        });

        const job = await db.select().from(jobs)
          .where(eq(jobs.jobId, input.jobId))
          .limit(1);

        return job[0];
      }),

    // Update job state (after on-chain tx)
    updateState: publicProcedure
      .input(z.object({
        jobId: z.string(),
        state: z.enum(["open", "funded", "submitted", "completed", "rejected", "expired", "cancelled"]),
        txHash: z.string().optional(),
        deliverableHash: z.string().optional(),
        deliverableUrl: z.string().optional(),
        rejectReason: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");

        const updateData: Record<string, unknown> = { state: input.state };
        if (input.txHash) updateData.txHash = input.txHash;
        if (input.deliverableHash) updateData.deliverableHash = input.deliverableHash;
        if (input.deliverableUrl) updateData.deliverableUrl = input.deliverableUrl;
        if (input.rejectReason) updateData.rejectReason = input.rejectReason;

        const now = new Date();
        if (input.state === "funded") updateData.fundedAt = now;
        if (input.state === "submitted") updateData.submittedAt = now;
        if (input.state === "completed") updateData.completedAt = now;

        await db.update(jobs).set(updateData).where(eq(jobs.jobId, input.jobId));
        const job = await db.select().from(jobs).where(eq(jobs.jobId, input.jobId)).limit(1);
        return job[0];
      }),

    // Get jobs by wallet address (as client, provider, or evaluator)
    getByWallet: publicProcedure
      .input(z.object({ walletAddress: z.string() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];

        const addr = input.walletAddress.toLowerCase();
        const result = await db.select().from(jobs)
          .where(or(
            eq(jobs.clientAddress, addr),
            eq(jobs.providerAddress, addr),
            eq(jobs.evaluatorAddress, addr),
          ))
          .orderBy(desc(jobs.createdAt))
          .limit(50);

        return result;
      }),

    // Get single job by jobId
    getById: publicProcedure
      .input(z.object({ jobId: z.string() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return null;

        const result = await db.select().from(jobs)
          .where(eq(jobs.jobId, input.jobId))
          .limit(1);

        return result[0] ?? null;
      }),

    // Get all recent jobs (public feed)
    getRecent: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(50).default(20) }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];

        return db.select().from(jobs)
          .orderBy(desc(jobs.createdAt))
          .limit(input.limit);
      }),
  }),
});

export type AppRouter = typeof appRouter;
