import { normalizar } from "./nichos";

// Variantes de búsqueda en Google Maps por cada nicho del catálogo de
// Huntly (ver nichos.ts). Varias queries por nicho, con sinónimos usados en
// Argentina cuando el término de Huntly es más propio de España (ej.
// "fontanero" -> también "plomero"), para maximizar cobertura de negocios.
const QUERIES: Record<string, string[]> = {
  "abogados y asesorias": [
    "abogado {ciudad}",
    "estudio jurídico {ciudad}",
    "asesoría legal {ciudad}",
  ],
  "academias de baile": ["academia de baile {ciudad}", "escuela de danza {ciudad}"],
  "academias de idiomas": ["academia de idiomas {ciudad}", "instituto de inglés {ciudad}"],
  "agencias de marketing digital": [
    "agencia de marketing digital {ciudad}",
    "agencia de publicidad {ciudad}",
  ],
  "agencias inmobiliarias": [
    "inmobiliaria {ciudad}",
    "agencia inmobiliaria {ciudad}",
    "bienes raíces {ciudad}",
  ],
  "arquitectos e interioristas": [
    "estudio de arquitectura {ciudad}",
    "arquitecto {ciudad}",
    "diseño de interiores {ciudad}",
  ],
  "barberias": ["barbería {ciudad}", "barbershop {ciudad}"],
  "carpinteria y ebanisteria": ["carpintería {ciudad}", "ebanistería {ciudad}", "carpintero {ciudad}"],
  "centros de estetica": ["centro de estética {ciudad}", "salón de belleza {ciudad}", "spa {ciudad}"],
  "centros veterinarios": ["veterinaria {ciudad}", "clínica veterinaria {ciudad}"],
  "clinicas dentales": ["dentista {ciudad}", "clínica dental {ciudad}", "odontólogo {ciudad}"],
  "contabilidad y fiscalidad": [
    "contador {ciudad}",
    "estudio contable {ciudad}",
    "asesoría impositiva {ciudad}",
  ],
  "electricistas": ["electricista {ciudad}", "servicio eléctrico {ciudad}"],
  "escuelas de conducir": ["escuela de manejo {ciudad}", "autoescuela {ciudad}"],
  "fisioterapeutas": ["kinesiólogo {ciudad}", "fisioterapeuta {ciudad}"],
  "fontaneros": ["plomero {ciudad}", "gasista {ciudad}", "fontanero {ciudad}"],
  "fotografos": ["fotógrafo {ciudad}", "estudio fotográfico {ciudad}"],
  "gestorias": ["gestoría {ciudad}", "gestor administrativo {ciudad}", "trámites {ciudad}"],
  "gimnasios y crossfit": ["gimnasio {ciudad}", "crossfit {ciudad}", "entrenamiento funcional {ciudad}"],
  "guarderias y educacion infantil": ["guardería {ciudad}", "jardín maternal {ciudad}"],
  "instaladores de alarmas": ["instalador de alarmas {ciudad}", "seguridad electrónica {ciudad}"],
  "instaladores placas solares": ["energía solar {ciudad}", "paneles solares {ciudad}"],
  "joyerias": ["joyería {ciudad}", "relojería {ciudad}"],
  "lavanderias y tintorerias": ["lavandería {ciudad}", "tintorería {ciudad}"],
  "mudanzas y transporte": ["mudanzas {ciudad}", "fletes {ciudad}", "transporte de carga {ciudad}"],
  "nutricionistas y dietistas": ["nutricionista {ciudad}", "dietista {ciudad}"],
  "opticas": ["óptica {ciudad}"],
  "peluquerias": ["peluquería {ciudad}", "salón de peluquería {ciudad}"],
  "personal trainer": ["personal trainer {ciudad}", "entrenador personal {ciudad}"],
  "psicologos y terapeutas": ["psicólogo {ciudad}", "consultorio psicológico {ciudad}"],
  "reformas y construccion": ["reformas {ciudad}", "empresa constructora {ciudad}", "albañil {ciudad}"],
  "restaurantes y cafeterias": [
    "restaurante {ciudad}",
    "café bar {ciudad}",
    "parrilla {ciudad}",
    "pizzería {ciudad}",
  ],
  "seguros": ["corredor de seguros {ciudad}", "agencia de seguros {ciudad}"],
  "talleres mecanicos": ["taller mecánico {ciudad}", "gomería {ciudad}", "taller automotriz {ciudad}"],
  "yoga y pilates": ["yoga {ciudad}", "pilates {ciudad}"],
};

export function queriesParaRubro(rubro: string, ciudad: string): string[] {
  const templates = QUERIES[normalizar(rubro)] ?? [
    `${rubro} {ciudad}`,
    `${rubro} local {ciudad}`,
    `servicio ${rubro} {ciudad}`,
  ];

  return templates.map((t) => t.replace("{ciudad}", ciudad));
}
