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
