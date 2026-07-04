// Datos puros de los planes pagos (sin nada server-only), para poder
// importarlos tanto desde el server (src/lib/mercadopago.ts) como desde
// componentes de cliente (la página de pricing) sin arrastrar el SDK/fetch
// de Mercado Pago al bundle del browser.
export const PLANES_PAGOS = {
  go: { label: "Go", precioUsd: 9, busquedasPorMes: 100 },
  pro: { label: "Pro", precioUsd: 19, busquedasPorMes: 250 },
} as const;

export type PlanPago = keyof typeof PLANES_PAGOS;

export function esPlanPago(valor: string): valor is PlanPago {
  return valor === "go" || valor === "pro";
}
