const DOLAR_API_URL = "https://dolarapi.com/v1/dolares/oficial";
const CACHE_MS = 5 * 60 * 1000; // 5 minutos: evita pegarle a la API en cada click de checkout

let cache: { arsPorUsd: number; expira: number } | null = null;

// Cotización oficial (venta), usada para pesificar los precios en USD de
// Go/Pro al momento de crear la suscripción en Mercado Pago (que solo cobra
// en ARS). Sin cache razonable, cada intento de checkout pegaría a un
// servicio de terceros que no controlamos.
export async function arsPorUsdOficial(): Promise<number> {
  if (cache && cache.expira > Date.now()) {
    return cache.arsPorUsd;
  }

  const res = await fetch(DOLAR_API_URL);
  if (!res.ok) {
    throw new Error(`dolarapi.com respondió ${res.status}`);
  }

  const data = await res.json();
  const venta = Number(data.venta);
  if (!venta || Number.isNaN(venta)) {
    throw new Error("dolarapi.com no devolvió una cotización válida");
  }

  cache = { arsPorUsd: venta, expira: Date.now() + CACHE_MS };
  return venta;
}
