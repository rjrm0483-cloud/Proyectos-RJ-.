// Almacenamiento en el teléfono (IndexedDB). Funciona sin internet.
// - inspecciones: un registro por informe (sin las fotos)
// - fotos: cada foto aparte, enlazada a su inspección y a su ítem
// - ajustes: datos del inspector, logo y firma

var DB = (function () {
  var conexion = null;

  function abrir() {
    if (conexion) return Promise.resolve(conexion);
    return new Promise(function (ok, mal) {
      var pet = indexedDB.open('inspeccion-vivienda', 1);
      pet.onupgradeneeded = function () {
        var db = pet.result;
        db.createObjectStore('inspecciones', { keyPath: 'id' });
        var fotos = db.createObjectStore('fotos', { keyPath: 'id' });
        fotos.createIndex('inspId', 'inspId');
        db.createObjectStore('ajustes');
      };
      pet.onsuccess = function () { conexion = pet.result; ok(conexion); };
      pet.onerror = function () { mal(pet.error); };
    });
  }

  function tx(almacen, modo, fn) {
    return abrir().then(function (db) {
      return new Promise(function (ok, mal) {
        var t = db.transaction(almacen, modo);
        var s = t.objectStore(almacen);
        var res;
        var pet = fn(s);
        if (pet) pet.onsuccess = function () { res = pet.result; };
        t.oncomplete = function () { ok(res); };
        t.onerror = function () { mal(t.error); };
        t.onabort = function () { mal(t.error || new Error('Operación cancelada')); };
      });
    });
  }

  return {
    listar: function () {
      return tx('inspecciones', 'readonly', function (s) { return s.getAll(); })
        .then(function (l) { return (l || []).sort(function (a, b) { return b.creado - a.creado; }); });
    },
    obtener: function (id) {
      return tx('inspecciones', 'readonly', function (s) { return s.get(id); });
    },
    guardar: function (insp) {
      insp.actualizado = Date.now();
      return tx('inspecciones', 'readwrite', function (s) { return s.put(insp); });
    },
    borrar: function (id) {
      return DB.fotosDe(id).then(function (fotos) {
        return tx('fotos', 'readwrite', function (s) {
          fotos.forEach(function (f) { s.delete(f.id); });
        });
      }).then(function () {
        return tx('inspecciones', 'readwrite', function (s) { return s.delete(id); });
      });
    },
    fotosDe: function (inspId) {
      return tx('fotos', 'readonly', function (s) { return s.index('inspId').getAll(inspId); })
        .then(function (l) { return (l || []).sort(function (a, b) { return a.ts - b.ts; }); });
    },
    guardarFoto: function (foto) {
      return tx('fotos', 'readwrite', function (s) { return s.put(foto); });
    },
    borrarFoto: function (id) {
      return tx('fotos', 'readwrite', function (s) { return s.delete(id); });
    },
    leerAjuste: function (clave) {
      return tx('ajustes', 'readonly', function (s) { return s.get(clave); });
    },
    guardarAjuste: function (clave, valor) {
      return tx('ajustes', 'readwrite', function (s) { return s.put(valor, clave); });
    }
  };
})();
