# ContratoMate — Plan de Implementación Gradual

## Documento para Agente IA (Claude Code)

> **INSTRUCCIONES CRÍTICAS PARA EL AGENTE:**
>
> 1. Lee este documento **completo** antes de escribir una sola línea de código.
> 2. Lee también el archivo `agent.md` del proyecto — contiene convenciones,
>    ejemplos de código y reglas que tienen prioridad sobre cualquier preferencia
>    por defecto.
> 3. Implementa **un checkpoint a la vez**. Al terminar cada uno, lista
>    explícitamente qué archivos creaste/modificaste y espera confirmación.
> 4. Si algo es ambiguo, **pregunta antes de asumir**.
> 5. Nunca implementes código de checkpoints no solicitados.

---

## Estado del Proyecto

El proyecto **ya existe** en disco con Next.js 16, App Router, TypeScript y
Tailwind configurados. El `agent.md` del proyecto define las convenciones base.

**Lo que ya existe:**

- Proyecto Next.js inicializado
- `agent.md` con convenciones del proyecto
- `db/schema.ts` con el schema completo de Drizzle (26 tablas, no modificar)

**Lo que falta y debes implementar en este documento:**

- Dependencias adicionales (Drizzle, shadcn, Zod, sonner)
- Configuración de Drizzle + SQLite
- Layout principal con sidebar
- Módulo Configuración (Institución + Funcionarios)
- Módulo Catálogos (Rubros, Fuentes, Tipos de Proceso, UNSPSC, Tipos de Documento)

---

## Convenciones del Proyecto (del agent.md)

### Imports — orden obligatorio

```typescript
// 1. React/Next
import { useState } from "react";
// 2. Drizzle
import { db } from "@/db";
import { instituciones } from "@/db/schema";
// 3. Utils
import { formatCOP } from "@/lib/utils";
// 4. Componentes UI (Shadcn)
import { Button } from "@/components/ui/button";
// 5. Componentes del módulo
import InstitucionForm from "@/components/configuracion/InstitucionForm";
// 6. Tipos
import type { Institucion } from "@/db/schema";
// 7. Server Actions
import { upsertInstitucion } from "@/actions/instituciones";
```

### Paths — usar siempre `@/`

```typescript
// ✅ CORRECTO
import { db } from "@/db";
import { formatCOP } from "@/lib/utils";

// ❌ INCORRECTO
import { db } from "@/src/db"; // No existe carpeta src/
import { db } from "../../db"; // Sin alias
```

### Server Actions — estructura estándar

```typescript
"use server";
import { db } from "@/db";
import { revalidatePath } from "next/cache";

export async function createRecord(data: FormData) {
  // validar → insertar → revalidar → retornar resultado
}
```

### Server Components (pages) — patrón estándar

```typescript
// app/(dashboard)/configuracion/page.tsx
import { db } from '@/db'
import { instituciones } from '@/db/schema'

export default async function ConfiguracionPage() {
  const institucion = await db.query.instituciones.findFirst()
  return <InstitucionForm institucion={institucion ?? null} />
}
```

---

## Tipo de Retorno — Server Actions

**Todas las Server Actions deben retornar este tipo.** Definirlo en
`types/index.ts` y usarlo consistentemente:

```typescript
export type ActionResult<T = void> =
  | { success: true; data: T; message: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };
```

---

## Manejo de Feedback al Usuario

- **Éxito**: Toast de sonner (`toast.success("Mensaje")`)
- **Error de servidor**: Toast de sonner (`toast.error("Mensaje")`)
- **Error de validación**: Mensaje inline bajo el campo con React Hook Form
- **Cargando**: Usar `useFormStatus` o estado local con botón deshabilitado

---

# CHECKPOINT 0 — Setup de Dependencias e Infraestructura

> **Objetivo**: Proyecto con Drizzle, shadcn, Zod y layout base funcionando.
> **Tiempo estimado**: 1-2 horas.
> **Prerequisito**: El proyecto Next.js ya existe y corre con `pnpm dev`.

## 0.1 — Instalar dependencias

```bash
# ORM y base de datos
pnpm add drizzle-orm better-sqlite3
pnpm add -D drizzle-kit @types/better-sqlite3

# Formularios y validación
pnpm add zod react-hook-form @hookform/resolvers

# UI
pnpm add sonner
pnpm add lucide-react
```

## 0.2 — Configurar Drizzle

Crear `drizzle.config.ts` en la raíz del proyecto:

```typescript
import type { Config } from "drizzle-kit";

export default {
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: "./contratomate.db",
  },
} satisfies Config;
```

Crear `db/index.ts`:

```typescript
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

const sqlite = new Database("contratomate.db");
export const db = drizzle(sqlite, { schema });
```

Agregar scripts en `package.json`:

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio",
    "db:seed": "npx tsx db/seed.ts"
  }
}
```

Ejecutar migraciones:

```bash
pnpm db:generate
pnpm db:migrate
```

## 0.3 — Inicializar shadcn/ui

```bash
pnpm dlx shadcn@latest init
```

Configuración del wizard:

- Style: **Default**
- Base color: **Slate**
- CSS variables: **Yes**

Instalar todos los componentes necesarios para el proyecto completo de una vez:

```bash
pnpm dlx shadcn@latest add button input label select textarea
pnpm dlx shadcn@latest add form dialog alert-dialog sheet
pnpm dlx shadcn@latest add table card badge tabs separator
pnpm dlx shadcn@latest add dropdown-menu tooltip popover
pnpm dlx shadcn@latest add checkbox switch skeleton progress
pnpm dlx shadcn@latest add command
```

## 0.4 — Archivos de utilidades base

### `types/index.ts`

Crear con:

- Tipo `ActionResult<T>` según especificación anterior
- Re-exportar todos los tipos inferidos del schema:
  ```typescript
  export type { Institucion, NuevaInstitucion, Funcionario, ... } from '@/db/schema'
  ```

### `lib/utils.ts`

Crear con:

- Función `cn()` usando `clsx` + `tailwind-merge` (patrón shadcn estándar)

### `lib/format.ts`

Crear con estas funciones — **implementar todas**:

```typescript
// Formatea número como moneda colombiana: $ 7.261.667,00
export function formatCOP(valor: number): string;

// Formatea fecha ISO a formato colombiano: 16/02/2026
export function formatFecha(fecha: string): string;

// Formatea fecha ISO en texto largo: 16 de febrero de 2026
export function formatFechaLarga(fecha: string): string;

// Convierte número a texto en español para documentos
// Ejemplo: 7261667 → "SIETE MILLONES DOSCIENTOS SESENTA Y UN MIL..."
// Importante: usado en documentos Word, debe ser preciso
export function numeroALetras(valor: number): string;
```

### `lib/constants.ts`

Crear con estos objetos — **incluir labels en español para la UI**:

```typescript
export const ROLES_FUNCIONARIO = [
  { value: "RECTOR", label: "Rector" },
  { value: "PAGADOR", label: "Pagador / Auxiliar Administrativo" },
  { value: "CONTADOR", label: "Contador" },
  { value: "SUPERVISOR", label: "Supervisor" },
] as const;

export const ESTADOS_PROCESO = [
  { value: "BORRADOR", label: "Borrador", color: "gray" },
  { value: "ACTIVO", label: "Activo", color: "green" },
  { value: "SUSPENDIDO", label: "Suspendido", color: "yellow" },
  { value: "LIQUIDADO", label: "Liquidado", color: "blue" },
  { value: "ANULADO", label: "Anulado", color: "red" },
] as const;

export const TIPOS_IDENTIFICACION = [
  { value: "CC", label: "Cédula de Ciudadanía" },
  { value: "NIT", label: "NIT" },
  { value: "CE", label: "Cédula de Extranjería" },
  { value: "PASAPORTE", label: "Pasaporte" },
] as const;

export const TIPOS_PERSONA = [
  { value: "NATURAL", label: "Persona Natural" },
  { value: "JURIDICA", label: "Persona Jurídica" },
] as const;

export const REGIMENES_IVA = [
  { value: "RESPONSABLE_IVA", label: "Responsable de IVA" },
  { value: "NO_RESPONSABLE_IVA", label: "No Responsable de IVA" },
] as const;

export const CATEGORIAS_DOCUMENTO = [
  { value: "PRECONTRACTUAL", label: "Precontractual" },
  { value: "CONTRACTUAL", label: "Contractual" },
  { value: "EJECUCION", label: "Ejecución" },
  { value: "LIQUIDACION", label: "Liquidación" },
] as const;
```

## 0.5 — Layout principal

### `app/layout.tsx`

- Configurar fuente (Inter o Geist de next/font)
- Añadir `<Toaster richColors position="top-right" />` de sonner
- Envolver en el provider de tema si se configura dark mode

### `app/(dashboard)/layout.tsx`

- Sidebar fijo a la izquierda (ancho: 240px)
- Área de contenido principal con padding
- Header superior con el título de la sección activa

### `components/layout/Sidebar.tsx`

Sidebar de navegación con las siguientes secciones y rutas exactas:

```
⚙️  Configuración
    Institución              /configuracion
    Funcionarios             /funcionarios
    Catálogos                /catalogos

👥  Contratistas             /contratistas

💰  Presupuesto
    CDPs                     /cdps
    Registros Presupuestales /registros-presupuestales

📋  Procesos                 /procesos

📁  Plantillas               /plantillas
```

Comportamiento del sidebar:

- Resaltar ítem activo según `usePathname()`
- Si no existe registro de institución en la DB, mostrar ícono de
  advertencia (⚠️) junto al ítem "Institución" en el sidebar
- Logo "ContratoMate" en la parte superior con ícono de carpeta/documento

### `components/layout/Header.tsx`

- Mostrar el título de la sección actual (derivado de la ruta)
- Breadcrumb simple: `Inicio > Sección > Sub-sección`

### `app/(dashboard)/page.tsx`

Dashboard con 4 tarjetas de estadísticas:

1. **Procesos activos** — count de `procesos` con `estado = 'ACTIVO'`
2. **CDPs disponibles** — count de CDPs sin RP asignado
3. **Expedientes incompletos** — count de expedientes con `completitud < 100`
4. **Próximas fechas** — etapas de cronograma con fecha en los próximos 7 días

Si no hay datos, las tarjetas muestran `0` — no usar datos mock.

---

## ✅ CHECKPOINT 0 — Verificación

Antes de continuar al siguiente checkpoint, verificar:

- [ ] `pnpm dev` corre sin errores en consola
- [ ] `pnpm db:migrate` corrió exitosamente
- [ ] El archivo `contratomate.db` existe en la raíz
- [ ] `pnpm db:studio` abre Drizzle Studio y muestra las tablas
- [ ] El sidebar se ve con todos los ítems de navegación
- [ ] El layout tiene sidebar + header + área de contenido
- [ ] `lib/format.ts` tiene las 4 funciones implementadas
- [ ] `lib/constants.ts` tiene todos los arrays de constantes
- [ ] No hay errores de TypeScript (`npx tsc --noEmit`)

**Reportar**: Lista de archivos creados/modificados y confirmar con Daniel.

---

# CHECKPOINT 1 — Módulo Configuración: Institución

> **Objetivo**: CRUD de la institución educativa. Es un registro único
> (upsert, no create/list).
> **Prerequisito**: Checkpoint 0 completado y verificado.

## Contexto de negocio

La institución es **un único registro** en el sistema. No se crea desde
un formulario de "nuevo", sino que se configura. La pantalla debe:

- Si no existe el registro: mostrar formulario vacío con título "Configurar institución"
- Si ya existe: mostrar el formulario con los datos actuales para editar

Los datos de la institución se usan en todos los documentos generados
(encabezados, firmas, etc.).

## 1.1 — Schema Zod

Crear `schemas/institucion.schema.ts`:

```typescript
// Campos y validaciones exactas:

nombre:
  - requerido
  - string mínimo 5 caracteres
  - mensaje: "El nombre debe tener al menos 5 caracteres"

siglas:
  - requerido
  - string mínimo 2, máximo 20 caracteres
  - mensaje: "Las siglas deben tener entre 2 y 20 caracteres"

nit:
  - requerido
  - string con formato: dígitos seguidos de guión y dígito verificador
  - regex: /^\d{6,12}-\d{1}$/
  - mensaje: "Formato NIT inválido (ej: 823001921-9)"

municipio:
  - opcional, string

departamento:
  - opcional, string

telefono:
  - opcional
  - si se provee, mínimo 7 caracteres

email:
  - opcional
  - si se provee, debe ser email válido con z.string().email()
  - mensaje: "Correo electrónico inválido"
```

## 1.2 — Server Actions

Crear `actions/instituciones.ts`:

### `getInstitucion()`

```
- Consulta: db.query.instituciones.findFirst()
- Retorna: Institucion | null
- Sin parámetros
```

### `upsertInstitucion(data: InstitucionFormData)`

```
- Validar con schema Zod, retornar fieldErrors si falla
- Si existe registro (id conocido): hacer UPDATE
- Si no existe: hacer INSERT
- Después de guardar: revalidatePath('/configuracion')
- Retorna: ActionResult<Institucion>
- Mensaje de éxito: "Institución guardada correctamente"
```

## 1.3 — Componentes

### `components/configuracion/InstitucionForm.tsx`

**Tipo**: Client Component (`'use client'`)

**Props**:

```typescript
interface InstitucionFormProps {
  institucion: Institucion | null;
}
```

**Campos del formulario** — en este orden visual:

1. `nombre` — Input, label "Nombre completo de la institución", placeholder "Institución Educativa..."
2. `siglas` — Input, label "Siglas", placeholder "IEDNDJ", máximo 20 chars con contador
3. `nit` — Input, label "NIT", placeholder "823001921-9"
4. `municipio` — Input, label "Municipio", placeholder "Planeta Rica"
5. `departamento` — Input, label "Departamento", placeholder "Córdoba"
6. `telefono` — Input, label "Teléfono", placeholder "3001234567"
7. `email` — Input type="email", label "Correo electrónico"

**Layout**: Grid de 2 columnas. `nombre` ocupa toda la fila. Los demás
en pares: siglas+nit, municipio+departamento, telefono+email.

**Comportamiento**:

- Usar `react-hook-form` con `zodResolver`
- Precargar valores si `institucion !== null`
- Botón "Guardar configuración" con estado de carga
- Al éxito: `toast.success("Institución guardada correctamente")`
- Al error de servidor: `toast.error(result.error)`
- Errores de validación: inline bajo cada campo con `FormMessage` de shadcn

## 1.4 — Página

### `app/(dashboard)/configuracion/page.tsx`

**Tipo**: Server Component

```typescript
// Pseudocódigo de lo que debe hacer:
const institucion = await getInstitucion();
// Renderizar header con título
// Renderizar InstitucionForm pasando los datos
```

Metadatos de la página:

```typescript
export const metadata = { title: "Configuración — ContratoMate" };
```

---

## ✅ CHECKPOINT 1 — Verificación

- [ ] La ruta `/configuracion` carga sin errores
- [ ] El formulario aparece vacío si no hay datos en la DB
- [ ] Puedo guardar un registro nuevo y aparece el toast de éxito
- [ ] Al recargar la página, los datos guardados aparecen en el formulario
- [ ] Puedo editar y volver a guardar
- [ ] Los errores de validación aparecen **bajo cada campo** (no como toast)
- [ ] El NIT con formato incorrecto muestra el mensaje de error específico
- [ ] El botón se deshabilita mientras guarda
- [ ] No hay errores de TypeScript

**Reportar**: Lista de archivos creados/modificados y confirmar.

---

# CHECKPOINT 2 — Módulo Configuración: Funcionarios

> **Objetivo**: CRUD de funcionarios con lógica de rol único activo.
> **Prerequisito**: Checkpoint 1 completado.

## Contexto de negocio

Los funcionarios son las personas que firman los documentos del proceso.
Hay 4 roles. Puede existir historial (varios por rol), pero **solo uno
activo por rol a la vez**.

Cuando se activa un funcionario de un rol que ya tiene otro activo,
el sistema desactiva automáticamente al anterior. Esto garantiza que
en los documentos generados siempre se use el funcionario correcto.

**Rol PAGADOR**: corresponde a Daniel (quien usa el sistema).
**Rol RECTOR**: firma la mayoría de los documentos.

## 2.1 — Schema Zod

Crear `schemas/funcionario.schema.ts`:

```typescript
// Campos y validaciones:

institucionId:
  - number, requerido
  - (se pasará automáticamente desde la página, no lo elige el usuario)

rol:
  - enum: 'RECTOR' | 'PAGADOR' | 'CONTADOR' | 'SUPERVISOR'
  - requerido
  - mensaje: "Selecciona un rol"

nombreCompleto:
  - string, mínimo 5 caracteres, requerido
  - mensaje: "El nombre debe tener al menos 5 caracteres"

tipoIdentificacion:
  - enum: 'CC' | 'CE'
  - requerido
  - mensaje: "Selecciona el tipo de identificación"

numeroIdentificacion:
  - string, mínimo 5 caracteres, requerido
  - mensaje: "El número de identificación debe tener al menos 5 dígitos"

cargoOficial:
  - string, opcional
  - (ej: "Auxiliar Administrativo", "Rector", "Contador Público")

activo:
  - boolean, default: true
```

## 2.2 — Server Actions

Crear `actions/funcionarios.ts`:

### `getFuncionarios()`

```
- Consulta todos los funcionarios ordenados por rol, luego por nombre
- Incluye el campo activo para distinguir estados
- Retorna: Funcionario[]
```

### `getFuncionarioActivoPorRol(rol: string)`

```
- Busca el funcionario activo de un rol específico
- Retorna: Funcionario | null
- Usado para el sistema de generación de documentos
```

### `createFuncionario(data)`

```
- Validar con schema Zod
- Si data.activo === true:
    Buscar si existe otro activo del mismo rol
    Si existe: desactivarlo primero (UPDATE activo=false)
- Insertar el nuevo funcionario
- revalidatePath('/funcionarios')
- Retorna: ActionResult<Funcionario>
- Mensaje éxito: "Funcionario creado correctamente"
```

### `updateFuncionario(id: number, data)`

```
- Validar con schema Zod
- Si data.activo === true:
    Buscar si existe OTRO funcionario activo del mismo rol (distinto al que editamos)
    Si existe: desactivarlo
- Actualizar el funcionario
- revalidatePath('/funcionarios')
- Retorna: ActionResult<Funcionario>
- Mensaje éxito: "Funcionario actualizado correctamente"
```

### `toggleFuncionarioActivo(id: number)`

```
- Obtener el funcionario actual
- Si se va a ACTIVAR (activo: false → true):
    Desactivar cualquier otro activo del mismo rol
- Cambiar el campo activo al valor contrario
- revalidatePath('/funcionarios')
- Retorna: ActionResult<void>
- Mensaje éxito al activar: "Funcionario activado"
- Mensaje éxito al desactivar: "Funcionario desactivado"
```

## 2.3 — Componentes

### `components/configuracion/FuncionariosTable.tsx`

**Tipo**: Client Component (necesita estado para el modal)

**Columnas de la tabla**:
| Columna | Contenido |
|---|---|
| Rol | Badge con color por rol |
| Nombre completo | Texto |
| Tipo ID + Número | "CC 12345678" |
| Cargo oficial | Texto o "—" si vacío |
| Estado | Badge verde "Activo" / gris "Inactivo" |
| Acciones | Botones Editar, Activar/Desactivar |

**Colores de badge por rol**:

- RECTOR → `blue`
- PAGADOR → `green`
- CONTADOR → `orange`
- SUPERVISOR → `purple`

**Comportamiento**:

- Agrupar visualmente por rol (o al menos ordenar por rol)
- Botón "Agregar funcionario" en el header que abre el modal
- El modal de creación/edición usa `FuncionarioFormDialog`
- Al hacer click en "Activar/Desactivar", mostrar `AlertDialog` de
  confirmación solo cuando se va a DESACTIVAR
- Al activar: confirmar si hay otro activo del mismo rol
  ("¿Desactivar a [nombre actual] y activar a [nombre nuevo]?")

### `components/configuracion/FuncionarioFormDialog.tsx`

**Tipo**: Client Component

**Props**:

```typescript
interface FuncionarioFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  funcionario?: Funcionario; // undefined = modo crear
  institucionId: number;
  funcionariosActivos: Record<string, Funcionario>;
  // Record de rol → funcionario activo actual para mostrar advertencia
}
```

**Campos del formulario en el Dialog**:

1. Selector de Rol (Select con los 4 opciones)
2. Nombre completo (Input)
3. Tipo de identificación (Select: CC, CE)
4. Número de identificación (Input)
5. Cargo oficial (Input, opcional)
6. Switch "Activo" (solo visible en modo editar)

**Advertencia condicional**: Si el rol seleccionado ya tiene un funcionario
activo, mostrar un bloque de alerta amarillo debajo del selector de rol:

```
⚠️ Ya existe un RECTOR activo: "Jaider Andres Suarez Vergara"
   Al guardar este funcionario como activo, el anterior será desactivado.
```

**Botones**: "Cancelar" y "Guardar" (con loading state)

## 2.4 — Página

### `app/(dashboard)/funcionarios/page.tsx`

**Tipo**: Server Component

```typescript
// Lo que debe hacer:
const institucion = await getInstitucion();
// Si no hay institución, mostrar mensaje de alerta:
// "Primero debes configurar los datos de la institución"
// con botón que lleva a /configuracion

const funcionarios = await getFuncionarios();
// Calcular el mapa de funcionarios activos por rol
// Renderizar FuncionariosTable pasando los datos
```

Metadatos: `title: 'Funcionarios — ContratoMate'`

## 2.5 — Seed inicial

En `db/seed.ts`, crear función `seedConfiguracion()` con:

```
Institución:
  nombre: "Institución Educativa Dulce Nombre de Jesús"
  siglas: "IEDNDJ"
  nit: "823001921-9"
  municipio: "Planeta Rica"
  departamento: "Córdoba"

Funcionarios:
  1. Rol: RECTOR
     nombre: "Jaider Andres Suarez Vergara"
     tipoId: CC
     numeroId: (usar número genérico, Daniel lo editará)
     activo: true

  2. Rol: PAGADOR
     nombre: "Daniel Eduardo Trejos Montiel"
     tipoId: CC
     numeroId: (usar número genérico, Daniel lo editará)
     cargo: "Auxiliar Administrativo"
     activo: true

  3. Rol: CONTADOR
     nombre: "Contador por Configurar"
     tipoId: CC
     numeroId: "000000001"
     activo: false

  4. Rol: SUPERVISOR
     nombre: "Supervisor por Configurar"
     tipoId: CC
     numeroId: "000000002"
     activo: false
```

El seed debe usar `onConflictDoNothing()` para ser idempotente.

---

## ✅ CHECKPOINT 2 — Verificación

- [ ] La ruta `/funcionarios` carga sin errores
- [ ] Si no hay institución configurada, aparece el mensaje de advertencia
- [ ] La tabla muestra los funcionarios con badges de color por rol
- [ ] El botón "Agregar funcionario" abre el dialog
- [ ] Puedo crear un funcionario nuevo
- [ ] Al seleccionar un rol con otro funcionario activo, aparece la advertencia
- [ ] Al activar un funcionario, el anterior del mismo rol se desactiva automáticamente
- [ ] Puedo editar un funcionario existente
- [ ] El AlertDialog aparece al desactivar un funcionario
- [ ] El seed cargó los datos con `pnpm db:seed`
- [ ] No hay errores de TypeScript

**Reportar**: Lista de archivos creados/modificados y confirmar.

---

# CHECKPOINT 3 — Módulo Catálogos

> **Objetivo**: CRUD de los 5 catálogos del sistema en una página con tabs.
> **Prerequisito**: Checkpoint 2 completado.

## Contexto de negocio

Los catálogos son listas de valores que otras entidades usan como referencia.
Se configuran al inicio. Todos comparten el mismo comportamiento:

- Se pueden crear, editar, activar/desactivar
- **No se eliminan si están en uso** (mostrar error específico)
- Solo los **activos** aparecen en los selectores de otros formularios

**Orden de llenado sugerido** (indicarlo en la UI):
Fuentes → Rubros → Tipos de Proceso → UNSPSC → Tipos de Documento

## 3.1 — Schemas Zod

Crear `schemas/catalogos.schema.ts` con un schema por catálogo:

```typescript
// FuenteSchema
codigo: string, máximo 20 chars, opcional, puede quedar vacío
nombre: string, mínimo 3 chars, requerido
// Mensaje error nombre: "El nombre debe tener al menos 3 caracteres"

// RubroSchema
codigo: string, requerido
  // Validar formato presupuestal colombiano
  // regex: /^\d+(\.\d+)*$/  (números separados por puntos)
  // mensaje: "Formato de código inválido (ej: 2.1.02.02.008.06)"
descripcion: string, mínimo 5 chars, requerido

// TipoProcesoSchema
nombre: string, mínimo 3 chars, requerido
naturaleza: string, opcional (ej: "Servicios", "Bienes", "Obra")

// CodigoUnspscSchema
codigo: string, requerido
  // Solo dígitos
  // regex: /^\d+$/
  // mensaje: "El código UNSPSC solo debe contener dígitos"
descripcion: string, mínimo 5 chars, requerido

// TipoDocumentoSchema
nombre: string, mínimo 3 chars, requerido
descripcion: string, opcional
categoria: enum 'PRECONTRACTUAL'|'CONTRACTUAL'|'EJECUCION'|'LIQUIDACION', requerido
// mensaje error categoria: "Selecciona una categoría"
```

## 3.2 — Server Actions

Crear `actions/catalogos.ts`.

Para **cada uno de los 5 catálogos** implementar las siguientes funciones.
Reemplazar `[Catalogo]` con el nombre específico:

### `get[Catalogo]s()`

```
Retorna todos los registros (activos e inactivos)
Ordenados por nombre
Usado en la página de gestión
```

### `get[Catalogo]sActivos()`

```
Retorna solo los registros con activo=true
Ordenados por nombre
Usado en selectores de otros formularios (CDPs, etc.)
```

### `create[Catalogo](data)`

```
Validar con schema Zod → retornar fieldErrors si falla
Verificar unicidad del código/nombre (según el catálogo):
  - Fuentes: unicidad por codigo (si se provee)
  - Rubros: unicidad por codigo
  - TiposProceso: unicidad por nombre
  - CodigosUnspsc: unicidad por codigo
  - TiposDocumento: unicidad por nombre
Si ya existe: retornar error "Ya existe un [catálogo] con ese [campo]"
Insertar el registro
revalidatePath('/catalogos')
Retorna: ActionResult<T>
Mensaje éxito: "Creado correctamente"
```

### `update[Catalogo](id: number, data)`

```
Validar con schema Zod
Verificar unicidad excluyendo el registro actual (WHERE id != id)
Actualizar
revalidatePath('/catalogos')
Retorna: ActionResult<T>
Mensaje éxito: "Actualizado correctamente"
```

### `toggle[Catalogo]Activo(id: number)`

```
Obtener registro actual
Cambiar activo al valor contrario
revalidatePath('/catalogos')
Retorna: ActionResult<void>
```

### `delete[Catalogo](id: number)`

```
Verificar si está en uso (hacer COUNT de las tablas que lo referencian):
  - Fuentes: verificar en cdp_rubros y rp_rubros
  - Rubros: verificar en cdp_rubros y rp_rubros
  - TiposProceso: verificar en procesos
  - CodigosUnspsc: verificar en proceso_unspsc
  - TiposDocumento: verificar en plantillas, checklist_items, anexos, etapas_cronograma

Si está en uso: retornar error sin eliminar
  Mensaje: "No se puede eliminar: este [catálogo] está siendo usado en [N] registro(s)"

Si no está en uso: eliminar
revalidatePath('/catalogos')
Retorna: ActionResult<void>
```

## 3.3 — Componentes

### `components/catalogos/CatalogoTable.tsx`

Componente **genérico reutilizable** para los 5 catálogos.

**Props**:

```typescript
interface CatalogoTableProps<T extends { id: number; activo: boolean }> {
  datos: T[];
  columnas: {
    key: keyof T;
    label: string;
    render?: (valor: any, fila: T) => React.ReactNode;
  }[];
  onEditar: (item: T) => void;
  onToggleActivo: (id: number) => void;
  onEliminar: (id: number) => void;
}
```

Renderiza:

- Tabla con las columnas definidas + columna "Estado" + columna "Acciones"
- Badge verde "Activo" / gris "Inactivo" en columna Estado
- Botones en columna Acciones: Editar (lápiz), Activar/Desactivar (ojo), Eliminar (basura)
- AlertDialog de confirmación antes de eliminar
- Mensaje de tabla vacía cuando no hay datos

### Formularios individuales (en Dialog):

**`FuenteFormDialog.tsx`**:

- Campos: `codigo` (opcional) + `nombre` (requerido)
- Layout: los dos campos en una columna

**`RubroFormDialog.tsx`**:

- Campos: `codigo` + `descripcion`
- Ayuda bajo el campo código: "Formato: 2.1.02.02.008.06"

**`TipoProcesoFormDialog.tsx`**:

- Campos: `nombre` + `naturaleza` (opcional)

**`CodigoUnspscFormDialog.tsx`**:

- Campos: `codigo` + `descripcion`
- Ayuda bajo el campo código: "Solo dígitos, ej: 72102700"

**`TipoDocumentoFormDialog.tsx`**:

- Campos: `nombre` + `categoria` (Select) + `descripcion` (Textarea, opcional)

Todos los formularios:

- Usan `react-hook-form` + `zodResolver`
- Precargran datos en modo edición
- Botones "Cancelar" y "Guardar" con loading state
- Toast de éxito/error al guardar

## 3.4 — Página

### `app/(dashboard)/catalogos/page.tsx`

**Tipo**: Server Component híbrido (carga datos, renderiza Client Component wrapper)

Usar `Tabs` de shadcn con estas 5 pestañas en este orden:

1. **Fuentes** — para catálogo de fuentes de financiamiento
2. **Rubros** — para rubros presupuestales
3. **Tipos de Proceso** — para tipos de contrato
4. **Códigos UNSPSC** — para clasificador de bienes
5. **Tipos de Documento** — para tipos de documentos del sistema

Cada pestaña tiene:

- Header con título descriptivo + botón "Agregar [nombre]"
- Tabla del catálogo con sus datos
- El formulario de creación/edición en un Dialog

**Cargar todos los datos en el Server Component** y pasarlos como props
para evitar múltiples requests al cambiar de pestaña.

Metadatos: `title: 'Catálogos — ContratoMate'`

## 3.5 — Seed de catálogos

En `db/seed.ts`, agregar función `seedCatalogos()`:

```
Fuentes:
  { codigo: 'SGP-GRATUIDAD', nombre: 'SGP - Gratuidad' }
  { codigo: 'SGP-CALIDAD', nombre: 'SGP - Calidad' }
  { codigo: 'REC-PROPIOS', nombre: 'Recursos Propios' }
  { codigo: 'SGP-ALIMENTACION', nombre: 'SGP - Alimentación Escolar' }
  { codigo: 'FONPET', nombre: 'FONPET' }

Rubros:
  { codigo: '2.1.02.02.008.06', descripcion: 'Servicio de Mantenimiento' }
  { codigo: '2.1.02.02.008.01', descripcion: 'Materiales y Suministros' }
  { codigo: '2.1.02.02.001.01', descripcion: 'Servicios Personales' }
  { codigo: '2.1.02.02.005.01', descripcion: 'Adquisición de Equipos' }

Tipos de Proceso:
  { nombre: 'PRESTACIÓN DE SERVICIOS', naturaleza: 'Servicios' }
  { nombre: 'COMPRAVENTA', naturaleza: 'Bienes' }
  { nombre: 'DE OBRA', naturaleza: 'Obra' }
  { nombre: 'SUMINISTRO', naturaleza: 'Bienes' }
  { nombre: 'ARRENDAMIENTO', naturaleza: 'Servicios' }
  { nombre: 'INTERADMINISTRATIVO', naturaleza: 'Servicios' }

Códigos UNSPSC:
  { codigo: '72102700', descripcion: 'Servicios de mantenimiento de edificios' }
  { codigo: '44121500', descripcion: 'Papel de impresión y escritura' }
  { codigo: '56101500', descripcion: 'Muebles y mobiliario escolar' }
  { codigo: '80101500', descripcion: 'Servicios de contabilidad' }
  { codigo: '43211500', descripcion: 'Equipos de cómputo' }

Tipos de Documento (con su categoría):
  { nombre: 'CDP', categoria: 'PRECONTRACTUAL', descripcion: 'Certificado de Disponibilidad Presupuestal' }
  { nombre: 'SOLICITUD DE COTIZACIÓN', categoria: 'PRECONTRACTUAL' }
  { nombre: 'COMPARATIVO DE PROPUESTAS', categoria: 'PRECONTRACTUAL' }
  { nombre: 'ESTUDIO PREVIO', categoria: 'PRECONTRACTUAL' }
  { nombre: 'REGISTRO PRESUPUESTAL', categoria: 'CONTRACTUAL' }
  { nombre: 'CONTRATO', categoria: 'CONTRACTUAL' }
  { nombre: 'ACTA DE INICIO', categoria: 'CONTRACTUAL' }
  { nombre: 'INFORME DE ACTIVIDADES', categoria: 'EJECUCION' }
  { nombre: 'ACTA DE SUPERVISIÓN', categoria: 'EJECUCION' }
  { nombre: 'ACTA DE RECIBO A SATISFACCIÓN', categoria: 'EJECUCION' }
  { nombre: 'FACTURA', categoria: 'EJECUCION' }
  { nombre: 'RESOLUCIÓN DE PAGO', categoria: 'LIQUIDACION' }
  { nombre: 'COMPROBANTE DE EGRESO', categoria: 'LIQUIDACION' }
  { nombre: 'ACTA DE LIQUIDACIÓN', categoria: 'LIQUIDACION' }
```

Todos usando `onConflictDoNothing()`.

Actualizar la función principal `seed()` para llamar en orden:

```typescript
async function seed() {
  await seedConfiguracion(); // del checkpoint 2
  await seedCatalogos(); // nuevo
  console.log("✅ Seed completado");
}
```

---

## ✅ CHECKPOINT 3 — Verificación

- [ ] La ruta `/catalogos` carga sin errores con las 5 tabs
- [ ] Puedo crear, editar en cada uno de los 5 catálogos
- [ ] El botón "Activar/Desactivar" cambia el estado correctamente
- [ ] Al intentar eliminar un catálogo en uso, aparece el mensaje de error específico
- [ ] Al intentar eliminar uno que no está en uso, se elimina correctamente
- [ ] Los 5 AlertDialogs de confirmación de eliminación funcionan
- [ ] Los mensajes de error de validación aparecen inline en los formularios
- [ ] El seed cargó todos los catálogos (`pnpm db:seed`)
- [ ] Los datos del seed se ven en las tablas
- [ ] No hay errores de TypeScript

**Reportar**: Lista de archivos creados/modificados. ¿Continuar con el módulo Contratistas?

---

# Fases Siguientes (documentos separados)

Una vez completados los 3 checkpoints de este documento, los siguientes
módulos se implementarán en documentos separados:

```
Documento 2: Módulo Contratistas
  - Formulario adaptativo Natural/Jurídica con discriminatedUnion Zod
  - Búsqueda para usar en selectores de RP y cotizaciones

Documento 3: Módulo CDP
  - Formulario con líneas de rubro dinámicas
  - Cálculo automático del valor total

Documento 4: Módulo Registro Presupuestal
  - RP atado al CDP con trazabilidad de rubros

Documento 5: Módulo Procesos
  - Creación desde RP
  - Cotizaciones, UNSPSC, estados

Documento 6: Cronograma y Expediente
  - Etapas, checklist, completitud

Documento 7: Plantillas y Generación de Documentos
  - Plantillas Word, variables, combinación de correspondencia
```

---

## Reglas Finales para el Agente

1. **El `agent.md` del proyecto tiene prioridad** sobre cualquier convención
   asumida. Si hay conflicto, seguir el `agent.md`.

2. **Sin `any` en TypeScript**. Todos los tipos deben ser explícitos o
   inferidos de Drizzle/Zod.

3. **El orden de implementación dentro de cada checkpoint**:
   Schema Zod → Server Actions → Componentes → Página → Seed

4. **Verificar compilación** con `npx tsc --noEmit` antes de declarar
   un checkpoint completo.

5. **Componentes en `components/`**, nunca en `app/`. Las páginas
   (`page.tsx`) son Server Components que importan componentes.

6. **Revalidar rutas** con `revalidatePath()` después de toda mutación.

7. **No usar `router.push()` para refrescar datos** — usar `revalidatePath`.

8. **El sidebar debe reflejar** si falta configurar la institución
   mostrando un indicador visual de alerta.
