// Formatea número como moneda colombiana: $ 7.261.667,00
export function formatCOP(valor: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor);
}

// Formatea fecha ISO a formato colombiano: 16/02/2026
export function formatFecha(fecha: string): string {
  if (!fecha) return "";
  const date = new Date(fecha);
  // Usar UTC para evitar problemas de zona horaria si la fecha solo tiene año-mes-día
  const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(utcDate);
}

// Formatea fecha ISO en texto largo: 16 de febrero de 2026
export function formatFechaLarga(fecha: string): string {
  if (!fecha) return "";
  const date = new Date(fecha);
  const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(utcDate);
}

// Convierte número a texto en español para documentos
// Ejemplo: 7261667 → "SIETE MILLONES DOSCIENTOS SESENTA Y UN MIL SEISCIENTOS SESENTA Y SIETE"
export function numeroALetras(valor: number): string {
  function Unidades(num: number) {
    switch (num) {
      case 1:
        return "UN";
      case 2:
        return "DOS";
      case 3:
        return "TRES";
      case 4:
        return "CUATRO";
      case 5:
        return "CINCO";
      case 6:
        return "SEIS";
      case 7:
        return "SIETE";
      case 8:
        return "OCHO";
      case 9:
        return "NUEVE";
    }
    return "";
  }

  function Decenas(num: number) {
    const decena = Math.floor(num / 10);
    const unidad = num - decena * 10;
    switch (decena) {
      case 1:
        switch (unidad) {
          case 0:
            return "DIEZ";
          case 1:
            return "ONCE";
          case 2:
            return "DOCE";
          case 3:
            return "TRECE";
          case 4:
            return "CATORCE";
          case 5:
            return "QUINCE";
          default:
            return "DIECI" + Unidades(unidad);
        }
      case 2:
        switch (unidad) {
          case 0:
            return "VEINTE";
          default:
            return "VEINTI" + Unidades(unidad);
        }
      case 3:
        return DecenasY("TREINTA", unidad);
      case 4:
        return DecenasY("CUARENTA", unidad);
      case 5:
        return DecenasY("CINCUENTA", unidad);
      case 6:
        return DecenasY("SESENTA", unidad);
      case 7:
        return DecenasY("SETENTA", unidad);
      case 8:
        return DecenasY("OCHENTA", unidad);
      case 9:
        return DecenasY("NOVENTA", unidad);
      case 0:
        return Unidades(unidad);
    }
    return "";
  }

  function DecenasY(strSin: string, numUnidades: number) {
    if (numUnidades > 0) return strSin + " Y " + Unidades(numUnidades);
    return strSin;
  }

  function Centenas(num: number) {
    const centenas = Math.floor(num / 100);
    const decenas = num - centenas * 100;
    switch (centenas) {
      case 1:
        if (decenas > 0) return "CIENTO " + Decenas(decenas);
        return "CIEN";
      case 2:
        return "DOSCIENTOS " + Decenas(decenas);
      case 3:
        return "TRESCIENTOS " + Decenas(decenas);
      case 4:
        return "CUATROCIENTOS " + Decenas(decenas);
      case 5:
        return "QUINIENTOS " + Decenas(decenas);
      case 6:
        return "SEISCIENTOS " + Decenas(decenas);
      case 7:
        return "SETECIENTOS " + Decenas(decenas);
      case 8:
        return "OCHOCIENTOS " + Decenas(decenas);
      case 9:
        return "NOVECIENTOS " + Decenas(decenas);
    }
    return Decenas(decenas);
  }

  function Seccion(
    num: number,
    divisor: number,
    strSingular: string,
    strPlural: string,
  ) {
    const cientos = Math.floor(num / divisor);
    const resto = num - cientos * divisor;
    let letras = "";
    if (cientos > 0) {
      if (cientos > 1) letras = Centenas(cientos) + " " + strPlural;
      else letras = strSingular;
    }
    if (resto > 0) letras += "";
    return letras;
  }

  function Miles(num: number) {
    const divisor = 1000;
    const cientos = Math.floor(num / divisor);
    const resto = num - cientos * divisor;
    const strMiles = Seccion(num, divisor, "MIL", "MIL");
    const strCentenas = Centenas(resto);
    if (strMiles === "") return strCentenas;
    return strMiles + " " + strCentenas;
  }

  function Millones(num: number) {
    const divisor = 1000000;
    const cientos = Math.floor(num / divisor);
    const resto = num - cientos * divisor;
    const strMillones = Seccion(num, divisor, "UN MILLON", "MILLONES");
    const strMiles = Miles(resto);
    if (strMillones === "") return strMiles;
    return strMillones + " " + strMiles;
  }

  if (valor === 0) return "CERO";
  const final = Millones(Math.floor(valor));
  return final.trim();
}

/* console.log(formatCOP(7261667));
console.log(formatFecha("2026-02-16"));
console.log(formatFechaLarga("2026-02-16"));
console.log(numeroALetras(7261667));
 */
