import type { NegocioListado } from "@/lib/types";
import { inspeccionarWeb, type WebInfo } from "./inspeccionar-web";

// Año a partir del cual una web se considera "moderna" (no es oportunidad).
// Igual al AÑO_MODERNO_DEFAULT de scout-finda/scripts/scout.py.
const AÑO_MAXIMO = 2022;

export async function analizarNegocio(negocio: NegocioListado): Promise<{
  score: number;
  tiene_instagram: boolean;
  criterios_json: Record<string, boolean | number | string | null>;
}> {
  const web = await inspeccionarWeb(negocio.web_url);
  const { score, motivos } = calcularScore(negocio, web);

  return {
    score,
    tiene_instagram: Boolean(web.instagram_url || web.facebook_url),
    criterios_json: {
      web_status: web.web_status,
      web_año: web.web_año,
      tiene_whatsapp_web: web.tiene_whatsapp,
      instagram_url: web.instagram_url || null,
      facebook_url: web.facebook_url || null,
      motivos: motivos.join(" | "),
    },
  };
}

// Score de oportunidad de venta (0-100), adaptado del 1-10 de scout-finda a
// la escala que ya usa el dashboard (umbral 70 = "Explorar", 86 = "Oportunidad
// ideal"). El componente de "estado de la web" pesa más porque es la señal
// más fuerte; el de "negocio establecido" (rating/reviews) empuja a los
// negocios sin web con más reputación hacia "Oportunidad ideal", porque son
// los que más probablemente puedan pagar una web.
function calcularScore(
  negocio: NegocioListado,
  web: WebInfo,
): { score: number; motivos: string[] } {
  let score = 0;
  const motivos: string[] = [];

  if (!negocio.tiene_web || web.web_status === "sin_web") {
    score += 60;
    motivos.push("Sin web propia (+60)");
  } else if (web.web_año && web.web_año < 2017) {
    score += 55;
    motivos.push(`Web muy vieja (${web.web_año}) (+55)`);
  } else if (web.web_año && web.web_año < AÑO_MAXIMO) {
    score += 40;
    motivos.push(`Web desactualizada (${web.web_año}) (+40)`);
  } else if (web.web_año && web.web_año === AÑO_MAXIMO) {
    score += 15;
    motivos.push(`Web en el límite (${web.web_año}) (+15)`);
  } else if (
    !web.web_año &&
    (web.web_status === "activa" ||
      web.web_status === "timeout" ||
      web.web_status === "bloqueada")
  ) {
    score += 25;
    motivos.push(`Web ${web.web_status} sin año detectable (+25)`);
  }
  // Web con año detectado > AÑO_MAXIMO → 0 puntos (web moderna, no es oportunidad)

  if (negocio.rating >= 4.5) {
    score += 15;
    motivos.push(`Rating ${negocio.rating}★ (+15)`);
  } else if (negocio.rating >= 4.0) {
    score += 10;
    motivos.push(`Rating ${negocio.rating}★ (+10)`);
  } else if (negocio.rating >= 3.5) {
    score += 5;
    motivos.push(`Rating ${negocio.rating}★ (+5)`);
  }

  if (negocio.cantidad_reviews >= 100) {
    score += 15;
    motivos.push(`${negocio.cantidad_reviews} reseñas (+15)`);
  } else if (negocio.cantidad_reviews >= 30) {
    score += 10;
    motivos.push(`${negocio.cantidad_reviews} reseñas (+10)`);
  } else if (negocio.cantidad_reviews >= 10) {
    score += 5;
    motivos.push(`${negocio.cantidad_reviews} reseñas (+5)`);
  }

  if (web.tiene_whatsapp) {
    score += 5;
    motivos.push("WhatsApp en su web (+5)");
  }
  if (web.instagram_url || web.facebook_url) {
    score += 5;
    motivos.push("Redes sociales activas (+5)");
  }

  return { score: Math.min(Math.round(score), 100), motivos };
}
