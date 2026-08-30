# Cambios de la versión 2 — Cabin Filter Guide

Fecha: 30 de agosto de 2026
Base: respaldo `Sam7CabinFilterGuidebasev1` (7 fichas, versión publicada 4)

Esta versión implementa las mejoras de alto impacto y bajo riesgo identificadas en
la revisión del respaldo (`analisis-cabin-filter-guide.md` en la raíz del
repositorio). Todo fue compilado y verificado: las rutas nuevas responden 200,
el sitemap incluye todas las páginas y la suite de pruebas pasa (las 2 pruebas
del template que fallan ya fallaban en el respaldo original porque dependen del
entorno de hosting de OpenAI, no del código).

## 1. Datos fuera del código (protege la rutina nocturna)

- Las fichas ahora viven en `sitio/data/filters.json` (datos puros).
- `sitio/data/filters.ts` valida ese JSON con un esquema zod al compilar:
  slug único en kebab-case, al menos una fuente https, fecha ISO, campos
  obligatorios no vacíos y categorías dentro del enum. Una ficha malformada
  rompe la compilación de forma controlada en lugar de publicar una página rota.
- Prueba nueva `sitio/tests/data-validation.test.mjs` (6 casos) que valida el
  JSON sin necesidad de compilar. Sam7 debe editar **solo** `filters.json`.

## 2. Páginas de confianza y monetización

Nuevas rutas, enlazadas desde el pie de página de todo el sitio:

- `/about` — metodología de verificación y niveles de confianza.
- `/disclosure` — divulgación de afiliados (estado actual: ninguno activo).
- `/privacy` — política de privacidad (requisito de AdSense y afiliados).
- `/contact` — página de contacto. **Pendiente de Rodrigo:** publicar el correo
  de contacto aprobado (marcado con TODO en el código).

## 3. SEO

- `metadataBase` + URLs canónicas en todas las páginas (`sitio/lib/site.ts`
  centraliza la URL pública; al comprar el dominio propio solo se cambia ahí).
- Open Graph y Twitter cards en portada y fichas (vista previa al compartir
  por WhatsApp/Facebook).
- JSON-LD ampliado: `ItemList` en la portada, `BreadcrumbList` +
  `mainEntityOfPage` en cada ficha.
- Sitemap ahora incluye fichas, páginas por número de parte y páginas estáticas.

## 4. Páginas por número de parte y enlaces internos

- Nueva ruta `/parts/[referencia]` (ej. `/parts/mann-filter-cu-22-032`):
  lista todos los vehículos verificados que usan esa referencia. Captura
  búsquedas directas de número de parte ("CU 22 032 equivalencia").
- Cada ficha enlaza a su página de parte y muestra la sección
  "Vehicles that share this filter" cuando otra ficha comparte referencia
  (hoy: Hilux ↔ Yaris Cross).

## 5. Búsqueda mejorada

- Ignora acentos ("electrico" encuentra "eléctrico") y separadores en
  referencias ("CU17001" encuentra "CU 17 001").

## 6. Rutina nocturna v2 (`documentacion/automatizacion-sam7.json`)

- Edita solo `data/filters.json` y `data/registro.json`, nunca código.
- Valida el esquema antes de publicar; si falla, revierte y reporta.
- Deduplica por modelo **y** por referencia de pieza.
- Registra cada ejecución en `sitio/data/registro.json` (registro persistente,
  semilla incluida) — base del "registro central" de la futura organización.
- Una de cada siete ejecuciones re-verifica los enlaces de las fuentes
  existentes en lugar de añadir ficha.
- Las reglas comerciales (6 de septiembre, 20 fichas, borrador en Outlook,
  sin envíos masivos) se mantienen intactas.

## 7. Limpieza

- Paquete renombrado de `mogul-directory` a `cabin-filter-guide`
  (package.json y package-lock.json).

## Pendientes que requieren decisión o trabajo posterior

1. **Idioma español** — la mejora de mayor impacto sigue pendiente: el sitio
   apunta a Centroamérica pero está en inglés. Requiere traducir interfaz y
   fichas y decidir español-primero vs. bilingüe con hreflang.
2. **Correo de contacto** — aprobar y publicar en `/contact`.
3. **Re-verificar Hilux/Yaris Cross** (misma referencia MANN CU 22 032 con la
   misma fuente) y conseguir la referencia real del filtro del Tesla Model 3.
4. **Dominio propio** — al activarlo, actualizar `SITE_URL` en `sitio/lib/site.ts`.

## Cómo aplicar esta versión al sitio publicado

El código de `sitio/` es autocontenido: restaurar igual que la v1
(`npm ci` / `npm run install:ci`, `npm run dev`) o entregar este árbol a la
plataforma de hosting como nueva versión. La rutina nocturna debe actualizarse
con el prompt nuevo de `documentacion/automatizacion-sam7.json`.
