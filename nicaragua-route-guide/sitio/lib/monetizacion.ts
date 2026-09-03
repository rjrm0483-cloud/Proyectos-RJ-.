import { z } from "zod";
import rawConfig from "@/data/monetizacion.json";
import type { PartnerSlot, RouteRecord } from "@/data/routes";

// Monetisation infrastructure, OFF by default. It turns on only when Rodrigo
// registers the accounts and pastes the real identifiers here: never invent
// affiliate IDs. While afiliadosActivos is false the site renders no partner
// links at all ("Affiliate status: not active").

export const slotValues = ["cars", "tours", "ground", "flights", "esim", "insurance"] as const;
export type Slot = (typeof slotValues)[number];

const programaSchema = z.object({
  activo: z.boolean(),
  etiqueta: z.string().min(1),
  slot: z.enum(slotValues),
  plantillaUrl: z.string().url().startsWith("https://"),
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
  porSlot: z.record(z.enum(slotValues), z.array(z.string())),
  patrocinadores: z.object({
    porDefecto: patrocinadorSchema.nullable(),
    porFicha: z.record(z.string(), patrocinadorSchema),
  }),
});

export const monetizacion = configSchema.parse(rawConfig);

export type PartnerLink = { etiqueta: string; url: string; slot: Slot };

function buildUrl(programa: z.infer<typeof programaSchema>, query: string) {
  const q = encodeURIComponent(query);
  const base = programa.plantillaUrl.replace("{q}", q) + programa.sufijo;
  return programa.prefijoDeeplink ? programa.prefijoDeeplink + encodeURIComponent(base) : base;
}

// Links for one slot (e.g. the "cars" slot of a rental-car option).
export function getPartnerLinks(slot: Slot, query: string): PartnerLink[] {
  if (!monetizacion.afiliadosActivos) return [];
  const claves = monetizacion.porSlot[slot] ?? [];
  const enlaces: PartnerLink[] = [];
  for (const clave of claves) {
    const programa = monetizacion.programas[clave];
    if (!programa || !programa.activo) continue;
    enlaces.push({ etiqueta: programa.etiqueta, url: buildUrl(programa, query), slot });
  }
  return enlaces;
}

// Links for a transport option of a route: the option names its slot.
export function getOptionLinks(record: RouteRecord, partner: PartnerSlot | null) {
  if (!partner) return [];
  return getPartnerLinks(partner, `${record.destination} Nicaragua`);
}

// "Before you go" links shown on every route: eSIM and travel insurance.
export function getTripLinks() {
  return [...getPartnerLinks("esim", "Nicaragua"), ...getPartnerLinks("insurance", "Nicaragua")];
}

export function getPatrocinador(slug: string) {
  const patrocinador =
    monetizacion.patrocinadores.porFicha[slug] ?? monetizacion.patrocinadores.porDefecto;
  return patrocinador && patrocinador.activo ? patrocinador : null;
}
