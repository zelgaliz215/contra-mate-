# ContratoMate — Implementación Checkpoints 8 al 10
## Cronograma · Plantillas y Variables · Expediente · Generación de Documentos Word

> **Prerequisito**: Los Checkpoints 0 al 7 deben estar completados y
> verificados antes de iniciar este documento.
>
> **Instrucciones para el agente**: Lee este documento completo antes de
> escribir código. Estos son los módulos más complejos del sistema.
> El Checkpoint 10 requiere un Route Handler especial para la generación
> de archivos Word — no es una Server Action estándar.

---

## Contexto acumulado

Al llegar aquí ya existen:
- Layout, tipos, utils, constantes
- Módulos Configuración, Catálogos, Contratistas funcionando
- Módulo Presupuesto (CDP + RP) funcionando
- Módulo Proceso con sus 4 tabs (Cronograma y Expediente con placeholder)
- Al crear un proceso se crearon automáticamente: `cronograma` vacío y `expediente` vacío

Los módulos de este documento **completan** los tabs pendientes del proceso.

---

# CHECKPOINT 8 — Módulo Cronograma

> **Objetivo**: Tabla editable de etapas del cronograma con fechas de
> planeación. Las etapas se crean, editan y reordenan inline.
> **Tiempo estimado**: 1 día
> **Dependencias**: CP 7 (proceso creado con su cronograma vacío)

## Contexto de negocio

El cronograma es la planificación temporal del proceso. Sus fechas son
de **planeación** — no deben confundirse con las fechas reales del proceso
(firma, inicio, terminación) que viven en la tabla `procesos`.

El cronograma se crea vacío cuando nace el proceso. El usuario lo llena
con las etapas que aplican a su proceso específico. Las etapas tienen un
campo `orden` para controlar el ordenamiento visual.

Las etapas típicas de un proceso de mínima cuantía:
1. Elaboración de estudios previos
2. Publicación en SECOP
3. Solicitud de cotizaciones
4. Recepción y evaluación de propuestas
5. Firma del contrato
6. Inicio del contrato
7. Entrega de productos / servicios
8. Acta de recibo a satisfacción
9. Liquidación del contrato

## 8.1 — Server Actions

Crear `actions/cronogramas.ts`:

### `getCronogramaByProceso(procesoId: number)`
```
- Cronograma con sus etapas ordenadas por campo 'orden'
- Incluye datos del tipo de documento si está asociado
- Retorna: CronogramaConEtapas | null
```

### `createEtapa(data: EtapaFormData)`
```
- Validar con Zod
- El campo orden = MAX(orden WHERE cronograma_id = X) + 1
  (siempre se agrega al final)
- Insertar en etapas_cronograma
- revalidatePath('/procesos/[id]')
- Retorna: ActionResult<EtapaCronograma>
```

### `updateEtapa(id: number, data: EtapaFormData)`
```
- Actualizar la etapa
- revalidatePath('/procesos/[id]')
- Retorna: ActionResult<EtapaCronograma>
```

### `toggleEtapaCompletada(id: number)`
```
- Cambiar completada al valor contrario
- revalidatePath('/procesos/[id]')
- Retorna: ActionResult<void>
```

### `deleteEtapa(id: number)`
```
- Eliminar la etapa
- Reordenar: UPDATE orden de las etapas siguientes (decrementar en 1)
- revalidatePath('/procesos/[id]')
- Retorna: ActionResult<void>
```

### `reordenarEtapas(cronogramaId: number, ordenIds: number[])`
```
- Recibe array de IDs en el nuevo orden deseado
- UPDATE bulk: cada id recibe su nuevo valor de orden (índice + 1)
- revalidatePath('/procesos/[id]')
- Retorna: ActionResult<void>
```

## 8.2 — Schema Zod

En `schemas/cronograma.schema.ts`:

```typescript
export const etapaSchema = z.object({
  cronogramaId: z.number(),
  nombreEtapa: z.string().min(3, 'Mínimo 3 caracteres'),
  tipoDocumentoId: z.number().optional().nullable(),
  fechaInicio: z.string().optional().nullable(),
  fechaFin: z.string().optional().nullable(),
  horaInicio: z.string().optional().nullable(),
})
// Refinamiento: si fechaFin existe, debe ser >= fechaInicio
.superRefine((data, ctx) => {
  if (data.fechaInicio && data.fechaFin && data.fechaFin < data.fechaInicio) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'La fecha de fin no puede ser anterior a la fecha de inicio',
      path: ['fechaFin'],
    })
  }
})
```

## 8.3 — Componentes

### `components/cronograma/CronogramaTable.tsx`
**Client Component**

Tabla con columnas: # Orden, Nombre etapa, Tipo documento, Fecha inicio,
Fecha fin, Hora, Completada (checkbox), Acciones (editar, eliminar).

Comportamiento:
- Botón "+ Etapa" agrega una nueva etapa al final
- Las etapas completadas se muestran con fondo verde claro y tachado suave
- Botones de reordenamiento (↑ ↓) o drag & drop (si se implementa)
- Banner informativo al pie:
  "Las fechas aquí son de planeación. Las fechas reales se registran en el Tab General."

### `components/cronograma/EtapaFormDialog.tsx`
**Client Component** — Dialog para crear/editar etapa

Campos:
- Nombre de la etapa (Input)
- Tipo de documento asociado (Select, opcional — carga tipos del catálogo)
- Fecha de inicio (Input date)
- Fecha de fin (Input date)
- Hora de inicio (Input time, opcional)

## 8.4 — Integración en proceso

### `app/(dashboard)/procesos/[id]/page.tsx`
Reemplazar el placeholder del Tab Cronograma:

```typescript
// Cargar datos del cronograma en el Server Component
const cronograma = await getCronogramaByProceso(procesoId)
const tiposDocumento = await getTiposDocumentoActivos()

// En el TabsContent del cronograma:
<CronogramaTable
  cronograma={cronograma}
  tiposDocumento={tiposDocumento}
/>
```

---

## ✅ CHECKPOINT 8 — Verificación

- [ ] El tab Cronograma muestra la tabla de etapas
- [ ] Puedo agregar nuevas etapas con el formulario
- [ ] Puedo editar una etapa existente
- [ ] Puedo marcar etapas como completadas (checkbox)
- [ ] Las etapas completadas tienen estilo visual diferente
- [ ] Puedo eliminar etapas (con confirmación)
- [ ] La advertencia sobre fechas de planeación vs reales es visible
- [ ] Fechas con fin < inicio muestran error inline
- [ ] No hay errores de TypeScript

---

# CHECKPOINT 9 — Módulo Plantillas y Variables

> **Objetivo**: Gestión de plantillas Word, mapeo de variables del sistema,
> y seed completo de variables precargadas.
> **Tiempo estimado**: 1.5 días
> **Dependencias**: CP 3 (tipos de documento del catálogo)

## Contexto de negocio

El sistema de documentos tiene tres capas:
1. **Variable**: catálogo global que mapea `{{nombre}}` → tabla.columna en la BD
2. **Plantilla**: archivo `.docx` que usa variables en formato `{{nombre_variable}}`
3. **PlantillaVariable**: declara qué variables necesita cada plantilla (obligatorias/opcionales)

Las variables del sistema se cargan con el seed — el usuario no necesita
crearlas. Las plantillas son archivos Word que el usuario sube y configura.

## 9.1 — Server Actions

Crear `actions/plantillas.ts`:

### `getPlantillas()`
```
- Lista todas las plantillas agrupadas por tipo de documento
- Incluye el conteo de variables configuradas
- Retorna: PlantillaConVariables[]
```

### `getPlantillaById(id: number)`
```
- Plantilla con sus variables mapeadas (JOIN plantilla_variables → variables)
- Retorna: PlantillaDetalle | null
```

### `createPlantilla(data: PlantillaFormData, archivo: File)`
```
- Validar form data con Zod
- Guardar el archivo .docx en /plantillas/{tipo_documento}/{nombre_archivo}
- Insertar en plantillas con ruta del archivo
- revalidatePath('/plantillas')
- Retorna: ActionResult<Plantilla>
```

### `updatePlantillaVariables(plantillaId: number, variables: PlantillaVariableData[])`
```
- DELETE FROM plantilla_variables WHERE plantilla_id = plantillaId
- INSERT nuevas plantilla_variables
- revalidatePath('/plantillas')
- Retorna: ActionResult<void>
- Mensaje éxito: "Variables de la plantilla actualizadas"
```

### `getVariables()`
```
- Lista todas las variables del catálogo global
- Ordenadas por entidad_origen, luego campo_origen
- Retorna: Variable[]
```

### `togglePlantillaActiva(id: number)`
```
- Cambiar campo activo
- revalidatePath('/plantillas')
- Retorna: ActionResult<void>
```

## 9.2 — Schema Zod

En `schemas/documento.schema.ts`:

```typescript
export const plantillaSchema = z.object({
  tipoDocumentoId: z.number({ required_error: 'Selecciona el tipo de documento' }),
  nombre: z.string().min(3, 'Mínimo 3 caracteres'),
  version: z.string().default('1.0'),
})

export const plantillaVariableSchema = z.object({
  variableId: z.number(),
  obligatoria: z.boolean().default(true),
})
```

## 9.3 — Seed de variables

En `db/seed.ts`, crear `seedVariables()` con al menos estas variables:

```typescript
const variables = [
  // Institución
  { nombreVariable: '{{nombre_institucion}}', descripcion: 'Nombre de la institución', entidadOrigen: 'instituciones', campoOrigen: 'nombre', tipoDato: 'TEXTO' },
  { nombreVariable: '{{siglas_institucion}}', descripcion: 'Siglas de la institución', entidadOrigen: 'instituciones', campoOrigen: 'siglas', tipoDato: 'TEXTO' },
  { nombreVariable: '{{nit_institucion}}', descripcion: 'NIT de la institución', entidadOrigen: 'instituciones', campoOrigen: 'nit', tipoDato: 'TEXTO' },
  { nombreVariable: '{{municipio_institucion}}', descripcion: 'Municipio', entidadOrigen: 'instituciones', campoOrigen: 'municipio', tipoDato: 'TEXTO' },

  // Funcionarios (activo por rol)
  { nombreVariable: '{{nombre_rector}}', descripcion: 'Nombre del rector activo', entidadOrigen: 'funcionarios', campoOrigen: 'nombre_completo_rector', tipoDato: 'TEXTO' },
  { nombreVariable: '{{id_rector}}', descripcion: 'Número de identificación del rector', entidadOrigen: 'funcionarios', campoOrigen: 'numero_identificacion_rector', tipoDato: 'TEXTO' },
  { nombreVariable: '{{nombre_pagador}}', descripcion: 'Nombre del pagador activo', entidadOrigen: 'funcionarios', campoOrigen: 'nombre_completo_pagador', tipoDato: 'TEXTO' },
  { nombreVariable: '{{cargo_pagador}}', descripcion: 'Cargo oficial del pagador', entidadOrigen: 'funcionarios', campoOrigen: 'cargo_oficial_pagador', tipoDato: 'TEXTO' },
  { nombreVariable: '{{nombre_contador}}', descripcion: 'Nombre del contador activo', entidadOrigen: 'funcionarios', campoOrigen: 'nombre_completo_contador', tipoDato: 'TEXTO' },
  { nombreVariable: '{{nombre_supervisor}}', descripcion: 'Nombre del supervisor activo', entidadOrigen: 'funcionarios', campoOrigen: 'nombre_completo_supervisor', tipoDato: 'TEXTO' },

  // CDP
  { nombreVariable: '{{numero_cdp}}', descripcion: 'Número del CDP', entidadOrigen: 'cdps', campoOrigen: 'numero_cdp', tipoDato: 'TEXTO' },
  { nombreVariable: '{{fecha_expedicion_cdp}}', descripcion: 'Fecha de expedición del CDP', entidadOrigen: 'cdps', campoOrigen: 'fecha_expedicion', tipoDato: 'FECHA', formato: 'dd/MM/yyyy' },
  { nombreVariable: '{{objeto_contrato}}', descripcion: 'Objeto del gasto', entidadOrigen: 'cdps', campoOrigen: 'objeto', tipoDato: 'TEXTO' },
  { nombreVariable: '{{valor_total_cdp}}', descripcion: 'Valor total del CDP', entidadOrigen: 'cdps', campoOrigen: 'valor_total', tipoDato: 'MONEDA', formato: '$ #,##0.00' },
  { nombreVariable: '{{valor_total_cdp_letras}}', descripcion: 'Valor total CDP en letras', entidadOrigen: 'cdps', campoOrigen: 'valor_total_letras', tipoDato: 'TEXTO' },
  { nombreVariable: '{{vigencia_cdp}}', descripcion: 'Vigencia del CDP', entidadOrigen: 'cdps', campoOrigen: 'vigencia', tipoDato: 'NUMERO' },

  // Registro Presupuestal
  { nombreVariable: '{{numero_rp}}', descripcion: 'Número del RP', entidadOrigen: 'registros_presupuestales', campoOrigen: 'numero_rp', tipoDato: 'TEXTO' },
  { nombreVariable: '{{fecha_expedicion_rp}}', descripcion: 'Fecha de expedición del RP', entidadOrigen: 'registros_presupuestales', campoOrigen: 'fecha_expedicion', tipoDato: 'FECHA', formato: 'dd/MM/yyyy' },
  { nombreVariable: '{{valor_total_rp}}', descripcion: 'Valor total comprometido en el RP', entidadOrigen: 'registros_presupuestales', campoOrigen: 'valor_total', tipoDato: 'MONEDA', formato: '$ #,##0.00' },
  { nombreVariable: '{{valor_total_rp_letras}}', descripcion: 'Valor RP en letras', entidadOrigen: 'registros_presupuestales', campoOrigen: 'valor_total_letras', tipoDato: 'TEXTO' },

  // Contratista
  { nombreVariable: '{{nombre_contratista}}', descripcion: 'Nombre o razón social del contratista', entidadOrigen: 'contratistas', campoOrigen: 'nombre_display', tipoDato: 'TEXTO' },
  { nombreVariable: '{{tipo_id_contratista}}', descripcion: 'Tipo de identificación del contratista', entidadOrigen: 'contratistas', campoOrigen: 'tipo_identificacion', tipoDato: 'TEXTO' },
  { nombreVariable: '{{id_contratista}}', descripcion: 'Número de identificación del contratista', entidadOrigen: 'contratistas', campoOrigen: 'numero_identificacion', tipoDato: 'TEXTO' },
  { nombreVariable: '{{banco_contratista}}', descripcion: 'Banco del contratista', entidadOrigen: 'contratistas', campoOrigen: 'banco', tipoDato: 'TEXTO' },
  { nombreVariable: '{{cuenta_contratista}}', descripcion: 'Número de cuenta del contratista', entidadOrigen: 'contratistas', campoOrigen: 'numero_cuenta', tipoDato: 'TEXTO' },
  { nombreVariable: '{{tipo_cuenta_contratista}}', descripcion: 'Tipo de cuenta (Ahorros/Corriente)', entidadOrigen: 'contratistas', campoOrigen: 'tipo_cuenta', tipoDato: 'TEXTO' },

  // Proceso
  { nombreVariable: '{{codigo_proceso}}', descripcion: 'Código del proceso', entidadOrigen: 'procesos', campoOrigen: 'codigo', tipoDato: 'TEXTO' },
  { nombreVariable: '{{fecha_firma}}', descripcion: 'Fecha de firma del contrato', entidadOrigen: 'procesos', campoOrigen: 'fecha_firma', tipoDato: 'FECHA', formato: 'dd/MM/yyyy' },
  { nombreVariable: '{{fecha_inicio}}', descripcion: 'Fecha de inicio del contrato', entidadOrigen: 'procesos', campoOrigen: 'fecha_inicio', tipoDato: 'FECHA', formato: 'dd/MM/yyyy' },
  { nombreVariable: '{{plazo_contrato}}', descripcion: 'Plazo del contrato', entidadOrigen: 'procesos', campoOrigen: 'plazo', tipoDato: 'TEXTO' },
  { nombreVariable: '{{valor_iva}}', descripcion: 'Valor del IVA si aplica', entidadOrigen: 'procesos', campoOrigen: 'valor_iva', tipoDato: 'MONEDA', formato: '$ #,##0.00' },
  { nombreVariable: '{{fecha_acta_terminacion}}', descripcion: 'Fecha del acta de terminación', entidadOrigen: 'procesos', campoOrigen: 'fecha_acta_terminacion', tipoDato: 'FECHA', formato: 'dd/MM/yyyy' },
]
```

También crear `seedChecklistItems()` con los ítems del checklist global.

## 9.4 — Componentes

### `components/plantillas/PlantillasGrid.tsx`
**Client Component** — grilla de cards por categoría

Tabs por categoría: Precontractual | Contractual | Ejecución | Liquidación

Cada card muestra:
- Ícono de documento
- Nombre de la plantilla
- Versión + estado (activa/inactiva)
- Número de variables configuradas
- Botones: "Ver variables" (abre Sheet) + "Actualizar archivo" (input file)
- Si no hay plantilla para ese tipo: card con botón "Cargar plantilla"

### `components/plantillas/VariablesMapper.tsx`
**Client Component** — Sheet lateral para configurar variables de una plantilla

Tabla de variables ya configuradas:
- Variable (`{{nombre}}`), Entidad origen, Campo origen, Obligatoria (Switch), Quitar

Sección para agregar nuevas variables:
- Selector de variables del catálogo global (Command/Combobox)
- Al seleccionar: muestra entidad y campo de donde viene
- Switch "Obligatoria"
- Botón "+ Agregar variable"

## 9.5 — Páginas

### `app/(dashboard)/plantillas/page.tsx`
**Server Component**

```typescript
const plantillas = await getPlantillas()
const tiposDocumento = await getTiposDocumentoActivos()
const variables = await getVariables()
```

---

## ✅ CHECKPOINT 9 — Verificación

- [ ] La página `/plantillas` muestra las tabs por categoría
- [ ] Las cards de plantillas muestran nombre, versión y número de variables
- [ ] El Sheet de variables permite ver y configurar el mapeo
- [ ] Se pueden agregar y quitar variables de una plantilla
- [ ] El seed de variables cargó todas las variables del sistema (`pnpm db:seed`)
- [ ] El seed de checklist_items cargó los ítems requeridos
- [ ] No hay errores de TypeScript

---

# CHECKPOINT 10 — Expediente y Generación de Documentos Word

> **Objetivo**: Expediente digital completo con documentos generados,
> subida de anexos y checklist de completitud. Generación de archivos
> Word mediante reemplazo de variables en plantillas `.docx`.
> **Tiempo estimado**: 3 días
> **Dependencias**: CP 7 (proceso + expediente vacío), CP 9 (plantillas + variables)

## Contexto de negocio

El expediente es la carpeta digital del contrato. Se crea vacío al nacer
el proceso. Se va llenando con:
1. **Documentos generados**: el sistema llena las variables en el Word y lo guarda
2. **Anexos**: el usuario sube archivos externos (documentos firmados, facturas, etc.)
3. **Checklist**: verifica que todos los documentos requeridos estén presentes

La **completitud** se calcula: `ítems completados / total ítems × 100`.
Se actualiza automáticamente al marcar ítems o subir anexos.

## 10.1 — Librería para generación Word

Instalar la librería para manipular archivos `.docx`:
```bash
pnpm add docxtemplater pizzip
pnpm add -D @types/pizzip
```

**Cómo funciona `docxtemplater`**:
- Lee el archivo `.docx` como un zip (usando `pizzip`)
- Reemplaza los marcadores `{{variable}}` por los valores reales
- Produce un nuevo `.docx` con los valores insertados

## 10.2 — Lógica de resolución de variables

Crear `lib/variables-resolver.ts`:

```typescript
// Resuelve el valor de cada variable leyendo la BD según
// entidad_origen y campo_origen de la variable

export async function resolverVariables(
  procesoId: number,
  variables: Variable[]
): Promise<Record<string, string>> {
  // 1. Cargar todos los datos necesarios una sola vez
  const proceso = await getProcesoDetalle(procesoId)
  // proceso incluye: rp → cdp, contratista, fechas

  const institucion = await getInstitucion()
  const rector = await getFuncionarioActivoPorRol('RECTOR')
  const pagador = await getFuncionarioActivoPorRol('PAGADOR')
  const contador = await getFuncionarioActivoPorRol('CONTADOR')
  const supervisor = await getFuncionarioActivoPorRol('SUPERVISOR')

  // 2. Construir mapa de valores
  const valores: Record<string, string> = {}

  for (const variable of variables) {
    const valor = extraerValor(variable, {
      proceso, institucion, rector, pagador, contador, supervisor
    })
    // Quitar las llaves: {{nombre}} → nombre
    const clave = variable.nombreVariable.replace(/\{\{|\}\}/g, '')
    valores[clave] = formatearValor(valor, variable.tipoDato, variable.formato)
  }

  return valores
}

function formatearValor(valor: any, tipoDato: string, formato?: string): string {
  if (valor === null || valor === undefined) return ''
  if (tipoDato === 'MONEDA') return formatCOP(Number(valor))
  if (tipoDato === 'FECHA' && valor) return formatFecha(String(valor))
  // Para campos _letras: usar numeroALetras
  return String(valor)
}
```

## 10.3 — Route Handlers

### `app/api/documentos/generar/route.ts`
**POST** — genera un documento Word desde una plantilla

```typescript
export async function POST(request: Request) {
  const { procesoId, plantillaId } = await request.json()

  // 1. Obtener plantilla y sus variables requeridas
  const plantilla = await getPlantillaById(plantillaId)
  if (!plantilla) return Response.json({ error: 'Plantilla no encontrada' }, { status: 404 })

  // 2. Verificar variables obligatorias
  const variablesObligatorias = plantilla.variables.filter(v => v.obligatoria)
  const valoresFaltantes = await verificarVariablesObligatorias(procesoId, variablesObligatorias)
  if (valoresFaltantes.length > 0) {
    return Response.json({
      error: 'Faltan datos obligatorios',
      faltantes: valoresFaltantes
    }, { status: 422 })
  }

  // 3. Resolver todas las variables
  const valores = await resolverVariables(procesoId, plantilla.variables.map(v => v.variable))

  // 4. Leer el archivo .docx de la plantilla
  const rutaPlantilla = path.join(process.cwd(), plantilla.plantilla.rutaArchivo)
  const contenido = fs.readFileSync(rutaPlantilla, 'binary')

  // 5. Generar el documento con docxtemplater
  const zip = new PizZip(contenido)
  const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true })
  doc.render(valores)
  const buffer = doc.getZip().generate({ type: 'nodebuffer' })

  // 6. Guardar el archivo en el expediente
  const proceso = await getProcesoById(procesoId)
  const nombreArchivo = `${plantilla.plantilla.nombre}_${proceso.codigo}_${Date.now()}.docx`
  const rutaExpediente = path.join(process.cwd(), proceso.expediente.rutaCarpeta)
  fs.mkdirSync(rutaExpediente, { recursive: true })
  const rutaArchivo = path.join(rutaExpediente, nombreArchivo)
  fs.writeFileSync(rutaArchivo, buffer)

  // 7. Registrar en BD + auditoría de valores usados
  await registrarDocumentoGenerado({
    expedienteId: proceso.expediente.id,
    plantillaId,
    nombreArchivo,
    ruta: `${proceso.expediente.rutaCarpeta}${nombreArchivo}`,
    valores
  })

  return Response.json({ success: true, nombreArchivo })
}
```

### `app/api/archivos/[expedienteId]/route.ts`
**GET** — descarga de un archivo del expediente

```typescript
export async function GET(
  request: Request,
  { params }: { params: { expedienteId: string } }
) {
  const { searchParams } = new URL(request.url)
  const nombreArchivo = searchParams.get('archivo')
  const expediente = await getExpedienteById(Number(params.expedienteId))

  const rutaArchivo = path.join(process.cwd(), expediente.rutaCarpeta, nombreArchivo!)
  if (!fs.existsSync(rutaArchivo)) {
    return new Response('Archivo no encontrado', { status: 404 })
  }

  const buffer = fs.readFileSync(rutaArchivo)
  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${nombreArchivo}"`,
    },
  })
}
```

## 10.4 — Server Actions

Crear `actions/expedientes.ts`:

### `getExpedienteByProceso(procesoId: number)`
```
- Expediente con documentos generados, anexos y verificaciones del checklist
- Retorna: ExpedienteCompleto
```

### `recalcularCompletitud(expedienteId: number)`
```
- COUNT verificaciones WHERE completado=true AND expediente_id = X
- COUNT verificaciones WHERE expediente_id = X (total)
- completitud = Math.round((completadas / total) * 100)
- UPDATE expedientes SET completitud = resultado
- (Llamar después de cualquier cambio en el checklist)
```

Crear `actions/anexos.ts`:

### `uploadAnexo(expedienteId: number, data: AnexoFormData, archivo: File)`
```
- Guardar el archivo en la carpeta del expediente
- Insertar en anexos
- Verificar si el tipo de documento corresponde a algún checklist_item pendiente
  Si sí: retornar sugerencia de vincular al checklist
- recalcularCompletitud(expedienteId)
- revalidatePath('/procesos/[id]')
- Retorna: ActionResult<AnexoConSugerencia>
```

### `deleteAnexo(id: number)`
```
- Verificar que no esté vinculado a una verificación del checklist
  Si está vinculado: retornar error
    "No se puede eliminar: está vinculado al checklist. Desvincula primero."
- Eliminar el archivo físico
- Eliminar registro en anexos
- recalcularCompletitud(expedienteId)
- revalidatePath('/procesos/[id]')
```

Crear `actions/checklist.ts`:

### `getChecklistByExpediente(expedienteId: number)`
```
- Verificaciones del checklist para el expediente
- JOIN con checklist_items y anexos (si están vinculados)
- Retorna: VerificacionConItem[]
```

### `inicializarChecklist(expedienteId: number)`
```
- Llamar al crear el expediente (al crear el proceso en CP7)
- INSERT en checklist_verificaciones un registro por cada checklist_item existente
- completado = false, anexoId = null
```

### `vincularAnexoChecklist(verificacionId: number, anexoId: number)`
```
- UPDATE checklist_verificaciones SET anexo_id = anexoId, completado = true,
  fecha_completado = NOW() WHERE id = verificacionId
- recalcularCompletitud
- revalidatePath('/procesos/[id]')
- Retorna: ActionResult<void>
```

### `toggleItemChecklist(verificacionId: number)`
```
- Cambiar completado al valor contrario
- Si se desmarca: también limpiar fecha_completado
- recalcularCompletitud
- revalidatePath('/procesos/[id]')
- Retorna: ActionResult<void>
```

## 10.5 — Componentes

### `components/expediente/ExpedientePanel.tsx`
**Client Component** — contenedor principal del Tab Expediente

Secciones (implementadas como sub-tabs):
1. Documentos generados
2. Anexos
3. Checklist

Header del expediente: barra de progreso con % de completitud.

### `components/expediente/BarraProgreso.tsx`
**Client Component**

Muestra: barra de progreso visual + porcentaje + texto "X de Y documentos completos"
Colores: verde si ≥ 80%, amarillo si 50-79%, rojo si < 50%.

### `components/expediente/DocumentosGenerados.tsx`
**Client Component** — sub-tab de documentos

- Botón "Generar documento ▼" con DropdownMenu:
  - Lista los tipos de documento que tienen plantilla activa
  - Al seleccionar: llama al Route Handler de generación
  - Estado de carga mientras genera el Word
  - Toast de éxito con nombre del archivo generado
  - Toast de error si faltan variables obligatorias (con lista de campos faltantes)

- Tabla de documentos:
  - Nombre del archivo, Estado (Badge: BORRADOR/DEFINITIVO/FIRMADO), Fecha, Acciones
  - Acciones: ⬇️ Descargar, 🔄 Cambiar estado, (regenerar)

### `components/expediente/AnexosUploader.tsx`
**Client Component** — sub-tab de anexos

- Zona de drop o botón "Cargar anexo"
  - Al seleccionar archivo: muestra formulario con:
    - Tipo de documento (Select del catálogo)
    - Descripción (opcional)
    - Botón "Subir"
- Al subir exitosamente:
  - Si el sistema detecta que el tipo corresponde a un ítem pendiente del checklist:
    mostrar toast con acción: "¿Vincular este anexo al checklist? [Sí, vincular]"

- Tabla de anexos subidos:
  - Nombre, Tipo documento, Fecha de carga, Acciones (descargar, eliminar)

### `components/expediente/ChecklistPanel.tsx`
**Client Component** — sub-tab de checklist

Lista de ítems del checklist:
- ✅ Ítem completado: fondo verde, nombre tachado suave, nombre del anexo vinculado
- ⬜ Ítem pendiente: botón "Vincular anexo ▼" con selector de anexos ya subidos

Acciones por ítem:
- Marcar como completado manualmente (si no hay anexo pero se tiene el físico)
- Vincular a un anexo ya subido
- Desmarcar

## 10.6 — Integración en proceso

### `app/(dashboard)/procesos/[id]/page.tsx`
Reemplazar el placeholder del Tab Expediente:

```typescript
const expediente = await getExpedienteByProceso(procesoId)
const checklist = await getChecklistByExpediente(expediente.id)
const tiposDocumento = await getTiposDocumentoActivos()
const plantillasActivas = await getPlantillasPorProceso(procesoId)
```

## 10.7 — Actualización del Dashboard

Al tener el módulo de expediente completo, actualizar el dashboard:

En `app/(dashboard)/page.tsx`:
- Tarjeta "Expedientes incompletos": query real a `expedientes WHERE completitud < 100`
- Tarjeta "Procesos activos": query real a `procesos WHERE estado = 'ACTIVO'`
- Tarjeta "CDPs disponibles": query real a CDPs sin RP
- Tabla "Próximas fechas": query real a `etapas_cronograma` con fecha en 7 días

---

## ✅ CHECKPOINT 10 — Verificación

- [ ] El tab Expediente muestra la barra de progreso con el % real
- [ ] El botón "Generar documento" muestra los tipos disponibles según plantillas
- [ ] Al generar: el Word se crea correctamente con las variables reemplazadas
- [ ] Si faltan variables obligatorias: el error lista los campos faltantes
- [ ] El archivo generado aparece en la tabla de documentos
- [ ] El botón de descarga descarga el archivo correcto
- [ ] Puedo subir un anexo (PDF, imagen, Word) al expediente
- [ ] Al subir un anexo del tipo correcto: aparece la sugerencia de vincular al checklist
- [ ] Puedo vincular un anexo a un ítem del checklist
- [ ] El % de completitud se actualiza al marcar/desmarcar ítems
- [ ] No se puede eliminar un anexo vinculado al checklist
- [ ] El Dashboard muestra los datos reales (no ceros)
- [ ] No hay errores de TypeScript (`npx tsc --noEmit`)

---

## Notas finales para el agente

### Sobre la generación Word
- `docxtemplater` requiere que las variables en el `.docx` estén en el
  formato `{{nombre_variable}}` exactamente (sin espacios dentro de las llaves).
- Si el archivo Word tiene errores de parseo (variables mal formadas),
  `docxtemplater` lanza una excepción — capturarla y retornar error claro al usuario.
- Para el campo `{{valor_total_cdp_letras}}` y similares: resolver usando
  `numeroALetras()` de `lib/format.ts` al momento de generar.

### Sobre el sistema de archivos
- Crear las carpetas físicas con `fs.mkdirSync(ruta, { recursive: true })`
  antes de escribir archivos.
- Las rutas de plantillas: `/plantillas/{categoria}/{nombre}.docx`
- Las rutas de expedientes: `/expedientes/{vigencia}/{codigo-proceso}/{archivo}`
- Agregar ambas carpetas al `.gitignore`.

### Sobre el checklist
- La función `inicializarChecklist(expedienteId)` debe llamarse en CP7
  dentro de la transacción de `createProceso`. Si no se hizo en CP7,
  hacerlo ahora: verificar si ya tiene ítems antes de insertar.

### Orden de implementación sugerido dentro del CP10
```
1. Instalar docxtemplater + pizzip
2. lib/variables-resolver.ts
3. seedVariables() + seedChecklistItems() + pnpm db:seed
4. actions/expedientes.ts + actions/checklist.ts + actions/anexos.ts
5. Route Handlers (generar + descarga)
6. Componentes: BarraProgreso → ChecklistPanel → AnexosUploader → DocumentosGenerados
7. ExpedientePanel integrando los sub-tabs
8. Integrar en page.tsx del proceso
9. Actualizar Dashboard con queries reales
```
