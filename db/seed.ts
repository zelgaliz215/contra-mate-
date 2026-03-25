import { db } from "@/db";
//Importar tablas
import {
  instituciones,
  funcionarios,
  fuentes,
  rubros,
  tiposProceso,
  codigosUnspsc,
  tiposDocumento,
} from "@/db/schema";

//Importar tipos
import type {
  NuevaInstitucion,
  NuevoFuncionario,
  NuevaFuente,
  NuevoRubro,
  NuevoTipoProceso,
  NuevoCodigoUnspsc,
  NuevoTipoDocumento,
} from "@/types";

import { eq } from "drizzle-orm";

async function seedInstitucion(): Promise<number | undefined> {
  console.log("Cargando los datos de la institucion...");

  const data: NuevaInstitucion = {
    nombre: "Institucion Educativa Dulce Nombre de Jesus",
    siglas: "IEDNJ",
    nit: "823001921",
    municipio: "Sincelejo",
    departamento: "Sucre",
    telefono: "3153541234",
    email: "tmdaneil@gmail.com",
  };

  const [inst_data] = await db
    .insert(instituciones)
    .values(data)
    .onConflictDoNothing({ target: instituciones.nit })
    .returning({ id: instituciones.id });

  let institucionId: number | undefined = inst_data?.id;

  if (!institucionId) {
    const r = await db.query.instituciones.findFirst({
      where: eq(instituciones.nit, data.nit),
    });
    institucionId = r?.id;
  }

  console.log("✅ Institución cargada con ID:", institucionId);
  return institucionId;
}

async function seedFuncionarios(institucionId: number) {
  console.log("Cargando funcionarios...");

  const funcionariosData: NuevoFuncionario[] = [
    {
      institucionId,
      rol: "RECTOR",
      nombreCompleto: "Dr. Alberto Pérez",
      tipoIdentificacion: "CC",
      numeroIdentificacion: "12345678",
      cargoOficial: "Rector",
    },
    {
      institucionId,
      rol: "PAGADOR",
      nombreCompleto: "Sra. María González",
      tipoIdentificacion: "CC",
      numeroIdentificacion: "87654321",
      cargoOficial: "Pagador",
    },
    {
      institucionId,
      rol: "CONTADOR",
      nombreCompleto: "Sr. Carlos Rodríguez",
      tipoIdentificacion: "CC",
      numeroIdentificacion: "11223344",
      cargoOficial: "Contador",
    },
    {
      institucionId,
      rol: "SUPERVISOR",
      nombreCompleto: "Sra. Ana Martínez",
      tipoIdentificacion: "CC",
      numeroIdentificacion: "55667788",
      cargoOficial: "Supervisor de Contratos",
    },
  ];
  //insertar funcionarios
  await db
    .insert(funcionarios)
    .values(funcionariosData)
    .onConflictDoNothing({ target: funcionarios.numeroIdentificacion }); //Evita duplicados
  console.log("✅ Funcionarios cargados");
}

async function seedCatalogos() {
  console.log("Cargando catálogos...");

  // Fuentes
  const fuentesData: NuevaFuente[] = [
    { codigo: "SGP", nombre: "Sistema General de Participaciones" },
    { codigo: "PROPIOS", nombre: "Recursos Propios" },
  ];
  //insertar fuentes
  await db
    .insert(fuentes)
    .values(fuentesData)
    .onConflictDoNothing({ target: fuentes.codigo });

  // Rubros
  const rubrosData: NuevoRubro[] = [
    { codigo: "01", descripcion: "Materiales y Suministros" },
    { codigo: "02", descripcion: "Servicios Técnicos" },
  ];
  await db
    .insert(rubros)
    .values(rubrosData)
    .onConflictDoNothing({ target: rubros.codigo });

  // Tipos de Proceso
  const procesosData: NuevoTipoProceso[] = [
    { nombre: "Mínima Cuantía", naturaleza: "Contratación" },
    { nombre: "Contratación Directa", naturaleza: "Contratación" },
  ];
  await db
    .insert(tiposProceso)
    .values(procesosData)
    .onConflictDoNothing({ target: tiposProceso.nombre });

  // Códigos UNSPSC
  const unspscData: NuevoCodigoUnspsc[] = [
    { codigo: "43211500", descripcion: "Computadores" },
    { codigo: "44120000", descripcion: "Suministros de Oficina" },
  ];
  await db
    .insert(codigosUnspsc)
    .values(unspscData)
    .onConflictDoNothing({ target: codigosUnspsc.codigo });

  // Tipos de Documento
  const documentosData: NuevoTipoDocumento[] = [
    {
      nombre: "Estudio Previo",
      categoria: "PRECONTRACTUAL",
      descripcion: "Documento de análisis inicial",
    },
    {
      nombre: "Contrato",
      categoria: "CONTRACTUAL",
      descripcion: "Documento oficial de acuerdo",
    },
  ];
  await db.insert(tiposDocumento).values(documentosData).onConflictDoNothing();

  console.log("✅ Catálogos cargados");
}

async function main() {
  try {
    console.log("🚀 Iniciando carga del seed...");

    // 1. Cargar datos base (Institución y Funcionarios)
    const instId = await seedInstitucion();
    if (instId) {
      await seedFuncionarios(instId);
    }

    // 2. Cargar Catálogos
    await seedCatalogos();

    console.log("⭐⭐ Seed completado con éxito ⭐⭐");
  } catch (error) {
    console.error("❌ Error al cargar el seed:", error);
    process.exit(1);
  }
}

main();
