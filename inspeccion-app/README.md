# Inspección de Vivienda — app móvil

App para hacer inspecciones de vivienda nueva en etapa de entrega sustancial, siguiendo la plantilla del informe del Arq. Rodrigo José Rodríguez Moraga. Funciona **sin internet** y guarda todo en el teléfono.

## Qué hace

1. **Nueva inspección**: datos generales y número automático `INS-AAAA-###` (se puede corregir a mano).
2. **Lista de verificación** por área (A a K, con los ítems de la plantilla). Botones grandes **C / O / N/A**. Al marcar **O**: prioridad (Alta, Media, Baja), observación y fotos con la cámara, enlazadas a ese ítem. En **K. Otros** se agregan ítems propios.
3. **Resumen**: los "O" ordenados de Alta a Baja, totales por prioridad, responsable y fecha de compromiso.
4. **Conclusión**: sugiere una según los pendientes (si hay alguno de prioridad Alta, sugiere "No se recomienda recibir").
5. **Firmas** del inspector y del cliente con el dedo. La suya se puede guardar para no firmar cada vez.
6. **PDF tamaño carta** con el membrete en todas las páginas, el alcance y las limitaciones de la plantilla, el registro fotográfico (2 fotos por fila, numeradas) y "Página X de Y". Se comparte por WhatsApp o correo.
7. **Revisita**: desde la lista de inspecciones, marque cada pendiente como corregido o no y genere el **informe de verificación**.

Modo **Día** (para pleno sol) y **Noche** con el botón ☀/☾ de arriba. Al principio sigue el modo del teléfono; luego recuerda su elección. El PDF siempre sale claro para imprimir.

En **Ajustes** (engranaje) se cambian su nombre, teléfono, correo, cédula, el logo y su firma guardada, y se hacen respaldos.

---

## 1. Probarla en la computadora (sin instalar nada)

1. Descargue el repositorio: en GitHub, botón verde **Code → Download ZIP**, y descomprímalo.
2. Abra la carpeta `inspeccion-app/www` y haga doble clic en **`index.html`**. Mejor si se abre con **Google Chrome**.
3. Para verla como en un teléfono: en Chrome pulse **F12** y luego el ícono del teléfono (arriba a la izquierda del panel), o pulse **Ctrl+Shift+M**.

En la computadora, "Tomar foto" abre el explorador de archivos para elegir una imagen; en el teléfono abre la cámara.

## 2. Generar el APK (lo hace GitHub por usted)

No necesita instalar Android Studio. Cada vez que se suben cambios de la app, GitHub arma el APK solo.

1. Entre al repositorio en GitHub y abra la pestaña **Actions**.
2. A la izquierda, elija **Generar APK de Inspección Vivienda**.
3. Abra la ejecución más reciente que tenga el círculo verde ✓. Si no hay ninguna, pulse **Run workflow → Run workflow** y espere unos 5 minutos.
4. Baje hasta **Artifacts** y descargue **Inspeccion-Vivienda-APK**. Es un ZIP; adentro está `Inspeccion-Vivienda.apk`.

## 3. Instalarla en el teléfono Android

1. Pase el archivo `Inspeccion-Vivienda.apk` al teléfono (por WhatsApp a usted mismo, por correo, Drive o cable).
2. Tóquelo en el teléfono. Android le pedirá permitir "instalar apps desconocidas" para esa aplicación (Archivos, WhatsApp, Chrome…): acepte.
3. Pulse **Instalar**. La app aparece con su logo como **Inspección Vivienda**.

Para actualizarla, instale el APK nuevo encima: los datos se conservan.

> Es un APK de prueba ("debug"), ideal para instalarlo usted directamente. Para publicarla en Google Play hace falta un APK firmado; se puede preparar más adelante.

## 4. Cuidar los datos

Todo queda guardado **solo en ese teléfono**. Si desinstala la app o cambia de teléfono, se pierde. Por eso, de vez en cuando:

- **Ajustes → Hacer respaldo** y envíese el archivo por correo o guárdelo en Drive.
- En el teléfono nuevo: **Ajustes → Restaurar respaldo** y elija ese archivo.

---

## Para quien programe

- `www/`: la app completa (HTML, CSS y JavaScript sin compilación). `js/datos.js` tiene las áreas e ítems de la plantilla, `js/pdf.js` arma los PDF con jsPDF y jspdf-autotable (incluidos en `www/lib/`), `js/app.js` maneja las pantallas y `js/db.js` el almacenamiento (IndexedDB).
- Empaquetado con Capacitor 8 (`capacitor.config.json`). Plugins: `@capacitor/filesystem` y `@capacitor/share` para compartir el PDF. Las fotos usan la cámara a través del campo de archivo con `capture`.
- Armar el proyecto Android en su computadora (Node 22, JDK 21 y Android Studio):

  ```
  cd inspeccion-app
  npm install
  npm run android      # crea android/, pone el ícono y copia la app
  npx cap open android # abre Android Studio: Build → Build APK(s)
  ```

  Después de cambiar algo en `www/`, ejecute `npm run sync`.
- `scripts/iconos.py` (necesita Pillow) genera el ícono y la pantalla de inicio desde `www/img/logo.png`.
- El flujo `.github/workflows/apk-inspeccion.yml` hace lo mismo en GitHub y publica el APK como artefacto.

Licencias de terceros: jsPDF y jspdf-autotable (MIT), en `www/lib/`.
