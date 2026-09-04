// Descarga las fotos de los destinos desde Wikimedia Commons y guarda sus
// créditos. Se ejecuta en GitHub Actions (con red completa), no en el entorno
// del agente. Uso: node scripts/descargar-imagenes.mjs
// Lee data/imagenes.json (manifiesto manual: archivo de Commons + alt por
// destino), consulta la API de Commons, valida que la licencia permita la
// reutilización, descarga una miniatura de 1400 px a public/images/<slug>.jpg
// y escribe data/imagenes.generado.json con ruta, autor, licencia y enlaces.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifiesto = JSON.parse(readFileSync(join(raiz, "data/imagenes.json"), "utf8"));
const salida = join(raiz, "data/imagenes.generado.json");
const carpeta = join(raiz, "public/images");
mkdirSync(carpeta, { recursive: true });

const LICENCIAS_PERMITIDAS = /^(CC0|Public domain|CC BY(-SA)? \d(\.\d)?)/i;
const ANCHO = 1400;
const cabeceras = {
  "user-agent": "NicaraguaRouteGuide-Imagenes/1.0 (https://rjrm0483-cloud.github.io/Proyectos-RJ-./nicaragua/)",
};

function limpiarHtml(texto) {
  return String(texto ?? "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

let previo = {};
try {
  previo = JSON.parse(readFileSync(salida, "utf8"));
} catch {
  previo = {};
}

async function consultarCommons(params) {
  const api = new URL("https://commons.wikimedia.org/w/api.php");
  api.search = new URLSearchParams({ action: "query", format: "json", ...params }).toString();
  const res = await fetch(api, { headers: cabeceras, signal: AbortSignal.timeout(30000) });
  return res.json();
}

// Devuelve la información de un archivo si existe y su licencia es libre.
async function infoArchivo(titulo) {
  const json = await consultarCommons({
    titles: titulo,
    prop: "imageinfo",
    iiprop: "url|extmetadata|size|mime",
    iiurlwidth: String(ANCHO),
    iiextmetadatafilter: "Artist|LicenseShortName|LicenseUrl|Credit",
  });
  const pagina = Object.values(json.query?.pages ?? {})[0];
  const info = pagina?.imageinfo?.[0];
  if (!info) return { error: `no existe ${titulo}` };
  const meta = info.extmetadata ?? {};
  const licencia = limpiarHtml(meta.LicenseShortName?.value);
  if (!LICENCIAS_PERMITIDAS.test(licencia)) return { error: `licencia no permitida en ${titulo}: "${licencia}"` };
  if (info.mime && !/^image\/jpeg$/.test(info.mime)) return { error: `${titulo} no es JPEG (${info.mime})` };
  if ((info.width ?? 0) < 1000) return { error: `${titulo} es demasiado pequeña (${info.width} px)` };
  return { info, meta, licencia, titulo: pagina.title };
}

// Candidatos explícitos primero; si ninguno sirve, búsqueda en Commons.
async function elegirArchivo(entrada) {
  const candidatos = [...(entrada.files ?? []), ...(entrada.file ? [entrada.file] : [])];
  const motivos = [];
  for (const c of candidatos) {
    const titulo = c.startsWith("File:") ? c : `File:${c}`;
    const r = await infoArchivo(titulo);
    if (r.info) return r;
    motivos.push(r.error);
  }
  if (entrada.search) {
    const json = await consultarCommons({
      list: "search",
      srsearch: `${entrada.search} filemime:image/jpeg`,
      srnamespace: "6",
      srlimit: "12",
    });
    for (const hit of json.query?.search ?? []) {
      const r = await infoArchivo(hit.title);
      if (r.info) return r;
      motivos.push(r.error);
    }
  }
  return { error: motivos.join("; ") || "sin candidatos" };
}

const resultado = {};
let errores = 0;
for (const [slug, entrada] of Object.entries(manifiesto)) {
  try {
    const eleccion = await elegirArchivo(entrada);
    if (!eleccion.info) throw new Error(eleccion.error);
    const { info, meta, licencia, titulo } = eleccion;
    const autor = limpiarHtml(meta.Artist?.value) || "Autor no indicado";
    const url = info.thumburl ?? info.url;
    const img = await fetch(url, { headers: cabeceras, signal: AbortSignal.timeout(60000) });
    if (!img.ok) throw new Error(`descarga ${img.status} para ${url}`);
    const bytes = Buffer.from(await img.arrayBuffer());
    const destino = join(carpeta, `${slug}.jpg`);
    writeFileSync(destino, bytes);
    resultado[slug] = {
      src: `/images/${slug}.jpg`,
      alt: entrada.alt,
      author: autor,
      license: licencia,
      licenseUrl: limpiarHtml(meta.LicenseUrl?.value) || null,
      pageUrl: info.descriptionurl,
      width: info.thumbwidth ?? info.width,
      height: info.thumbheight ?? info.height,
      file: titulo,
    };
    console.log(`OK      ${slug}  ${licencia}  ${autor}  (${Math.round(bytes.length / 1024)} KB)`);
  } catch (error) {
    errores++;
    console.log(`ERROR   ${slug}  ${error.message}`);
    if (previo[slug]) {
      resultado[slug] = previo[slug];
      console.log(`        se conserva la versión anterior de ${slug}`);
    }
  }
}

writeFileSync(salida, JSON.stringify(resultado, null, 2) + "\n");
console.log(`\n${Object.keys(resultado).length} imágenes listas, ${errores} errores.`);
if (errores > 0) process.exit(1);
