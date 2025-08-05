// =================================
// Archivo: src/services/validacionService.js - ARREGLO HTML
// Permitir etiquetas HTML en campos específicos
// =================================

export class ValidacionService {
  static reglas = {
    titulo: {
      requerido: true,
      minLongitud: 2,
      maxLongitud: 100,
      patron: /^[a-zA-ZÀ-ÿ0-9\s\-_.,!?'"()]+$/
    },
    letra: {
      requerido: true,
      minLongitud: 10,
      maxLongitud: 10000
    },
    acordes: {
      requerido: false,
      maxLongitud: 5000,
      // PATRÓN MEJORADO: más flexible para diferentes tipos de acordes
      patronAcordes: /\[([A-G](#|b|♯|♭)?(maj|min|m|dim|aug|sus|add)?(7|9|11|13|6|4|2)?(#|b|♯|♭)?(5|9|11|13)?\/?([A-G](#|b|♯|♭)?)?)\]/gi
    },
    melodia: {
      requerido: false,
      maxLongitud: 2000
    },
    audios: {
      requerido: false,
      maxLongitud: 3000,
      patronURL: /^https?:\/\/.+/
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

  // NUEVO: Lista de campos que pueden contener HTML
  static camposConHTML = [
    'letra',    // Permitir <strong>, <em>, <br>, etc. en las letras
    'acordes',  // Permitir HTML en acordes si es necesario
    'melodia',  // Permitir HTML en melodía
    'audios'    // Permitir <audio>, <video>, <iframe>, etc.
  ];

  // NUEVO: Lista de etiquetas HTML permitidas por campo
  static etiquetasPermitidas = {
    letra: ['strong', 'b', 'em', 'i', 'u', 'br', 'p', 'span'],
    acordes: ['strong', 'b', 'em', 'i', 'br', 'span'],
    melodia: ['strong', 'b', 'em', 'i', 'br', 'p', 'span'],
    audios: ['audio', 'video', 'iframe', 'a', 'strong', 'b', 'em', 'i', 'br', 'p', 'span', 'div']
  };

  /**
   * Valida un campo específico según las reglas definidas
   */
  static validarCampo(nombreCampo, valor) {
    const regla = this.reglas[nombreCampo];
    const errores = [];

    if (!regla) {
      return { esValido: true, errores: [] };
    }

    const valorLimpio = typeof valor === 'string' ? valor.trim() : valor;

    // Validación de campo requerido
    if (regla.requerido && (!valorLimpio || valorLimpio.length === 0)) {
      errores.push(this.mensajes.requerido);
      return { esValido: false, errores };
    }

    // Si el campo está vacío y no es requerido, es válido
    if (!valorLimpio || valorLimpio.length === 0) {
      return { esValido: true, errores: [] };
    }

    // Validación de longitud mínima
    if (regla.minLongitud && valorLimpio.length < regla.minLongitud) {
      errores.push(
        this.mensajes.minLongitud.replace('{min}', regla.minLongitud)
      );
    }

    // Validación de longitud máxima
    if (regla.maxLongitud && valorLimpio.length > regla.maxLongitud) {
      errores.push(
        this.mensajes.maxLongitud.replace('{max}', regla.maxLongitud)
      );
    }

    // Validación de patrón general
    if (regla.patron && !regla.patron.test(valorLimpio)) {
      errores.push(this.mensajes.patron);
    }

    // Validaciones específicas por campo
    switch (nombreCampo) {
      case 'acordes':
        if (valorLimpio && regla.patronAcordes) {
          // VALIDACIÓN MEJORADA DE ACORDES
          const acordesEncontrados = valorLimpio.match(/\[[^\]]+\]/g) || [];
          
          if (acordesEncontrados.length > 0) {
            // Verificar cada acorde individualmente con un patrón más flexible
            const acordesInvalidos = acordesEncontrados.filter(acorde => {
              // Extraer el contenido del acorde (sin corchetes)
              const contenidoAcorde = acorde.replace(/[\[\]]/g, '');
              
              // Patrón más flexible para validar acordes individuales
              const patronFlexible = /^([A-G](#|b|♯|♭)?(maj|min|m|dim|aug|sus|add|°|ø|Δ|M)?(7|9|11|13|6|4|2)?(#|b|♯|♭)?(5|9|11|13)?\/?([A-G](#|b|♯|♭)?)?(\(.*\))?)$/i;
              
              return !patronFlexible.test(contenidoAcorde);
            });
            
            if (acordesInvalidos.length > 0) {
              // Solo mostrar error si hay acordes claramente inválidos
              const muestrasInvalidas = acordesInvalidos.slice(0, 3).join(', ');
              errores.push(`${this.mensajes.patronAcordes} Acordes problemáticos: ${muestrasInvalidas}`);
            }
          }
        }
        break;

      case 'audios':
        if (valorLimpio) {
          const lineas = valorLimpio.split('\n');
          const urlsInvalidas = lineas
            .filter(linea => linea.trim() && linea.includes('http'))
            .filter(linea => !regla.patronURL.test(linea.trim()));
          
          if (urlsInvalidas.length > 0) {
            errores.push(`${this.mensajes.patronURL} URLs inválidas encontradas`);
          }
        }
        break;

      case 'etiquetas':
        if (valorLimpio) {
          const etiquetas = this.procesarEtiquetas(valorLimpio);
          
          if (etiquetas.length > regla.maxEtiquetas) {
            errores.push(
              this.mensajes.maxEtiquetas.replace('{max}', regla.maxEtiquetas)
            );
          }

          const etiquetasLargas = etiquetas.filter(
            etiqueta => etiqueta.length > regla.maxLongitudEtiqueta
          );
          
          if (etiquetasLargas.length > 0) {
            errores.push(
              `${this.mensajes.maxLongitudEtiqueta.replace('{max}', regla.maxLongitudEtiqueta)}: ${etiquetasLargas.join(', ')}`
            );
          }
        }
        break;
    }

    return {
      esValido: errores.length === 0,
      errores
    };
  }

  /**
   * MÉTODO MEJORADO: Extrae acordes del texto de forma más flexible
   */
  static extraerAcordes(textoAcordes) {
    if (!textoAcordes || typeof textoAcordes !== 'string') {
      return [];
    }

    // Buscar todos los acordes entre corchetes
    const acordesEncontrados = textoAcordes.match(/\[([^\]]+)\]/g) || [];
    
    // Limpiar y filtrar acordes válidos
    const acordesLimpios = acordesEncontrados
      .map(acorde => acorde.replace(/[\[\]]/g, '').trim())
      .filter(acorde => acorde.length > 0)
      .filter((acorde, indice, array) => array.indexOf(acorde) === indice); // eliminar duplicados

    return acordesLimpios;
  }

  /**
   * MÉTODO NUEVO: Valida si un acorde individual es válido
   */
  static esAcordeValido(acorde) {
    if (!acorde || typeof acorde !== 'string') {
      return false;
    }

    // Patrón muy flexible que acepta la mayoría de notaciones de acordes
    const patronAcordeFlexible = /^([A-G](#|b|♯|♭)?(maj|min|m|dim|aug|sus|add|M|-)?(7|9)?(#|b|♯|♭)?(5|9|)?\/?([A-G](#|b|♯|♭)?)?(\(.*\))?)$/i;
    
    return patronAcordeFlexible.test(acorde.trim());
  }

  /**
   * Valida un formulario completo
   */
  static validarFormulario(datos) {
    const erroresPorCampo = {};
    let totalErrores = 0;

    // Validar cada campo
    Object.keys(this.reglas).forEach(nombreCampo => {
      const valor = datos[nombreCampo];
      const resultado = this.validarCampo(nombreCampo, valor);
      
      if (!resultado.esValido) {
        erroresPorCampo[nombreCampo] = resultado.errores;
        totalErrores += resultado.errores.length;
      }
    });

    const esValido = totalErrores === 0;
    const resumen = esValido 
      ? 'Formulario válido' 
      : `Se encontraron ${totalErrores} error(es) en el formulario`;

    return {
      esValido,
      erroresPorCampo,
      resumen,
      totalErrores
    };
  }

  /**
   * Procesa las etiquetas desde string CSV a array limpio
   */
  static procesarEtiquetas(etiquetasString) {
    if (!etiquetasString || typeof etiquetasString !== 'string') {
      return [];
    }

    return etiquetasString
      .split(',')
      .map(etiqueta => etiqueta.trim().toLowerCase())
      .filter(etiqueta => etiqueta.length > 0)
      .filter((etiqueta, indice, array) => array.indexOf(etiqueta) === indice); // eliminar duplicados
  }

  /**
   * Valida datos de canción en tiempo real
   */
  static validarCancion(cancion) {
    const validacion = this.validarFormulario(cancion);
    
    // Validaciones adicionales específicas para canciones
    const validacionesExtra = [];

    // Verificar que al menos tiene título y letra
    if (!cancion.titulo?.trim() && !cancion.letra?.trim()) {
      validacionesExtra.push('Una canción debe tener al menos título y letra');
    }

    // VALIDACIÓN MEJORADA: Verificar consistencia entre acordes y letra
    if (cancion.acordes?.trim() && cancion.letra?.trim()) {
      const acordesExtraidos = this.extraerAcordes(cancion.acordes);
      if (acordesExtraidos.length === 0) {
        validacionesExtra.push('El campo acordes no contiene acordes válidos entre corchetes [C], [Am], etc.');
      }
    }

    return {
      ...validacion,
      validacionesExtra,
      esCompletamenteValido: validacion.esValido && validacionesExtra.length === 0
    };
  }

  /**
   * MÉTODO COMPLETAMENTE REESCRITO: Sanitiza datos permitiendo HTML en campos específicos
   * @param {Object} datos - Datos a sanitizar
   * @returns {Object} Datos sanitizados
   */
  static sanitizarDatos(datos) {
    const datosSanitizados = {};

    Object.keys(datos).forEach(clave => {
      let valor = datos[clave];

      if (typeof valor === 'string') {
        // Limpiar espacios extras
        valor = valor.trim();
        
        // NUEVO ENFOQUE: Solo sanitizar campos que NO deben contener HTML
        if (!this.camposConHTML.includes(clave)) {
          // Solo campos como 'titulo' y 'etiquetas' se escapan completamente
          valor = valor
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;');
        } else {
          // Para campos que pueden contener HTML, hacer sanitización selectiva
          valor = this.sanitizarHTMLSelectivo(valor, clave);
        }
      }

      datosSanitizados[clave] = valor;
    });

    return datosSanitizados;
  }

  /**
   * MÉTODO NUEVO: Sanitización selectiva para campos con HTML permitido
   * @param {string} valor - Valor a sanitizar
   * @param {string} campo - Nombre del campo
   * @returns {string} Valor sanitizado
   */
  static sanitizarHTMLSelectivo(valor, campo) {
    // Si no hay etiquetas permitidas definidas para este campo, devolver tal como está
    const etiquetasPermitidas = this.etiquetasPermitidas[campo];
    if (!etiquetasPermitidas) {
      return valor;
    }

    // Para una implementación básica, permitimos las etiquetas tal como están
    // En una implementación más robusta, usarías una librería como DOMPurify
    
    // Por ahora, solo eliminamos scripts y otros elementos peligrosos
    valor = valor
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<iframe(?![^>]*src=["'](https?:\/\/|\/\/)[^"']*["'])[^>]*>[\s\S]*?<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, ''); // Eliminar atributos onclick, onload, etc.

    return valor;
  }

  /**
   * MÉTODO NUEVO: Verifica si un campo puede contener HTML
   * @param {string} nombreCampo - Nombre del campo
   * @returns {boolean} True si puede contener HTML
   */
  static puedeContenerHTML(nombreCampo) {
    return this.camposConHTML.includes(nombreCampo);
  }

  /**
   * MÉTODO NUEVO: Obtiene las etiquetas HTML permitidas para un campo
   * @param {string} nombreCampo - Nombre del campo
   * @returns {Array} Array de etiquetas permitidas
   */
  static obtenerEtiquetasPermitidas(nombreCampo) {
    return this.etiquetasPermitidas[nombreCampo] || [];
  }
}