import {
  bigint,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Wallet profiles — stores on-chain identity linked to Manus user
export const walletProfiles = mysqlTable("wallet_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  walletAddress: varchar("walletAddress", { length: 42 }).notNull().unique(),
  displayName: varchar("displayName", { length: 128 }),
  rolePreference: mysqlEnum("rolePreference", ["client", "provider", "evaluator"]).default("client").notNull(),
  bio: text("bio"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WalletProfile = typeof walletProfiles.$inferSelect;
export type InsertWalletProfile = typeof walletProfiles.$inferInsert;

// Jobs — mirrors on-chain escrow job state for off-chain indexing
export const jobs = mysqlTable("jobs", {
  id: int("id").autoincrement().primaryKey(),
  jobId: varchar("jobId", { length: 64 }).notNull().unique(), // on-chain jobId or local UUID
  clientAddress: varchar("clientAddress", { length: 42 }).notNull(),
  providerAddress: varchar("providerAddress", { length: 42 }).notNull(),
  evaluatorAddress: varchar("evaluatorAddress", { length: 42 }).notNull(),
  tokenAddress: varchar("tokenAddress", { length: 42 }).notNull(),
  amount: varchar("amount", { length: 78 }).notNull(), // BigInt as string
  expiry: bigint("expiry", { mode: "number" }).notNull(), // Unix timestamp
  state: mysqlEnum("state", ["open", "funded", "submitted", "completed", "rejected", "expired", "cancelled"])
    .default("open")
    .notNull(),
  deliverableHash: varchar("deliverableHash", { length: 66 }), // bytes32 hex
  title: varchar("title", { length: 256 }),
  description: text("description"),
  txHash: varchar("txHash", { length: 66 }), // creation tx hash
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Job = typeof jobs.$inferSelect;
export type InsertJob = typeof jobs.$inferInsert;

// Job state history — audit trail for state transitions
export const jobStateHistory = mysqlTable("job_state_history", {
  id: int("id").autoincrement().primaryKey(),
  jobId: varchar("jobId", { length: 64 }).notNull(),
  fromState: varchar("fromState", { length: 32 }),
  toState: varchar("toState", { length: 32 }).notNull(),
  actorAddress: varchar("actorAddress", { length: 42 }),
  txHash: varchar("txHash", { length: 66 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type JobStateHistory = typeof jobStateHistory.$inferSelect;

// Notifications — polling-based job state change notifications
export const jobNotifications = mysqlTable("job_notifications", {
  id: int("id").autoincrement().primaryKey(),
  recipientAddress: varchar("recipientAddress", { length: 42 }).notNull(),
  jobId: varchar("jobId", { length: 64 }).notNull(),
  message: text("message").notNull(),
  type: mysqlEnum("type", ["state_change", "funded", "submitted", "completed", "rejected", "expired"]).notNull(),
  isRead: int("isRead").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type JobNotification = typeof jobNotifications.$inferSelect;
export type InsertJobNotification = typeof jobNotifications.$inferInsert;

// Chat messages — AI assistant conversation history
export const chatMessages = mysqlTable("chat_messages", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
