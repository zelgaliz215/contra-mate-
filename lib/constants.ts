export const ROLES_FUNCIONARIO = [
  { value: "RECTOR", label: "Rector" },
  { value: "PAGADOR", label: "Pagador" },
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

export const NAVIGATION = [
  {
    group: "Configuración",
    icon: "Settings",
    items: [
      { label: "Institución", href: "/configuracion" },
      { label: "Funcionarios", href: "/funcionarios" },
      { label: "Catálogos", href: "/catalogos" },
    ],
  },
  {
    group: "Contratistas",
    icon: "Users",
    href: "/contratistas",
  },
  {
    group: "Presupuesto",
    icon: "DollarSign",
    items: [
      { label: "CDPs", href: "/cdps" },
      { label: "Registros Presupuestales", href: "/registros-presupuestales" },
    ],
  },
  {
    group: "Procesos",
    icon: "FileText",
    href: "/procesos",
  },
  {
    group: "Plantillas",
    icon: "Folder",
    href: "/plantillas",
  },
] as const;
