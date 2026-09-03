import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const config = JSON.parse(
  readFileSync(new URL("../data/monetizacion.json", import.meta.url), "utf8"),
);

const SLOTS = new Set(["cars", "tours", "ground", "flights", "esim", "insurance"]);

test("la configuración tiene la estructura esperada", () => {
  assert.equal(typeof config.afiliadosActivos, "boolean");
  assert.ok(config.programas && typeof config.programas === "object");
  assert.ok(config.porSlot && typeof config.porSlot === "object");
  assert.ok(config.patrocinadores && typeof config.patrocinadores === "object");
  assert.ok("porDefecto" in config.patrocinadores);
  assert.ok(typeof config.patrocinadores.porFicha === "object");
});

test("cada programa está bien formado y apunta a un slot conocido", () => {
  for (const [clave, programa] of Object.entries(config.programas)) {
    assert.equal(typeof programa.activo, "boolean", `${clave}: activo`);
    assert.ok(programa.etiqueta?.trim(), `${clave}: etiqueta`);
    assert.ok(SLOTS.has(programa.slot), `${clave}: slot desconocido "${programa.slot}"`);
    assert.ok(programa.plantillaUrl.startsWith("https://"), `${clave}: plantillaUrl debe ser https`);
    assert.equal(typeof programa.sufijo, "string", `${clave}: sufijo`);
    assert.equal(typeof programa.prefijoDeeplink, "string", `${clave}: prefijoDeeplink`);
    assert.ok(programa.notaActivacion?.trim(), `${clave}: notaActivacion`);
  }
});

test("porSlot solo referencia programas existentes del mismo slot", () => {
  for (const [slot, claves] of Object.entries(config.porSlot)) {
    assert.ok(SLOTS.has(slot), `slot desconocido: ${slot}`);
    for (const clave of claves) {
      assert.ok(config.programas[clave], `porSlot referencia programa inexistente: ${clave}`);
      assert.equal(config.programas[clave].slot, slot, `${clave} está en el slot ${slot} pero declara ${config.programas[clave].slot}`);
    }
  }
});

test("un programa activo debe tener identificador de afiliado real", () => {
  for (const [clave, programa] of Object.entries(config.programas)) {
    if (programa.activo) {
      const id = programa.sufijo.trim() + programa.prefijoDeeplink.trim();
      assert.ok(id !== "", `${clave}: activo sin sufijo ni prefijoDeeplink (falta el ID real)`);
      assert.ok(!/TU-|YOUR-|XXX/i.test(id), `${clave}: el identificador parece un marcador de posición`);
    }
  }
});

test("afiliadosActivos no puede estar encendido sin ningún programa activo", () => {
  const activos = Object.values(config.programas).filter((p) => p.activo).length;
  if (config.afiliadosActivos) {
    assert.ok(activos > 0, "afiliadosActivos:true sin programas activos");
  }
});

test("los patrocinadores están bien formados", () => {
  const patrocinadores = [
    ...(config.patrocinadores.porDefecto ? [config.patrocinadores.porDefecto] : []),
    ...Object.values(config.patrocinadores.porFicha),
  ];
  for (const patrocinador of patrocinadores) {
    assert.equal(typeof patrocinador.activo, "boolean");
    assert.ok(patrocinador.nombre?.trim());
    assert.ok(patrocinador.texto?.trim());
    if (patrocinador.url !== null) {
      assert.ok(String(patrocinador.url).startsWith("https://"));
    }
  }
});
