/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useRef } from "react";

export default function Home() {
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [selectProgress, setSelectProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // animación decorativa (1s) al seleccionar válido
  const startSelectProgress = () => {
    setSelectProgress(0);
    let current = 0;
    const id = setInterval(() => {
      current += 5; // 20 pasos * 50ms = 1s
      setSelectProgress(current);
      if (current >= 100) clearInterval(id);
    }, 50);
  };

  const validateExactlyOneExcelAndOnePdf = (files: FileList) => {
    const arr = Array.from(files);
    if (arr.length !== 2) {
      throw new Error("You must attach exactly 2 files: 1 Excel and 1 PDF.");
    }

    const isExcel = (f: File) => {
      const ext = f.name.split(".").pop()?.toLowerCase();
      return ext === "xlsx" || ext === "xls";
    };
    const isPdf = (f: File) => f.name.toLowerCase().endsWith(".pdf");

    const excel = arr.find(isExcel) || null;
    const pdf = arr.find(isPdf) || null;

    if (!excel || !pdf) {
      throw new Error("It must be 1 Excel (.xlsx/.xls) and 1 PDF (.pdf).");
    }
    if (arr.filter(isExcel).length !== 1 || arr.filter(isPdf).length !== 1) {
      throw new Error("It must be 1 Excel and 1 PDF (exactly).");
    }

    return { excel, pdf };
  };

  const acceptFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    try {
      const { excel, pdf } = validateExactlyOneExcelAndOnePdf(files);
      setErrorMsg("");
      setExcelFile(excel);
      setPdfFile(pdf);
      startSelectProgress();
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid selection. Upload 1 Excel and 1 PDF.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setExcelFile(null);
      setPdfFile(null);
      setSelectProgress(0);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    acceptFiles(e.target.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => e.preventDefault();
  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    acceptFiles(e.dataTransfer.files);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!excelFile || !pdfFile) {
      setErrorMsg("You must attach 1 Excel and 1 PDF.");
      return;
    }
    if (errorMsg) return;

    try {
      setLoading(true);
      const fd = new FormData();
      fd.append("file", excelFile);       // Excel obligatorio
      fd.append("attachPdf", pdfFile);    // PDF obligatorio

      const res = await fetch("/api/generate-pdf", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Error generating PDF");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Carrier-Contact-Sheet.pdf";
      a.click();
      URL.revokeObjectURL(url);

      // limpiar
      setExcelFile(null);
      setPdfFile(null);
      setSelectProgress(0);
      setErrorMsg("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error(err);
      alert("Something went wrong generating the PDF 😕");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="h-dvh w-full flex items-center justify-center bg-gray-950 text-white">
      <div className="w-full max-w-xl">
        <h1 className="text-3xl text-center mb-4">Carrier Contact Sheet Generator</h1>

        <form onSubmit={handleSubmit} className="grid gap-4 w-full">
          {/* Drag & Drop */}
          <div>
            <label
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="flex items-center justify-center w-full h-32 px-4 transition bg-gray-900 border-2 border-gray-700 border-dashed rounded-md appearance-none cursor-pointer hover:border-accent focus:outline-none"
              title="Drop 1 Excel + 1 PDF, or click to browse"
            >
              <div className="flex flex-col justify-center items-center w-full text-center">
                <svg
                  className="w-8 h-8 text-gray-400 mb-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <span className="font-medium text-gray-400">
                  Drop <b>Excel + PDF</b> here, or{" "}
                  <span className="text-accent underline">Browse</span>
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  (Exactly 2 files: 1 Excel and 1 PDF)
                </span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".xlsx,.xls,application/pdf"
                onChange={handleInputChange}
                className="hidden"
              />
            </label>

            {/* Nombres de archivos */}
            {(excelFile || pdfFile) && (
              <div className="text-center mt-2 text-sm text-gray-300 space-y-1">
                {excelFile && (
                  <p>
                    <span className="text-accent">Excel:</span> {excelFile.name}
                  </p>
                )}
                {pdfFile && (
                  <p>
                    <span className="text-accent">PDF:</span> {pdfFile.name}
                  </p>
                )}
              </div>
            )}

            {/* Error */}
            {errorMsg && (
              <p className="text-center mt-2 text-sm text-red-400">{errorMsg}</p>
            )}

            {/* Barra decorativa (1s) */}
            {/* {excelFile && pdfFile && !loading && !errorMsg && (
              <div className="mt-3 w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-accent transition-all duration-75 ease-out"
                  style={{ width: `${selectProgress}%` }}
                />
              </div>
            )} */}
          </div>

          {/* Botón */}
          <button
            type="submit"
            disabled={!excelFile || !pdfFile || loading || !!errorMsg}
            className="p-4 bg-accent hover:bg-accent-700 transition text-white rounded flex items-center justify-center gap-2 disabled:opacity-30"
          >
            {loading ? (
              <>
                <svg
                  className="w-5 h-5 animate-spin text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v2m0 12v2m8-8h2M2 12H4m15.364-7.364l1.414 1.414M4.222 19.778l1.414-1.414M16.95 19.778l1.414-1.414M6.636 4.222l1.414 1.414"
                  />
                </svg>
                Generating PDF...
              </>
            ) : (
              "Generate PDF"
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
