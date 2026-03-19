# Especificación de Casos de Uso — ContratoMate
## Sistema de Gestión de Contratación Pública para Instituciones Educativas

**Versión:** 2.0
**Fecha:** 18 de marzo de 2026
**Autor:** Daniel Eduardo Trejos Montiel

---

## Historial de Revisiones

| Fecha | Versión | Descripción |
|---|---|---|
| 2026-02-26 | 1.0 | Versión inicial (21 CU) |
| 2026-03-18 | 2.0 | Replanteamiento completo. CUs reorganizados por módulo según modelo de datos definitivo. Nuevos CUs: gestión de funcionarios con rol único activo, CDP con múltiples rubros, RP con trazabilidad, cotizaciones simplificadas, sistema de variables para documentos, checklist de expediente. |

---

## 1. Introducción

### 1.1 Actor del Sistema

El sistema es **monousuario**. El único actor es:

| Actor | Descripción |
|---|---|
| **Usuario** | Daniel Eduardo Trejos Montiel — Auxiliar Administrativo / Pagador de la IEDNDJ. Opera el sistema de forma exclusiva. |

No hay roles de acceso diferenciados. No hay autenticación.

### 1.2 Organización de los Casos de Uso

Los CUs están organizados en 9 módulos que siguen el flujo natural del trabajo:

| Módulo | CUs | Descripción |
|---|---|---|
| M1 — Configuración | CU-01 a CU-04 | Institución y funcionarios |
| M2 — Catálogos | CU-05 | Rubros, fuentes, tipos, UNSPSC, documentos |
| M3 — Contratistas | CU-06 a CU-07 | Registro y gestión de proveedores |
| M4 — Presupuesto | CU-08 a CU-11 | CDP con rubros y RP con trazabilidad |
| M5 — Proceso | CU-12 a CU-15 | Proceso contractual y cotizaciones |
| M6 — Cronograma | CU-16 | Etapas y fechas |
| M7 — Documentos | CU-17 a CU-19 | Plantillas, variables, generación |
| M8 — Expediente | CU-20 a CU-23 | Carpeta digital, anexos, checklist |
| M9 — Dashboard | CU-24 | Resumen y estadísticas |

---

## 2. Módulo M1 — Configuración

### CU-01: Configurar Institución

**Descripción:** El usuario ingresa o actualiza los datos de la institución educativa. Es un registro único (upsert).

**Precondiciones:** Ninguna.

**Postcondiciones:** Los datos de la institución quedan disponibles para todos los documentos generados.

**Flujo principal:**
| Paso | Actor | Acción |
|---|---|---|
| 1 | Usuario | Accede a `/configuracion` |
| 2 | Sistema | Si existe un registro, precarga los datos en el formulario. Si no, muestra el formulario vacío. |
| 3 | Usuario | Ingresa o modifica: nombre completo, siglas, NIT (formato: 823001921-9), municipio, departamento, teléfono, email |
| 4 | Usuario | Hace clic en "Guardar configuración" |
| 5 | Sistema | Valida los datos (NIT con formato correcto, email válido si se provee) |
| 6 | Sistema | Crea o actualiza el registro en la BD |
| 7 | Sistema | Muestra toast de éxito |

**Flujos alternativos:**
- 5a. Si los datos son inválidos: muestra errores inline bajo cada campo. No guarda.

**Reglas de negocio:**
- RN: El NIT debe tener formato `dígitos-dígitoVerificador` (ej: 823001921-9)
- RN: Solo existe un registro de institución en el sistema

---

### CU-02: Registrar Funcionario

**Descripción:** El usuario registra un nuevo funcionario con su rol dentro de la institución.

**Precondiciones:** La institución debe estar configurada (CU-01).

**Postcondiciones:** El funcionario queda registrado. Si se marcó como activo, el anterior del mismo rol queda inactivo.

**Flujo principal:**
| Paso | Actor | Acción |
|---|---|---|
| 1 | Usuario | Accede a `/funcionarios` y hace clic en "Agregar funcionario" |
| 2 | Sistema | Abre el formulario modal |
| 3 | Usuario | Selecciona rol (RECTOR / PAGADOR / CONTADOR / SUPERVISOR) |
| 4 | Sistema | Si ya existe un funcionario activo del mismo rol, muestra advertencia: "Ya existe un [ROL] activo: [Nombre]. Al guardar como activo, será desactivado." |
| 5 | Usuario | Ingresa: nombre completo, tipo de identificación (CC/CE), número de identificación, cargo oficial (opcional) |
| 6 | Usuario | Define si el funcionario queda activo o inactivo |
| 7 | Usuario | Hace clic en "Guardar" |
| 8 | Sistema | Valida los datos |
| 9 | Sistema | Si el nuevo funcionario es activo, desactiva el anterior del mismo rol |
| 10 | Sistema | Inserta el nuevo funcionario |
| 11 | Sistema | Muestra toast de éxito |

**Reglas de negocio:**
- RN: Solo puede haber un funcionario activo por rol a la vez
- RN: El historial de funcionarios se conserva (los inactivos no se eliminan)
- RN: Los documentos generados usan el funcionario activo al momento de generación

---

### CU-03: Editar Funcionario

**Descripción:** El usuario modifica los datos de un funcionario existente.

**Flujo principal:** Similar a CU-02 pero con datos precargados. Aplica la misma regla de rol único activo.

**Regla especial:** Si se activa un funcionario que estaba inactivo y ya hay otro activo del mismo rol, el sistema desactiva al anterior y muestra confirmación.

---

### CU-04: Activar / Desactivar Funcionario

**Descripción:** El usuario cambia el estado activo de un funcionario desde la tabla.

**Flujo al activar:**
- Sistema verifica si hay otro activo del mismo rol
- Si hay otro: muestra AlertDialog "¿Desactivar a [Nombre anterior] y activar a [Nombre nuevo]?"
- Al confirmar: desactiva el anterior y activa el nuevo

**Flujo al desactivar:**
- Sistema muestra AlertDialog de confirmación
- Al confirmar: desactiva el funcionario

---

## 3. Módulo M2 — Catálogos

### CU-05: Gestionar Catálogos

**Descripción:** El usuario administra los cinco catálogos del sistema desde una vista con pestañas.

**Catálogos:**
1. Fuentes de financiamiento
2. Rubros presupuestales
3. Tipos de proceso
4. Códigos UNSPSC
5. Tipos de documento

**Flujo general (aplica a los 5 catálogos):**
| Paso | Actor | Acción |
|---|---|---|
| 1 | Usuario | Accede a `/catalogos` y selecciona la pestaña |
| 2 | Sistema | Muestra la tabla del catálogo seleccionado |
| 3a | Usuario | Crea un nuevo ítem (Dialog con formulario) |
| 3b | Usuario | Edita un ítem existente (Dialog con datos precargados) |
| 3c | Usuario | Activa o desactiva un ítem |
| 3d | Usuario | Intenta eliminar un ítem |
| 4 | Sistema | Al eliminar: verifica si está en uso en otro módulo |
| 5a | Sistema | Si no está en uso: elimina y muestra éxito |
| 5b | Sistema | Si está en uso: muestra error "No se puede eliminar: en uso en [N] registro(s)" |

**Reglas de negocio:**
- RN: Solo los ítems activos aparecen en los selectores de otros formularios
- RN: Los ítems en uso no pueden eliminarse, solo desactivarse
- RN: El código de rubro debe tener formato numérico separado por puntos
- RN: Los tipos de documento tienen categoría: PRECONTRACTUAL / CONTRACTUAL / EJECUCION / LIQUIDACION

---

## 4. Módulo M3 — Contratistas

### CU-06: Registrar Contratista

**Descripción:** El usuario registra un proveedor o contratista. El formulario se adapta según el tipo de persona.

**Precondiciones:** Catálogos básicos configurados.

**Flujo principal:**
| Paso | Actor | Acción |
|---|---|---|
| 1 | Usuario | Accede a `/contratistas` y hace clic en "Nuevo contratista" |
| 2 | Sistema | Abre el panel lateral (Sheet) con el formulario |
| 3 | Usuario | Selecciona tipo de persona: NATURAL o JURÍDICA |
| 4 | Sistema | Adapta el formulario según tipo: |
| | | NATURAL: muestra apellidos + nombres, tipo ID (CC/CE/Pasaporte) |
| | | JURÍDICA: muestra razón social + representante legal, fuerza tipo ID = NIT |
| 5 | Usuario | Completa los datos de contacto, bancarios y tributarios |
| 6 | Usuario | Hace clic en "Guardar" |
| 7 | Sistema | Valida con schema Zod (discriminatedUnion según tipo de persona) |
| 8 | Sistema | Verifica unicidad del número de identificación |
| 9 | Sistema | Inserta el contratista y muestra éxito |

**Flujos alternativos:**
- 8a. Si el número de identificación ya existe: error "Ya existe un contratista con este número de identificación"

**Reglas de negocio:**
- RN: NATURAL → campos obligatorios: primer apellido, primer nombre, tipo ID (CC/CE/Pasaporte)
- RN: JURÍDICA → campos obligatorios: razón social, representante legal, tipo ID = NIT (forzado)
- RN: El número de identificación es único en el sistema

---

### CU-07: Editar / Buscar Contratista

**Descripción:** El usuario modifica datos de un contratista o lo busca para usar en otro módulo.

**Búsqueda:** Filtro en tiempo real por nombre/razón social o número de identificación. Usado principalmente al seleccionar contratista en el RP y en cotizaciones.

---

## 5. Módulo M4 — Presupuesto

### CU-08: Crear CDP

**Descripción:** El usuario registra un Certificado de Disponibilidad Presupuestal con sus líneas de rubro/fuente.

**Precondiciones:** Institución configurada. Catálogos de fuentes y rubros cargados.

**Flujo principal:**
| Paso | Actor | Acción |
|---|---|---|
| 1 | Usuario | Accede a `/cdps` y hace clic en "Nuevo CDP" |
| 2 | Sistema | Muestra el formulario |
| 3 | Usuario | Ingresa: número de CDP, vigencia (año), fecha de expedición, objeto del gasto |
| 4 | Usuario | Agrega líneas de rubro: selecciona rubro del catálogo, selecciona fuente, ingresa valor |
| 5 | Sistema | Calcula y muestra el valor total = suma de todas las líneas |
| 6 | Usuario | Puede agregar N líneas (al menos una obligatoria) |
| 7 | Usuario | Hace clic en "Guardar" |
| 8 | Sistema | Valida: al menos una línea, valores positivos, número CDP único por vigencia |
| 9 | Sistema | Guarda el CDP y sus líneas en transacción atómica |
| 10 | Sistema | Muestra éxito |

**Reglas de negocio:**
- RN: El número de CDP debe ser único por vigencia
- RN: Debe tener al menos una línea de rubro
- RN: El valor total se calcula como suma de líneas (no se ingresa manualmente)
- RN: El objeto del CDP es la fuente de verdad para todo el proceso

---

### CU-09: Consultar / Editar CDP

**Descripción:** El usuario visualiza o modifica un CDP existente.

**Restricción:** Un CDP que ya tiene RP asignado solo permite editar el objeto y la fecha. No permite modificar rubros ni valores (afectaría la trazabilidad).

---

### CU-10: Crear Registro Presupuestal (RP)

**Descripción:** El usuario registra el compromiso presupuestal asociado a un CDP, asignando el contratista ganador.

**Precondiciones:** El CDP debe existir y no tener RP asignado. El contratista debe estar registrado.

**Flujo principal:**
| Paso | Actor | Acción |
|---|---|---|
| 1 | Usuario | Desde la vista del CDP hace clic en "Crear RP" |
| 2 | Sistema | Precarga el número de CDP y muestra las líneas del CDP como referencia |
| 3 | Usuario | Ingresa: número de RP, fecha de expedición |
| 4 | Usuario | Selecciona el contratista ganador (buscador) |
| 5 | Sistema | Muestra las líneas del CDP para que el usuario defina el valor comprometido por línea |
| 6 | Usuario | Para cada línea de CDP: ingresa el valor del RP (puede ser igual o menor) |
| 7 | Sistema | Valida que valor_rp ≤ valor_cdp por cada línea |
| 8 | Sistema | Calcula y muestra el valor total del RP = suma de valores_rp |
| 9 | Usuario | Hace clic en "Guardar" |
| 10 | Sistema | Guarda el RP y sus líneas en transacción atómica |

**Reglas de negocio:**
- RN: 1 CDP → 1 RP (relación 1:1, exclusiva)
- RN: valor_rp ≤ valor_cdp por cada línea de rubro
- RN: Las líneas del RP referencian las líneas del CDP para trazabilidad
- RN: El contratista del RP se hereda al proceso (no se repite)

---

### CU-11: Consultar RP

**Descripción:** El usuario visualiza los datos del RP, incluyendo los valores comprometidos vs certificados por rubro.

---

## 6. Módulo M5 — Proceso Contractual

### CU-12: Crear Proceso

**Descripción:** El usuario crea el contrato a partir de un RP existente.

**Precondiciones:** El RP debe existir. El RP no debe tener proceso asignado.

**Flujo principal:**
| Paso | Actor | Acción |
|---|---|---|
| 1 | Usuario | Desde la vista del RP hace clic en "Crear Proceso" |
| 2 | Sistema | Precarga: tipo de proceso (selector), código generado automáticamente (CTR-NN-AAAA) |
| 3 | Sistema | Muestra info derivada del RP (solo lectura): objeto, contratista, valor total |
| 4 | Usuario | Completa: tipo de proceso, tiene_iva (switch), valor_iva (si aplica) |
| 5 | Usuario | Puede agregar códigos UNSPSC (selector múltiple del catálogo) |
| 6 | Usuario | Hace clic en "Crear" |
| 7 | Sistema | Crea el proceso, el cronograma vacío y el expediente vacío automáticamente |
| 8 | Sistema | Redirige a la vista del proceso |

**Reglas de negocio:**
- RN: 1 RP → 1 Proceso (relación 1:1)
- RN: El código se genera automáticamente: `CTR-{secuencial_vigencia}-{vigencia}`
- RN: El objeto y contratista NO se copian al proceso — se consultan via RP → CDP
- RN: Al crear el proceso se crean automáticamente su cronograma y expediente

---

### CU-13: Gestionar Cotizaciones

**Descripción:** El usuario registra las propuestas de los proponentes (típicamente 3).

**Flujo principal:**
| Paso | Actor | Acción |
|---|---|---|
| 1 | Usuario | Desde la vista del proceso accede a la pestaña "Cotizaciones" |
| 2 | Usuario | Hace clic en "Agregar cotización" |
| 3 | Usuario | Selecciona el contratista proponente (buscador), ingresa fecha y valor total |
| 4 | Usuario | Opcionalmente agrega observaciones |
| 5 | Sistema | Guarda la cotización |
| 6 | Usuario | Repite para los demás proponentes |
| 7 | Usuario | Marca la cotización ganadora con "Seleccionar como adjudicada" |
| 8 | Sistema | Marca esa cotización como seleccionada; desmarca las anteriores |

**Reglas de negocio:**
- RN: Solo una cotización por proceso puede estar seleccionada (la ganadora)
- RN: Solo se captura proponente + valor total (sin detalle de artículos — los códigos UNSPSC clasifican el proceso, no los ítems)

---

### CU-14: Actualizar Estado del Proceso

**Descripción:** El usuario cambia el estado del proceso en el ciclo de vida.

**Estados y transiciones:**
```
BORRADOR → ACTIVO (al firmar el contrato)
ACTIVO → SUSPENDIDO (si el proceso se suspende)
ACTIVO → LIQUIDADO (al completar la liquidación)
ACTIVO → ANULADO
SUSPENDIDO → ACTIVO (al reactivar)
SUSPENDIDO → ANULADO
```

---

### CU-15: Actualizar Fechas del Proceso

**Descripción:** El usuario registra las fechas reales del proceso (no de planeación).

**Fechas disponibles:** firma del contrato, publicación, inicio, plazo, acta de terminación, liquidación.

---

## 7. Módulo M6 — Cronograma

### CU-16: Gestionar Cronograma

**Descripción:** El usuario define y actualiza las etapas del cronograma del proceso.

**Precondiciones:** El proceso debe existir (el cronograma se crea automáticamente con el proceso).

**Flujo principal:**
| Paso | Actor | Acción |
|---|---|---|
| 1 | Usuario | Accede a la pestaña "Cronograma" del proceso |
| 2 | Sistema | Muestra la tabla de etapas (puede estar vacía inicialmente) |
| 3 | Usuario | Agrega etapas: nombre, fecha inicio, fecha fin, hora (opcional), tipo de documento asociado (opcional) |
| 4 | Sistema | Ordena las etapas por el campo `orden` |
| 5 | Usuario | Puede editar, reordenar o eliminar etapas |
| 6 | Usuario | Marca etapas como completadas |

**Etapas típicas del cronograma:**
1. Elaboración de estudios previos
2. Publicación en SECOP
3. Solicitud de cotizaciones
4. Recepción de ofertas / Cierre
5. Evaluación y selección
6. Firma del contrato
7. Inicio del contrato
8. Terminación del contrato
9. Liquidación

**Regla de negocio:**
- RN: Las fechas del cronograma son de **planeación**. Las fechas reales se registran en el proceso (CU-15).

---

## 8. Módulo M7 — Documentos

### CU-17: Gestionar Plantillas

**Descripción:** El usuario administra las plantillas Word del sistema.

**Flujo principal:**
| Paso | Actor | Acción |
|---|---|---|
| 1 | Usuario | Accede a `/plantillas` |
| 2 | Sistema | Lista las plantillas agrupadas por tipo de documento |
| 3 | Usuario | Crea una plantilla: selecciona tipo de documento, sube el archivo .docx, asigna versión |
| 4 | Sistema | Almacena el archivo en la carpeta de plantillas del sistema |
| 5 | Usuario | Configura las variables requeridas: selecciona del catálogo de variables, marca obligatoria/opcional |

**Regla de negocio:**
- RN: Una plantilla debe tener al menos una variable configurada antes de usarse para generar documentos

---

### CU-18: Gestionar Variables

**Descripción:** El usuario administra el catálogo global de variables disponibles.

**Nota:** Las variables del sistema ya vienen pre-cargadas con el seed. Este CU es para casos en que el usuario necesite agregar variables personalizadas.

**Campos de una variable:**
- `{{nombre_variable}}`: nombre tal como aparece en el Word
- Entidad origen: de qué tabla viene el valor
- Campo origen: qué columna de esa tabla
- Tipo de dato: TEXTO, NUMERO, FECHA, MONEDA, BOOLEANO
- Formato: patrón de presentación (ej: "dd/MM/yyyy", "$ #,##0.00")

---

### CU-19: Generar Documento

**Descripción:** El usuario genera un documento Word para un proceso específico.

**Precondiciones:** La plantilla debe estar configurada con sus variables. Los datos de la BD deben estar completos para las variables obligatorias.

**Flujo principal:**
| Paso | Actor | Acción |
|---|---|---|
| 1 | Usuario | Desde el expediente del proceso, selecciona "Generar documento" |
| 2 | Usuario | Selecciona el tipo de documento a generar |
| 3 | Sistema | Busca la plantilla activa para ese tipo de documento |
| 4 | Sistema | Consulta las variables requeridas (PlantillaVariable) |
| 5 | Sistema | Para cada variable: consulta entidad_origen.campo_origen en la BD |
| 6 | Sistema | Verifica que todas las variables obligatorias tengan valor |
| 7a | Sistema | Si faltan valores obligatorios: muestra lista de campos faltantes. Bloquea la generación. |
| 7b | Sistema | Si todo está disponible: genera el archivo Word |
| 8 | Sistema | Reemplaza cada `{{variable}}` por su valor real |
| 9 | Sistema | Guarda el archivo en la carpeta del expediente |
| 10 | Sistema | Registra en DocumentoGenerado y DocumentoVariable (auditoría) |
| 11 | Sistema | Actualiza el checklist del expediente si aplica |
| 12 | Sistema | Ofrece descargar el documento |

**Reglas de negocio:**
- RN: El documento generado tiene estado inicial BORRADOR
- RN: Los valores usados se guardan en DocumentoVariable para trazabilidad
- RN: Si se regenera un documento, se crea una nueva instancia (no se sobreescribe)

---

## 9. Módulo M8 — Expediente

### CU-20: Consultar Expediente

**Descripción:** El usuario visualiza el estado completo del expediente de un proceso.

**Vista del expediente incluye:**
- Barra de progreso de completitud (% del checklist)
- Lista de documentos generados con estado (BORRADOR/DEFINITIVO/FIRMADO)
- Lista de anexos cargados
- Checklist de verificación con ítems pendientes y completados

---

### CU-21: Cargar Anexo

**Descripción:** El usuario sube un archivo al expediente del proceso.

**Flujo principal:**
| Paso | Actor | Acción |
|---|---|---|
| 1 | Usuario | Desde el expediente hace clic en "Cargar anexo" |
| 2 | Usuario | Selecciona el archivo desde el explorador |
| 3 | Usuario | Asigna el tipo de documento (del catálogo) y descripción opcional |
| 4 | Sistema | Guarda el archivo en la carpeta del expediente |
| 5 | Sistema | Registra el anexo en la BD |
| 6 | Sistema | Verifica si el tipo de documento corresponde a algún ítem del checklist |
| 7 | Sistema | Si corresponde: ofrece marcar el ítem del checklist como completado con este anexo |
| 8 | Sistema | Recalcula el porcentaje de completitud del expediente |

---

### CU-22: Gestionar Checklist

**Descripción:** El usuario revisa y actualiza el estado del checklist de completitud del expediente.

**Flujo principal:**
| Paso | Actor | Acción |
|---|---|---|
| 1 | Usuario | Accede a la vista del expediente, sección checklist |
| 2 | Sistema | Muestra todos los ítems del catálogo con su estado: completado/pendiente |
| 3 | Sistema | Para ítems completados: muestra el anexo vinculado |
| 4 | Usuario | Puede vincular un ítem a un anexo ya cargado |
| 5 | Usuario | Puede marcar un ítem como completado manualmente |
| 6 | Sistema | Recalcula el porcentaje de completitud |

**Regla de negocio:**
- RN: `completitud (%) = COUNT(ítems completados) / COUNT(total ítems) × 100`
- RN: El porcentaje se actualiza automáticamente al cargar anexos y al marcar ítems

---

### CU-23: Cambiar Estado de Documento Generado

**Descripción:** El usuario actualiza el estado de un documento del expediente.

**Estados:** BORRADOR → DEFINITIVO → FIRMADO

---

## 10. Módulo M9 — Dashboard

### CU-24: Consultar Dashboard

**Descripción:** El usuario visualiza el resumen general del estado de los procesos.

**Información del dashboard:**
| Tarjeta | Fuente de datos |
|---|---|
| Procesos activos | COUNT procesos WHERE estado = 'ACTIVO' |
| CDPs disponibles | COUNT cdps sin RP asignado |
| Expedientes incompletos | COUNT expedientes WHERE completitud < 100 |
| Próximas fechas | etapas_cronograma con fecha en los próximos 7 días |

---

## 11. Resumen de Casos de Uso

| ID | Nombre | Módulo | Prioridad |
|---|---|---|---|
| CU-01 | Configurar Institución | M1 Configuración | Alta |
| CU-02 | Registrar Funcionario | M1 Configuración | Alta |
| CU-03 | Editar Funcionario | M1 Configuración | Alta |
| CU-04 | Activar/Desactivar Funcionario | M1 Configuración | Alta |
| CU-05 | Gestionar Catálogos | M2 Catálogos | Alta |
| CU-06 | Registrar Contratista | M3 Contratistas | Alta |
| CU-07 | Editar/Buscar Contratista | M3 Contratistas | Alta |
| CU-08 | Crear CDP | M4 Presupuesto | Alta |
| CU-09 | Consultar/Editar CDP | M4 Presupuesto | Alta |
| CU-10 | Crear Registro Presupuestal | M4 Presupuesto | Alta |
| CU-11 | Consultar RP | M4 Presupuesto | Media |
| CU-12 | Crear Proceso | M5 Proceso | Alta |
| CU-13 | Gestionar Cotizaciones | M5 Proceso | Alta |
| CU-14 | Actualizar Estado del Proceso | M5 Proceso | Alta |
| CU-15 | Actualizar Fechas del Proceso | M5 Proceso | Alta |
| CU-16 | Gestionar Cronograma | M6 Cronograma | Media |
| CU-17 | Gestionar Plantillas | M7 Documentos | Alta |
| CU-18 | Gestionar Variables | M7 Documentos | Media |
| CU-19 | Generar Documento | M7 Documentos | Alta |
| CU-20 | Consultar Expediente | M8 Expediente | Alta |
| CU-21 | Cargar Anexo | M8 Expediente | Alta |
| CU-22 | Gestionar Checklist | M8 Expediente | Alta |
| CU-23 | Cambiar Estado Documento | M8 Expediente | Media |
| CU-24 | Consultar Dashboard | M9 Dashboard | Media |
