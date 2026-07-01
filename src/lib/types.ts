// Contrato de datos del pipeline de búsqueda. Mientras el listado real de
// SerpAPI y el análisis (chequeo de web, scoring) no estén conectados
// (Fase 5), estos son los campos que produce el mock y que va a tener que
// devolver el script real de SCOUT para que el resto de la app no cambie.

export type NegocioListado = {
  nombre: string;
  telefono: string;
  rating: number;
  cantidad_reviews: number;
  tiene_web: boolean;
  tiene_instagram: boolean;
};

export type Lead = NegocioListado & {
  id: string;
  search_id: string;
  user_id: string;
  rubro: string;
  ciudad: string;
  score: number;
  criterios_json: Record<string, boolean | number>;
  estado_crm: string;
  created_at: string;
};
