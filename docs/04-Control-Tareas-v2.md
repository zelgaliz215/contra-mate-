# Control de Tareas — ContratoMate
## Sistema de Gestión de Contratación Pública

**Versión:** 2.0
**Última actualización:** 18 de marzo de 2026
**Fase actual:** Implementación — Checkpoint 0 pendiente

---

## Leyenda de Estados

| Símbolo | Estado |
|---|---|
| ✅ | Completado |
| 🔄 | En progreso |
| ⬜ | Pendiente |
| ⏸️ | Pausado |
| ❌ | Cancelado |

---

## PLANEACIÓN Y DOCUMENTACIÓN

| Estado | Entregable | Versión | Fecha |
|---|---|---|---|
| ✅ | Análisis del flujo de trabajo actual | 1.0 | 2026-02-26 |
| ✅ | Identificación de 45+ variables para plantillas | 1.0 | 2026-02-26 |
| ✅ | 01 — Documento Visión | 2.0 | 2026-03-18 |
| ✅ | 02 — Casos de Uso (24 CUs en 9 módulos) | 2.0 | 2026-03-18 |
| ✅ | 03 — Plan de Implementación | 2.0 | 2026-03-18 |
| ✅ | 04 — Control de Tareas (este documento) | 2.0 | 2026-03-18 |
| ✅ | 05 — Modelado de Datos (conceptual + lógico + físico) | 2.0 | 2026-03-18 |
| ✅ | 06 — Documento de Vistas y Planificación UI | 1.0 | 2026-03-18 |
| ✅ | `db/schema.ts` — Schema Drizzle definitivo (26 tablas) | 2.0 | 2026-03-18 |
| ✅ | `agent.md` — Contexto del proyecto para Claude Code | 1.0 | 2026-03-18 |
| ✅ | `IMPLEMENTACION_FASE_0_3.md` — Guía de implementación CP 0-3 | 1.0 | 2026-03-18 |

---

## CHECKPOINT 0 — Setup e Infraestructura

| Estado | Tarea | Archivo(s) |
|---|---|---|
| ⬜ | Instalar dependencias (Drizzle, Zod, shadcn, sonner, lucide) | `package.json` |
| ⬜ | Configurar Drizzle | `drizzle.config.ts`, `db/index.ts` |
| ⬜ | Copiar schema a proyecto | `db/schema.ts` |
| ⬜ | Generar y aplicar migraciones | `db/migrations/` |
| ⬜ | Inicializar shadcn e instalar componentes | `components.json`, `components/ui/` |
| ⬜ | Crear `lib/utils.ts` (cn) | `lib/utils.ts` |
| ⬜ | Crear `lib/format.ts` (formatCOP, formatFecha, numeroALetras) | `lib/format.ts` |
| ⬜ | Crear `lib/constants.ts` (ROLES, ESTADOS, TIPOS) | `lib/constants.ts` |
| ⬜ | Crear `types/index.ts` (ActionResult<T> + re-exports) | `types/index.ts` |
| ⬜ | Crear layout raíz con Toaster | `app/layout.tsx` |
| ⬜ | Crear layout dashboard con sidebar + header | `app/(dashboard)/layout.tsx` |
| ⬜ | Crear `Sidebar.tsx` con navegación completa | `components/layout/Sidebar.tsx` |
| ⬜ | Crear `Header.tsx` con breadcrumb | `components/layout/Header.tsx` |
| ⬜ | Crear dashboard con 4 tarjetas de estadísticas | `app/(dashboard)/page.tsx` |
| ⬜ | Verificar TypeScript sin errores | `npx tsc --noEmit` |

**Verificación del checkpoint:**
- [ ] `pnpm dev` sin errores
- [ ] Sidebar visible con todos los ítems
- [ ] `contratomate.db` creado con 26 tablas
- [ ] `pnpm db:studio` muestra las tablas

---

## CHECKPOINT 1 — Institución

| Estado | Tarea | Archivo(s) |
|---|---|---|
| ⬜ | Schema Zod institución | `schemas/institucion.schema.ts` |
| ⬜ | Action `getInstitucion` | `actions/instituciones.ts` |
| ⬜ | Action `upsertInstitucion` | `actions/instituciones.ts` |
| ⬜ | Componente `InstitucionForm` | `components/configuracion/InstitucionForm.tsx` |
| ⬜ | Página configuración | `app/(dashboard)/configuracion/page.tsx` |

**Verificación:**
- [ ] Formulario carga datos existentes
- [ ] Guarda nuevo registro correctamente
- [ ] Errores de validación aparecen inline
- [ ] Toast de éxito visible

---

## CHECKPOINT 2 — Funcionarios

| Estado | Tarea | Archivo(s) |
|---|---|---|
| ⬜ | Schema Zod funcionario | `schemas/funcionario.schema.ts` |
| ⬜ | Action `getFuncionarios` | `actions/funcionarios.ts` |
| ⬜ | Action `createFuncionario` | `actions/funcionarios.ts` |
| ⬜ | Action `updateFuncionario` | `actions/funcionarios.ts` |
| ⬜ | Action `toggleFuncionarioActivo` | `actions/funcionarios.ts` |
| ⬜ | Componente `FuncionariosTable` | `components/configuracion/FuncionariosTable.tsx` |
| ⬜ | Componente `FuncionarioFormDialog` | `components/configuracion/FuncionarioFormDialog.tsx` |
| ⬜ | Página funcionarios | `app/(dashboard)/funcionarios/page.tsx` |
| ⬜ | Seed configuración IEDNDJ | `db/seed.ts` → `seedConfiguracion()` |

**Verificación:**
- [ ] Solo 1 activo por rol a la vez
- [ ] Advertencia visible al cambiar rol con activo existente
- [ ] Seed cargado con datos IEDNDJ

---

## CHECKPOINT 3 — Catálogos

| Estado | Tarea | Archivo(s) |
|---|---|---|
| ⬜ | Schema Zod catálogos (5 schemas) | `schemas/catalogos.schema.ts` |
| ⬜ | Actions catálogos (CRUD × 5) | `actions/catalogos.ts` |
| ⬜ | Componente genérico `CatalogoTable` | `components/catalogos/CatalogoTable.tsx` |
| ⬜ | Dialog `FuenteFormDialog` | `components/catalogos/FuenteFormDialog.tsx` |
| ⬜ | Dialog `RubroFormDialog` | `components/catalogos/RubroFormDialog.tsx` |
| ⬜ | Dialog `TipoProcesoFormDialog` | `components/catalogos/TipoProcesoFormDialog.tsx` |
| ⬜ | Dialog `UnspscFormDialog` | `components/catalogos/UnspscFormDialog.tsx` |
| ⬜ | Dialog `TipoDocumentoFormDialog` | `components/catalogos/TipoDocumentoFormDialog.tsx` |
| ⬜ | Página catálogos con Tabs | `app/(dashboard)/catalogos/page.tsx` |
| ⬜ | Seed catálogos | `db/seed.ts` → `seedCatalogos()` |

**Verificación:**
- [ ] Los 5 catálogos funcionan desde sus tabs
- [ ] Eliminación bloqueada si está en uso
- [ ] Solo activos aparecen en selectores de otros módulos

---

## CHECKPOINT 4 — Contratistas

| Estado | Tarea | Archivo(s) |
|---|---|---|
| ⬜ | Schema Zod contratista (discriminatedUnion) | `schemas/contratista.schema.ts` |
| ⬜ | Actions contratistas (CRUD + search) | `actions/contratistas.ts` |
| ⬜ | Componente `ContratistasTable` con buscador | `components/contratistas/ContratistasTable.tsx` |
| ⬜ | Componente `ContratistaSheet` (formulario adaptativo) | `components/contratistas/ContratistaSheet.tsx` |
| ⬜ | Página contratistas | `app/(dashboard)/contratistas/page.tsx` |

**Verificación:**
- [ ] Formulario cambia según tipo de persona (Natural/Jurídica)
- [ ] No se puede duplicar número de identificación
- [ ] Buscador filtra en tiempo real

---

## CHECKPOINT 5 — CDP

| Estado | Tarea | Archivo(s) |
|---|---|---|
| ⬜ | Schema Zod CDP | `schemas/cdp.schema.ts` |
| ⬜ | Actions CDP (CRUD atómico) | `actions/cdps.ts` |
| ⬜ | Componente `CdpForm` | `components/cdps/CdpForm.tsx` |
| ⬜ | Componente `CdpRubrosEditor` (líneas dinámicas) | `components/cdps/CdpRubrosEditor.tsx` |
| ⬜ | Página listado CDPs | `app/(dashboard)/cdps/page.tsx` |
| ⬜ | Página detalle CDP | `app/(dashboard)/cdps/[id]/page.tsx` |

**Verificación:**
- [ ] CDP con múltiples rubros se guarda en transacción
- [ ] Total calculado automáticamente al agregar/quitar líneas
- [ ] Número CDP único por vigencia

---

## CHECKPOINT 6 — Registro Presupuestal

| Estado | Tarea | Archivo(s) |
|---|---|---|
| ⬜ | Schema Zod RP | `schemas/registro-presupuestal.schema.ts` |
| ⬜ | Actions RP | `actions/registros-presupuestales.ts` |
| ⬜ | Componente `RpForm` con líneas del CDP | `components/cdps/RpForm.tsx` |
| ⬜ | Botón "Crear RP" en vista de CDP | `app/(dashboard)/cdps/[id]/page.tsx` |

**Verificación:**
- [ ] RP creado solo desde CDP sin RP previo
- [ ] valor_rp ≤ valor_cdp validado por línea
- [ ] Trazabilidad: líneas del RP referencian líneas del CDP

---

## CHECKPOINT 7 — Proceso Contractual

| Estado | Tarea | Archivo(s) |
|---|---|---|
| ⬜ | Schema Zod proceso | `schemas/proceso.schema.ts` |
| ⬜ | Actions proceso | `actions/procesos.ts` |
| ⬜ | Actions cotizaciones | `actions/cotizaciones.ts` |
| ⬜ | Componente `ProcesoForm` | `components/procesos/ProcesoForm.tsx` |
| ⬜ | Componente `CotizacionesPanel` | `components/procesos/CotizacionesPanel.tsx` |
| ⬜ | Componente `ProcesoHeader` con estado y acciones | `components/procesos/ProcesoHeader.tsx` |
| ⬜ | Página listado procesos | `app/(dashboard)/procesos/page.tsx` |
| ⬜ | Página detalle proceso (con tabs) | `app/(dashboard)/procesos/[id]/page.tsx` |
| ⬜ | Creación automática de cronograma y expediente al crear proceso | `actions/procesos.ts` |

**Verificación:**
- [ ] Proceso hereda objeto y contratista del RP (sin duplicar)
- [ ] Código generado automáticamente (CTR-NN-AAAA)
- [ ] Cronograma y expediente creados automáticamente

---

## CHECKPOINT 8 — Cronograma

| Estado | Tarea | Archivo(s) |
|---|---|---|
| ⬜ | Actions cronograma | `actions/cronogramas.ts` |
| ⬜ | Componente `CronogramaTable` con inline editing | `components/cronograma/CronogramaTable.tsx` |
| ⬜ | Componente `EtapaRow` editable | `components/cronograma/EtapaRow.tsx` |
| ⬜ | Página cronograma del proceso | `app/(dashboard)/procesos/[id]/cronograma/page.tsx` |

**Verificación:**
- [ ] Etapas ordenables y editables
- [ ] Fechas de planeación diferenciadas visualmente de fechas reales

---

## CHECKPOINT 9 — Plantillas y Variables

| Estado | Tarea | Archivo(s) |
|---|---|---|
| ⬜ | Actions plantillas | `actions/plantillas.ts` |
| ⬜ | Seed de variables del sistema | `db/seed.ts` → `seedVariables()` |
| ⬜ | Seed de checklist_items | `db/seed.ts` → `seedChecklist()` |
| ⬜ | Componente `PlantillasGrid` | `components/plantillas/PlantillasGrid.tsx` |
| ⬜ | Componente `VariablesMapper` | `components/plantillas/VariablesMapper.tsx` |
| ⬜ | Página plantillas | `app/(dashboard)/plantillas/page.tsx` |

**Verificación:**
- [ ] Plantilla registrada con tipo de documento
- [ ] Variables mapeadas correctamente
- [ ] Seed de variables y checklist cargados

---

## CHECKPOINT 10 — Expediente y Generación de Documentos

| Estado | Tarea | Archivo(s) |
|---|---|---|
| ⬜ | Route Handler generación Word | `app/api/documentos/generar/route.ts` |
| ⬜ | Route Handler descarga archivos | `app/api/archivos/[expedienteId]/route.ts` |
| ⬜ | Actions expediente | `actions/expedientes.ts` |
| ⬜ | Actions anexos | `actions/anexos.ts` |
| ⬜ | Actions checklist | `actions/checklist.ts` |
| ⬜ | Componente `ExpedientePanel` (tabs) | `components/expediente/ExpedientePanel.tsx` |
| ⬜ | Componente `DocumentosGenerados` | `components/expediente/DocumentosGenerados.tsx` |
| ⬜ | Componente `AnexosUploader` | `components/expediente/AnexosUploader.tsx` |
| ⬜ | Componente `ChecklistPanel` con barra de progreso | `components/expediente/ChecklistPanel.tsx` |
| ⬜ | Página expediente | `app/(dashboard)/procesos/[id]/expediente/page.tsx` |

**Verificación:**
- [ ] Documento Word generado correctamente con variables reales
- [ ] Anexo subido y guardado en carpeta del expediente
- [ ] Checklist actualizado al subir anexos
- [ ] Barra de progreso refleja el % de completitud

---

## RESUMEN EJECUTIVO DE ESTADO

| Checkpoint | Módulo | Estado | Progreso |
|---|---|---|---|
| CP 0 | Setup e infraestructura | ⬜ Pendiente | 0/15 tareas |
| CP 1 | Institución | ⬜ Pendiente | 0/5 tareas |
| CP 2 | Funcionarios | ⬜ Pendiente | 0/9 tareas |
| CP 3 | Catálogos | ⬜ Pendiente | 0/10 tareas |
| CP 4 | Contratistas | ⬜ Pendiente | 0/5 tareas |
| CP 5 | CDP | ⬜ Pendiente | 0/6 tareas |
| CP 6 | Registro Presupuestal | ⬜ Pendiente | 0/4 tareas |
| CP 7 | Proceso Contractual | ⬜ Pendiente | 0/9 tareas |
| CP 8 | Cronograma | ⬜ Pendiente | 0/4 tareas |
| CP 9 | Plantillas y Variables | ⬜ Pendiente | 0/6 tareas |
| CP 10 | Expediente + Documentos | ⬜ Pendiente | 0/10 tareas |
| **TOTAL** | | | **0/83 tareas** |
