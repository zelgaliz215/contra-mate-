# ContratoMate — Implementación Checkpoints 4 al 7
## Contratistas · CDP · Registro Presupuestal · Proceso Contractual

> **Prerequisito**: Los Checkpoints 0, 1, 2 y 3 deben estar completados y
> verificados antes de iniciar este documento.
>
> **Instrucciones para el agente**: Lee este documento completo antes de
> escribir código. Sigue el orden exacto de checkpoints. Confirma cada
> checkpoint con Daniel antes de continuar al siguiente.

---

## Contexto acumulado

Al llegar aquí ya existen en el proyecto:
- Layout con sidebar y header funcional
- `types/index.ts` con `ActionResult<T>`
- `lib/format.ts`, `lib/constants.ts`, `lib/utils.ts`
- Módulos Institución, Funcionarios y Catálogos funcionando
- Seed con datos IEDNDJ, catálogos y checklist cargados

Los módulos de este documento dependen de los catálogos (fuentes, rubros,
tipos de proceso) que ya existen en la BD. Verificar antes de continuar.

---

# CHECKPOINT 4 — Módulo Contratistas

> **Objetivo**: CRUD completo de contratistas con formulario adaptativo
> Natural/Jurídica usando `discriminatedUnion` de Zod.
> **Tiempo estimado**: 1.5 días
> **Dependencias**: CP 0 (layout, tipos, utils)

## Contexto de negocio

Los contratistas son los proveedores que participan en los procesos. Se
registran una vez y se reutilizan en múltiples procesos. El formulario
cambia dinámicamente según el tipo de persona seleccionado.

**Regla clave**: El `tipo_persona` actúa como discriminador. Dos rutas:
- `NATURAL` → apellidos + nombres obligatorios, tipo ID: CC/CE/Pasaporte
- `JURIDICA` → razón social + representante obligatorios, tipo ID forzado a NIT

El número de identificación es único en el sistema — no pueden existir
dos contratistas con el mismo número.

## 4.1 — Schema Zod

Crear `schemas/contratista.schema.ts`:

```typescript
// Base común a ambos tipos
const contratistaBaseSchema = z.object({
  tipoIdentificacion: z.enum(['CC', 'NIT', 'CE', 'PASAPORTE']),
  numeroIdentificacion: z.string().min(5, 'Mínimo 5 caracteres'),
  digitoVerificacion: z.string().optional(),
  // Contacto (todos opcionales)
  direccion: z.string().optional(),
  municipio: z.string().optional(),
  departamento: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefonoTercero: z.string().optional(),
  // Bancario (todos opcionales)
  banco: z.string().optional(),
  tipoCuenta: z.enum(['AHORROS', 'CORRIENTE']).optional(),
  numeroCuenta: z.string().optional(),
  // Tributario (todos opcionales)
  declarante: z.string().optional(),
  regimen: z.enum(['RESPONSABLE_IVA', 'NO_RESPONSABLE_IVA']).optional(),
})

// Discriminación por tipo de persona
export const contratistaNaturalSchema = contratistaBaseSchema.extend({
  tipoPersona: z.literal('NATURAL'),
  primerApellido: z.string().min(2, 'Requerido'),
  segundoApellido: z.string().optional(),
  primerNombre: z.string().min(2, 'Requerido'),
  otrosNombres: z.string().optional(),
  nombreRazonSocial: z.undefined().optional(),
  representanteLegal: z.undefined().optional(),
  cedulaRepresentante: z.undefined().optional(),
})

export const contratistaJuridicaSchema = contratistaBaseSchema.extend({
  tipoPersona: z.literal('JURIDICA'),
  tipoIdentificacion: z.literal('NIT'), // Forzado para jurídica
  digitoVerificacion: z.string().min(1, 'Requerido para NIT'),
  nombreRazonSocial: z.string().min(3, 'Requerido'),
  representanteLegal: z.string().min(5, 'Requerido'),
  cedulaRepresentante: z.string().optional(),
  primerApellido: z.undefined().optional(),
  primerNombre: z.undefined().optional(),
})

export const contratistaSchema = z.discriminatedUnion('tipoPersona', [
  contratistaNaturalSchema,
  contratistaJuridicaSchema,
])

export type ContratistaFormData = z.infer<typeof contratistaSchema>
```

## 4.2 — Server Actions

Crear `actions/contratistas.ts`:

### `getContratistas()`
```
- Obtiene todos los contratistas ordenados por nombre/razón social
- Retorna: Contratista[]
- Incluye campo calculado: nombre display (razón social o nombre completo)
```

### `searchContratistas(query: string)`
```
- Busca contratistas por nombre, razón social o número de identificación
- Usado en selectores de RP y cotizaciones
- Retorna: Contratista[] (máximo 10 resultados)
- Si query vacío: retorna los 10 primeros activos
```

### `getContratistaById(id: number)`
```
- Retorna el contratista con sus estadísticas de participación:
  - procesos donde fue adjudicado (via RP)
  - cotizaciones donde participó como proponente
- Retorna: ContratistaDetalle | null
```

### `createContratista(data: ContratistaFormData)`
```
- Validar con discriminatedUnion Zod
- Verificar unicidad de numeroIdentificacion en BD
  Si existe: retornar error "Ya existe un contratista con ese número de identificación"
- Insertar contratista
- revalidatePath('/contratistas')
- Retorna: ActionResult<Contratista>
- Mensaje éxito: "Contratista registrado correctamente"
```

### `updateContratista(id: number, data: ContratistaFormData)`
```
- Validar con Zod
- Verificar unicidad excluyendo el registro actual (WHERE id != id)
- Actualizar
- revalidatePath('/contratistas')
- revalidatePath('/contratistas/[id]')
- Retorna: ActionResult<Contratista>
- Mensaje éxito: "Contratista actualizado correctamente"
```

### `toggleContratistaActivo(id: number)`
```
- Verificar que no tenga procesos ACTIVOS antes de desactivar
  Si tiene: retornar error "No se puede desactivar: tiene procesos activos"
- Cambiar campo activo al valor contrario
- revalidatePath('/contratistas')
- Retorna: ActionResult<void>
```

## 4.3 — Hook reutilizable

Crear `hooks/useDebounce.ts`:
```typescript
// Debounce de 300ms para el buscador de contratistas
export function useDebounce<T>(value: T, delay: number): T
```

## 4.4 — Componentes

### `components/contratistas/ContratistasTable.tsx`
**Client Component**

Columnas:
| Columna | Contenido |
|---|---|
| Tipo | Badge NATURAL (azul) / JURIDICA (morado) |
| Nombre / Razón Social | Nombre display calculado |
| Identificación | Tipo + número (ej: "CC 1102830975") |
| Estado | Badge Activo/Inactivo |
| Acciones | Editar (✏️), Ver detalle (👁️), Desactivar (🚫) |

- Buscador en tiempo real (useDebounce 300ms) que filtra por nombre o documento
- Estado local para controlar el Sheet de edición
- Al hacer click en el nombre: navega a `/contratistas/[id]`

### `components/contratistas/ContratistaSheet.tsx`
**Client Component** — Panel lateral (shadcn Sheet)

Formulario adaptativo en 5 secciones con separadores visuales:

**Sección 1 — Identificación:**
- RadioGroup: Persona Natural / Persona Jurídica (prominente, afecta todo)
- Al cambiar tipo: resetear campos de la sección 2
- Tipo ID: Select (cambia opciones según tipo de persona)
- Número ID: Input
- Dígito verificador: Input pequeño (solo visible si tipo = NIT)

**Sección 2 — Datos personales (condicional):**
- Si NATURAL: Primer apellido*, Segundo apellido, Primer nombre*, Otros nombres
- Si JURIDICA: Razón social*, Representante legal*, Cédula representante

**Sección 3 — Contacto:**
- Dirección, Municipio, Departamento, Email, Teléfono

**Sección 4 — Datos bancarios:**
- Banco (Input libre), Tipo de cuenta (Select), Número de cuenta

**Sección 5 — Tributario:**
- Régimen IVA (Select: Responsable / No Responsable)

**Comportamiento del Sheet:**
- Título: "Nuevo contratista" o "Editar contratista"
- Precarga datos si es edición
- Botones al pie: Cancelar + Guardar con loading state
- Toast éxito/error al guardar
- Cerrar automáticamente al guardar con éxito

### `components/shared/ContratistaSelector.tsx`
**Client Component reutilizable** — para RP y cotizaciones

- Input de búsqueda con debounce
- Llama a `searchContratistas` al escribir
- Muestra dropdown con resultados
- Al seleccionar: muestra el contratista seleccionado con badge de tipo
- Props: `value`, `onChange`, `placeholder`, `disabled`

## 4.5 — Páginas

### `app/(dashboard)/contratistas/page.tsx`
**Server Component**

```typescript
export default async function ContratistasPage() {
  const contratistas = await getContratistas()
  return (
    <>
      <PageHeader titulo="Contratistas" descripcion="..." />
      <ContratistasTableWrapper contratistas={contratistas} />
    </>
  )
}
```

`ContratistasTableWrapper` es un Client Component que maneja el estado del Sheet.

### `app/(dashboard)/contratistas/[id]/page.tsx`
**Server Component** — Vista de detalle (solo lectura)

Dos columnas:
- **Izquierda**: todos los datos del contratista organizados en secciones
- **Derecha**: procesos adjudicados + cotizaciones + estadísticas

---

## ✅ CHECKPOINT 4 — Verificación

- [ ] La tabla muestra contratistas con badges de tipo
- [ ] El buscador filtra en tiempo real
- [ ] El Sheet abre correctamente al crear y editar
- [ ] El formulario cambia dinámicamente al cambiar tipo de persona
- [ ] Natural: campos de nombre/apellido visibles; razón social oculta
- [ ] Jurídica: razón social visible; nombres ocultos; tipo ID forzado a NIT
- [ ] No se pueden crear dos contratistas con el mismo número de ID
- [ ] La vista de detalle `/contratistas/[id]` muestra los datos organizados
- [ ] `ContratistaSelector` funciona (se usará en RP y cotizaciones)
- [ ] No hay errores de TypeScript (`npx tsc --noEmit`)

---

# CHECKPOINT 5 — Módulo CDP

> **Objetivo**: CRUD de CDPs con líneas de rubro/fuente dinámicas.
> El CDP y sus rubros se guardan en una sola transacción atómica.
> **Tiempo estimado**: 1.5 días
> **Dependencias**: CP 3 (catálogos: fuentes y rubros activos)

## Contexto de negocio

El CDP certifica que hay presupuesto disponible. Puede tener múltiples
líneas, cada una con un rubro y una fuente. El **objeto** del CDP es la
fuente de verdad de todo el proceso — se hereda al RP y al Proceso sin
copiarse.

El valor total del CDP = suma de sus líneas. Se mantiene desnormalizado
en la tabla para consultas rápidas, pero siempre se recalcula al guardar.

## 5.1 — Schema Zod

Crear `schemas/cdp.schema.ts`:

```typescript
export const cdpRubroSchema = z.object({
  rubroId: z.number({ required_error: 'Selecciona un rubro' }),
  fuenteId: z.number({ required_error: 'Selecciona una fuente' }),
  valor: z.number()
    .positive('El valor debe ser mayor a cero')
    .min(1, 'Ingresa un valor'),
})

export const cdpSchema = z.object({
  numeroCdp: z.string().min(1, 'El número de CDP es requerido'),
  vigencia: z.number()
    .int()
    .min(2020, 'Vigencia inválida')
    .max(2099, 'Vigencia inválida'),
  fechaExpedicion: z.string().min(1, 'La fecha es requerida'),
  objeto: z.string()
    .min(20, 'El objeto debe tener al menos 20 caracteres')
    .max(1000),
  rubros: z.array(cdpRubroSchema)
    .min(1, 'Debe agregar al menos una línea de rubro'),
})

export type CdpFormData = z.infer<typeof cdpSchema>
```

## 5.2 — Server Actions

Crear `actions/cdps.ts`:

### `getCdps(vigencia?: number)`
```
- Lista todos los CDPs, opcionalmente filtrados por vigencia
- Incluye campo calculado: tieneRp (boolean)
- Ordenados por vigencia desc, número asc
- Retorna: CdpConEstado[]
```

### `getCdpById(id: number)`
```
- CDP con sus rubros (JOIN con rubros y fuentes para nombres)
- Incluye el RP si existe (JOIN registros_presupuestales)
- Retorna: CdpDetalle | null
```

### `getCdpsDisponibles()`
```
- CDPs sin RP asignado (para selector al crear RP)
- Solo activos de la vigencia actual
- Retorna: Cdp[]
```

### `createCdp(data: CdpFormData)`
```
- Validar con Zod
- Verificar unicidad: (numeroCdp, vigencia) — único por vigencia
  Si existe: retornar error "Ya existe un CDP con ese número en la vigencia [año]"
- TRANSACCIÓN ATÓMICA (usando better-sqlite3 transaction):
    1. Insertar en cdps (valorTotal = 0 inicialmente)
    2. Insertar en cdp_rubros (cada línea)
    3. Calcular total = SUM(valores)
    4. UPDATE cdps SET valor_total = total WHERE id = nuevo_id
- revalidatePath('/cdps')
- Retorna: ActionResult<Cdp>
- Mensaje éxito: "CDP creado correctamente"
```

### `updateCdp(id: number, data: CdpFormData)`
```
- Verificar que el CDP no tenga RP antes de modificar rubros
  Si tiene RP: solo permitir editar objeto y fecha (no rubros ni valor)
  Mostrar error claro si se intenta cambiar rubros con RP existente
- TRANSACCIÓN ATÓMICA:
    1. UPDATE cdps
    2. DELETE FROM cdp_rubros WHERE cdp_id = id
    3. INSERT nuevos cdp_rubros
    4. Recalcular y UPDATE valor_total
- revalidatePath('/cdps')
- revalidatePath('/cdps/[id]')
- Retorna: ActionResult<Cdp>
```

### `getCdpVigencias()`
```
- Retorna array de vigencias únicas disponibles (para el filtro)
- Ej: [2026, 2025, 2024]
```

## 5.3 — Componentes

### `components/cdps/CdpRubrosEditor.tsx`
**Client Component** — el más importante de este módulo

Estado interno: array de líneas `{ rubroId, fuenteId, valor }`

Funcionalidad:
- Botón "+ Línea" agrega una nueva fila vacía al array
- Cada fila tiene: Select rubro, Select fuente, Input valor monetario, botón eliminar
- Los Select solo muestran items activos del catálogo
- El Input de valor usa formato COP mientras el usuario escribe
- El total se calcula en tiempo real: `rubros.reduce((s, r) => s + r.valor, 0)`
- Total mostrado en un bloque destacado al pie de la tabla
- Si hay solo una línea, el botón eliminar está deshabilitado
- Validación inline: si se intenta guardar con valor 0 o sin rubro/fuente

Props:
```typescript
interface CdpRubrosEditorProps {
  rubros: RubroActivo[]
  fuentes: FuenteActiva[]
  value: CdpRubroFormData[]
  onChange: (rubros: CdpRubroFormData[]) => void
  disabled?: boolean // Para cuando CDP tiene RP (solo lectura)
}
```

### `components/cdps/CdpForm.tsx`
**Client Component** — formulario completo del CDP

Integra `CdpRubrosEditor` como sub-componente controlado.

Layout:
- Fila 1: Número CDP + Vigencia + Fecha de expedición
- Fila 2: Objeto (Textarea — campo largo, mínimo 20 chars)
- Sección: Editor de líneas de rubro
- Bloque de total resaltado
- Botones: Cancelar + Guardar CDP

Al editar un CDP con RP: mostrar banner de advertencia
"Este CDP tiene un RP asignado. Solo puedes modificar el objeto y la fecha."
y deshabilitar el editor de rubros.

### `components/cdps/CdpCard.tsx`
**Client Component** — tarjeta de detalle (solo lectura)

Muestra todos los datos del CDP + sus líneas en tabla + estado del RP.

Si no tiene RP:
- Mostrar banner azul: "Sin Registro Presupuestal asignado"
- Botón: "Crear Registro Presupuestal →"

Si tiene RP:
- Mostrar datos del RP de forma resumida
- Botón: "Ver proceso →" (si existe) o "Crear proceso →"

## 5.4 — Páginas

### `app/(dashboard)/cdps/page.tsx`
**Server Component**

Filtros: vigencia (Select) + estado RP (todos / con RP / sin RP) + buscador texto.

Tabla con columnas: N° CDP, Vigencia, Fecha, Objeto (truncado), Valor total,
Estado RP (badge), Acciones (ver, editar).

Bloque de resumen al pie: total CDPs, con RP, sin RP, valor total vigencia.

### `app/(dashboard)/cdps/nuevo/page.tsx`
**Server Component**

Carga rubros y fuentes activas, renderiza `CdpForm` vacío.

### `app/(dashboard)/cdps/[id]/page.tsx`
**Server Component**

Carga CDP con detalle. Renderiza `CdpCard` + sección RP.

### `app/(dashboard)/cdps/[id]/editar/page.tsx`
**Server Component**

Carga CDP con detalle. Renderiza `CdpForm` precargado.

---

## ✅ CHECKPOINT 5 — Verificación

- [ ] La lista de CDPs muestra con filtros funcionales
- [ ] El formulario permite agregar/quitar líneas de rubro dinámicamente
- [ ] El total se actualiza en tiempo real al cambiar valores
- [ ] El CDP con sus rubros se guarda en una sola transacción
- [ ] No se pueden crear dos CDPs con el mismo número en la misma vigencia
- [ ] Al editar un CDP con RP, los rubros quedan deshabilitados
- [ ] La vista de detalle muestra el estado del RP (con/sin)
- [ ] El botón "Crear Registro Presupuestal" aparece cuando no hay RP
- [ ] No hay errores de TypeScript

---

# CHECKPOINT 6 — Módulo Registro Presupuestal

> **Objetivo**: Crear el RP desde el CDP, asignar contratista,
> definir valores comprometidos con trazabilidad y validar valor_rp ≤ valor_cdp.
> **Tiempo estimado**: 1 día
> **Dependencias**: CP 4 (contratistas), CP 5 (CDPs)

## Contexto de negocio

El RP formaliza el compromiso del presupuesto. Está atado 1:1 al CDP.
Sus líneas de rubro referencian directamente las líneas del CDP para
garantizar trazabilidad completa.

**Regla crítica de negocio**: `valor_rp ≤ valor_cdp` por cada línea.
El valor del RP puede ser igual o menor al del CDP (por ejemplo, si hay
IVA que se maneja aparte o si el valor negociado fue menor).

## 6.1 — Schema Zod

Crear `schemas/registro-presupuestal.schema.ts`:

```typescript
export const rpRubroSchema = z.object({
  cdpRubroId: z.number(),
  valorCdp: z.number(), // Solo referencia, no editable
  valorRp: z.number()
    .positive('El valor debe ser mayor a cero'),
})

export const rpSchema = z.object({
  cdpId: z.number(),
  contratistaId: z.number({ required_error: 'Selecciona un contratista' }),
  numeroRp: z.string().min(1, 'El número de RP es requerido'),
  vigencia: z.number().int(),
  fechaExpedicion: z.string().min(1, 'La fecha es requerida'),
  rubros: z.array(rpRubroSchema).min(1),
}).superRefine((data, ctx) => {
  // Validar que valor_rp <= valor_cdp por cada línea
  data.rubros.forEach((r, i) => {
    if (r.valorRp > r.valorCdp) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `El valor del RP (${formatCOP(r.valorRp)}) no puede superar el valor del CDP (${formatCOP(r.valorCdp)})`,
        path: ['rubros', i, 'valorRp'],
      })
    }
  })
})

export type RpFormData = z.infer<typeof rpSchema>
```

## 6.2 — Server Actions

Crear `actions/registros-presupuestales.ts`:

### `getRpByCdpId(cdpId: number)`
```
- Obtiene el RP de un CDP con sus líneas, contratista y proceso asociado
- Retorna: RpDetalle | null
```

### `createRp(data: RpFormData)`
```
- Validar con Zod (incluye validación valor_rp <= valor_cdp)
- Verificar que el CDP no tenga ya un RP (UNIQUE constraint)
  Si existe: retornar error "Este CDP ya tiene un Registro Presupuestal asignado"
- Verificar unicidad (numeroRp, vigencia)
- TRANSACCIÓN ATÓMICA:
    1. Insertar en registros_presupuestales (valorTotal = 0)
    2. Insertar en rp_rubros (cada línea con valorCdp y valorRp)
    3. Calcular total = SUM(valorRp de las líneas)
    4. UPDATE registros_presupuestales SET valor_total = total
- revalidatePath('/cdps/[cdpId]')
- revalidatePath('/cdps')
- Retorna: ActionResult<RegistroPresupuestal>
- Mensaje éxito: "Registro Presupuestal creado correctamente"
```

### `getRpParaProcesoSelector()`
```
- Lista los RPs sin proceso asignado (para selector en crear proceso)
- Incluye datos del CDP y contratista via JOIN
- Solo vigencia activa
- Retorna: RpParaSelector[]
```

## 6.3 — Componentes

### `components/cdps/RpForm.tsx`
**Client Component** — formulario del RP, vive en la vista del CDP

Este formulario se muestra embebido en la página de detalle del CDP,
en la sección inferior.

Layout:
- Banner de contexto (solo lectura): "Creando RP para CDP N° XXXX — Valor: $X"
- Número RP (Input) + Vigencia (precargada del CDP, solo lectura) + Fecha
- Selector de contratista: usa `ContratistaSelector` con búsqueda
- Tabla de líneas de rubro:
  - Columna "Rubro" (solo lectura, viene del CDP)
  - Columna "Fuente" (solo lectura, viene del CDP)
  - Columna "Valor CDP" (solo lectura, referencia)
  - Columna "Valor RP" (Input editable, debe ser ≤ valor CDP)
  - Indicador visual: si valor_rp < valor_cdp mostrar diferencia en gris
  - Si valor_rp > valor_cdp: borde rojo en el input + mensaje de error inline
- Total RP calculado en tiempo real
- Botones: Cancelar + Crear RP

## 6.4 — Integración en página

### `app/(dashboard)/cdps/[id]/page.tsx`
Actualizar para mostrar el formulario de RP en la sección inferior:

```typescript
// Si no tiene RP: mostrar RpForm
// Si tiene RP: mostrar RpCard con datos del RP y botón "Ver/Crear proceso"
const rp = await getRpByCdpId(id)
```

---

## ✅ CHECKPOINT 6 — Verificación

- [ ] El formulario de RP aparece en la página del CDP (sin RP)
- [ ] El selector de contratista funciona con búsqueda
- [ ] Las líneas del CDP se muestran como referencia (no editables)
- [ ] Los valores de RP son editables con validación visual
- [ ] Error inline cuando valor_rp > valor_cdp
- [ ] El RP se crea exitosamente con la transacción atómica
- [ ] Después de crear el RP, la página del CDP muestra los datos del RP
- [ ] No se puede crear un segundo RP para el mismo CDP
- [ ] No hay errores de TypeScript

---

# CHECKPOINT 7 — Módulo Proceso Contractual

> **Objetivo**: Proceso completo con cotizaciones, códigos UNSPSC,
> gestión de fechas, cambio de estado y ciclo de vida.
> Al crear el proceso se generan automáticamente el cronograma y expediente.
> **Tiempo estimado**: 2 días
> **Dependencias**: CP 3 (catálogos), CP 4 (contratistas), CP 6 (RP)

## Contexto de negocio

El proceso nace del RP. No duplica objeto, contratista ni valor — los
hereda consultando `proceso → rp → cdp`. El código se genera
automáticamente. Al crearse el proceso, se crean automáticamente su
cronograma vacío y su expediente vacío.

El IVA se captura manualmente porque depende del tipo de contratista y
las condiciones del contrato específico: `tiene_iva` (boolean) +
`valor_iva` (monto en pesos ingresado por el usuario).

Los códigos UNSPSC clasifican el objeto general del proceso (no los
ítems individuales). Relación N:M via tabla `proceso_unspsc`.

## 7.1 — Schemas Zod

Crear `schemas/proceso.schema.ts`:

```typescript
export const procesoSchema = z.object({
  rpId: z.number({ required_error: 'Selecciona un RP' }),
  tipoProcesoid: z.number({ required_error: 'Selecciona el tipo de proceso' }),
  tieneIva: z.boolean().default(false),
  valorIva: z.number().min(0).optional().nullable(),
  unspscIds: z.array(z.number()).optional().default([]),
}).superRefine((data, ctx) => {
  if (data.tieneIva && (!data.valorIva || data.valorIva <= 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Ingresa el valor del IVA en pesos',
      path: ['valorIva'],
    })
  }
})

// Para actualizar fechas del proceso (Tab General)
export const procesoFechasSchema = z.object({
  fechaFirma: z.string().optional().nullable(),
  fechaPublicacion: z.string().optional().nullable(),
  fechaInicio: z.string().optional().nullable(),
  plazo: z.string().optional().nullable(),
  fechaActaTerminacion: z.string().optional().nullable(),
  fechaLiquidacion: z.string().optional().nullable(),
  tieneIva: z.boolean(),
  valorIva: z.number().optional().nullable(),
  tipoProcesoid: z.number(),
  unspscIds: z.array(z.number()).default([]),
})
```

Crear `schemas/cotizacion.schema.ts`:

```typescript
export const cotizacionSchema = z.object({
  procesoId: z.number(),
  contratistaId: z.number({ required_error: 'Selecciona el proponente' }),
  fechaCotizacion: z.string().min(1, 'La fecha es requerida'),
  valorTotal: z.number().positive('El valor debe ser mayor a cero'),
  observaciones: z.string().optional(),
})
```

## 7.2 — Server Actions

Crear `actions/procesos.ts`:

### `getProcesos(filtros?: { vigencia?, estado?, tipoProceso? })`
```
- Lista procesos con datos derivados (objeto, contratista, valor via RP/CDP)
- Ordenados por vigencia desc, código asc
- Retorna: ProcesoListItem[] (con campos calculados)
```

### `getProcesoById(id: number)`
```
- Proceso con todos sus datos relacionados:
  rp → cdp (objeto, valor), contratista, tipo proceso, UNSPSC
- Retorna: ProcesoDetalle | null
```

### `createProceso(data: ProcesoFormData)`
```
- Validar con Zod
- Verificar que el RP no tenga ya un proceso (UNIQUE)
  Si tiene: retornar error "Este RP ya tiene un proceso asignado"
- Generar código: CTR-{secuencial_vigencia}-{vigencia}
  Secuencial: COUNT(procesos WHERE vigencia = año) + 1, con padding 2 dígitos
  Ejemplo: CTR-01-2026, CTR-02-2026, CTR-03-2026
- TRANSACCIÓN ATÓMICA:
    1. Insertar proceso (estado = BORRADOR)
    2. INSERT proceso_unspsc (si hay códigos UNSPSC)
    3. INSERT cronograma (vacío, 1:1 con proceso)
    4. INSERT expediente (vacío, completitud = 0)
       ruta_carpeta = '/expedientes/{vigencia}/{codigo}/'
- revalidatePath('/procesos')
- Retorna: ActionResult<Proceso>
- Mensaje éxito: "Proceso CTR-XX-XXXX creado correctamente"
```

### `updateProcesoGeneral(id: number, data: ProcesoFechasData)`
```
- Actualiza fechas, IVA, tipo proceso y UNSPSC del proceso
- Para UNSPSC: DELETE proceso_unspsc WHERE proceso_id = id
  + INSERT nuevos (transacción)
- revalidatePath('/procesos/[id]')
- Retorna: ActionResult<Proceso>
```

### `cambiarEstadoProceso(id: number, nuevoEstado: EstadoProceso)`
```
Transiciones válidas:
  BORRADOR → ACTIVO
  ACTIVO → SUSPENDIDO
  ACTIVO → LIQUIDADO
  ACTIVO → ANULADO
  SUSPENDIDO → ACTIVO
  SUSPENDIDO → ANULADO

- Verificar que la transición sea válida
  Si no lo es: retornar error "Transición de estado inválida"
- Si nuevo estado = LIQUIDADO: verificar que expediente.completitud = 100
  Si no: retornar error "El expediente debe estar completo al 100% para liquidar"
- Actualizar estado
- revalidatePath('/procesos')
- revalidatePath('/procesos/[id]')
- Retorna: ActionResult<void>
```

Crear `actions/cotizaciones.ts`:

### `getCotizacionesByProceso(procesoId: number)`
```
- Lista cotizaciones del proceso con datos del contratista proponente
- Retorna: CotizacionConContratista[]
```

### `createCotizacion(data: CotizacionFormData)`
```
- Validar con Zod
- Máximo 3 cotizaciones por proceso (verificar antes de insertar)
  Si ya hay 3: retornar error "Un proceso puede tener máximo 3 cotizaciones"
- Insertar con seleccionada = false
- revalidatePath('/procesos/[id]')
- Retorna: ActionResult<Cotizacion>
```

### `seleccionarCotizacion(id: number, procesoId: number)`
```
- TRANSACCIÓN ATÓMICA:
    UPDATE cotizaciones SET seleccionada = false WHERE proceso_id = procesoId
    UPDATE cotizaciones SET seleccionada = true WHERE id = id
- revalidatePath('/procesos/[id]')
- Retorna: ActionResult<void>
- Mensaje éxito: "Cotización marcada como ganadora"
```

### `deleteCotizacion(id: number)`
```
- Verificar que la cotización no esté seleccionada
  Si está seleccionada: retornar error "No se puede eliminar la cotización ganadora"
- Eliminar
- revalidatePath('/procesos/[id]')
```

## 7.3 — Componentes

### `components/procesos/ProcesoHeader.tsx`
Cabecera reutilizable en todas las páginas del proceso:
- Código del proceso (grande, prominente)
- Tipo de proceso
- Badge de estado con color + selector "Cambiar estado v"
- Objeto del contrato (truncado con tooltip)
- Contratista + Valor total (derivados del RP)

### `components/procesos/ProcesoForm.tsx`
**Client Component** — formulario de creación

Campos:
- Selector de RP disponible (muestra CDP, contratista y valor de cada uno)
- Selector de tipo de proceso
- Switch "Tiene IVA" + Input "Valor IVA" (condicional: solo visible si switch = true)
- MultiSelector de códigos UNSPSC (Command + Popover de shadcn)
  - Busca en los codes activos del catálogo
  - Muestra los seleccionados como pills/tags eliminables
- Bloque informativo (solo lectura): objeto + contratista + valor del RP seleccionado

Banner de información al pie:
"Al crear el proceso se generarán automáticamente el cronograma y el expediente"

### `components/procesos/TabGeneral.tsx`
**Client Component** — Tab 1 del detalle

Secciones:
- Fechas del contrato: firma, publicación, inicio, plazo, terminación, liquidación
  (todos opcionales, se llenan progresivamente)
- IVA: Switch + Input condicional
- Códigos UNSPSC: MultiSelector
- Botón "Guardar cambios en General" (independiente de otros tabs)

### `components/procesos/CotizacionesPanel.tsx`
**Client Component** — Tab 2 del detalle

Tabla de cotizaciones:
- La fila ganadora tiene fondo verde claro + badge "Ganadora ★"
- Botón "Marcar como ganadora" en filas no seleccionadas
- Botón "+ Cotización" (deshabilitado si ya hay 3)
- Contador: "2 de 3 cotizaciones registradas"

Dialog de nueva cotización:
- Selector contratista (usa ContratistaSelector)
- Fecha de cotización
- Valor total (Input monetario)
- Observaciones (Textarea, opcional)

### `components/shared/EstadoProcesoSelector.tsx`
**Client Component** — selector de cambio de estado

- Muestra el estado actual como badge con color
- Al hacer click: abre un Popover con las transiciones válidas disponibles
- Al seleccionar: muestra AlertDialog de confirmación
  "¿Cambiar el estado de CTR-01-2026 a ACTIVO? Esta acción no se puede deshacer."

## 7.4 — Páginas

### `app/(dashboard)/procesos/page.tsx`
**Server Component**

Filtros: Vigencia + Estado + Tipo de proceso
Tabla con: Código (link), Objeto truncado, Contratista, Valor, Estado, Acciones

### `app/(dashboard)/procesos/nuevo/page.tsx`
**Server Component**

Carga: RPs disponibles + tipos de proceso + códigos UNSPSC activos
Renderiza `ProcesoForm`

### `app/(dashboard)/procesos/[id]/page.tsx`
**Server Component** — vista central con 4 tabs

```typescript
// Layout de la página:
<ProcesoHeader proceso={proceso} />
<Tabs defaultValue="general">
  <TabsList>
    <TabsTrigger value="general">General</TabsTrigger>
    <TabsTrigger value="cotizaciones">Cotizaciones</TabsTrigger>
    <TabsTrigger value="cronograma">Cronograma</TabsTrigger>
    <TabsTrigger value="expediente">Expediente</TabsTrigger>
  </TabsList>
  <TabsContent value="general"><TabGeneral /></TabsContent>
  <TabsContent value="cotizaciones"><CotizacionesPanel /></TabsContent>
  <TabsContent value="cronograma">
    {/* Implementado en CP 8 */}
    <p>Cronograma — próximamente</p>
  </TabsContent>
  <TabsContent value="expediente">
    {/* Implementado en CP 10 */}
    <p>Expediente — próximamente</p>
  </TabsContent>
</Tabs>
```

---

## ✅ CHECKPOINT 7 — Verificación

- [ ] La lista de procesos muestra con filtros y datos derivados del RP
- [ ] Al crear proceso: código generado automáticamente (CTR-01-2026)
- [ ] El objeto y contratista del RP se muestran en el formulario (solo lectura)
- [ ] El switch de IVA muestra/oculta el input de valor correctamente
- [ ] El MultiSelector de UNSPSC funciona con búsqueda
- [ ] Al crear: cronograma y expediente se crean automáticamente
- [ ] El cambio de estado respeta las transiciones válidas
- [ ] Puedo crear 3 cotizaciones, el botón se deshabilita al llegar a 3
- [ ] Solo una cotización puede estar seleccionada (ganadora)
- [ ] El Tab General guarda de forma independiente
- [ ] Los tabs de Cronograma y Expediente muestran placeholder "próximamente"
- [ ] No hay errores de TypeScript

---

## Notas para el agente

1. **`ContratistaSelector`** creado en CP4 se reutiliza en CP6 (RP) y CP7 (cotizaciones).
2. **Transacción SQLite** con better-sqlite3: usar `db.transaction(() => { ... })()`.
3. **Datos derivados** en `ProcesoListItem` y `ProcesoDetalle`: usar JOINs de Drizzle,
   no hacer queries separadas por cada proceso.
4. El **código del proceso** debe ser padded: siempre 2 dígitos (CTR-01, CTR-09, CTR-10).
5. Al crear proceso, la **ruta del expediente** usa el código generado:
   `/expedientes/2026/CTR-01-2026/`. Crear la carpeta física en el sistema de archivos.
6. Los tabs de **Cronograma** y **Expediente** se dejan con placeholder — se implementan
   en los Checkpoints 8 y 10 respectivamente.
