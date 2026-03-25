# Troubleshooting — Contra Mate

## Problema: `pnpm db:migrate` falla con "Could not locate the bindings file"

### Descripción

Al clonar el repositorio en un nuevo PC y ejecutar `pnpm db:migrate`, el comando falla con el siguiente error:

```
Error: Could not locate the bindings file.
Tried:
  ...better_sqlite3.node
  ...
```

### Causa

`better-sqlite3` es un módulo nativo de Node.js que requiere un binario compilado (`.node`) específico para cada plataforma y versión de Node. Al clonar el repositorio:

- `pnpm install` descarga los archivos fuente del módulo pero **no compila el binario nativo** en Windows.
- `pnpm rebuild` tampoco genera el binario correctamente en este entorno.
- Sin el binario, `drizzle-kit` no puede conectarse a SQLite y falla al ejecutar migraciones.

### Solución

Después de ejecutar `pnpm install`, correr manualmente:

```bash
npm rebuild better-sqlite3
```

Esto compila el binario nativo para la plataforma actual (Windows x64 + Node v22) y permite que `pnpm db:migrate` funcione correctamente.

### Pasos completos en un PC nuevo

```bash
# 1. Instalar dependencias
pnpm install

# 2. Compilar el binario nativo de better-sqlite3
npm rebuild better-sqlite3

# 3. Aplicar migraciones
pnpm db:migrate
```

### Automatización opcional

Para evitar el paso manual, agregar en `package.json`:

```json
{
  "scripts": {
    "postinstall": "npm rebuild better-sqlite3"
  }
}
```

Esto hará que el binario se compile automáticamente después de cada `pnpm install`.

### Entorno afectado

| Componente   | Versión       |
|--------------|---------------|
| OS           | Windows       |
| Node.js      | v22.14.0      |
| pnpm         | 10.13.1       |
| better-sqlite3 | ^12.8.0    |
| drizzle-kit  | ^0.31.10      |

---

## Problema: `pnpm dlx shadcn init` falla con `ERR_PNPM_ADDING_TO_ROOT`

### Descripción
Al intentar inicializar shadcn en la raíz del proyecto, el comando falla durante la instalación de dependencias internas.

### Causa
Pnpm bloquea por seguridad la instalación de dependencias en la raíz de un workspace sin el flag `-w`. Como el CLI de shadcn ejecuta `pnpm add` internamente sin este flag, la operación es rechazada.

### Solución
Crear un archivo `.npmrc` en la raíz del proyecto con la siguiente línea:
```ini
ignore-workspace-root-check=true
```
Esto permite que herramientas externas instalen dependencias en la raíz del workspace automáticamente.

---

## Problema: TypeScript "No overload matches this call" en `seed.ts`

### Descripción
Errores de tipado al intentar insertar datos en tablas con campos `Enum` o `Literal` usando el método `.values()`.

### Causa
TypeScript infiere los arreglos de objetos con tipos genéricos (ej. `string`) en lugar de los tipos literales específicos requeridos por el esquema de Drizzle.

### Solución
Utilizar los tipos inferidos directamente del esquema y/o usar `as const` para strings específicos:
```typescript
import { type NuevoFuncionario } from "@/db/schema";
// ...
const data: NuevoFuncionario[] = [{ rol: "RECTOR", ... }]; // El tipo valida el string
```

---

## Problema: `pnpm db:migrate` falla con Error 1 (en Desarrollo)

### Descripción
El comando de migración se detiene abruptamente sin un mensaje de error claro durante la aplicación.

### Causa
Desincronización entre el archivo `.db` físico y el historial de migraciones (ocurre frecuentemente al alternar entre `db:push` y `db:migrate`, o si una migración falló previamente).

### Solución
En entorno de desarrollo, lo más efectivo es reiniciar el estado:
1. Borrar `db/contra-mate.db`.
2. Borrar carpeta `db/migrations` (opcional).
3. Ejecutar `pnpm db:generate` + `pnpm db:migrate` + `pnpm db:seed`.

Se ha añadido el script `pnpm db:reset` en `package.json` para automatizar este proceso.
