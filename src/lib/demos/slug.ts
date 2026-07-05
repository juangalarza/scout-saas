export function slugify(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// El slug es público (aparece en la URL de la demo que se manda al negocio),
// así que además del nombre lleva un fragmento del id del lead para que no
// choquen dos negocios con el mismo nombre.
export function generarSlug(nombre: string, leadId: string): string {
  return `${slugify(nombre)}-${leadId.slice(0, 6)}`;
}
