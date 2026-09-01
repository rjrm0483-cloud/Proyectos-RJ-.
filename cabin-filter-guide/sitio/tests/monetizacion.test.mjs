import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const config = JSON.parse(
  readFileSync(new URL("../data/monetizacion.json", import.meta.url), "utf8"),
);

test("la configuración tiene la estructura esperada", () => {
  assert.equal(typeof config.afiliadosActivos, "boolean");
  assert.ok(config.programas && typeof config.programas === "object");
  assert.ok(config.porEnfoque && typeof config.porEnfoque === "object");
  assert.ok(config.patrocinadores && typeof config.patrocinadores === "object");
  assert.ok("porDefecto" in config.patrocinadores);
  assert.ok(typeof config.patrocinadores.porFicha === "object");
});

test("cada programa está bien formado", () => {
  for (const [clave, programa] of Object.entries(config.programas)) {
    assert.equal(typeof programa.activo, "boolean", `${clave}: activo`);
    assert.ok(programa.etiqueta?.trim(), `${clave}: etiqueta`);
    assert.ok(
      programa.plantillaUrl?.includes("{q}"),
      `${clave}: plantillaUrl debe contener {q}`,
    );
    assert.ok(
      programa.plantillaUrl.startsWith("https://"),
      `${clave}: plantillaUrl debe ser https`,
    );
    assert.equal(typeof programa.sufijo, "string", `${clave}: sufijo`);
    assert.equal(typeof programa.prefijoDeeplink, "string", `${clave}: prefijoDeeplink`);
  }
});

test("porEnfoque solo referencia programas existentes", () => {
  const enfoquesValidos = new Set(["Central America", "International", "EV / premium"]);
  for (const [enfoque, claves] of Object.entries(config.porEnfoque)) {
    assert.ok(enfoquesValidos.has(enfoque), `enfoque desconocido: ${enfoque}`);
    for (const clave of claves) {
      assert.ok(config.programas[clave], `porEnfoque referencia programa inexistente: ${clave}`);
    }
  }
});

test("un programa activo debe tener identificador de afiliado", () => {
  for (const [clave, programa] of Object.entries(config.programas)) {
    if (programa.activo) {
      assert.ok(
        programa.sufijo.trim() !== "" || programa.prefijoDeeplink.trim() !== "",
        `${clave}: activo sin sufijo ni prefijoDeeplink (falta el ID real de afiliado)`,
      );
    }
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
