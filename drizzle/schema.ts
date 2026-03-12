import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, bigint, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
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

/**
 * Wallet profiles — stores Web3 wallet registrations for ERC-8183 participants.
 * A user can register with a wallet address and choose a role (client/provider/evaluator).
 */
export const walletProfiles = mysqlTable("wallet_profiles", {
  id: int("id").autoincrement().primaryKey(),
  walletAddress: varchar("walletAddress", { length: 42 }).notNull().unique(),
  displayName: varchar("displayName", { length: 100 }).notNull(),
  role: mysqlEnum("role", ["client", "provider", "evaluator"]).notNull(),
  bio: text("bio"),
  chainId: int("chainId").default(11155111), // Sepolia by default
  isVerified: boolean("isVerified").default(false),
  jobsCreated: int("jobsCreated").default(0),
  jobsCompleted: int("jobsCompleted").default(0),
  reputation: int("reputation").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WalletProfile = typeof walletProfiles.$inferSelect;
export type InsertWalletProfile = typeof walletProfiles.$inferInsert;

/**
 * Jobs — off-chain mirror of on-chain ERC-8183 jobs.
 * Stores metadata and state for display purposes.
 * The source of truth is always the smart contract.
 */
export const jobs = mysqlTable("jobs", {
  id: int("id").autoincrement().primaryKey(),
  // On-chain data
  jobId: varchar("jobId", { length: 78 }).notNull().unique(), // on-chain uint256 as string
  contractAddress: varchar("contractAddress", { length: 42 }).notNull(),
  chainId: int("chainId").notNull(),
  txHash: varchar("txHash", { length: 66 }),
  // Participants
  clientAddress: varchar("clientAddress", { length: 42 }).notNull(),
  providerAddress: varchar("providerAddress", { length: 42 }),
  evaluatorAddress: varchar("evaluatorAddress", { length: 42 }),
  // Job details
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  tokenAddress: varchar("tokenAddress", { length: 42 }).notNull(),
  tokenSymbol: varchar("tokenSymbol", { length: 20 }).default("ETH"),
  amount: varchar("amount", { length: 78 }).notNull(), // BigInt as string
  // State (mirrors on-chain)
  state: mysqlEnum("state", ["open", "funded", "submitted", "completed", "rejected", "expired", "cancelled"]).default("open").notNull(),
  deliverableHash: varchar("deliverableHash", { length: 66 }),
  deliverableUrl: text("deliverableUrl"),
  rejectReason: text("rejectReason"),
  // Timestamps
  expiryAt: timestamp("expiryAt"),
  fundedAt: timestamp("fundedAt"),
  submittedAt: timestamp("submittedAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Job = typeof jobs.$inferSelect;
export type InsertJob = typeof jobs.$inferInsert;
