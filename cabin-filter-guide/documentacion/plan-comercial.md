# Plan comercial de Cabin Filter Guide

Investigación: 1 de septiembre de 2026. Estrategia aprobada por Rodrigo:
priorizar patrocinios locales y afiliados de repuestos sobre anuncios display.

## Reglas (intactas)

- Nada se activa antes del **6 de septiembre de 2026** y sin **20+ fichas** y
  **tráfico medible**.
- Rodrigo crea todas las cuentas y recibe los pagos (Payoneer / Banpro).
- Todo enlace de afiliado o patrocinio va claramente etiquetado.
- La comisión jamás cambia lo que una ficha dice sobre compatibilidad.
- Ningún tráfico artificial, jamás: es fraude y mata las cuentas.

## Vía 1 — Patrocinios locales (prioridad máxima)

Vender el espacio "¿Dónde comprarlo en Nicaragua?" dentro de las fichas a
repuesteras y lubricentros por tarifa mensual fija (referencia: US$20–50/mes).
Monetiza a la audiencia centroamericana, que no compra en tiendas de EE.UU.

- El espacio ya está construido en el sitio (`sponsor-box`); se enciende por
  ficha o global en `sitio/data/monetizacion.json` → `patrocinadores`.
- Candidatos a identificar (bot Comercial, después del umbral): repuesteras
  con presencia en línea en Managua, distribuidores de filtros (MANN, FRAM,
  Sakura), lubricentros con redes sociales activas.
- **El primer contacto siempre lo envía Rodrigo.** Borrador de propuesta:

> Asunto: Espacio patrocinado en Cabin Filter Guide
>
> Hola, soy Rodrigo Rodríguez, de Cabin Filter Guide
> (https://rjrm0483-cloud.github.io/Proyectos-RJ-./guia/), un directorio en
> español que ayuda a conductores de Nicaragua a encontrar el filtro de
> cabina exacto para su vehículo, verificado con catálogos oficiales.
> Recibimos [X] visitas al mes de personas buscando filtros para [modelos].
> Ofrecemos un espacio "¿Dónde comprarlo en Nicaragua?" dentro de las fichas,
> con el nombre de su negocio, un mensaje corto y enlace o teléfono, por
> US$[X]/mes, claramente marcado como patrocinado. ¿Le interesa que le
> muestre cómo se vería con su marca?

## Vía 2 — Afiliados de repuestos (tráfico internacional)

Orden de solicitud recomendado (todos cobrables vía Payoneer):

| # | Programa | Comisión aprox. | Dónde registrarse | Al aprobar, pegar en monetizacion.json |
|---|----------|-----------------|-------------------|----------------------------------------|
| 1 | eBay Partner Network | variable, repuestos fuertes | partnernetwork.ebay.com | `campid` en el sufijo de `ebay` |
| 2 | Amazon Associates (EE.UU.) | ~4.5% automotriz | affiliate-program.amazon.com | `tag` en el sufijo de `amazon` |
| 3 | Advance Auto Parts | hasta 12% escalonado | vía red (CJ/Impact) desde shop.advanceautoparts.com/o/affiliates | `prefijoDeeplink` de la red en `advance` |
| 4 | AliExpress | 4–9% | portals.aliexpress.com o Admitad | `prefijoDeeplink` en `aliexpress` |
| 5 | AUTODOC (Europa) | 3–8%, cookie 30 días | Admitad | `prefijoDeeplink` en `autodoc` |

Notas: Amazon exige 3 ventas en los primeros 180 días para permanecer;
solicitarlo cuando ya haya tráfico. MercadoLibre (hasta 14%) no cubre
Nicaragua — re-evaluar si expande. Los anuncios display (AdSense/Ezoic)
quedan como complemento futuro, no como vía principal.

## Cómo funciona la activación (ya cableada en el sitio)

1. Rodrigo se registra en un programa y obtiene su identificador.
2. Se pega el identificador en `sitio/data/monetizacion.json` (cada programa
   trae su `notaActivacion` con el formato exacto), se pone `activo: true`
   en el programa y `afiliadosActivos: true` global.
3. El sitio genera automáticamente los enlaces por ficha según su enfoque
   (Centroamérica → AliExpress/Amazon/eBay; Internacional →
   Amazon/Advance/eBay; EV → Amazon/eBay), etiquetados "Enlaces de
   afiliado" con la divulgación visible, y las fichas nuevas de la rutina
   nocturna los heredan sin trabajo adicional.
4. La validación (`tests/monetizacion.test.mjs`) impide activar un programa
   sin identificador real.
5. Actualizar la página /disclosure el día que se active el primer programa.

## Crecimiento futuro (cuando el directorio madure)

- Categorías de ticket alto con el mismo método verificado: llantas
  (TireRack paga US$16–72 por orden), baterías, kits de mantenimiento.
- Requisito previo pendiente: analítica (GoatCounter o similar) y Google
  Search Console para demostrar tráfico real — cuentas de Rodrigo.
