import { NextRequest } from "next/server";
import { parseExcelFromBuffer } from "@/lib/parseExcel";
import { paginateFill } from "@/lib/paginateFill";
import { buildHtml } from "@/lib/buildHtml";
import { PDFDocument } from "pdf-lib";

// Importación condicional según el entorno
import chromium from "@sparticuz/chromium-min";
import puppeteer from "puppeteer-core";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // Archivos obligatorios: 1 Excel + 1 PDF
    const file = formData.get("file") as File | null;        // Excel
    const attach = formData.get("attachPdf") as File | null; // PDF
    if (!file || !attach) {
      return new Response("Debes adjuntar 1 Excel y 1 PDF.", { status: 400 });
    }

    // Parsear Excel → bloques VP
    const buf = Buffer.from(await file.arrayBuffer());
    const blocks = await parseExcelFromBuffer(buf);

    // Paginación con costos por sección
    const pages = paginateFill(blocks, {
      rowsPerPage: 14,
      groupHeaderUnits: 1,
      tableHeaderUnits: 1,
      continuedNoteUnits: 1,
      sectionSpacingUnits: 0,
    });

    // Generar HTML (sin título/logo/website)
    const html = buildHtml({ pages });

    // Detectar entorno: local vs Vercel
    const isLocal = !process.env.VERCEL;
    
    let executablePath: string;
    
    if (isLocal) {
      // Rutas locales de Chrome
      executablePath = process.platform === "win32"
        ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
        : process.platform === "darwin"
        ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
        : "/usr/bin/google-chrome";
    } else {
      // En Vercel, usa chromium-min
      executablePath = await chromium.executablePath(
        'https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar'
      );
    }

    // Lanzar Puppeteer (Chromium)
    const browser = await puppeteer.launch({
      args: isLocal ? [] : chromium.args,
      defaultViewport: { width: 1920, height: 1080 },
      executablePath,
      headless: true,
    });

    let generatedPdfBytes: Uint8Array;
    try {
      const page = await browser.newPage();
      await page.setViewport({ width: 1920, height: 1080 });
      await page.setContent(html, { waitUntil: ["load", "networkidle0"] });

      const pdfBuffer = await page.pdf({
        width: "1920px",
        height: "1080px",
        printBackground: true,
        preferCSSPageSize: true,
        margin: { top: "0", right: "0", bottom: "0", left: "0" },
      });

      generatedPdfBytes = new Uint8Array(pdfBuffer);
    } finally {
      await browser.close();
    }

    // Fusionar PDF adjunto: [p1, p2] adjunto → generado → última del adjunto
    const attachBytes = new Uint8Array(await attach.arrayBuffer());
    const srcAttach = await PDFDocument.load(attachBytes);
    const srcGen = await PDFDocument.load(generatedPdfBytes);
    const merged = await PDFDocument.create();

    const attachPageCount = srcAttach.getPageCount();
    const genPageCount = srcGen.getPageCount();

    const copyPages = async (src: PDFDocument, indices: number[]) => {
      const copies = await merged.copyPages(src, indices);
      copies.forEach((p) => merged.addPage(p));
    };

    // 1️⃣ Adj: páginas 1 y 2 si existen
    const firstTwo: number[] = [];
    if (attachPageCount >= 1) firstTwo.push(0);
    if (attachPageCount >= 2) firstTwo.push(1);
    if (firstTwo.length) await copyPages(srcAttach, firstTwo);

    // 2️⃣ Todas las generadas
    if (genPageCount > 0) {
      await copyPages(srcGen, Array.from({ length: genPageCount }, (_, i) => i));
    }

    // 3️⃣ Última del adjunto si existe
    if (attachPageCount >= 3) {
      await copyPages(srcAttach, [attachPageCount - 1]);
    }

    const mergedBytes = await merged.save();

    return new Response(Buffer.from(mergedBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="directory.pdf"`,
      },
    });
  } catch (err) {
    console.error("❌ PDF generation error:", err);
    return new Response("Internal error generating/merging PDF", { status: 500 });
  }
}