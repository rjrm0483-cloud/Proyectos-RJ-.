# Historial resumido

## 30 de agosto de 2026

- Se creó el agente y inicialmente se llamó Mogul.
- Se cambió su nombre a Sam7.
- Se definió CabinFit como un directorio de compatibilidad de filtros de cabina.
- Se publicó el sitio con tres fichas iniciales: Subaru Forester, Jeep Grand
  Cherokee y Tesla Model 3.
- Se creó la rutina nocturna de Sam7 para investigar, verificar y publicar una
  ficha por ejecución.
- Se amplió la mezcla hacia Nicaragua y Centroamérica.
- Se añadieron Suzuki Fronx, Toyota Hilux, Toyota Yaris Cross y Hyundai Tucson.
- Se incorporaron filtros visibles por enfoque regional.
- Se corrigió el nombre antiguo Mogul en el contenido público.
- Se fijó una mezcla objetivo de 60% Centroamérica, 30% internacional y 10%
  eléctrico/premium.
- Se aplazó cualquier gestión de afiliados hasta el 6 de septiembre de 2026 y
  se mantuvieron los umbrales de 20 fichas y tráfico real.
- Se diseñó una futura organización con Rastreador, Verificador, Constructor,
  Comercial y Auditor bajo la dirección de Sam7.
- Se cambió la marca pública de CabinFit a **Cabin Filter Guide** para evitar
  confusión con marcas existentes y comunicar el nicho con mayor claridad.
- Se cambió la dirección provisional de `sam7-directory` a
  `cabin-filter-guide` y se publicó la versión 4.
- El dominio propio `CabinFilterGuide.com` quedó pendiente de comprobar,
  comprar y conectar con autorización expresa de Rodrigo.

## Objetivo general

Construir una red de activos digitales útiles y verificables que pueda crecer
mediante rutinas automáticas y monetizarse después con publicidad, afiliados,
referidos o patrocinios, sin sacrificar seguridad, transparencia o control humano.

## 30 de agosto de 2026 — versión 2 del respaldo

- Se revisó el respaldo v1 con un análisis externo (ver
  `analisis-cabin-filter-guide.md` en la raíz del repositorio).
- Las fichas se movieron a `data/filters.json` con validación de esquema (zod)
  y una prueba de datos propia; Sam7 ya no edita código TypeScript.
- Se añadieron las páginas About, Privacy, Contact y Affiliate Disclosure con
  pie de página compartido.
- Se añadió SEO: canónicas, Open Graph/Twitter, ItemList y BreadcrumbList.
- Se crearon páginas por número de parte (`/parts/...`) y enlaces internos
  entre fichas que comparten filtro.
- La búsqueda ignora acentos y separadores de referencias.
- La rutina nocturna pasó a v2: edita solo JSON, valida antes de publicar,
  deduplica por referencia, registra cada ejecución en `data/registro.json` y
  dedica una de cada siete noches a re-verificar enlaces.
- Paquete renombrado a `cabin-filter-guide`.
- Pendientes: versión en español, correo de contacto, re-verificación
  Hilux/Yaris Cross, referencia real del Tesla Model 3, dominio propio.

## 30 de agosto de 2026 — versión 3: sitio en español y operación por Claude

- Todo el sitio se convirtió al español: interfaz, las 7 fichas, metadatos,
  Open Graph (es_NI), JSON-LD (inLanguage es), páginas legales y `lang="es"`.
- Los campos internos focus y confidence conservan sus valores en inglés como
  claves estables; la interfaz los traduce con `lib/labels.ts`.
- La rutina nocturna pasó a v3: redacta las fichas en español y ahora la opera
  Claude Code mediante una rutina programada que trabaja sobre el repositorio
  GitHub (fuente de verdad). La rutina de Sam7 en ChatGPT debe pausarse para
  evitar ediciones duplicadas.
- La publicación al sitio en chatgpt.site se hace aplicando la versión del
  repositorio a la plataforma de alojamiento hasta que Rodrigo autorice otro
  alojamiento.

## 30 de agosto de 2026 — publicación controlada por Claude (GitHub Pages)

- Rodrigo autorizó mover el control de la publicación a Claude.
- Se añadió compilación estática (`npm run build:static`, output export con
  basePath) coexistiendo con la compilación vinext original.
- El Pages del repositorio ya publicaba la política de privacidad de Agenda
  Psiquiátrica Pro: se conserva intacta en la raíz y el directorio se sirve
  bajo /guia (crear el repositorio no fue posible con los permisos de la
  integración; un repo dedicado queda como opción futura).
- El workflow publicar-cabin-filter-guide.yml (rama main) compila desde la
  rama designada y despliega a GitHub Pages cada noche (03:30 UTC) y bajo
  demanda.
- Nueva URL pública: https://rjrm0483-cloud.github.io/Proyectos-RJ-./guia
- Canónicas, Open Graph, sitemap y robots ahora apuntan a la URL nueva; la
  copia de chatgpt.site queda obsoleta (retirarla o dejarla canonicalizando).
- El dominio propio CabinFilterGuide.com puede conectarse a GitHub Pages
  cuando Rodrigo lo compre (CNAME + actualizar SITE_URL y basePath).
