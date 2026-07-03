// Contrato de datos del pipeline de búsqueda: lo que devuelve la búsqueda en
// Google Places (listado) y lo que termina persistido como lead tras el
// análisis de presencia digital + scoring.

export type NegocioListado = {
  nombre: string;
  telefono: string;
  rating: number;
  cantidad_reviews: number;
  tiene_web: boolean;
  tiene_instagram: boolean;
  // Campos internos del pipeline: viajan del listado al análisis pero no se
  // persisten (no son columnas de "leads"), se descartan antes del insert.
  web_url?: string;
  place_id?: string;
};

export type Lead = NegocioListado & {
  id: string;
  search_id: string;
  user_id: string;
  rubro: string;
  ciudad: string;
  score: number;
  criterios_json: Record<string, boolean | number | string | null>;
  estado_crm: string;
  created_at: string;
};
