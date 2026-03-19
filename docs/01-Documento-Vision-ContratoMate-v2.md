# Documento Visión — ContratoMate
## Sistema de Gestión de Contratación Pública para Instituciones Educativas

**Versión:** 2.0
**Fecha:** 18 de marzo de 2026
**Autor:** Daniel Eduardo Trejos Montiel
**Institución:** I.E. Dulce Nombre de Jesús — Planeta Rica, Córdoba

---

## Historial de Revisiones

| Fecha | Versión | Descripción | Autor |
|---|---|---|---|
| 2026-02-26 | 1.0 | Versión inicial | Daniel Trejos / Claude |
| 2026-03-18 | 2.0 | Actualización completa: modelo de datos redefinido, nuevas entidades (Funcionario, CDP_Rubro, RP_Rubro, ProcesoUnspsc, Expediente, sistema documental), reglas de negocio afinadas, stack tecnológico confirmado | Daniel Trejos / Claude |

---

## 1. Requerimientos de Negocio

### 1.1 Antecedentes

La Institución Educativa Dulce Nombre de Jesús (IEDNDJ) gestiona anualmente
múltiples procesos de contratación pública de mínima cuantía con cargo a los
Fondos de Servicios Educativos (FSE). El proceso actual implica:

- Generación manual de documentos en Google Docs con combinación de
  correspondencia desde Google Sheets.
- Transcripción manual de datos del software contable **Contador ERP Plus**
  hacia las plantillas de documentos.
- Almacenamiento disperso de expedientes en carpetas físicas y digitales
  sin estructura estandarizada.
- Ausencia de trazabilidad entre el CDP, el RP, el contrato y los documentos
  generados para cada proceso.

Este flujo genera inconsistencias, errores de transcripción, tiempos excesivos
de procesamiento y dificultades para verificar la completitud de los expedientes
en auditorías.

### 1.2 Oportunidad de Negocio

Centralizar toda la información del proceso contractual en una única aplicación
que: registre el CDP y el RP una sola vez, genere automáticamente todos los
documentos del proceso a partir de esa información, y organice el expediente
digital de forma verificable.

### 1.3 Objetivos del Negocio

| ID | Objetivo |
|---|---|
| OB-1 | Eliminar la duplicidad de información entre documentos de un mismo proceso contractual |
| OB-2 | Reducir el tiempo de generación de documentos de horas a minutos |
| OB-3 | Garantizar consistencia entre el CDP, el RP y los documentos generados |
| OB-4 | Organizar los expedientes digitales con estructura verificable y checklist de completitud |
| OB-5 | Mantener historial de funcionarios que firman los documentos |
| OB-6 | Permitir el registro y seguimiento del cronograma de cada proceso |

### 1.4 Métricas de Éxito

| Métrica | Situación actual | Meta |
|---|---|---|
| Tiempo de generación de un set completo de documentos | 2-4 horas | < 15 minutos |
| Errores de inconsistencia entre documentos de un proceso | Frecuentes | 0 |
| Tiempo para verificar completitud de un expediente | 30+ minutos | < 2 minutos |
| Procesos con expediente digitalizado completo | ~20% | 100% |

### 1.5 Declaración de la Visión

| Aspecto | Descripción |
|---|---|
| **Para** | El auxiliar administrativo (pagador) de la IEDNDJ |
| **Quien** | Gestiona procesos de contratación pública de mínima cuantía y genera múltiples documentos con información repetida transcritos manualmente |
| **ContratoMate** | Es un sistema de gestión contractual local |
| **Que** | Centraliza la información del proceso (CDP, RP, contratista, cronograma) y genera automáticamente todos los documentos requeridos, organizando el expediente digital con control de completitud |
| **A diferencia de** | El proceso manual actual con Google Docs, Google Sheets y Contador ERP Plus sin integración |
| **Nuestro producto** | Elimina la transcripción manual, garantiza consistencia entre documentos, y provee trazabilidad completa desde el CDP hasta la liquidación |

### 1.6 Riesgos del Negocio

| Riesgo | Probabilidad | Impacto | Acción |
|---|---|---|---|
| RN-1: Pérdida del archivo SQLite sin respaldo | Media | Alto | Implementar backup automático en carpeta de red |
| RN-2: Cambio de funcionarios (rector, pagador) durante un proceso activo | Alta | Medio | Historial de funcionarios con registro de activo/inactivo por rol |
| RN-3: Modificación de plantillas Word externas al sistema | Media | Medio | Las plantillas se versionan dentro del sistema |
| RN-4: Datos incorrectos del CDP/RP transcriptos por el usuario | Alta | Alto | Validaciones en formularios y vista previa antes de generar documentos |

### 1.7 Supuestos y Dependencias

- El sistema opera en un único equipo (monousuario, sin autenticación).
- El CDP y el RP se generan primero en Contador ERP Plus; el usuario transcribe
  los datos al sistema manualmente.
- Las plantillas Word son archivos `.docx` preparados con marcadores de variable
  en formato `{{nombre_variable}}`.
- El sistema requiere que los catálogos (fuentes, rubros, tipos de proceso,
  códigos UNSPSC) estén configurados antes de crear el primer proceso.

---

## 2. Alcance y Limitaciones

### 2.1 Características Principales

| ID | Característica | Descripción |
|---|---|---|
| CP-1 | Gestión de configuración | Datos de la institución y funcionarios con roles (Rector, Pagador, Contador, Supervisor) |
| CP-2 | Gestión de catálogos | Rubros, fuentes de financiamiento, tipos de proceso, códigos UNSPSC, tipos de documento |
| CP-3 | Gestión de contratistas | Registro de proveedores (persona natural y jurídica) con datos tributarios y bancarios |
| CP-4 | Gestión presupuestal | CDP con múltiples rubros/fuentes, RP con trazabilidad de valores comprometidos |
| CP-5 | Gestión de procesos | Proceso contractual completo: cotizaciones, códigos UNSPSC, fechas, estado y ciclo de vida |
| CP-6 | Cronograma | Etapas del proceso con fechas de planeación diferenciadas de fechas reales |
| CP-7 | Generación de documentos | Documentos Word generados automáticamente desde plantillas con variables de la BD |
| CP-8 | Expediente digital | Carpeta por proceso con documentos generados, anexos y checklist de completitud |
| CP-9 | Gestión de plantillas | Administración de plantillas Word y mapeo de variables a campos de la BD |

### 2.2 Alcance por Versión

| Característica | v1.0 (MVP) | v2.0 | v3.0 |
|---|---|---|---|
| Configuración institución y funcionarios | ✅ Completa | — | — |
| Catálogos | ✅ Completa | — | — |
| Contratistas | ✅ Completa | — | — |
| CDP y RP | ✅ Completa | — | — |
| Procesos y cotizaciones | ✅ Completa | — | — |
| Cronograma | ✅ Básico (fechas) | ✅ Alertas y recordatorios | — |
| Generación de documentos Word | ✅ Todos los tipos | — | — |
| Expediente y checklist | ✅ Completa | — | — |
| Plantillas y variables | ✅ Gestión básica | ✅ Editor visual | — |
| Dashboard y estadísticas | ✅ Básico | ✅ Reportes avanzados | — |
| Multiusuario / autenticación | ❌ | ❌ | ✅ Opcional |
| Integración con SECOP | ❌ | ❌ | Evaluar |

### 2.3 Limitaciones y Exclusiones

- **Sin autenticación**: el sistema es monousuario, sin login.
- **Sin integración directa** con Contador ERP Plus: los datos del CDP y RP
  se ingresan manualmente.
- **Sin módulo contable**: no reemplaza el software contable, solo gestiona
  la documentación contractual.
- **Sin conexión a SECOP**: la publicación en SECOP se hace externamente.
- **Sin app móvil**: la aplicación es exclusivamente web desktop.

---

## 3. Contexto de Negocio

### 3.1 Perfiles de Interesados

| Interesado | Rol en el sistema | Interés principal |
|---|---|---|
| **Daniel Eduardo Trejos Montiel** | Usuario único / Auxiliar Administrativo (Pagador) | Reducir tiempo de generación de documentos y organizar expedientes |
| **Rector (Jaider Andres Suarez Vergara)** | Firma documentos | No usa el sistema directamente; se beneficia de documentos correctos y rápidos |
| **Contador** | Certifica documentos financieros | Recibe documentos ya generados; no usa el sistema |
| **Supervisor del contrato** | Supervisa ejecución | No usa el sistema directamente |
| **Entes de control (Secretaría, Contraloría)** | Auditoría | Requieren expedientes completos y ordenados |

### 3.2 Prioridades del Proyecto

| Prioridad | Aspecto | Justificación |
|---|---|---|
| 1 | Correctitud | Los documentos generados deben ser jurídicamente válidos |
| 2 | Completitud del expediente | La auditoría exige expedientes completos |
| 3 | Velocidad de generación | Reducir tiempo de trabajo administrativo |
| 4 | Usabilidad | El usuario no es desarrollador; la interfaz debe ser simple |
| 5 | Rendimiento | Sistema local, un usuario — no es crítico |

### 3.3 Consideraciones de Implantación

- Despliegue local en el equipo del auxiliar administrativo.
- Base de datos SQLite (archivo único `contratomate.db`) con respaldo manual.
- Las plantillas Word se almacenan en una carpeta del sistema de archivos.
- Los expedientes digitales se organizan en carpetas por vigencia y proceso:
  `/expedientes/2026/CTR-01-2026/`.

---

## 4. Descripción del Sistema

### 4.1 Perspectiva del Sistema

ContratoMate es una aplicación web local (Next.js) que funciona como servidor
en la máquina del usuario. No requiere internet para operar. Recibe datos
manualmente del sistema contable externo y produce documentos Word y expedientes
digitales organizados.

```
┌─────────────────────────────────────────────────────────────┐
│                       CONTRATOMATE                          │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Configuración│  │  Presupuesto │  │     Proceso      │  │
│  │ Institución  │  │  CDP + RP    │  │  Contractual     │  │
│  │ Funcionarios │  │  Rubros      │  │  Cotizaciones    │  │
│  │ Catálogos    │  │  Fuentes     │  │  Cronograma      │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Contratistas │  │  Plantillas  │  │    Expediente    │  │
│  │ Natural      │  │  Variables   │  │  Docs generados  │  │
│  │ Jurídica     │  │  Generación  │  │  Anexos          │  │
│  └──────────────┘  └──────────────┘  │  Checklist       │  │
│                                      └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
         ▲                                        │
         │ Datos CDP/RP                           │ Documentos
         │ (transcripción manual)                 ▼ Word + PDFs
┌──────────────────┐                   ┌──────────────────────┐
│  Contador ERP    │                   │  Expediente Digital  │
│     Plus         │                   │  /expedientes/2026/  │
│  (Sistema externo│                   │  CTR-01-2026/        │
│   del colegio)   │                   └──────────────────────┘
└──────────────────┘
```

### 4.2 Flujo General del Proceso Contractual

```
1. PRECONTRACTUAL
   Configurar catálogos → Registrar contratistas
   → Crear CDP (rubros + fuentes) → Crear RP (valores comprometidos)
   → Registrar cotizaciones (3 proponentes)
   → Seleccionar cotización ganadora

2. CONTRACTUAL
   → Crear Proceso (desde el RP)
   → Definir cronograma (fechas de etapas)
   → Generar documentos: CDP, Estudio Previo, Comparativo,
     RP, Contrato, Acta de Inicio

3. EJECUCIÓN
   → Registrar fecha real de inicio
   → Generar: Informes, Actas de Supervisión, Acta de Recibo,
     Factura

4. LIQUIDACIÓN
   → Registrar fecha de terminación y liquidación
   → Generar: Resolución de Pago, Comprobante de Egreso,
     Acta de Liquidación

5. EXPEDIENTE
   → Cargar anexos firmados y documentos del contratista
   → Verificar checklist de completitud
   → Expediente completo = 100% del checklist
```

---

## 5. Características del Sistema

### CP-1: Gestión de Configuración

**Institución:**
- Registro único de los datos de la IEDNDJ (NIT, nombre, municipio, etc.)
- Modificable en cualquier momento; los cambios se reflejan en documentos futuros

**Funcionarios:**
- Registro de personas con rol: RECTOR, PAGADOR, CONTADOR, SUPERVISOR
- Solo un funcionario activo por rol a la vez
- Al activar uno nuevo, el anterior del mismo rol se desactiva automáticamente
- Historial conservado (los inactivos no se eliminan)
- Los documentos generados usan el funcionario activo al momento de la generación

### CP-2: Gestión de Catálogos

Cinco catálogos configurables por el usuario:
- **Fuentes de financiamiento**: SGP-Gratuidad, Recursos Propios, etc.
- **Rubros presupuestales**: con código en formato 2.1.02.02.008.06
- **Tipos de proceso**: Prestación de Servicios, Compraventa, De Obra, Suministro
- **Códigos UNSPSC**: clasificador de bienes y servicios
- **Tipos de documento**: categorizados por fase (Precontractual, Contractual, etc.)

Todos los catálogos soportan: crear, editar, activar/desactivar. No se eliminan
si están en uso — solo se desactivan.

### CP-3: Gestión de Contratistas

- Registro diferenciado por tipo de persona:
  - **Natural**: apellidos, nombres, CC
  - **Jurídica**: razón social, representante legal, NIT con DV
- Datos tributarios: régimen de IVA, declarante
- Datos bancarios: banco, tipo y número de cuenta
- Un mismo contratista puede participar en múltiples procesos
- Búsqueda por nombre o número de identificación

### CP-4: Gestión Presupuestal

**CDP (Certificado de Disponibilidad Presupuestal):**
- Un CDP puede tener múltiples líneas de rubro/fuente
- El valor total del CDP = suma de sus líneas
- El objeto del CDP es la fuente de verdad para todo el proceso

**RP (Registro Presupuestal):**
- Atado 1:1 al CDP
- Sus líneas de rubro/fuente referencian las líneas del CDP (trazabilidad)
- El valor comprometido por línea debe ser ≤ al valor certificado en el CDP
- El RP asigna el contratista ganador

### CP-5: Gestión de Procesos

- El proceso nace del RP (hereda objeto, contratista y valor sin duplicarlos)
- Tipo de proceso seleccionado del catálogo
- Código único por vigencia: CTR-01-2026
- IVA: campo `tiene_iva` (boolean) + `valor_iva` (monto en pesos, ingresado manualmente)
- Fechas del proceso: firma, publicación, inicio, plazo, terminación, liquidación
- Estados: BORRADOR → ACTIVO → SUSPENDIDO → LIQUIDADO / ANULADO
- Cotizaciones: hasta 3 proponentes con valor total (sin detalle de artículos)
- Clasificación por códigos UNSPSC (N:M — varios códigos por proceso)

### CP-6: Cronograma

- Un cronograma por proceso (1:1)
- Etapas configurables con nombre, fechas de inicio/fin, hora y orden
- Cada etapa puede asociarse a un tipo de documento
- Las fechas del cronograma son de **planeación**
- Las fechas reales (firma, inicio, terminación) viven en el proceso

### CP-7: Generación de Documentos

Sistema de tres capas:
1. **Variable**: catálogo global que mapea `{{nombre_variable}}` → tabla.columna de la BD
2. **PlantillaVariable**: qué variables requiere cada plantilla (obligatorias o no)
3. **DocumentoGenerado**: instancia del documento con los valores reales usados

Flujo de generación:
1. Usuario selecciona el tipo de documento
2. Sistema consulta qué variables necesita la plantilla
3. Resuelve cada variable leyendo la BD
4. Verifica que todas las variables obligatorias tengan valor
5. Genera el archivo Word reemplazando `{{variable}}` por el valor real
6. Guarda el archivo en el expediente
7. Registra los valores usados en `DocumentoVariable` (auditoría)
8. Actualiza el checklist del expediente

Documentos soportados:
- **Precontractual**: CDP, Solicitud de Cotización, Comparativo de Propuestas, Estudio Previo
- **Contractual**: Registro Presupuestal, Contrato, Acta de Inicio
- **Ejecución**: Informe de Actividades, Acta de Supervisión, Acta de Recibo a Satisfacción, Factura
- **Liquidación**: Resolución de Pago, Comprobante de Egreso, Acta de Liquidación

### CP-8: Expediente Digital

- Un expediente por proceso (1:1), creado automáticamente
- Carpeta en el sistema de archivos: `/expedientes/{vigencia}/{codigo-proceso}/`
- Contiene documentos generados + anexos subidos manualmente
- **Checklist de completitud**: catálogo global de documentos requeridos
  - Cada ítem puede vincularse al anexo que lo satisface
  - `completitud (%) = ítems completados / total ítems × 100`
- El porcentaje se actualiza automáticamente al subir anexos
- Visible en el dashboard como indicador de procesos incompletos

### CP-9: Gestión de Plantillas

- Registro de plantillas Word (.docx) con su tipo de documento y versión
- Mapeo de variables: cuáles son obligatorias para generar el documento
- El sistema advierte antes de generar si faltan datos obligatorios
- Los valores usados en cada documento se guardan para auditoría

---

## 6. Otros Requerimientos del Sistema

### Usabilidad
- Formularios con validación inline (mensajes bajo cada campo)
- Toast notifications para éxito/error de operaciones
- Confirmación explícita antes de acciones destructivas
- Valores monetarios en formato COP: `$ 7.261.667,00`
- Fechas en formato colombiano: `16/02/2026`
- Números en letras para documentos: "SIETE MILLONES DOSCIENTOS..."

### Rendimiento
- Sistema local monousuario — sin restricciones críticas de rendimiento
- La generación de un documento Word debe completarse en < 5 segundos

### Confiabilidad
- Los datos del expediente no deben perderse ante cierre inesperado
- Las transacciones de BD deben ser atómicas (especialmente CDP + rubros, RP + rubros)

### Mantenibilidad
- El schema de la BD está versionado con migraciones Drizzle
- Las plantillas Word son archivos externos que se pueden actualizar sin recompilar

---

## 7. Requerimientos de Documentación

- Manual de uso básico embebido en la aplicación (tooltips y ayudas contextuales)
- El presente documento como referencia para mantenimiento futuro
- El `agent.md` como guía para el agente de desarrollo

---

## 8. Atributos de las Características

| Característica | Prioridad | Esfuerzo estimado | Estado |
|---|---|---|---|
| CP-1: Configuración | Alta | Bajo | ⬜ Pendiente implementar |
| CP-2: Catálogos | Alta | Bajo | ⬜ Pendiente implementar |
| CP-3: Contratistas | Alta | Medio | ⬜ Pendiente implementar |
| CP-4: Presupuesto (CDP+RP) | Alta | Medio | ⬜ Pendiente implementar |
| CP-5: Procesos | Alta | Medio | ⬜ Pendiente implementar |
| CP-6: Cronograma | Media | Bajo | ⬜ Pendiente implementar |
| CP-7: Generación documentos | Alta | Alto | ⬜ Pendiente implementar |
| CP-8: Expediente | Alta | Medio | ⬜ Pendiente implementar |
| CP-9: Plantillas | Media | Medio | ⬜ Pendiente implementar |
