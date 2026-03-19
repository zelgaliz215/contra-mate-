# Modelado de Datos — ContratoMate
## Sistema de Gestión de Contratación Pública para Instituciones Educativas

**Versión:** 2.0
**Fecha:** 18 de marzo de 2026
**Autor:** Daniel Eduardo Trejos Montiel / Claude

---

## 1. Introducción

Este documento presenta el modelado de datos completo del sistema ContratoMate
en sus tres niveles: conceptual (entidades y relaciones), lógico (atributos
detallados) y físico (schema Drizzle ORM para SQLite).

El modelo final cuenta con **26 entidades** y **35 relaciones** organizadas
en 8 grupos funcionales.

---

## 2. Identificación de Entidades

### 2.1 Clasificación por Tipo

| # | Entidad | Tipo | Grupo |
|---|---|---|---|
| 1 | `Institucion` | Configuración única | Configuración |
| 2 | `Funcionario` | Maestro | Configuración |
| 3 | `Fuente` | Catálogo | Catálogos |
| 4 | `Rubro` | Catálogo | Catálogos |
| 5 | `TipoProceso` | Catálogo | Catálogos |
| 6 | `CodigoUNSPSC` | Catálogo | Catálogos |
| 7 | `TipoDocumento` | Catálogo | Catálogos |
| 8 | `Contratista` | Maestro | Contratistas |
| 9 | `CDP` | Transaccional | Presupuesto |
| 10 | `CDP_Rubro` | Intermedia/Detalle | Presupuesto |
| 11 | `RegistroPresupuestal` | Transaccional | Presupuesto |
| 12 | `RP_Rubro` | Intermedia/Detalle | Presupuesto |
| 13 | `Proceso` | Transaccional | Proceso |
| 14 | `ProcesoUnspsc` | Intermedia N:M | Proceso |
| 15 | `Cotizacion` | Transaccional | Proceso |
| 16 | `Cronograma` | Transaccional | Cronograma |
| 17 | `EtapaCronograma` | Detalle | Cronograma |
| 18 | `Plantilla` | Configuración | Plantillas |
| 19 | `Variable` | Catálogo | Plantillas |
| 20 | `PlantillaVariable` | Intermedia N:M | Plantillas |
| 21 | `Expediente` | Transaccional | Expediente |
| 22 | `DocumentoGenerado` | Transaccional | Expediente |
| 23 | `DocumentoVariable` | Auditoría | Expediente |
| 24 | `Anexo` | Transaccional | Expediente |
| 25 | `ChecklistItem` | Catálogo | Expediente |
| 26 | `ChecklistVerificacion` | Intermedia N:M | Expediente |

---

## 3. Listado de Relaciones (35 en total)

| # | Entidad origen | Cardinalidad | Entidad destino | Descripción |
|---|---|---|---|---|
| 1 | `Institucion` | 1:N | `Funcionario` | Una institución tiene muchos funcionarios |
| 2 | `Institucion` | 1:N | `CDP` | Una institución emite muchos CDPs |
| 3 | `CDP` | 1:N | `CDP_Rubro` | Un CDP tiene múltiples líneas de rubro/fuente |
| 4 | `Rubro` | N:1 | `CDP_Rubro` | Cada línea de CDP referencia un rubro |
| 5 | `Fuente` | N:1 | `CDP_Rubro` | Cada línea de CDP tiene una fuente |
| 6 | `CDP` | 1:1 | `RegistroPresupuestal` | Un CDP origina exactamente un RP |
| 7 | `Contratista` | N:1 | `RegistroPresupuestal` | El RP asigna el contratista ganador |
| 8 | `RegistroPresupuestal` | 1:N | `RP_Rubro` | Un RP tiene líneas de valor comprometido |
| 9 | `CDP_Rubro` | N:1 | `RP_Rubro` | Cada línea del RP traza su origen en el CDP |
| 10 | `Rubro` | N:1 | `RP_Rubro` | Cada línea del RP referencia un rubro |
| 11 | `Fuente` | N:1 | `RP_Rubro` | Cada línea del RP tiene una fuente |
| 12 | `RegistroPresupuestal` | 1:1 | `Proceso` | Del RP nace exactamente un proceso |
| 13 | `TipoProceso` | N:1 | `Proceso` | Cada proceso tiene un tipo |
| 14 | `Proceso` | N:M | `CodigoUNSPSC` | Un proceso clasifica con N códigos UNSPSC (via ProcesoUnspsc) |
| 15 | `Proceso` | 1:N | `Cotizacion` | Un proceso recibe N cotizaciones |
| 16 | `Contratista` | N:1 | `Cotizacion` | Cada cotización proviene de un contratista |
| 17 | `Proceso` | 1:1 | `Cronograma` | Cada proceso tiene un cronograma |
| 18 | `Cronograma` | 1:N | `EtapaCronograma` | Un cronograma tiene múltiples etapas |
| 19 | `TipoDocumento` | N:1 | `EtapaCronograma` | Una etapa puede asociarse a un tipo de documento |
| 20 | `Proceso` | 1:1 | `Expediente` | Cada proceso tiene un expediente digital |
| 21 | `TipoDocumento` | N:1 | `Plantilla` | Cada plantilla corresponde a un tipo de documento |
| 22 | `Plantilla` | N:M | `Variable` | Una plantilla requiere N variables (via PlantillaVariable) |
| 23 | `Expediente` | 1:N | `DocumentoGenerado` | El expediente contiene documentos generados |
| 24 | `Plantilla` | N:1 | `DocumentoGenerado` | Cada documento se genera desde una plantilla |
| 25 | `DocumentoGenerado` | 1:N | `DocumentoVariable` | Cada documento registra los valores usados (auditoría) |
| 26 | `Variable` | N:1 | `DocumentoVariable` | Cada registro de auditoría referencia una variable |
| 27 | `Expediente` | 1:N | `Anexo` | El expediente contiene archivos subidos manualmente |
| 28 | `TipoDocumento` | N:1 | `Anexo` | Cada anexo clasifica con un tipo de documento |
| 29 | `TipoDocumento` | N:1 | `ChecklistItem` | Cada ítem del checklist corresponde a un tipo de documento |
| 30 | `Expediente` | N:M | `ChecklistItem` | El expediente verifica N ítems (via ChecklistVerificacion) |
| 31 | `Anexo` | N:1 | `ChecklistVerificacion` | Un anexo puede satisfacer un ítem del checklist |
| 32 | `TipoDocumento` | N:1 | `ChecklistItem` | Los ítems del catálogo se asocian a tipos de documento |
| 33 | `Rubro` | N:1 | `CDP_Rubro` | (ya en R4) |
| 34 | `Fuente` | N:1 | `CDP_Rubro` | (ya en R5) |
| 35 | `Variable` | N:1 | `PlantillaVariable` | Cada variable puede aparecer en múltiples plantillas |

---

## 4. Modelo Lógico — Atributos por Entidad

### GRUPO 1 — CONFIGURACIÓN

#### `Institucion`
| Atributo | Tipo | Restricción | Descripción |
|---|---|---|---|
| id | INTEGER | PK, AUTO | Identificador único |
| nombre | TEXT | NOT NULL | Nombre completo del colegio |
| siglas | TEXT | NOT NULL | Ej: IEDNDJ |
| nit | TEXT | NOT NULL, UNIQUE | Formato: 823001921-9 |
| municipio | TEXT | — | Municipio |
| departamento | TEXT | — | Departamento |
| telefono | TEXT | — | Teléfono |
| email | TEXT | — | Correo electrónico |
| created_at | TEXT | NOT NULL | Timestamp de creación |
| updated_at | TEXT | NOT NULL | Timestamp de actualización |

#### `Funcionario`
| Atributo | Tipo | Restricción | Descripción |
|---|---|---|---|
| id | INTEGER | PK, AUTO | |
| institucion_id | INTEGER | FK NOT NULL | → instituciones.id |
| rol | TEXT ENUM | NOT NULL | RECTOR, PAGADOR, CONTADOR, SUPERVISOR |
| nombre_completo | TEXT | NOT NULL | |
| tipo_identificacion | TEXT ENUM | NOT NULL | CC, CE |
| numero_identificacion | TEXT | NOT NULL | |
| cargo_oficial | TEXT | — | Ej: "Auxiliar Administrativo" |
| activo | BOOLEAN | DEFAULT true | Solo 1 activo por rol |
| created_at | TEXT | NOT NULL | |
| updated_at | TEXT | NOT NULL | |

**Regla:** Solo 1 funcionario activo por rol. Al activar uno, el anterior del mismo rol se desactiva automáticamente.

---

### GRUPO 2 — CATÁLOGOS

#### `Fuente`
| Atributo | Tipo | Restricción | Descripción |
|---|---|---|---|
| id | INTEGER | PK, AUTO | |
| codigo | TEXT | UNIQUE | Ej: SGP-GRATUIDAD |
| nombre | TEXT | NOT NULL | Ej: "SGP - Gratuidad" |
| activo | BOOLEAN | DEFAULT true | |
| created_at | TEXT | NOT NULL | |

#### `Rubro`
| Atributo | Tipo | Restricción | Descripción |
|---|---|---|---|
| id | INTEGER | PK, AUTO | |
| codigo | TEXT | NOT NULL, UNIQUE | Ej: 2.1.02.02.008.06 |
| descripcion | TEXT | NOT NULL | |
| activo | BOOLEAN | DEFAULT true | |
| created_at | TEXT | NOT NULL | |

#### `TipoProceso`
| Atributo | Tipo | Restricción | Descripción |
|---|---|---|---|
| id | INTEGER | PK, AUTO | |
| nombre | TEXT | NOT NULL, UNIQUE | Ej: PRESTACIÓN DE SERVICIOS |
| naturaleza | TEXT | — | Ej: "Servicios", "Bienes" |
| activo | BOOLEAN | DEFAULT true | |
| created_at | TEXT | NOT NULL | |

#### `CodigoUNSPSC`
| Atributo | Tipo | Restricción | Descripción |
|---|---|---|---|
| id | INTEGER | PK, AUTO | |
| codigo | TEXT | NOT NULL, UNIQUE | Solo dígitos, ej: 72102700 |
| descripcion | TEXT | NOT NULL | |
| activo | BOOLEAN | DEFAULT true | |
| created_at | TEXT | NOT NULL | |

#### `TipoDocumento`
| Atributo | Tipo | Restricción | Descripción |
|---|---|---|---|
| id | INTEGER | PK, AUTO | |
| nombre | TEXT | NOT NULL, UNIQUE | Ej: CDP, Contrato, Acta de Inicio |
| descripcion | TEXT | — | |
| categoria | TEXT ENUM | — | PRECONTRACTUAL, CONTRACTUAL, EJECUCION, LIQUIDACION |
| activo | BOOLEAN | DEFAULT true | |
| created_at | TEXT | NOT NULL | |

---

### GRUPO 3 — CONTRATISTAS

#### `Contratista`
| Atributo | Tipo | Restricción | Descripción |
|---|---|---|---|
| id | INTEGER | PK, AUTO | |
| tipo_persona | TEXT ENUM | NOT NULL | NATURAL, JURIDICA |
| tipo_identificacion | TEXT ENUM | NOT NULL | CC, NIT, CE, PASAPORTE |
| numero_identificacion | TEXT | NOT NULL, UNIQUE | |
| digito_verificacion | TEXT | — | Solo para NIT |
| nombre_razon_social | TEXT | — | Obligatorio si JURIDICA |
| representante_legal | TEXT | — | Obligatorio si JURIDICA |
| cedula_representante | TEXT | — | |
| primer_apellido | TEXT | — | Obligatorio si NATURAL |
| segundo_apellido | TEXT | — | |
| primer_nombre | TEXT | — | Obligatorio si NATURAL |
| otros_nombres | TEXT | — | |
| direccion | TEXT | — | |
| municipio | TEXT | — | |
| departamento | TEXT | — | |
| email | TEXT | — | |
| telefono_tercero | TEXT | — | |
| banco | TEXT | — | |
| tipo_cuenta | TEXT ENUM | — | AHORROS, CORRIENTE |
| numero_cuenta | TEXT | — | |
| declarante | TEXT | — | |
| regimen | TEXT ENUM | — | RESPONSABLE_IVA, NO_RESPONSABLE_IVA |
| activo | BOOLEAN | DEFAULT true | |
| created_at / updated_at | TEXT | NOT NULL | |

**Discriminador:** `tipo_persona` define qué campos son obligatorios. Validado con `discriminatedUnion` en Zod.

---

### GRUPO 4 — PRESUPUESTO

#### `CDP`
| Atributo | Tipo | Restricción | Descripción |
|---|---|---|---|
| id | INTEGER | PK, AUTO | |
| institucion_id | INTEGER | FK NOT NULL | → instituciones.id |
| numero_cdp | TEXT | NOT NULL | Único por vigencia |
| vigencia | INTEGER | NOT NULL | Año fiscal |
| fecha_expedicion | TEXT | NOT NULL | ISO date |
| objeto | TEXT | NOT NULL | **Fuente de verdad del objeto para todo el proceso** |
| valor_total | REAL | NOT NULL, DEFAULT 0 | Calculado: SUM(cdp_rubros.valor) |
| activo | BOOLEAN | DEFAULT true | |
| created_at | TEXT | NOT NULL | |

**Índices:** UNIQUE(numero_cdp, vigencia)

#### `CDP_Rubro`
| Atributo | Tipo | Restricción | Descripción |
|---|---|---|---|
| id | INTEGER | PK, AUTO | |
| cdp_id | INTEGER | FK NOT NULL, CASCADE | → cdps.id |
| rubro_id | INTEGER | FK NOT NULL | → rubros.id |
| fuente_id | INTEGER | FK NOT NULL | → fuentes.id |
| valor | REAL | NOT NULL | Valor asignado a esta línea |

#### `RegistroPresupuestal`
| Atributo | Tipo | Restricción | Descripción |
|---|---|---|---|
| id | INTEGER | PK, AUTO | |
| cdp_id | INTEGER | FK NOT NULL, UNIQUE | → cdps.id (1:1 con CDP) |
| contratista_id | INTEGER | FK NOT NULL | → contratistas.id |
| numero_rp | TEXT | NOT NULL | Único por vigencia |
| vigencia | INTEGER | NOT NULL | |
| fecha_expedicion | TEXT | NOT NULL | |
| valor_total | REAL | NOT NULL, DEFAULT 0 | Calculado: SUM(rp_rubros.valor_rp) |
| created_at | TEXT | NOT NULL | |

#### `RP_Rubro` — Versión simplificada
| Atributo | Tipo | Restricción | Descripción |
|---|---|---|---|
| id | INTEGER | PK, AUTO | |
| rp_id | INTEGER | FK NOT NULL, CASCADE | → registros_presupuestales.id |
| cdp_rubro_id | INTEGER | FK NOT NULL | → cdp_rubros.id (trazabilidad) |
| valor_cdp | REAL | NOT NULL | Valor certificado en el CDP (referencia) |
| valor_rp | REAL | NOT NULL | Valor comprometido (**debe ser ≤ valor_cdp**) |

**Regla:** `valor_rp ≤ valor_cdp` validado en Zod y en Server Action antes de insertar.

---

### GRUPO 5 — PROCESO CONTRACTUAL

#### `Proceso`
| Atributo | Tipo | Restricción | Descripción |
|---|---|---|---|
| id | INTEGER | PK, AUTO | |
| rp_id | INTEGER | FK NOT NULL, UNIQUE | → registros_presupuestales.id (1:1) |
| tipo_proceso_id | INTEGER | FK NOT NULL | → tipos_proceso.id |
| codigo | TEXT | NOT NULL, UNIQUE | Ej: CTR-01-2026 |
| tiene_iva | BOOLEAN | NOT NULL, DEFAULT false | ¿El contrato tiene IVA? |
| valor_iva | REAL | — | Monto en pesos, ingresado manualmente |
| fecha_firma | TEXT | — | Fecha real de firma |
| fecha_publicacion | TEXT | — | Fecha publicación SECOP |
| fecha_inicio | TEXT | — | Fecha real de inicio |
| plazo | TEXT | — | Duración del contrato |
| fecha_acta_terminacion | TEXT | — | Fecha real de terminación |
| fecha_liquidacion | TEXT | — | Fecha de liquidación |
| estado | TEXT ENUM | NOT NULL, DEFAULT 'BORRADOR' | BORRADOR, ACTIVO, SUSPENDIDO, LIQUIDADO, ANULADO |
| created_at / updated_at | TEXT | NOT NULL | |

**Datos derivados (NO almacenados en proceso):**
- Objeto → via `rp_id → RP → cdp_id → CDP.objeto`
- Contratista → via `rp_id → RP.contratista_id`
- Valor total → via `rp_id → RP.valor_total`

#### `ProcesoUnspsc` — Intermedia N:M
| Atributo | Tipo | Restricción | Descripción |
|---|---|---|---|
| id | INTEGER | PK, AUTO | |
| proceso_id | INTEGER | FK NOT NULL, CASCADE | → procesos.id |
| unspsc_id | INTEGER | FK NOT NULL | → codigos_unspsc.id |

**Índices:** UNIQUE(proceso_id, unspsc_id)

#### `Cotizacion`
| Atributo | Tipo | Restricción | Descripción |
|---|---|---|---|
| id | INTEGER | PK, AUTO | |
| proceso_id | INTEGER | FK NOT NULL, CASCADE | → procesos.id |
| contratista_id | INTEGER | FK NOT NULL | → contratistas.id (proponente) |
| fecha_cotizacion | TEXT | NOT NULL | |
| valor_total | REAL | NOT NULL | Solo el total (sin detalle de artículos) |
| seleccionada | BOOLEAN | NOT NULL, DEFAULT false | Solo una por proceso puede ser true |
| observaciones | TEXT | — | |
| created_at | TEXT | NOT NULL | |

---

### GRUPO 6 — CRONOGRAMA

#### `Cronograma`
| Atributo | Tipo | Restricción | Descripción |
|---|---|---|---|
| id | INTEGER | PK, AUTO | |
| proceso_id | INTEGER | FK NOT NULL, UNIQUE, CASCADE | → procesos.id (1:1) |
| created_at | TEXT | NOT NULL | |

**Nota:** Se crea automáticamente al crear el proceso.

#### `EtapaCronograma`
| Atributo | Tipo | Restricción | Descripción |
|---|---|---|---|
| id | INTEGER | PK, AUTO | |
| cronograma_id | INTEGER | FK NOT NULL, CASCADE | → cronogramas.id |
| tipo_documento_id | INTEGER | FK | → tipos_documento.id (opcional) |
| nombre_etapa | TEXT | NOT NULL | Ej: "Publicación en SECOP" |
| fecha_inicio | TEXT | — | Fecha planeada de inicio |
| fecha_fin | TEXT | — | Fecha planeada de fin |
| hora_inicio | TEXT | — | Hora (si aplica) |
| completada | BOOLEAN | NOT NULL, DEFAULT false | |
| orden | INTEGER | NOT NULL | Para ordenar visualmente |

---

### GRUPO 7 — PLANTILLAS Y VARIABLES

#### `Plantilla`
| Atributo | Tipo | Restricción | Descripción |
|---|---|---|---|
| id | INTEGER | PK, AUTO | |
| tipo_documento_id | INTEGER | FK NOT NULL | → tipos_documento.id |
| nombre | TEXT | NOT NULL | |
| version | TEXT | DEFAULT '1.0' | |
| ruta_archivo | TEXT | NOT NULL | Ruta al .docx en el sistema de archivos |
| activo | BOOLEAN | DEFAULT true | |
| created_at / updated_at | TEXT | NOT NULL | |

#### `Variable`
| Atributo | Tipo | Restricción | Descripción |
|---|---|---|---|
| id | INTEGER | PK, AUTO | |
| nombre_variable | TEXT | NOT NULL, UNIQUE | Ej: `{{objeto_contrato}}` |
| descripcion | TEXT | NOT NULL | Qué representa |
| entidad_origen | TEXT | NOT NULL | Tabla de la BD de donde viene |
| campo_origen | TEXT | NOT NULL | Columna específica |
| tipo_dato | TEXT ENUM | NOT NULL | TEXTO, NUMERO, FECHA, MONEDA, BOOLEANO |
| formato | TEXT | — | Ej: "dd/MM/yyyy", "$ #,##0.00" |
| created_at | TEXT | NOT NULL | |

**Ejemplos de mapeo:**

| nombre_variable | entidad_origen | campo_origen | tipo_dato |
|---|---|---|---|
| `{{nombre_institucion}}` | instituciones | nombre | TEXTO |
| `{{nit_institucion}}` | instituciones | nit | TEXTO |
| `{{nombre_rector}}` | funcionarios | nombre_completo | TEXTO |
| `{{numero_cdp}}` | cdps | numero_cdp | TEXTO |
| `{{objeto_contrato}}` | cdps | objeto | TEXTO |
| `{{valor_total_cdp}}` | cdps | valor_total | MONEDA |
| `{{numero_rp}}` | registros_presupuestales | numero_rp | TEXTO |
| `{{valor_total_rp}}` | registros_presupuestales | valor_total | MONEDA |
| `{{nombre_contratista}}` | contratistas | nombre_razon_social | TEXTO |
| `{{identificacion_contratista}}` | contratistas | numero_identificacion | TEXTO |
| `{{fecha_inicio}}` | procesos | fecha_inicio | FECHA |
| `{{plazo}}` | procesos | plazo | TEXTO |
| `{{codigo_proceso}}` | procesos | codigo | TEXTO |

#### `PlantillaVariable` — Intermedia N:M
| Atributo | Tipo | Restricción | Descripción |
|---|---|---|---|
| id | INTEGER | PK, AUTO | |
| plantilla_id | INTEGER | FK NOT NULL, CASCADE | → plantillas.id |
| variable_id | INTEGER | FK NOT NULL | → variables.id |
| obligatoria | BOOLEAN | NOT NULL, DEFAULT true | Bloquea generación si falta |

**Índices:** UNIQUE(plantilla_id, variable_id)

---

### GRUPO 8 — EXPEDIENTE

#### `Expediente`
| Atributo | Tipo | Restricción | Descripción |
|---|---|---|---|
| id | INTEGER | PK, AUTO | |
| proceso_id | INTEGER | FK NOT NULL, UNIQUE, CASCADE | → procesos.id (1:1) |
| vigencia | INTEGER | NOT NULL | Año fiscal |
| ruta_carpeta | TEXT | NOT NULL | Ej: /expedientes/2026/CTR-01-2026/ |
| completitud | INTEGER | NOT NULL, DEFAULT 0 | Porcentaje 0-100 |
| created_at | TEXT | NOT NULL | |

**Nota:** Se crea automáticamente al crear el proceso.

**Fórmula de completitud:**
```
completitud = COUNT(checklist_verificaciones WHERE completado=true AND expediente_id=X)
              / COUNT(checklist_verificaciones WHERE expediente_id=X) × 100
```

#### `DocumentoGenerado`
| Atributo | Tipo | Restricción | Descripción |
|---|---|---|---|
| id | INTEGER | PK, AUTO | |
| expediente_id | INTEGER | FK NOT NULL, CASCADE | → expedientes.id |
| plantilla_id | INTEGER | FK NOT NULL | → plantillas.id |
| nombre_archivo | TEXT | NOT NULL | |
| ruta | TEXT | NOT NULL | Ruta en el sistema de archivos |
| estado | TEXT ENUM | NOT NULL, DEFAULT 'BORRADOR' | BORRADOR, DEFINITIVO, FIRMADO |
| fecha_generacion | TEXT | NOT NULL | |

#### `DocumentoVariable` — Auditoría
| Atributo | Tipo | Restricción | Descripción |
|---|---|---|---|
| id | INTEGER | PK, AUTO | |
| documento_id | INTEGER | FK NOT NULL, CASCADE | → documentos_generados.id |
| variable_id | INTEGER | FK NOT NULL | → variables.id |
| valor_usado | TEXT | NOT NULL | Valor exacto insertado en el Word |

**Índices:** UNIQUE(documento_id, variable_id)

#### `Anexo`
| Atributo | Tipo | Restricción | Descripción |
|---|---|---|---|
| id | INTEGER | PK, AUTO | |
| expediente_id | INTEGER | FK NOT NULL, CASCADE | → expedientes.id |
| tipo_documento_id | INTEGER | FK | → tipos_documento.id |
| nombre_archivo | TEXT | NOT NULL | |
| ruta | TEXT | NOT NULL | |
| descripcion | TEXT | — | |
| fecha_carga | TEXT | NOT NULL | |

#### `ChecklistItem`
| Atributo | Tipo | Restricción | Descripción |
|---|---|---|---|
| id | INTEGER | PK, AUTO | |
| tipo_documento_id | INTEGER | FK | → tipos_documento.id |
| nombre | TEXT | NOT NULL | Ej: "CDP firmado" |
| descripcion | TEXT | — | |
| obligatorio | BOOLEAN | NOT NULL, DEFAULT true | |
| orden | INTEGER | NOT NULL, DEFAULT 0 | |
| created_at | TEXT | NOT NULL | |

#### `ChecklistVerificacion` — Intermedia N:M
| Atributo | Tipo | Restricción | Descripción |
|---|---|---|---|
| id | INTEGER | PK, AUTO | |
| expediente_id | INTEGER | FK NOT NULL, CASCADE | → expedientes.id |
| checklist_item_id | INTEGER | FK NOT NULL | → checklist_items.id |
| anexo_id | INTEGER | FK, nullable | → anexos.id (el archivo que lo satisface) |
| completado | BOOLEAN | NOT NULL, DEFAULT false | |
| fecha_completado | TEXT | — | |

**Índices:** UNIQUE(expediente_id, checklist_item_id)

---

## 5. Modelo Físico

El schema físico completo está implementado en `db/schema.ts` con Drizzle ORM para SQLite.

### Convenciones del Schema Físico

| Aspecto | Convención |
|---|---|
| Timestamps | `text` en formato ISO (compatibilidad SQLite) |
| Booleanos | `integer({ mode: "boolean" })` de Drizzle |
| Enums | `text({ enum: [...] })` de Drizzle |
| Decimales | `real` de SQLite |
| FKs con cascade | `{ onDelete: "cascade" }` en tablas detalle |
| Índices | Definidos en el tercer argumento de `sqliteTable` |
| Tipos TypeScript | Inferidos con `$inferSelect` / `$inferInsert` |

### Orden de Migraciones (dependencias)

```
1. instituciones
2. funcionarios (→ instituciones)
3. fuentes
4. rubros
5. tipos_proceso
6. codigos_unspsc
7. tipos_documento
8. contratistas
9. cdps (→ instituciones)
10. cdp_rubros (→ cdps, rubros, fuentes)
11. registros_presupuestales (→ cdps, contratistas)
12. rp_rubros (→ registros_presupuestales, cdp_rubros)
13. procesos (→ registros_presupuestales, tipos_proceso)
14. proceso_unspsc (→ procesos, codigos_unspsc)
15. cotizaciones (→ procesos, contratistas)
16. cronogramas (→ procesos)
17. etapas_cronograma (→ cronogramas, tipos_documento)
18. plantillas (→ tipos_documento)
19. variables
20. plantilla_variables (→ plantillas, variables)
21. expedientes (→ procesos)
22. documentos_generados (→ expedientes, plantillas)
23. documento_variables (→ documentos_generados, variables)
24. anexos (→ expedientes, tipos_documento)
25. checklist_items (→ tipos_documento)
26. checklist_verificaciones (→ expedientes, checklist_items, anexos)
```

---

## 6. Reglas de Negocio del Modelo

| Regla | Implementación |
|---|---|
| Solo 1 funcionario activo por rol | Lógica en Server Action `toggleFuncionarioActivo` |
| valor_rp ≤ valor_cdp por línea | Validación en Zod + verificación en Action |
| 1 CDP → 1 RP | UNIQUE en `registros_presupuestales.cdp_id` |
| 1 RP → 1 Proceso | UNIQUE en `procesos.rp_id` |
| 1 Proceso → 1 Cronograma | UNIQUE en `cronogramas.proceso_id` |
| 1 Proceso → 1 Expediente | UNIQUE en `expedientes.proceso_id` |
| Solo 1 cotización seleccionada | Validación en Action al marcar ganadora |
| Catálogos en uso no se eliminan | Verificación de referencias en Action |
| Valor total CDP = SUM(rubros) | Calculado y almacenado al guardar |
| completitud expediente = % checklist | Recalculado al modificar verificaciones |
