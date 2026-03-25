import { db } from "@/db"; // Se importa la instancia de la bd
import { instituciones, funcionarios } from "@/db/schema"; // Se importa el schema de instituciones la bd
import { eq } from "drizzle-orm";

async function seedInstitucion() {
  // Cargar datos de la institucion
  console.log("Cargando los datos de la institucion");

  const [inst_data] = await db
    .insert(instituciones)
    .values({
      nombre: "Institucion Educativa Dulce Nombre de Jesus",
      siglas: "IEDNJ",
      nit: "823001921",
      municipio: "Sincelejo",
      departamento: "Sucre",
      telefono: "3153541234",
      email: "tmdaneil@gmail.com",
    })
    .onConflictDoNothing({ target: instituciones.nit })
    .returning({ id: instituciones.id });
  console.log("Datos de la institucion cargados");

  //
  // Si ya existía, inst será undefined, así que lo buscamos por NIT
  let institucionId: number | undefined = inst_data?.id;
  if (!institucionId) {
    const r = await db.query.instituciones.findFirst({
      where: eq(instituciones.nit, "823001921"),
    });
    institucionId = r?.id;
  }

  console.log("✅ Institución cargada con ID:", institucionId);
  return institucionId; // Retornamos el ID para usarlo después
}

async function seedFuncionarios(institucionId: number) {
  console.log("Cargando funcionarios");

  const funcionariosData = [
    {
      institucionId,
      rol: "RECTOR" as const,
      nombreCompleto: "Dr. Alberto Pérez",
      tipoIdentificacion: "CC" as const,
      numeroIdentificacion: "12345678",
      cargoOficial: "Rector",
    },
    {
      institucionId,
      rol: "PAGADOR" as const,
      nombreCompleto: "Sra. María González",
      tipoIdentificacion: "CC" as const,
      numeroIdentificacion: "87654321",
      cargoOficial: "Pagador",
    },
    {
      institucionId,
      rol: "CONTADOR" as const,
      nombreCompleto: "Sr. Carlos Rodríguez",
      tipoIdentificacion: "CC" as const,
      numeroIdentificacion: "11223344",
      cargoOficial: "Contador",
    },
    {
      institucionId,
      rol: "SUPERVISOR" as const,
      nombreCompleto: "Sra. Ana Martínez",
      tipoIdentificacion: "CC" as const,
      numeroIdentificacion: "55667788",
      cargoOficial: "Supervisor de Contratos",
    },
  ];

  await db.insert(funcionarios).values(funcionariosData);
  console.log("✅ Funcionarios cargados");
}

async function main() {
  try {
    // 1. Carga inicial de la institucion
    console.log("Iniciando carga del seed");
    // llamar a funcion que carga los datos de la institucuion
    const id = await seedInstitucion();
    if (id) {
      await seedFuncionarios(id);
    }
  } catch (error) {
    console.error("Error al cargar el seed", error);
    process.exit(1);
  }
}

main();
