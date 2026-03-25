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
// Grupo 1.Configuracion

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
  numeroIdentificacion: text("numero_identificacion").notNull().unique(),
  cargoOficial: text("cargo_oficial"),
  activo: integer("activo", { mode: "boolean" }).notNull().default(true),
  ...timestamps,
});

// Grupo 2 - Catalogos

// Tabla de fuentes
export const fuentes = sqliteTable("fuentes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  codigo: text("codigo").notNull().unique(),
  nombre: text("nombre").notNull(),
  activo: integer("activo", { mode: "boolean" }).notNull().default(true),
  ...timestamps,
});

// Tabla rubros
export const rubros = sqliteTable("rubros", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  codigo: text("codigo").notNull().unique(),
  descripcion: text("descripcion").notNull(),
  activo: integer("activo", { mode: "boolean" }).notNull().default(true),
  ...timestamps,
});

// Tabla tipos proceso
export const tiposProceso = sqliteTable("tipos_proceso", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nombre: text("nombre").notNull().unique(),
  naturaleza: text("naturaleza"),
  activo: integer("activo", { mode: "boolean" }).notNull().default(true),
  ...timestamps,
});

// Tabla codigos unspsc
export const codigosUnspsc = sqliteTable("codigos_unspsc", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  codigo: text("codigo").notNull().unique(),
  descripcion: text("descripcion").notNull(),
  activo: integer("activo", { mode: "boolean" }).notNull().default(true),
  ...timestamps,
});

// Tabla tipos documento
export const tiposDocumento = sqliteTable("tipos_documento", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nombre: text("nombre").notNull().unique(),
  descripcion: text("descripcion"),
  categoria: text("categoria", {
    enum: ["PRECONTRACTUAL", "CONTRACTUAL", "EJECUCION", "LIQUIDACION"],
  }),
  activo: integer("activo", { mode: "boolean" }).notNull().default(true),
  ...timestamps,
});

// =============================================================================
// TIPOS INFERIDOS — para Server Actions, formularios y consultas tipadas
// =============================================================================

//---------------------------------------------------------------------------
// Grupo 1.Configuracion
export type Institucion = typeof instituciones.$inferSelect;
export type NuevaInstitucion = typeof instituciones.$inferInsert;

export type Funcionario = typeof funcionarios.$inferSelect;
export type NuevoFuncionario = typeof funcionarios.$inferInsert;

export type Fuente = typeof fuentes.$inferSelect;
export type NuevaFuente = typeof fuentes.$inferInsert;

export type Rubro = typeof rubros.$inferSelect;
export type NuevoRubro = typeof rubros.$inferInsert;

export type TipoProceso = typeof tiposProceso.$inferSelect;
export type NuevoTipoProceso = typeof tiposProceso.$inferInsert;

export type CodigoUnspsc = typeof codigosUnspsc.$inferSelect;
export type NuevoCodigoUnspsc = typeof codigosUnspsc.$inferInsert;

export type TipoDocumento = typeof tiposDocumento.$inferSelect;
export type NuevoTipoDocumento = typeof tiposDocumento.$inferInsert;
