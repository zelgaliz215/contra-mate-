CREATE TABLE `instituciones` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text NOT NULL,
	`siglas` text NOT NULL,
	`nit` text NOT NULL,
	`municipio` text,
	`departamento` text,
	`telefono` text,
	`email` text,
	`createdAt` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `instituciones_nit_unique` ON `instituciones` (`nit`);