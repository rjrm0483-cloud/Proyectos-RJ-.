import { getScriptAnalitica } from "@/lib/analitica";

// Etiqueta <script> plana: la exportación estática la escribe tal cual en el
// HTML. Si la analítica está apagada no se emite nada.
export function Analitica() {
  const script = getScriptAnalitica();
  if (!script) return null;
  return <script async src={script.src} {...script.atributos} />;
}
