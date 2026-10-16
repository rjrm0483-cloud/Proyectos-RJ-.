"""Pone el logo como ícono y pantalla de inicio de la app Android.

Se ejecuta después de `npx cap add android`. Necesita Pillow
(pip install pillow). Usa www/img/logo.png (cuadrado con esquinas
redondeadas y transparentes; su original vectorial está en scripts/logo.svg).
"""
import glob
import os
import re

from PIL import Image, ImageDraw

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)
RES = os.path.join(RAIZ, 'android', 'app', 'src', 'main', 'res')
LOGO = os.path.join(RAIZ, 'www', 'img', 'logo.png')
FONDO = (15, 23, 42, 255)  # #0F172A, el azul noche del logo

TAMANOS = {'mdpi': 48, 'hdpi': 72, 'xhdpi': 96, 'xxhdpi': 144, 'xxxhdpi': 192}

logo = Image.open(LOGO).convert('RGBA')
# Logo sin esquinas transparentes, para ponerlo sobre su mismo fondo.
logo_lleno = Image.new('RGBA', logo.size, FONDO)
logo_lleno.alpha_composite(logo)


def logo_sobre_fondo(lado, escala):
    lienzo = Image.new('RGBA', (lado, lado), FONDO)
    t = int(lado * escala)
    lienzo.alpha_composite(logo_lleno.resize((t, t), Image.LANCZOS), ((lado - t) // 2, (lado - t) // 2))
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
    recorte_redondo(logo_sobre_fondo(lado, 0.92)).save(os.path.join(carpeta, 'ic_launcher_round.png'))
    # Ícono adaptable (Android 8+): 108 dp; el teléfono muestra solo el círculo
    # central de 72 dp, así que el logo va al 60 % para que no se corte el texto.
    frente = int(lado * 108 / 48)
    logo_sobre_fondo(frente, 0.60).save(os.path.join(carpeta, 'ic_launcher_foreground.png'))

# Color de fondo del ícono adaptable.
for xml in glob.glob(os.path.join(RES, 'values*', 'ic_launcher_background.xml')):
    with open(xml, encoding='utf-8') as f:
        texto = f.read()
    texto = re.sub(r'(<color name="ic_launcher_background">)[^<]*(</color>)', r'\g<1>#0F172A\g<2>', texto)
    with open(xml, 'w', encoding='utf-8') as f:
        f.write(texto)

# Pantalla de inicio: fondo azul noche con el logo al centro.
for splash in glob.glob(os.path.join(RES, 'drawable*', 'splash.png')):
    w, h = Image.open(splash).size
    lienzo = Image.new('RGBA', (w, h), FONDO)
    t = int(min(w, h) * 0.36)
    lienzo.alpha_composite(logo_lleno.resize((t, t), Image.LANCZOS), ((w - t) // 2, (h - t) // 2))
    lienzo.convert('RGB').save(splash)

print('Ícono y pantalla de inicio actualizados.')
