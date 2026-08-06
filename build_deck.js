const pptxgen = require("pptxgenjs");
const p = new pptxgen();
p.layout = "LAYOUT_WIDE";
const W = 13.33, H = 7.5;

// ---------- Palette (Midnight Executive) ----------
const NAVY   = "1E2761";  // primary
const NAVYD  = "121736";  // deep navy for dark slides
const ICE    = "CADCFC";  // secondary
const ACCENT = "3E5FC0";  // bright blue accent
const GOLD   = "C9A227";  // warm accent for key stats
const INK    = "1B2138";  // body text
const MUTE   = "5C6784";  // muted captions
const LIGHT  = "F4F7FD";  // light tint bg
const WHITE  = "FFFFFF";

const HEAD = "Cambria";
const BODY = "Calibri";

const IMG = "/root/.claude/uploads/66fba22f-583e-557b-9ab9-bf088b6d1210/";
const im = {
  portada:   IMG+"d65bfeec-1000206752.jpg",
  molecula:  IMG+"5b8ace72-1000206753.jpg",
  molecula2: IMG+"104b64c8-1000206764.jpg",
  cerebroLuz:IMG+"2084e854-1000206754.jpg",
  lab:       IMG+"3e754cf6-1000206756.jpg",
  molCerebro:IMG+"6ddcd685-1000206757.jpg",
  pastGlass: IMG+"e8ac2a16-1000206755.jpg",
  manoRx:    IMG+"b72ff5ad-1000206758.jpg",
  estructura:IMG+"a3508162-1000206759.jpg",
  mecInfo:   IMG+"aa4977e1-1000206762.jpg",
  indicac:   IMG+"8bdd1850-1000206763.jpg",
  escritorio:IMG+"918debf7-1000206765.jpg",
  cajaRex:   IMG+"ec29a529-1000206767.jpg",
  pastColor: IMG+"9c748f5c-1000206768.jpg",
  mecCerebro:IMG+"403a44db-1000206766.jpg",
  molBlanca: IMG+"03076ebf-1000206863.jpg",
  cerebroNeu:IMG+"90f42778-1000206864.jpg",
};

// ---------- helpers ----------
function shadow() { return { type:"outer", color:"9AA6C2", blur:9, offset:3, angle:90, opacity:0.45 }; }
function bg(slide, color){ slide.background = { color }; }

// Title header for content slides: number badge + title, no underline
function header(slide, num, title, opt={}){
  const dark = opt.dark;
  const tcol = dark ? WHITE : NAVY;
  slide.addShape(p.ShapeType.ellipse, { x:0.55, y:0.5, w:0.62, h:0.62, fill:{color:ACCENT} });
  slide.addText(String(num).padStart(2,"0"), { x:0.55, y:0.5, w:0.62, h:0.62, align:"center", valign:"middle",
    fontFace:HEAD, fontSize:20, bold:true, color:WHITE });
  slide.addText(title, { x:1.35, y:0.44, w:11.4, h:0.78, align:"left", valign:"middle",
    fontFace:HEAD, fontSize:30, bold:true, color:tcol });
}

function framedImage(slide, path, x, y, w, h){
  slide.addImage({ path, x, y, w, h, sizing:{ type:"cover", w, h }, rounding:false, shadow:shadow() });
}

// bullet paragraphs
function bullets(items){
  return items.map((it,i)=>({
    text: it.t,
    options: Object.assign({ bullet:{ code:"2022", indent:14 }, color:INK, fontFace:BODY,
      fontSize: it.s||16, bold:!!it.b, breakLine:true, paraSpaceAfter: it.sp!=null?it.sp:8 }, it.o||{})
  }));
}

// section card w/ icon dot + header + body text
function infoCard(slide, x, y, w, h, title, body, opt={}){
  slide.addShape(p.ShapeType.roundRect, { x, y, w, h, rectRadius:0.08,
    fill:{color: opt.fill||WHITE}, line:{ color: opt.line||"D9E2F5", width:1 }, shadow: opt.shadow?shadow():undefined });
  slide.addText([
    { text:title, options:{ fontFace:HEAD, fontSize: opt.ts||16, bold:true, color: opt.tc||NAVY, breakLine:true, paraSpaceAfter:4 } },
    ...(Array.isArray(body)? body : [{ text:body, options:{ fontFace:BODY, fontSize: opt.bs||14, color: opt.bc||INK } }])
  ], { x:x+0.22, y:y+0.16, w:w-0.44, h:h-0.32, valign:"top", align:"left" });
}

// big stat callout
function stat(slide, x, y, w, big, label, opt={}){
  slide.addText(big, { x, y, w, h:0.9, align:"center", fontFace:HEAD, bold:true, fontSize: opt.fs||46, color: opt.color||ACCENT, margin:0 });
  slide.addText(label, { x, y:y+0.86, w, h:0.6, align:"center", fontFace:BODY, fontSize: opt.ls||12, color:MUTE, margin:0 });
}

// ============================================================
// SLIDE 1 — PORTADA
// ============================================================
(() => {
  const s = p.addSlide(); bg(s, NAVYD);
  s.addImage({ path: im.portada, x:0, y:0, w:W, h:H, sizing:{ type:"cover", w:W, h:H } });
  // bottom translucent band
  s.addShape(p.ShapeType.rect, { x:0, y:5.55, w:W, h:1.95, fill:{ color:NAVYD, transparency:12 } });
  s.addText("Sesión de Actualización Farmacológica en Psiquiatría", {
    x:0.7, y:5.7, w:11.9, h:0.4, fontFace:BODY, fontSize:15, color:ICE, italic:true });
  s.addText([
    { text:"Ponente:  ", options:{ bold:true, color:WHITE } },
    { text:"Dra. Heydi Trujillo", options:{ bold:true, color:WHITE } },
    { text:"   —   Médico Psiquiatra", options:{ color:ICE } },
  ], { x:0.7, y:6.12, w:11.9, h:0.5, fontFace:HEAD, fontSize:22 });
  s.addText("Dirigido a profesionales médicos en Psiquiatría  ·  Agosto 2026", {
    x:0.7, y:6.72, w:11.9, h:0.4, fontFace:BODY, fontSize:13, color:ICE });
  s.addNotes("Bienvenida. Presentación de nivel senior sobre brexpiprazol dirigida a psiquiatras. Ponente: Dra. Heydi Trujillo.");
})();

// ============================================================
// SLIDE 2 — AGENDA
// ============================================================
(() => {
  const s = p.addSlide(); bg(s, WHITE);
  header(s, 1, "Agenda de la sesión");
  framedImage(s, im.cerebroLuz, 7.35, 1.55, 5.45, 5.35);
  const cols = [
    ["Fundamentos", ["Introducción y contexto clínico","Historia y desarrollo","Estructura y clasificación"]],
    ["Farmacología", ["Mecanismo de acción","Farmacodinamia receptorial","Farmacocinética (ADME)"]],
    ["Clínica", ["Indicaciones y evidencia","Posología y presentaciones","Seguridad e interacciones"]],
    ["Aplicación", ["Posicionamiento terapéutico","Perlas clínicas","Conclusiones y referencias"]],
  ];
  let y = 1.65;
  cols.forEach((c,idx)=>{
    const yy = 1.6 + idx*1.28;
    s.addShape(p.ShapeType.ellipse, { x:0.6, y:yy, w:0.5, h:0.5, fill:{color: idx%2?NAVY:ACCENT} });
    s.addText(String(idx+1), { x:0.6, y:yy, w:0.5, h:0.5, align:"center", valign:"middle", fontFace:HEAD, bold:true, fontSize:18, color:WHITE });
    s.addText(c[0], { x:1.25, y:yy-0.05, w:5.9, h:0.4, fontFace:HEAD, bold:true, fontSize:17, color:NAVY });
    s.addText(c[1].join("   ·   "), { x:1.25, y:yy+0.36, w:5.9, h:0.7, fontFace:BODY, fontSize:13.5, color:MUTE });
  });
  s.addNotes("Recorrido: de los fundamentos farmacológicos a la aplicación clínica práctica del brexpiprazol.");
})();

// ============================================================
// SLIDE 3 — INTRODUCCIÓN / QUÉ ES
// ============================================================
(() => {
  const s = p.addSlide(); bg(s, LIGHT);
  header(s, 2, "¿Qué es el brexpiprazol?");
  framedImage(s, im.molCerebro, 7.55, 1.55, 5.25, 5.35);
  s.addText([
    { text:"Antipsicótico atípico de segunda generación", options:{ fontFace:HEAD, bold:true, fontSize:18, color:NAVY, breakLine:true, paraSpaceAfter:8 } },
  ], { x:0.6, y:1.5, w:6.6, h:0.5 });
  s.addText(bullets([
    { t:"Comercializado como Rexulti®; genérico: brexpiprazole.", b:false },
    { t:"Modulador de la actividad serotonina-dopamina (SDAM): estabiliza la neurotransmisión en lugar de bloquearla por completo.", },
    { t:"Diseñado como sucesor de segunda generación del aripiprazol, con menor actividad intrínseca dopaminérgica.", },
    { t:"Objetivo de diseño: eficacia antipsicótica con mejor tolerabilidad — menos acatisia, activación e inquietud.", },
    { t:"Administración oral, una vez al día, independiente de los alimentos.", },
  ]), { x:0.6, y:2.15, w:6.65, h:4.4, valign:"top" });
  s.addNotes("Brexpiprazol = SDAM. Concepto clave: 'estabilizador' del sistema dopamina-serotonina, no un antagonista puro. Sucesor racional del aripiprazol.");
})();

// ============================================================
// SLIDE 4 — HISTORIA Y DESARROLLO
// ============================================================
(() => {
  const s = p.addSlide(); bg(s, WHITE);
  header(s, 3, "Historia y desarrollo");
  framedImage(s, im.lab, 0.6, 1.6, 5.5, 5.3);
  const items = [
    ["Desarrollo","Otsuka Pharmaceutical en colaboración con H. Lundbeck A/S."],
    ["2015 — FDA","Aprobado (10 jul 2015) para esquizofrenia y como adyuvante en depresión mayor."],
    ["Expansión global","Aprobaciones posteriores en Europa, Canadá y Latinoamérica."],
    ["2023 — Hito","Primer fármaco aprobado por la FDA para la agitación asociada a la demencia de Alzheimer."],
  ];
  let y = 1.65;
  items.forEach((it,i)=>{
    const yy = 1.6 + i*1.32;
    s.addShape(p.ShapeType.roundRect, { x:6.45, y:yy, w:6.35, h:1.12, rectRadius:0.07, fill:{color:LIGHT}, line:{color:"D9E2F5",width:1} });
    s.addText(it[0], { x:6.65, y:yy+0.12, w:2.2, h:0.9, fontFace:HEAD, bold:true, fontSize:15, color:ACCENT, valign:"top" });
    s.addText(it[1], { x:8.55, y:yy+0.12, w:4.05, h:0.9, fontFace:BODY, fontSize:13.5, color:INK, valign:"middle" });
  });
  s.addNotes("Otsuka + Lundbeck. Aprobación FDA 2015 (esquizofrenia y TDM adyuvante). 2023: primer fármaco para agitación en Alzheimer.");
})();

// ============================================================
// SLIDE 5 — ESTRUCTURA QUÍMICA
// ============================================================
(() => {
  const s = p.addSlide(); bg(s, LIGHT);
  header(s, 4, "Estructura y propiedades químicas");
  // structure image on white card
  s.addShape(p.ShapeType.roundRect, { x:0.6, y:1.55, w:4.55, h:5.4, rectRadius:0.06, fill:{color:WHITE}, line:{color:"D9E2F5",width:1}, shadow:shadow() });
  s.addImage({ path: im.estructura, x:0.95, y:1.85, w:3.85, h:4.8, sizing:{type:"contain", w:3.85, h:4.8} });
  s.addText("Representación esquemática (ilustrativa)", { x:0.6, y:6.55, w:4.55, h:0.35, align:"center", fontFace:BODY, italic:true, fontSize:10.5, color:MUTE, margin:0 });
  s.addText(bullets([
    { t:"Nombre químico: 7-[4-[4-(1-benzotiofen-4-il)piperazin-1-il]butoxi]quinolin-2(1H)-ona.", },
    { t:"Fórmula molecular: C25H27N3O2S.", b:true },
    { t:"Peso molecular: ≈ 433,6 g/mol.", },
    { t:"Núcleo quinolinona unido, por una cadena butoxi, a una piperazina con anillo benzotiofeno.", },
    { t:"El benzotiofeno y la piperazina confieren alta afinidad por receptores D2 y 5-HT.", },
    { t:"Polvo blanco a blanquecino, prácticamente insoluble en agua.", },
  ]), { x:5.45, y:1.75, w:7.35, h:5.0, valign:"top" });
  s.addNotes("Fórmula real C25H27N3O2S, PM ~433.6. Aclarar que la figura es ilustrativa. Farmacóforo: quinolinona + piperazina-benzotiofeno.");
})();

// ============================================================
// SLIDE 6 — CLASIFICACIÓN FARMACOLÓGICA
// ============================================================
(() => {
  const s = p.addSlide(); bg(s, WHITE);
  header(s, 5, "Clasificación farmacológica");
  framedImage(s, im.molecula, 7.55, 1.55, 5.25, 5.35);
  const cards = [
    ["Grupo","Antipsicótico atípico (segunda generación)."],
    ["Subclase funcional","Modulador de actividad serotonina-dopamina (SDAM)."],
    ["Clase ATC","N05AX16 — Otros antipsicóticos."],
    ["Mecanismo distintivo","Agonismo parcial D2/D3/5-HT1A + antagonismo 5-HT2A."],
  ];
  cards.forEach((c,i)=>{
    const yy = 1.6 + i*1.3;
    infoCard(s, 0.6, yy, 6.6, 1.12, c[0], [{text:c[1], options:{fontFace:BODY, fontSize:14.5, color:INK}}], { fill:LIGHT, ts:16 });
  });
  s.addNotes("Atípico de 2.ª generación. Concepto SDAM. ATC N05AX16. La firma es el agonismo parcial combinado con antagonismo 5-HT2A.");
})();

// ============================================================
// SLIDE 7 — MECANISMO DE ACCIÓN (infografía)
// ============================================================
(() => {
  const s = p.addSlide(); bg(s, LIGHT);
  header(s, 6, "Mecanismo de acción");
  s.addShape(p.ShapeType.roundRect, { x:8.35, y:1.5, w:4.45, h:5.45, rectRadius:0.05, fill:{color:WHITE}, line:{color:"D9E2F5",width:1}, shadow:shadow() });
  s.addImage({ path: im.mecInfo, x:8.55, y:1.62, w:4.05, h:5.2, sizing:{type:"contain", w:4.05, h:5.2} });
  s.addText(bullets([
    { t:"Agonista parcial de alta afinidad en receptores D2 y D3: normaliza el tono dopaminérgico — reduce la hiperactividad mesolímbica sin bloqueo excesivo.", },
    { t:"Agonista parcial 5-HT1A: efecto ansiolítico, antidepresivo y procognitivo; favorece la tolerabilidad motora.", },
    { t:"Antagonista potente 5-HT2A: mejora síntomas negativos y reduce el riesgo de síntomas extrapiramidales.", },
    { t:"Antagonismo α1B y α2C adrenérgico: modula ánimo y respuesta de estrés.", },
    { t:"Menor actividad intrínseca en D2 que el aripiprazol → menos activación, acatisia e inquietud.", b:true, o:{color:NAVY} },
  ]), { x:0.6, y:1.6, w:7.55, h:5.2, valign:"top" });
  s.addNotes("Mecanismo integral SDAM: agonismo parcial D2/D3/5-HT1A + antagonismo 5-HT2A/α. Menor actividad intrínseca D2 que aripiprazol es el diferencial clínico.");
})();

// ============================================================
// SLIDE 8 — FARMACODINAMIA (cerebro)
// ============================================================
(() => {
  const s = p.addSlide(); bg(s, NAVYD);
  header(s, 7, "Farmacodinamia: el modelo de tres pilares", { dark:true });
  s.addImage({ path: im.mecCerebro, x:0, y:1.45, w:6.7, h:6.05, sizing:{type:"cover", w:6.7, h:6.05} });
  const pil = [
    ["D2 / D3","Agonismo parcial","Estabiliza la dopamina: antipsicótico sin bloqueo total."],
    ["5-HT1A","Agonismo parcial","Ansiolítico, antidepresivo y neuroprotector motor."],
    ["5-HT2A","Antagonismo","Mejora síntomas negativos y reduce el riesgo extrapiramidal."],
  ];
  pil.forEach((c,i)=>{
    const yy = 1.75 + i*1.65;
    s.addShape(p.ShapeType.roundRect, { x:7.0, y:yy, w:5.85, h:1.45, rectRadius:0.07, fill:{color:"1E2A57"}, line:{color:ACCENT,width:1} });
    s.addText(c[0], { x:7.2, y:yy+0.16, w:1.85, h:1.15, fontFace:HEAD, bold:true, fontSize:24, color:ICE, valign:"middle", align:"center" });
    s.addText([
      { text:c[1], options:{ fontFace:HEAD, bold:true, fontSize:14, color:WHITE, breakLine:true, paraSpaceAfter:3 } },
      { text:c[2], options:{ fontFace:BODY, fontSize:13, color:ICE } },
    ], { x:9.05, y:yy+0.14, w:3.7, h:1.2, valign:"middle" });
  });
  s.addNotes("Los tres pilares: agonismo parcial D2/D3, agonismo parcial 5-HT1A, antagonismo 5-HT2A. Concepto de 'sintonización' de circuitos límbico y cortical.");
})();

// ============================================================
// SLIDE 9 — PERFIL DE AFINIDAD RECEPTORIAL (tabla)
// ============================================================
(() => {
  const s = p.addSlide(); bg(s, WHITE);
  header(s, 8, "Perfil de afinidad receptorial");
  framedImage(s, im.molecula2, 8.75, 1.9, 4.05, 4.15);
  const rows = [
    ["Receptor","Ki (nM)","Acción"],
    ["5-HT1A","0,12","Agonista parcial"],
    ["D2","0,30","Agonista parcial"],
    ["D3","1,10","Agonista parcial"],
    ["5-HT2A","0,47","Antagonista"],
    ["α1B","0,17","Antagonista"],
    ["α2C","0,59","Antagonista"],
  ];
  const tblX=0.6, tblY=1.7, colW=[2.6,1.9,3.0], rowH=0.62;
  rows.forEach((r,ri)=>{
    const head = ri===0;
    let x=tblX;
    r.forEach((cell,ci)=>{
      s.addShape(p.ShapeType.rect, { x, y:tblY+ri*rowH, w:colW[ci], h:rowH,
        fill:{ color: head?NAVY:(ri%2? "EEF3FC":WHITE) }, line:{color:"D9E2F5",width:1} });
      s.addText(cell, { x:x+0.1, y:tblY+ri*rowH, w:colW[ci]-0.2, h:rowH, valign:"middle",
        align: ci===0?"left":"center", fontFace: head?HEAD:BODY, bold: head||ci===0, fontSize: head?13.5:13,
        color: head?WHITE:INK, margin:0 });
      x+=colW[ci];
    });
  });
  s.addText("Valores de Ki aproximados; afinidad subnanomolar en los sitios clave. Menor Ki = mayor afinidad.", {
    x:0.6, y:6.35, w:7.9, h:0.5, fontFace:BODY, italic:true, fontSize:11, color:MUTE });
  s.addNotes("Afinidad subnanomolar/nanomolar en 5-HT1A, D2, 5-HT2A y α1B. Recalcar el equilibrio 5-HT2A>D2 y la fuerte ocupación α que explica el perfil.");
})();

// ============================================================
// SLIDE 10 — FARMACOCINÉTICA (ADME)
// ============================================================
(() => {
  const s = p.addSlide(); bg(s, LIGHT);
  header(s, 9, "Farmacocinética (ADME)");
  // 4 stat cards top
  const stats = [
    ["≈95%","Biodisponibilidad oral"],
    ["4 h","Tmax plasmático"],
    [">99%","Unión a proteínas"],
    ["≈91 h","Semivida de eliminación"],
  ];
  stats.forEach((st,i)=>{
    const x = 0.6 + i*3.08;
    s.addShape(p.ShapeType.roundRect, { x, y:1.55, w:2.85, h:1.55, rectRadius:0.08, fill:{color:WHITE}, line:{color:"D9E2F5",width:1}, shadow:shadow() });
    s.addText(st[0], { x, y:1.7, w:2.85, h:0.8, align:"center", fontFace:HEAD, bold:true, fontSize:32, color:ACCENT, margin:0 });
    s.addText(st[1], { x:x+0.1, y:2.5, w:2.65, h:0.5, align:"center", fontFace:BODY, fontSize:12, color:MUTE, margin:0 });
  });
  framedImage(s, im.molBlanca, 8.9, 3.55, 3.9, 3.35);
  s.addText(bullets([
    { t:"Absorción: buena por vía oral; sin efecto clínicamente relevante de los alimentos.", },
    { t:"Distribución: amplia; unión a albúmina y α1-glicoproteína ácida >99%.", },
    { t:"Metabolismo: hepático por CYP3A4 y CYP2D6 → metabolito DM-3411 (sin contribución clínica relevante).", },
    { t:"Estado estacionario en 10–12 días; semivida larga que permite dosis única diaria.", },
    { t:"Eliminación: heces ≈46%, orina ≈25%.", },
  ]), { x:0.6, y:3.4, w:8.05, h:3.5, valign:"top" });
  s.addNotes("ADME: biodisp. ~95%, Tmax 4h, unión >99%, t½ ~91h (estado estable 10-12 días). Metabolismo CYP3A4/2D6. Clave para interacciones y ajuste en metabolizadores lentos.");
})();

// ============================================================
// SLIDE 11 — INDICACIONES APROBADAS
// ============================================================
(() => {
  const s = p.addSlide(); bg(s, WHITE);
  header(s, 10, "Indicaciones aprobadas");
  s.addShape(p.ShapeType.roundRect, { x:8.4, y:1.5, w:4.4, h:5.45, rectRadius:0.05, fill:{color:LIGHT}, line:{color:"D9E2F5",width:1}, shadow:shadow() });
  s.addImage({ path: im.indicac, x:8.6, y:1.72, w:4.0, h:5.0, sizing:{type:"contain", w:4.0, h:5.0} });
  const ind = [
    ["Esquizofrenia","Monoterapia en adultos; también estudiada para el mantenimiento a largo plazo."],
    ["Depresión mayor (TDM)","Tratamiento adyuvante a antidepresivos en respuesta inadecuada."],
    ["Agitación en Alzheimer","Agitación asociada a la demencia de Alzheimer (aprobación FDA 2023)."],
  ];
  ind.forEach((c,i)=>{
    const yy = 1.65 + i*1.72;
    s.addShape(p.ShapeType.ellipse, { x:0.6, y:yy, w:0.7, h:0.7, fill:{color: i===2?GOLD:ACCENT} });
    s.addText(String(i+1), { x:0.6, y:yy, w:0.7, h:0.7, align:"center", valign:"middle", fontFace:HEAD, bold:true, fontSize:22, color:WHITE });
    s.addText([
      { text:c[0], options:{ fontFace:HEAD, bold:true, fontSize:19, color:NAVY, breakLine:true, paraSpaceAfter:4 } },
      { text:c[1], options:{ fontFace:BODY, fontSize:14.5, color:INK } },
    ], { x:1.5, y:yy-0.05, w:6.7, h:1.5, valign:"top" });
  });
  s.addNotes("Tres indicaciones: esquizofrenia, TDM adyuvante y agitación en Alzheimer (2023). Enfatizar que la agitación en demencia mantiene la advertencia de mortalidad.");
})();

// ============================================================
// SLIDE 12 — ESQUIZOFRENIA (evidencia)
// ============================================================
(() => {
  const s = p.addSlide(); bg(s, LIGHT);
  header(s, 11, "Esquizofrenia: evidencia clínica");
  framedImage(s, im.cerebroNeu, 8.55, 1.6, 4.25, 4.15);
  s.addText(bullets([
    { t:"Ensayos pivotales de fase 3 (p. ej. VECTOR y BEACON), doble ciego y controlados con placebo, a 6 semanas.", },
    { t:"Reducción significativa de la puntuación total PANSS con 2–4 mg/día frente a placebo.", },
    { t:"Mejoría también en la escala CGI-S de gravedad global.", },
    { t:"Estudios de mantenimiento: prolongación significativa del tiempo hasta la recaída.", },
    { t:"Baja incidencia de acatisia y buen perfil de tolerabilidad a largo plazo.", },
  ]), { x:0.6, y:1.65, w:7.75, h:3.6, valign:"top" });
  stat(s, 0.6, 5.55, 2.55, "2–4 mg", "Dosis eficaz/día", { fs:34 });
  stat(s, 3.25, 5.55, 2.55, "6 sem", "Ensayos pivotales", { fs:34, color:NAVY });
  stat(s, 5.9, 5.55, 2.55, "↓ PANSS", "Desenlace primario", { fs:30, color:GOLD });
  s.addNotes("Fase 3 a 6 semanas: reducción PANSS con 2-4 mg. Mantenimiento: mayor tiempo a recaída. Tolerabilidad motora favorable.");
})();

// ============================================================
// SLIDE 13 — TDM ADYUVANTE
// ============================================================
(() => {
  const s = p.addSlide(); bg(s, WHITE);
  header(s, 12, "Depresión mayor: terapia adyuvante");
  framedImage(s, im.manoRx, 0.6, 1.6, 5.35, 5.3);
  s.addText(bullets([
    { t:"Indicado como complemento del antidepresivo cuando la respuesta es inadecuada.", },
    { t:"Ensayos pivotales (PYXIS/POLARIS): reducción significativa de la escala MADRS frente a antidepresivo + placebo.", },
    { t:"Dosis objetivo habitual: 2 mg/día (rango 1–3 mg).", },
    { t:"Beneficio sobre síntomas depresivos residuales con inicio de acción en las primeras semanas.", },
    { t:"Vigilar acatisia, aumento de peso y somnolencia como efectos más frecuentes en este contexto.", },
  ]), { x:6.25, y:1.65, w:6.55, h:4.0, valign:"top" });
  stat(s, 6.25, 5.75, 3.1, "+ADT", "Adyuvante, no monoterapia", { fs:30, color:ACCENT });
  stat(s, 9.55, 5.75, 3.1, "1–3 mg", "Rango de dosis", { fs:32, color:NAVY });
  s.addNotes("Adyuvante en TDM con respuesta parcial. MADRS mejora frente a placebo. Dosis diana 2 mg. Advertencia de suicidalidad en jóvenes por el contexto antidepresivo.");
})();

// ============================================================
// SLIDE 14 — AGITACIÓN EN ALZHEIMER
// ============================================================
(() => {
  const s = p.addSlide(); bg(s, LIGHT);
  header(s, 13, "Agitación en la demencia de Alzheimer");
  framedImage(s, im.molCerebro, 8.55, 1.6, 4.25, 4.2);
  s.addText([
    { text:"Primer y único fármaco con indicación aprobada por la FDA (2023) para esta condición.", options:{ fontFace:HEAD, bold:true, fontSize:15.5, color:NAVY, breakLine:true, paraSpaceAfter:8 } },
  ], { x:0.6, y:1.55, w:7.75, h:0.6 });
  s.addText(bullets([
    { t:"Dos ensayos de fase 3: reducción significativa del Cohen-Mansfield Agitation Inventory (CMAI).", },
    { t:"Dosis objetivo de 2–3 mg/día tras titulación gradual.", },
    { t:"Aborda una necesidad no cubierta: la agitación es de las manifestaciones más angustiantes de la demencia.", },
    { t:"Persiste la advertencia enmarcada de mayor mortalidad en ancianos con psicosis por demencia.", b:true, o:{color:"9A2617"} },
  ]), { x:0.6, y:2.2, w:7.75, h:3.55, valign:"top" });
  stat(s, 0.6, 5.9, 3.6, "CMAI ↓", "Desenlace primario", { fs:30, color:GOLD });
  stat(s, 4.4, 5.9, 3.6, "2–3 mg", "Dosis diana/día", { fs:32, color:NAVY });
  s.addNotes("Aprobación 2023, primera en su clase para agitación en Alzheimer. CMAI mejora. Balance beneficio-riesgo individualizado; mantiene boxed warning de mortalidad.");
})();

// ============================================================
// SLIDE 14B — TRASTORNOS DE LA CONDUCTA
// ============================================================
(() => {
  const s = p.addSlide(); bg(s, WHITE);
  header(s, 14, "Brexpiprazol y los trastornos de la conducta");
  framedImage(s, im.cerebroNeu, 8.55, 1.6, 4.25, 4.2);
  s.addText(bullets([
    { t:"Los trastornos de la conducta agrupan patrones persistentes de agresividad, impulsividad y transgresión de normas sociales.", },
    { t:"En el paciente psiquiátrico y en la demencia se expresan como agitación, hostilidad y conducta disruptiva.", },
    { t:"Racional SDAM: el equilibrio dopamina-serotonina (agonismo parcial D2/5-HT1A + antagonismo 5-HT2A) atenúa la impulsividad y la agresividad.", },
    { t:"Evidencia aprobada limitada a la agitación en la demencia de Alzheimer; otros usos conductuales son off-label y con evidencia emergente.", },
    { t:"No aprobado en el trastorno de conducta de niños y adolescentes; requiere valoración especializada.", b:true, o:{color:NAVY} },
  ]), { x:0.6, y:1.65, w:7.75, h:4.15, valign:"top" });
  infoCard(s, 0.6, 5.95, 7.75, 0.95, "Principio de uso",
    [{text:"Siempre como complemento de las intervenciones psicosociales de primera línea, iniciando a dosis bajas y con monitorización estrecha.", options:{fontFace:BODY, fontSize:13, color:INK}}],
    { fill:LIGHT, ts:14 });
  s.addNotes("Trastornos de la conducta: agresividad/impulsividad. Racional SDAM. Solo la agitación en Alzheimer está aprobada; el resto es off-label con evidencia limitada. No aprobado en conducta infanto-juvenil. Complemento de intervenciones psicosociales.");
})();

// ============================================================
// SLIDE 15 — POSOLOGÍA Y PRESENTACIONES
// ============================================================
(() => {
  const s = p.addSlide(); bg(s, WHITE);
  header(s, 15, "Posología y administración");
  framedImage(s, im.cajaRex, 8.5, 1.6, 4.3, 4.1);
  const rows = [
    ["Indicación","Inicio","Objetivo","Máx."],
    ["Esquizofrenia","1 mg (días 1–4)","2–4 mg","4 mg"],
    ["TDM (adyuvante)","0,5–1 mg","2 mg","3 mg"],
    ["Agitación/Alzheimer","0,5 mg (1.ª sem.)","2–3 mg","3 mg"],
  ];
  const tblX=0.6, tblY=1.7, colW=[2.55,1.95,1.55,1.3], rowH=0.68;
  rows.forEach((r,ri)=>{
    const head = ri===0; let x=tblX;
    r.forEach((cell,ci)=>{
      s.addShape(p.ShapeType.rect, { x, y:tblY+ri*rowH, w:colW[ci], h:rowH,
        fill:{ color: head?NAVY:(ri%2?"EEF3FC":WHITE) }, line:{color:"D9E2F5",width:1} });
      s.addText(cell, { x:x+0.08, y:tblY+ri*rowH, w:colW[ci]-0.16, h:rowH, valign:"middle",
        align: ci===0?"left":"center", fontFace: head?HEAD:BODY, bold: head||ci===0, fontSize:12.5,
        color: head?WHITE:INK, margin:0 });
      x+=colW[ci];
    });
  });
  s.addText(bullets([
    { t:"Una toma diaria, con o sin alimentos; titulación gradual para minimizar la acatisia.", s:13 },
    { t:"Comprimidos: 0,25 · 0,5 · 1 · 2 · 3 · 4 mg.", b:true, s:13 },
    { t:"Reducir dosis en insuficiencia hepática o renal moderada-grave.", s:13 },
  ]), { x:0.6, y:4.65, w:7.6, h:2.1, valign:"top" });
  s.addNotes("Titulación siempre gradual. Presentaciones 0,25–4 mg. Dosis única diaria. Ajuste en insuficiencia hepática/renal moderada-grave.");
})();

// ============================================================
// SLIDE 16 — FORMULACIONES / TITULACIÓN
// ============================================================
(() => {
  const s = p.addSlide(); bg(s, LIGHT);
  header(s, 16, "Titulación e individualización");
  framedImage(s, im.pastColor, 7.4, 1.6, 5.4, 5.3);
  s.addText(bullets([
    { t:"Amplio abanico de concentraciones (0,25–4 mg) que facilita una titulación fina y personalizada.", },
    { t:"Escalar despacio reduce la incidencia de acatisia e inquietud al inicio del tratamiento.", },
    { t:"Ajuste por farmacogenética: en metabolizadores lentos del CYP2D6, reducir la dosis a la mitad.", },
    { t:"Con inhibidores potentes de CYP3A4 o CYP2D6, reducir la dosis; con inductores de CYP3A4, aumentarla.", },
    { t:"La semivida larga favorece la adherencia y amortigua el impacto de una toma olvidada.", },
  ]), { x:0.6, y:1.7, w:6.55, h:5.0, valign:"top" });
  s.addNotes("Individualizar: rango de dosis amplio, titulación lenta, ajuste por CYP2D6/3A4. La t½ larga da margen frente a olvidos.");
})();

// ============================================================
// SLIDE 17 — REACCIONES ADVERSAS
// ============================================================
(() => {
  const s = p.addSlide(); bg(s, WHITE);
  header(s, 17, "Reacciones adversas");
  framedImage(s, im.pastGlass, 8.6, 1.65, 4.2, 3.6);
  const common = [
    ["Aumento de peso","Frecuente; vigilar parámetros metabólicos."],
    ["Acatisia","Dosis-dependiente; menor que con aripiprazol."],
    ["Somnolencia","Habitual al inicio; suele atenuarse."],
    ["Cefalea / nasofaringitis","Leves y transitorias."],
  ];
  common.forEach((c,i)=>{
    const yy = 1.65 + i*1.02;
    infoCard(s, 0.6, yy, 7.75, 0.88, c[0], [{text:c[1], options:{fontFace:BODY, fontSize:12.5, color:INK}}], { fill:LIGHT, ts:14.5, bs:13.5 });
  });
  s.addText([
    { text:"Perfil metabólico y cardiovascular", options:{ fontFace:HEAD, bold:true, fontSize:13.5, color:NAVY, breakLine:true, paraSpaceAfter:4 } },
    { text:"Efecto moderado sobre peso y lípidos; elevación discreta de prolactina; impacto mínimo sobre el intervalo QTc. Menor activación/insomnio que el aripiprazol.", options:{ fontFace:BODY, fontSize:13, color:INK } },
  ], { x:8.6, y:5.45, w:4.2, h:1.5, valign:"top" });
  s.addNotes("Más frecuentes: peso, acatisia (menor que aripiprazol), somnolencia, cefalea. QTc mínimo, prolactina discreta. Menos activación que aripiprazol.");
})();

// ============================================================
// SLIDE 18 — ADVERTENCIAS Y CONTRAINDICACIONES
// ============================================================
(() => {
  const s = p.addSlide(); bg(s, NAVYD);
  header(s, 18, "Advertencias y contraindicaciones", { dark:true });
  s.addImage({ path: im.manoRx, x:8.75, y:1.5, w:4.58, h:6.0, sizing:{type:"cover", w:4.58, h:6.0} });
  // boxed warning band
  s.addShape(p.ShapeType.roundRect, { x:0.6, y:1.55, w:7.85, h:1.35, rectRadius:0.07, fill:{color:"5A1712"}, line:{color:GOLD,width:1.5} });
  s.addText([
    { text:"ADVERTENCIA ENMARCADA (BOXED WARNING)", options:{ fontFace:HEAD, bold:true, fontSize:13.5, color:GOLD, breakLine:true, paraSpaceAfter:3 } },
    { text:"Mayor mortalidad en ancianos con psicosis por demencia. Riesgo de ideación/conducta suicida en jóvenes tratados con antidepresivos.", options:{ fontFace:BODY, fontSize:13, color:WHITE } },
  ], { x:0.85, y:1.68, w:7.35, h:1.1, valign:"middle" });
  s.addText(bullets([
    { t:"Síndrome neuroléptico maligno y discinesia tardía.", o:{color:WHITE} },
    { t:"Alteraciones metabólicas: hiperglucemia, dislipidemia, aumento de peso.", o:{color:WHITE} },
    { t:"Hipotensión ortostática, leucopenia/neutropenia, convulsiones y disfagia.", o:{color:WHITE} },
    { t:"Trastornos del control de impulsos (p. ej. ludopatía) y disregulación térmica.", o:{color:WHITE} },
    { t:"Contraindicado ante hipersensibilidad conocida al brexpiprazol.", b:true, o:{color:ICE} },
  ]), { x:0.6, y:3.15, w:7.85, h:3.9, valign:"top" });
  s.addNotes("Boxed warning: mortalidad en demencia y suicidalidad en jóvenes. Además SNM, discinesia tardía, metabólico, ortostatismo, impulsividad. Contraindicación: hipersensibilidad.");
})();

// ============================================================
// SLIDE 19 — INTERACCIONES Y POBLACIONES ESPECIALES
// ============================================================
(() => {
  const s = p.addSlide(); bg(s, LIGHT);
  header(s, 19, "Interacciones y poblaciones especiales");
  const left = [
    ["Inhibidores CYP3A4/CYP2D6","Reducir la dosis (a la mitad con inhibidores potentes)."],
    ["Inductores de CYP3A4","Aumentar la dosis (hasta duplicarla)."],
    ["Metabolizadores lentos CYP2D6","Reducir la dosis por mayor exposición."],
  ];
  const right = [
    ["Hepática/renal moderada-grave","Ajustar y reducir la dosis máxima."],
    ["Embarazo y lactancia","Valorar riesgo-beneficio; datos limitados."],
    ["Ancianos","Iniciar bajo y titular con precaución."],
  ];
  s.addText("Interacciones farmacológicas", { x:0.6, y:1.55, w:6.0, h:0.4, fontFace:HEAD, bold:true, fontSize:16, color:ACCENT });
  left.forEach((c,i)=> infoCard(s, 0.6, 2.05+i*1.55, 5.95, 1.35, c[0], [{text:c[1], options:{fontFace:BODY, fontSize:12.5, color:INK}}], { fill:WHITE, ts:14 }));
  s.addText("Poblaciones especiales", { x:6.8, y:1.55, w:6.0, h:0.4, fontFace:HEAD, bold:true, fontSize:16, color:ACCENT });
  right.forEach((c,i)=> infoCard(s, 6.8, 2.05+i*1.55, 5.95, 1.35, c[0], [{text:c[1], options:{fontFace:BODY, fontSize:12.5, color:INK}}], { fill:WHITE, ts:14 }));
  s.addNotes("Interacciones dominadas por CYP3A4/2D6: reducir con inhibidores y en metabolizadores lentos; aumentar con inductores. Ajustar en hepatopatía/nefropatía y ancianos.");
})();

// ============================================================
// SLIDE 20 — POSICIONAMIENTO / vs ARIPIPRAZOL
// ============================================================
(() => {
  const s = p.addSlide(); bg(s, WHITE);
  header(s, 20, "Posicionamiento: brexpiprazol vs aripiprazol");
  framedImage(s, im.escritorio, 8.5, 1.7, 4.3, 3.65);
  const rows = [
    ["Atributo","Brexpiprazol","Aripiprazol"],
    ["Actividad intrínseca D2","Menor","Mayor"],
    ["Acatisia / activación","Menor","Mayor"],
    ["Antagonismo 5-HT2A","Más potente","Menor"],
    ["Somnolencia / peso","Algo mayor","Menor"],
  ];
  const tblX=0.6, tblY=1.7, colW=[2.85,2.35,2.35], rowH=0.66;
  rows.forEach((r,ri)=>{
    const head = ri===0; let x=tblX;
    r.forEach((cell,ci)=>{
      s.addShape(p.ShapeType.rect, { x, y:tblY+ri*rowH, w:colW[ci], h:rowH,
        fill:{ color: head?NAVY:(ri%2?"EEF3FC":WHITE) }, line:{color:"D9E2F5",width:1} });
      s.addText(cell, { x:x+0.08, y:tblY+ri*rowH, w:colW[ci]-0.16, h:rowH, valign:"middle",
        align: ci===0?"left":"center", fontFace: head?HEAD:BODY, bold: head||ci===0, fontSize:12.5,
        color: head?WHITE:INK, margin:0 });
      x+=colW[ci];
    });
  });
  s.addText([
    { text:"Idea clave:  ", options:{ fontFace:HEAD, bold:true, fontSize:13.5, color:NAVY } },
    { text:"la menor actividad intrínseca D2 hace del brexpiprazol una opción con perfil de tolerabilidad motora más favorable, útil en pacientes sensibles a la acatisia o la activación.", options:{ fontFace:BODY, fontSize:14, color:INK } },
  ], { x:0.6, y:5.55, w:7.6, h:1.3, valign:"top" });
  s.addNotes("Frente a aripiprazol: menor actividad intrínseca D2, menos acatisia/activación, mayor antagonismo 5-HT2A; a cambio, algo más de somnolencia/peso. Elegir según el paciente.");
})();

// ============================================================
// SLIDE 21 — PERLAS CLÍNICAS
// ============================================================
(() => {
  const s = p.addSlide(); bg(s, LIGHT);
  header(s, 21, "Perlas clínicas para la práctica");
  framedImage(s, im.lab, 8.55, 1.6, 4.25, 4.2);
  const pearls = [
    "Titular siempre de forma gradual: es la mejor estrategia frente a la acatisia inicial.",
    "Monitorizar peso, glucemia y lípidos al inicio y periódicamente.",
    "Revisar el perfil farmacogenético/interacciones (CYP2D6 y CYP3A4) antes de fijar la dosis.",
    "La semivida larga aporta estabilidad plasmática y tolera bien los olvidos ocasionales.",
    "En agitación por demencia, individualizar y reevaluar el balance beneficio-riesgo.",
  ];
  pearls.forEach((t,i)=>{
    const yy = 1.65 + i*1.02;
    s.addShape(p.ShapeType.ellipse, { x:0.6, y:yy, w:0.55, h:0.55, fill:{color: i%2?NAVY:ACCENT} });
    s.addText("✓", { x:0.6, y:yy, w:0.55, h:0.55, align:"center", valign:"middle", fontFace:BODY, bold:true, fontSize:18, color:WHITE });
    s.addText(t, { x:1.3, y:yy-0.05, w:6.95, h:0.95, valign:"middle", fontFace:BODY, fontSize:14.5, color:INK });
  });
  s.addNotes("Cinco perlas: titulación gradual, monitorización metabólica, interacciones CYP, ventaja de t½ larga, individualización en demencia.");
})();

// ============================================================
// SLIDE 22 — CONCLUSIÓN
// ============================================================
(() => {
  const s = p.addSlide(); bg(s, NAVYD);
  s.addImage({ path: im.molecula2, x:8.7, y:0, w:4.63, h:7.5, sizing:{type:"cover", w:4.63, h:7.5} });
  s.addShape(p.ShapeType.rect, { x:8.7, y:0, w:4.63, h:7.5, fill:{color:NAVYD, transparency:35} });
  s.addText("Conclusión", { x:0.7, y:0.7, w:7.6, h:0.9, fontFace:HEAD, bold:true, fontSize:38, color:WHITE });
  s.addText(bullets([
    { t:"El brexpiprazol es un antipsicótico atípico de nueva generación (SDAM) que estabiliza los sistemas dopaminérgico y serotoninérgico.", o:{color:ICE} },
    { t:"Su menor actividad intrínseca D2 se traduce en eficacia antipsicótica con menor acatisia y activación.", o:{color:ICE} },
    { t:"Cuenta con evidencia sólida en esquizofrenia, como adyuvante en depresión mayor y, desde 2023, en la agitación por Alzheimer.", o:{color:ICE} },
    { t:"Perfil de seguridad manejable con titulación gradual y monitorización metabólica adecuada.", o:{color:ICE} },
    { t:"Herramienta valiosa cuando se selecciona e individualiza correctamente al paciente.", b:true, o:{color:WHITE} },
  ]), { x:0.7, y:1.85, w:7.55, h:5.2, valign:"top" });
  s.addNotes("Síntesis: SDAM eficaz y con tolerabilidad motora favorable, tres indicaciones con evidencia, seguridad manejable. Su valor depende de la individualización.");
})();

// ============================================================
// SLIDE 23 — REFERENCIAS BIBLIOGRÁFICAS
// ============================================================
(() => {
  const s = p.addSlide(); bg(s, WHITE);
  header(s, 22, "Referencias bibliográficas");
  const refs = [
    "Otsuka America Pharmaceutical. Rexulti® (brexpiprazol): Información de prescripción (Prescribing Information). 2023.",
    "Maeda K, et al. Brexpiprazole I: In vitro and in vivo characterization of a novel serotonin-dopamine activity modulator. J Pharmacol Exp Ther. 2014;350(3):589–604.",
    "Citrome L. Brexpiprazole: a new dopamine–serotonin system stabilizer. Int J Clin Pract. 2015;69(9):978–997.",
    "Correll CU, et al. Efficacy and safety of brexpiprazole for the treatment of schizophrenia. Am J Psychiatry. 2015;172(9):870–880.",
    "Kane JM, et al. A multicenter, randomized, double-blind trial of brexpiprazole in schizophrenia. Schizophr Res. 2015;164(1–3):127–135.",
    "Thase ME, et al. Adjunctive brexpiprazole in major depressive disorder (PYXIS/POLARIS). J Clin Psychiatry. 2015;76(9):1224–1231.",
    "Grossberg GT, et al. Brexpiprazole for agitation associated with Alzheimer's dementia: phase 3 trial. Am J Geriatr Psychiatry. 2020;28(4):383–400.",
    "Lee D, et al. Brexpiprazole for the treatment of agitation in Alzheimer dementia. JAMA Neurol. 2023;80(12):1307–1316.",
    "Stahl SM. Mechanism of action of brexpiprazole: comparison with aripiprazole. CNS Spectr. 2016;21(1):1–6.",
    "U.S. FDA. Approval of Rexulti for agitation associated with dementia due to Alzheimer's disease. 2023.",
  ];
  const half = 5;
  const colItems = [refs.slice(0,half), refs.slice(half)];
  colItems.forEach((col, ci)=>{
    const x = 0.6 + ci*6.35;
    s.addText(col.map((r,i)=>({
      text: `${ci*half+i+1}.  ${r}`,
      options:{ fontFace:BODY, fontSize:12.5, color:INK, breakLine:true, paraSpaceAfter:10 }
    })), { x, y:1.6, w:6.05, h:5.4, valign:"top" });
  });
  s.addNotes("Fuentes primarias: ficha técnica de Rexulti, estudios de Maeda/Citrome/Correll/Thase/Grossberg/Lee y revisiones de Stahl. Referencias formativas.");
})();

// ============================================================
// SLIDE 24 — DESPEDIDA
// ============================================================
(() => {
  const s = p.addSlide(); bg(s, NAVYD);
  s.addImage({ path: im.cerebroLuz, x:0, y:0, w:W, h:H, sizing:{type:"cover", w:W, h:H} });
  s.addShape(p.ShapeType.rect, { x:0, y:0, w:W, h:H, fill:{color:NAVYD, transparency:30} });
  s.addText("¡Gracias por su atención!", { x:0.8, y:2.5, w:11.7, h:1.1, align:"center", fontFace:HEAD, bold:true, fontSize:44, color:WHITE });
  s.addText("Preguntas y discusión clínica", { x:0.8, y:3.7, w:11.7, h:0.6, align:"center", fontFace:BODY, italic:true, fontSize:20, color:ICE });
  s.addShape(p.ShapeType.rect, { x:4.9, y:4.6, w:3.53, h:0.02, fill:{color:ICE} });
  s.addText([
    { text:"Dra. Heydi Trujillo", options:{ fontFace:HEAD, bold:true, fontSize:22, color:WHITE, breakLine:true, paraSpaceAfter:3 } },
    { text:"Médico Psiquiatra", options:{ fontFace:BODY, fontSize:15, color:ICE } },
  ], { x:0.8, y:4.85, w:11.7, h:1.2, align:"center", valign:"top" });
  s.addNotes("Cierre y agradecimiento. Abrir espacio a preguntas y discusión de casos.");
})();

p.writeFile({ fileName: "Brexpiprazol_Presentacion_Dra_Heydi_Trujillo.pptx" }).then(f => console.log("Saved:", f));
