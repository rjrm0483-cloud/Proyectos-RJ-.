import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const manifiesto = JSON.parse(readFileSync(new URL("../data/imagenes.json", import.meta.url), "utf8"));
const generado = JSON.parse(readFileSync(new URL("../data/imagenes.generado.json", import.meta.url), "utf8"));
const rutas = JSON.parse(readFileSync(new URL("../data/routes.json", import.meta.url), "utf8"));
const destinos = new Set(rutas.map((r) => r.destinationSlug));

test("cada entrada del manifiesto tiene archivo de Commons y alt, y corresponde a un destino existente", () => {
  for (const [slug, entrada] of Object.entries(manifiesto)) {
    const candidatos = [...(entrada.files ?? []), ...(entrada.file ? [entrada.file] : [])];
    assert.ok(candidatos.length > 0 || entrada.search?.trim(), `${slug}: necesita files, file o search`);
    assert.ok(entrada.alt?.trim(), `${slug}: alt`);
    assert.ok(destinos.has(slug), `${slug}: no hay ninguna ruta con ese destinationSlug`);
  }
});

test("cada imagen generada existe en public/images y declara autor y licencia permitida", () => {
  const permitidas = /^(CC0|Public domain|CC BY(-SA)? \d(\.\d)?)/i;
  for (const [slug, img] of Object.entries(generado)) {
    assert.ok(manifiesto[slug], `${slug}: imagen generada sin entrada en el manifiesto`);
    assert.ok(existsSync(new URL(`../public${img.src}`, import.meta.url)), `${slug}: falta ${img.src}`);
    if (img.srcSmall) {
      assert.ok(existsSync(new URL(`../public${img.srcSmall}`, import.meta.url)), `${slug}: falta ${img.srcSmall}`);
    }
    assert.ok(img.author?.trim(), `${slug}: autor`);
    assert.match(img.license, permitidas, `${slug}: licencia "${img.license}" no permitida`);
    assert.ok(img.pageUrl.startsWith("https://commons.wikimedia.org/"), `${slug}: pageUrl`);
  }
});
