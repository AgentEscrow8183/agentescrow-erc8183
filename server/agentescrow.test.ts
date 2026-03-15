import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ── Mock database helpers ─────────────────────────────────────────────────

vi.mock("./db", () => ({
  createJob: vi.fn(async (data: any) => ({ ...data, createdAt: new Date(), updatedAt: new Date() })),
  getJobById: vi.fn(async (jobId: string) => {
    if (jobId === "existing-job") {
      return {
        jobId: "existing-job",
        clientAddress: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        providerAddress: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        evaluatorAddress: "0xcccccccccccccccccccccccccccccccccccccccc",
        tokenAddress: "0xdddddddddddddddddddddddddddddddddddddddd",
        amount: "1000000000000000000",
        expiry: Math.floor(Date.now() / 1000) + 86400,
        state: "open",
        title: "Test Job",
        description: "A test job",
        deliverableHash: null,
        txHash: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    if (jobId === "funded-job") {
      return {
        jobId: "funded-job",
        clientAddress: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        providerAddress: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        evaluatorAddress: "0xcccccccccccccccccccccccccccccccccccccccc",
        tokenAddress: "0xdddddddddddddddddddddddddddddddddddddddd",
        amount: "1000000000000000000",
        expiry: Math.floor(Date.now() / 1000) + 86400,
        state: "funded",
        title: "Funded Job",
        description: null,
        deliverableHash: null,
        txHash: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    return null;
  }),
  listAllJobs: vi.fn(async () => []),
  listJobsByAddress: vi.fn(async () => []),
  getJobStateHistory: vi.fn(async () => []),
  updateJobState: vi.fn(async () => {}),
  addJobStateHistory: vi.fn(async () => {}),
  createNotification: vi.fn(async () => {}),
  getNotificationsForAddress: vi.fn(async () => []),
  markNotificationsRead: vi.fn(async () => {}),
  saveChatMessage: vi.fn(async () => {}),
  getChatHistory: vi.fn(async () => []),
  upsertWalletProfile: vi.fn(async () => {}),
  getWalletProfileByAddress: vi.fn(async () => null),
  getWalletProfileByUserId: vi.fn(async () => null),
  upsertUser: vi.fn(async () => {}),
  getUserByOpenId: vi.fn(async () => null),
  getDb: vi.fn(async () => null),
}));

vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn(async () => ({
    choices: [{ message: { content: "Hello! I am AgentBot, here to help with ERC-8183." } }],
  })),
}));

// ── Context helpers ───────────────────────────────────────────────────────

function createPublicCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createAuthCtx(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────

describe("auth router", () => {
  it("returns null user when not authenticated", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const user = await caller.auth.me();
    expect(user).toBeNull();
  });

  it("returns user when authenticated", async () => {
    const caller = appRouter.createCaller(createAuthCtx());
    const user = await caller.auth.me();
    expect(user).not.toBeNull();
    expect(user?.name).toBe("Test User");
  });

  it("logout clears session cookie", async () => {
    const ctx = createAuthCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
  });
});

describe("jobs router", () => {
  it("lists all jobs when no address provided", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const jobs = await caller.jobs.list({});
    expect(Array.isArray(jobs)).toBe(true);
  });

  it("gets job by id", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const job = await caller.jobs.getById({ jobId: "existing-job" });
    expect(job.jobId).toBe("existing-job");
    expect(job.state).toBe("open");
    expect(job.title).toBe("Test Job");
  });

  it("throws NOT_FOUND for missing job", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    await expect(caller.jobs.getById({ jobId: "nonexistent" })).rejects.toThrow("Job not found");
  });

  it("creates a new job when authenticated", async () => {
    const caller = appRouter.createCaller(createAuthCtx());
    const result = await caller.jobs.create({
      providerAddress: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      evaluatorAddress: "0xcccccccccccccccccccccccccccccccccccccccc",
      tokenAddress: "0xdddddddddddddddddddddddddddddddddddddddd",
      amount: "1000000000000000000",
      expiry: Math.floor(Date.now() / 1000) + 86400,
      title: "New Test Job",
      clientAddress: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    });
    expect(result).toBeDefined();
    expect(result.state).toBe("open");
  });

  it("allows job creation without authentication (wallet-based auth)", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.jobs.create({
      providerAddress: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      evaluatorAddress: "0xcccccccccccccccccccccccccccccccccccccccc",
      tokenAddress: "0xdddddddddddddddddddddddddddddddddddddddd",
      amount: "1000000000000000000",
      expiry: Math.floor(Date.now() / 1000) + 86400,
      clientAddress: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    });
    expect(result).toBeDefined();
    expect(result?.jobId).toBeDefined();
  });

  it("allows valid state transition: open → funded", async () => {
    const caller = appRouter.createCaller(createAuthCtx());
    const result = await caller.jobs.updateState({
      jobId: "existing-job",
      action: "fund",
      actorAddress: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    });
    expect(result.success).toBe(true);
    expect(result.newState).toBe("funded");
  });

  it("rejects invalid state transition: funded → fund again", async () => {
    const caller = appRouter.createCaller(createAuthCtx());
    await expect(
      caller.jobs.updateState({
        jobId: "funded-job",
        action: "fund",
        actorAddress: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      })
    ).rejects.toThrow();
  });

  it("gets job state history", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const history = await caller.jobs.getHistory({ jobId: "existing-job" });
    expect(Array.isArray(history)).toBe(true);
  });
});

describe("notifications router", () => {
  it("lists notifications for an address", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const notifs = await caller.notifications.list({
      address: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    });
    expect(Array.isArray(notifs)).toBe(true);
  });

  it("marks notifications as read", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.notifications.markRead({
      address: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    });
    expect(result.success).toBe(true);
  });
});

describe("chat router", () => {
  it("sends a message and returns AI reply", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.chat.send({
      sessionId: "test-session-123",
      message: "What is ERC-8183?",
    });
    expect(result.reply).toBeDefined();
    expect(typeof result.reply).toBe("string");
    expect(result.reply.length).toBeGreaterThan(0);
  });

  it("retrieves chat history for a session", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const history = await caller.chat.history({ sessionId: "test-session-123" });
    expect(Array.isArray(history)).toBe(true);
  });
});

describe("wallet router", () => {
  it("registers wallet profile when authenticated", async () => {
    const caller = appRouter.createCaller(createAuthCtx());
    const result = await caller.wallet.register({
      walletAddress: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      displayName: "Test User",
      rolePreference: "client",
      bio: "I am a test client.",
    });
    expect(result.success).toBe(true);
  });

  it("allows wallet registration without authentication (wallet-based auth)", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.wallet.register({
      walletAddress: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      displayName: "Test User",
    });
    expect(result.success).toBe(true);
  });

  it("gets public wallet profile by address", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const profile = await caller.wallet.getProfile({
      address: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    });
    // Returns null since mock returns null
    expect(profile).toBeNull();
  });
});
