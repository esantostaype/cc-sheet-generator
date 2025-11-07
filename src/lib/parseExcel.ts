/* eslint-disable @typescript-eslint/no-explicit-any */
import * as XLSX from "xlsx";
import type { UserRow, VPBlock } from "@/interfaces";

const norm = (s: any) => String(s ?? "").trim();
const upper = (s: any) => norm(s).toUpperCase();

function isRemoteCity(city: string) {
  return norm(city).toLowerCase() === "remote";
}

function combineLocation(city?: string, state?: string, fallback?: string) {
  const c = norm(city || "");
  const st = upper(state || "");

  if (isRemoteCity(c)) return "Remote";        // regla: Remote ignora state
  if (c && st) return `${c}, ${st}`;
  if (c) return c;
  if (st) return st;
  return norm(fallback || "");
}

export async function parseExcelFromBuffer(buf: Buffer): Promise<VPBlock[]> {
  const wb = XLSX.read(buf, { type: "buffer" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<any>(ws, { defval: "" });

  const users: UserRow[] = rows.map((r: any) => {
    const vp = norm(r["VP"]);
    const regions = norm(r["Regions"])
      .split(",")
      .map((s: string) => norm(s))
      .filter(Boolean);

    const officeCity = norm(r["Office City"] ?? r["City"]);
    const state = upper(r["State"] ?? r["Office State"]);
    const legacyLoc = norm(r["Location"] || r["Locations"]);

    const location = combineLocation(officeCity, state, legacyLoc);

    return {
      vp,
      regions,
      fullName: norm(r["Full Name"]),
      title: norm(r["Title"]),
      email: norm(r["Email"]),
      phone: norm(r["Phone"]),
      officeCity,
      state,
      location, // <- se usa para renderizar
    };
  });

  // Agrupar por VP conservando orden de aparición en el Excel
  const map = new Map<string, VPBlock>();
  for (const u of users) {
    if (!map.has(u.vp)) map.set(u.vp, { vp: u.vp, regions: u.regions, rows: [] });
    const bucket = map.get(u.vp)!;
    if (u.regions.length) bucket.regions = u.regions; // última no-vacía
    bucket.rows.push(u);
  }

  return Array.from(map.values());
}
