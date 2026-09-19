import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const config = JSON.parse(
  readFileSync(new URL("../data/analitica.json", import.meta.url), "utf8"),
);

const PROVEEDORES = new Set(["goatcounter", "plausible", "umami", "cloudflare"]);

test("la configuración de analítica tiene la estructura esperada", () => {
  assert.equal(typeof config.activa, "boolean");
  assert.ok(PROVEEDORES.has(config.proveedor), `proveedor desconocido: ${config.proveedor}`);
  assert.equal(typeof config.codigo, "string");
  assert.equal(typeof config.dominio, "string");
  assert.ok(config.nota?.trim(), "la nota de activación no puede estar vacía");
});

test("no se puede activar la analítica sin los datos que pide el proveedor", () => {
  if (!config.activa) return;
  const codigo = config.codigo.trim();
  const dominio = config.dominio.trim();
  const falta = {
    goatcounter: !codigo,
    plausible: !dominio,
    umami: !codigo || !dominio,
    cloudflare: !codigo,
  }[config.proveedor];
  assert.ok(
    !falta,
    `analítica activa con ${config.proveedor} pero faltan datos: codigo="${codigo}" dominio="${dominio}"`,
  );
});

test("el código no puede ser un marcador de ejemplo", () => {
  if (!config.activa) return;
  const sospechosos = ["tu-codigo", "your-code", "ejemplo", "example", "xxx", "test", "cambiar"];
  const valor = `${config.codigo} ${config.dominio}`.toLowerCase();
  for (const marcador of sospechosos) {
    assert.ok(!valor.includes(marcador), `el valor parece un marcador de ejemplo: "${marcador}"`);
  }
});

test("la política de privacidad describe la analítica solo cuando está encendida", () => {
  const privacidad = readFileSync(new URL("../app/privacy/page.tsx", import.meta.url), "utf8");
  assert.ok(
    privacidad.includes("analiticaEncendida"),
    "la página de privacidad debe decidir su texto con analiticaEncendida()",
  );
  assert.ok(
    privacidad.includes("no third-party advertising or analytics active"),
    "debe conservar el texto para cuando la analítica está apagada",
  );
});
