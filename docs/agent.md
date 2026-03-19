# ContratoMate — Agent Context

## Descripción del Proyecto

**ContratoMate** es un sistema de gestión de contratos para la Institución
Educativa Dulce Nombre de Jesús (IEDNDJ), institución pública colombiana
(Planeta Rica, Córdoba). Gestiona el ciclo completo de contratación pública:
desde el CDP hasta la liquidación del contrato, incluyendo generación de
documentos Word y gestión del expediente digital.

**Usuario único:** Daniel Eduardo Trejos Montiel — Auxiliar Administrativo / Pagador.
**Despliegue:** Local (un solo equipo). **Sin autenticación. Sin multiusuario.**

---

## Stack Tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| Framework | Next.js (App Router) | 16 |
| Lenguaje | TypeScript | latest |
| ORM | Drizzle ORM | latest |
| Base de datos | SQLite (better-sqlite3) | latest |
| Validación | Zod + React Hook Form | latest |
| UI Components | shadcn/ui | latest |
| Estilos | Tailwind CSS | latest |
| Notificaciones | sonner | latest |
| Iconos | lucide-react | latest |
| Gestor de paquetes | pnpm | latest |

---

## Reglas de Arquitectura — Obligatorias

### 1. Sin carpeta `src/`
Todo en la raíz del proyecto. Nunca usar `src/`.

```typescript
// ✅ CORRECTO
import { db } from '@/db'
import { formatCOP } from '@/lib/format'

// ❌ INCORRECTO
import { db } from '@/src/db'
import { db } from '../../db'
```

### 2. App Router exclusivamente
- `page.tsx` = **Server Component** por defecto. Lee datos directamente de la DB.
- Formularios = **Client Components** (`'use client'`).
- Mutaciones = **Server Actions** en `actions/`.
- Route Handlers (`app/api/`) solo para: generación de archivos Word y descarga de archivos binarios.

### 3. Orden de imports — siempre respetar
```typescript
// 1. React / Next.js
import { useState } from 'react'
import { revalidatePath } from 'next/cache'

// 2. Drizzle ORM
import { db } from '@/db'
import { instituciones, funcionarios } from '@/db/schema'
import { eq, and, isNull } from 'drizzle-orm'

// 3. Utilidades
import { formatCOP, formatFecha } from '@/lib/format'
import { cn } from '@/lib/utils'

// 4. Componentes UI (shadcn)
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

// 5. Componentes del módulo
import InstitucionForm from '@/components/configuracion/InstitucionForm'

// 6. Tipos
import type { Institucion, Funcionario } from '@/db/schema'

// 7. Server Actions
import { upsertInstitucion } from '@/actions/instituciones'
```

### 4. Componentes en `components/`, nunca en `app/`
```
// ✅ CORRECTO
components/configuracion/InstitucionForm.tsx
components/catalogos/RubrosTable.tsx

// ❌ INCORRECTO
app/configuracion/InstitucionForm.tsx
app/(dashboard)/components/Header.tsx
```

### 5. Sin `any` en TypeScript
Todos los tipos deben ser explícitos o inferidos de Drizzle / Zod.

---

## Estructura de Carpetas

```
contratomate/
├── app/
│   ├── layout.tsx                    # Layout raíz con Toaster
│   ├── page.tsx                      # Redirect a dashboard
│   ├── globals.css
│   └── (dashboard)/                  # Route group — sidebar + header
│       ├── layout.tsx
│       ├── page.tsx                  # Dashboard con estadísticas
│       ├── configuracion/page.tsx    # Configuración de institución
│       ├── funcionarios/page.tsx     # CRUD funcionarios
│       ├── catalogos/page.tsx        # 5 catálogos en tabs
│       ├── contratistas/
│       │   ├── page.tsx
│       │   └── [id]/page.tsx
│       ├── cdps/
│       │   ├── page.tsx
│       │   └── [id]/page.tsx
│       ├── registros-presupuestales/
│       │   ├── page.tsx
│       │   └── [id]/page.tsx
│       ├── procesos/
│       │   ├── page.tsx
│       │   └── [id]/
│       │       ├── page.tsx
│       │       ├── cronograma/page.tsx
│       │       ├── cotizaciones/page.tsx
│       │       └── expediente/page.tsx
│       └── plantillas/
│           └── page.tsx
│
├── components/
│   ├── ui/                           # shadcn/ui — NO editar
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   ├── shared/                       # Componentes reutilizables
│   │   ├── DataTable.tsx
│   │   ├── ConfirmDialog.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── EmptyState.tsx
│   │   └── MoneyDisplay.tsx
│   ├── configuracion/
│   ├── catalogos/
│   ├── contratistas/
│   ├── cdps/
│   ├── procesos/
│   ├── cronograma/
│   ├── expediente/
│   └── plantillas/
│
├── db/
│   ├── index.ts                      # Singleton Drizzle
│   ├── schema.ts                     # Schema completo — NO modificar
│   ├── contra_mate.db                # Base de datos SQLite
│   ├── seed.ts                       # Datos iniciales
│   └── migrations/                   # Generado por drizzle-kit
│
├── lib/
│   ├── utils.ts                      # cn() y helpers generales
│   ├── format.ts                     # formatCOP, formatFecha, numeroALetras
│   └── constants.ts                  # Enums con labels para la UI
│
├── actions/                          # Server Actions por módulo
│   ├── instituciones.ts
│   ├── funcionarios.ts
│   ├── catalogos.ts
│   ├── contratistas.ts
│   ├── cdps.ts
│   ├── registros-presupuestales.ts
│   ├── procesos.ts
│   ├── cotizaciones.ts
│   ├── cronogramas.ts
│   ├── expedientes.ts
│   ├── documentos.ts
│   ├── anexos.ts
│   └── checklist.ts
│
├── schemas/                          # Zod schemas (validación de formularios)
│   ├── institucion.schema.ts
│   ├── funcionario.schema.ts
│   ├── catalogos.schema.ts
│   ├── contratista.schema.ts
│   ├── cdp.schema.ts
│   ├── registro-presupuestal.schema.ts
│   ├── proceso.schema.ts
│   └── documento.schema.ts
│
├── types/
│   └── index.ts                      # ActionResult<T> + re-exports de schema
│
├── hooks/
│   ├── useToast.ts
│   └── useDebounce.ts
│
├── contratomate.db                   # Base de datos SQLite
├── drizzle.config.ts
├── components.json                   # shadcn config
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Base de Datos

### Conexión — `db/index.ts`
```typescript
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'

const sqlite = new Database('contratomate.db')
export const db = drizzle(sqlite, { schema })
```

### Configuración — `drizzle.config.ts`
```typescript
import type { Config } from 'drizzle-kit'
import { loadEnvConfig } from "@next/env";

const projectDir = process.cwd();
loadEnvConfig(projectDir);


export default {
  schema: './db/schema.ts',
  out: './db/migrations',
  dialect: 'sqlite',
  dbCredentials: { 
    url: process.env.DATABASE_URL!,
   },
} satisfies Config
```

### Scripts de BD en `package.json`
```json
{
  "db:generate": "drizzle-kit generate",
  "db:migrate": "drizzle-kit migrate",
  "db:studio": "drizzle-kit studio",
  "db:seed": "npx tsx db/seed.ts"
}
```

### Queries con Drizzle — Patrones
```typescript
// SELECT simple
const all = await db.select().from(instituciones)

// SELECT con WHERE
const activos = await db.select().from(funcionarios)
  .where(eq(funcionarios.activo, true))

// SELECT con JOIN
const procesosConRp = await db
  .select()
  .from(procesos)
  .leftJoin(registrosPresupuestales, eq(procesos.rpId, registrosPresupuestales.id))
  .leftJoin(cdps, eq(registrosPresupuestales.cdpId, cdps.id))

// findFirst (con relations)
const institucion = await db.query.instituciones.findFirst()

// INSERT
await db.insert(funcionarios).values(data)

// UPDATE
await db.update(funcionarios)
  .set({ activo: false })
  .where(eq(funcionarios.id, id))

// Soft delete (preferido sobre DELETE)
await db.update(rubros).set({ activo: false }).where(eq(rubros.id, id))
```

### Tablas del schema (resumen)

```
CONFIGURACIÓN:    instituciones, funcionarios
CATÁLOGOS:        fuentes, rubros, tipos_proceso, codigos_unspsc, tipos_documento
CONTRATISTAS:     contratistas
PRESUPUESTO:      cdps, cdp_rubros, registros_presupuestales, rp_rubros
PROCESO:          procesos, proceso_unspsc, cotizaciones
CRONOGRAMA:       cronogramas, etapas_cronograma
EXPEDIENTE:       expedientes, documentos_generados, documento_variables,
                  anexos, checklist_items, checklist_verificaciones
PLANTILLAS:       plantillas, variables, plantilla_variables
```

**El archivo `db/schema.ts` está completo y NO debe modificarse.**

---

## Server Actions — Patrón Estándar

### Tipo de retorno — definir en `types/index.ts`
```typescript
export type ActionResult<T = void> =
  | { success: true; data: T; message: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }
```

### Estructura de una Server Action
```typescript
// actions/instituciones.ts
'use server'

import { db } from '@/db'
import { instituciones } from '@/db/schema'
import { revalidatePath } from 'next/cache'
import { institucionSchema } from '@/schemas/institucion.schema'
import type { ActionResult } from '@/types'
import type { Institucion } from '@/db/schema'

export async function upsertInstitucion(
  formData: unknown
): Promise<ActionResult<Institucion>> {
  // 1. Validar
  const parsed = institucionSchema.safeParse(formData)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Datos inválidos',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  try {
    // 2. Lógica de negocio
    const existing = await db.query.instituciones.findFirst()
    let result: Institucion

    if (existing) {
      const [updated] = await db
        .update(instituciones)
        .set({ ...parsed.data, updatedAt: new Date().toISOString() })
        .where(eq(instituciones.id, existing.id))
        .returning()
      result = updated
    } else {
      const [created] = await db
        .insert(instituciones)
        .values(parsed.data)
        .returning()
      result = created
    }

    // 3. Revalidar
    revalidatePath('/configuracion')

    // 4. Retornar éxito
    return { success: true, data: result, message: 'Institución guardada correctamente' }
  } catch (error) {
    return { success: false, error: 'Error al guardar. Intenta de nuevo.' }
  }
}
```

### Uso en Client Component (con react-hook-form)
```typescript
'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { upsertInstitucion } from '@/actions/instituciones'
import { institucionSchema, type InstitucionFormData } from '@/schemas/institucion.schema'

export default function InstitucionForm({ institucion }: { institucion: Institucion | null }) {
  const form = useForm<InstitucionFormData>({
    resolver: zodResolver(institucionSchema),
    defaultValues: institucion ?? {},
  })

  async function onSubmit(data: InstitucionFormData) {
    const result = await upsertInstitucion(data)
    if (result.success) {
      toast.success(result.message)
    } else {
      if (result.fieldErrors) {
        // Setear errores en los campos
        Object.entries(result.fieldErrors).forEach(([field, errors]) => {
          form.setError(field as any, { message: errors[0] })
        })
      }
      toast.error(result.error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* campos */}
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Guardando...' : 'Guardar'}
        </Button>
      </form>
    </Form>
  )
}
```

---

## Feedback al Usuario

| Situación | Componente | Ejemplo |
|---|---|---|
| Operación exitosa | `toast.success()` de sonner | "Institución guardada correctamente" |
| Error de servidor | `toast.error()` de sonner | "Error al guardar. Intenta de nuevo." |
| Error de validación | `FormMessage` bajo el campo | "El NIT tiene un formato inválido" |
| Confirmación destructiva | `AlertDialog` de shadcn | Antes de eliminar o desactivar |
| Estado de carga | Botón deshabilitado + texto | "Guardando..." |

---

## Formateo de Datos — `lib/format.ts`

```typescript
// Moneda colombiana: 7261667 → "$ 7.261.667,00"
export function formatCOP(valor: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 2,
  }).format(valor)
}

// Fecha corta: "2026-02-16" → "16/02/2026"
export function formatFecha(fecha: string): string {
  const [year, month, day] = fecha.split('-')
  return `${day}/${month}/${year}`
}

// Fecha larga: "2026-02-16" → "16 de febrero de 2026"
export function formatFechaLarga(fecha: string): string {
  return new Date(fecha + 'T12:00:00').toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// Número a letras: 7261667 → "SIETE MILLONES DOSCIENTOS SESENTA Y UN MIL..."
// (implementar con librería o algoritmo propio — necesario para documentos)
export function numeroALetras(valor: number): string { /* ... */ }
```

---

## Constantes UI — `lib/constants.ts`

```typescript
export const ROLES_FUNCIONARIO = [
  { value: 'RECTOR', label: 'Rector' },
  { value: 'PAGADOR', label: 'Pagador / Auxiliar Administrativo' },
  { value: 'CONTADOR', label: 'Contador' },
  { value: 'SUPERVISOR', label: 'Supervisor' },
] as const

export const ESTADOS_PROCESO = [
  { value: 'BORRADOR', label: 'Borrador', color: 'gray' },
  { value: 'ACTIVO', label: 'Activo', color: 'green' },
  { value: 'SUSPENDIDO', label: 'Suspendido', color: 'yellow' },
  { value: 'LIQUIDADO', label: 'Liquidado', color: 'blue' },
  { value: 'ANULADO', label: 'Anulado', color: 'red' },
] as const

export const TIPOS_IDENTIFICACION = [
  { value: 'CC', label: 'Cédula de Ciudadanía' },
  { value: 'NIT', label: 'NIT' },
  { value: 'CE', label: 'Cédula de Extranjería' },
  { value: 'PASAPORTE', label: 'Pasaporte' },
] as const

export const TIPOS_PERSONA = [
  { value: 'NATURAL', label: 'Persona Natural' },
  { value: 'JURIDICA', label: 'Persona Jurídica' },
] as const

export const REGIMENES_IVA = [
  { value: 'RESPONSABLE_IVA', label: 'Responsable de IVA' },
  { value: 'NO_RESPONSABLE_IVA', label: 'No Responsable de IVA' },
] as const

export const CATEGORIAS_DOCUMENTO = [
  { value: 'PRECONTRACTUAL', label: 'Precontractual' },
  { value: 'CONTRACTUAL', label: 'Contractual' },
  { value: 'EJECUCION', label: 'Ejecución' },
  { value: 'LIQUIDACION', label: 'Liquidación' },
] as const
```

---

## Server Components — Patrón de Página

```typescript
// app/(dashboard)/configuracion/page.tsx
import { getInstitucion } from '@/actions/instituciones'
import InstitucionForm from '@/components/configuracion/InstitucionForm'
import { PageHeader } from '@/components/layout/PageHeader'

export const metadata = { title: 'Configuración — ContratoMate' }

export default async function ConfiguracionPage() {
  const institucion = await getInstitucion()

  return (
    <div>
      <PageHeader
        titulo="Configuración de la Institución"
        descripcion="Datos del colegio usados en todos los documentos"
      />
      <InstitucionForm institucion={institucion} />
    </div>
  )
}
```

---

## Reglas de Negocio Clave

### Cadena presupuestal
```
CDP → RegistroPresupuestal (RP) → Proceso
  - valor_rp <= valor_cdp (por línea de rubro)
  - 1 CDP = 1 RP = 1 Proceso (relaciones 1:1)
  - Objeto del contrato vive en CDP y se hereda (no se duplica)
  - Contratista y valor total se acceden via RP, no se duplican en Proceso
```

### IVA en el proceso
```
- tiene_iva: boolean (el usuario decide manualmente)
- valor_iva: monto en pesos ingresado manualmente (no calculado)
- Depende del tipo de contratista y el contrato específico
```

### Funcionario activo por rol
```
- Solo 1 funcionario activo por rol (RECTOR, PAGADOR, CONTADOR, SUPERVISOR)
- Al activar uno, el anterior del mismo rol se desactiva automáticamente
- Los documentos generados usan siempre el funcionario activo al momento
```

### Expediente y completitud
```
- completitud = COUNT(checklist_verificaciones WHERE completado=true) / COUNT(*) * 100
- Se recalcula cada vez que se sube un anexo o se marca un ítem
- Para archivar: completitud debe ser 100%
```

### Cotizaciones
```
- Típicamente 3 cotizaciones por proceso (mínima cuantía)
- Solo se captura: proponente + valor total (sin detalle de artículos)
- Una sola puede marcarse como seleccionada (ganadora)
```

### Códigos UNSPSC
```

- Relación N:M con procesos via tabla proceso_unspsc
```

---

## Navegación del Sidebar

```
⚙️  Configuración
    ├── Institución              /configuracion
    ├── Funcionarios             /funcionarios
    └── Catálogos                /catalogos

👥  Contratistas                 /contratistas

💰  Presupuesto
    ├── CDPs                     /cdps
    └── Registros Presupuestales /registros-presupuestales

📋  Procesos                     /procesos

📁  Plantillas                   /plantillas
```

**Comportamiento especial del sidebar:**
- Resaltar ítem activo con `usePathname()`
- Mostrar ⚠️ junto a "Institución" si no existe registro configurado

---

## Documentos que Genera el Sistema

Los documentos se generan en Word (.docx) usando plantillas con variables
en formato `{{nombre_variable}}`. Cada variable mapea a una tabla/columna
de la BD definida en la tabla `variables`.

Ejemplos de variables:
```
{{nombre_institucion}}      → instituciones.nombre
{{nit_institucion}}         → instituciones.nit
{{nombre_rector}}           → funcionarios.nombre_completo (WHERE rol='RECTOR' AND activo=true)
{{numero_cdp}}              → cdps.numero_cdp
{{objeto_contrato}}         → cdps.objeto
{{valor_total_rp}}          → registros_presupuestales.valor_total
{{nombre_contratista}}      → contratistas.nombre_razon_social
{{fecha_inicio}}            → procesos.fecha_inicio
```

Documentos del proceso (por fase):
```
PRECONTRACTUAL: CDP, Solicitud de Cotización, Comparativo de Propuestas, Estudio Previo
CONTRACTUAL:    Registro Presupuestal, Contrato, Acta de Inicio
EJECUCIÓN:      Informe de Actividades, Acta de Supervisión, Acta de Recibo, Factura
LIQUIDACIÓN:    Resolución de Pago, Comprobante de Egreso, Acta de Liquidación
```

---

## Datos de la Institución (IEDNDJ)

```
Nombre:       Institución Educativa Dulce Nombre de Jesús
Siglas:       IEDNDJ
NIT:          823001921-9
Municipio:    Sincelejo
Departamento: Sucre
Rector:       Jaider Andrés Suárez Vergara
Pagador:      Daniel Eduardo Trejos Montiel (Auxiliar Administrativo)
```

---

## Errores Comunes — Evitar

```typescript
// ❌ Usar src/ en los paths
import { db } from '@/src/db'

// ❌ Poner componentes dentro de app/
app/(dashboard)/configuracion/InstitucionForm.tsx

// ❌ Hardcodear colores
<div style={{ color: '#1D3557' }}>

// ❌ Usar any en TypeScript
const data: any = formData

// ❌ Olvidar revalidatePath después de mutaciones
await db.insert(rubros).values(data)
// falta: revalidatePath('/catalogos')

// ❌ Leer datos en Client Components directamente
'use client'
const data = await db.select().from(rubros) // ❌ No funciona en client

// ❌ Duplicar datos derivables
// valor_total y objeto YA están en CDP — no repetirlos en procesos

// ❌ Usar router.push() para refrescar datos
router.push('/catalogos') // usar revalidatePath en su lugar
```

---

## Comandos de Desarrollo

```bash
pnpm dev                    # Servidor de desarrollo
pnpm build                  # Build de producción
pnpm db:generate            # Generar migraciones (drizzle-kit)
pnpm db:migrate             # Aplicar migraciones
pnpm db:studio              # UI visual de la BD
pnpm db:seed                # Cargar datos iniciales
npx tsc --noEmit            # Verificar TypeScript sin compilar
```

---

## MCPs Disponibles

| MCP | Uso en el proyecto |
|---|---|
| **Context7** | Buscar documentación actualizada de Next.js, Drizzle, shadcn |
| **Figma** | Wireframes y diseño de interfaces |
| **Excalidraw** | Diagramas rápidos de flujo |
| **draw.io** | Diagramas de base de datos |

---

## Estado del Proyecto

### ✅ Completado
- Análisis del flujo de trabajo real
- Documento Visión, Casos de Uso, Plan de Implementación
- Modelado completo: conceptual, lógico y físico
- Estructura de carpetas definida
- Documento de implementación gradual (Checkpoints 0-3)

### 🔄 En progreso
- Implementación por checkpoints graduales

### 📋 Orden de implementación
```
CP 0: Setup (dependencias, Drizzle, shadcn, layout)
CP 1: Módulo Institución
CP 2: Módulo Funcionarios
CP 3: Módulo Catálogos
CP 4: Módulo Contratistas
CP 5: Módulo CDP
CP 6: Módulo Registro Presupuestal
CP 7: Módulo Procesos
CP 8: Cronograma y Expediente
CP 9: Plantillas y Generación de Documentos
```

El documento de implementación detallado está en:
`IMPLEMENTACION_FASE_0_3.md` (checkpoints 0 al 3)
