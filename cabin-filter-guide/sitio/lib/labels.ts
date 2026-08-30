import type { Coverage } from "@/data/filters";

// Los valores internos de los datos (focus, confidence) se mantienen en inglés
// como claves estables; la interfaz siempre los muestra en español.
export const coverageLabels: Record<Coverage, string> = {
  "Central America": "Centroamérica",
  International: "Internacional",
  "EV / premium": "EV / premium",
};

export const confidenceLabels: Record<"Verified" | "Conditional", string> = {
  Verified: "Verificada",
  Conditional: "Condicional",
};
