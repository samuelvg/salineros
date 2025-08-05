// ============================================
// Archivo: /src/ui/songFormView.js - Versión completa mejorada
// ============================================

import { ValidacionService } from '../services/validacionService.js';

export const SongFormView = {
  // Propiedades del formulario
  container: null,
  form: null,
  onCreateSubmit: null,
  onEditSubmit: null,
  
  // Estado del formulario
  estado: {
    pestanaActiva: 'basico',
    datosOriginales: {},
    validacionEnTiempoReal: true,
    cambiosSinGuardar: false
  },

  /**
   * Inicializa el formulario con validación mejorada
   */
  init(container) {
    this.container = container || document.getElementById('app');
    this.crearFormulario();
    this.configurarEventos();
    this.configurarValidacionTiempoReal();
  },

  /**
   * Crea la estructura HTML del formulario
   */
  crearFormulario() {
    this.form = document.createElement('form');
    this.form.className = 'song-form';
    this.form.setAttribute('novalidate', 'true'); // Usamos validación personalizada
    this.form.innerHTML = this.obtenerHTMLFormulario();
    
    this.container.appendChild(this.form);
  },

  /**
   * Genera el HTML del formulario
   */
  obtenerHTMLFormulario() {
    return `
      <input type="hidden" name="id" value="">

      <!-- Pestañas del formulario -->
      <div class="form-tabs" role="tablist">
        <button type="button" class="form-tab-btn active" data-tab="basico" role="tab" 
                aria-selected="true" aria-controls="form-tab-basico">
          <span class="tab-text">Básico</span>
          <span class="tab-indicator" id="indicator-basico" aria-hidden="true"></span>
        </button>
        <button type="button" class="form-tab-btn" data-tab="letra" role="tab" 
                aria-selected="false" aria-controls="form-tab-letra">
          <span class="tab-text">Letra</span>
          <span class="tab-indicator" id="indicator-letra" aria-hidden="true"></span>
        </button>
        <button type="button" class="form-tab-btn" data-tab="acordes" role="tab" 
                aria-selected="false" aria-controls="form-tab-acordes">
          <span class="tab-text">Acordes</span>
          <span class="tab-indicator" id="indicator-acordes" aria-hidden="true"></span>
        </button>
        <button type="button" class="form-tab-btn" data-tab="melodia" role="tab" 
                aria-selected="false" aria-controls="form-tab-melodia">
          <span class="tab-text">Melodía</span>
          <span class="tab-indicator" id="indicator-melodia" aria-hidden="true"></span>
        </button>
        <button type="button" class="form-tab-btn" data-tab="audios" role="tab" 
                aria-selected="false" aria-controls="form-tab-audios">
          <span class="tab-text">Audios</span>
          <span class="tab-indicator" id="indicator-audios" aria-hidden="true"></span>
        </button>
      </div>

      <!-- Contenido de las pestañas -->
      <div class="form-content">
        <!-- Pestaña Básico -->
        <div class="form-tab-content active" id="form-tab-basico" role="tabpanel" aria-labelledby="tab-basico">
          <div class="form-field">
            <label for="titulo">
              <span class="label-text">Título de la canción</span>
              <span class="required" aria-label="Campo obligatorio">*</span>
            </label>
            <input type="text" name="titulo" id="titulo" required 
                   placeholder="Ej: Imagine" 
                   aria-describedby="help-titulo error-titulo"
                   maxlength="100">
            <small id="help-titulo" class="field-help">
              Nombre principal de la canción (2-100 caracteres)
            </small>
            <div class="field-error" id="error-titulo" role="alert" aria-live="polite"></div>
          </div>

          <div class="form-field">
            <label for="etiquetas">
              <span class="label-text">Etiquetas</span>
              <small class="label-subtitle">Separadas por comas para categorizar la canción</small>
            </label>
            <input type="text" name="etiquetas" id="etiquetas" 
                   placeholder="Tradicional, Romería, Sudamericana, Villancico..."
                   aria-describedby="help-etiquetas error-etiquetas"
                   maxlength="200">
            <small id="help-etiquetas" class="field-help">
              Hasta 10 etiquetas, máximo 20 caracteres cada una
            </small>
            <div class="field-error" id="error-etiquetas" role="alert" aria-live="polite"></div>
            <div class="etiquetas-preview" id="preview-etiquetas"></div>
          </div>
        </div>

        <!-- Pestaña Letra -->
        <div class="form-tab-content" id="form-tab-letra" role="tabpanel" aria-labelledby="tab-letra">
          <div class="form-field">
            <label for="letra">
              <span class="label-text">Letra de la canción</span>
              <span class="required" aria-label="Campo obligatorio">*</span>
              <small class="label-subtitle">Escribe aquí toda la letra</small>
            </label>
            <div class="textarea-container">
              <textarea name="letra" id="letra" rows="12" required 
                        placeholder="Escribe aquí la letra de la canción&#10;línea por línea...&#10;&#10;Admite etiquetas html como strong, em, etc."
                        aria-describedby="help-letra error-letra contador-letra"
                        maxlength="10000"></textarea>
              <div class="textarea-info">
                <span id="contador-letra" class="character-counter">0 / 10,000</span>
              </div>
            </div>
            <small id="help-letra" class="field-help">
              Contenido principal de la canción (mínimo 10 caracteres)
            </small>
            <div class="field-error" id="error-letra" role="alert" aria-live="polite"></div>
          </div>
        </div>

        <!-- Pestaña Acordes -->
        <div class="form-tab-content" id="form-tab-acordes" role="tabpanel" aria-labelledby="tab-acordes">
          <div class="form-field">
            <label for="acordes">
              <span class="label-text">Acordes y estructura</span>
              <small class="label-subtitle">Usa [C], [G], [Am], etc. para marcar los acordes sobre la letra</small>
            </label>
            <div class="textarea-container">
              <textarea name="acordes" id="acordes" rows="12" 
                        placeholder="[C]Imagine there's no [Am]heaven&#10;[F]It's easy if you [C]try&#10;[C]No hell be[Am]low us&#10;[F]Above us only [C]sky&#10;&#10;[Am]Imagine all the [Dm]people&#10;[F]Living for to[G]day..."
                        aria-describedby="help-acordes error-acordes contador-acordes"
                        maxlength="5000"></textarea>
              <div class="textarea-info">
                <span id="contador-acordes" class="character-counter">0 / 5,000</span>
                <button type="button" class="helper-btn" id="btn-ayuda-acordes" 
                        aria-label="Mostrar ayuda para acordes">?</button>
              </div>
            </div>
            <small id="help-acordes" class="field-help">
              Formato: [C], [Am], [G7], [Dm7], etc. Los acordes se mostrarán sobre la letra
            </small>
            <div class="field-error" id="error-acordes" role="alert" aria-live="polite"></div>
            <div class="acordes-preview" id="preview-acordes"></div>
          </div>
        </div>

        <!-- Pestaña Melodía -->
        <div class="form-tab-content" id="form-tab-melodia" role="tabpanel" aria-labelledby="tab-melodia">
          <div class="form-field">
            <label for="melodia">
              <span class="label-text">Melodía y notas</span>
              <small class="label-subtitle">Para las púas</small>
            </label>
            <div class="textarea-container">
              <textarea name="melodia" id="melodia" rows="10" 
                        placeholder="Partitura, notación musical, o descripción de la melodía"
                        aria-describedby="help-melodia error-melodia contador-melodia"
                        maxlength="2000"></textarea>
              <div class="textarea-info">
                <span id="contador-melodia" class="character-counter">0 / 2,000</span>
              </div>
            </div>
            <small id="help-melodia" class="field-help">
              Información musical adicional: tonalidad, tempo, estructura, etc.
            </small>
            <div class="field-error" id="error-melodia" role="alert" aria-live="polite"></div>
          </div>
        </div>

        <!-- Pestaña Audios -->
        <div class="form-tab-content" id="form-tab-audios" role="tabpanel" aria-labelledby="tab-audios">
          <div class="form-field">
            <label for="audios">
              <span class="label-text">Enlaces de audio y configuración</span>
              <small class="label-subtitle">URLs de audio, descripciones o configuración de reproductor</small>
            </label>
            <div class="textarea-container">
              <textarea name="audios" id="audios" rows="8" 
                        placeholder="Enlaces de audio:&#10;https://afsalineros.es/audios/zagalejo/Zagalejo-Todos.mp3 &#10;&#10;[reproductor:[&#10;{&quot;nombre&quot;:&quot;Tenores&quot;, &quot;archivo&quot;:&quot;audios/isa_salinera/El-Salinero_Tenores.mp3&quot;},&#10;{&quot;nombre&quot;:&quot;Barítonos&quot;, &quot;archivo&quot;:&quot;audios/isa_salinera/El-Salinero_Baritonos.mp3&quot;},&#10;{&quot;nombre&quot;:&quot;Bajos&quot;, &quot;archivo&quot;:&quot;audios/isa_salinera/El-Salinero_Bajos.mp3&quot;}]]"
                        aria-describedby="help-audios error-audios contador-audios"
                        maxlength="3000"></textarea>
              <div class="textarea-info">
                <span id="contador-audios" class="character-counter">0 / 3,000</span>
                <button type="button" class="helper-btn" id="btn-ayuda-audios" 
                        aria-label="Mostrar ayuda para configuración de audios">?</button>
              </div>
            </div>
            <small id="help-audios" class="field-help">
              URLs de archivos de audio y configuración del reproductor multipista
            </small>
            <div class="field-error" id="error-audios" role="alert" aria-live="polite"></div>
          </div>
        </div>
      </div>

      <!-- Botones del formulario -->
      <div class="form-buttons">
        <button type="submit" class="btn-primary" id="btn-submit">
          <span class="btn-icon" id="submit-icon">💾</span>
          <span class="btn-text" id="submit-text">Guardar Canción</span>
        </button>
        <button type="button" id="btn-cancel" class="btn-secondary">
          <span class="btn-icon">✕</span>
          <span class="btn-text">Cancelar</span>
        </button>
      </div>
    `;
  },

  /**
   * Configura todos los event listeners
   */
  configurarEventos() {
    // Eventos de pestañas
    this.configurarEventosPestanas();
    
    // Eventos de formulario
    this.configurarEventosFormulario();
    
    // Eventos de ayuda
    this.configurarEventosAyuda();
    
    // Eventos de caracteres
    this.configurarContadoresCaracteres();
  },

  /**
   * Configura la navegación por pestañas
   */
  configurarEventosPestanas() {
    const botonesPestanas = this.form.querySelectorAll('.form-tab-btn');
    
    botonesPestanas.forEach(boton => {
      boton.addEventListener('click', () => {
        this.switchToTab(boton.dataset.tab);
      });
      
      // Navegación con teclado
      boton.addEventListener('keydown', (evento) => {
        let siguienteBoton = null;
        
        switch (evento.key) {
          case 'ArrowRight':
          case 'ArrowDown':
            siguienteBoton = boton.nextElementSibling;
            if (!siguienteBoton) {
              siguienteBoton = botonesPestanas[0];
            }
            break;
          case 'ArrowLeft':
          case 'ArrowUp':
            siguienteBoton = boton.previousElementSibling;
            if (!siguienteBoton) {
              siguienteBoton = botonesPestanas[botonesPestanas.length - 1];
            }
            break;
          case 'Home':
            siguienteBoton = botonesPestanas[0];
            break;
          case 'End':
            siguienteBoton = botonesPestanas[botonesPestanas.length - 1];
            break;
        }
        
        if (siguienteBoton) {
          evento.preventDefault();
          siguienteBoton.focus();
          this.switchToTab(siguienteBoton.dataset.tab);
        }
      });
    });
  },

  /**
   * Configura eventos del formulario principal
   */
  configurarEventosFormulario() {
    // Envío del formulario
    this.form.addEventListener('submit', (evento) => {
      evento.preventDefault();
      this.manejarEnvioFormulario();
    });

    // Botón cancelar
    this.form.querySelector('#btn-cancel').addEventListener('click', () => {
      this.manejarCancelacion();
    });

    // Detectar cambios no guardados
    this.form.addEventListener('input', () => {
      this.estado.cambiosSinGuardar = true;
      this.updateTabIndicators();
    });

    // Prevenir pérdida de datos
    window.addEventListener('beforeunload', (evento) => {
      if (this.estado.cambiosSinGuardar) {
        evento.preventDefault();
        evento.returnValue = 'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?';
      }
    });
  },

  /**
   * Configura eventos de ayuda
   */
  configurarEventosAyuda() {
    // Ayuda para acordes
    const btnAyudaAcordes = this.form.querySelector('#btn-ayuda-acordes');
    if (btnAyudaAcordes) {
      btnAyudaAcordes.addEventListener('click', () => {
        this.mostrarAyudaAcordes();
      });
    }

    // Ayuda para audios
    const btnAyudaAudios = this.form.querySelector('#btn-ayuda-audios');
    if (btnAyudaAudios) {
      btnAyudaAudios.addEventListener('click', () => {
        this.mostrarAyudaAudios();
      });
    }
  },

  /**
   * Configura contadores de caracteres
   */
  configurarContadoresCaracteres() {
    const camposConContador = ['letra', 'acordes', 'melodia', 'audios'];
    
    camposConContador.forEach(nombreCampo => {
      const campo = this.form.querySelector(`#${nombreCampo}`);
      const contador = this.form.querySelector(`#contador-${nombreCampo}`);
      
      if (campo && contador) {
        const actualizar = () => {
          const longitud = campo.value.length;
          const maximo = parseInt(campo.getAttribute('maxlength')) || 0;
          contador.textContent = `${longitud.toLocaleString()} / ${maximo.toLocaleString()}`;
          
          // Cambiar color si se acerca al límite
          if (longitud > maximo * 0.9) {
            contador.classList.add('near-limit');
          } else {
            contador.classList.remove('near-limit');
          }
        };
        
        campo.addEventListener('input', actualizar);
        actualizar(); // Inicializar
      }
    });
  },

  /**
   * Configura validación en tiempo real
   */
  configurarValidacionTiempoReal() {
    const campos = ['titulo', 'letra', 'acordes', 'melodia', 'audios', 'etiquetas'];
    
    campos.forEach(nombreCampo => {
      const campo = this.form.querySelector(`#${nombreCampo}`);
      if (!campo) return;
      
      // Validación al perder el foco
      campo.addEventListener('blur', () => {
        this.validateField(nombreCampo);
      });
      
      // Limpiar errores al escribir
      campo.addEventListener('input', () => {
        this.clearFieldError(nombreCampo);
        this.actualizarPreview(nombreCampo);
      });
    });
  },

  /**
   * Valida un campo específico usando ValidacionService
   */
  validateField(nombreCampo) {
    const campo = this.form.querySelector(`#${nombreCampo}`);
    const contenedorError = this.form.querySelector(`#error-${nombreCampo}`);
    
    if (!campo || !contenedorError) return true;
    
    const valor = campo.value;
    const resultado = ValidacionService.validarCampo(nombreCampo, valor);
    
    if (!resultado.esValido) {
      this.showFieldError(nombreCampo, resultado.errores[0]);
      campo.classList.add('error');
      return false;
    } else {
      this.clearFieldError(nombreCampo);
      campo.classList.remove('error');
      return true;
    }
  },

  /**
   * Muestra error en un campo
   */
  showFieldError(nombreCampo, mensaje) {
    const contenedorError = this.form.querySelector(`#error-${nombreCampo}`);
    if (contenedorError) {
      contenedorError.textContent = mensaje;
      contenedorError.style.display = 'block';
    }
  },

  /**
   * Limpia el error de un campo
   */
  clearFieldError(nombreCampo) {
    const contenedorError = this.form.querySelector(`#error-${nombreCampo}`);
    if (contenedorError) {
      contenedorError.textContent = '';
      contenedorError.style.display = 'none';
    }
  },

  /**
   * Cambia la pestaña activa
   */
  switchToTab(nombrePestana) {
    // Actualizar estado
    this.estado.pestanaActiva = nombrePestana;
    
    // Actualizar botones
    this.form.querySelectorAll('.form-tab-btn').forEach(boton => {
      const esActiva = boton.dataset.tab === nombrePestana;
      boton.classList.toggle('active', esActiva);
      boton.setAttribute('aria-selected', esActiva);
    });
    
    // Actualizar contenido
    this.form.querySelectorAll('.form-tab-content').forEach(contenido => {
      const esActiva = contenido.id === `form-tab-${nombrePestana}`;
      contenido.classList.toggle('active', esActiva);
    });
    
    // Enfocar primer campo de la pestaña activa
    const pestanaActiva = this.form.querySelector(`#form-tab-${nombrePestana}`);
    const primerCampo = pestanaActiva.querySelector('input, textarea');
    if (primerCampo) {
      setTimeout(() => primerCampo.focus(), 100);
    }
  },

  /**
   * Actualiza los indicadores de las pestañas
   */
  updateTabIndicators() {
    const campos = {
      basico: ['titulo', 'etiquetas'],
      letra: ['letra'],
      acordes: ['acordes'],
      melodia: ['melodia'],
      audios: ['audios']
    };
    
    Object.keys(campos).forEach(nombrePestana => {
      const indicador = this.form.querySelector(`#indicator-${nombrePestana}`);
      if (!indicador) return;
      
      let tieneContenido = false;
      let tieneErrores = false;
      let esCompleta = true;
      
      campos[nombrePestana].forEach(nombreCampo => {
        const campo = this.form.querySelector(`#${nombreCampo}`);
        if (!campo) return;
        
        const valor = campo.value.trim();
        if (valor) tieneContenido = true;
        
        if (campo.classList.contains('error')) {
          tieneErrores = true;
        }
        
        // Verificar si los campos requeridos están completos
        if (campo.required && !valor) {
          esCompleta = false;
        }
      });
      
      // Actualizar indicador
      indicador.className = 'tab-indicator';
      if (tieneErrores) {
        indicador.classList.add('error');
        indicador.textContent = '!';
        indicador.setAttribute('aria-label', 'Errores en esta sección');
      } else if (tieneContenido && esCompleta) {
        indicador.classList.add('complete');
        indicador.textContent = '✓';
        indicador.setAttribute('aria-label', 'Sección completada');
      } else if (tieneContenido) {
        indicador.textContent = '●';
        indicador.setAttribute('aria-label', 'Sección con contenido');
      } else {
        indicador.textContent = '';
        indicador.removeAttribute('aria-label');
      }
    });
  },

  /**
   * Actualiza previsualizaciones en tiempo real
   */
  actualizarPreview(nombreCampo) {
    switch (nombreCampo) {
      case 'etiquetas':
        this.actualizarPreviewEtiquetas();
        break;
      case 'acordes':
        this.actualizarPreviewAcordes();
        break;
    }
  },

  /**
   * Actualiza preview de etiquetas
   */
  actualizarPreviewEtiquetas() {
    const campo = this.form.querySelector('#etiquetas');
    const preview = this.form.querySelector('#preview-etiquetas');
    
    if (!campo || !preview) return;
    
    const valor = campo.value.trim();
    if (!valor) {
      preview.innerHTML = '';
      return;
    }
    
    const etiquetas = ValidacionService.procesarEtiquetas(valor);
    preview.innerHTML = etiquetas
      .map(etiqueta => `<span class="etiqueta-preview">${etiqueta}</span>`)
      .join(' ');
  },

  /**
 * MÉTODO MEJORADO: Actualiza preview de acordes con mejor detección
 */
actualizarPreviewAcordes() {
  const campo = this.form.querySelector('#acordes');
  const preview = this.form.querySelector('#preview-acordes');
  
  if (!campo || !preview) return;
  
  const valor = campo.value.trim();
  if (!valor) {
    preview.innerHTML = '';
    return;
  }
  
  // Usar el método mejorado del ValidacionService
  const acordesExtraidos = ValidacionService.extraerAcordes(valor);
  
  if (acordesExtraidos.length > 0) {
    // Separar acordes válidos de inválidos
    const acordesValidos = [];
    const acordesInvalidos = [];
    
    acordesExtraidos.forEach(acorde => {
      if (ValidacionService.esAcordeValido(acorde)) {
        acordesValidos.push(acorde);
      } else {
        acordesInvalidos.push(acorde);
      }
    });
    
    let html = '';
    
    // Mostrar acordes válidos
    if (acordesValidos.length > 0) {
      html += `
        <div class="acordes-encontrados">
          <strong>✅ Acordes válidos encontrados (${acordesValidos.length}):</strong><br>
          ${acordesValidos.map(acorde => `<span class="acorde-preview valido">[${acorde}]</span>`).join(' ')}
        </div>
      `;
    }
    
    // Mostrar acordes problemáticos si los hay
    if (acordesInvalidos.length > 0) {
      html += `
        <div class="acordes-problematicos">
          <strong>⚠️ Acordes que podrían tener problemas (${acordesInvalidos.length}):</strong><br>
          ${acordesInvalidos.map(acorde => `<span class="acorde-preview invalido">[${acorde}]</span>`).join(' ')}
          <br><small>💡 Verifica la notación de estos acordes</small>
        </div>
      `;
    }
    
    preview.innerHTML = html;
  } else {
    // Si no se encontraron acordes, mostrar ayuda
    const tieneCorchetes = valor.includes('[') && valor.includes(']');
    
    if (tieneCorchetes) {
      preview.innerHTML = `
        <div class="acordes-ayuda error">
          ⚠️ Se encontraron corchetes pero no acordes válidos. 
          <br><strong>Ejemplos correctos:</strong> [C], [Am], [G7], [F#m], [Bbmaj7]
        </div>
      `;
    } else {
      preview.innerHTML = `
        <div class="acordes-ayuda">
          💡 <strong>Tip:</strong> Pon los acordes entre corchetes: [C], [Am], [G7], etc.
          <br><strong>Ejemplo:</strong> [C]Imagine there's no [Am]heaven [F]It's easy if you [C]try
        </div>
      `;
    }
  }
},

  /**
   * Maneja el envío del formulario
   */
  async manejarEnvioFormulario() {
    // Validar todo el formulario
    const esValido = this.validateForm();
    if (!esValido) {
      return;
    }

    // Recopilar datos
    const datos = this.recopilarDatosFormulario();
    
    // Sanitizar datos
    const datosSanitizados = ValidacionService.sanitizarDatos(datos);
    
    // Deshabilitar botón de envío
    const botonEnviar = this.form.querySelector('#btn-submit');
    const textoBoton = this.form.querySelector('#submit-text');
    const iconoBoton = this.form.querySelector('#submit-icon');
    
    const textoOriginal = textoBoton.textContent;
    const iconoOriginal = iconoBoton.textContent;
    
    botonEnviar.disabled = true;
    textoBoton.textContent = 'Guardando...';
    iconoBoton.textContent = '⏳';

    try {
      // Llamar al callback apropiado
      if (datos.id && this.onEditSubmit) {
        await this.onEditSubmit(datosSanitizados);
      } else if (this.onCreateSubmit) {
        await this.onCreateSubmit(datosSanitizados);
      }
      
      // Marcar como guardado
      this.estado.cambiosSinGuardar = false;
      
    } catch (error) {
      console.error('Error al enviar formulario:', error);
      // El error se maneja en el nivel superior
    } finally {
      // Restaurar botón
      botonEnviar.disabled = false;
      textoBoton.textContent = textoOriginal;
      iconoBoton.textContent = iconoOriginal;
    }
  },

  /**
   * Valida todo el formulario usando ValidacionService
   */
  validateForm() {
    const campos = ['titulo', 'letra', 'acordes', 'melodia', 'audios', 'etiquetas'];
    let todoValido = true;
    let primerCampoConError = null;

    campos.forEach(nombreCampo => {
      const esValido = this.validateField(nombreCampo);
      if (!esValido) {
        todoValido = false;
        if (!primerCampoConError) {
          primerCampoConError = nombreCampo;
        }
      }
    });

    // Actualizar indicadores
    this.updateTabIndicators();

    // Si hay errores, ir al primer campo con error
    if (!todoValido && primerCampoConError) {
      const pestanaConError = this.obtenerPestanaDeCampo(primerCampoConError);
      this.switchToTab(pestanaConError);
      
      setTimeout(() => {
        const campo = this.form.querySelector(`#${primerCampoConError}`);
        if (campo) {
          campo.focus();
          campo.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }

    return todoValido;
  },

  /**
   * Obtiene la pestaña que contiene un campo específico
   */
  obtenerPestanaDeCampo(nombreCampo) {
    const mapaCamposPestanas = {
      titulo: 'basico',
      etiquetas: 'basico',
      letra: 'letra',
      acordes: 'acordes',
      melodia: 'melodia',
      audios: 'audios'
    };
    
    return mapaCamposPestanas[nombreCampo] || 'basico';
  },

  /**
   * Recopila todos los datos del formulario
   */
  recopilarDatosFormulario() {
    const formularioData = new FormData(this.form);
    const datos = {};
    
    for (const [clave, valor] of formularioData.entries()) {
      datos[clave] = valor;
    }
    
    // Convertir ID a número si existe
    if (datos.id) {
      datos.id = parseInt(datos.id);
    }
    
    return datos;
  },

  /**
   * Maneja la cancelación del formulario
   */
  manejarCancelacion() {
    if (this.estado.cambiosSinGuardar) {
      const confirmar = confirm(
        'Tienes cambios sin guardar. ¿Estás seguro de que quieres cancelar?'
      );
      if (!confirmar) {
        return;
      }
    }
    
    this.resetearFormulario();
    this.estado.cambiosSinGuardar = false;
    
    // Ocultar contenedor del formulario
    const formContainer = document.getElementById('form-container');
    if (formContainer) {
      formContainer.classList.add('hidden');
    }
  },

  /**
   * Muestra ayuda para acordes
   */
  mostrarAyudaAcordes() {
    const contenidoAyuda = `
      <div class="ayuda-modal">
        <div class="ayuda-content">
          <h4>Formato de Acordes</h4>
          <p>Usa corchetes para marcar acordes sobre la letra:</p>
          <ul>
            <li><strong>[C]</strong> - Do mayor</li>
            <li><strong>[Am]</strong> - La menor</li>
            <li><strong>[G7]</strong> - Sol séptima</li>
            <li><strong>[Dm7]</strong> - Re menor séptima</li>
            <li><strong>[F#]</strong> - Fa sostenido</li>
            <li><strong>[Bb]</strong> - Si bemol</li>
          </ul>
          <p><strong>Ejemplo:</strong></p>
          <pre>[C]Imagine there's no [Am]heaven
[F]It's easy if you [C]try</pre>
          <button type="button" class="btn-cerrar-ayuda">Cerrar</button>
        </div>
      </div>
    `;
    
    this.mostrarModal(contenidoAyuda);
  },

  /**
   * Muestra ayuda para audios
   */
  mostrarAyudaAudios() {
    const contenidoAyuda = `
      <div class="ayuda-modal">
        <div class="ayuda-content">
          <h4>Configuración de Audios</h4>
          <p>Puedes incluir:</p>
          <ul>
            <li><strong>URLs directas:</strong> https://ejemplo.com/audio.mp3</li>
            <li><strong>Descripciones:</strong> Versión acústica, etc.</li>
            <li><strong>Reproductor multipista:</strong></li>
          </ul>
          <p><strong>Ejemplo de reproductor:</strong></p>
          <pre>[reproductor: [
  {"id": "voz", "archivo": "voz.mp3", "nombre": "Voz"},
  {"id": "guitarra", "archivo": "guitarra.mp3", "nombre": "Guitarra"}
]]</pre>
          <button type="button" class="btn-cerrar-ayuda">Cerrar</button>
        </div>
      </div>
    `;
    
    this.mostrarModal(contenidoAyuda);
  },

  /**
   * Muestra un modal de ayuda
   */
  mostrarModal(contenido) {
    // Crear overlay
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = contenido;
    
    // Agregar estilos si no existen
    if (!document.getElementById('modal-styles')) {
      const styles = document.createElement('style');
      styles.id = 'modal-styles';
      styles.textContent = `
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          backdrop-filter: blur(5px);
        }
        
        .ayuda-modal {
          background: var(--bg-surface);
          border-radius: var(--radius-lg);
          max-width: 500px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
        }
        
        .ayuda-content {
          padding: 2rem;
        }
        
        .ayuda-content h4 {
          color: var(--accent-primary);
          margin-bottom: 1rem;
        }
        
        .ayuda-content ul {
          margin: 1rem 0;
          padding-left: 1.5rem;
        }
        
        .ayuda-content li {
          margin-bottom: 0.5rem;
        }
        
        .ayuda-content pre {
          background: var(--bg-elevated);
          padding: 1rem;
          border-radius: var(--radius-md);
          overflow-x: auto;
          margin: 1rem 0;
          font-family: var(--font-mono);
        }
        
        .btn-cerrar-ayuda {
          background: var(--accent-primary);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: var(--radius-md);
          cursor: pointer;
          margin-top: 1rem;
          transition: all var(--transition-smooth);
        }
        
        .btn-cerrar-ayuda:hover {
          background: var(--accent-secondary);
          transform: translateY(-2px);
        }
      `;
      document.head.appendChild(styles);
    }
    
    document.body.appendChild(overlay);
    
    // Cerrar modal
    const cerrarModal = () => {
      document.body.removeChild(overlay);
    };
    
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay || e.target.classList.contains('btn-cerrar-ayuda')) {
        cerrarModal();
      }
    });
    
    // Cerrar con Escape
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        cerrarModal();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
  },

  /**
   * Resetea el formulario a su estado inicial
   */
  resetearFormulario() {
    this.form.reset();
    this.clearValidationErrors();
    this.updateTabIndicators();
    this.switchToTab('basico');
    
    // Limpiar previews
    const previews = this.form.querySelectorAll('.etiquetas-preview, .acordes-preview');
    previews.forEach(preview => preview.innerHTML = '');
    
    // Resetear contadores
    const contadores = this.form.querySelectorAll('.character-counter');
    contadores.forEach(contador => {
      const texto = contador.textContent;
      const maximo = texto.split(' / ')[1];
      contador.textContent = `0 / ${maximo}`;
      contador.classList.remove('near-limit');
    });
  },

  /**
   * Limpia todos los errores de validación
   */
  clearValidationErrors() {
    const errorDivs = this.form.querySelectorAll('.field-error');
    errorDivs.forEach(div => {
      div.textContent = '';
      div.style.display = 'none';
    });

    const errorFields = this.form.querySelectorAll('.error');
    errorFields.forEach(field => field.classList.remove('error'));
  },

  /**
   * Registra el callback para creación de nuevas canciones
   */
  bindCreate(callback) {
    this.onCreateSubmit = callback;
  },

  /**
   * Registra el callback para edición de canciones existentes
   */
  bindEdit(callback) {
    this.onEditSubmit = callback;
  },

  /**
   * MÉTODO CORREGIDO: Precarga el formulario con los datos de la canción a editar
   * Maneja correctamente las entidades HTML para preservar el contenido original
   */
  populate(song) {
    // Limpiar formulario primero
    this.resetearFormulario();
    
    // Función helper para decodificar entidades HTML básicas
    const decodificarHTML = (texto) => {
      if (typeof texto !== 'string') return texto;
      
      return texto
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .replace(/&amp;/g, '&'); // Importante: &amp; debe ir al final
    };

    // Establecer valores - decodificando HTML donde sea necesario
    this.form.id.value = song.id || '';
    this.form.titulo.value = song.titulo || '';
    
    // CORRECIÓN CLAVE: Decodificar HTML en campos que pueden contenerlo
    this.form.letra.value = decodificarHTML(song.letra || '');
    this.form.acordes.value = decodificarHTML(song.acordes || '');
    this.form.melodia.value = decodificarHTML(song.melodia || '');
    this.form.audios.value = decodificarHTML(song.audios || '');
    
    // Manejar etiquetas tanto como array como string
    if (Array.isArray(song.tags)) {
      this.form.etiquetas.value = song.tags.join(', ');
    } else if (song.etiquetas) {
      this.form.etiquetas.value = song.etiquetas;
    } else if (song.tags) {
      this.form.etiquetas.value = song.tags;
    }
    
    // Actualizar texto del botón
    const submitText = this.form.querySelector('#submit-text');
    if (submitText) {
      submitText.textContent = song.id ? 'Actualizar Canción' : 'Guardar Canción';
    }

    // Actualizar contadores de caracteres
    this.actualizarContadores();
    
    // Actualizar previews
    this.actualizarPreview('etiquetas');
    this.actualizarPreview('acordes');
    
    // Actualizar indicadores
    this.updateTabIndicators();
    
    // Ir a la primera pestaña
    this.switchToTab('basico');
    
    // Marcar datos originales para detectar cambios
    this.estado.datosOriginales = { ...song };
    this.estado.cambiosSinGuardar = false;

    console.log('✅ Formulario cargado con datos decodificados:', {
      id: song.id,
      titulo: song.titulo,
      letra: this.form.letra.value.substring(0, 100) + '...',
      acordes: this.form.acordes.value.substring(0, 50) + '...'
    });
  },

  /**
   * Actualiza todos los contadores de caracteres
   */
  actualizarContadores() {
    const camposConContador = ['letra', 'acordes', 'melodia', 'audios'];
    
    camposConContador.forEach(nombreCampo => {
      const campo = this.form.querySelector(`#${nombreCampo}`);
      const contador = this.form.querySelector(`#contador-${nombreCampo}`);
      
      if (campo && contador) {
        const longitud = campo.value.length;
        const maximo = parseInt(campo.getAttribute('maxlength')) || 0;
        contador.textContent = `${longitud.toLocaleString()} / ${maximo.toLocaleString()}`;
        
        if (longitud > maximo * 0.9) {
          contador.classList.add('near-limit');
        } else {
          contador.classList.remove('near-limit');
        }
      }
    });
  },

  /**
   * Obtiene los datos actuales del formulario
   */
  obtenerDatosActuales() {
    return {
      id: this.form.id.value || null,
      titulo: this.form.titulo.value.trim(),
      letra: this.form.letra.value.trim(),
      acordes: this.form.acordes.value.trim(),
      melodia: this.form.melodia.value.trim(),
      audios: this.form.audios.value.trim(),
      etiquetas: this.form.etiquetas.value.trim()
    };
  },

  /**
   * Verifica si hay cambios sin guardar
   */
  hayCambiosSinGuardar() {
    return this.estado.cambiosSinGuardar;
  },

  /**
   * Destruye el formulario y limpia los event listeners
   */
  destroy() {
    // Remover event listeners globales
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
    
    // Limpiar el formulario del DOM
    if (this.form && this.form.parentNode) {
      this.form.parentNode.removeChild(this.form);
    }
    
    // Limpiar referencias
    this.form = null;
    this.container = null;
    this.onCreateSubmit = null;
    this.onEditSubmit = null;
    
    // Resetear estado
    this.estado = {
      pestanaActiva: 'basico',
      datosOriginales: {},
      validacionEnTiempoReal: true,
      cambiosSinGuardar: false
    };
  },

  /**
   * Método de utilidad para mostrar/ocultar el formulario
   */
  mostrar() {
    const formContainer = document.getElementById('form-container');
    if (formContainer) {
      formContainer.classList.remove('hidden');
    }
  },

  /**
   * Método de utilidad para ocultar el formulario
   */
  ocultar() {
    const formContainer = document.getElementById('form-container');
    if (formContainer) {
      formContainer.classList.add('hidden');
    }
  },

  /**
   * Obtiene el estado actual del formulario
   */
  obtenerEstado() {
    return {
      ...this.estado,
      datosActuales: this.obtenerDatosActuales(),
      esValido: this.validateForm()
    };
  },

  /**
   * Enfoca el primer campo con error
   */
  enfocarPrimerError() {
    const campoConError = this.form.querySelector('.error');
    if (campoConError) {
      const pestana = this.obtenerPestanaDeCampo(campoConError.id);
      this.switchToTab(pestana);
      setTimeout(() => {
        campoConError.focus();
        campoConError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  },

  /**
   * Método para validación personalizada específica
   */
  validarCampoCustom(nombreCampo, valor, reglaCustom) {
    if (!reglaCustom) return { esValido: true, errores: [] };
    
    try {
      const resultado = reglaCustom(valor);
      return resultado;
    } catch (error) {
      console.error('Error en validación custom:', error);
      return { esValido: false, errores: ['Error en validación'] };
    }
  }
};