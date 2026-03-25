import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});

//---------------------------------------------------------------------------
// Grupo configuracion

// Definicion de marcas de tiempo general
const timestamps = {
  createdAt: text("createdAt")
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
};

// Tabla de instituciones
export const instituciones = sqliteTable("instituciones", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nombre: text("nombre").notNull(),
  siglas: text("siglas").notNull(),
  nit: text("nit").notNull().unique(),
  municipio: text("municipio"),
  departamento: text("departamento"),
  telefono: text("telefono"),
  email: text("email"),
  ...timestamps,
});

// Tabla de funcionarios
export const funcionarios = sqliteTable("funcionarios", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  institucionId: integer("institucion_id")
    .notNull()
    .references(() => instituciones.id),
  rol: text("rol", {
    enum: ["RECTOR", "PAGADOR", "CONTADOR", "SUPERVISOR"],
  }).notNull(),
  nombreCompleto: text("nombre_completo").notNull(),
  tipoIdentificacion: text("tipo_identificacion", {
    enum: ["CC", "CE"],
  }).notNull(),
  numeroIdentificacion: text("numero_identificacion").notNull(),
  cargoOficial: text("cargo_oficial"),
  activo: integer("activo", { mode: "boolean" }).notNull().default(true),
  ...timestamps,
});
