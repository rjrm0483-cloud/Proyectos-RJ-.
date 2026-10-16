# Sola FV Pro

Calculadora de dimensionamiento fotovoltaico (On-Grid, Off-Grid, Híbrido OG, Híbrido OF) para Nicaragua y Centroamérica. Es de uso personal: funciona **sin internet** y **sin anuncios**.

Desde la versión 1.2 la app ya no se arma con WebIntoApp (que en modo gratis agrega anuncios). Ahora es una app Android propia hecha con Capacitor, igual que la app de Inspección de Vivienda.

## Instalarla en el teléfono

Abra este enlace desde el teléfono y se descarga el APK más reciente:

https://github.com/rjrm0483-cloud/Proyectos-RJ-./releases/download/apk-solar/Sola-FV-Pro.apk

1. Toque el archivo `Sola-FV-Pro.apk`. Android pedirá permitir "instalar apps desconocidas" para la app desde donde lo abrió (Chrome, WhatsApp, Archivos…): acepte.
2. Pulse **Instalar**. Si Google Play Protect avisa que la app es desconocida, toque **Más detalles → Instalar de todas formas**.
3. La app aparece con su logo como **Sola FV Pro**.

Si tenía la versión de WebIntoApp, desinstálela: es otra app y es la que muestra los anuncios. Las versiones nuevas de esta app se instalan encima sin perder nada.

Para compartirla (por ejemplo, con la familia), mande el APK por WhatsApp **como Documento** o pase el enlace de arriba.

El botón **PDF** abre el menú Compartir del teléfono: elija WhatsApp, Drive, correo o "Guardar en Archivos".

## Versión 1.2

- App propia sin WebIntoApp: **sin anuncios**.
- El PDF se comparte o guarda desde el menú del teléfono.
- Mismo logo, ahora nítido en todas las pantallas.

## Versión 1.1

### Errores corregidos

- **Inversor y MPPT topados en silencio**: si el sistema pasaba de 100 kW o de 150 A, la app mostraba igual 100 kW / 150 A. Ahora reparte en varias unidades (por ejemplo, `3 × 100 kW`) y lo avisa.
- **Porcentaje fuera de rango al cambiar de modo**: de Híbrido OG con 50 % a Híbrido OF, el deslizador se veía en 80 % pero el cálculo usaba 50 %. Ahora se ajusta al rango de cada modo.
- **PDF con datos distintos a los de pantalla**: si se cambiaba la batería o el tipo después de calcular, el PDF mezclaba datos nuevos con resultados viejos. Ahora resultados y PDF usan los datos con los que se calculó.
- **Tipo Casa/Edificio**: al reabrir la app siempre aparecía "Casa" aunque se hubiera guardado "Edificio".
- **Datos guardados dañados** podían hacer fallar la app al abrir. Ahora se validan.
- **PDF**: la unidad se montaba encima del número grande, la última fila se salía de cada tarjeta y, en un salto de página, la tarjeta de la derecha podía quedar en la página equivocada.
- **PDF sin internet**: la librería jsPDF ahora va incluida en el archivo.
- **Área de paneles**: usa las medidas reales de cada clase (630 W ≈ 2.38 × 1.13 m = 2.70 m²) y muestra el área de techo con un 20 % de margen.

### Novedades

- **Panel de 630 W** (N-type bifacial, 2382 × 1134 mm).
- **Tecnología del panel**: monofacial o bifacial (+3 %, +7 % o +10 % según el montaje).
- **Baterías rack LFP de 51.2 V** (100, 200 y 314 Ah). Solo aparecen con Litio.
- **Demanda pico (kW)**: el inversor se dimensiona también por la carga máxima × 1.25.
- **Relación DC/AC** en el inversor, y en On-Grid una alternativa con DC/AC 1.2.
- **Recomendaciones de instalación** según el diseño (corriente de paneles ≥ 580 W frente al MPPT, módulos grandes, tensión de banco, baterías en paralelo).
- **Notas técnicas actualizadas**: paneles N-type TOPCon/HJT, DC/AC, apagado rápido (NEC 690.12), comunicación BMS–inversor.

---

## Para quien programe

- `www/index.html`: la app completa (HTML, CSS y JavaScript, con jsPDF incluido). Se prueba abriéndolo en Chrome.
- Empaquetado con Capacitor 8 (`capacitor.config.json`, id `com.rjrm.solafvpro`). Plugins `@capacitor/filesystem` y `@capacitor/share` para el PDF.
- `scripts/iconos.py` (necesita Pillow) genera el ícono y la pantalla de inicio desde `www/img/logo.png`; el original vectorial está en `scripts/logo.svg`.
- `scripts/firma.py` firma siempre con `firma/debug.keystore`; `scripts/version.py` pone la versión de `package.json` en el APK.
- `.github/workflows/apk-solar.yml` arma el APK en GitHub y lo publica en la versión `apk-solar`.
- En una computadora (Node 22, JDK 21 y Android Studio):

  ```
  cd sola-fv-pro
  npm install
  npm run android      # crea android/, pone ícono, firma y versión, y copia la app
  npx cap open android # Android Studio: Build → Build APK(s)
  ```
