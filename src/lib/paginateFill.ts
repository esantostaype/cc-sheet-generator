// src/lib/paginateFill.ts
import type { VPBlock } from "@/interfaces";

export type PageSection = {
  vp: string;
  regions: string[];
  rows: VPBlock["rows"];     // las filas de este trozo
  continuedFrom?: string;    // ← Continued from 'VP – …'
  showGroupHeader: boolean;  // true si es la primera sección del VP
};

export type Page = { sections: PageSection[] };

type Options = {
  // Capacidad total en “unidades” por página (1 unidad ~= 1 fila)
  rowsPerPage?: number;

  // Costos fijos (en unidades) por sección
  groupHeaderUnits?: number;     // costo del DIV “VP – … / STATES”
  tableHeaderUnits?: number;     // costo del THEAD de la tabla de esa sección
  continuedNoteUnits?: number;   // costo de la nota “← Continued…”
  sectionSpacingUnits?: number;  // separación inferior (margen) entre secciones (opcional)
};

/**
 * Empaqueta por página teniendo en cuenta:
 * - Cada sección imprime su propia TABLA (por eso el thead cuenta por sección).
 * - La PRIMERA sección de un VP usa groupHeaderUnits.
 * - Las continuaciones usan continuedNoteUnits.
 * - Si no cabe (fijo + 1 fila), fuerza salto de página.
 */
export function paginateFill(
  blocks: VPBlock[],
  opts: Options = {}
): Page[] {
  const rowsPerPage        = opts.rowsPerPage ?? 12;
  const groupHeaderUnits   = opts.groupHeaderUnits ?? 1;
  const tableHeaderUnits   = opts.tableHeaderUnits ?? 1;
  const continuedNoteUnits = opts.continuedNoteUnits ?? 1;
  const sectionSpacing     = opts.sectionSpacingUnits ?? 0;

  const pages: Page[] = [];
  let current: Page | null = null;
  let used = 0; // unidades usadas en la página actual

  const newPage = () => {
    current = { sections: [] };
    pages.push(current);
    used = 0;
  };
  const ensurePage = () => current ?? newPage();

  for (const b of blocks) {
    const rows = b.rows;
    // Caso VP sin filas: sólo imprime encabezado + tabla vacía (o puedes omitirlo)
    if (rows.length === 0) {
      ensurePage();
      // costo: header de VP + thead (aunque no haya filas)
      const fixed = groupHeaderUnits + tableHeaderUnits + sectionSpacing;
      if (used + fixed > rowsPerPage) newPage();
      current!.sections.push({
        vp: b.vp,
        regions: b.regions,
        rows: [],
        showGroupHeader: true,
      });
      used += fixed;
      continue;
    }

    let i = 0;
    let firstOfVP = true;

    while (i < rows.length) {
      ensurePage();

      // costo fijo según sea primera sección (header VP) o continuación (nota)
      const fixed =
        (firstOfVP ? groupHeaderUnits : continuedNoteUnits) +
        tableHeaderUnits +
        sectionSpacing;

      // ¿cabe el “fijo + al menos 1 fila” en la página actual?
      if (used + fixed + 1 > rowsPerPage) {
        newPage();
      }

      // capacidad real para filas en esta sección
      const capacity = rowsPerPage - used - fixed;
      if (capacity <= 0) {
        // En teoría no debería pasar por la verificación previa,
        // pero por seguridad: nueva página y recalcular.
        newPage();
      }
      const capNow = rowsPerPage - used - fixed;
      const take = Math.max(1, Math.min(capNow, rows.length - i));

      const slice = rows.slice(i, i + take);
      current!.sections.push({
        vp: b.vp,
        regions: b.regions,
        rows: slice,
        continuedFrom: firstOfVP ? undefined : `<- Continued from 'VP – ${b.vp}'`,
        showGroupHeader: firstOfVP,
      });

      used += fixed + take;
      i += take;
      firstOfVP = false;

      if (used >= rowsPerPage) {
        newPage();
      }
    }
  }

  return pages;
}
