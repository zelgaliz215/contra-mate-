# Planificación de Vistas — ContratoMate
## Diseño Conceptual de Interfaces y Flujo de Implementación

**Versión:** 1.0
**Fecha:** 18 de marzo de 2026
**Autor:** Daniel Eduardo Trejos Montiel / Claude

---

## 1. Introducción

Este documento define de forma conceptual:
1. **Qué vistas** existen por módulo y qué hace cada una
2. **Qué componentes shadcn** requiere cada vista
3. **En qué orden** se implementan los archivos dentro de cada vista (flujo de programación)
4. **Dependencias entre vistas** para saber qué debe existir antes

No incluye wireframes visuales detallados — esos se generarán en una fase posterior con Figma/Excalidraw.

---

## 2. Layout Global

### Estructura de la aplicación

```
┌────────────────────────────────────────────────────────────┐
│  HEADER                                                    │
│  ContratoMate | Sección actual > Sub-sección               │
├──────────┬─────────────────────────────────────────────────┤
│          │                                                  │
│ SIDEBAR  │  ÁREA DE CONTENIDO                              │
│ 240px    │  (scroll vertical)                              │
│          │                                                  │
│ Navega-  │  <PageHeader titulo="" descripcion="" />        │
│ ción     │  <Componentes del módulo />                     │
│ por      │                                                  │
│ módulo   │                                                  │
│          │                                                  │
└──────────┴─────────────────────────────────────────────────┘
```

### Componentes shadcn del layout global

| Componente | Uso |
|---|---|
| `Separator` | Divisor entre secciones del sidebar |
| `Badge` | Estado activo en navegación |
| `Tooltip` | Labels cuando el sidebar está colapsado |
| `Toaster` (sonner) | Notificaciones globales |

---

## 3. Vistas por Módulo

---

### M1 — Configuración: Institución

**Ruta:** `/configuracion`
**Tipo de página:** Server Component + Client Form
**Propósito:** Configurar los datos del colegio (registro único, upsert)

#### Estructura de la vista

```
┌─────────────────────────────────────────────┐
│ PageHeader                                  │
│ "Configuración de la Institución"           │
│ Actualiza los datos usados en documentos    │
├─────────────────────────────────────────────┤
│ Card                                        │
│  ┌──────────────────────────────────────┐  │
│  │ Form                                 │  │
│  │  nombre_completo    [Input]          │  │
│  │  siglas    [Input]  nit    [Input]   │  │
│  │  municipio [Input]  dpto   [Input]   │  │
│  │  telefono  [Input]  email  [Input]   │  │
│  │                                      │  │
│  │  [Button "Guardar configuración"]    │  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

#### Componentes shadcn requeridos
`Card`, `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`, `Input`, `Button`

#### Flujo de implementación
```
1. schemas/institucion.schema.ts       → Zod schema
2. actions/instituciones.ts            → getInstitucion(), upsertInstitucion()
3. types/index.ts                      → ActionResult<T>
4. components/configuracion/
   InstitucionForm.tsx                 → Client Component con RHF
5. app/(dashboard)/configuracion/
   page.tsx                            → Server Component, carga datos
```

---

### M1 — Configuración: Funcionarios

**Ruta:** `/funcionarios`
**Tipo de página:** Server Component + Client Table + Dialog
**Propósito:** CRUD de personas que firman documentos, con lógica de rol único activo

#### Estructura de la vista

```
┌─────────────────────────────────────────────────────┐
│ PageHeader                                          │
│ "Funcionarios"          [+ Agregar funcionario]    │
├─────────────────────────────────────────────────────┤
│ Table                                               │
│ ┌──────┬──────────────┬───────┬────────┬─────────┐ │
│ │ Rol  │ Nombre       │ Tipo  │ Estado │Acciones │ │
│ ├──────┼──────────────┼───────┼────────┼─────────┤ │
│ │[ROL] │ Nombre comp. │ CC    │[ACTIVO]│ ✏️  🔄  │ │
│ └──────┴──────────────┴───────┴────────┴─────────┘ │
│                                                     │
│ [Dialog] Formulario crear/editar funcionario        │
│   ┌─ rol [Select] ─────────────────────────────┐   │
│   │ ⚠️ Ya existe un RECTOR activo: "Nombre"    │   │
│   ├────────────────────────────────────────────┤   │
│   │ nombre [Input]  tipo_id [Select]           │   │
│   │ numero_id [Input]  cargo [Input]           │   │
│   │ [Cancelar]  [Guardar]                      │   │
│   └────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

#### Componentes shadcn requeridos
`Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell`, `Badge`, `Dialog`, `DialogContent`, `DialogHeader`, `Select`, `SelectContent`, `SelectItem`, `Input`, `Button`, `Alert`, `AlertDialog`

#### Flujo de implementación
```
1. schemas/funcionario.schema.ts
2. actions/funcionarios.ts             → CRUD + toggleActivo
3. components/configuracion/
   FuncionarioFormDialog.tsx           → Client, con advertencia de rol
   FuncionariosTable.tsx               → Client, con estado modal
4. app/(dashboard)/funcionarios/
   page.tsx                            → Server Component
5. db/seed.ts                          → seedConfiguracion()
```

---

### M2 — Catálogos

**Ruta:** `/catalogos`
**Tipo de página:** Server Component + Client Tabs + Dialogs
**Propósito:** Gestión de los 5 catálogos en pestañas

#### Estructura de la vista

```
┌─────────────────────────────────────────────────────┐
│ PageHeader "Catálogos"                              │
├─────────────────────────────────────────────────────┤
│ Tabs                                                │
│ [Fuentes][Rubros][Tipos Proceso][UNSPSC][Tipos Doc] │
├─────────────────────────────────────────────────────┤
│ TabContent (misma estructura para los 5)            │
│                                                     │
│  [+ Agregar Fuente]                                 │
│  ┌───────────────────────────────────────────────┐  │
│  │ Table                                         │  │
│  │  Código │ Nombre     │ Estado  │ Acciones     │  │
│  │  SGP-G  │ SGP Gratu. │[ACTIVO] │ ✏️  👁️  🗑️  │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│ [Dialog] Formulario específico del catálogo        │
└─────────────────────────────────────────────────────┘
```

#### Componentes shadcn requeridos
`Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`, `Table`, `Badge`, `Dialog`, `AlertDialog`, `Input`, `Select`, `Textarea`, `Button`, `Switch`

#### Flujo de implementación
```
1. schemas/catalogos.schema.ts         → 5 schemas Zod
2. actions/catalogos.ts                → CRUD × 5 + validación de uso
3. components/catalogos/
   CatalogoTable.tsx                   → Componente genérico reutilizable
   FuenteFormDialog.tsx
   RubroFormDialog.tsx
   TipoProcesoFormDialog.tsx
   UnspscFormDialog.tsx
   TipoDocumentoFormDialog.tsx
4. app/(dashboard)/catalogos/page.tsx  → Server Component con Tabs
5. db/seed.ts                          → seedCatalogos()
```

---

### M3 — Contratistas

**Ruta:** `/contratistas`
**Tipo de página:** Server Component + Client Table + Sheet
**Propósito:** CRUD de proveedores con formulario adaptativo

#### Estructura de la vista

```
┌─────────────────────────────────────────────────────┐
│ PageHeader "Contratistas"    [+ Nuevo contratista]  │
├─────────────────────────────────────────────────────┤
│ [Input buscador "Buscar por nombre o documento..."] │
├─────────────────────────────────────────────────────┤
│ Table                                               │
│ Tipo │ Nombre / Razón Social │ ID  │ Estado │ Acc  │
│[NAT] │ García López Manuel  │ CC  │[ACTIVO]│✏️ 🚫 │
│[JUR] │ Construcciones S.A.  │ NIT │[ACTIVO]│✏️ 🚫 │
└─────────────────────────────────────────────────────┘

[Sheet lateral — formulario adaptativo]
┌──────────────────────────────────────────────┐
│ Nuevo Contratista                   [×]      │
├──────────────────────────────────────────────┤
│ ── Identificación ──                         │
│ [○ Natural] [○ Jurídica]                    │
│ Tipo ID [Select]  Número ID [Input]  DV[_]  │
├──────────────────────────────────────────────┤
│ ── Datos personales (condicional) ──         │
│ Si NATURAL: Apellido1 Apellido2 Nombre1...   │
│ Si JURÍDICA: Razón social + Representante   │
├──────────────────────────────────────────────┤
│ ── Contacto ──                              │
│ Dirección / Municipio / Email / Teléfono    │
├──────────────────────────────────────────────┤
│ ── Bancario ──                              │
│ Banco / Tipo cuenta / Número cuenta         │
├──────────────────────────────────────────────┤
│ ── Tributario ──                            │
│ Declarante / Régimen IVA                    │
├──────────────────────────────────────────────┤
│ [Cancelar]                     [Guardar]    │
└──────────────────────────────────────────────┘
```

#### Componentes shadcn requeridos
`Sheet`, `SheetContent`, `SheetHeader`, `Table`, `Badge`, `RadioGroup`, `RadioGroupItem`, `Select`, `Input`, `Button`, `Separator`, `Label`

#### Flujo de implementación
```
1. schemas/contratista.schema.ts       → discriminatedUnion Zod
2. actions/contratistas.ts             → CRUD + searchContratistas()
3. hooks/useDebounce.ts                → para el buscador
4. components/contratistas/
   ContratistasTable.tsx               → Client, con buscador
   ContratistaSheet.tsx                → Client, formulario adaptativo
5. app/(dashboard)/contratistas/
   page.tsx                            → Server Component
```

---

### M4 — CDP

**Ruta:** `/cdps` y `/cdps/[id]`
**Tipo:** Server Component + Client Form con líneas dinámicas

#### Vista Listado `/cdps`

```
┌─────────────────────────────────────────────────────┐
│ PageHeader "CDPs"                   [+ Nuevo CDP]   │
├─────────────────────────────────────────────────────┤
│ Filtros: [Vigencia ▼] [Estado ▼]                   │
├─────────────────────────────────────────────────────┤
│ Table                                               │
│ N°CDP │ Vigencia │ Fecha │ Objeto (truncado) │Valor │
│ 0003  │  2026    │16/02  │ Servicio mant...  │$7.2M │
└─────────────────────────────────────────────────────┘
```

#### Vista Detalle / Formulario CDP

```
┌──────────────────────────────────────────────────────┐
│ N° CDP [Input]  Vigencia [Input]  Fecha [Input]      │
│ Objeto [Textarea — campo largo]                      │
├──────────────────────────────────────────────────────┤
│ ── Líneas de Rubro ──                   [+ Línea]   │
│ ┌──────────────┬──────────────┬──────────┬────────┐  │
│ │ Rubro        │ Fuente       │ Valor    │        │  │
│ │ [Select ▼]   │ [Select ▼]  │[$Input]  │ [🗑️]   │  │
│ │ [Select ▼]   │ [Select ▼]  │[$Input]  │ [🗑️]   │  │
│ └──────────────┴──────────────┴──────────┴────────┘  │
│                            TOTAL: $ 7.261.667,00     │
├──────────────────────────────────────────────────────┤
│ [Cancelar]                           [Guardar CDP]  │
└──────────────────────────────────────────────────────┘
```

#### Vista Detalle del CDP (lectura)

```
┌──────────────────────────────────────────────────────┐
│ CDP N° 0003 — Vigencia 2026                          │
│ Fecha: 16/02/2026     Valor: $ 7.261.667,00         │
│ Objeto: Servicio de mantenimiento...                 │
├──────────────────────────────────────────────────────┤
│ Rubro               │ Fuente         │ Valor         │
│ 2.1.02.02.008.06    │ Recursos Prop. │ $ 7.261.667  │
├──────────────────────────────────────────────────────┤
│ Estado RP: Sin RP asignado                           │
│ [Crear Registro Presupuestal →]                      │
└──────────────────────────────────────────────────────┘
```

#### Componentes shadcn requeridos
`Table`, `Card`, `Input`, `Textarea`, `Select`, `Button`, `Separator`, `Badge`

#### Flujo de implementación
```
1. schemas/cdp.schema.ts               → incluye array de rubros
2. actions/cdps.ts                     → CRUD atómico (CDP + rubros en transacción)
3. components/cdps/
   CdpRubrosEditor.tsx                 → Client, líneas dinámicas
   CdpForm.tsx                         → Client, integra el editor
   CdpCard.tsx                         → Componente de detalle (lectura)
4. app/(dashboard)/cdps/
   page.tsx                            → Server, listado
   [id]/page.tsx                       → Server, detalle con botón crear RP
```

---

### M4 — Registro Presupuestal (RP)

**Ruta:** En la vista del CDP (`/cdps/[id]`)
**Tipo:** Client Form en la misma página del CDP

#### Vista Formulario RP (desde CDP)

```
┌──────────────────────────────────────────────────────┐
│ Crear Registro Presupuestal                          │
│ Para: CDP N° 0003                                    │
├──────────────────────────────────────────────────────┤
│ N° RP [Input]  Fecha expedición [Input]             │
│ Contratista [Input buscador → searchContratistas]   │
├──────────────────────────────────────────────────────┤
│ ── Valores comprometidos ──                         │
│ (Referencia CDP: $7.261.667)                        │
│ ┌────────────────────┬──────────────┬────────────┐  │
│ │ Rubro (del CDP)    │ Valor CDP    │ Valor RP   │  │
│ │ 2.1.02.02.008.06   │ $7.261.667  │ [$Input]   │  │
│ └────────────────────┴──────────────┴────────────┘  │
│                       TOTAL RP: $ __________        │
│ ⚠️ valor_rp debe ser ≤ valor_cdp por línea          │
├──────────────────────────────────────────────────────┤
│ [Cancelar]                              [Crear RP]  │
└──────────────────────────────────────────────────────┘
```

#### Flujo de implementación
```
1. schemas/registro-presupuestal.schema.ts
2. actions/registros-presupuestales.ts
3. components/cdps/
   RpForm.tsx                          → Client, formulario RP desde CDP
4. app/(dashboard)/cdps/[id]/page.tsx  → Añadir sección RP
```

---

### M5 — Procesos

**Rutas:** `/procesos`, `/procesos/[id]`
**Tipo:** Página de detalle con múltiples pestañas

#### Vista Listado `/procesos`

```
┌─────────────────────────────────────────────────────┐
│ PageHeader "Procesos"                               │
├─────────────────────────────────────────────────────┤
│ Filtros: [Vigencia ▼] [Estado ▼] [Tipo ▼]         │
├─────────────────────────────────────────────────────┤
│ Table                                               │
│ Código    │ Objeto (trunc) │ Contratista │ Estado  │
│ CTR-01-26 │ Serv. mantto.. │ García M.   │[ACTIVO] │
└─────────────────────────────────────────────────────┘
```

#### Vista Detalle `/procesos/[id]` — Layout con Tabs

```
┌──────────────────────────────────────────────────────┐
│ ProcesoHeader                                        │
│ CTR-01-2026 │ Prestación de Servicios │ [ACTIVO ▼]  │
│ Contratista: García López Manuel                    │
│ Valor: $7.261.667 │ Objeto: Servicio de mantenimie.│
├──────────────────────────────────────────────────────┤
│ [General][Cotizaciones][Cronograma][Expediente]      │
├──────────────────────────────────────────────────────┤
│ Tab General:                                         │
│   Fechas: Firma / Publicación / Inicio / Plazo...   │
│   IVA: [Switch] Tiene IVA  Valor IVA: [$Input]      │
│   UNSPSC: [MultiSelect de códigos]                  │
│                                                      │
│ Tab Cotizaciones:                                    │
│   [+ Agregar cotización]                            │
│   Proponente │ Fecha │ Valor │ Seleccionada │ Acc   │
│                                                      │
│ Tab Cronograma: → ver M6                            │
│                                                      │
│ Tab Expediente: → ver M8                            │
└──────────────────────────────────────────────────────┘
```

#### Componentes shadcn requeridos
`Tabs`, `Table`, `Badge`, `Select`, `Switch`, `Input`, `Button`, `Card`, `Separator`, `Command` (para MultiSelect UNSPSC), `Popover`

#### Flujo de implementación
```
1. schemas/proceso.schema.ts
2. actions/procesos.ts                 → CRUD + cambio estado
3. actions/cotizaciones.ts
4. components/procesos/
   ProcesoHeader.tsx                   → cabecera con estado y valor
   ProcesoForm.tsx                     → formulario datos generales
   CotizacionesPanel.tsx               → lista + form cotizaciones
   ProcesoEstadoBadge.tsx
5. app/(dashboard)/procesos/
   page.tsx                            → Server, listado
   [id]/page.tsx                       → Server, detalle con Tabs
```

---

### M6 — Cronograma

**Ruta:** `/procesos/[id]/cronograma` (Tab dentro del proceso)
**Tipo:** Client Component con tabla editable inline

#### Estructura de la vista

```
┌──────────────────────────────────────────────────────┐
│ Cronograma: CTR-01-2026              [+ Etapa]      │
├──────────────────────────────────────────────────────┤
│ # │ Etapa             │ F. Inicio  │ F. Fin    │ ✓  │
│ 1 │ Estudios previos  │ 16/02/2026 │17/02/2026 │ ✅ │
│ 2 │ Publicación SECOP │ 18/02/2026 │18/02/2026 │ ⬜ │
│ 3 │ Cotizaciones      │ 19/02/2026 │21/02/2026 │ ⬜ │
│ 4 │ Firma contrato    │ 25/02/2026 │ ──────── │ ⬜ │
├──────────────────────────────────────────────────────┤
│ Fechas reales del proceso (info):                    │
│ Inicio real: 01/03/2026  │  Terminación: ──         │
└──────────────────────────────────────────────────────┘
```

#### Flujo de implementación
```
1. actions/cronogramas.ts
2. components/cronograma/
   CronogramaTable.tsx                 → Client, edición inline
   EtapaRow.tsx                        → fila individual editable
3. app/(dashboard)/procesos/[id]/
   cronograma/page.tsx                 → (o Tab dentro del proceso)
```

---

### M7 — Plantillas y Variables

**Ruta:** `/plantillas`
**Tipo:** Server Component + Cards + Dialogs

#### Estructura de la vista

```
┌──────────────────────────────────────────────────────┐
│ PageHeader "Plantillas de Documentos"               │
├──────────────────────────────────────────────────────┤
│ Tabs: [Precontractual][Contractual][Ejecución][Liq] │
├──────────────────────────────────────────────────────┤
│ Grid de Cards por tipo de documento                 │
│ ┌──────────────┐ ┌──────────────┐                  │
│ │ 📄 CDP       │ │📄 Est. Previo│                  │
│ │ v1.0  ACTIVO │ │ v1.0  ACTIVO │                  │
│ │ 8 variables  │ │ 5 variables  │                  │
│ │[Ver vars][↑] │ │[Ver vars][↑] │                  │
│ └──────────────┘ └──────────────┘                  │
├──────────────────────────────────────────────────────┤
│ [Sheet] Variables de la plantilla CDP               │
│  Variable             │ Obligatoria │ Origen        │
│  {{nombre_institucion}}│     ✅      │ instituciones │
│  {{numero_cdp}}        │     ✅      │ cdps          │
│  {{objeto_contrato}}   │     ✅      │ cdps          │
└──────────────────────────────────────────────────────┘
```

#### Flujo de implementación
```
1. actions/plantillas.ts
2. db/seed.ts                          → seedVariables(), seedChecklist()
3. components/plantillas/
   PlantillasGrid.tsx                  → Cards por tipo de documento
   PlantillaCard.tsx                   → Card individual
   VariablesMapper.tsx                 → Sheet con mapeo de variables
4. app/(dashboard)/plantillas/page.tsx
```

---

### M8 — Expediente

**Ruta:** `/procesos/[id]/expediente` (Tab dentro del proceso)
**Tipo:** Client Component con múltiples sub-secciones

#### Estructura de la vista

```
┌──────────────────────────────────────────────────────┐
│ Expediente CTR-01-2026                               │
│ Completitud: ████████░░░░░░  62%  (8/13 ítems)     │
├──────────────────────────────────────────────────────┤
│ Tabs internos: [Documentos][Anexos][Checklist]       │
├──────────────────────────────────────────────────────┤
│ Tab Documentos:                                      │
│  [Generar documento ▼]                              │
│  Nombre            │ Estado      │ Fecha │ Descargar│
│  CDP_CTR-01-2026   │[DEFINITIVO] │16/02  │ ⬇️       │
│  Contrato_CTR...   │[BORRADOR]   │18/02  │ ⬇️       │
│                                                      │
│ Tab Anexos:                                         │
│  [Cargar anexo]                                     │
│  Nombre               │ Tipo doc  │ Fecha  │  🗑️   │
│  cdp_firmado.pdf      │ CDP       │ 16/02  │  🗑️   │
│                                                      │
│ Tab Checklist:                                      │
│  ✅ CDP firmado        → cdp_firmado.pdf            │
│  ✅ Estudio previo     → estudio_previo.pdf         │
│  ⬜ Contrato firmado  [Vincular anexo ▼]            │
│  ⬜ Acta de inicio    [Vincular anexo ▼]            │
└──────────────────────────────────────────────────────┘
```

#### Componentes shadcn requeridos
`Progress`, `Tabs`, `Table`, `Badge`, `Select`, `Button`, `Dialog`, `Checkbox`, `DropdownMenu`

#### Flujo de implementación
```
1. actions/expedientes.ts
2. actions/anexos.ts
3. actions/checklist.ts
4. app/api/documentos/generar/route.ts  → Route Handler Word
5. app/api/archivos/[expedienteId]/route.ts → Route Handler descarga
6. components/expediente/
   ExpedientePanel.tsx                  → Tabs principal
   ChecklistPanel.tsx                   → con Progress bar
   DocumentosGenerados.tsx              → lista + botón generar
   AnexosUploader.tsx                   → subida de archivos
7. app/(dashboard)/procesos/[id]/
   expediente/page.tsx
```

---

### M9 — Dashboard

**Ruta:** `/` (raíz del dashboard)
**Tipo:** Server Component con estadísticas en tiempo real

#### Estructura de la vista

```
┌──────────────────────────────────────────────────────┐
│ PageHeader "ContratoMate — IEDNDJ 2026"             │
├──────────────────────────────────────────────────────┤
│ ┌──────────────┐┌──────────────┐┌──────────────┐   │
│ │ Procesos     ││ CDPs         ││ Expedientes  │   │
│ │ activos      ││ disponibles  ││ incompletos  │   │
│ │      3       ││      2       ││      1       │   │
│ └──────────────┘└──────────────┘└──────────────┘   │
├──────────────────────────────────────────────────────┤
│ Próximas fechas del cronograma (7 días)             │
│ ┌────────────────────────────────────────────────┐  │
│ │ 20/03 │ Acta de recibo │ CTR-01-2026           │  │
│ │ 22/03 │ Liquidación    │ CTR-02-2026           │  │
│ └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

#### Flujo de implementación
```
1. (Sin actions propias — usa queries directas en el Server Component)
2. components/layout/
   StatsCard.tsx                       → tarjeta de estadística
3. app/(dashboard)/page.tsx            → Server Component con queries
```

---

## 4. Inventario de Componentes shadcn a Instalar

### Instalación única (todos a la vez en Fase 0)

```bash
pnpm dlx shadcn@latest add \
  button input label select textarea \
  form dialog alert-dialog sheet \
  table card badge tabs separator \
  dropdown-menu tooltip popover \
  checkbox switch skeleton progress \
  command radio-group
```

### Mapa de uso por vista

| Componente | Vistas que lo usan |
|---|---|
| `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage` | Todas las vistas con formularios |
| `Input` | Todas |
| `Button` | Todas |
| `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell` | Funcionarios, Catálogos, Contratistas, CDPs, Procesos, Expediente |
| `Badge` | Funcionarios, Catálogos, Contratistas, Procesos |
| `Dialog`, `DialogContent`, `DialogHeader`, `DialogFooter` | Catálogos, Funcionarios |
| `Sheet`, `SheetContent`, `SheetHeader` | Contratistas, Plantillas |
| `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` | Catálogos, Proceso (detalle), Expediente |
| `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue` | Todas las vistas con selectores |
| `Textarea` | CDP (objeto), Catálogos (descripción) |
| `AlertDialog` | Catálogos (eliminar), Funcionarios (cambiar activo) |
| `Switch` | Proceso (tiene_iva), Catálogos (activo), Funcionarios (activo) |
| `Checkbox` | Checklist del expediente |
| `Progress` | Expediente (completitud) |
| `Command` + `Popover` | UNSPSC MultiSelect en Proceso, buscador de Contratistas |
| `Separator` | Layout, formularios con secciones |
| `Skeleton` | Estados de carga de tablas |
| `RadioGroup` | Contratistas (tipo persona) |
| `Tooltip` | Sidebar colapsado, acciones de tabla |
| `DropdownMenu` | Selector "Generar documento" en Expediente, acciones del proceso |

---

## 5. Flujo de Implementación Global

### Orden por dependencias

```
1. Layout global (Sidebar, Header, globals.css)
   ↓
2. Componentes shared (DataTable, EmptyState, MoneyDisplay, etc.)
   ↓
3. Institución (sin dependencias de otros módulos)
   ↓
4. Funcionarios (depende de Institución)
   ↓
5. Catálogos (sin dependencias de módulos de negocio)
   ↓
6. Contratistas (sin dependencias de módulos de negocio)
   ↓
7. CDP (depende de Institución, Catálogos)
   ↓
8. RP (depende de CDP + Contratistas)
   ↓
9. Proceso (depende de RP, Catálogos, Contratistas)
   ↓
10. Cronograma (depende de Proceso)
    ↓
11. Plantillas y Variables (depende de Catálogos)
    ↓
12. Expediente + Generación Word (depende de Proceso + Plantillas)
    ↓
13. Dashboard (depende de todo)
```

### Convención de orden dentro de cada vista

```
Siempre en este orden:
1. Schema Zod          → validación del formulario
2. Tipos TypeScript    → si hay tipos adicionales a Drizzle
3. Server Actions      → lógica de negocio + BD
4. Componentes Client  → UI interactiva
5. Página Server       → integra todo, carga datos
6. Seed (si aplica)    → datos iniciales
```

---

## 6. Componentes Shared Reutilizables

Estos deben crearse en Fase 0 y usarse en todos los módulos:

| Componente | Ubicación | Uso |
|---|---|---|
| `DataTable` | `components/shared/DataTable.tsx` | Tabla genérica con columnas configurables |
| `ConfirmDialog` | `components/shared/ConfirmDialog.tsx` | AlertDialog de confirmación reutilizable |
| `EmptyState` | `components/shared/EmptyState.tsx` | Estado vacío de tablas y listas |
| `MoneyDisplay` | `components/shared/MoneyDisplay.tsx` | Muestra valor formateado en COP |
| `StatusBadge` | `components/shared/StatusBadge.tsx` | Badge con color según estado/rol |
| `PageHeader` | `components/shared/PageHeader.tsx` | Cabecera de página con título + acción |
| `LoadingRows` | `components/shared/LoadingRows.tsx` | Skeleton para filas de tabla |
