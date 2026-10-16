"""Pone en el APK la versión de package.json (por ejemplo 1.2.0 -> versionName "1.2.0", versionCode 10200).

Se ejecuta después de `npx cap add android`. Un versionCode mayor permite
instalar el APK nuevo encima del anterior.
"""
import json
import os
import re

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GRADLE = os.path.join(RAIZ, 'android', 'app', 'build.gradle')

with open(os.path.join(RAIZ, 'package.json'), encoding='utf-8') as f:
    version = json.load(f)['version']
mayor, menor, parche = (int(x) for x in version.split('.'))
codigo = mayor * 10000 + menor * 100 + parche

with open(GRADLE, encoding='utf-8') as f:
    texto = f.read()
texto, n1 = re.subn(r'versionCode \d+', 'versionCode %d' % codigo, texto)
texto, n2 = re.subn(r'versionName "[^"]*"', 'versionName "%s"' % version, texto)
if not (n1 and n2):
    raise SystemExit('No se encontró versionCode/versionName en ' + GRADLE)
with open(GRADLE, 'w', encoding='utf-8') as f:
    f.write(texto)
print('Versión %s (código %d).' % (version, codigo))
