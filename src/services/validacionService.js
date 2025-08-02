// =================================
// Archivo: /src/services/validacionService.js
// Servicio mejorado de validación con mensajes en español
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
      patronAcordes: /\[[A-G](#|b)?(maj7|dim|aug|m7|m|7)?\]/g
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
    patronAcordes: 'Los acordes deben tener formato [C], [Am7], etc.',
    patronURL: 'Debe ser una URL válida (http:// o https://)',
    maxEtiquetas: 'Máximo {max} etiquetas permitidas',
    maxLongitudEtiqueta: 'Cada etiqueta debe tener máximo {max} caracteres'
  };

  /**
   * Valida un campo específico según las reglas definidas
   * @param {string} nombreCampo - Nombre del campo a validar
   * @param {*} valor - Valor del campo
   * @returns {Object} { esValido: boolean, errores: string[] }
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
          const acordesEncontrados = valorLimpio.match(/\[[^\]]+\]/g) || [];
          const acordesInvalidos = acordesEncontrados.filter(acorde => 
            !regla.patronAcordes.test(acorde)
          );
          if (acordesInvalidos.length > 0) {
            errores.push(`${this.mensajes.patronAcordes} Acordes inválidos: ${acordesInvalidos.join(', ')}`);
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
   * Valida un formulario completo
   * @param {Object} datos - Objeto con los datos del formulario
   * @returns {Object} { esValido: boolean, erroresPorCampo: Object, resumen: string }
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
   * @param {string} etiquetasString - String con etiquetas separadas por comas
   * @returns {Array<string>} Array de etiquetas limpias
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
   * @param {Object} cancion - Objeto canción
   * @returns {Object} Resultado de validación completa
   */
  static validarCancion(cancion) {
    const validacion = this.validarFormulario(cancion);
    
    // Validaciones adicionales específicas para canciones
    const validacionesExtra = [];

    // Verificar que al menos tiene título y letra
    if (!cancion.titulo?.trim() && !cancion.letra?.trim()) {
      validacionesExtra.push('Una canción debe tener al menos título y letra');
    }

    // Verificar consistencia entre acordes y letra
    if (cancion.acordes?.trim() && cancion.letra?.trim()) {
      const acordesEnLetra = (cancion.acordes.match(/\[[^\]]+\]/g) || []).length;
      if (acordesEnLetra === 0) {
        validacionesExtra.push('El campo acordes no contiene acordes válidos [C], [Am], etc.');
      }
    }

    return {
      ...validacion,
      validacionesExtra,
      esCompletamenteValido: validacion.esValido && validacionesExtra.length === 0
    };
  }

  /**
   * Sanitiza datos de entrada para prevenir XSS
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
        
        // Escapar caracteres HTML básicos
        valor = valor
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;');
      }

      datosSanitizados[clave] = valor;
    });

    return datosSanitizados;
  }
}