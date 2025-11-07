// app/pdf/Template.tsx
import { PageChunk } from "@/interfaces";
import Image from "next/image";
import React from "react";

type Props = {
  title: string;
  logoUrl?: string;        // puede ser base64 o ruta pública
  website?: string;        // ej.: website.com
  pages: PageChunk[];
};

export default function Template({ title, logoUrl, website, pages }: Props) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <style>{css}</style>
      </head>
      <body>
        {pages.map((p, idx) => (
          <section className="page" key={idx}>
            <header className="header">
              <div className="title">{title}</div>
              {logoUrl ? (
                <Image className="logo" src={logoUrl} alt="Logo" />
              ) : (
                <div className="logo placeholder">Logo</div>
              )}
            </header>

            <main className="content">
              {p.continuedFrom && (
                <div className="continued">{p.continuedFrom}</div>
              )}

              <div className="table-header">
                <div className="vp">{p.vp ? `VP – ${p.vp}` : ""}</div>
                <div className="regions">
                  {p.regions.join(" / ").toUpperCase()}
                </div>
              </div>

              <table className="table">
                <thead>
                  <tr>
                    <th>FULL NAME</th>
                    <th>TITLE</th>
                    <th>EMAIL</th>
                    <th>PHONE</th>
                    <th>LOCATION</th>
                  </tr>
                </thead>
                <tbody>
                  {p.rows.length === 0 ? (
                    <tr className="empty">
                      <td colSpan={5}>&nbsp;</td>
                    </tr>
                  ) : (
                    p.rows.map((r, i) => (
                      <tr key={i}>
                        <td>{r.fullName}</td>
                        <td>{r.title}</td>
                        <td>{r.email}</td>
                        <td>{r.phone}</td>
                        <td>{r.location}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </main>

            <footer className="footer">
              <div className="website">{website || "website.com"}</div>
            </footer>
          </section>
        ))}
      </body>
    </html>
  );
}

const css = `
  @page { size: 1920px 1080px; margin: 0; }
  * { box-sizing: border-box; font-family: Inter, Arial, sans-serif; }
  body { margin:0; background:#f5f7fb; }
  .page {
    width: 1920px; height: 1080px; position: relative;
    background: linear-gradient(135deg,#eef2f7 0%, #ffffff 60%) no-repeat;
    padding: 56px 56px 56px 56px;
    page-break-after: always;
  }
  .header { display:flex; align-items:center; justify-content:space-between; }
  .title { font-size: 64px; font-weight: 800; color:#2f5fa8; }
  .logo { width: 240px; height: 120px; object-fit: contain; background:#e9edf5; border-radius:12px; }
  .logo.placeholder { display:flex; align-items:center; justify-content:center; font-size:48px; color:#333; }
  .content { margin-top: 24px; }
  .continued { font-size: 16px; color:#6b7280; margin-bottom: 8px; }
  .table-header {
    display:grid; grid-template-columns: 1fr 1fr; align-items:center;
    border-bottom: 2px solid #2f5fa8; padding-bottom:8px; margin-bottom:8px;
  }
  .vp { font-size: 28px; font-weight: 800; color:#0f2e5d; }
  .regions { text-align:right; font-size: 24px; font-weight: 800; color:#0f2e5d; }
  table.table { width:100%; border-collapse:collapse; background:#fff; border:1px solid #c9d2e3; }
  thead th {
    text-align:left; font-size:18px; color:#0f2e5d; background:#e9edf5; padding:12px 16px; border-bottom:1px solid #c9d2e3;
  }
  tbody td { padding:14px 16px; border-bottom:1px solid #eef2f7; font-size:18px; }
  tbody tr:nth-child(odd) td { background: #f8fafc; }
  tbody tr.empty td { height: 560px; background: repeating-linear-gradient(0deg,#fafcff,#fafcff 36px,#f1f5f9 36px,#f1f5f9 72px); }
  .footer {
    position:absolute; left:56px; right:56px; bottom:32px; display:flex; align-items:center; justify-content:flex-start;
  }
  .website { font-size:22px; color:#2f5fa8; display:flex; gap:10px; align-items:center; }
`;
