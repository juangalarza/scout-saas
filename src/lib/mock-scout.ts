import type { NegocioListado } from "./types";

// Generador de negocios de prueba. Reemplazar por la llamada real a SerpAPI
// en Fase 5 (ver src/app/api/searches/route.ts).
export function generarNegociosMock(
  rubro: string,
  ciudad: string,
  cantidad = 16,
): NegocioListado[] {
  return Array.from({ length: cantidad }, (_, i) => {
    const tieneWeb = Math.random() > 0.55;
    return {
      nombre: `${capitalizar(rubro)} ${nombreFicticio(i)} — ${capitalizar(ciudad)}`,
      telefono: telefonoFicticio(),
      rating: Math.round((3 + Math.random() * 2) * 10) / 10,
      cantidad_reviews: Math.floor(Math.random() * 180),
      tiene_web: tieneWeb,
      tiene_instagram: Math.random() > 0.4,
    };
  });
}

// Cálculo de score de oportunidad. Reemplazar por la lógica real de
// scoring de SCOUT en Fase 5 (ver src/app/api/leads/analizar/route.ts).
export function calcularScore(negocio: NegocioListado): {
  score: number;
  criterios_json: Record<string, boolean | number>;
} {
  let score = negocio.tiene_web ? 10 : 50;
  score += Math.min(negocio.rating * 6, 30);
  score += Math.min(negocio.cantidad_reviews / 10, 15);
  if (!negocio.tiene_instagram) score += 5;

  return {
    score: Math.min(Math.round(score), 100),
    criterios_json: {
      sin_sitio_web: !negocio.tiene_web,
      rating_alto: negocio.rating >= 4,
      muchas_reviews: negocio.cantidad_reviews >= 50,
      sin_instagram: !negocio.tiene_instagram,
    },
  };
}

const NOMBRES = [
  "El Roble", "Don Carlos", "La Esquina", "San Martín", "El Progreso",
  "Los Andes", "La Central", "El Sol", "Nuevo Horizonte", "La Rambla",
  "El Faro", "Santa Rita", "El Molino", "La Terraza", "El Rincón",
  "Buena Vista", "La Plaza", "El Trébol", "Los Amigos", "La Estrella",
];

function nombreFicticio(i: number) {
  return NOMBRES[i % NOMBRES.length];
}

function telefonoFicticio() {
  const numero = Math.floor(1000000000 + Math.random() * 8999999999)
    .toString()
    .slice(0, 10);
  return `549${numero}`;
}

function capitalizar(texto: string) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
