# Respaldo maestro de Sam7 y Cabin Filter Guide

Fecha del respaldo: 30 de agosto de 2026  
Nombre del agente principal: **Sam7**  
Sitio público provisional: https://cabin-filter-guide.heamilendk.chatgpt.site

Este paquete conserva el código completo de Cabin Filter Guide, las siete fichas iniciales,
la estructura propuesta para la organización de agentes, la especificación de la
rutina nocturna y las reglas de seguridad y monetización acordadas.

## Estado al momento del respaldo

- Cabin Filter Guide está publicado y accesible públicamente.
- La marca pública, los metadatos y la dirección provisional fueron actualizados
  desde CabinFit y `sam7-directory`.
- Contiene 7 fichas de filtros de cabina enlazadas a sus fuentes.
- La mezcla inicial es 4 fichas de enfoque centroamericano, 2 internacionales y
  1 eléctrica/premium.
- Sam7 tiene una rutina nocturna activa alrededor de las 7:00 p. m. en la zona
  horaria America/Managua.
- La rutina intenta añadir una sola ficha verificada por ejecución.
- No hay anuncios, enlaces de afiliados ni ingresos activados todavía.
- Las gestiones comerciales están bloqueadas hasta el 6 de septiembre de 2026
  y, después, requieren al menos 20 fichas y métricas reales de tráfico.

## Contenido

- `sitio/`: código fuente completo del sitio publicado.
- `documentacion/automatizacion-sam7.json`: especificación recuperable de la
  rutina nocturna, sin su identificador interno.
- `documentacion/organizacion-sam7.md`: diseño de la futura organización de
  agentes.
- `documentacion/organizacion-sam7.html`: representación visual de la red.
- `documentacion/fuentes-iniciales.md`: fuentes utilizadas para las primeras
  fichas.
- `documentacion/historial.md`: decisiones y cambios principales.

## Restauración local del sitio

Requisitos: Node.js 22.13 o posterior y un entorno Linux compatible.

```bash
cd sitio
npm ci
npm run dev
```

El código conserva la identidad de alojamiento del proyecto existente. Antes de
registrar otro sitio, conviene comprobar si Cabin Filter Guide continúa activo para evitar
crear una copia accidental. La rutina automática se restaura por separado usando
la especificación incluida en `documentacion/automatizacion-sam7.json`.

El dominio ideal `CabinFilterGuide.com` no forma parte de este respaldo ni está
comprado. Activarlo requiere comprobar disponibilidad, autorizar el gasto y
configurar los registros DNS. Hasta entonces la dirección pública seguirá
terminando en `chatgpt.site`.

## Qué no contiene por seguridad

- Contraseñas, claves API, tokens o credenciales temporales.
- Datos bancarios de Banpro, Payoneer, Amazon u otras cuentas de cobro.
- Acceso a Outlook o a redes sociales.
- Identificadores internos de la automatización.

El alojamiento público y la programación activa existen fuera del archivo. Este
respaldo conserva el proyecto y sus instrucciones, pero no suplanta las cuentas
ni sus permisos.

## Principio operativo

Sam7 puede investigar, verificar, construir y reportar. Gastar dinero, cambiar
cuentas de cobro, abrir nuevos sitios públicos o enviar el primer correo comercial
requiere autorización expresa de Rodrigo.

No existe una garantía de tráfico o ganancias. El sistema prioriza evidencia,
calidad y crecimiento acumulativo antes de monetizar.
