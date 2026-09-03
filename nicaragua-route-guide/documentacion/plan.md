# Plan de Nicaragua Route Guide

Fecha: 3 de septiembre de 2026. Decisión de Rodrigo: detener Cabin Filter
Guide (comisiones de repuestos demasiado bajas) y concentrar el esfuerzo en un
nicho con mejor pago por referido.

## El nicho

Logística de viaje a Nicaragua para visitantes internacionales: cómo ir del
aeropuerto a Granada, León, San Juan del Sur, Ometepe y Corn Island; cómo
cruzar a Costa Rica; qué cuesta y cuánto tarda cada opción. Es contenido de
intención de compra alta (la persona ya tiene el vuelo y está organizando el
viaje) y con productos de comisión alta asociados de forma natural.

## Cómo gana dinero (todo apagado hasta que Rodrigo registre las cuentas)

| Producto | Programa | Comisión publicada | Dónde registrarse | Al aprobar |
|----------|----------|--------------------|-------------------|------------|
| Alquiler de auto en el aeropuerto | Discover Cars | 70% de la ganancia + 30% de la cobertura; cookie 365 días; US$20–50 típicos por reserva | discovercars.com/affiliate-program | sufijo `?a_aid=ID` en `discovercars` |
| Traslados privados y tours | Viator | 8% por reserva, cookie 30 días | partnerresources.viator.com | sufijo con `pid` en `viator` |
| Traslados privados y tours | GetYourGuide | 8% base | partner.getyourguide.com | sufijo `&partner_id=ID` en `getyourguide` |
| Shuttles compartidos y buses | Bookaway (vía Travelpayouts) | 5–10% por reserva confirmada | travelpayouts.com | `prefijoDeeplink` en `bookaway` |
| Seguro de viaje | SafetyWing | 10% recurrente durante 12 meses | safetywing.com/ambassador | sufijo `?referenceID=ID` en `safetywing` |
| eSIM | Airalo | hasta 10% | partners.airalo.com | enlace rastreado en `airalo` |
| Vuelos domésticos | Kiwi.com (vía Travelpayouts), opcional | ~3% | travelpayouts.com | `prefijoDeeplink` en `kiwi` |

Vía local adicional: patrocinio de una rent-a-car o tour operador de Managua /
San Juan del Sur en el espacio "Local operator · Sponsored" de cada ruta
(`patrocinadores` en `monetizacion.json`), por tarifa mensual.

## Cómo está cableado

- Cada opción de transporte declara un `partner` (`cars`, `tours`, `ground`,
  `flights` o `null`). El sitio resuelve ese slot contra `monetizacion.json`:
  si el programa está activo con ID real, aparece el enlace etiquetado
  "(affiliate link)" con `rel="sponsored"`; si no, no aparece nada.
- Cada ruta y la página `/essentials` muestran además el bloque "Before you
  go" con eSIM y seguro cuando esos programas estén activos.
- `tests/monetizacion.test.mjs` bloquea la compilación si se activa un
  programa sin identificador o con un marcador tipo `TU-ID`.
- Al activar el primer programa hay que actualizar `/disclosure` y `/privacy`.

## Reglas (intactas)

- Rodrigo crea las cuentas, recibe los pagos y aprueba cualquier primer correo
  comercial; el agente solo prepara borradores.
- Nada de afiliados antes del 6 de septiembre de 2026, y después solo con
  20+ rutas y tráfico medible (pendiente: GoatCounter o similar + Search
  Console, cuentas de Rodrigo).
- Todo enlace de afiliado o patrocinio va etiquetado; la comisión jamás cambia
  lo que una ruta dice sobre costos, tiempos o la opción recomendada.
- Ningún tráfico artificial. Ningún envío de correos a terceros. Nunca
  inventar identificadores ni métricas.

## Ruta de crecimiento

1. Rutas de llegada (aeropuerto → destinos principales) hasta cubrir todas las
   combinaciones habituales, incluida la llegada por Liberia (Costa Rica).
2. Tramos ciudad a ciudad (Granada ↔ León, Granada ↔ San Juan del Sur,
   Managua ↔ Matagalpa/Estelí) y las islas (Ometepe desde Granada, Corn
   Island por barco desde Bluefields).
3. Fronteras: Peñas Blancas en ambos sentidos, Las Tablillas, El Guasaule y
   Las Manos hacia Honduras.
4. Guías "essentials" por tema (dinero, conducir, seguridad en carretera) y
   versión en español cuando el tráfico lo justifique.
5. Dominio propio cuando haya tráfico real (decisión y pago de Rodrigo).

## Primeras seis rutas (3 de septiembre de 2026)

Managua Airport → Granada; → León; → San Juan del Sur; San Jorge → Ometepe
(ferry); Managua → San José por Peñas Blancas (bus internacional + tasas);
Managua → Big Corn / Little Corn (La Costeña + panga). Todas en confianza
"Conditional" porque las tarifas las fijan los operadores; cada cifra enlaza
su fuente y cada ruta declara la fecha de verificación.
