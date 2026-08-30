# Análisis y mejoras propuestas — Cabin Filter Guide (Sam7)

Fecha de revisión: 30 de agosto de 2026
Archivo revisado: `Sam7CabinFilterGuidebasev1` (respaldo completo del sitio + documentación de la rutina nocturna)

## Veredicto general

El proyecto está bien planteado: la propuesta de valor (compatibilidad de filtros de cabina **con fuente verificable**), las reglas de seguridad de la rutina nocturna y los umbrales antes de monetizar son sólidos y poco comunes en proyectos autónomos. El código es limpio y el diseño de las fichas es bueno.

Sin embargo, hay **un problema estratégico grande** (el idioma), **dos riesgos técnicos** para un sitio que se edita solo cada noche, y **varias brechas de SEO y monetización** que conviene cerrar antes del 6 de septiembre.

---

## 1. Prioridad máxima: el idioma no coincide con la audiencia

El sitio declara una mezcla 60% Nicaragua/Centroamérica, pero **todo el contenido está en inglés** y el HTML declara `lang="en"`.

- Una persona en Managua busca "filtro de cabina Toyota Hilux" o "filtro de aire acondicionado Hyundai Tucson", no "cabin air filter Hilux".
- Google va a posicionar el sitio para búsquedas en inglés, donde compite contra RockAuto, FRAM, Amazon, etc. En español centroamericano la competencia es casi nula — esa es la ventaja real del proyecto.

**Recomendación:** convertir el sitio a español como idioma principal (o bilingüe con `hreflang`), y actualizar la rutina nocturna para que cada ficha nueva se redacte en español. Es el cambio con mayor retorno de todo este análisis.

## 2. Riesgo técnico: los datos viven dentro del código

Todas las fichas están en `sitio/data/filters.ts` como código TypeScript. Cada noche el agente **edita código fuente** para añadir una ficha. Un error de sintaxis, una comilla mal escapada o un campo faltante rompe la compilación del sitio completo.

**Recomendación:**
- Mover las fichas a `data/filters.json` y validarlas con un esquema (zod) al compilar.
- Añadir un test que verifique cada ficha: slug único, al menos 1 fuente, URLs válidas, fecha en formato ISO, `focus` dentro del enum. Hoy, una ficha sin fuentes rompería la portada en tiempo de ejecución (`record.sources[0].type` sin verificación).
- Instruir a la rutina: "si `npm test` falla, revierte el cambio y repórtalo, no publiques".

Esto convierte un fallo catastrófico (sitio caído) en un fallo controlado (ficha rechazada).

## 3. Inconsistencias en los datos actuales

- **Toyota Hilux y Yaris Cross usan la misma referencia** (MANN CU 22 032) y la misma URL de fuente. Es posible que Toyota comparta el filtro entre plataformas, pero que un pickup 2015 y un crossover 2020 usen dimensiones idénticas (216×186×30 mm) merece re-verificación con el número OE de Toyota de cada uno antes de que alguien compre mal.
- **Slugs incoherentes con los años**: `2025-suzuki-fronx` cubre 2023–2026; `2022-jeep-grand-cherokee` cita aplicaciones 2021–2026; `tesla-model-3` no lleva año. No es grave, pero conviene fijar una convención (`marca-modelo-añoinicio-añofin`) antes de que existan 100 fichas, porque cambiar slugs después rompe URLs indexadas.
- **Tesla Model 3 sin referencia de pieza real** ("Tesla cabin filter set"). Para un directorio cuyo valor es la referencia exacta, esa ficha está incompleta — Tesla publica el número de parte en su catálogo.

## 4. SEO: brechas concretas

1. **Sin Open Graph ni Twitter cards** — al compartir una ficha en WhatsApp/Facebook (canal principal en Centroamérica) no hay vista previa. Añadir `openGraph` en `layout.tsx` y en las páginas de detalle.
2. **Sin URLs canónicas** (`metadataBase` + `alternates.canonical`) — importante porque el sitio vive en un dominio provisional y migrará a dominio propio.
3. **JSON-LD limitado**: hoy solo `TechArticle`. Añadir `BreadcrumbList` en las fichas e `ItemList` en la portada. Considerar `FAQPage` con 2–3 preguntas por ficha ("¿Cada cuánto se cambia?", "¿Dónde está ubicado?") — son exactamente las búsquedas que la gente hace.
4. **Sin enlaces internos entre fichas**: Hilux y Yaris Cross comparten filtro y no se enlazan. Una sección "Vehículos que usan este mismo filtro" mejora SEO y utilidad a la vez.
5. **Falta la página por número de parte** (`/parts/cu-22-032`): mucha gente busca directamente "CU 22 032 equivalencia" o "97133-L1000 compatible". Es tráfico de intención de compra altísima que hoy se pierde.
6. **Búsqueda sin normalizar acentos**: "Suzuki Fronx" funciona, pero cuando el contenido esté en español, "eléctrico" vs "electrico" no coincidirá. Normalizar con `.normalize("NFD")`.

## 5. Requisitos previos a la monetización (faltan páginas)

Para AdSense, programas de afiliados serios (Amazon Associates incluido) y confianza general, el sitio necesita páginas que hoy no existen:

- **Acerca de / Metodología** (cómo se verifica cada ficha — ya tienen el texto, solo falta la página).
- **Política de privacidad** (obligatoria para AdSense y afiliados).
- **Contacto**.
- **Divulgación de afiliados** como página propia, no solo la línea del pie.

Sin esto, el hito del 6 de septiembre llegará y el sitio no será elegible para los programas que quiere solicitar. Es trabajo que se puede dejar listo desde ya sin violar la regla de "no iniciar gestiones comerciales".

## 6. Mejoras a la rutina nocturna (`automatizacion-sam7.json`)

La especificación es buena. Sugerencias puntuales:

- **Deduplicar también por referencia de pieza**, no solo por modelo (evita fichas casi idénticas Yaris/Yaris Cross).
- **Registro persistente**: el informe nocturno se pierde en el chat. Añadir un `data/registro.json` en el propio sitio (fecha, ficha añadida/rechazada, motivo, fuente) — eso además implementa el "registro central" que la organización de 5 departamentos va a necesitar, sin esperar a Airtable.
- **Mantenimiento, no solo crecimiento**: 1 de cada 7 ejecuciones, en lugar de añadir ficha, re-verificar los enlaces de las fuentes existentes (los catálogos OEM cambian de URL con frecuencia). Un directorio "100% source-linked" con enlaces rotos pierde su única ventaja.
- **Ritmo**: 1 ficha/noche significa llegar a 20 fichas alrededor del 13 de septiembre. Si se quiere acelerar sin bajar la calidad, permitir hasta 2 fichas por ejecución cuando ambas queden con confianza "Verified" y fuentes distintas.

## 7. Limpieza menor (bajo riesgo, baja prioridad)

- El proyecto arrastra ~60 componentes shadcn/ui de los que solo usa 2 (`Badge`, `Input`), más `db/`, `drizzle/`, `examples/`, `chart.tsx`, `calendar.tsx`, etc. No rompe nada, pero para un agente que edita el sitio de forma autónoma, menos superficie = menos posibilidades de tocar lo que no debe.
- `package.json` aún se llama `mogul-directory` (nombre viejo del agente); renombrar a `cabin-filter-guide`.
- El campo `filterCount` guarda texto de presentación ("1 filter") en lugar del número; al traducir a español habrá que tocar datos y no solo la interfaz. Guardar `filterCount: 1` y formatear en la vista.

---

## Orden de ejecución recomendado

| # | Cambio | Impacto | Esfuerzo |
|---|--------|---------|----------|
| 1 | Sitio en español (o bilingüe) + rutina redactando en español | Muy alto | Medio |
| 2 | Datos a JSON + validación con esquema + regla de revertir si falla | Alto (protege la autonomía) | Bajo |
| 3 | Páginas legales/confianza (about, privacidad, contacto, divulgación) | Alto (habilita monetizar) | Bajo |
| 4 | Open Graph + canónicas + JSON-LD ampliado | Alto | Bajo |
| 5 | Páginas por número de parte + enlaces internos entre fichas | Alto | Medio |
| 6 | Registro persistente + re-verificación de enlaces en la rutina | Medio | Bajo |
| 7 | Re-verificar Hilux/Yaris Cross y completar referencia Tesla | Medio | Bajo |
| 8 | Convención de slugs, limpieza de componentes, renombrar paquete | Bajo | Bajo |

Los puntos 2, 3 y 4 se pueden implementar directamente sobre este respaldo y quedar listos para la próxima publicación del sitio.
