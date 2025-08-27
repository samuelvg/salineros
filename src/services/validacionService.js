// =================================
// Archivo: src/services/validacionService.js
// Validación robusta + Sanitización selectiva con lista blanca
// =================================

/**
 * Regex compiladas una sola vez (rendimiento + consistencia)
 */
const PATRON_TITULO_UNICODE = /^[\p{L}\p{M}\p{N}\s._,:;!?'"\-()&/+\[\]«»–—]+$/u;
// URL sin espacios/quotes al final
const PATRON_URL = /^https?:\/\/[^\s"']+$/i;
// Acordes musicales (flexible, acepta #/b, sufijos habituales y bajos con "/")
const PATRON_ACORDE_FLEX = /^([A-G](#|b|♯|♭)?(maj|min|m|dim|aug|sus|add|°|ø|Δ|M|-)?(7|9|11|13|6|4|2)?(#|b|♯|♭)?(5|9|11|13)?\/?([A-G](#|b|♯|♭)?)?(\(.*\))?)$/i;

export class ValidacionService {
  // ============================
  // Reglas y mensajes
  // ============================
  static reglas = {
    titulo: {
      requerido: true,
      minLongitud: 2,
      maxLongitud: 100,
      patron: PATRON_TITULO_UNICODE
    },
    letra: {
      requerido: true,
      minLongitud: 10,
      maxLongitud: 10000
    },
    acordes: {
      requerido: false,
      maxLongitud: 5000,
      // Para comprobación macro: detectar [ ... ] en el bloque
      patronAcordes: /\[[^\]]+\]/g
    },
    melodia: {
      requerido: false,
      maxLongitud: 2000
    },
    audios: {
      requerido: false,
      maxLongitud: 3000,
      patronURL: PATRON_URL
    },
    etiquetas: {
      requerido: false,
      maxEtiquetas: 10,
      maxLongitudEtiqueta: 20
    }
  };

  static mensajes = {
    requerido: 'Este campo es obligatorio',
    minLongitud: 'Debe tener al menos {min} caracteres',
    maxLongitud: 'No puede exceder {max} caracteres',
    patron: 'Contiene caracteres no válidos',
    patronAcordes: 'Los acordes deben estar entre corchetes [C], [Am7], [F#maj7], etc.',
    patronURL: 'Debe ser una URL válida (http:// o https://)',
    maxEtiquetas: 'Máximo {max} etiquetas permitidas',
    maxLongitudEtiqueta: 'Cada etiqueta debe tener máximo {max} caracteres'
  };

  // ============================
  // Campos con HTML permitido y lista blanca por campo
  // ============================
  static camposConHTML = [
    'letra',    // Permitir <strong>, <em>, <br>, etc. en las letras
    'acordes',  // Permitir HTML mínimo si lo usas para formateo
    'melodia'
  ]; // quitando 'audios'    // Permitir <audio>, <video>, <iframe>, <a>, etc.

  static etiquetasPermitidas = {
    letra: ['strong', 'b', 'em', 'i', 'u', 'br', 'p', 'span', 'div'],
    acordes: ['strong', 'b', 'em', 'i', 'br', 'span', 'div'],
    melodia: ['strong', 'b', 'em', 'i', 'br', 'p', 'span', 'div'],
    audios: ['audio', 'source', 'video', 'iframe', 'a', 'strong', 'b', 'em', 'i', 'br', 'p', 'span', 'div']
  };

  // ============================
  // Normalizador a texto seguro
  // ============================
  static aTextoSeguro(valor) {
    if (valor === undefined || valor === null) return '';
    if (typeof valor === 'string') return valor;
    if (typeof valor === 'number' || typeof valor === 'boolean') return String(valor);

    // Arrays: únelos en CSV legible
    if (Array.isArray(valor)) {
      return valor.map(v => (v ?? '')).join(', ');
    }

    // FileList → lista de nombres
    try {
      if (typeof FileList !== 'undefined' && valor instanceof FileList) {
        return Array.from(valor).map(f => f?.name || '').filter(Boolean).join(', ');
      }
    } catch (_) { /* entornos sin FileList */ }

    // File / Blob
    try {
      if (typeof File !== 'undefined' && valor instanceof File) return valor.name || '';
      if (typeof Blob !== 'undefined' && valor instanceof Blob) return '';
    } catch (_) { /* entornos sin File/Blob */ }

    // Objetos → JSON si es posible
    try {
      return JSON.stringify(valor);
    } catch {
      return String(valor);
    }
  }

  // ============================
  // Validación por campo
  // ============================
  static validarCampo(nombreCampo, valorOriginal) {
    const regla = this.reglas[nombreCampo];
    const errores = [];

    if (!regla) {
      return { esValido: true, errores: [] };
    }

    // Validaciones textuales sobre string normalizado (NFC)
    const valorLimpio = this.aTextoSeguro(valorOriginal).normalize('NFC').trim();

    // Requerido
    if (regla.requerido && (!valorLimpio || valorLimpio.length === 0)) {
      errores.push(this.mensajes.requerido);
      return { esValido: false, errores };
    }

    // Si está vacío y no es requerido → válido
    if (!valorLimpio || valorLimpio.length === 0) {
      return { esValido: true, errores: [] };
    }

    // Longitud mínima / máxima
    if (regla.minLongitud && valorLimpio.length < regla.minLongitud) {
      errores.push(this.mensajes.minLongitud.replace('{min}', regla.minLongitud));
    }
    if (regla.maxLongitud && valorLimpio.length > regla.maxLongitud) {
      errores.push(this.mensajes.maxLongitud.replace('{max}', regla.maxLongitud));
    }

    // Patrón general
    if (regla.patron && !regla.patron.test(valorLimpio)) {
      errores.push(this.mensajes.patron);
    }

    // Validaciones específicas
    switch (nombreCampo) {
      case 'acordes': {
        if (valorLimpio && regla.patronAcordes) {
          // Buscar secuencias entre corchetes
          const dentroCorchetes = valorLimpio.match(regla.patronAcordes) || [];
          if (dentroCorchetes.length > 0) {
            // Valida cada acorde de forma individual con el patrón flexible
            const invalidos = dentroCorchetes.filter(acc => {
              const contenido = acc.replace(/^\[|\]$/g, '').trim();
              return !PATRON_ACORDE_FLEX.test(contenido);
            });

            if (invalidos.length > 0) {
              const muestras = invalidos.slice(0, 3).join(', ');
              errores.push(`${this.mensajes.patronAcordes} Acordes problemáticos: ${muestras}`);
            }
          }
        }
        break;
      }

      case 'audios': {
        if (valorLimpio) {
          // Extrae URLs desde atributos src/href y URLs “sueltas” en el texto/HTML
          const urls = [];
          const lineas = valorLimpio.split(/\r?\n/);

          for (const lineaCruda of lineas) {
            const linea = lineaCruda.trim();
            if (!linea) continue;

            // 1) src/href="URL"
            const attrs = [...linea.matchAll(/\b(?:src|href)=["']([^"']+)["']/gi)].map(m => m[1]);
            if (attrs.length) urls.push(...attrs);

            // 2) URLs directas
            const directas = [...linea.matchAll(/\bhttps?:\/\/[^\s"'<>]+/gi)].map(m => m[0]);
            if (directas.length) urls.push(...directas);
          }

          const urlsInvalidas = urls.filter(u => !this.reglas.audios.patronURL.test(u));
          if (urlsInvalidas.length > 0) {
            errores.push(`${this.mensajes.patronURL} (ej.: ${urlsInvalidas.slice(0, 3).join(', ')})`);
          }
        }
        break;
      }

      case 'etiquetas': {
        const etiquetas = this.procesarEtiquetas(valorOriginal);

        if (etiquetas.length > this.reglas.etiquetas.maxEtiquetas) {
          errores.push(this.mensajes.maxEtiquetas.replace('{max}', this.reglas.etiquetas.maxEtiquetas));
        }

        const largas = etiquetas.filter(e => e.length > this.reglas.etiquetas.maxLongitudEtiqueta);
        if (largas.length > 0) {
          errores.push(`${this.mensajes.maxLongitudEtiqueta.replace('{max}', this.reglas.etiquetas.maxLongitudEtiqueta)}: ${largas.join(', ')}`);
        }
        break;
      }
    }

    return {
      esValido: errores.length === 0,
      errores
    };
  }

  // ============================
  // Utilidades de acordes
  // ============================
  static extraerAcordes(textoAcordes) {
    if (!textoAcordes || typeof textoAcordes !== 'string') return [];
    const encontrados = textoAcordes.match(/\[([^\]]+)\]/g) || [];
    return encontrados
      .map(a => a.replace(/[\[\]]/g, '').trim())
      .filter(Boolean)
      .filter((a, i, arr) => arr.indexOf(a) === i);
  }

  static esAcordeValido(acorde) {
    if (!acorde || typeof acorde !== 'string') return false;
    return PATRON_ACORDE_FLEX.test(acorde.trim());
  }

  // ============================
  // Validación de formulario completo
  // ============================
  static validarFormulario(datos) {
    const erroresPorCampo = {};
    let totalErrores = 0;

    Object.keys(this.reglas).forEach(nombreCampo => {
      const valor = datos?.[nombreCampo];
      const res = this.validarCampo(nombreCampo, valor);
      if (!res.esValido) {
        erroresPorCampo[nombreCampo] = res.errores;
        totalErrores += res.errores.length;
      }
    });

    return {
      esValido: totalErrores === 0,
      erroresPorCampo,
      resumen: totalErrores === 0
        ? 'Formulario válido'
        : `Se encontraron ${totalErrores} error(es) en el formulario`,
      totalErrores
    };
  }

  // ============================
  // Etiquetas: CSV o array → array limpio
  // ============================
  static procesarEtiquetas(entrada) {
    if (!entrada && entrada !== 0) return [];

    if (Array.isArray(entrada)) {
      return entrada
        .map(v => this.aTextoSeguro(v).trim().toLowerCase())
        .filter(Boolean)
        .filter((e, i, arr) => arr.indexOf(e) === i);
    }

    const etiquetasString = this.aTextoSeguro(entrada);
    if (!etiquetasString) return [];

    return etiquetasString
      .split(',')
      .map(e => e.trim().toLowerCase())
      .filter(Boolean)
      .filter((e, i, arr) => arr.indexOf(e) === i);
  }

  // ============================
  // Validación contextual para canción
  // ============================
  static validarCancion(cancion) {
    const base = this.validarFormulario(cancion);
    const validacionesExtra = [];

    // Requisito: al menos título y letra (ajusta a OR/AND según tu política)
    const t = this.aTextoSeguro(cancion?.titulo).trim();
    const l = this.aTextoSeguro(cancion?.letra).trim();

    // Si quieres exigir ambas: if (!t || !l) → cambia a if (!t && !l) para "al menos uno"
    if (!t || !l) {
      validacionesExtra.push('Una canción debe tener título y letra');
    }

    // Consistencia acordes ↔ letra (opcional)
    const acordesTxt = this.aTextoSeguro(cancion?.acordes).trim();
    if (acordesTxt && l) {
      const extraidos = this.extraerAcordes(acordesTxt);
      if (extraidos.length === 0) {
        validacionesExtra.push('El campo acordes no contiene acordes válidos entre corchetes [C], [Am], etc.');
      }
    }

    return {
      ...base,
      validacionesExtra,
      esCompletamenteValido: base.esValido && validacionesExtra.length === 0
    };
  }

  // ============================
  // Sanitización con lista blanca por campo
  // ============================
  static sanitizarDatos(datos) {
    const out = {};

    Object.keys(datos || {}).forEach(clave => {
      let valor = datos[clave];

      if (typeof valor === 'string') {
        valor = valor.trim();

        if (!this.camposConHTML.includes(clave)) {
          // Escape completo para campos sin HTML permitido
          valor = valor
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;');
        } else {
          // Sanitizado selectivo con lista blanca
          valor = this.sanitizarHTMLSelectivo(valor, clave);
        }
      }

      out[clave] = valor;
    });

    return out;
  }

  static sanitizarHTMLSelectivo(valor, campo) {
    const permitidas = new Set((this.etiquetasPermitidas[campo] || []).map(t => t.toLowerCase()));

    // 1) Elimina scripts y event handlers
    let limpio = valor
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/\son\w+\s*=\s*(['"]).*?\1/gi, '')
      .replace(/javascript:/gi, '');

    // 2) Elimina tags no permitidas manteniendo su contenido interno
    //    <tagNoPermitida ...>contenido</tagNoPermitida> → contenido
    limpio = limpio.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, (m, tag) => {
      return permitidas.has(tag.toLowerCase()) ? m : '';
    });

    return limpio;
  }

  // ============================
  // Auxiliares de consulta
  // ============================
  static puedeContenerHTML(nombreCampo) {
    return this.camposConHTML.includes(nombreCampo);
  }

  static obtenerEtiquetasPermitidas(nombreCampo) {
    return this.etiquetasPermitidas[nombreCampo] || [];
  }
}
