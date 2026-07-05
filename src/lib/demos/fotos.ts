import type { Template } from "./templates";

const PLACES_API_URL = "https://places.googleapis.com/v1/places";

type PlaceDetailsRaw = {
  photos?: { name: string }[];
  reviews?: { text?: { text?: string } }[];
};

// Búsqueda de respaldo por plantilla cuando Google Places no tiene fotos
// del negocio (negocio nuevo, pocas reseñas, sin ficha completa).
const UNSPLASH_QUERY_POR_TEMPLATE: Record<Template, string> = {
  restaurante: "restaurant interior food",
  dental: "dental clinic healthcare",
  barberia: "barbershop hair salon",
  taller: "mechanic workshop tools",
  generico: "small business storefront",
};

async function detallesDeGooglePlaces(
  placeId: string,
): Promise<{ fotos: string[]; reviews: string[] }> {
  const apiKey = process.env.GOOGLE_PLACES_KEY;
  if (!apiKey || !placeId) return { fotos: [], reviews: [] };

  const res = await fetch(`${PLACES_API_URL}/${placeId}`, {
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "photos,reviews",
    },
  });

  if (!res.ok) return { fotos: [], reviews: [] };

  const data = (await res.json()) as PlaceDetailsRaw;

  // foto.name ya viene como "places/{placeId}/photos/{photoId}"
  const fotos = (data.photos ?? [])
    .slice(0, 3)
    .map(
      (foto) =>
        `https://places.googleapis.com/v1/${foto.name}/media?maxWidthPx=1080&key=${apiKey}`,
    );

  const reviews = (data.reviews ?? [])
    .map((r) => r.text?.text?.trim())
    .filter((texto): texto is string => Boolean(texto))
    .slice(0, 5);

  return { fotos, reviews };
}

async function fotosDeUnsplash(template: Template): Promise<string[]> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) return [];

  const query = UNSPLASH_QUERY_POR_TEMPLATE[template];
  const res = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=3&orientation=landscape`,
    { headers: { Authorization: `Client-ID ${accessKey}` } },
  );

  if (!res.ok) return [];

  const data = (await res.json()) as {
    results?: { urls?: { regular?: string } }[];
  };
  return (data.results ?? [])
    .map((r) => r.urls?.regular)
    .filter((url): url is string => Boolean(url));
}

export async function obtenerFotosYReviews(
  placeId: string,
  template: Template,
): Promise<{ fotos: string[]; reviews: string[] }> {
  const { fotos, reviews } = await detallesDeGooglePlaces(placeId);
  if (fotos.length > 0) return { fotos, reviews };
  return { fotos: await fotosDeUnsplash(template), reviews };
}
