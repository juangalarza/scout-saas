import { generarTexto } from "@/lib/claude";

export type CopyGenerado = {
  headline: string;
  subheadline: string;
  bio: string;
  cta_texto: string;
};

function prompt(datos: {
  nombre: string;
  rubro: string;
  ciudad: string;
  rating: number;
  cantidadReviews: number;
  reviews: string[];
}): string {
  const reviewsTexto =
    datos.reviews.length > 0
      ? datos.reviews.map((r) => `- "${r}"`).join("\n")
      : "(sin reseñas de texto disponibles)";

  return `Sos un copywriter que arma landings de demostración para dueños de negocios locales
que todavía no tienen sitio web. Tu texto tiene que sonar como si el negocio ya
tuviera una web profesional escrita a medida, no genérica.

Datos del negocio:
- Nombre: ${datos.nombre}
- Rubro: ${datos.rubro}
- Ciudad: ${datos.ciudad}
- Rating: ${datos.rating} (${datos.cantidadReviews} reseñas)
- Reseñas de ejemplo:
${reviewsTexto}

Generá en JSON:
{
  "headline": "una frase corta y específica, no genérica, usando algo real de las reseñas o el rubro",
  "subheadline": "una línea que refuerce confianza usando el rating/reviews",
  "bio": "2-3 oraciones sobre el negocio, tono profesional cálido, en español",
  "cta_texto": "texto del botón de contacto, ej 'Reservar turno' o 'Consultar disponibilidad' según el rubro"
}

Responde solo el JSON, sin texto adicional ni markdown.`;
}

function parsearJson(texto: string): CopyGenerado {
  const limpio = texto
    .trim()
    .replace(/^```(json)?/i, "")
    .replace(/```$/, "")
    .trim();
  const data = JSON.parse(limpio);
  return {
    headline: String(data.headline ?? ""),
    subheadline: String(data.subheadline ?? ""),
    bio: String(data.bio ?? ""),
    cta_texto: String(data.cta_texto ?? "Consultar disponibilidad"),
  };
}

export async function generarCopy(datos: {
  nombre: string;
  rubro: string;
  ciudad: string;
  rating: number;
  cantidadReviews: number;
  reviews: string[];
}): Promise<CopyGenerado> {
  const texto = await generarTexto(prompt(datos));
  return parsearJson(texto);
}
