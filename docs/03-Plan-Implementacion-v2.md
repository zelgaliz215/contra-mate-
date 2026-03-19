# Plan de Implementación — ContratoMate
## Sistema de Gestión de Contratación Pública para Instituciones Educativas

**Versión:** 2.0
**Fecha:** 18 de marzo de 2026
**Autor:** Daniel Eduardo Trejos Montiel

---

## Historial de Revisiones

| Fecha | Versión | Descripción |
|---|---|---|
| 2026-02-26 | 1.0 | Versión inicial |
| 2026-03-18 | 2.0 | Replanteamiento completo. Stack confirmado, modelo de datos definitivo (26 tablas), fases reorganizadas por checkpoints graduales, orden de implementación alineado con dependencias reales entre módulos |

---

## 1. Resumen Ejecutivo

ContratoMate es una aplicación web local (Next.js 16) con base de datos SQLite,
sin autenticación, para uso exclusivo del auxiliar administrativo de la IEDNDJ.

La implementación se organiza en **10 checkpoints graduales** que siguen el
orden natural de dependencias entre módulos: primero la configuración base,
luego los catálogos, luego el presupuesto, y finalmente los módulos que
dependen de todo lo anterior (procesos, documentos, expediente).

**Duración estimada total:** 8-10 semanas de desarrollo asistido por IA.

---

## 2. Stack Tecnológico Confirmado

| Capa | Tecnología | Versión |
|---|---|---|
| Framework | Next.js App Router | 16 |
| Lenguaje | TypeScript | latest |
| ORM | Drizzle ORM + better-sqlite3 | latest |
| Base de datos | SQLite | — |
| Validación | Zod + React Hook Form | latest |
| UI | shadcn/ui + Tailwind CSS | latest |
| Notificaciones | sonner | latest |
| Iconos | lucide-react | latest |
| Gestor de paquetes | pnpm | latest |

---

## 3. Modelo de Datos — Resumen

El schema completo está en `db/schema.ts` con **26 tablas** organizadas en 8 grupos:

| Grupo | Tablas | Dependencias previas |
|---|---|---|
| 1. Configuración | `instituciones`, `funcionarios` | Ninguna |
| 2. Catálogos | `fuentes`, `rubros`, `tipos_proceso`, `codigos_unspsc`, `tipos_documento` | Ninguna |
| 3. Contratistas | `contratistas` | Ninguna |
| 4. Presupuesto | `cdps`, `cdp_rubros`, `registros_presupuestales`, `rp_rubros` | Configuración + Catálogos + Contratistas |
| 5. Proceso | `procesos`, `proceso_unspsc`, `cotizaciones` | Presupuesto |
| 6. Cronograma | `cronogramas`, `etapas_cronograma` | Proceso |
| 7. Plantillas | `plantillas`, `variables`, `plantilla_variables` | Catálogos (tipos_documento) |
| 8. Expediente | `expedientes`, `documentos_generados`, `documento_variables`, `anexos`, `checklist_items`, `checklist_verificaciones` | Proceso + Plantillas |

---

## 4. Fases de Implementación

### FASE 0 — Setup e Infraestructura Base
**Duración estimada:** 1 día
**Objetivo:** Proyecto con DB, shadcn y layout funcional.

| Tarea | Descripción | Entregable |
|---|---|---|
| 0.1 | Instalar dependencias (Drizzle, Zod, shadcn, sonner) | `package.json` actualizado |
| 0.2 | Configurar Drizzle (`drizzle.config.ts`, `db/index.ts`) | Singleton de conexión |
| 0.3 | Aplicar migraciones | `contratomate.db` creado con 26 tablas |
| 0.4 | Inicializar shadcn e instalar todos los componentes | `components/ui/` completo |
| 0.5 | Crear utilidades base (`lib/utils.ts`, `lib/format.ts`, `lib/constants.ts`) | Helpers tipados |
| 0.6 | Crear `types/index.ts` con `ActionResult<T>` | Tipo de retorno estándar |
| 0.7 | Layout principal: sidebar + header + área de contenido | App navegable |
| 0.8 | Dashboard básico con tarjetas de estadísticas | Página de inicio |

**Checkpoint 0:** `pnpm dev` corre, sidebar visible, 26 tablas en la DB, `pnpm db:studio` funciona.

---

### FASE 1 — Módulo Configuración: Institución
**Duración estimada:** 0.5 días
**Objetivo:** Configurar los datos del colegio (registro único, upsert).
**Dependencias:** Fase 0

| Tarea | Descripción |
|---|---|
| 1.1 | Schema Zod `schemas/institucion.schema.ts` |
| 1.2 | Server Actions `actions/instituciones.ts` (getInstitucion, upsertInstitucion) |
| 1.3 | Componente `InstitucionForm.tsx` (react-hook-form + validación inline) |
| 1.4 | Página `app/(dashboard)/configuracion/page.tsx` |

**Checkpoint 1:** Puedo guardar y editar los datos de la IEDNDJ. Los errores aparecen inline.

---

### FASE 2 — Módulo Configuración: Funcionarios
**Duración estimada:** 1 día
**Objetivo:** CRUD de funcionarios con lógica de rol único activo.
**Dependencias:** Fase 1

| Tarea | Descripción |
|---|---|
| 2.1 | Schema Zod `schemas/funcionario.schema.ts` |
| 2.2 | Server Actions `actions/funcionarios.ts` (CRUD + toggleActivo) |
| 2.3 | Componente `FuncionariosTable.tsx` con badges por rol |
| 2.4 | Componente `FuncionarioFormDialog.tsx` con advertencia de rol activo |
| 2.5 | Página `app/(dashboard)/funcionarios/page.tsx` |
| 2.6 | Seed inicial IEDNDJ (`db/seed.ts` — función `seedConfiguracion`) |

**Checkpoint 2:** Lógica de rol único activo funciona. Seed cargado.

---

### FASE 3 — Módulo Catálogos
**Duración estimada:** 1 día
**Objetivo:** CRUD de los 5 catálogos en vista con pestañas.
**Dependencias:** Fase 0

| Tarea | Descripción |
|---|---|
| 3.1 | Schema Zod `schemas/catalogos.schema.ts` (5 schemas) |
| 3.2 | Server Actions `actions/catalogos.ts` (CRUD + delete con validación de uso) |
| 3.3 | Componente genérico `CatalogoTable.tsx` (reutilizable para los 5) |
| 3.4 | 5 formularios Dialog: FuenteForm, RubroForm, TipoProcesoForm, UnspscForm, TipoDocumentoForm |
| 3.5 | Página `app/(dashboard)/catalogos/page.tsx` con Tabs |
| 3.6 | Seed de catálogos (`seedCatalogos`) |

**Checkpoint 3:** Los 5 catálogos funcionan. Validación de eliminación en uso.

---

### FASE 4 — Módulo Contratistas
**Duración estimada:** 1.5 días
**Objetivo:** CRUD de contratistas con discriminador Natural/Jurídica.
**Dependencias:** Fase 0

| Tarea | Descripción |
|---|---|
| 4.1 | Schema Zod `schemas/contratista.schema.ts` (discriminatedUnion) |
| 4.2 | Server Actions `actions/contratistas.ts` (CRUD + search) |
| 4.3 | Componente `ContratistasTable.tsx` con buscador en tiempo real |
| 4.4 | Componente `ContratistaSheet.tsx` (formulario adaptativo en panel lateral) |
| 4.5 | Página `app/(dashboard)/contratistas/page.tsx` |

**Checkpoint 4:** Puedo crear contratista natural y jurídico. Formulario se adapta al tipo.

---

### FASE 5 — Módulo Presupuesto: CDP
**Duración estimada:** 1.5 días
**Objetivo:** CRUD de CDPs con líneas de rubro/fuente dinámicas.
**Dependencias:** Fases 1, 3

| Tarea | Descripción |
|---|---|
| 5.1 | Schema Zod `schemas/cdp.schema.ts` (incluyendo array de rubros) |
| 5.2 | Server Actions `actions/cdps.ts` (CRUD atómico CDP + cdp_rubros) |
| 5.3 | Componente `CdpForm.tsx` con editor de líneas dinámico |
| 5.4 | Componente `CdpRubrosEditor.tsx` (agregar/quitar líneas, cálculo total en tiempo real) |
| 5.5 | Página listado `app/(dashboard)/cdps/page.tsx` |
| 5.6 | Página detalle `app/(dashboard)/cdps/[id]/page.tsx` |

**Checkpoint 5:** CDP con múltiples rubros se guarda atómicamente. Total calculado automáticamente.

---

### FASE 6 — Módulo Presupuesto: Registro Presupuestal
**Duración estimada:** 1 día
**Objetivo:** RP atado al CDP con trazabilidad de valores comprometidos.
**Dependencias:** Fases 4, 5

| Tarea | Descripción |
|---|---|
| 6.1 | Schema Zod `schemas/registro-presupuestal.schema.ts` |
| 6.2 | Server Actions `actions/registros-presupuestales.ts` |
| 6.3 | Componente `RpForm.tsx` con líneas del CDP como referencia |
| 6.4 | Validación: valor_rp ≤ valor_cdp por línea (en Zod y en la Action) |
| 6.5 | Vista detalle del CDP actualizada con botón "Crear RP" |

**Checkpoint 6:** RP creado desde CDP. Validación valor_rp ≤ valor_cdp funciona.

---

### FASE 7 — Módulo Proceso Contractual
**Duración estimada:** 2 días
**Objetivo:** Proceso completo con cotizaciones, UNSPSC y ciclo de vida.
**Dependencias:** Fases 3, 4, 6

| Tarea | Descripción |
|---|---|
| 7.1 | Schema Zod `schemas/proceso.schema.ts` |
| 7.2 | Server Actions `actions/procesos.ts` + `actions/cotizaciones.ts` |
| 7.3 | Componente `ProcesoForm.tsx` (desde RP, hereda objeto/contratista) |
| 7.4 | Componente `CotizacionesPanel.tsx` con marcado de ganadora |
| 7.5 | Componente `ProcesoEstadoBadge.tsx` + transiciones de estado |
| 7.6 | Página listado `app/(dashboard)/procesos/page.tsx` |
| 7.7 | Página detalle `app/(dashboard)/procesos/[id]/page.tsx` (con tabs) |
| 7.8 | Al crear proceso: crear cronograma y expediente automáticamente |

**Checkpoint 7:** Proceso creado desde RP. Cotizaciones registradas. Estado cambia.

---

### FASE 8 — Módulo Cronograma
**Duración estimada:** 1 día
**Objetivo:** Tabla editable de etapas con fechas de planeación.
**Dependencias:** Fase 7

| Tarea | Descripción |
|---|---|
| 8.1 | Server Actions `actions/cronogramas.ts` |
| 8.2 | Componente `CronogramaTable.tsx` con filas editables inline |
| 8.3 | Diferenciación visual: fechas planeadas vs fechas reales del proceso |
| 8.4 | Página `app/(dashboard)/procesos/[id]/cronograma/page.tsx` |

**Checkpoint 8:** Cronograma con etapas. Fechas editables. Marcado de completadas.

---

### FASE 9 — Módulo Plantillas y Variables
**Duración estimada:** 1.5 días
**Objetivo:** Administración de plantillas Word y mapeo de variables.
**Dependencias:** Fase 3

| Tarea | Descripción |
|---|---|
| 9.1 | Server Actions `actions/plantillas.ts` |
| 9.2 | Seed de variables del sistema (`seedVariables`) |
| 9.3 | Componente `PlantillasGrid.tsx` agrupado por tipo de documento |
| 9.4 | Componente `VariablesMapper.tsx` para configurar variables de cada plantilla |
| 9.5 | Página `app/(dashboard)/plantillas/page.tsx` |

**Checkpoint 9:** Plantillas registradas con sus variables. Seed de variables cargado.

---

### FASE 10 — Módulo Expediente y Generación de Documentos
**Duración estimada:** 3 días
**Objetivo:** Expediente con documentos generados, anexos, checklist y generación Word.
**Dependencias:** Fases 7, 9

| Tarea | Descripción |
|---|---|
| 10.1 | Route Handler `app/api/documentos/generar/route.ts` (genera .docx) |
| 10.2 | Route Handler `app/api/archivos/[expedienteId]/route.ts` (descarga) |
| 10.3 | Server Actions `actions/expedientes.ts`, `actions/anexos.ts`, `actions/checklist.ts` |
| 10.4 | Componente `ExpedientePanel.tsx` con tabs: Documentos / Anexos / Checklist |
| 10.5 | Componente `ChecklistPanel.tsx` con barra de progreso |
| 10.6 | Componente `DocumentosGenerados.tsx` con botón de generación |
| 10.7 | Componente `AnexosUploader.tsx` para subida de archivos |
| 10.8 | Lógica de generación Word (reemplazo de `{{variables}}` en .docx) |
| 10.9 | Página `app/(dashboard)/procesos/[id]/expediente/page.tsx` |

**Checkpoint 10:** Documento Word generado desde plantilla. Anexo subido. Checklist actualizado.

---

## 5. Orden de Dependencias (Diagrama)

```
Fase 0 (Setup)
    │
    ├── Fase 1 (Institución) ──── Fase 2 (Funcionarios)
    │
    ├── Fase 3 (Catálogos) ───────────────────────────────────┐
    │                                                         │
    └── Fase 4 (Contratistas)                                 │
                │                                             │
                ├── Fase 5 (CDP) ←── Fase 3                  │
                │       │                                     │
                └── Fase 6 (RP) ←── Fase 5 + Fase 4          │
                        │                                     │
                    Fase 7 (Proceso) ←── Fase 3               │
                        │                                     │
                    Fase 8 (Cronograma)                       │
                        │                                     │
                    Fase 9 (Plantillas) ←── Fase 3 ───────────┘
                        │
                    Fase 10 (Expediente + Generación Word)
```

---

## 6. Convenciones de Desarrollo

### Orden de implementación dentro de cada fase

```
1. Schema Zod    → validación del formulario
2. Server Action → lógica de negocio + BD
3. Componentes   → UI client-side
4. Página        → Server Component que los integra
5. Seed          → datos iniciales si aplica
```

### Tipo de retorno estándar
```typescript
type ActionResult<T = void> =
  | { success: true; data: T; message: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }
```

### Feedback al usuario
- Éxito → `toast.success()` de sonner
- Error servidor → `toast.error()` de sonner
- Error validación → inline bajo el campo (`FormMessage` shadcn)
- Confirmación destructiva → `AlertDialog` antes de ejecutar

---

## 7. Riesgos de Implementación

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Generación Word compleja | Alto | Usar librería `docx` o `pizzip + docxtemplater` para reemplazo de variables |
| Transacciones atómicas CDP+rubros, RP+rubros | Medio | Usar transacciones SQLite de better-sqlite3 |
| Validación valor_rp ≤ valor_cdp | Medio | Validar en Zod + en Server Action antes de insertar |
| Subida de archivos en Next.js | Medio | Usar `formData` en Route Handler, guardar en carpeta local |
| Reordenamiento de etapas del cronograma | Bajo | Campo `orden` numérico, actualizar en lote |
