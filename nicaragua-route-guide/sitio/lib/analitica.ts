import { z } from "zod";
import rawConfig from "@/data/analitica.json";

// Analítica sin cookies, APAGADA por defecto. Se enciende solo cuando Rodrigo
// crea la cuenta y pega aquí el código real: nunca inventar identificadores.
// Mientras 'activa' sea false el sitio no carga ningún script de terceros y la
// política de privacidad sigue diciendo que no hay analítica.

export const proveedores = ["goatcounter", "plausible", "umami", "cloudflare"] as const;
export type Proveedor = (typeof proveedores)[number];

const configSchema = z.object({
  activa: z.boolean(),
  proveedor: z.enum(proveedores),
  codigo: z.string(),
  dominio: z.string(),
  nota: z.string(),
});

export const analitica = configSchema.parse(rawConfig);

export type ScriptAnalitica = {
  src: string;
  atributos: Record<string, string>;
};

// Devuelve el script que toca cargar, o null si falta algún dato. Cada
// proveedor necesita cosas distintas, así que se valida por separado.
export function getScriptAnalitica(): ScriptAnalitica | null {
  if (!analitica.activa) return null;
  const codigo = analitica.codigo.trim();
  const dominio = analitica.dominio.trim();

  switch (analitica.proveedor) {
    case "goatcounter":
      if (!codigo) return null;
      return {
        src: "https://gc.zgo.at/count.js",
        atributos: { "data-goatcounter": `https://${codigo}.goatcounter.com/count` },
      };
    case "plausible":
      if (!dominio) return null;
      return {
        src: "https://plausible.io/js/script.js",
        atributos: { "data-domain": dominio },
      };
    case "umami":
      if (!codigo || !dominio) return null;
      return {
        src: `https://${dominio}/script.js`,
        atributos: { "data-website-id": codigo },
      };
    case "cloudflare":
      if (!codigo) return null;
      return {
        src: "https://static.cloudflareinsights.com/beacon.min.js",
        atributos: { "data-cf-beacon": `{"token": "${codigo}"}` },
      };
  }
}

// La política de privacidad describe la analítica solo cuando está encendida.
export function analiticaEncendida(): boolean {
  return getScriptAnalitica() !== null;
}

export const nombreProveedor: Record<Proveedor, string> = {
  goatcounter: "GoatCounter",
  plausible: "Plausible Analytics",
  umami: "Umami",
  cloudflare: "Cloudflare Web Analytics",
};
