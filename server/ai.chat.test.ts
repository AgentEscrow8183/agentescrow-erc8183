import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the LLM module
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [
      {
        message: {
          content: "ERC-8183 is the Agentic Commerce Protocol — a trustless escrow standard for AI agent commerce on Ethereum.",
        },
      },
    ],
  }),
}));

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("ai.chat", () => {
  it("returns AI response for a valid user message about ERC-8183", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.ai.chat({
      messages: [{ role: "user", content: "What is ERC-8183?" }],
    });

    expect(result).toBeDefined();
    expect(result.content).toBeTypeOf("string");
    expect(result.content.length).toBeGreaterThan(0);
  });

  it("handles multi-turn conversation messages", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.ai.chat({
      messages: [
        { role: "user", content: "What is ERC-8183?" },
        { role: "assistant", content: "ERC-8183 is the Agentic Commerce Protocol." },
        { role: "user", content: "Who are the authors?" },
      ],
    });

    expect(result).toBeDefined();
    expect(result.content).toBeTypeOf("string");
  });

  it("rejects messages array exceeding 50 items", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const tooManyMessages = Array.from({ length: 51 }, (_, i) => ({
      role: (i % 2 === 0 ? "user" : "assistant") as "user" | "assistant",
      content: `Message ${i}`,
    }));

    await expect(
      caller.ai.chat({ messages: tooManyMessages })
    ).rejects.toThrow();
  });

  it("is accessible without authentication (publicProcedure)", async () => {
    const ctx = createPublicContext(); // No user
    const caller = appRouter.createCaller(ctx);

    // Should not throw unauthorized error
    const result = await caller.ai.chat({
      messages: [{ role: "user", content: "How does escrow work in ERC-8183?" }],
    });

    expect(result.content).toBeDefined();
  });
});
