import type { Template } from "../templates";

export type TemplateConfig = {
  kicker: string;
  color: string;
  serviciosLabel: string;
  servicios: string[];
};

export const TEMPLATE_CONFIG: Record<Template, TemplateConfig> = {
  restaurante: {
    kicker: "Restaurante",
    color: "#D97706",
    serviciosLabel: "Especialidades",
    servicios: ["Platos de temporada", "Opciones vegetarianas", "Reservas para grupos", "Delivery y take away"],
  },
  dental: {
    kicker: "Salud y bienestar",
    color: "#0891B2",
    serviciosLabel: "Servicios",
    servicios: ["Consulta y diagnóstico", "Tratamientos personalizados", "Turnos programados", "Atención de urgencias"],
  },
  barberia: {
    kicker: "Estética y belleza",
    color: "#DB2777",
    serviciosLabel: "Servicios",
    servicios: ["Cortes y color", "Tratamientos a medida", "Reserva de turno online", "Productos profesionales"],
  },
  taller: {
    kicker: "Oficios y reformas",
    color: "#334155",
    serviciosLabel: "Servicios",
    servicios: ["Presupuesto sin cargo", "Trabajo garantizado", "Zona de cobertura amplia", "Atención de urgencias"],
  },
  generico: {
    kicker: "Negocio local",
    color: "#4F46E5",
    serviciosLabel: "Por qué elegirnos",
    servicios: ["Atención personalizada", "Buenas referencias", "Respuesta rápida", "Precios claros"],
  },
};
