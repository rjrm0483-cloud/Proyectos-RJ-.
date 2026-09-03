# Nicaragua Route Guide

Directorio en inglés de logística de viaje en Nicaragua (traslados desde el
aeropuerto, ferris, vuelos domésticos y cruces de frontera), con costos,
tiempos y cautelas verificados con fuentes. Sustituye a Cabin Filter Guide como
proyecto principal desde el 3 de septiembre de 2026 y reutiliza su motor.

- Sitio público: https://rjrm0483-cloud.github.io/Proyectos-RJ-./nicaragua/
- Código: `sitio/` (Next.js 16, exportación estática, datos en JSON validados con zod).
- Datos: `sitio/data/routes.json` (rutas), `sitio/data/registro.json` (bitácora),
  `sitio/data/monetizacion.json` (programas de afiliados, apagados).
- Documentación: `documentacion/plan.md` (nicho, estrategia y activación) y
  `documentacion/rutina-nocturna.json` (especificación del ciclo automático).

## Por qué en inglés

Las comisiones de este nicho (alquiler de autos, traslados, tours, eSIM y
seguro) las pagan viajeros internacionales que buscan en inglés "how to get
from Managua airport to Granada". El público centroamericano viaja en bus y
casi no reserva por estas plataformas. La gestión y la documentación siguen en
español.

## Operación local

```bash
cd sitio
npm ci
node --test tests/*.test.mjs
npm run build      # genera out/ con basePath /Proyectos-RJ-./nicaragua
```

La publicación la hace el workflow `publicar-cabin-filter-guide.yml` de la
rama `main`, que compila este sitio en `/nicaragua` y conserva en la raíz del
Pages la política de privacidad de Agenda Psiquiátrica Pro.
