// src/lib/buildHtml.ts
import type { Page } from "@/interfaces";

type BuildHtmlParams = {
  pages: Page[];
};

export function buildHtml({ pages }: BuildHtmlParams) {
  const extraCss = `
    @page { size: 1920px 1080px; margin: 0; }
  * { box-sizing: border-box; font-family: Inter, Arial, sans-serif; }
    html, body { background: #fff; }
    .page { width: 1920px; height: 1080px; page-break-after: always; }
    /* Evitar que la tabla salte mal entre filas */
    table { border-collapse: collapse; }
    thead { display: table-header-group; }
    tfoot { display: table-footer-group; }
  `;

  const safe = (s: string) =>
    (s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const pageHtml = pages
    .map((pg) => {
      const sectionsMarkup = pg.sections
        .map((sec) => {
          const headerDiv = sec.showGroupHeader
            ? `
              <div class="flex items-center justify-between gap-3 font-bold mt-8 first:mt-0 mb-2">
                <span class="text-3xl leading-1 text-[#173152]"> ${safe(`VP – ${sec.vp}`)} </span>
                <span class="h-[2px] flex-1 bg-[#173152]"></span>
                <span class="text-2xl leading-1 text-[#173152] uppercase"> ${safe((sec.regions || []).join(" / "))} </span>
              </div>`
            : "";

          const contDiv = sec.continuedFrom
            ? `<div class="text-base font-semibold text-slate-400 my-2">${safe(sec.continuedFrom)}</div>`
            : "";

          const rows = sec.rows
            .map(
              (r) => `
              <tr class="odd:bg-slate-100">
                <td class="font-bold text-xl text-[#6F8CC0] px-4 py-3">${safe(r.fullName)}</td>
                <td class="px-4 py-3">${safe(r.title)}</td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <svg viewBox="0 0 32 32" class="fill-slate-500 w-[20px]">
                      <path d="M22.8,10.1l-4.3,2.4c-2.2,1.2-2.7,1.2-4.9,0l-4.3-2.4c-.6-.3-1.4-.1-1.7.5-.3.6-.1,1.4.5,1.7l4.3,2.4c1.4.8,2.5,1.2,3.6,1.2s2.2-.4,3.6-1.2l4.3-2.4c.6-.3.8-1.1.5-1.7-.3-.6-1.1-.8-1.7-.5Z M29.8,5.2c-2-1.9-4.7-1.9-9.5-2.1-2.9,0-5.7,0-8.6,0-4.8.1-7.4.2-9.5,2.1C.2,7.1.1,9.6,0,14,0,15.3,0,16.7,0,18H0c.1,4.4.2,6.8,2.2,8.7,2,1.9,4.7,1.9,9.5,2.1,1.4,0,2.9,0,4.3,0s2.9,0,4.3,0c4.8-.1,7.4-.2,9.5-2.1,2.1-1.9,2.1-4.3,2.2-8.7,0-1.4,0-2.7,0-4.1-.1-4.4-.2-6.8-2.2-8.7ZM29.5,18c0,4.3-.2,5.8-1.4,7-1.3,1.2-3.2,1.3-7.8,1.4-2.9,0-5.6,0-8.5,0-4.6-.1-6.5-.2-7.8-1.4-1.2-1.1-1.3-2.7-1.4-7h0c0-1.3,0-2.7,0-4,0-4.3.2-5.8,1.4-7,1.3-1.2,3.2-1.3,7.8-1.4,2.9,0,5.6,0,8.5,0,4.6.1,6.5.2,7.8,1.4,1.2,1.1,1.3,2.7,1.4,7,0,1.3,0,2.7,0,4Z"/>
                    </svg>
                    ${safe(r.email)}
                  </div>
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <svg class="fill-slate-500 h-[20px]" viewBox="0 0 24 32">
                      <path d="M12,22.7h0c-1,0-1.8.8-1.8,1.8s.8,1.8,1.8,1.8,1.8-.8,1.8-1.8-.8-1.8-1.8-1.8Z M23.1,7.5c0-2.7-.1-4.6-1.4-5.9-1.4-1.6-3.4-1.6-6.9-1.6h-5.6C5.6,0,3.7,0,2.2,1.6c-1.4,1.5-1.4,3.6-1.4,7.5v13.9c0,3.8,0,6,1.4,7.5,1.4,1.6,3.4,1.6,6.9,1.6h5.6c3.6,0,5.5,0,6.9-1.6,1.2-1.4,1.3-3.2,1.4-5.9V7.5s0,0,0,0ZM20.5,24.5c0,2.3-.1,3.6-.7,4.2-.6.7-1.9.7-5,.7h-5.6c-3.1,0-4.4,0-5-.7-.7-.8-.7-2.5-.7-5.7v-13.9c0-3.2,0-5,.7-5.7.6-.7,1.9-.7,5-.7h5.6c3.1,0,4.4,0,5,.7.6.6.7,1.8.7,4.2v17Z"/>
                    </svg>
                    ${safe(r.phone)}
                  </div>
                </td>
                <td class="px-4 py-3">${safe(r.location)}</td>
              </tr>`
            )
            .join("");

          const table = `
            <div class="overflow-hidden border-2 border-slate-300 rounded-lg mb-3">
            <table class="w-full">
              <thead class="text-lg font-semibold">
                <tr class="text-[#173152]">
                  <th class="w-[16%] text-left font-bold px-4 py-3 border-b-2 border-slate-300">
                    FULL NAME
                  </th>
                  <th class="w-[34%] text-left font-bold px-4 py-3 border-b-2 border-slate-300">
                    TITLE
                  </th>
                  <th class="w-[22%] text-left font-bold px-4 py-3 border-b-2 border-slate-300">
                    EMAIL
                  </th>
                  <th class="w-[14%] text-left font-bold px-4 py-3 border-b-2 border-slate-300">
                    PHONE
                  </th>
                  <th class="w-[14%] text-left font-bold px-4 py-3 border-b-2 border-slate-300">
                    LOCATION
                  </th>
                </tr>
              </thead>
              <tbody class="text-slate-600 text-lg font-medium">
                ${rows}
              </tbody>
            </table>
            </div>
          `;

          // Estructura: (header de grupo) o (continued), seguido de su tabla
          return `${headerDiv || contDiv ? headerDiv + contDiv : ""}${table}`;
        })
        .join("");

      return `
      <section class="page relative bg-white p-16 pr-28">
        <!-- Header global -->
        <header class="flex items-center justify-between">
          <div class="text-6xl font-bold text-[#6F8CC0] leading-1 mb-8">Territory – Add. Contacts</div>
          <div class="w-[200px] grid place-items-center">
            <img src="https://inszoneinsurance.com/wp-content/uploads/2025/11/logo.svg" alt="Logo" class="max-w-full" />
          </div>
        </header>

        <!-- Contenido -->
        <main class="mt-6">
          ${sectionsMarkup}
        </main>

        <!-- Footer global -->
        <footer class="absolute left-16 right-16 bottom-10 flex items-center gap-2">
          <svg fill="#6f8cc0" viewBox="0 0 32 32" class="size-10">
            <path d="M16,0C7.2,0,0,7.2,0,16s7.2,16,16,16,16-7.2,16-16S24.8,0,16,0ZM12.2,21.7h7.6c-1,3.4-2.8,5.9-3.8,7.2-1-1.3-2.8-3.9-3.8-7.2ZM11.6,19.2c-.2-1-.3-2.1-.3-3.2s.1-2.2.3-3.2h8.8c.2,1,.3,2.1.3,3.2s-.1,2.2-.3,3.2h-8.8ZM2.5,16c0-1.1.1-2.2.4-3.2h6.2c-.2,1-.2,2.1-.2,3.2s0,2.2.2,3.2H2.9c-.3-1-.4-2.1-.4-3.2ZM19.8,10.3h-7.6c1-3.4,2.8-5.9,3.8-7.2,1,1.3,2.8,3.9,3.8,7.2ZM22.9,12.8h6.2c.3,1,.4,2.1.4,3.2s-.1,2.2-.4,3.2h-6.2c.2-1,.2-2.1.2-3.2s0-2.2-.2-3.2ZM28.3,10.3h-5.9c-.9-3.3-2.4-5.9-3.6-7.6,4.2.9,7.7,3.8,9.5,7.6ZM13.2,2.8c-1.2,1.7-2.7,4.3-3.6,7.6H3.7c1.8-3.8,5.3-6.7,9.5-7.6ZM3.7,21.7h5.9c.9,3.3,2.4,5.9,3.6,7.6-4.2-.9-7.7-3.8-9.5-7.6ZM18.8,29.2c1.2-1.7,2.7-4.3,3.6-7.6h5.9c-1.8,3.8-5.3,6.7-9.5,7.6Z"/>

          </svg>
          <div class="text-3xl font-semibold text-[#6F8CC0]">
            inszoneinsurance.com
          </div>          
        </footer>
        <div class='absolute top-0 right-0 w-[960px] h-full'>
          <svg viewBox="0 0 960 1080" fill="#6f8cc0" class="w-full h-full">
            <g>
              <path class="st0" d="M917.3,0H0c0,23.6,19.1,42.7,42.7,42.7h832c23.6,0,42.7,19.1,42.7,42.7v994.7h42.7V0h-42.7Z"/>
            </g>
          </svg>
        </div>
      </section>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charSet="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <!-- Tailwind via CDN (para pruebas). En producción: CSS precompilado/inlinado. -->
    <script src="https://cdn.tailwindcss.com"></script>
    <style>${extraCss}</style>
  </head>
  <body class="bg-white">${pageHtml}</body>
</html>`;
}