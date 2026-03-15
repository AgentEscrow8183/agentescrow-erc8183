CREATE TABLE `chat_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(64) NOT NULL,
	`role` enum('user','assistant') NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chat_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `job_notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`recipientAddress` varchar(42) NOT NULL,
	`jobId` varchar(64) NOT NULL,
	`message` text NOT NULL,
	`type` enum('state_change','funded','submitted','completed','rejected','expired') NOT NULL,
	`isRead` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `job_notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `job_state_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jobId` varchar(64) NOT NULL,
	`fromState` varchar(32),
	`toState` varchar(32) NOT NULL,
	`actorAddress` varchar(42),
	`txHash` varchar(66),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `job_state_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jobId` varchar(64) NOT NULL,
	`clientAddress` varchar(42) NOT NULL,
	`providerAddress` varchar(42) NOT NULL,
	`evaluatorAddress` varchar(42) NOT NULL,
	`tokenAddress` varchar(42) NOT NULL,
	`amount` varchar(78) NOT NULL,
	`expiry` bigint NOT NULL,
	`state` enum('open','funded','submitted','completed','rejected','expired','cancelled') NOT NULL DEFAULT 'open',
	`deliverableHash` varchar(66),
	`title` varchar(256),
	`description` text,
	`txHash` varchar(66),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `jobs_id` PRIMARY KEY(`id`),
	CONSTRAINT `jobs_jobId_unique` UNIQUE(`jobId`)
);
--> statement-breakpoint
CREATE TABLE `wallet_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`walletAddress` varchar(42) NOT NULL,
	`displayName` varchar(128),
	`rolePreference` enum('client','provider','evaluator') NOT NULL DEFAULT 'client',
	`bio` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `wallet_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `wallet_profiles_walletAddress_unique` UNIQUE(`walletAddress`)
);
