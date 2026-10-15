# Sola FV Pro

Calculadora de dimensionamiento fotovoltaico (On-Grid, Off-Grid, Híbrido OG, Híbrido OF) para Nicaragua y Centroamérica. Es un único `index.html` que WebIntoApp empaqueta como app de Android (`assets/htmlapp/root/index.html` dentro del APK).

## Versión 1.1

### Errores corregidos

- **Inversor y MPPT topados en silencio**: si el sistema pasaba de 100 kW o de 150 A, la app mostraba igual 100 kW / 150 A. Ahora reparte en varias unidades (por ejemplo, `3 × 100 kW`) y lo avisa.
- **Porcentaje fuera de rango al cambiar de modo**: de Híbrido OG con 50 % a Híbrido OF, el deslizador se veía en 80 % pero el cálculo usaba 50 %. Ahora se ajusta al rango de cada modo.
- **PDF con datos distintos a los de pantalla**: si se cambiaba la batería o el tipo después de calcular, el PDF mezclaba datos nuevos con resultados viejos. Ahora resultados y PDF usan los datos con los que se calculó.
- **Tipo Casa/Edificio**: al reabrir la app siempre aparecía "Casa" aunque se hubiera guardado "Edificio".
- **Datos guardados dañados** podían hacer fallar la app al abrir (por ejemplo, un índice de batería que no existe). Ahora se validan.
- **PDF**: la unidad se montaba encima del número grande, la última fila se salía de cada tarjeta y, en un salto de página, la tarjeta de la derecha podía quedar en la página equivocada.
- **PDF sin internet**: la librería jsPDF se descargaba de internet, y sin conexión el botón PDF no funcionaba aunque la app decía "funcionalidad completa offline". Ahora va incluida en el archivo.
- **Área de paneles**: se calculaba con 5 m² por kW para cualquier panel. Ahora usa las medidas reales de cada clase (630 W ≈ 2.38 × 1.13 m = 2.70 m²) y muestra el área de techo con un 20 % de margen.

### Novedades

- **Panel de 630 W** (N-type bifacial, 2382 × 1134 mm) en la lista.
- **Tecnología del panel**: monofacial o bifacial (+3 %, +7 % o +10 % según el montaje).
- **Baterías rack LFP de 51.2 V** (100, 200 y 314 Ah), las más usadas hoy con inversores híbridos. Solo aparecen con Litio.
- **Demanda pico (kW)**: el inversor se dimensiona también por la carga máxima × 1.25 (arranque de motores), no solo por el tamaño del array.
- **Relación DC/AC** en el inversor, y en On-Grid una alternativa de inversor con DC/AC 1.2.
- **Recomendaciones de instalación** según el diseño:
  - corriente de los paneles de ≥ 580 W (Isc 14–18 A) frente al límite por entrada MPPT del inversor;
  - manipulación y fijación de módulos grandes;
  - tensión de banco recomendada según los kWp;
  - demasiadas baterías en paralelo.
- **Notas técnicas actualizadas**: paneles N-type TOPCon/HJT, relación DC/AC, apagado rápido (NEC 690.12) y comunicación BMS–inversor.

## Publicar

- **Instalación directa (APK)**: el APK 1.1 se firmó con la misma llave que el 1.0 (`solafvpro`), así que se instala encima y conserva los datos. Mantiene `versionName 1.0` y `versionCode 100`, porque esos valores van dentro del manifiesto compilado.
- **Google Play**: sube este `index.html` a WebIntoApp y genera allí la versión 1.1, con un `versionCode` mayor que 100.

La llave (`my-release-key.jks`) y su contraseña no se guardan en este repositorio.
