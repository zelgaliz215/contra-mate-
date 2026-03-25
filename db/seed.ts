import { db } from "@/db"; // Se importa la instancia de la bd
import { instituciones } from "@/db/schema"; // Se importa el schema de instituciones la bd

async function seedInstitucion() {
  // Limpiar los datos
  console.log("Limpiando datos de la institucion...");
  //await db.delete(instituciones);
  console.log("Datos de la institucion limpiados");

  // Cargar datos de la institucion
  console.log("Cargando los datos de la institucion");

  const datosInstitucion = [
    {
      nombre: "Institucion Educativa Dulce Nombre de Jesus",
      siglas: "IEDNJ",
      nit: "823001921",
      municipio: "Sincelejo",
      departamento: "Sucre",
      telefono: "3153541234",
      email: "tmdaneil@gmail.com",
    },
  ];

  await db
    .insert(instituciones)
    .values(datosInstitucion)
    .onConflictDoNothing({ target: instituciones.nit });
  console.log("Datos de la institucion cargados");
}

async function main() {
  try {
    // 1. Carga inicial de la institucion
    console.log("Iniciando carga del seed");
    // llamar a funcion que carga los datos de la institucuion
    await seedInstitucion();
  } catch (error) {
    console.error("Error al cargar el seed", error);
    process.exit(1);
  }
}

main();
