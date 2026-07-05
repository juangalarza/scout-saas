import { normalizar } from "@/lib/scout/nichos";

export const TEMPLATES = [
  "restaurante",
  "dental",
  "barberia",
  "taller",
  "generico",
] as const;

export type Template = (typeof TEMPLATES)[number];

export const TEMPLATE_LABEL: Record<Template, string> = {
  restaurante: "Restaurantes y Cafeterías",
  dental: "Salud y Bienestar",
  barberia: "Estética y Belleza",
  taller: "Oficios y Reformas",
  generico: "Genérico",
};

// Mapea cada uno de los 35 nichos del catálogo (src/lib/scout/nichos.ts) a
// una de las 5 plantillas de demo. Los nichos no listados acá (o el texto
// libre de "Escribir manualmente") caen en el fallback "generico".
const NICHO_A_TEMPLATE: Record<string, Template> = {
  "restaurantes y cafeterias": "restaurante",

  "clinicas dentales": "dental",
  fisioterapeutas: "dental",
  "nutricionistas y dietistas": "dental",
  "psicologos y terapeutas": "dental",
  "centros veterinarios": "dental",
  opticas: "dental",

  barberias: "barberia",
  peluquerias: "barberia",
  "centros de estetica": "barberia",
  "gimnasios y crossfit": "barberia",
  "personal trainer": "barberia",
  "yoga y pilates": "barberia",
  "academias de baile": "barberia",

  "talleres mecanicos": "taller",
  electricistas: "taller",
  fontaneros: "taller",
  "carpinteria y ebanisteria": "taller",
  "reformas y construccion": "taller",
  "instaladores de alarmas": "taller",
  "instaladores placas solares": "taller",
  "mudanzas y transporte": "taller",
  "lavanderias y tintorerias": "taller",
};

export function templateParaRubro(rubro: string): Template {
  return NICHO_A_TEMPLATE[normalizar(rubro)] ?? "generico";
}
