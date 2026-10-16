# Llave de firma de prueba

`debug.keystore` es la llave con la que GitHub firma el APK de prueba. Debe ser
siempre la misma: si cambia, Android no deja instalar la actualización encima
de la app ya instalada.

Es una llave de prueba (contraseña `android`, alias `androiddebugkey`), igual a
la que Android Studio crea en cada computadora. No sirve para Google Play: para
publicar allí hace falta una llave propia guardada en privado.
