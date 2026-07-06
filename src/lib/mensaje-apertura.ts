import { generarTexto } from "@/lib/claude";

function prompt(datos: {
  nombre: string;
  rubro: string;
  ciudad: string;
  rating: number;
  cantidadReviews: number;
}): string {
  return `Sos un vendedor que contacta por primera vez, por WhatsApp, a dueños de
negocios locales que no tienen sitio web, para ofrecerles ver gratis una demo
de cómo se vería su web.

Datos del negocio:
- Nombre: ${datos.nombre}
- Rubro: ${datos.rubro}
- Ciudad: ${datos.ciudad}
- Rating: ${datos.rating} (${datos.cantidadReviews} reseñas)

Escribí un mensaje de WhatsApp breve (2-3 líneas), natural y cercano, no
genérico ni tipo spam. Mencioná algo real y específico del negocio (rating,
cantidad de reseñas, o el rubro) y terminá preguntando si le interesa ver la
demo gratis. En español de Argentina.

Responde SOLO el texto del mensaje, sin comillas ni markdown ni explicaciones.`;
}

export async function generarMensajeApertura(datos: {
  nombre: string;
  rubro: string;
  ciudad: string;
  rating: number;
  cantidadReviews: number;
}): Promise<string> {
  const texto = await generarTexto(prompt(datos), 200);
  return texto.trim().replace(/^"|"$/g, "");
}
