"""Pone el logo como ícono y pantalla de inicio de la app Android.

Se ejecuta después de `npx cap add android`. Necesita Pillow
(pip install pillow). Usa www/img/logo.png.
"""
import glob
import os
import re

from PIL import Image, ImageDraw

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)
RES = os.path.join(RAIZ, 'android', 'app', 'src', 'main', 'res')
LOGO = os.path.join(RAIZ, 'www', 'img', 'logo.png')
AZUL = (31, 78, 121, 255)

TAMANOS = {'mdpi': 48, 'hdpi': 72, 'xhdpi': 96, 'xxhdpi': 144, 'xxxhdpi': 192}

logo = Image.open(LOGO).convert('RGBA')
# El logo con las esquinas transparentes rellenas de azul, para que no quede
# un borde claro al ponerlo sobre fondo azul.
logo_lleno = Image.new('RGBA', logo.size, AZUL)
logo_lleno.paste(logo, (0, 0), logo.getchannel('A').point(lambda a: 255 if a == 255 else 0))


def logo_sobre_azul(lado, escala):
    """Fondo azul con el logo centrado (las esquinas del logo quedan azules)."""
    lienzo = Image.new('RGBA', (lado, lado), AZUL)
    t = int(lado * escala)
    l = logo_lleno.resize((t, t), Image.LANCZOS)
    lienzo.alpha_composite(l, ((lado - t) // 2, (lado - t) // 2))
    return lienzo


def recorte_redondo(img):
    mascara = Image.new('L', img.size, 0)
    ImageDraw.Draw(mascara).ellipse((0, 0, img.size[0] - 1, img.size[1] - 1), fill=255)
    out = Image.new('RGBA', img.size, (0, 0, 0, 0))
    out.paste(img, (0, 0), mascara)
    return out


if not os.path.isdir(RES):
    raise SystemExit('No existe la carpeta android. Ejecute antes: npx cap add android')

for densidad, lado in TAMANOS.items():
    carpeta = os.path.join(RES, 'mipmap-' + densidad)
    os.makedirs(carpeta, exist_ok=True)
    logo.resize((lado, lado), Image.LANCZOS).save(os.path.join(carpeta, 'ic_launcher.png'))
    recorte_redondo(logo_sobre_azul(lado, 0.92)).save(os.path.join(carpeta, 'ic_launcher_round.png'))
    # Ícono adaptable (Android 8+): 108 dp, con el dibujo dentro de la zona segura.
    frente = int(lado * 108 / 48)
    logo_sobre_azul(frente, 0.84).save(os.path.join(carpeta, 'ic_launcher_foreground.png'))

# Color de fondo del ícono adaptable.
for xml in glob.glob(os.path.join(RES, 'values*', 'ic_launcher_background.xml')):
    with open(xml, encoding='utf-8') as f:
        texto = f.read()
    texto = re.sub(r'(<color name="ic_launcher_background">)[^<]*(</color>)', r'\g<1>#1F4E79\g<2>', texto)
    with open(xml, 'w', encoding='utf-8') as f:
        f.write(texto)

# Pantalla de inicio: azul con el logo al centro.
for splash in glob.glob(os.path.join(RES, 'drawable*', 'splash.png')):
    w, h = Image.open(splash).size
    lienzo = Image.new('RGBA', (w, h), AZUL)
    t = int(min(w, h) * 0.32)
    lienzo.alpha_composite(logo_lleno.resize((t, t), Image.LANCZOS), ((w - t) // 2, (h - t) // 2))
    lienzo.convert('RGB').save(splash)

print('Ícono y pantalla de inicio actualizados.')
