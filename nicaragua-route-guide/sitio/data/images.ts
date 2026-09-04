import { z } from "zod";
import rawManifest from "./imagenes.json";
import rawGenerated from "./imagenes.generado.json";

// Fotos de los destinos. El manifiesto (imagenes.json) es manual: qué archivo
// de Wikimedia Commons ilustra cada destino. El archivo generado lo escribe
// scripts/descargar-imagenes.mjs en GitHub Actions con la ruta local, el
// autor y la licencia; si un destino aún no tiene foto descargada, la página
// simplemente no muestra imagen.

const manifestSchema = z.record(
  z.string(),
  z.object({
    file: z.string().min(1).optional(),
    files: z.array(z.string().min(1)).optional(),
    search: z.string().min(1).optional(),
    alt: z.string().min(1),
  }),
);

const generatedSchema = z.record(
  z.string(),
  z.object({
    src: z.string().startsWith("/images/"),
    alt: z.string().min(1),
    author: z.string().min(1),
    license: z.string().min(1),
    licenseUrl: z.string().url().nullable(),
    pageUrl: z.string().url(),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    file: z.string().min(1),
  }),
);

export type DestinationImage = z.infer<typeof generatedSchema>[string];

export const imageManifest = manifestSchema.parse(rawManifest);
const generated = generatedSchema.parse(rawGenerated);

export function getDestinationImage(destinationSlug: string): DestinationImage | null {
  return generated[destinationSlug] ?? null;
}

export function getImageCredit(image: DestinationImage) {
  return `Photo: ${image.author}, ${image.license}, via Wikimedia Commons`;
}
