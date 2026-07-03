// Queries de búsqueda por rubro, portado 1:1 de scout-finda/scripts/scout.py.
// Variadas (con barrios/zonas típicas) para maximizar cobertura de negocios
// distintos y no repetir siempre los mismos resultados populares.
const RUBROS: Record<string, string[]> = {
  restaurantes: [
    "restaurante {ciudad}",
    "parrilla {ciudad}",
    "bodegón {ciudad}",
    "pizzería {ciudad}",
    "cantina {ciudad}",
    "tenedor libre {ciudad}",
    "restaurant barrio {ciudad}",
    "comida casera {ciudad}",
  ],
  gastronomia: [
    "restaurante {ciudad}",
    "café bar {ciudad}",
    "heladería {ciudad}",
    "panadería {ciudad}",
    "confitería {ciudad}",
    "rotisería {ciudad}",
  ],
  dentistas: [
    "dentista {ciudad}",
    "odontólogo {ciudad}",
    "clínica dental {ciudad}",
    "consultorio odontológico {ciudad}",
    "odontología barrio {ciudad}",
    "ortodoncia {ciudad}",
  ],
  salud: [
    "médico clínica {ciudad}",
    "centro médico {ciudad}",
    "kinesiólogo {ciudad}",
    "psicólogo {ciudad}",
    "consultorio médico {ciudad}",
    "nutricionista {ciudad}",
    "oftalmólogo {ciudad}",
  ],
  clinicas: [
    "clínica médica {ciudad}",
    "centro médico privado {ciudad}",
    "sanatorio {ciudad}",
  ],
  abogados: [
    "abogado {ciudad}",
    "estudio jurídico {ciudad}",
    "escribanía {ciudad}",
  ],
  contadores: [
    "contador {ciudad}",
    "estudio contable {ciudad}",
    "asesoría impositiva {ciudad}",
  ],
  peluquerias: [
    "peluquería {ciudad}",
    "barbería {ciudad}",
    "salón de belleza {ciudad}",
    "estética {ciudad}",
  ],
  turismo: [
    "agencia de viajes {ciudad}",
    "tour operador {ciudad}",
    "excursiones {ciudad}",
    "alquiler de autos turismo {ciudad}",
    "guía turístico {ciudad}",
    "hotel boutique {ciudad}",
    "hostel {ciudad}",
    "casa rural {ciudad}",
    "actividades turísticas {ciudad}",
  ],
  hoteles: [
    "hotel {ciudad}",
    "hotel boutique {ciudad}",
    "hostel {ciudad}",
    "apart hotel {ciudad}",
    "alojamiento {ciudad}",
    "posada {ciudad}",
    "bed and breakfast {ciudad}",
  ],
  gimnasios: [
    "gimnasio {ciudad}",
    "pilates {ciudad}",
    "yoga {ciudad}",
    "crossfit {ciudad}",
    "entrenamiento personal {ciudad}",
  ],
  veterinarias: [
    "veterinaria {ciudad}",
    "clínica veterinaria {ciudad}",
    "veterinario {ciudad}",
    "pet shop {ciudad}",
  ],
  inmobiliarias: [
    "inmobiliaria {ciudad}",
    "bienes raíces {ciudad}",
    "alquiler propiedades {ciudad}",
    "venta casas {ciudad}",
  ],
  talleres: [
    "taller mecánico {ciudad}",
    "taller automotriz {ciudad}",
    "gomería {ciudad}",
    "electricista autos {ciudad}",
    "chapa y pintura {ciudad}",
  ],
};

export function queriesParaRubro(rubro: string, ciudad: string): string[] {
  const rubroKey = rubro.toLowerCase().replace(/s$/, "");
  const templates = RUBROS[rubro.toLowerCase()] ??
    RUBROS[rubroKey] ?? [
      `${rubro} {ciudad}`,
      `${rubro} local {ciudad}`,
      `${rubro} pequeño {ciudad}`,
      `servicio ${rubro} {ciudad}`,
      `${rubro} zona {ciudad}`,
    ];

  return templates.map((t) => t.replace("{ciudad}", ciudad));
}
