// App de inspección de vivienda nueva — lógica de pantallas.
'use strict';

var vista = document.getElementById('vista');
var AJ = null;          // ajustes del inspector
var INSP = null;        // inspección abierta
var FOTOS = [];         // fotos de la inspección abierta
var abiertas = {};      // áreas desplegadas en la lista
var pads = [];          // recuadros de firma activos

var PASOS = [
  ['datos', '1. Datos'],
  ['lista', '2. Lista'],
  ['resumen', '3. Resumen'],
  ['conclusion', '4. Conclusión'],
  ['firmas', '5. Firmas'],
  ['pdf', '6. PDF']
];

// ---------------- Utilidades ----------------
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
function horaAhora() { var d = new Date(); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); }
function fechaCorta(iso) { return PDF.fecha(iso); }
function logoActual() { return (AJ && AJ.logo) || LOGO_PREDETERMINADO; }

var temporizadorAviso;
function aviso(msg) {
  var a = document.getElementById('aviso');
  a.textContent = msg;
  a.classList.add('ver');
  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(function () { a.classList.remove('ver'); }, 2600);
}

var temporizadorGuardar;
function guardarPronto() {
  clearTimeout(temporizadorGuardar);
  temporizadorGuardar = setTimeout(guardarYa, 350);
}
function guardarYa() {
  clearTimeout(temporizadorGuardar);
  if (INSP) return DB.guardar(INSP).catch(function (e) { aviso('No se pudo guardar: ' + e.message); });
  return Promise.resolve();
}
document.addEventListener('visibilitychange', function () { if (document.hidden) guardarYa(); });
window.addEventListener('pagehide', guardarYa);

function ponerTitulo(txt) { document.getElementById('barra-titulo').textContent = txt; }

// Lee una ruta tipo "datos.cliente" dentro de la inspección.
function setRuta(obj, ruta, valor) {
  var p = ruta.split('.');
  for (var i = 0; i < p.length - 1; i++) { obj = obj[p[i]] = obj[p[i]] || {}; }
  obj[p[p.length - 1]] = valor;
}
function getRuta(obj, ruta) {
  return ruta.split('.').reduce(function (o, k) { return o == null ? undefined : o[k]; }, obj);
}

// ---------------- Tema Día / Noche ----------------
var mediaOscuro = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : null;
function temaGuardado() { try { return localStorage.getItem('tema'); } catch (e) { return null; } }
function aplicarTema(tema, animar) {
  var html = document.documentElement;
  if (animar) {
    html.classList.add('cambiando-tema');
    setTimeout(function () { html.classList.remove('cambiando-tema'); }, 450);
  }
  html.setAttribute('data-theme', tema);
  var meta = document.querySelector('meta[name=theme-color]');
  if (meta) meta.setAttribute('content', tema === 'noche' ? '#0E1620' : '#1F4E79');
  var b = document.getElementById('btn-tema');
  b.setAttribute('aria-label', tema === 'noche' ? 'Cambiar a modo día' : 'Cambiar a modo noche');
  var sb = window.Capacitor && Capacitor.Plugins && Capacitor.Plugins.StatusBar;
  if (sb) { try { sb.setBackgroundColor({ color: tema === 'noche' ? '#0E1620' : '#1F4E79' }); } catch (e) {} }
}
function temaDelTelefono() { return mediaOscuro && mediaOscuro.matches ? 'noche' : 'dia'; }
function temaEfectivo() { var t = temaGuardado(); return t === 'dia' || t === 'noche' ? t : temaDelTelefono(); }
document.getElementById('btn-tema').addEventListener('click', function () {
  var nuevo = document.documentElement.getAttribute('data-theme') === 'noche' ? 'dia' : 'noche';
  try { localStorage.setItem('tema', nuevo); } catch (e) {}
  aplicarTema(nuevo, true);
  if (location.hash === '#/ajustes') render();
});
if (mediaOscuro) {
  var alCambiarTemaTel = function () { if (!temaGuardado()) aplicarTema(temaDelTelefono(), true); };
  if (mediaOscuro.addEventListener) mediaOscuro.addEventListener('change', alCambiarTemaTel);
  else if (mediaOscuro.addListener) mediaOscuro.addListener(alCambiarTemaTel);
}

document.getElementById('btn-inicio').addEventListener('click', function () { ir('#/'); });
document.getElementById('btn-ajustes').addEventListener('click', function () { ir('#/ajustes'); });

// ---------------- Navegación ----------------
function ir(hash) {
  if (location.hash === hash) render(); else location.hash = hash;
}
window.addEventListener('hashchange', function () { guardarYa().then(render); });

function limpiarPads() { pads.forEach(function (p) { p.destruir(); }); pads = []; }

function render() {
  limpiarPads();
  var h = location.hash.replace(/^#\/?/, '');
  var p = h.split('/');
  var tarea;
  if (p[0] === 'i' && p[1]) tarea = abrirInspeccion(p[1]).then(function () { pantallaInspeccion(p[2] || 'datos'); });
  else if (p[0] === 'r' && p[1]) tarea = abrirInspeccion(p[1]).then(pantallaRevisita);
  else if (p[0] === 'ajustes') { INSP = null; tarea = Promise.resolve(pantallaAjustes()); }
  else { INSP = null; tarea = pantallaInicio(); }
  return tarea.then(function () { document.getElementById('logo-barra').src = logoActual(); })
    .catch(function (e) {
      console.error(e);
      vista.innerHTML = '<div class="tarjeta"><h2>Algo salió mal</h2><p>' + esc(e.message) + '</p><a class="btn" href="#/">Volver al inicio</a></div>';
    });
}

function abrirInspeccion(id) {
  if (INSP && INSP.id === id) return Promise.resolve();
  return DB.obtener(id).then(function (i) {
    if (!i) throw new Error('No se encontró la inspección.');
    INSP = i;
    INSP.items = INSP.items || {};
    INSP.extras = INSP.extras || [];
    INSP.firmas = INSP.firmas || {};
    INSP.revisitas = INSP.revisitas || [];
    abiertas = {};
    return DB.fotosDe(id);
  }).then(function (f) { if (f) FOTOS = f; });
}

// ---------------- Inicio ----------------
function htmlMembrete() {
  var contacto = [AJ.telefono ? 'Tel./WhatsApp: ' + AJ.telefono : '', AJ.correo].filter(Boolean).join(' · ');
  return '<div class="membrete"><img src="' + logoActual() + '" alt="Logo">' +
    '<div><div class="nombre">' + esc(AJ.nombre) + '</div><div class="lema">' + esc(AJ.lema) + '</div>' +
    '<div class="contacto">' + esc(contacto) + '</div></div></div>';
}

function pantallaInicio() {
  ponerTitulo('Inspecciones');
  return DB.listar().then(function (lista) {
    var h = htmlMembrete();
    h += '<button class="btn btn-primario btn-ancho btn-grande" data-a="nueva" style="margin-top:14px">＋ Nueva inspección</button>';
    h += '<h2>Inspecciones guardadas</h2>';
    if (!lista.length) h += '<div class="tarjeta vacio">Todavía no hay inspecciones. Toque <b>Nueva inspección</b> para empezar.</div>';
    lista.forEach(function (i) {
      var pend = pendientes(i);
      var tot = totales(pend);
      var revs = (i.revisitas || []).length;
      h += '<div class="tarjeta"><div class="insp-item"><div class="info">' +
        '<div><span class="num-informe">' + esc(i.numero) + '</span> · ' + esc(fechaCorta(i.datos.fecha)) + '</div>' +
        '<div class="cliente">' + esc(i.datos.cliente || 'Sin nombre de cliente') + '</div>' +
        '<div class="meta">' + esc(i.datos.direccion || i.datos.proyecto || '') + '</div>' +
        '<div class="meta" style="margin-top:6px">' +
        (pend.length ? '<span class="chip chip-A">' + tot.A + ' Alta</span> <span class="chip chip-M">' + tot.M + ' Media</span> <span class="chip chip-B">' + tot.B + ' Baja</span>'
          : '<span class="chip chip-C">Sin pendientes</span>') +
        (revs ? ' <span class="estado-badge" style="color:var(--accent-text)">' + revs + ' revisita' + (revs > 1 ? 's' : '') + '</span>' : '') +
        '</div></div></div>' +
        '<div class="insp-acciones">' +
        '<a class="btn btn-chico" href="#/i/' + i.id + '/datos">Abrir</a>' +
        '<a class="btn btn-chico" href="#/r/' + i.id + '">Revisita</a>' +
        '<button class="btn btn-chico btn-peligro" data-a="borrar-insp" data-id="' + i.id + '" style="grid-column:span 2">Eliminar</button>' +
        '</div></div>';
    });
    vista.innerHTML = h;
  });
}

function siguienteNumero() {
  var anio = new Date().getFullYear();
  return Promise.all([DB.listar(), DB.leerAjuste('ultimo-' + anio)]).then(function (r) {
    var max = r[1] || 0;
    r[0].forEach(function (i) {
      var m = /^INS-(\d{4})-(\d+)$/.exec(i.numero || '');
      if (m && +m[1] === anio) max = Math.max(max, +m[2]);
    });
    var n = max + 1;
    return DB.guardarAjuste('ultimo-' + anio, n).then(function () {
      return 'INS-' + anio + '-' + String(n).padStart(3, '0');
    });
  });
}

function nuevaInspeccion() {
  return siguienteNumero().then(function (num) {
    var i = {
      id: uid(), numero: num, creado: Date.now(),
      datos: { fecha: hoyISO(), fechaEmision: hoyISO(), horaInicio: horaAhora(), horaFin: '', tipo: '', clima: '', planos: '', uso: '' },
      items: {}, extras: [], conclusion: '', obsGenerales: '', firmas: {}, revisitas: []
    };
    return DB.guardar(i).then(function () {
      INSP = i; FOTOS = []; abiertas = {};
      ir('#/i/' + i.id + '/datos');
    });
  });
}

// ---------------- Pantalla de inspección ----------------
function cabeceraInspeccion(paso) {
  var h = '<div class="sub" style="margin-bottom:4px"><span class="num-informe">' + esc(INSP.numero) + '</span> · ' + esc(INSP.datos.cliente || 'Cliente sin nombre') + '</div>';
  h += '<nav class="pasos" aria-label="Pasos del informe">';
  PASOS.forEach(function (p) {
    h += '<button class="paso" data-a="paso" data-paso="' + p[0] + '"' + (p[0] === paso ? ' aria-current="step"' : '') + '>' + p[1] + '</button>';
  });
  return h + '</nav>';
}

function navInferior(paso) {
  var i = PASOS.findIndex(function (p) { return p[0] === paso; });
  var ant = PASOS[i - 1], sig = PASOS[i + 1];
  return '<div class="nav-inferior">' +
    (ant ? '<button class="btn" data-a="paso" data-paso="' + ant[0] + '">← Anterior</button>' : '<a class="btn" href="#/">← Inicio</a>') +
    (sig ? '<button class="btn btn-primario" data-a="paso" data-paso="' + sig[0] + '">Siguiente →</button>' : '<a class="btn btn-primario" href="#/">Terminar ✓</a>') +
    '</div>';
}

function pantallaInspeccion(paso) {
  ponerTitulo(INSP.numero);
  var cuerpo = { datos: vistaDatos, lista: vistaLista, resumen: vistaResumen, conclusion: vistaConclusion, firmas: vistaFirmas, pdf: vistaPdf }[paso] || vistaDatos;
  vista.innerHTML = cabeceraInspeccion(paso) + cuerpo() + navInferior(paso);
  var activo = vista.querySelector('.paso[aria-current]');
  if (activo && activo.scrollIntoView) activo.scrollIntoView({ inline: 'center', block: 'nearest' });
  if (paso === 'firmas') montarFirmasInspeccion();
  window.scrollTo(0, 0);
}

// ----- 1. Datos generales -----
function campoTexto(ruta, etiqueta, tipo, extra) {
  var v = getRuta(INSP, ruta) || '';
  return '<div class="campo"><label for="c-' + ruta + '">' + etiqueta + '</label>' +
    '<input id="c-' + ruta + '" type="' + (tipo || 'text') + '" data-campo="' + ruta + '" value="' + esc(v) + '" ' + (extra || '') + '></div>';
}
function campoOpciones(ruta, etiqueta, opciones) {
  var v = getRuta(INSP, ruta);
  return '<div class="campo"><span class="etiqueta">' + etiqueta + '</span><div class="opciones" role="group" aria-label="' + esc(etiqueta) + '">' +
    opciones.map(function (o) {
      return '<button class="opcion" data-a="opcion" data-campo="' + ruta + '" data-valor="' + esc(o[0]) + '" aria-pressed="' + (v === o[0]) + '">' + esc(o[1]) + '</button>';
    }).join('') + '</div></div>';
}

function vistaDatos() {
  var d = INSP.datos;
  var h = '<h1>Datos generales</h1><div class="tarjeta">';
  h += '<div class="dos-col">' + campoTexto('numero', 'Informe N°') + campoTexto('datos.fechaEmision', 'Fecha de emisión', 'date') + '</div>';
  h += campoTexto('datos.cliente', 'Cliente', 'text', 'autocomplete="off"');
  h += campoTexto('datos.telefono', 'Teléfono / correo', 'tel');
  h += campoTexto('datos.direccion', 'Dirección del inmueble');
  h += campoTexto('datos.proyecto', 'Proyecto / residencial');
  h += campoTexto('datos.constructor', 'Constructor / desarrollador');
  h += campoOpciones('datos.tipo', 'Tipo de vivienda', [['1', '1 planta'], ['2', '2 plantas'], ['3', '3 plantas']]);
  h += '<div class="dos-col">' + campoTexto('datos.area', 'Área construida (m²)', 'number', 'inputmode="decimal" min="0" step="0.01"') +
    campoTexto('datos.fecha', 'Fecha de inspección', 'date') + '</div>';
  h += '<div class="dos-col">' + campoTexto('datos.horaInicio', 'Hora de inicio', 'time') +
    '<div class="campo"><label for="c-datos.horaFin">Hora de fin</label><div style="display:flex;gap:8px">' +
    '<input id="c-datos.horaFin" class="entrada" type="time" data-campo="datos.horaFin" value="' + esc(d.horaFin) + '">' +
    '<button class="btn btn-chico" data-a="hora-fin" style="min-height:52px">Ahora</button></div></div></div>';
  h += campoOpciones('datos.clima', 'Condición del clima', [['Seco', 'Seco'], ['Lluvia reciente', 'Lluvia reciente']]);
  h += campoOpciones('datos.planos', 'Planos disponibles', [['Sí', 'Sí'], ['No', 'No']]);
  h += '<div class="campo"><label for="c-datos.presentes">Presentes en la visita</label>' +
    '<textarea id="c-datos.presentes" data-campo="datos.presentes" placeholder="Nombres y cargos">' + esc(d.presentes) + '</textarea></div>';
  h += campoOpciones('datos.uso', 'Uso del informe', [['respaldo', 'Respaldo del cliente'], ['constructor', 'Entrega al constructor'], ['banco', 'Banco'], ['otro', 'Otro']]);
  h += '<div id="uso-otro" class="' + (d.uso === 'otro' ? '' : 'oculto') + '">' + campoTexto('datos.usoOtro', '¿Cuál otro uso?') + '</div>';
  return h + '</div>';
}

// ----- 2. Lista de verificación -----
function contarArea(a) {
  var marcados = 0, o = 0;
  a.items.forEach(function (it) {
    var e = INSP.items[it.ref];
    if (e && e.estado) { marcados++; if (e.estado === 'O') o++; }
  });
  return { marcados: marcados, o: o, total: a.items.length };
}

function textoProgreso(c) {
  return c.marcados + '/' + c.total + (c.o ? ' · ' + c.o + ' O' : '') + (c.total && c.marcados === c.total ? ' ✓' : '');
}

function vistaLista() {
  var areas = itemsPorArea(INSP);
  var total = 0, hechos = 0;
  areas.forEach(function (a) { var c = contarArea(a); total += c.total; hechos += c.marcados; });
  if (!Object.keys(abiertas).length) {
    var primera = areas.find(function (a) { var c = contarArea(a); return c.marcados < c.total; }) || areas[0];
    abiertas[primera.letra] = true;
  }
  var h = '<h1>Lista de verificación</h1>';
  h += '<p class="sub" id="progreso-total">' + hechos + ' de ' + total + ' elementos revisados. Toque un área para abrirla.</p>';
  areas.forEach(function (a) { h += htmlArea(a); });
  h += '<input type="file" id="in-camara" accept="image/*" capture="environment" class="oculto">';
  h += '<input type="file" id="in-galeria" accept="image/*" multiple class="oculto">';
  return h;
}

function htmlArea(a) {
  var c = contarArea(a);
  var abierta = !!abiertas[a.letra];
  var h = '<section class="tarjeta area" id="area-' + a.letra + '" open-area="' + (abierta ? 1 : 0) + '">' +
    '<button class="area-cab" data-a="area" data-letra="' + a.letra + '" aria-expanded="' + abierta + '">' +
    '<span class="area-letra">' + a.letra + '</span><span class="area-nombre">' + esc(a.nombre) +
    '<br><span class="area-progreso">' + textoProgreso(c) + '</span></span><span class="flecha" aria-hidden="true">▾</span></button>';
  if (abierta) {
    h += '<div class="area-cuerpo">';
    a.items.forEach(function (it) { h += htmlItem(it); });
    if (a.letra === 'K') {
      if (!a.items.length) h += '<p class="sub">Agregue aquí los elementos que no están en la lista.</p>';
      h += '<div class="campo"><label for="nuevo-k">Nuevo elemento</label><div style="display:flex;gap:8px">' +
        '<input id="nuevo-k" class="entrada" type="text" placeholder="Ej.: Pila de lavado">' +
        '<button class="btn btn-primario" data-a="agregar-k" style="min-height:52px">Agregar</button></div></div>';
    }
    if (a.items.length && c.marcados < c.total) {
      h += '<button class="btn btn-ancho" data-a="todo-c" data-letra="' + a.letra + '" style="margin-top:10px">Marcar los no revisados como C</button>';
    }
    h += '</div>';
  }
  return h + '</section>';
}

function htmlItem(it) {
  var e = INSP.items[it.ref] || {};
  var h = '<div class="item" id="item-' + it.ref.replace('.', '-') + '">' +
    '<div class="item-texto"><span class="item-ref">' + it.ref + '</span>' + esc(it.texto) + '</div>' +
    '<div class="estados" role="group" aria-label="Estado de ' + esc(it.texto) + '">' +
    '<button class="est est-C" data-a="estado" data-ref="' + it.ref + '" data-valor="C" aria-pressed="' + (e.estado === 'C') + '">C<small>Conforme</small></button>' +
    '<button class="est est-O" data-a="estado" data-ref="' + it.ref + '" data-valor="O" aria-pressed="' + (e.estado === 'O') + '">O<small>Observado</small></button>' +
    '<button class="est est-NA" data-a="estado" data-ref="' + it.ref + '" data-valor="NA" aria-pressed="' + (e.estado === 'NA') + '">N/A<small>No aplica</small></button>' +
    '</div>';
  if (e.estado === 'O') {
    h += '<div class="detalle-o"><div class="etiqueta" style="font-weight:700;margin-bottom:6px">Prioridad</div><div class="prioridades">';
    ['A', 'M', 'B'].forEach(function (p) {
      h += '<button class="pri pri-' + p + '" data-a="prioridad" data-ref="' + it.ref + '" data-valor="' + p + '" aria-pressed="' + (e.prioridad === p) + '">' + PRIORIDADES[p].nombre.toUpperCase() + '</button>';
    });
    h += '</div>';
    if (!e.prioridad) h += '<p class="sub" style="color:var(--o);font-weight:700;margin:6px 0 0">Elija la prioridad.</p>';
    h += '<div class="campo"><label for="obs-' + it.ref + '">Observación / ubicación</label>' +
      '<textarea id="obs-' + it.ref + '" data-item="' + it.ref + '" data-prop="obs" placeholder="Describa el defecto y dónde está (ej.: dormitorio 2, pared norte)">' + esc(e.obs) + '</textarea></div>';
    h += '<div class="fila-btns"><button class="btn btn-primario" data-a="foto-camara" data-ref="' + it.ref + '">📷 Tomar foto</button>' +
      '<button class="btn" data-a="foto-galeria" data-ref="' + it.ref + '">🖼 Galería</button></div>';
    h += htmlFotos(it.ref);
    h += '</div>';
  }
  if (it.propio) h += '<button class="btn btn-chico btn-peligro" data-a="quitar-k" data-ref="' + it.ref + '" style="margin-top:8px">Quitar este elemento</button>';
  return h + '</div>';
}

function htmlFotos(ref) {
  var fs = FOTOS.filter(function (f) { return f.ref === ref; });
  if (!fs.length) return '';
  return '<div class="fotos">' + fs.map(function (f, i) {
    return '<div class="foto"><img src="' + (f.mini || f.dataUrl) + '" alt="Foto ' + (i + 1) + '" data-a="nota-foto" data-id="' + f.id + '">' +
      '<button class="quitar" data-a="quitar-foto" data-id="' + f.id + '" aria-label="Quitar foto">×</button>' +
      (f.nota ? '<span class="n">✎ nota</span>' : '') + '</div>';
  }).join('') + '</div><p class="sub" style="margin:6px 0 0;font-size:13.5px">Toque una foto para agregarle una descripción propia.</p>';
}

function refrescarItem(ref) {
  var it = todosLosItems(INSP).find(function (x) { return x.ref === ref; });
  var nodo = document.getElementById('item-' + ref.replace('.', '-'));
  if (it && nodo) nodo.outerHTML = htmlItem(it);
  refrescarCabeceraArea(ref.split('.')[0]);
}
function refrescarCabeceraArea(letra) {
  var a = itemsPorArea(INSP).find(function (x) { return x.letra === letra; });
  var sec = document.getElementById('area-' + letra);
  if (!a || !sec) return;
  sec.querySelector('.area-progreso').textContent = textoProgreso(contarArea(a));
  var total = 0, hechos = 0;
  itemsPorArea(INSP).forEach(function (x) { var c = contarArea(x); total += c.total; hechos += c.marcados; });
  var p = document.getElementById('progreso-total');
  if (p) p.textContent = hechos + ' de ' + total + ' elementos revisados. Toque un área para abrirla.';
}
function refrescarArea(letra) {
  var a = itemsPorArea(INSP).find(function (x) { return x.letra === letra; });
  var sec = document.getElementById('area-' + letra);
  if (a && sec) sec.outerHTML = htmlArea(a);
}

// ----- Fotos -----
function cargarImagen(file) {
  return new Promise(function (ok, mal) {
    var url = URL.createObjectURL(file);
    var img = new Image();
    img.onload = function () { ok(img); setTimeout(function () { URL.revokeObjectURL(url); }, 1000); };
    img.onerror = function () { mal(new Error('No se pudo leer la imagen.')); };
    img.src = url;
  });
}
function redimensionar(img, max, tipo, calidad, fondo) {
  var k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  var c = document.createElement('canvas');
  c.width = Math.round(img.naturalWidth * k);
  c.height = Math.round(img.naturalHeight * k);
  var ctx = c.getContext('2d');
  if (fondo) { ctx.fillStyle = fondo; ctx.fillRect(0, 0, c.width, c.height); }
  ctx.drawImage(img, 0, 0, c.width, c.height);
  return { dataUrl: c.toDataURL(tipo, calidad), w: c.width, h: c.height };
}
function procesarFoto(file, ref) {
  return cargarImagen(file).then(function (img) {
    var grande = redimensionar(img, 1600, 'image/jpeg', 0.75, '#ffffff');
    var mini = redimensionar(img, 320, 'image/jpeg', 0.7, '#ffffff');
    var foto = { id: uid(), inspId: INSP.id, ref: ref, dataUrl: grande.dataUrl, mini: mini.dataUrl, w: grande.w, h: grande.h, nota: '', ts: Date.now() };
    return DB.guardarFoto(foto).then(function () { FOTOS.push(foto); return foto; });
  });
}

var refFotoPendiente = null;
var alTerminarFotos = null;
function pedirFoto(ref, camara, alTerminar) {
  refFotoPendiente = ref;
  alTerminarFotos = alTerminar;
  var input = document.getElementById(camara ? 'in-camara' : 'in-galeria');
  input.value = '';
  input.click();
}
vista.addEventListener('change', function (e) {
  var el = e.target;
  if ((el.id === 'in-camara' || el.id === 'in-galeria') && el.files.length && refFotoPendiente) {
    var ref = refFotoPendiente;
    var archivos = Array.prototype.slice.call(el.files);
    aviso('Guardando foto…');
    archivos.reduce(function (p, f) { return p.then(function () { return procesarFoto(f, ref); }); }, Promise.resolve())
      .then(function () {
        aviso(archivos.length > 1 ? archivos.length + ' fotos guardadas' : 'Foto guardada');
        if (alTerminarFotos) alTerminarFotos(ref); else refrescarItem(ref);
      })
      .catch(function (err) { aviso(err.message); });
    return;
  }
  if (el.id === 'in-logo' && el.files.length) {
    cargarImagen(el.files[0]).then(function (img) {
      AJ.logo = redimensionar(img, 512, 'image/png').dataUrl;
      return guardarAjustes();
    }).then(function () { aviso('Logo actualizado'); render(); }).catch(function (err) { aviso(err.message); });
  }
  if (el.id === 'in-respaldo' && el.files.length) importarRespaldo(el.files[0]);
});

// ----- 3. Resumen -----
function vistaResumen() {
  var pend = pendientes(INSP);
  var tot = totales(pend);
  var sinMarcar = todosLosItems(INSP).filter(function (it) { return !(INSP.items[it.ref] || {}).estado; }).length;
  var h = '<h1>Resumen de pendientes</h1>';
  h += '<div class="totales">' +
    '<div class="total t-A"><b>' + tot.A + '</b><span>Alta</span></div>' +
    '<div class="total t-M"><b>' + tot.M + '</b><span>Media</span></div>' +
    '<div class="total t-B"><b>' + tot.B + '</b><span>Baja</span></div>' +
    '<div class="total t-T"><b>' + tot.total + '</b><span>Total</span></div></div>';
  if (sinMarcar) h += '<div class="alerta">Hay ' + sinMarcar + ' elemento' + (sinMarcar > 1 ? 's' : '') + ' sin marcar en la lista.</div>';
  if (!pend.length) return h + '<div class="ok-caja">No hay ítems marcados como "O". No hay pendientes.</div>';
  h += '<div class="tarjeta"><div class="campo"><label for="resp-todos">Mismo responsable para todos</label><div style="display:flex;gap:8px">' +
    '<input id="resp-todos" class="entrada" type="text" value="' + esc(INSP.datos.constructor || '') + '" placeholder="Ej.: Constructor">' +
    '<button class="btn" data-a="resp-todos" style="min-height:52px">Aplicar</button></div></div>' +
    '<div class="campo"><label for="fecha-todos">Misma fecha de compromiso para todos</label><div style="display:flex;gap:8px">' +
    '<input id="fecha-todos" class="entrada" type="date">' +
    '<button class="btn" data-a="fecha-todos" style="min-height:52px">Aplicar</button></div></div></div>';
  pend.forEach(function (p, i) {
    h += '<div class="tarjeta pend p-' + p.prioridad + '">' +
      '<div class="pend-cab"><b>' + (i + 1) + '.</b> <span class="item-ref">' + p.ref + '</span>' +
      '<span class="chip chip-' + p.prioridad + '">' + PRIORIDADES[p.prioridad].nombre + (p.sinPrioridad ? ' (sin elegir)' : '') + '</span></div>' +
      '<div style="font-weight:700">' + esc(p.texto) + '</div>' +
      (p.obs ? '<div class="sub">' + esc(p.obs) + '</div>' : '<div class="sub" style="color:var(--o)">Sin observación escrita.</div>') +
      '<div class="dos-col">' +
      '<div class="campo"><label for="r-' + p.ref + '">Responsable</label><input id="r-' + p.ref + '" type="text" data-item="' + p.ref + '" data-prop="responsable" value="' + esc(p.responsable) + '"></div>' +
      '<div class="campo"><label for="f-' + p.ref + '">Fecha de compromiso</label><input id="f-' + p.ref + '" type="date" data-item="' + p.ref + '" data-prop="compromiso" value="' + esc(p.compromiso) + '"></div>' +
      '</div></div>';
  });
  return h;
}

// ----- 4. Conclusión -----
function conclusionSugerida() {
  var t = totales(pendientes(INSP));
  return t.A > 0 ? 'no' : (t.total > 0 ? 'pendientes' : 'apta');
}
function vistaConclusion() {
  var sug = conclusionSugerida();
  if (!INSP.conclusion) { INSP.conclusion = sug; guardarPronto(); }
  var h = '<h1>Conclusión y recomendación</h1>';
  h += '<p class="sub">La app sugiere una según los pendientes. Puede elegir otra.</p>';
  ['apta', 'pendientes', 'no'].forEach(function (k) {
    var c = CONCLUSIONES[k];
    h += '<button class="concl" data-a="conclusion" data-valor="' + k + '" aria-pressed="' + (INSP.conclusion === k) + '">' +
      '<b>' + (INSP.conclusion === k ? '● ' : '○ ') + c.titulo + (k === sug ? '<span class="sugerido">SUGERIDA</span>' : '') + '</b>' +
      '<span>' + esc(c.texto.split(': ')[1] || '') + '</span></button>';
  });
  if (INSP.conclusion !== sug) {
    h += '<div class="alerta">Según los pendientes, la sugerida es "' + CONCLUSIONES[sug].titulo + '".</div>';
  }
  h += '<div class="campo"><label for="obs-gen">Observaciones generales</label>' +
    '<textarea id="obs-gen" data-campo="obsGenerales" style="min-height:140px">' + esc(INSP.obsGenerales) + '</textarea></div>';
  return h;
}

// ----- 5. Firmas -----
function vistaFirmas() {
  var f = INSP.firmas;
  var h = '<h1>Firmas</h1>';
  h += '<div class="tarjeta"><h3>Inspector — ' + esc(AJ.nombre) + '</h3>' +
    '<canvas class="pad" id="pad-inspector" aria-label="Firma del inspector"></canvas>' +
    '<div class="fila-btns" style="margin-top:8px"><button class="btn btn-chico" data-a="limpiar-firma" data-quien="inspector">Borrar</button>' +
    (AJ.firma ? '<button class="btn btn-chico" data-a="usar-mi-firma">Usar mi firma guardada</button>' : '') +
    '<button class="btn btn-chico" data-a="guardar-mi-firma">Guardar como mi firma</button></div></div>';
  h += '<div class="tarjeta"><h3>Cliente — ' + esc(INSP.datos.cliente || 'sin nombre') + '</h3>' +
    '<canvas class="pad" id="pad-cliente" aria-label="Firma del cliente"></canvas>' +
    '<div class="fila-btns" style="margin-top:8px"><button class="btn btn-chico" data-a="limpiar-firma" data-quien="cliente">Borrar</button></div>' +
    '<div class="dos-col">' + campoTexto('firmas.clienteCedula', 'Cédula del cliente') + campoTexto('firmas.fecha', 'Fecha', 'date') + '</div></div>';
  return h;
}
function montarFirmasInspeccion() {
  if (!INSP.firmas.fecha) INSP.firmas.fecha = hoyISO();
  var fi = vista.querySelector('input[data-campo="firmas.fecha"]');
  if (fi && !fi.value) fi.value = INSP.firmas.fecha;
  ['inspector', 'cliente'].forEach(function (q) {
    var pad = PadFirma(document.getElementById('pad-' + q), function (png) {
      INSP.firmas[q] = png; guardarPronto();
    });
    pad.quien = q;
    if (INSP.firmas[q]) pad.cargar(INSP.firmas[q]);
    pads.push(pad);
  });
}

// ----- 6. PDF -----
function revisarInforme() {
  var avisos = [];
  var d = INSP.datos;
  if (!d.cliente) avisos.push('Falta el nombre del cliente.');
  if (!d.direccion) avisos.push('Falta la dirección del inmueble.');
  var sinMarcar = todosLosItems(INSP).filter(function (it) { return !(INSP.items[it.ref] || {}).estado; }).length;
  if (sinMarcar) avisos.push(sinMarcar + ' elemento(s) sin marcar en la lista.');
  var pend = pendientes(INSP);
  var sinPri = pend.filter(function (p) { return p.sinPrioridad; }).length;
  if (sinPri) avisos.push(sinPri + ' pendiente(s) sin prioridad (se tomarán como Baja).');
  var sinObs = pend.filter(function (p) { return !p.obs; }).length;
  if (sinObs) avisos.push(sinObs + ' pendiente(s) sin observación escrita.');
  if (!INSP.conclusion) avisos.push('Falta elegir la conclusión.');
  if (!INSP.firmas.inspector) avisos.push('Falta la firma del inspector.');
  if (!INSP.firmas.cliente) avisos.push('Falta la firma del cliente.');
  if (!AJ.telefono || !AJ.cedula) avisos.push('Complete su teléfono y cédula en Ajustes (engranaje arriba).');
  return avisos;
}
function vistaPdf() {
  var av = revisarInforme();
  var h = '<h1>Informe en PDF</h1>';
  h += av.length ? '<div class="alerta"><b>Antes de generar, revise:</b><ul style="margin:6px 0 0;padding-left:20px">' +
    av.map(function (a) { return '<li>' + esc(a) + '</li>'; }).join('') + '</ul><div style="margin-top:6px;font-weight:500">Puede generarlo igual.</div></div>'
    : '<div class="ok-caja">Todo listo para generar el informe.</div>';
  h += '<p class="sub">Tamaño carta, con su membrete en todas las páginas. Siempre sale en versión clara para imprimir.</p>';
  h += '<button class="btn btn-primario btn-ancho btn-grande" data-a="compartir-pdf">📤 Generar y compartir (WhatsApp, correo…)</button>';
  h += '<button class="btn btn-ancho" data-a="descargar-pdf" style="margin-top:10px">⬇ Generar y guardar PDF</button>';
  return h;
}

// ---------------- Compartir / guardar ----------------
function esNativo() { return !!(window.Capacitor && Capacitor.isNativePlatform && Capacitor.isNativePlatform()); }

function blobABase64(blob) {
  return new Promise(function (ok, mal) {
    var r = new FileReader();
    r.onload = function () { ok(String(r.result).split(',')[1]); };
    r.onerror = function () { mal(r.error); };
    r.readAsDataURL(blob);
  });
}

function compartirArchivo(blob, nombre, tipo, texto) {
  var P = window.Capacitor && Capacitor.Plugins;
  if (esNativo() && P && P.Filesystem && P.Share) {
    return blobABase64(blob).then(function (b64) {
      return P.Filesystem.writeFile({ path: nombre, data: b64, directory: 'CACHE' });
    }).then(function (r) {
      return P.Share.share({ title: nombre, text: texto, files: [r.uri], dialogTitle: 'Enviar informe' });
    }).catch(function (e) {
      if (/cancel/i.test(e && e.message)) return;
      throw e;
    });
  }
  var file;
  try { file = new File([blob], nombre, { type: tipo }); } catch (e) { file = null; }
  if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
    return navigator.share({ files: [file], title: nombre, text: texto }).catch(function (e) {
      if (e && e.name === 'AbortError') return;
      descargar(blob, nombre);
    });
  }
  descargar(blob, nombre);
  aviso('Este navegador no permite compartir: se descargó el archivo.');
  return Promise.resolve();
}

function descargar(blob, nombre) {
  var P = window.Capacitor && Capacitor.Plugins;
  if (esNativo() && P && P.Filesystem) {
    // En el teléfono se guarda en Documentos.
    return blobABase64(blob).then(function (b64) {
      return P.Filesystem.writeFile({ path: nombre, data: b64, directory: 'DOCUMENTS', recursive: true });
    }).then(function () { aviso('Guardado en Documentos: ' + nombre); })
      .catch(function () { return compartirArchivo(blob, nombre, blob.type, ''); });
  }
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url; a.download = nombre;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  return Promise.resolve();
}

function nombreArchivo(numero, cliente) {
  var c = String(cliente || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 30);
  return numero + (c ? '_' + c : '') + '.pdf';
}

function generarInforme() {
  aviso('Generando PDF…');
  return guardarYa().then(function () {
    return new Promise(function (ok) { setTimeout(ok, 30); });
  }).then(function () {
    var doc = PDF.informe(INSP, FOTOS, AJ, logoActual());
    INSP.estado = 'generado';
    guardarPronto();
    return doc.output('blob');
  });
}

// ---------------- Revisita ----------------
function revisitaActual() {
  if (!INSP.revisitas.length) nuevaRevisita();
  return INSP.revisitas[INSP.revisitas.length - 1];
}
function nuevaRevisita() {
  var previa = INSP.revisitas[INSP.revisitas.length - 1];
  var n = INSP.revisitas.length + 1;
  var items = {};
  if (previa) {
    Object.keys(previa.items).forEach(function (k) {
      if (previa.items[k].corregido === true) items[k] = { corregido: true, nota: previa.items[k].nota || '' };
    });
  }
  INSP.revisitas.push({ id: uid(), numero: INSP.numero + '-V' + n, fecha: hoyISO(), horaInicio: horaAhora(), horaFin: '', presentes: '', items: items, observaciones: '', firmas: {} });
  guardarPronto();
}

function pantallaRevisita() {
  ponerTitulo('Revisita ' + INSP.numero);
  var rev = revisitaActual();
  var pend = pendientes(INSP);
  var corr = pend.filter(function (p) { return (rev.items[p.ref] || {}).corregido === true; }).length;
  var h = '<div class="sub"><span class="num-informe">' + esc(INSP.numero) + '</span> · ' + esc(INSP.datos.cliente || '') + '</div>';
  h += '<h1>Revisita: verificación ' + INSP.revisitas.length + '</h1>';
  h += '<div class="tarjeta"><div class="dos-col">' +
    campoRev('numero', 'Informe de verificación N°', 'text') + campoRev('fecha', 'Fecha de revisita', 'date') +
    campoRev('horaInicio', 'Hora de inicio', 'time') + campoRev('horaFin', 'Hora de fin', 'time') + '</div>' +
    campoRev('presentes', 'Presentes en la visita', 'text') + '</div>';
  h += '<div class="totales" style="grid-template-columns:repeat(3,1fr)">' +
    '<div class="total" style="color:var(--c)"><b>' + corr + '</b><span>Corregidos</span></div>' +
    '<div class="total" style="color:var(--o)"><b>' + pend.filter(function (p) { return (rev.items[p.ref] || {}).corregido === false; }).length + '</b><span>Siguen</span></div>' +
    '<div class="total t-T"><b>' + pend.length + '</b><span>Total</span></div></div>';
  if (!pend.length) h += '<div class="ok-caja">El informe original no tiene pendientes.</div>';
  pend.forEach(function (p, i) {
    var r = rev.items[p.ref] || {};
    var fotosOrig = FOTOS.filter(function (f) { return f.ref === p.ref; });
    var refRev = 'rev:' + rev.id + ':' + p.ref;
    h += '<div class="tarjeta pend p-' + p.prioridad + '" id="rev-' + p.ref.replace('.', '-') + '">' +
      '<div class="pend-cab"><b>' + (i + 1) + '.</b> <span class="item-ref">' + p.ref + '</span><span class="chip chip-' + p.prioridad + '">' + PRIORIDADES[p.prioridad].nombre + '</span></div>' +
      '<div style="font-weight:700">' + esc(p.texto) + '</div>' +
      (p.obs ? '<div class="sub">' + esc(p.obs) + '</div>' : '') +
      (fotosOrig.length ? '<div class="fotos">' + fotosOrig.map(function (f) { return '<div class="foto"><img src="' + (f.mini || f.dataUrl) + '" alt=""></div>'; }).join('') + '</div>' : '') +
      '<div class="rev-estados">' +
      '<button class="rev-btn rev-si" data-a="rev-estado" data-ref="' + p.ref + '" data-valor="si" aria-pressed="' + (r.corregido === true) + '">✔ Corregido</button>' +
      '<button class="rev-btn rev-no" data-a="rev-estado" data-ref="' + p.ref + '" data-valor="no" aria-pressed="' + (r.corregido === false) + '">✘ Sigue pendiente</button></div>' +
      '<div class="campo"><label for="rn-' + p.ref + '">Nota de verificación</label><input id="rn-' + p.ref + '" type="text" data-rev-item="' + p.ref + '" value="' + esc(r.nota) + '"></div>' +
      '<div class="fila-btns"><button class="btn btn-chico" data-a="rev-foto" data-ref="' + refRev + '">📷 Foto de la corrección</button></div>' +
      htmlFotosRev(refRev) + '</div>';
  });
  h += '<div class="campo"><label for="rev-obs">Observaciones generales</label><textarea id="rev-obs" data-rev="observaciones">' + esc(rev.observaciones) + '</textarea></div>';
  h += '<div class="tarjeta"><h3>Firma del inspector</h3><canvas class="pad" id="pad-rev-inspector"></canvas>' +
    '<div class="fila-btns" style="margin-top:8px"><button class="btn btn-chico" data-a="rev-limpiar" data-quien="inspector">Borrar</button>' +
    (AJ.firma ? '<button class="btn btn-chico" data-a="rev-mi-firma">Usar mi firma guardada</button>' : '') + '</div></div>';
  h += '<div class="tarjeta"><h3>Firma del cliente</h3><canvas class="pad" id="pad-rev-cliente"></canvas>' +
    '<div class="fila-btns" style="margin-top:8px"><button class="btn btn-chico" data-a="rev-limpiar" data-quien="cliente">Borrar</button></div></div>';
  h += '<button class="btn btn-primario btn-ancho btn-grande" data-a="rev-compartir">📤 Generar informe de verificación y compartir</button>';
  h += '<button class="btn btn-ancho" data-a="rev-descargar" style="margin-top:10px">⬇ Generar y guardar PDF</button>';
  if (INSP.revisitas.length) h += '<button class="btn btn-ancho" data-a="rev-nueva" style="margin-top:10px">＋ Iniciar otra revisita</button>';
  h += '<input type="file" id="in-camara" accept="image/*" capture="environment" class="oculto"><input type="file" id="in-galeria" accept="image/*" multiple class="oculto">';
  h += '<div class="nav-inferior"><a class="btn" href="#/">← Inicio</a><a class="btn" href="#/i/' + INSP.id + '/resumen">Ver informe</a></div>';
  vista.innerHTML = h;
  ['inspector', 'cliente'].forEach(function (q) {
    var pad = PadFirma(document.getElementById('pad-rev-' + q), function (png) {
      rev.firmas[q] = png; guardarPronto();
    });
    pad.quien = q;
    if (rev.firmas[q]) pad.cargar(rev.firmas[q]);
    pads.push(pad);
  });
  window.scrollTo(0, 0);
}
function campoRev(prop, etiqueta, tipo) {
  var rev = revisitaActual();
  return '<div class="campo"><label for="rv-' + prop + '">' + etiqueta + '</label><input id="rv-' + prop + '" type="' + tipo + '" data-rev="' + prop + '" value="' + esc(rev[prop]) + '"></div>';
}
function htmlFotosRev(ref) {
  var fs = FOTOS.filter(function (f) { return f.ref === ref; });
  if (!fs.length) return '';
  return '<div class="fotos">' + fs.map(function (f) {
    return '<div class="foto"><img src="' + (f.mini || f.dataUrl) + '" alt=""><button class="quitar" data-a="quitar-foto" data-id="' + f.id + '" aria-label="Quitar foto">×</button></div>';
  }).join('') + '</div>';
}

function generarVerificacion() {
  aviso('Generando PDF…');
  return guardarYa().then(function () {
    var rev = revisitaActual();
    var doc = PDF.verificacion(INSP, rev, FOTOS, AJ, logoActual());
    rev.generado = true;
    guardarPronto();
    return { blob: doc.output('blob'), nombre: nombreArchivo(rev.numero, INSP.datos.cliente) };
  });
}

// ---------------- Ajustes ----------------
function guardarAjustes() { return DB.guardarAjuste('perfil', AJ); }

function pantallaAjustes() {
  ponerTitulo('Ajustes');
  var tg = temaGuardado();
  var modo = tg === 'dia' || tg === 'noche' ? tg : 'auto';
  var h = '<h1>Ajustes</h1>';
  h += '<div class="tarjeta"><h2 style="margin-top:0">Así se ve su membrete</h2>' + htmlMembrete() + '</div>';
  h += '<div class="tarjeta"><h2 style="margin-top:0">Mis datos</h2>';
  [['nombre', 'Nombre (como sale en el membrete)'], ['lema', 'Línea bajo el nombre'], ['ciudad', 'Ciudad'],
    ['telefono', 'Teléfono / WhatsApp', 'tel'], ['correo', 'Correo', 'email'], ['cedula', 'Cédula']].forEach(function (c) {
    h += '<div class="campo"><label for="aj-' + c[0] + '">' + c[1] + '</label><input id="aj-' + c[0] + '" type="' + (c[2] || 'text') + '" data-ajuste="' + c[0] + '" value="' + esc(AJ[c[0]]) + '"></div>';
  });
  h += '</div>';
  h += '<div class="tarjeta"><h2 style="margin-top:0">Logo</h2><div style="display:flex;gap:14px;align-items:center">' +
    '<img class="logo-ajustes" src="' + logoActual() + '" alt="Logo actual"><div class="fila-btns" style="flex:1">' +
    '<button class="btn" data-a="cambiar-logo">Cambiar logo</button>' +
    (AJ.logo ? '<button class="btn" data-a="logo-original">Usar el original</button>' : '') + '</div></div>' +
    '<input type="file" id="in-logo" accept="image/*" class="oculto"></div>';
  h += '<div class="tarjeta"><h2 style="margin-top:0">Mi firma guardada</h2>' +
    (AJ.firma ? '<img class="firma-guardada" src="' + AJ.firma + '" alt="Firma guardada"><div class="fila-btns" style="margin-top:8px"><button class="btn btn-chico btn-peligro" data-a="borrar-mi-firma">Borrar firma guardada</button></div>'
      : '<p class="sub">Todavía no hay. En el paso "Firmas" de un informe, firme y toque "Guardar como mi firma".</p>') + '</div>';
  h += '<div class="tarjeta"><h2 style="margin-top:0">Tema</h2><div class="opciones">' +
    [['auto', 'Como el teléfono'], ['dia', '☀ Día'], ['noche', '☾ Noche']].map(function (o) {
      return '<button class="opcion" data-a="tema" data-valor="' + o[0] + '" aria-pressed="' + (modo === o[0]) + '">' + o[1] + '</button>';
    }).join('') + '</div></div>';
  h += '<div class="tarjeta"><h2 style="margin-top:0">Respaldo</h2>' +
    '<p class="sub">Todo se guarda en este teléfono. Si desinstala la app o cambia de teléfono, se pierde. Haga un respaldo de vez en cuando y guárdelo en Drive o en su correo.</p>' +
    '<div class="fila-btns"><button class="btn" data-a="exportar">Hacer respaldo</button><button class="btn" data-a="importar">Restaurar respaldo</button></div>' +
    '<input type="file" id="in-respaldo" accept="application/json,.json" class="oculto"></div>';
  h += '<p class="sub" style="text-align:center">Inspección de Vivienda · versión 1.0</p>';
  h += '<div class="nav-inferior"><a class="btn btn-primario" href="#/">Listo</a></div>';
  vista.innerHTML = h;
}

function exportarRespaldo() {
  aviso('Preparando respaldo…');
  Promise.all([DB.listar()]).then(function (r) {
    var insps = r[0];
    return Promise.all(insps.map(function (i) { return DB.fotosDe(i.id); })).then(function (fotos) {
      var datos = { app: 'inspeccion-vivienda', version: 1, fecha: new Date().toISOString(), ajustes: AJ, inspecciones: insps, fotos: [].concat.apply([], fotos) };
      var blob = new Blob([JSON.stringify(datos)], { type: 'application/json' });
      return compartirArchivo(blob, 'respaldo-inspecciones-' + hoyISO() + '.json', 'application/json', 'Respaldo de inspecciones');
    });
  }).catch(function (e) { aviso('Error: ' + e.message); });
}

function importarRespaldo(file) {
  var r = new FileReader();
  r.onload = function () {
    var datos;
    try { datos = JSON.parse(r.result); } catch (e) { aviso('El archivo no es un respaldo válido.'); return; }
    if (!datos || datos.app !== 'inspeccion-vivienda') { aviso('El archivo no es un respaldo de esta app.'); return; }
    if (!confirm('Se agregarán ' + datos.inspecciones.length + ' inspecciones del respaldo. Las que ya existan con el mismo número interno se reemplazarán. ¿Continuar?')) return;
    var tareas = datos.inspecciones.map(function (i) { return DB.guardar(i); })
      .concat(datos.fotos.map(function (f) { return DB.guardarFoto(f); }));
    Promise.all(tareas).then(function () {
      if (datos.ajustes && confirm('¿Usar también los datos y el logo del respaldo?')) { AJ = Object.assign({}, AJUSTES_INICIALES, datos.ajustes); return guardarAjustes(); }
    }).then(function () { aviso('Respaldo restaurado'); ir('#/'); })
      .catch(function (e) { aviso('Error: ' + e.message); });
  };
  r.readAsText(file);
}

// ---------------- Eventos ----------------
vista.addEventListener('input', function (e) {
  var el = e.target;
  if (el.dataset.campo && INSP) {
    setRuta(INSP, el.dataset.campo, el.value);
    if (el.dataset.campo === 'datos.cliente' || el.dataset.campo === 'numero') {
      var s = vista.querySelector('.sub'); if (s) s.innerHTML = '<span class="num-informe">' + esc(INSP.numero) + '</span> · ' + esc(INSP.datos.cliente || 'Cliente sin nombre');
      if (el.dataset.campo === 'numero') ponerTitulo(INSP.numero);
    }
    guardarPronto();
  } else if (el.dataset.item && INSP) {
    var it = INSP.items[el.dataset.item] = INSP.items[el.dataset.item] || {};
    it[el.dataset.prop] = el.value;
    guardarPronto();
  } else if (el.dataset.rev && INSP) {
    revisitaActual()[el.dataset.rev] = el.value;
    guardarPronto();
  } else if (el.dataset.revItem && INSP) {
    var rv = revisitaActual();
    (rv.items[el.dataset.revItem] = rv.items[el.dataset.revItem] || {}).nota = el.value;
    guardarPronto();
  } else if (el.dataset.ajuste) {
    AJ[el.dataset.ajuste] = el.value;
    clearTimeout(el._t);
    el._t = setTimeout(function () {
      guardarAjustes();
      var m = vista.querySelector('.membrete');
      if (m) m.outerHTML = htmlMembrete();
    }, 300);
  }
});

vista.addEventListener('click', function (e) {
  var b = e.target.closest('[data-a]');
  if (!b) return;
  var a = b.dataset.a;
  var ref = b.dataset.ref;
  var item;
  switch (a) {
    case 'nueva': nuevaInspeccion(); break;
    case 'borrar-insp':
      if (confirm('¿Eliminar esta inspección con todas sus fotos? No se puede deshacer.')) {
        DB.borrar(b.dataset.id).then(function () { aviso('Inspección eliminada'); render(); });
      }
      break;
    case 'paso':
      guardarYa();
      ir('#/i/' + INSP.id + '/' + b.dataset.paso);
      break;
    case 'opcion':
      setRuta(INSP, b.dataset.campo, b.dataset.valor);
      b.parentNode.querySelectorAll('.opcion').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
      if (b.dataset.campo === 'datos.uso') document.getElementById('uso-otro').classList.toggle('oculto', b.dataset.valor !== 'otro');
      guardarPronto();
      break;
    case 'hora-fin':
      INSP.datos.horaFin = horaAhora();
      document.getElementById('c-datos.horaFin').value = INSP.datos.horaFin;
      guardarPronto();
      break;
    case 'area':
      abiertas[b.dataset.letra] = !abiertas[b.dataset.letra];
      refrescarArea(b.dataset.letra);
      if (abiertas[b.dataset.letra]) {
        var sec = document.getElementById('area-' + b.dataset.letra);
        if (sec) sec.scrollIntoView({ block: 'start', behavior: 'smooth' });
      }
      break;
    case 'estado':
      item = INSP.items[ref] = INSP.items[ref] || {};
      item.estado = item.estado === b.dataset.valor ? '' : b.dataset.valor;
      refrescarItem(ref);
      guardarPronto();
      break;
    case 'prioridad':
      INSP.items[ref].prioridad = b.dataset.valor;
      refrescarItem(ref);
      guardarPronto();
      break;
    case 'todo-c':
      var area = itemsPorArea(INSP).find(function (x) { return x.letra === b.dataset.letra; });
      area.items.forEach(function (it) {
        var e2 = INSP.items[it.ref] = INSP.items[it.ref] || {};
        if (!e2.estado) e2.estado = 'C';
      });
      refrescarArea(b.dataset.letra);
      guardarPronto();
      break;
    case 'agregar-k':
      var inp = document.getElementById('nuevo-k');
      var txt = inp.value.trim();
      if (!txt) { aviso('Escriba el nombre del elemento.'); inp.focus(); break; }
      var max = INSP.extras.reduce(function (m, x) { return Math.max(m, +x.ref.split('.')[1]); }, 0);
      INSP.extras.push({ ref: 'K.' + (max + 1), texto: txt });
      refrescarArea('K');
      guardarPronto();
      break;
    case 'quitar-k':
      if (!confirm('¿Quitar este elemento y sus fotos?')) break;
      INSP.extras = INSP.extras.filter(function (x) { return x.ref !== ref; });
      delete INSP.items[ref];
      FOTOS.filter(function (f) { return f.ref === ref; }).forEach(function (f) { DB.borrarFoto(f.id); });
      FOTOS = FOTOS.filter(function (f) { return f.ref !== ref; });
      refrescarArea('K');
      guardarPronto();
      break;
    case 'foto-camara': pedirFoto(ref, true); break;
    case 'foto-galeria': pedirFoto(ref, false); break;
    case 'quitar-foto':
      if (!confirm('¿Quitar esta foto?')) break;
      var f = FOTOS.find(function (x) { return x.id === b.dataset.id; });
      DB.borrarFoto(b.dataset.id).then(function () {
        FOTOS = FOTOS.filter(function (x) { return x.id !== b.dataset.id; });
        if (f && f.ref.indexOf('rev:') === 0) pantallaRevisita(); else if (f) refrescarItem(f.ref);
      });
      break;
    case 'nota-foto':
      var foto = FOTOS.find(function (x) { return x.id === b.dataset.id; });
      if (!foto) break;
      var nota = prompt('Descripción de esta foto (si la deja vacía, se usa la observación del ítem):', foto.nota || '');
      if (nota === null) break;
      foto.nota = nota.trim();
      DB.guardarFoto(foto).then(function () { refrescarItem(foto.ref); });
      break;
    case 'resp-todos':
    case 'fecha-todos':
      var val = document.getElementById(a === 'resp-todos' ? 'resp-todos' : 'fecha-todos').value;
      if (!val) { aviso('Escriba un valor primero.'); break; }
      pendientes(INSP).forEach(function (p) { INSP.items[p.ref][a === 'resp-todos' ? 'responsable' : 'compromiso'] = val; });
      guardarPronto();
      pantallaInspeccion('resumen');
      break;
    case 'conclusion':
      INSP.conclusion = b.dataset.valor;
      guardarPronto();
      pantallaInspeccion('conclusion');
      break;
    case 'limpiar-firma':
    case 'rev-limpiar':
      pads.forEach(function (p) { if (p.quien === b.dataset.quien) p.limpiar(); });
      break;
    case 'usar-mi-firma':
    case 'rev-mi-firma':
      pads.forEach(function (p) { if (p.quien === 'inspector') p.cargar(AJ.firma); });
      if (a === 'usar-mi-firma') INSP.firmas.inspector = AJ.firma; else revisitaActual().firmas.inspector = AJ.firma;
      guardarPronto();
      break;
    case 'guardar-mi-firma':
      if (!INSP.firmas.inspector) { aviso('Primero firme en el recuadro del inspector.'); break; }
      AJ.firma = INSP.firmas.inspector;
      guardarAjustes().then(function () { aviso('Firma guardada para próximos informes'); });
      break;
    case 'borrar-mi-firma':
      AJ.firma = null; guardarAjustes().then(render);
      break;
    case 'compartir-pdf':
      generarInforme().then(function (blob) {
        return compartirArchivo(blob, nombreArchivo(INSP.numero, INSP.datos.cliente), 'application/pdf',
          'Informe de inspección ' + INSP.numero + (INSP.datos.cliente ? ' — ' + INSP.datos.cliente : ''));
      }).catch(function (err) { console.error(err); aviso('Error al generar: ' + err.message); });
      break;
    case 'descargar-pdf':
      generarInforme().then(function (blob) { return descargar(blob, nombreArchivo(INSP.numero, INSP.datos.cliente)); })
        .catch(function (err) { console.error(err); aviso('Error al generar: ' + err.message); });
      break;
    case 'rev-estado':
      var rv = revisitaActual();
      var ri = rv.items[ref] = rv.items[ref] || {};
      var nuevo = b.dataset.valor === 'si';
      ri.corregido = ri.corregido === nuevo ? undefined : nuevo;
      guardarPronto();
      var y = window.scrollY;
      pantallaRevisita();
      window.scrollTo(0, y);
      break;
    case 'rev-foto':
      pedirFoto(ref, true, function () { var y2 = window.scrollY; pantallaRevisita(); window.scrollTo(0, y2); });
      break;
    case 'rev-compartir':
      generarVerificacion().then(function (r) {
        return compartirArchivo(r.blob, r.nombre, 'application/pdf', 'Informe de verificación ' + revisitaActual().numero);
      }).catch(function (err) { console.error(err); aviso('Error al generar: ' + err.message); });
      break;
    case 'rev-descargar':
      generarVerificacion().then(function (r) { return descargar(r.blob, r.nombre); })
        .catch(function (err) { console.error(err); aviso('Error al generar: ' + err.message); });
      break;
    case 'rev-nueva':
      if (!confirm('¿Iniciar una nueva revisita? Los pendientes ya corregidos se mantienen marcados.')) break;
      nuevaRevisita();
      guardarYa().then(pantallaRevisita);
      break;
    case 'cambiar-logo': document.getElementById('in-logo').click(); break;
    case 'logo-original': AJ.logo = null; guardarAjustes().then(render); break;
    case 'tema':
      var v = b.dataset.valor;
      try { if (v === 'auto') localStorage.removeItem('tema'); else localStorage.setItem('tema', v); } catch (err) {}
      aplicarTema(temaEfectivo(), true);
      render();
      break;
    case 'exportar': exportarRespaldo(); break;
    case 'importar': document.getElementById('in-respaldo').click(); break;
  }
});

// ---------------- Arranque ----------------
aplicarTema(temaEfectivo(), false);
DB.leerAjuste('perfil').then(function (p) {
  AJ = Object.assign({}, AJUSTES_INICIALES, p || {});
  return render();
}).catch(function (e) {
  vista.innerHTML = '<div class="tarjeta"><h2>No se pudo abrir el almacenamiento</h2><p>' + esc(e.message) + '</p></div>';
});
