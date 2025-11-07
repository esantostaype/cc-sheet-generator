import { PageChunk, VPBlock } from "@/interfaces"

type PaginateOptions = {
  maxRowsPerPage?: number // por defecto 12 (ajústalo a tu estilo)
}

export function paginateVPBlocks(
  blocks: VPBlock[],
  opts: PaginateOptions = {}
): PageChunk[] {
  const max = opts.maxRowsPerPage ?? 12
  const pages: PageChunk[] = []

  for (const b of blocks) {
    let i = 0
    while (i < b.rows.length) {
      const slice = b.rows.slice(i, i + max)
      const continued =
        i > 0 ? `← Continued from 'VP – ${b.vp}'` : undefined

      pages.push({
        vp: b.vp,
        regions: b.regions,
        rows: slice,
        continuedFrom: continued,
      })
      i += max
    }

    // Caso VP sin filas (igual quieres mostrar la tabla vacía):
    if (b.rows.length === 0) {
      pages.push({
        vp: b.vp,
        regions: b.regions,
        rows: [],
      })
    }
  }
  return pages
}
