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
