import { and, desc, eq, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertJob,
  InsertJobNotification,
  InsertUser,
  InsertWalletProfile,
  InsertBlogPost,
  blogPosts,
  chatMessages,
  jobNotifications,
  jobStateHistory,
  jobs,
  users,
  walletProfiles,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ── Users ──────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};

  const textFields = ["name", "email", "loginMethod"] as const;
  textFields.forEach((field) => {
    const value = user[field];
    if (value === undefined) return;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  });

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

// ── Wallet Profiles ────────────────────────────────────────────────────────

export async function upsertWalletProfile(profile: InsertWalletProfile) {
  const db = await getDb();
  if (!db) return;
  const updateSet: Record<string, unknown> = {
    displayName: profile.displayName ?? null,
    rolePreference: profile.rolePreference ?? "client",
    bio: profile.bio ?? null,
  };
  await db
    .insert(walletProfiles)
    .values(profile)
    .onDuplicateKeyUpdate({ set: updateSet });
}

export async function getWalletProfileByAddress(address: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(walletProfiles)
    .where(eq(walletProfiles.walletAddress, address.toLowerCase()))
    .limit(1);
  return result[0];
}

export async function getWalletProfileByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(walletProfiles)
    .where(eq(walletProfiles.userId, userId))
    .limit(1);
  return result[0];
}

// ── Jobs ───────────────────────────────────────────────────────────────────

export async function createJob(job: InsertJob) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(jobs).values(job);
  const result = await db.select().from(jobs).where(eq(jobs.jobId, job.jobId)).limit(1);
  return result[0];
}

export async function getJobById(jobId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(jobs).where(eq(jobs.jobId, jobId)).limit(1);
  return result[0];
}

export async function listJobsByAddress(address: string) {
  const db = await getDb();
  if (!db) return [];
  const addr = address.toLowerCase();
  return db
    .select()
    .from(jobs)
    .where(
      or(
        eq(jobs.clientAddress, addr),
        eq(jobs.providerAddress, addr),
        eq(jobs.evaluatorAddress, addr)
      )
    )
    .orderBy(desc(jobs.createdAt));
}

export async function listAllJobs(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(jobs).orderBy(desc(jobs.createdAt)).limit(limit);
}

export async function updateJobState(
  jobId: string,
  state: "open" | "funded" | "submitted" | "completed" | "rejected" | "expired" | "cancelled",
  extras?: { deliverableHash?: string; txHash?: string }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateSet: Record<string, unknown> = { state };
  if (extras?.deliverableHash) updateSet.deliverableHash = extras.deliverableHash;
  if (extras?.txHash) updateSet.txHash = extras.txHash;
  await db.update(jobs).set(updateSet).where(eq(jobs.jobId, jobId));
}

export async function addJobStateHistory(entry: {
  jobId: string;
  fromState?: string;
  toState: string;
  actorAddress?: string;
  txHash?: string;
}) {
  const db = await getDb();
  if (!db) return;
  await db.insert(jobStateHistory).values(entry);
}

export async function getJobStateHistory(jobId: string) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(jobStateHistory)
    .where(eq(jobStateHistory.jobId, jobId))
    .orderBy(desc(jobStateHistory.createdAt));
}

// ── Notifications ──────────────────────────────────────────────────────────

export async function createNotification(notif: InsertJobNotification) {
  const db = await getDb();
  if (!db) return;
  await db.insert(jobNotifications).values(notif);
}

export async function getNotificationsForAddress(address: string, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(jobNotifications)
    .where(eq(jobNotifications.recipientAddress, address.toLowerCase()))
    .orderBy(desc(jobNotifications.createdAt))
    .limit(limit);
}

export async function markNotificationsRead(address: string) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(jobNotifications)
    .set({ isRead: 1 })
    .where(
      and(
        eq(jobNotifications.recipientAddress, address.toLowerCase()),
        eq(jobNotifications.isRead, 0)
      )
    );
}

// ── Chat Messages ──────────────────────────────────────────────────────────

export async function saveChatMessage(sessionId: string, role: "user" | "assistant", content: string) {
  const db = await getDb();
  if (!db) return;
  await db.insert(chatMessages).values({ sessionId, role, content });
}

export async function getChatHistory(sessionId: string, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.sessionId, sessionId))
    .orderBy(desc(chatMessages.createdAt))
    .limit(limit);
}

// ── Blog Posts ─────────────────────────────────────────────────────────────
export async function listBlogPosts(options?: { category?: string; limit?: number; publishedOnly?: boolean }) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (options?.publishedOnly !== false) conditions.push(eq(blogPosts.published, 1));
  const cat = options?.category as InsertBlogPost["category"] | undefined;
  if (cat) conditions.push(eq(blogPosts.category, cat));
  return db
    .select()
    .from(blogPosts)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(blogPosts.publishedAt))
    .limit(options?.limit ?? 50);
}

export async function getBlogPostBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1);
  return result[0] ?? null;
}

export async function createBlogPost(post: InsertBlogPost) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(blogPosts).values(post);
  return getBlogPostBySlug(post.slug);
}

export async function updateBlogPost(slug: string, updates: Partial<InsertBlogPost>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(blogPosts).set(updates).where(eq(blogPosts.slug, slug));
  return getBlogPostBySlug(slug);
}
