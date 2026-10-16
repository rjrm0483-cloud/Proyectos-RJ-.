"""Hace que el APK se firme siempre con firma/debug.keystore.

Se ejecuta después de `npx cap add android`. Con la misma llave, cada APK
nuevo se instala encima del anterior sin perder los datos.
"""
import os

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GRADLE = os.path.join(RAIZ, 'android', 'app', 'build.gradle')

BLOQUE = """    signingConfigs {
        debug {
            storeFile file('../../firma/debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }
"""

with open(GRADLE, encoding='utf-8') as f:
    texto = f.read()
if 'firma/debug.keystore' not in texto:
    if '\nandroid {\n' not in texto:
        raise SystemExit('No se encontró el bloque "android {" en ' + GRADLE)
    texto = texto.replace('\nandroid {\n', '\nandroid {\n' + BLOQUE, 1)
    with open(GRADLE, 'w', encoding='utf-8') as f:
        f.write(texto)
print('Firma fija configurada.')
