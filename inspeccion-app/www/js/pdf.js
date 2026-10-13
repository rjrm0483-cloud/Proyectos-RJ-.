// Genera los PDF (tamaño carta) con el membrete de la plantilla en todas
// las páginas. Siempre en versión clara para imprimir, sin importar el
// modo Día o Noche de la app.

var PDF = (function () {
  var AZUL = [31, 78, 121];
  var VERDE = [0, 179, 134];
  var TEXTO = [22, 28, 36];
  var GRIS = [85, 95, 105];
  var LINEA = [150, 162, 175];
  var FONDO_ETIQ = [233, 239, 246];
  var COLOR_ESTADO = { C: [0, 121, 91], O: [194, 65, 12], NA: [85, 95, 105] };
  var COLOR_PRIOR = { A: [185, 28, 28], M: [161, 92, 0], B: [31, 78, 121] };

  var W = 215.9, H = 279.4, M = 18;
  var ARRIBA = 35, ABAJO = 18;
  var ANCHO = W - 2 * M;

  // Las fuentes del PDF solo tienen caracteres latinos: se quitan emojis
  // y símbolos raros para que no salgan cuadros vacíos.
  var EXTRA = '—–‘’“”•…€';
  function t(s) {
    s = (s == null ? '' : String(s)).normalize ? String(s == null ? '' : s).normalize('NFC') : String(s || '');
    var out = '';
    for (var i = 0; i < s.length; i++) {
      var c = s.charAt(i), code = s.charCodeAt(i);
      if (code === 9) out += ' ';
      else if (code === 10 || (code >= 32 && code <= 126) || (code >= 160 && code <= 255) || EXTRA.indexOf(c) >= 0) out += c;
      else if (code >= 0xD800 && code <= 0xDBFF) i++;
    }
    return out.replace(/[ ]{2,}/g, ' ').replace(/ ([,.;:])/g, '$1').trim();
  }

  function fecha(iso) {
    if (!iso) return '';
    var p = String(iso).split('-');
    return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : iso;
  }

  function nuevoDoc() {
    var doc = new window.jspdf.jsPDF({ unit: 'mm', format: 'letter', compress: true });
    doc.setFont('helvetica', 'normal');
    doc.setLineHeightFactor(1.25);
    return doc;
  }

  function formatoImagen(dataUrl) {
    return /^data:image\/png/i.test(dataUrl) ? 'PNG' : 'JPEG';
  }

  // ---------- Membrete y pie en todas las páginas ----------
  function membrete(doc, aj, logo, numero) {
    var total = doc.getNumberOfPages();
    for (var p = 1; p <= total; p++) {
      doc.setPage(p);
      if (logo) {
        try { doc.addImage(logo, formatoImagen(logo), M, 9, 15, 15, 'logo'); } catch (e) {}
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor.apply(doc, AZUL);
      doc.text(t(aj.nombre), M + 19, 15.2);
      doc.setFontSize(7.2);
      doc.setTextColor.apply(doc, VERDE);
      doc.text(t(aj.lema).toUpperCase(), M + 19, 20.3, { charSpace: 0.15 });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor.apply(doc, GRIS);
      var lineas = [];
      if (aj.ciudad) lineas.push(t(aj.ciudad));
      lineas.push('Tel./WhatsApp: ' + (t(aj.telefono) || '________'));
      if (aj.correo) lineas.push(t(aj.correo));
      lineas.forEach(function (l, i) { doc.text(l, W - M, 12.5 + i * 4.3, { align: 'right' }); });

      doc.setDrawColor.apply(doc, AZUL);
      doc.setLineWidth(0.9);
      doc.line(M, 27.2, W - M, 27.2);
      doc.setDrawColor.apply(doc, VERDE);
      doc.setLineWidth(0.35);
      doc.line(M, 28.4, W - M, 28.4);

      // Pie
      doc.setDrawColor(205, 212, 220);
      doc.setLineWidth(0.2);
      doc.line(M, H - 13.5, W - M, H - 13.5);
      doc.setFontSize(8);
      doc.setTextColor.apply(doc, GRIS);
      doc.text('Página ' + p + ' de ' + total + '  ·  Informe N° ' + t(numero) + '  ·  Firma del inspector: ______________',
        W / 2, H - 9, { align: 'center' });
    }
  }

  // ---------- Ayudas de maquetación ----------
  function asegurar(doc, y, alto) {
    if (y + alto > H - ABAJO) { doc.addPage(); return ARRIBA; }
    return y;
  }

  function seccion(doc, y, texto) {
    y = asegurar(doc, y, 18);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor.apply(doc, AZUL);
    doc.text(t(texto), M, y + 4);
    doc.setDrawColor.apply(doc, AZUL);
    doc.setLineWidth(0.4);
    doc.line(M, y + 6, W - M, y + 6);
    return y + 10.5;
  }

  function parrafo(doc, y, texto, op) {
    op = op || {};
    doc.setFont('helvetica', op.negrita ? 'bold' : (op.cursiva ? 'italic' : 'normal'));
    doc.setFontSize(op.tam || 9);
    doc.setTextColor.apply(doc, op.color || TEXTO);
    var ancho = op.ancho || ANCHO;
    var x = op.x || M;
    var lineas = doc.splitTextToSize(t(texto), ancho);
    var alto = doc.getLineHeight() / doc.internal.scaleFactor;
    lineas.forEach(function (l, i) {
      y = asegurar(doc, y, alto);
      var ultima = i === lineas.length - 1;
      if (op.justificar && !ultima) doc.text(l, x, y + alto * 0.75, { maxWidth: ancho, align: 'justify' });
      else doc.text(l, x, y + alto * 0.75);
      y += alto;
    });
    return y + (op.despues == null ? 2 : op.despues);
  }

  // Casillas tipo "☐ C ☐ O ☐ N/A", con la elegida marcada.
  function casillas(doc, x, y, opciones, tam) {
    tam = tam || 8.5;
    var lado = 3;
    doc.setFontSize(tam);
    opciones.forEach(function (o) {
      doc.setDrawColor.apply(doc, o.on ? (o.color || AZUL) : [110, 120, 130]);
      doc.setLineWidth(0.3);
      doc.rect(x, y - lado + 0.4, lado, lado);
      if (o.on) {
        doc.setDrawColor.apply(doc, o.color || AZUL);
        doc.setLineWidth(0.55);
        doc.line(x + 0.6, y - 1.1, x + 1.3, y - 0.2);
        doc.line(x + 1.3, y - 0.2, x + 2.6, y - 2.2);
      }
      doc.setFont('helvetica', o.on ? 'bold' : 'normal');
      doc.setTextColor.apply(doc, o.on ? (o.color || TEXTO) : GRIS);
      doc.text(t(o.t), x + lado + 1.2, y);
      x += lado + 1.2 + doc.getTextWidth(t(o.t)) + 3.5;
    });
  }

  function estiloTabla(extra) {
    var base = {
      theme: 'grid',
      margin: { top: ARRIBA, bottom: ABAJO + 2, left: M, right: M },
      styles: { font: 'helvetica', fontSize: 8.5, cellPadding: 1.7, textColor: TEXTO, lineColor: LINEA, lineWidth: 0.2, valign: 'middle', overflow: 'linebreak' },
      headStyles: { fillColor: AZUL, textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
      didDrawCell: function (d) {
        var raw = d.cell.raw;
        if (d.section === 'body' && raw && raw.opciones) {
          casillas(d.doc, d.cell.x + 1.7, d.cell.y + d.cell.height / 2 + 1.2, raw.opciones, raw.tam || 8);
        }
      }
    };
    for (var k in extra) base[k] = extra[k];
    return base;
  }

  function etiqueta(s) { return { content: t(s), styles: { fontStyle: 'bold', fillColor: FONDO_ETIQ } }; }
  function valor(s) { return { content: t(s) || '—' }; }
  function opciones(lista, elegido) {
    return { content: '', opciones: lista.map(function (o) { return { t: o[1], on: o[0] === elegido }; }) };
  }

  function tablaDatosGenerales(doc, y, insp) {
    var d = insp.datos;
    var usoTexto = d.uso === 'otro' ? 'Otro: ' + (d.usoOtro || '______') : 'Otro';
    var usoOpc = opciones([['respaldo', USOS.respaldo], ['constructor', USOS.constructor], ['banco', USOS.banco], ['otro', usoTexto]], d.uso);
    usoOpc.colSpan = 3;
    doc.autoTable(estiloTabla({
      startY: y,
      columnStyles: { 0: { cellWidth: 38 }, 1: { cellWidth: 52 }, 2: { cellWidth: 36 } },
      body: [
        [etiqueta('Cliente'), valor(d.cliente), etiqueta('Teléfono / correo'), valor(d.telefono)],
        [etiqueta('Dirección del inmueble'), valor(d.direccion), etiqueta('Proyecto / residencial'), valor(d.proyecto)],
        [etiqueta('Constructor / desarrollador'), valor(d.constructor), etiqueta('Tipo de vivienda'), Object.assign(opciones([['1', '1 planta'], ['2', '2 plantas'], ['3', '3 plantas']], d.tipo), { tam: 7.4 })],
        [etiqueta('Área construida (m²)'), valor(d.area ? d.area + ' m²' : ''), etiqueta('Fecha de inspección'), valor(fecha(d.fecha))],
        [etiqueta('Hora inicio – fin'), valor((d.horaInicio || '__:__') + ' – ' + (d.horaFin || '__:__')), etiqueta('Condición del clima'), opciones([['Seco', 'Seco'], ['Lluvia reciente', 'Lluvia reciente']], d.clima)],
        [etiqueta('Planos disponibles'), opciones([['Sí', 'Sí'], ['No', 'No']], d.planos), etiqueta('Presentes en la visita'), valor(d.presentes)],
        [etiqueta('Uso del informe'), usoOpc]
      ]
    }));
    return doc.lastAutoTable.finalY + 6;
  }

  // Numera las fotos en el orden de la lista de verificación.
  function numerarFotos(insp, fotos) {
    var porRef = {};
    fotos.forEach(function (f) { (porRef[f.ref] = porRef[f.ref] || []).push(f); });
    var lista = [], numeros = {}, n = 0;
    todosLosItems(insp).forEach(function (it) {
      var est = insp.items[it.ref] || {};
      if (est.estado !== 'O') return;
      (porRef[it.ref] || []).forEach(function (f) {
        n++;
        lista.push({ n: n, foto: f, item: it, desc: f.nota || est.obs || '' });
        (numeros[it.ref] = numeros[it.ref] || []).push(n);
      });
    });
    return { lista: lista, numeros: numeros };
  }

  function registroFotografico(doc, y, lista) {
    var gap = 8, colW = (ANCHO - gap) / 2, imgH = 64;
    for (var i = 0; i < lista.length; i += 2) {
      var par = lista.slice(i, i + 2);
      // Altura del texto de cada foto para alinear la fila.
      doc.setFontSize(8.3);
      var textos = par.map(function (p) {
        doc.setFont('helvetica', 'bold');
        var w1 = doc.getTextWidth('Foto N° ' + p.n) + 2.5;
        doc.setFont('helvetica', 'normal');
        var w2 = doc.getTextWidth('Área / ubicación:') + 1.5;
        return {
          w1: w1, w2: w2,
          ubic: doc.splitTextToSize(t(p.item.ref + ' · ' + p.item.area + ' — ' + p.item.texto), colW - w1 - w2),
          desc: doc.splitTextToSize('Descripción: ' + (t(p.desc) || '—'), colW)
        };
      });
      var lh = 3.6;
      var textoH = Math.max.apply(null, textos.map(function (x) { return (x.ubic.length + x.desc.length) * lh; }));
      y = asegurar(doc, y, imgH + textoH + 8);
      par.forEach(function (p, k) {
        var x = M + k * (colW + gap);
        doc.setDrawColor.apply(doc, LINEA);
        doc.setLineWidth(0.25);
        doc.setFillColor(246, 248, 250);
        doc.rect(x, y, colW, imgH, 'FD');
        var f = p.foto;
        var esc = Math.min((colW - 2) / f.w, (imgH - 2) / f.h);
        var w = f.w * esc, h = f.h * esc;
        try { doc.addImage(f.dataUrl, 'JPEG', x + (colW - w) / 2, y + (imgH - h) / 2, w, h, 'f' + f.id); } catch (e) {}
        var ty = y + imgH + 4;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.3);
        doc.setTextColor.apply(doc, AZUL);
        doc.text('Foto N° ' + p.n, x, ty);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor.apply(doc, TEXTO);
        doc.text('Área / ubicación:', x + textos[k].w1, ty);
        doc.text(textos[k].ubic, x + textos[k].w1 + textos[k].w2, ty);
        var yy = ty + textos[k].ubic.length * lh;
        doc.setTextColor.apply(doc, GRIS);
        doc.text(textos[k].desc, x, yy);
      });
      y += imgH + textoH + 9;
    }
    return y;
  }

  function bloqueFirmas(doc, y, izq, der) {
    y = asegurar(doc, y, 58);
    var colW = (ANCHO - 20) / 2;
    [izq, der].forEach(function (b, k) {
      var x = M + k * (colW + 20);
      var lineaY = y + 26;
      if (b.firma) {
        try {
          var props = doc.getImageProperties(b.firma);
          var esc = Math.min(60 / props.width, 24 / props.height);
          var w = props.width * esc, h = props.height * esc;
          doc.addImage(b.firma, 'PNG', x + (colW - w) / 2, lineaY - h - 0.5, w, h);
        } catch (e) {}
      }
      doc.setDrawColor.apply(doc, TEXTO);
      doc.setLineWidth(0.3);
      doc.line(x + 4, lineaY, x + colW - 4, lineaY);
      var yy = lineaY + 4.5;
      b.lineas.forEach(function (l, i) {
        doc.setFont('helvetica', i === 0 ? 'bold' : (i === b.lineas.length - 1 ? 'bold' : 'normal'));
        doc.setFontSize(i === 0 ? 9 : 8.3);
        doc.setTextColor.apply(doc, i === b.lineas.length - 1 ? AZUL : TEXTO);
        doc.text(t(l), x + colW / 2, yy, { align: 'center' });
        yy += 4.2;
      });
    });
    return y + 60;
  }

  function lineasInspector(aj) {
    var tel = [aj.telefono ? 'Tel.: ' + aj.telefono : 'Tel.: ________', aj.correo].filter(Boolean).join(' · ');
    return [aj.nombre, 'Arquitecto — Cédula N° ' + (aj.cedula || '__________'), tel, 'Inspector'];
  }

  function titulo(doc, y, principal, sub) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor.apply(doc, AZUL);
    doc.text(t(principal), M, y + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor.apply(doc, GRIS);
    doc.text(t(sub), M, y + 11.5);
    return y + 17;
  }

  function filaNumero(doc, y, etiq1, val1, etiq2, val2) {
    doc.autoTable(estiloTabla({
      startY: y,
      columnStyles: { 0: { cellWidth: 38 }, 1: { cellWidth: 52 }, 2: { cellWidth: 36 } },
      body: [[etiqueta(etiq1), { content: t(val1), styles: { fontStyle: 'bold', textColor: AZUL } }, etiqueta(etiq2), valor(val2)]]
    }));
    return doc.lastAutoTable.finalY + 7;
  }

  function prioridadCelda(p) {
    if (!p || !PRIORIDADES[p]) return '';
    return { content: PRIORIDADES[p].nombre, styles: { textColor: COLOR_PRIOR[p], fontStyle: 'bold', halign: 'center' } };
  }

  // ================= INFORME DE INSPECCIÓN =================
  function informe(insp, fotos, aj, logo) {
    var doc = nuevoDoc();
    var d = insp.datos;
    var y = ARRIBA + 1;
    y = titulo(doc, y, 'INFORME DE INSPECCIÓN DE VIVIENDA NUEVA',
      'Revisión en etapa de entrega sustancial — lista de pendientes (punch list)');
    y = filaNumero(doc, y, 'Informe N°', insp.numero, 'Fecha de emisión', fecha(d.fechaEmision || hoyISO()));

    y = seccion(doc, y, '1. DATOS GENERALES');
    y = tablaDatosGenerales(doc, y, insp);

    y = seccion(doc, y, '2. ALCANCE Y LIMITACIONES');
    ALCANCE.forEach(function (p) { y = parrafo(doc, y, p, { justificar: true, despues: 2.2 }); });
    y += 3;

    y = seccion(doc, y, '3. CRITERIOS DE EVALUACIÓN');
    doc.autoTable(estiloTabla({
      startY: y,
      head: [['Estado', 'Significado', 'Prioridad', 'Significado']],
      columnStyles: { 0: { cellWidth: 30, fontStyle: 'bold' }, 1: { cellWidth: 55 }, 2: { cellWidth: 25, fontStyle: 'bold' } },
      body: [
        [{ content: ESTADOS.C.nombre, styles: { textColor: COLOR_ESTADO.C } }, ESTADOS.C.texto, { content: 'A — Alta', styles: { textColor: COLOR_PRIOR.A } }, PRIORIDADES.A.texto],
        [{ content: ESTADOS.O.nombre, styles: { textColor: COLOR_ESTADO.O } }, ESTADOS.O.texto, { content: 'M — Media', styles: { textColor: COLOR_PRIOR.M } }, PRIORIDADES.M.texto],
        [{ content: ESTADOS.NA.nombre, styles: { textColor: COLOR_ESTADO.NA } }, ESTADOS.NA.texto, { content: 'B — Baja', styles: { textColor: COLOR_PRIOR.B } }, PRIORIDADES.B.texto]
      ]
    }));

    // 4. Lista de verificación
    var fot = numerarFotos(insp, fotos);
    doc.addPage();
    y = seccion(doc, ARRIBA, '4. LISTA DE VERIFICACIÓN POR ÁREA');
    y = parrafo(doc, y, 'Estado de cada elemento. Para todo ítem "O" se indica prioridad, ubicación exacta y número de foto.', { tam: 8.5, color: GRIS, despues: 3 });
    itemsPorArea(insp).forEach(function (a) {
      y = asegurar(doc, y, 26);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor.apply(doc, AZUL);
      doc.text(a.letra + '. ' + t(a.nombre), M, y + 3.5);
      y += 5.5;
      var filas = a.items.map(function (it) {
        var e = insp.items[it.ref] || {};
        var esO = e.estado === 'O';
        return [
          { content: it.ref, styles: { halign: 'center', fontStyle: 'bold' } },
          t(it.texto),
          { content: '', opciones: [
            { t: 'C', on: e.estado === 'C', color: COLOR_ESTADO.C },
            { t: 'O', on: e.estado === 'O', color: COLOR_ESTADO.O },
            { t: 'N/A', on: e.estado === 'NA', color: COLOR_ESTADO.NA }
          ], tam: 7.8 },
          esO ? prioridadCelda(e.prioridad) : '',
          esO ? t(e.obs) : '',
          { content: (fot.numeros[it.ref] || []).join(', '), styles: { halign: 'center' } }
        ];
      });
      if (!filas.length) filas = [[{ content: 'Sin elementos adicionales.', colSpan: 6, styles: { textColor: GRIS, fontStyle: 'italic' } }]];
      doc.autoTable(estiloTabla({
        startY: y,
        head: [['N°', 'Elemento revisado', 'Estado', 'Prior.', 'Observación / ubicación', 'Foto N°']],
        styles: { font: 'helvetica', fontSize: 8.2, cellPadding: 1.6, textColor: TEXTO, lineColor: LINEA, lineWidth: 0.2, valign: 'middle', minCellHeight: 7 },
        columnStyles: { 0: { cellWidth: 11 }, 1: { cellWidth: 52 }, 2: { cellWidth: 30 }, 3: { cellWidth: 14 }, 5: { cellWidth: 15 } },
        body: filas
      }));
      y = doc.lastAutoTable.finalY + 6;
    });

    // 5. Registro fotográfico
    doc.addPage();
    y = seccion(doc, ARRIBA, '5. REGISTRO FOTOGRÁFICO');
    if (fot.lista.length) y = registroFotografico(doc, y, fot.lista);
    else y = parrafo(doc, y, 'No se registraron fotografías.', { color: GRIS, cursiva: true });

    // 6. Resumen de pendientes
    doc.addPage();
    y = seccion(doc, ARRIBA, '6. RESUMEN DE PENDIENTES');
    y = parrafo(doc, y, 'Todos los ítems marcados "O", ordenados de prioridad Alta a Baja.', { tam: 8.5, color: GRIS, despues: 2 });
    var pend = pendientes(insp);
    var filasP = pend.map(function (p, i) {
      return [
        { content: String(i + 1), styles: { halign: 'center' } },
        t(p.texto + (p.obs ? ': ' + p.obs : '')),
        { content: p.ref, styles: { halign: 'center' } },
        prioridadCelda(p.prioridad),
        t(p.responsable),
        { content: fecha(p.compromiso), styles: { halign: 'center' } },
        { content: '', opciones: [{ t: 'Sí', on: false }, { t: 'No', on: false }], tam: 7.8 }
      ];
    });
    if (!filasP.length) filasP = [[{ content: 'No se identificaron pendientes.', colSpan: 7, styles: { textColor: GRIS, fontStyle: 'italic' } }]];
    doc.autoTable(estiloTabla({
      startY: y,
      head: [['N°', 'Pendiente / defecto', 'Ref. ítem', 'Prior.', 'Responsable', 'Fecha compromiso', 'Verificado']],
      styles: { font: 'helvetica', fontSize: 8.2, cellPadding: 1.6, textColor: TEXTO, lineColor: LINEA, lineWidth: 0.2, valign: 'middle', minCellHeight: 7 },
      columnStyles: { 0: { cellWidth: 9 }, 2: { cellWidth: 14 }, 3: { cellWidth: 14 }, 4: { cellWidth: 30 }, 5: { cellWidth: 20 }, 6: { cellWidth: 22 } },
      body: filasP
    }));
    y = doc.lastAutoTable.finalY + 5;
    var tot = totales(pend);
    doc.autoTable(estiloTabla({
      startY: y,
      head: [['Totales', 'Alta', 'Media', 'Baja', 'Total']],
      columnStyles: { 0: { fontStyle: 'bold', fillColor: FONDO_ETIQ } },
      bodyStyles: { halign: 'center', fontStyle: 'bold' },
      body: [[{ content: 'Pendientes identificados', styles: { halign: 'left' } },
        { content: String(tot.A), styles: { textColor: COLOR_PRIOR.A } },
        { content: String(tot.M), styles: { textColor: COLOR_PRIOR.M } },
        { content: String(tot.B), styles: { textColor: COLOR_PRIOR.B } },
        String(tot.total)]]
    }));
    y = doc.lastAutoTable.finalY + 8;

    // 7. Conclusión
    y = seccion(doc, y, '7. CONCLUSIÓN Y RECOMENDACIÓN');
    ['apta', 'pendientes', 'no'].forEach(function (k) {
      var lineas = doc.splitTextToSize(CONCLUSIONES[k].texto, ANCHO - 6);
      y = asegurar(doc, y, lineas.length * 4.2 + 2);
      var on = insp.conclusion === k;
      casillas(doc, M, y + 3.2, [{ t: '', on: on }], 9);
      doc.setFont('helvetica', on ? 'bold' : 'normal');
      doc.setFontSize(9);
      doc.setTextColor.apply(doc, on ? AZUL : TEXTO);
      doc.text(lineas, M + 5.5, y + 3.2);
      y += lineas.length * 4.2 + 2;
    });
    y += 2;
    y = parrafo(doc, y, 'Observaciones generales:', { negrita: true, despues: 1 });
    if (insp.obsGenerales && insp.obsGenerales.trim()) {
      y = parrafo(doc, y, insp.obsGenerales, { despues: 4 });
    } else {
      doc.setDrawColor(170, 178, 186);
      doc.setLineWidth(0.2);
      for (var r = 0; r < 3; r++) { y = asegurar(doc, y, 7); y += 6.5; doc.line(M, y, W - M, y); }
      y += 5;
    }

    // 8. Firmas
    y = seccion(doc, y + 2, '8. FIRMAS');
    y = bloqueFirmas(doc, y + 4,
      { firma: insp.firmas && insp.firmas.inspector, lineas: lineasInspector(aj) },
      { firma: insp.firmas && insp.firmas.cliente, lineas: [
        d.cliente || '[Nombre del cliente]',
        'Cédula N° ' + ((insp.firmas && insp.firmas.clienteCedula) || '__________'),
        'Fecha: ' + (fecha(insp.firmas && insp.firmas.fecha) || '____ / ____ / ________'),
        'Recibido por el cliente'] });

    membrete(doc, aj, logo, insp.numero);
    return doc;
  }

  // ================= INFORME DE VERIFICACIÓN (REVISITA) =================
  function verificacion(insp, rev, fotos, aj, logo) {
    var doc = nuevoDoc();
    var d = insp.datos;
    var numero = rev.numero;
    var y = ARRIBA + 1;
    y = titulo(doc, y, 'INFORME DE VERIFICACIÓN DE PENDIENTES',
      'Revisita — verificación de las correcciones del informe N° ' + insp.numero);
    y = filaNumero(doc, y, 'Informe N°', numero, 'Fecha de revisita', fecha(rev.fecha));

    y = seccion(doc, y, '1. DATOS GENERALES');
    doc.autoTable(estiloTabla({
      startY: y,
      columnStyles: { 0: { cellWidth: 38 }, 1: { cellWidth: 52 }, 2: { cellWidth: 36 } },
      body: [
        [etiqueta('Cliente'), valor(d.cliente), etiqueta('Teléfono / correo'), valor(d.telefono)],
        [etiqueta('Dirección del inmueble'), valor(d.direccion), etiqueta('Proyecto / residencial'), valor(d.proyecto)],
        [etiqueta('Constructor / desarrollador'), valor(d.constructor), etiqueta('Informe original'), valor(insp.numero + ' del ' + fecha(d.fecha))],
        [etiqueta('Hora inicio – fin'), valor((rev.horaInicio || '__:__') + ' – ' + (rev.horaFin || '__:__')), etiqueta('Presentes en la visita'), valor(rev.presentes)]
      ]
    }));
    y = doc.lastAutoTable.finalY + 6;

    y = seccion(doc, y, '2. ALCANCE');
    y = parrafo(doc, y, 'Esta verificación se limita a los pendientes consignados en el informe N° ' + insp.numero +
      '. Se mantienen el alcance y las limitaciones indicados en dicho informe.', { justificar: true, despues: 4 });

    y = seccion(doc, y, '3. RESULTADO DE LA VERIFICACIÓN');
    var pend = pendientes(insp);
    var porRef = {};
    fotos.forEach(function (f) { (porRef[f.ref] = porRef[f.ref] || []).push(f); });
    var lista = [], n = 0, numeros = {};
    pend.forEach(function (p) {
      (porRef['rev:' + rev.id + ':' + p.ref] || []).forEach(function (f) {
        n++;
        lista.push({ n: n, foto: f, item: p, desc: f.nota || (rev.items[p.ref] || {}).nota || '' });
        (numeros[p.ref] = numeros[p.ref] || []).push(n);
      });
    });
    var corregidos = 0, siguen = { A: 0, M: 0, B: 0 }, sinRevisar = 0;
    var filas = pend.map(function (p, i) {
      var r = rev.items[p.ref] || {};
      if (r.corregido === true) corregidos++;
      else if (r.corregido === false) siguen[p.prioridad] = (siguen[p.prioridad] || 0) + 1;
      else sinRevisar++;
      return [
        { content: String(i + 1), styles: { halign: 'center' } },
        t(p.texto + (p.obs ? ': ' + p.obs : '')),
        { content: p.ref, styles: { halign: 'center' } },
        prioridadCelda(p.prioridad),
        { content: '', opciones: [{ t: 'Sí', on: r.corregido === true, color: COLOR_ESTADO.C }, { t: 'No', on: r.corregido === false, color: COLOR_ESTADO.O }], tam: 7.8 },
        t(r.nota),
        { content: (numeros[p.ref] || []).join(', '), styles: { halign: 'center' } }
      ];
    });
    if (!filas.length) filas = [[{ content: 'El informe original no tenía pendientes.', colSpan: 7, styles: { textColor: GRIS, fontStyle: 'italic' } }]];
    doc.autoTable(estiloTabla({
      startY: y,
      head: [['N°', 'Pendiente / defecto', 'Ref. ítem', 'Prior.', 'Corregido', 'Nota de verificación', 'Foto N°']],
      styles: { font: 'helvetica', fontSize: 8.2, cellPadding: 1.6, textColor: TEXTO, lineColor: LINEA, lineWidth: 0.2, valign: 'middle', minCellHeight: 7 },
      columnStyles: { 0: { cellWidth: 9 }, 2: { cellWidth: 14 }, 3: { cellWidth: 14 }, 4: { cellWidth: 22 }, 6: { cellWidth: 14 } },
      body: filas
    }));
    y = doc.lastAutoTable.finalY + 5;
    doc.autoTable(estiloTabla({
      startY: y,
      head: [['Totales', 'Corregidos', 'Siguen: Alta', 'Siguen: Media', 'Siguen: Baja', 'Total pendientes']],
      columnStyles: { 0: { fontStyle: 'bold', fillColor: FONDO_ETIQ } },
      bodyStyles: { halign: 'center', fontStyle: 'bold' },
      body: [[{ content: 'Resultado', styles: { halign: 'left' } },
        { content: String(corregidos), styles: { textColor: COLOR_ESTADO.C } },
        { content: String(siguen.A), styles: { textColor: COLOR_PRIOR.A } },
        { content: String(siguen.M), styles: { textColor: COLOR_PRIOR.M } },
        { content: String(siguen.B), styles: { textColor: COLOR_PRIOR.B } },
        String(pend.length)]]
    }));
    y = doc.lastAutoTable.finalY + 8;

    y = seccion(doc, y, '4. CONCLUSIÓN');
    // Un pendiente Alta que no se verificó como corregido impide recomendar recibir.
    var altaAbiertos = pend.filter(function (p) { return p.prioridad === 'A' && (rev.items[p.ref] || {}).corregido !== true; }).length;
    var abiertos = pend.length - corregidos;
    var concl;
    if (!abiertos) concl = 'Todos los pendientes del informe original fueron verificados como corregidos. La vivienda se encuentra apta para recibir.';
    else if (altaAbiertos) concl = 'No se recomienda recibir: quedan ' + abiertos + ' pendiente(s) sin verificar como corregidos, de ellos ' + altaAbiertos + ' de prioridad Alta.';
    else concl = 'Apta para recibir con pendientes: quedan ' + abiertos + ' pendiente(s) de prioridad Media o Baja sin verificar como corregidos, a corregir en el plazo acordado.';
    if (sinRevisar) concl += ' ' + sinRevisar + ' pendiente(s) no fueron revisados en esta visita.';
    y = parrafo(doc, y, concl, { negrita: true, color: AZUL, despues: 3 });
    y = parrafo(doc, y, 'Observaciones generales:', { negrita: true, despues: 1 });
    y = parrafo(doc, y, rev.observaciones || '—', { despues: 5 });

    var sec = 5;
    if (lista.length) {
      doc.addPage();
      y = seccion(doc, ARRIBA, sec++ + '. REGISTRO FOTOGRÁFICO DE LA VERIFICACIÓN');
      y = registroFotografico(doc, y, lista.map(function (x) {
        return { n: x.n, foto: x.foto, desc: x.desc, item: { ref: x.item.ref, area: x.item.area, texto: x.item.texto } };
      }));
    }
    y = seccion(doc, y + 2, sec + '. FIRMAS');
    bloqueFirmas(doc, y + 4,
      { firma: rev.firmas && rev.firmas.inspector, lineas: lineasInspector(aj) },
      { firma: rev.firmas && rev.firmas.cliente, lineas: [
        d.cliente || '[Nombre del cliente]',
        'Cédula N° ' + ((insp.firmas && insp.firmas.clienteCedula) || '__________'),
        'Fecha: ' + (fecha(rev.fecha) || '____ / ____ / ________'),
        'Recibido por el cliente'] });

    membrete(doc, aj, logo, numero);
    return doc;
  }

  return { informe: informe, verificacion: verificacion, fecha: fecha };
})();

// ---------- Utilidades compartidas con la app ----------
function hoyISO() {
  var d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

// Áreas con sus ítems, incluidos los propios de "K. Otros".
function itemsPorArea(insp) {
  return AREAS.map(function (a) {
    var items = a.items.map(function (txt, i) {
      return { ref: a.letra + '.' + (i + 1), texto: txt, area: a.nombre, letra: a.letra };
    });
    if (a.letra === 'K') {
      items = (insp.extras || []).map(function (x) {
        return { ref: x.ref, texto: x.texto, area: a.nombre, letra: 'K', propio: true };
      });
    }
    return { letra: a.letra, nombre: a.nombre, items: items };
  });
}

function todosLosItems(insp) {
  var l = [];
  itemsPorArea(insp).forEach(function (a) { l = l.concat(a.items); });
  return l;
}

// Ítems "O" ordenados de Alta a Baja (y dentro, en orden de la lista).
function pendientes(insp) {
  var l = [];
  todosLosItems(insp).forEach(function (it, i) {
    var e = insp.items[it.ref];
    if (e && e.estado === 'O') {
      l.push({ ref: it.ref, texto: it.texto, area: it.area, orden: i, prioridad: e.prioridad || 'B', sinPrioridad: !e.prioridad,
        obs: e.obs || '', responsable: e.responsable || '', compromiso: e.compromiso || '' });
    }
  });
  return l.sort(function (a, b) {
    return (PRIORIDADES[a.prioridad].orden - PRIORIDADES[b.prioridad].orden) || (a.orden - b.orden);
  });
}

function totales(lista) {
  var t = { A: 0, M: 0, B: 0, total: lista.length };
  lista.forEach(function (p) { t[p.prioridad]++; });
  return t;
}
