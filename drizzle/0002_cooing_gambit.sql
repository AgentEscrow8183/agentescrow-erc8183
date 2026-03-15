CREATE TABLE `blog_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(128) NOT NULL,
	`title` varchar(256) NOT NULL,
	`summary` text NOT NULL,
	`content` text NOT NULL,
	`category` enum('update','roadmap','announcement','tutorial','research') NOT NULL DEFAULT 'update',
	`tags` varchar(512),
	`authorName` varchar(128) NOT NULL DEFAULT 'AgentEscrow Team',
	`coverImage` text,
	`published` int NOT NULL DEFAULT 0,
	`publishedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `blog_posts_id` PRIMARY KEY(`id`),
	CONSTRAINT `blog_posts_slug_unique` UNIQUE(`slug`)
);
