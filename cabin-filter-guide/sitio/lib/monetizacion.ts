import { z } from "zod";
import rawConfig from "@/data/monetizacion.json";

// Infraestructura de monetización, apagada por defecto. Se activa SOLO cuando
// Rodrigo registra las cuentas y coloca los identificadores reales aquí:
// nunca inventar tags/campids. Mientras afiliadosActivos sea false, el sitio
// se ve exactamente igual que hoy ("Estado de afiliados: No activados").

const programaSchema = z.object({
  activo: z.boolean(),
  etiqueta: z.string().min(1),
  plantillaUrl: z.string().min(1).includes("{q}"),
  sufijo: z.string(),
  prefijoDeeplink: z.string(),
  notaActivacion: z.string(),
});

const patrocinadorSchema = z.object({
  activo: z.boolean(),
  nombre: z.string().min(1),
  texto: z.string().min(1),
  url: z.string().url().startsWith("https://").nullable(),
});

const configSchema = z.object({
  afiliadosActivos: z.boolean(),
  programas: z.record(z.string(), programaSchema),
  porEnfoque: z.record(z.string(), z.array(z.string())),
  patrocinadores: z.object({
    porDefecto: patrocinadorSchema.nullable(),
    porFicha: z.record(z.string(), patrocinadorSchema),
  }),
});

export const monetizacion = configSchema.parse(rawConfig);

export type EnlaceCompra = { etiqueta: string; url: string };

type RecordParaEnlaces = {
  focus: string;
  partReference: string;
  make: string;
  model: string;
};

function consultaBusqueda(record: RecordParaEnlaces) {
  // Una referencia con dígitos (CU 22 028, 97133-L1000) busca mejor que el
  // nombre del vehículo; si no hay código real, se busca por vehículo.
  return /\d/.test(record.partReference)
    ? record.partReference
    : `${record.make} ${record.model} filtro de cabina`;
}

export function getEnlacesCompra(record: RecordParaEnlaces): EnlaceCompra[] {
  if (!monetizacion.afiliadosActivos) return [];
  const claves = monetizacion.porEnfoque[record.focus] ?? [];
  const q = encodeURIComponent(consultaBusqueda(record));
  const enlaces: EnlaceCompra[] = [];
  for (const clave of claves) {
    const programa = monetizacion.programas[clave];
    if (!programa || !programa.activo) continue;
    const base = programa.plantillaUrl.replace("{q}", q) + programa.sufijo;
    const url = programa.prefijoDeeplink
      ? programa.prefijoDeeplink + encodeURIComponent(base)
      : base;
    enlaces.push({ etiqueta: programa.etiqueta, url });
  }
  return enlaces;
}

export function getPatrocinador(slug: string) {
  const patrocinador =
    monetizacion.patrocinadores.porFicha[slug] ??
    monetizacion.patrocinadores.porDefecto;
  return patrocinador && patrocinador.activo ? patrocinador : null;
}
