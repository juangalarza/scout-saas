// Catálogo de nichos, calcado 1:1 del select de Huntly (tryhuntly.com/es/search)
// para que Scout ofrezca exactamente los mismos rubros. El value es el texto
// que se manda tal cual a la API (se guarda así en searches/leads.rubro).
export const NICHOS = [
  { value: "Abogados y Asesorías", label: "Abogados y Asesorías" },
  { value: "Academias de Baile", label: "Academias de Baile" },
  { value: "Academias de Idiomas", label: "Academias de Idiomas" },
  { value: "Agencias de Marketing Digital", label: "Agencias de Marketing Digital" },
  { value: "Agencias Inmobiliarias", label: "Agencias Inmobiliarias" },
  { value: "Arquitectos e Interioristas", label: "Arquitectos e Interioristas" },
  { value: "Barberías", label: "Barberías" },
  { value: "Carpintería y Ebanistería", label: "Carpintería y Ebanistería" },
  { value: "Centros de Estética", label: "Centros de Estética" },
  { value: "Centros Veterinarios", label: "Centros Veterinarios" },
  { value: "Clínicas Dentales", label: "Clínicas Dentales" },
  { value: "Contabilidad y Fiscalidad", label: "Contabilidad y Fiscalidad" },
  { value: "Electricistas", label: "Electricistas" },
  { value: "Escuelas de Conducir", label: "Escuelas de Conducir" },
  { value: "Fisioterapeutas", label: "Fisioterapeutas" },
  { value: "Fontaneros", label: "Fontaneros" },
  { value: "Fotógrafos", label: "Fotógrafos" },
  { value: "Gestorías", label: "Gestorías" },
  { value: "Gimnasios y CrossFit", label: "Gimnasios y CrossFit" },
  { value: "Guarderías y Educación Infantil", label: "Guarderías y Educación Infantil" },
  { value: "Instaladores de Alarmas", label: "Instaladores de Alarmas" },
  { value: "Instaladores Placas Solares", label: "Instaladores Placas Solares" },
  { value: "Joyerías", label: "Joyerías" },
  { value: "Lavanderías y Tintorerías", label: "Lavanderías y Tintorerías" },
  { value: "Mudanzas y Transporte", label: "Mudanzas y Transporte" },
  { value: "Nutricionistas y Dietistas", label: "Nutricionistas y Dietistas" },
  { value: "Ópticas", label: "Ópticas" },
  { value: "Peluquerías", label: "Peluquerías" },
  { value: "Personal Trainer", label: "Personal Trainer" },
  { value: "Psicólogos y Terapeutas", label: "Psicólogos y Terapeutas" },
  { value: "Reformas y Construcción", label: "Reformas y Construcción" },
  { value: "Restaurantes y Cafeterías", label: "Restaurantes y Cafeterías" },
  { value: "Seguros", label: "Seguros" },
  { value: "Talleres Mecánicos", label: "Talleres Mecánicos" },
  { value: "Yoga y Pilates", label: "Yoga y Pilates" },
] as const;

// Sentinel que representa la opción "✍️ Escribir manualmente" del select.
export const NICHO_MANUAL = "__manual__";

export function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}
