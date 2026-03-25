export type ActionResult<T = void> =
  | { success: true; data: T; message: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export type {
  Institucion,
  NuevaInstitucion,
  Funcionario,
  NuevoFuncionario,
  Fuente,
  NuevaFuente,
  Rubro,
  NuevoRubro,
  TipoProceso,
  NuevoTipoProceso,
  CodigoUnspsc,
  NuevoCodigoUnspsc,
  TipoDocumento,
  NuevoTipoDocumento,
} from "@/db/schema";
