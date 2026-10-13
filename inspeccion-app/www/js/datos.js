// Estructura del informe: copiada de la plantilla Word
// "Informe de inspección de vivienda nueva".

var AREAS = [
  { letra: 'A', nombre: 'Exteriores y fachada', items: [
    'Pintura y acabado de fachada',
    'Aceras, andenes y accesos',
    'Pendientes y drenaje pluvial del terreno',
    'Portón, cerca o muro perimetral',
    'Cochera / estacionamiento'
  ] },
  { letra: 'B', nombre: 'Techo y cubierta', items: [
    'Láminas o cubierta: fijación y traslapes',
    'Canales, bajantes y botaguas',
    'Cielo falso: nivelación, juntas y manchas',
    'Fascias y aleros',
    'Indicios de filtración'
  ] },
  { letra: 'C', nombre: 'Muros y elementos estructurales visibles', items: [
    'Fisuras o grietas en paredes',
    'Plomo y alineación de paredes',
    'Columnas, vigas y dinteles visibles',
    'Repellos y afinados',
    'Humedad en la base de los muros'
  ] },
  { letra: 'D', nombre: 'Pisos y enchapes', items: [
    'Nivelación y planitud del piso',
    'Piezas sueltas, huecas, quebradas o desalineadas',
    'Fraguas y sisas',
    'Rodapié / zócalo',
    'Enchape de paredes (baños y cocina)'
  ] },
  { letra: 'E', nombre: 'Puertas y ventanas', items: [
    'Puertas: plomo, cierre, holgura y herrajes',
    'Cerraduras y llaves (completas)',
    'Ventanas: apertura, cierre y hermeticidad',
    'Vidrios: fisuras, rayones o sellado',
    'Verjas / protectores'
  ] },
  { letra: 'F', nombre: 'Cocina', items: [
    'Mueble de cocina: puertas, gavetas y bisagras',
    'Sobre o cubierta: sellado y nivelación',
    'Lavatrastos: llave, desagüe y fugas',
    'Tomas de cocina y extractor'
  ] },
  { letra: 'G', nombre: 'Baños', items: [
    'Inodoro: fijación, descarga y fugas',
    'Lavamanos: llave, sifón y fugas',
    'Ducha: presión, pendiente y desagüe',
    'Sellado de juntas (silicón) y accesorios',
    'Ventilación'
  ] },
  { letra: 'H', nombre: 'Instalaciones eléctricas', items: [
    'Panel o centro de carga: identificación de circuitos',
    'Tomacorrientes: funcionamiento y polaridad',
    'Apagadores y luminarias',
    'Puesta a tierra visible',
    'Placas, tapas y acabados'
  ] },
  { letra: 'I', nombre: 'Instalaciones hidrosanitarias', items: [
    'Presión de agua en todos los puntos',
    'Fugas visibles en tuberías y llaves',
    'Desagües: flujo y prueba con agua',
    'Cajas de registro',
    'Tanque o cisterna (si aplica)',
    'Calentador de agua (si aplica)'
  ] },
  { letra: 'J', nombre: 'Acabados interiores y pintura', items: [
    'Pintura: uniformidad, manchas y retoques',
    'Closets y muebles fijos',
    'Limpieza general de la obra',
    'Escaleras y barandas (si aplica)'
  ] },
  // K se llena con los ítems propios de cada inspección.
  { letra: 'K', nombre: 'Otros elementos', items: [] }
];

var PRIORIDADES = {
  A: { nombre: 'Alta', orden: 0, texto: 'Afecta seguridad, funcionamiento o causa daño (filtraciones, fallas eléctricas). Corregir antes de recibir.' },
  M: { nombre: 'Media', orden: 1, texto: 'Afecta el uso o la durabilidad. Corregir antes de la entrega final.' },
  B: { nombre: 'Baja', orden: 2, texto: 'Detalle estético o de acabado. Corregir en el plazo acordado.' }
};

var ESTADOS = {
  C: { nombre: 'C — Conforme', texto: 'Cumple; no requiere acción.' },
  O: { nombre: 'O — Observado', texto: 'Presenta defecto o pendiente; requiere corrección del constructor.' },
  NA: { nombre: 'N/A — No aplica', texto: 'El elemento no existe o no fue accesible.' }
};

var ALCANCE = [
  'La inspección es visual y funcional, realizada en una sola visita, sobre los elementos accesibles en la fecha indicada. Comprende acabados, puertas y ventanas, cubierta, instalaciones eléctricas e hidrosanitarias (prueba de funcionamiento) y estado general de la obra.',
  'No incluye pruebas destructivas, ensayos de laboratorio, revisión de cálculos estructurales, verificación de permisos ni de cumplimiento normativo. Este informe no constituye dictamen estructural ni peritaje legal.',
  'Los vicios ocultos o defectos que no sean visibles o no se manifiesten durante la visita quedan fuera del alcance. Se recomienda una visita de verificación una vez que el constructor reporte corregidos los pendientes.'
];

var CONCLUSIONES = {
  apta: { titulo: 'Apta para recibir', texto: 'Apta para recibir: no se identificaron pendientes relevantes.' },
  pendientes: { titulo: 'Apta para recibir con pendientes', texto: 'Apta para recibir con pendientes: corregir los ítems de prioridad Media y Baja en el plazo acordado.' },
  no: { titulo: 'No se recomienda recibir', texto: 'No se recomienda recibir: existen pendientes de prioridad Alta que deben corregirse antes de la entrega.' }
};

var USOS = {
  respaldo: 'Respaldo del cliente',
  constructor: 'Entrega al constructor',
  banco: 'Banco',
  otro: 'Otro'
};

var AJUSTES_INICIALES = {
  nombre: 'Arq. Rodrigo José Rodríguez Moraga',
  lema: 'Arquitectura · Inspección y supervisión de obras',
  ciudad: 'Managua, Nicaragua',
  telefono: '',
  correo: 'rjrm0483@gmail.com',
  cedula: '',
  logo: null,       // null = logo incluido en la app
  firma: null       // firma guardada del inspector (PNG)
};
