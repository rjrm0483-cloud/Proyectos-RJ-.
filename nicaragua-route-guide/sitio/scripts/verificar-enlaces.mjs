// Verifica que las URLs de las fuentes de las rutas sigan vivas.
// Se ejecuta en GitHub Actions (con red completa), no en el entorno del agente.
// Uso: node verificar-enlaces.mjs <ruta a routes.json>
import { readFileSync } from "node:fs";

const records = JSON.parse(readFileSync(process.argv[2], "utf8"));
const urls = new Map();
for (const record of records) {
  for (const source of record.sources) {
    if (!urls.has(source.url)) urls.set(source.url, []);
    urls.get(source.url).push(record.slug);
  }
}

let rotas = 0;
let porRevisar = 0;
for (const [url, slugs] of urls) {
  let status;
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(20000),
      headers: {
        "user-agent":
          "Mozilla/5.0 (compatible; NicaraguaRouteGuide-VerificadorEnlaces/1.0)",
        accept: "text/html,application/xhtml+xml,*/*",
      },
    });
    status = String(res.status);
  } catch (error) {
    // fetch envuelve el fallo real en error.cause (ENOTFOUND, CERT_HAS_EXPIRED,
    // ECONNRESET, UND_ERR_CONNECT_TIMEOUT...). Solo un dominio inexistente o
    // una conexión rechazada cuentan como enlace roto; el resto se revisa.
    const cause = error?.cause?.code ?? error?.cause?.name ?? error.name;
    status = `ERROR:${cause}`;
  }
  const codigo = Number(status);
  let veredicto;
  if (codigo >= 200 && codigo < 400) {
    veredicto = "OK";
  } else if (
    codigo === 404 ||
    codigo === 410 ||
    status === "ERROR:ENOTFOUND" ||
    status === "ERROR:ECONNREFUSED"
  ) {
    veredicto = "ROTA";
    rotas++;
  } else {
    // 403/429/999 suelen ser bloqueo anti-bot del sitio, y los errores TLS o
    // de tiempo de espera suelen ser del servidor, no del enlace: se revisan.
    veredicto = "REVISAR";
    porRevisar++;
  }
  console.log(`${veredicto.padEnd(8)} ${status.padEnd(12)} ${url}  [${slugs.join(", ")}]`);
}

console.log(`\nResumen: ${urls.size} URLs únicas — ${rotas} rotas, ${porRevisar} por revisar, ${urls.size - rotas - porRevisar} OK.`);
if (rotas > 0) process.exit(1);
