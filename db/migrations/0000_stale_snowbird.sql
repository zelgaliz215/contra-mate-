CREATE TABLE `codigos_unspsc` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`codigo` text NOT NULL,
	`descripcion` text NOT NULL,
	`activo` integer DEFAULT true NOT NULL,
	`createdAt` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `codigos_unspsc_codigo_unique` ON `codigos_unspsc` (`codigo`);--> statement-breakpoint
CREATE TABLE `fuentes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`codigo` text NOT NULL,
	`nombre` text NOT NULL,
	`activo` integer DEFAULT true NOT NULL,
	`createdAt` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `fuentes_codigo_unique` ON `fuentes` (`codigo`);--> statement-breakpoint
CREATE TABLE `funcionarios` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`institucion_id` integer NOT NULL,
	`rol` text NOT NULL,
	`nombre_completo` text NOT NULL,
	`tipo_identificacion` text NOT NULL,
	`numero_identificacion` text NOT NULL,
	`cargo_oficial` text,
	`activo` integer DEFAULT true NOT NULL,
	`createdAt` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`institucion_id`) REFERENCES `instituciones`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
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
CREATE UNIQUE INDEX `instituciones_nit_unique` ON `instituciones` (`nit`);--> statement-breakpoint
CREATE TABLE `rubros` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`codigo` text NOT NULL,
	`descripcion` text NOT NULL,
	`activo` integer DEFAULT true NOT NULL,
	`createdAt` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `rubros_codigo_unique` ON `rubros` (`codigo`);--> statement-breakpoint
CREATE TABLE `tipos_documento` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text NOT NULL,
	`descripcion` text,
	`categoria` text,
	`activo` integer DEFAULT true NOT NULL,
	`createdAt` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tipos_documento_nombre_unique` ON `tipos_documento` (`nombre`);--> statement-breakpoint
CREATE TABLE `tipos_proceso` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text NOT NULL,
	`naturaleza` text,
	`activo` integer DEFAULT true NOT NULL,
	`createdAt` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`created_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);