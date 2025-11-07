// types/pdf.ts
export type UserRow = {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  officeCity?: string;
  state?: string;
  location: string;
  vp: string;
  regions: string[];
};

export type VPBlock = {
  vp: string;
  regions: string[];
  rows: UserRow[];
};

// Cada página puede tener varias secciones (grupos o continuaciones)
export type PageSection = {
  vp: string;
  regions: string[];
  rows: UserRow[];         // las filas de este trozo de VP que caben en esta página
  continuedFrom?: string;  // ← Continued from 'VP – ...'
  showGroupHeader: boolean; // mostrar el header de VP/Estados (solo true si es primera sección de ese VP)
};

export type Page = {
  sections: PageSection[];
};
