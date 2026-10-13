// Recuadro para firmar con el dedo. Siempre dibuja en negro sobre blanco,
// como en papel, sin importar el modo Día o Noche.

function PadFirma(canvas, alCambiar) {
  var ctx = canvas.getContext('2d');
  var dibujando = false;
  var ultimo = null;
  var vacio = true;
  var escala = 1;

  function ajustar() {
    var r = canvas.getBoundingClientRect();
    if (!r.width) return;
    escala = window.devicePixelRatio || 1;
    var previa = vacio ? null : canvas.toDataURL('image/png');
    canvas.width = Math.round(r.width * escala);
    canvas.height = Math.round(r.height * escala);
    ctx.setTransform(escala, 0, 0, escala, 0, 0);
    limpiarLienzo();
    if (previa) cargar(previa);
  }

  function limpiarLienzo() {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  function punto(e) {
    var r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top, p: e.pressure || 0.5 };
  }

  canvas.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    canvas.setPointerCapture(e.pointerId);
    dibujando = true;
    ultimo = punto(e);
    ctx.beginPath();
    ctx.fillStyle = '#0B1520';
    ctx.arc(ultimo.x, ultimo.y, 1.3, 0, Math.PI * 2);
    ctx.fill();
  });
  canvas.addEventListener('pointermove', function (e) {
    if (!dibujando) return;
    e.preventDefault();
    var p = punto(e);
    ctx.strokeStyle = '#0B1520';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(ultimo.x, ultimo.y);
    ctx.quadraticCurveTo(ultimo.x, ultimo.y, (ultimo.x + p.x) / 2, (ultimo.y + p.y) / 2);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    ultimo = p;
    vacio = false;
  });
  function terminar() {
    if (!dibujando) return;
    dibujando = false;
    vacio = false;
    if (alCambiar) alCambiar(exportar());
  }
  canvas.addEventListener('pointerup', terminar);
  canvas.addEventListener('pointercancel', terminar);

  function cargar(dataUrl) {
    var img = new Image();
    img.onload = function () {
      var r = canvas.getBoundingClientRect();
      var k = Math.min(r.width / img.width, r.height / img.height);
      var w = img.width * k, h = img.height * k;
      ctx.drawImage(img, (r.width - w) / 2, (r.height - h) / 2, w, h);
    };
    img.src = dataUrl;
    vacio = false;
  }

  // Exporta la firma recortada al trazo, con fondo transparente,
  // para que se vea limpia sobre la línea del PDF.
  function exportar() {
    if (vacio) return null;
    var w = canvas.width, h = canvas.height;
    var datos = ctx.getImageData(0, 0, w, h).data;
    var x0 = w, y0 = h, x1 = 0, y1 = 0;
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        var i = (y * w + x) * 4;
        if (datos[i] < 200) {
          if (x < x0) x0 = x; if (x > x1) x1 = x;
          if (y < y0) y0 = y; if (y > y1) y1 = y;
        }
      }
    }
    if (x1 <= x0 || y1 <= y0) return null;
    var m = Math.round(6 * escala);
    x0 = Math.max(0, x0 - m); y0 = Math.max(0, y0 - m);
    x1 = Math.min(w, x1 + m); y1 = Math.min(h, y1 + m);
    var out = document.createElement('canvas');
    out.width = x1 - x0; out.height = y1 - y0;
    var o = out.getContext('2d');
    var recorte = ctx.getImageData(x0, y0, out.width, out.height);
    var d = recorte.data;
    for (var j = 0; j < d.length; j += 4) {
      // Blanco → transparente; trazo → tinta azul oscuro.
      var claridad = (d[j] + d[j + 1] + d[j + 2]) / 3;
      d[j + 3] = Math.max(0, Math.min(255, Math.round((255 - claridad) * 1.4)));
      d[j] = 11; d[j + 1] = 21; d[j + 2] = 32;
    }
    o.putImageData(recorte, 0, 0);
    return out.toDataURL('image/png');
  }

  ajustar();
  window.addEventListener('resize', ajustar);

  return {
    limpiar: function () {
      vacio = true;
      limpiarLienzo();
      if (alCambiar) alCambiar(null);
    },
    cargar: function (dataUrl) {
      limpiarLienzo();
      if (dataUrl) cargar(dataUrl); else vacio = true;
    },
    exportar: exportar,
    destruir: function () { window.removeEventListener('resize', ajustar); }
  };
}
