// =============================================================================
// ContratoMate — Schema Físico Definitivo v2.0
// ORM: Drizzle ORM | DB: SQLite (better-sqlite3)
// =============================================================================
// Cambios respecto a v1:
//   - PROCESOS: eliminado valor_total (se deriva via RP→CDP)
//               iva_proceso → tiene_iva (boolean) + valor_iva (monto en pesos)
//   - COTIZACIONES: simplificadas — solo proponente + valor (sin artículos)
//   - ARTICULOS_COTIZACION: eliminada
//   - RP_RUBROS: simplificada — solo rp_id, cdp_rubro_id, valor_cdp, valor_rp
//   - PROCESO_UNSPSC: nueva — N:M Proceso ↔ CodigoUNSPSC
//   - TIPOS_CONTRATO → renombrado a TIPOS_PROCESO (más preciso)
// =============================================================================

import {
  sqliteTable,
  integer,
  text,
  real,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

const timestamps = {
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
};

// =============================================================================
// GRUPO 1 — CONFIGURACIÓN
// =============================================================================

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

export const funcionarios = sqliteTable(
  "funcionarios",
  {
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
  },
  (t) => [index("idx_funcionarios_institucion").on(t.institucionId)]
);

// =============================================================================
// GRUPO 2 — CATÁLOGOS
// =============================================================================

export const fuentes = sqliteTable("fuentes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  codigo: text("codigo").unique(),
  nombre: text("nombre").notNull(),
  activo: integer("activo", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

export const rubros = sqliteTable("rubros", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  codigo: text("codigo").notNull().unique(),
  descripcion: text("descripcion").notNull(),
  activo: integer("activo", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

export const tiposProceso = sqliteTable("tipos_proceso", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nombre: text("nombre").notNull().unique(),
  naturaleza: text("naturaleza"),
  activo: integer("activo", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

export const codigosUnspsc = sqliteTable("codigos_unspsc", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  codigo: text("codigo").notNull().unique(),
  descripcion: text("descripcion").notNull(),
  activo: integer("activo", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

export const tiposDocumento = sqliteTable("tipos_documento", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nombre: text("nombre").notNull().unique(),
  descripcion: text("descripcion"),
  categoria: text("categoria", {
    enum: ["PRECONTRACTUAL", "CONTRACTUAL", "EJECUCION", "LIQUIDACION"],
  }),
  activo: integer("activo", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

// =============================================================================
// GRUPO 3 — CONTRATISTAS
// =============================================================================
// Discriminador: tipo_persona define qué campos aplican
//   NATURAL  → primer_nombre, primer_apellido requeridos; nombre_razon_social null
//   JURIDICA → nombre_razon_social, representante_legal requeridos
// La validación condicional se gestiona con Zod discriminatedUnion en la app

export const contratistas = sqliteTable(
  "contratistas",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    tipoPersona: text("tipo_persona", {
      enum: ["NATURAL", "JURIDICA"],
    }).notNull(),
    tipoIdentificacion: text("tipo_identificacion", {
      enum: ["CC", "NIT", "CE", "PASAPORTE"],
    }).notNull(),
    numeroIdentificacion: text("numero_identificacion").notNull().unique(),
    digitoVerificacion: text("digito_verificacion"),       // Solo NIT
    // Persona jurídica
    nombreRazonSocial: text("nombre_razon_social"),
    representanteLegal: text("representante_legal"),
    cedulaRepresentante: text("cedula_representante"),
    // Persona natural
    primerApellido: text("primer_apellido"),
    segundoApellido: text("segundo_apellido"),
    primerNombre: text("primer_nombre"),
    otrosNombres: text("otros_nombres"),
    // Contacto
    direccion: text("direccion"),
    municipio: text("municipio"),
    departamento: text("departamento"),
    email: text("email"),
    telefonoTercero: text("telefono_tercero"),
    // Datos bancarios
    banco: text("banco"),
    tipoCuenta: text("tipo_cuenta", { enum: ["AHORROS", "CORRIENTE"] }),
    numeroCuenta: text("numero_cuenta"),
    // Tributario
    declarante: text("declarante"),
    regimen: text("regimen", {
      enum: ["RESPONSABLE_IVA", "NO_RESPONSABLE_IVA"],
    }),
    activo: integer("activo", { mode: "boolean" }).notNull().default(true),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("idx_contratistas_identificacion").on(t.numeroIdentificacion),
  ]
);

// =============================================================================
// GRUPO 4 — PRESUPUESTO
// =============================================================================

// El objeto del CDP es la fuente de verdad para todo el proceso (no se duplica)
export const cdps = sqliteTable(
  "cdps",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    institucionId: integer("institucion_id")
      .notNull()
      .references(() => instituciones.id),
    numeroCdp: text("numero_cdp").notNull(),
    vigencia: integer("vigencia").notNull(),
    fechaExpedicion: text("fecha_expedicion").notNull(),
    objeto: text("objeto").notNull(),
    // Calculado: SUM(cdp_rubros.valor). Se mantiene para consultas rápidas.
    valorTotal: real("valor_total").notNull().default(0),
    activo: integer("activo", { mode: "boolean" }).notNull().default(true),
    createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  },
  (t) => [
    uniqueIndex("idx_cdps_numero_vigencia").on(t.numeroCdp, t.vigencia),
    index("idx_cdps_institucion").on(t.institucionId),
  ]
);

export const cdpRubros = sqliteTable(
  "cdp_rubros",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    cdpId: integer("cdp_id")
      .notNull()
      .references(() => cdps.id, { onDelete: "cascade" }),
    rubroId: integer("rubro_id")
      .notNull()
      .references(() => rubros.id),
    fuenteId: integer("fuente_id")
      .notNull()
      .references(() => fuentes.id),
    valor: real("valor").notNull(),
  },
  (t) => [index("idx_cdp_rubros_cdp").on(t.cdpId)]
);

// 1:1 con CDP. El contratista aparece aquí por primera vez.
// valor_total puede ser <= valor del CDP (regla de negocio validada en app)
export const registrosPresupuestales = sqliteTable(
  "registros_presupuestales",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    cdpId: integer("cdp_id")
      .notNull()
      .unique()
      .references(() => cdps.id),
    contratistaId: integer("contratista_id")
      .notNull()
      .references(() => contratistas.id),
    numeroRp: text("numero_rp").notNull(),
    vigencia: integer("vigencia").notNull(),
    fechaExpedicion: text("fecha_expedicion").notNull(),
    // Calculado: SUM(rp_rubros.valor_rp)
    valorTotal: real("valor_total").notNull().default(0),
    createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  },
  (t) => [uniqueIndex("idx_rp_numero_vigencia").on(t.numeroRp, t.vigencia)]
);

// Versión simplificada acordada:
// solo cdp_rubro_id para trazabilidad, valor_cdp (referencia) y valor_rp (comprometido)
// Regla: valor_rp <= valor_cdp — validar en aplicación antes de guardar
export const rpRubros = sqliteTable(
  "rp_rubros",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    rpId: integer("rp_id")
      .notNull()
      .references(() => registrosPresupuestales.id, { onDelete: "cascade" }),
    cdpRubroId: integer("cdp_rubro_id")
      .notNull()
      .references(() => cdpRubros.id),
    valorCdp: real("valor_cdp").notNull(),  // Referencia, no modificable
    valorRp: real("valor_rp").notNull(),    // Comprometido: <= valor_cdp
  },
  (t) => [index("idx_rp_rubros_rp").on(t.rpId)]
);

// =============================================================================
// GRUPO 5 — PROCESO CONTRACTUAL
// =============================================================================

// Objeto → via rpId → RP → cdpId → CDP.objeto (no se duplica)
// Contratista → via rpId → RP.contratistaId (no se duplica)
// Valor total → via rpId → RP.valorTotal (no se duplica)
export const procesos = sqliteTable(
  "procesos",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    rpId: integer("rp_id")
      .notNull()
      .unique()
      .references(() => registrosPresupuestales.id),
    tipoProcesoid: integer("tipo_proceso_id")
      .notNull()
      .references(() => tiposProceso.id),
    codigo: text("codigo").notNull().unique(), // Ej: CTR-01-2026
    // IVA ingresado manualmente según tipo de contratista
    tieneIva: integer("tiene_iva", { mode: "boolean" }).notNull().default(false),
    valorIva: real("valor_iva"),  // Monto en pesos, null si no tiene IVA
    // Fechas de hechos reales (las de planeación van en etapas_cronograma)
    fechaFirma: text("fecha_firma"),
    fechaPublicacion: text("fecha_publicacion"),
    fechaInicio: text("fecha_inicio"),
    plazo: text("plazo"),
    fechaActaTerminacion: text("fecha_acta_terminacion"),
    fechaLiquidacion: text("fecha_liquidacion"),
    estado: text("estado", {
      enum: ["BORRADOR", "ACTIVO", "SUSPENDIDO", "LIQUIDADO", "ANULADO"],
    }).notNull().default("BORRADOR"),
    ...timestamps,
  },
  (t) => [
    index("idx_procesos_tipo").on(t.tipoProcesoid),
    index("idx_procesos_estado").on(t.estado),
  ]
);

// N:M — códigos UNSPSC clasifican el objeto general del proceso
export const procesoUnspsc = sqliteTable(
  "proceso_unspsc",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    procesoId: integer("proceso_id")
      .notNull()
      .references(() => procesos.id, { onDelete: "cascade" }),
    unspscId: integer("unspsc_id")
      .notNull()
      .references(() => codigosUnspsc.id),
  },
  (t) => [
    uniqueIndex("idx_proceso_unspsc_unique").on(t.procesoId, t.unspscId),
    index("idx_proceso_unspsc_proceso").on(t.procesoId),
  ]
);

// Solo proponente + valor. Sin detalle de artículos.
export const cotizaciones = sqliteTable(
  "cotizaciones",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    procesoId: integer("proceso_id")
      .notNull()
      .references(() => procesos.id, { onDelete: "cascade" }),
    contratistaId: integer("contratista_id")
      .notNull()
      .references(() => contratistas.id),
    fechaCotizacion: text("fecha_cotizacion").notNull(),
    valorTotal: real("valor_total").notNull(),
    seleccionada: integer("seleccionada", { mode: "boolean" })
      .notNull()
      .default(false),
    observaciones: text("observaciones"),
    createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  },
  (t) => [index("idx_cotizaciones_proceso").on(t.procesoId)]
);

// =============================================================================
// GRUPO 6 — CRONOGRAMA
// =============================================================================

export const cronogramas = sqliteTable("cronogramas", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  procesoId: integer("proceso_id")
    .notNull()
    .unique()
    .references(() => procesos.id, { onDelete: "cascade" }),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

export const etapasCronograma = sqliteTable(
  "etapas_cronograma",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    cronogramaId: integer("cronograma_id")
      .notNull()
      .references(() => cronogramas.id, { onDelete: "cascade" }),
    tipoDocumentoId: integer("tipo_documento_id").references(
      () => tiposDocumento.id
    ),
    nombreEtapa: text("nombre_etapa").notNull(),
    fechaInicio: text("fecha_inicio"),
    fechaFin: text("fecha_fin"),
    horaInicio: text("hora_inicio"),
    completada: integer("completada", { mode: "boolean" })
      .notNull()
      .default(false),
    orden: integer("orden").notNull(),
  },
  (t) => [index("idx_etapas_cronograma").on(t.cronogramaId)]
);

// =============================================================================
// GRUPO 7 — DOCUMENTOS Y PLANTILLAS
// =============================================================================

export const plantillas = sqliteTable(
  "plantillas",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    tipoDocumentoId: integer("tipo_documento_id")
      .notNull()
      .references(() => tiposDocumento.id),
    nombre: text("nombre").notNull(),
    version: text("version").default("1.0"),
    rutaArchivo: text("ruta_archivo").notNull(),
    activo: integer("activo", { mode: "boolean" }).notNull().default(true),
    ...timestamps,
  },
  (t) => [index("idx_plantillas_tipo").on(t.tipoDocumentoId)]
);

// nombre_variable = '{{objeto_contrato}}' → entidad_origen='cdps', campo_origen='objeto'
export const variables = sqliteTable("variables", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nombreVariable: text("nombre_variable").notNull().unique(),
  descripcion: text("descripcion").notNull(),
  entidadOrigen: text("entidad_origen").notNull(),
  campoOrigen: text("campo_origen").notNull(),
  tipoDato: text("tipo_dato", {
    enum: ["TEXTO", "NUMERO", "FECHA", "MONEDA", "BOOLEANO"],
  }).notNull(),
  formato: text("formato"), // Ej: "dd/MM/yyyy", "$ #,##0.00"
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

export const plantillaVariables = sqliteTable(
  "plantilla_variables",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    plantillaId: integer("plantilla_id")
      .notNull()
      .references(() => plantillas.id, { onDelete: "cascade" }),
    variableId: integer("variable_id")
      .notNull()
      .references(() => variables.id),
    obligatoria: integer("obligatoria", { mode: "boolean" })
      .notNull()
      .default(true),
  },
  (t) => [
    uniqueIndex("idx_plantilla_variables_unique").on(
      t.plantillaId,
      t.variableId
    ),
  ]
);

// =============================================================================
// GRUPO 8 — EXPEDIENTE
// =============================================================================

export const expedientes = sqliteTable("expedientes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  procesoId: integer("proceso_id")
    .notNull()
    .unique()
    .references(() => procesos.id, { onDelete: "cascade" }),
  vigencia: integer("vigencia").notNull(),
  rutaCarpeta: text("ruta_carpeta").notNull(),
  completitud: integer("completitud").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

export const documentosGenerados = sqliteTable(
  "documentos_generados",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    expedienteId: integer("expediente_id")
      .notNull()
      .references(() => expedientes.id, { onDelete: "cascade" }),
    plantillaId: integer("plantilla_id")
      .notNull()
      .references(() => plantillas.id),
    nombreArchivo: text("nombre_archivo").notNull(),
    ruta: text("ruta").notNull(),
    estado: text("estado", {
      enum: ["BORRADOR", "DEFINITIVO", "FIRMADO"],
    }).notNull().default("BORRADOR"),
    fechaGeneracion: text("fecha_generacion")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (t) => [index("idx_docs_generados_expediente").on(t.expedienteId)]
);

// Auditoría: valores exactos usados en cada documento generado
export const documentoVariables = sqliteTable(
  "documento_variables",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    documentoId: integer("documento_id")
      .notNull()
      .references(() => documentosGenerados.id, { onDelete: "cascade" }),
    variableId: integer("variable_id")
      .notNull()
      .references(() => variables.id),
    valorUsado: text("valor_usado").notNull(),
  },
  (t) => [
    uniqueIndex("idx_doc_variables_unique").on(t.documentoId, t.variableId),
    index("idx_doc_variables_documento").on(t.documentoId),
  ]
);

export const anexos = sqliteTable(
  "anexos",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    expedienteId: integer("expediente_id")
      .notNull()
      .references(() => expedientes.id, { onDelete: "cascade" }),
    tipoDocumentoId: integer("tipo_documento_id").references(
      () => tiposDocumento.id
    ),
    nombreArchivo: text("nombre_archivo").notNull(),
    ruta: text("ruta").notNull(),
    descripcion: text("descripcion"),
    fechaCarga: text("fecha_carga")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (t) => [index("idx_anexos_expediente").on(t.expedienteId)]
);

export const checklistItems = sqliteTable("checklist_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tipoDocumentoId: integer("tipo_documento_id").references(
    () => tiposDocumento.id
  ),
  nombre: text("nombre").notNull(),
  descripcion: text("descripcion"),
  obligatorio: integer("obligatorio", { mode: "boolean" })
    .notNull()
    .default(true),
  orden: integer("orden").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

// completitud = COUNT(completado=true) / COUNT(*) * 100
// anexo_id vincula el archivo que satisface el ítem
export const checklistVerificaciones = sqliteTable(
  "checklist_verificaciones",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    expedienteId: integer("expediente_id")
      .notNull()
      .references(() => expedientes.id, { onDelete: "cascade" }),
    checklistItemId: integer("checklist_item_id")
      .notNull()
      .references(() => checklistItems.id),
    anexoId: integer("anexo_id").references(() => anexos.id),
    completado: integer("completado", { mode: "boolean" })
      .notNull()
      .default(false),
    fechaCompletado: text("fecha_completado"),
  },
  (t) => [
    uniqueIndex("idx_checklist_ver_unique").on(
      t.expedienteId,
      t.checklistItemId
    ),
    index("idx_checklist_ver_expediente").on(t.expedienteId),
  ]
);

// =============================================================================
// TIPOS INFERIDOS — para Server Actions, formularios y consultas tipadas
// =============================================================================

export type Institucion = typeof instituciones.$inferSelect;
export type NuevaInstitucion = typeof instituciones.$inferInsert;
export type Funcionario = typeof funcionarios.$inferSelect;
export type NuevoFuncionario = typeof funcionarios.$inferInsert;
export type Fuente = typeof fuentes.$inferSelect;
export type Rubro = typeof rubros.$inferSelect;
export type TipoProceso = typeof tiposProceso.$inferSelect;
export type CodigoUnspsc = typeof codigosUnspsc.$inferSelect;
export type TipoDocumento = typeof tiposDocumento.$inferSelect;
export type Contratista = typeof contratistas.$inferSelect;
export type NuevoContratista = typeof contratistas.$inferInsert;
export type Cdp = typeof cdps.$inferSelect;
export type NuevoCdp = typeof cdps.$inferInsert;
export type CdpRubro = typeof cdpRubros.$inferSelect;
export type NuevoCdpRubro = typeof cdpRubros.$inferInsert;
export type RegistroPresupuestal = typeof registrosPresupuestales.$inferSelect;
export type NuevoRegistroPresupuestal = typeof registrosPresupuestales.$inferInsert;
export type RpRubro = typeof rpRubros.$inferSelect;
export type NuevoRpRubro = typeof rpRubros.$inferInsert;
export type Proceso = typeof procesos.$inferSelect;
export type NuevoProceso = typeof procesos.$inferInsert;
export type ProcesoUnspsc = typeof procesoUnspsc.$inferSelect;
export type Cotizacion = typeof cotizaciones.$inferSelect;
export type NuevaCotizacion = typeof cotizaciones.$inferInsert;
export type Cronograma = typeof cronogramas.$inferSelect;
export type EtapaCronograma = typeof etapasCronograma.$inferSelect;
export type NuevaEtapaCronograma = typeof etapasCronograma.$inferInsert;
export type Plantilla = typeof plantillas.$inferSelect;
export type Variable = typeof variables.$inferSelect;
export type PlantillaVariable = typeof plantillaVariables.$inferSelect;
export type Expediente = typeof expedientes.$inferSelect;
export type NuevoExpediente = typeof expedientes.$inferInsert;
export type DocumentoGenerado = typeof documentosGenerados.$inferSelect;
export type NuevoDocumentoGenerado = typeof documentosGenerados.$inferInsert;
export type DocumentoVariable = typeof documentoVariables.$inferSelect;
export type Anexo = typeof anexos.$inferSelect;
export type NuevoAnexo = typeof anexos.$inferInsert;
export type ChecklistItem = typeof checklistItems.$inferSelect;
export type ChecklistVerificacion = typeof checklistVerificaciones.$inferSelect;
