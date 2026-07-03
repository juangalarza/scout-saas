import type { NegocioListado } from "@/lib/types";
import { queriesParaRubro } from "./rubros";

const PLACES_API_URL = "https://places.googleapis.com/v1/places:searchText";

const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.nationalPhoneNumber",
  "places.internationalPhoneNumber",
  "places.websiteUri",
  "places.rating",
  "places.userRatingCount",
  "places.businessStatus",
].join(",");

type PlaceRaw = {
  id?: string;
  displayName?: { text?: string };
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  websiteUri?: string;
  rating?: number;
  userRatingCount?: number;
  businessStatus?: string;
};

// Argentina: los celulares necesitan el "9" después del código de país para
// que los links de wa.me abran el chat correctamente (si no, WhatsApp Web
// intenta abrir un número de línea fija inexistente).
function normalizarTelefono(raw: string): string {
  const digitos = raw.replace(/\D/g, "");
  if (digitos.startsWith("54") && digitos[2] !== "9") {
    return `549${digitos.slice(2)}`;
  }
  return digitos;
}

async function buscarPagina(
  query: string,
  apiKey: string,
  pageToken?: string,
): Promise<{ places: PlaceRaw[]; nextPageToken?: string }> {
  const res = await fetch(PLACES_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": FIELD_MASK,
    },
    body: JSON.stringify({
      textQuery: query,
      languageCode: "es",
      regionCode: "AR",
      maxResultCount: 20,
      ...(pageToken ? { pageToken } : {}),
    }),
  });

  if (!res.ok) {
    throw new Error(`Google Places API respondió ${res.status}`);
  }

  const data = await res.json();
  return { places: data.places ?? [], nextPageToken: data.nextPageToken };
}

export async function buscarNegocios(
  rubro: string,
  ciudad: string,
  cantidad = 16,
): Promise<NegocioListado[]> {
  const apiKey = process.env.GOOGLE_PLACES_KEY;
  if (!apiKey) {
    throw new Error("Falta configurar GOOGLE_PLACES_KEY en el servidor");
  }

  const queries = queriesParaRubro(rubro, ciudad);
  const candidatos: NegocioListado[] = [];
  const vistos = new Set<string>();

  for (const query of queries) {
    if (candidatos.length >= cantidad) break;

    let pageToken: string | undefined;
    for (let pagina = 0; pagina < 3; pagina++) {
      if (candidatos.length >= cantidad) break;

      const { places, nextPageToken } = await buscarPagina(
        query,
        apiKey,
        pageToken,
      );

      for (const place of places) {
        const id = place.id ?? "";
        if (!id || vistos.has(id)) continue;
        if (
          place.businessStatus &&
          place.businessStatus !== "OPERATIONAL"
        ) {
          continue;
        }
        vistos.add(id);

        const telefono =
          place.internationalPhoneNumber ?? place.nationalPhoneNumber ?? "";

        candidatos.push({
          nombre: place.displayName?.text ?? "Sin nombre",
          telefono: telefono ? normalizarTelefono(telefono) : "",
          rating: place.rating ?? 0,
          cantidad_reviews: place.userRatingCount ?? 0,
          tiene_web: Boolean(place.websiteUri),
          tiene_instagram: false, // se determina recién al analizar la web
          web_url: place.websiteUri || undefined,
          place_id: id,
        });

        if (candidatos.length >= cantidad) break;
      }

      pageToken = nextPageToken;
      if (!pageToken) break;
    }
  }

  return candidatos;
}
