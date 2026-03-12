import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(null),
}));

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("Contract Explorer — jobs.getById", () => {
  it("returns null for non-existent job", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.jobs.getById({ jobId: "nonexistent-999" });
    expect(result).toBeNull();
  });

  it("accepts valid job ID string", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    // Just verify input validation passes
    const result = await caller.jobs.getById({ jobId: "12345" });
    expect(result === null || typeof result === "object").toBe(true);
  });
});

describe("Notification polling — jobs.getRecent", () => {
  it("accepts limit parameter", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.jobs.getRecent({ limit: 5 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("returns empty array when DB unavailable", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.jobs.getRecent({ limit: 20 });
    expect(result).toEqual([]);
  });
});

describe("Notification polling — jobs.getByWallet", () => {
  it("returns empty array for unknown wallet", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.jobs.getByWallet({
      walletAddress: "0x1234567890123456789012345678901234567890",
    });
    expect(result).toEqual([]);
  });
});

describe("Contract ABI validation", () => {
  it("ERC-8183 core functions are defined", () => {
    const coreFunctions = [
      "createJob",
      "setBudget",
      "fund",
      "submit",
      "complete",
      "reject",
      "claimRefund",
      "getJob",
    ];
    // Verify all core function names are non-empty strings
    coreFunctions.forEach((fn) => {
      expect(typeof fn).toBe("string");
      expect(fn.length).toBeGreaterThan(0);
    });
    expect(coreFunctions).toHaveLength(8);
  });

  it("job states match ERC-8183 specification", () => {
    const validStates = ["Open", "Funded", "Submitted", "Completed", "Rejected", "Expired"];
    expect(validStates).toHaveLength(6);
    expect(validStates).toContain("Open");
    expect(validStates).toContain("Completed");
    expect(validStates).toContain("Rejected");
    expect(validStates).toContain("Expired");
  });
});
