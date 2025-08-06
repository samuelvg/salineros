// src/controllers/UIManager.js
import { SongListView } from '../ui/songListView.js';
import { SongFormView } from '../ui/songFormView.js';
import { AppStatusView } from '../ui/appStatusView.js';
import { procesarCancion } from '../ui/chordParser.js';
import { mostrarAcordesUtilizados } from '../ui/chordRenderer.js';
import { crearReproductorMultipista } from '../ui/multiTrackPlayer.js';
import notificacionService from '../services/notificacionService.js';
import { appEvents } from '../core/EventSystem.js';

export class UIManager {
  constructor(appController) {
    this.app = appController;
    this.elementosUI = {};
    this.etiquetasSeleccionadas = new Set();
    this.subscriptions = [];
  }

  /**
   * Crea la interfaz adaptándose al HTML existente
   */
  async createInterface() {
    try {
      await this.crearElementosUIAdaptados();
      this.configurarEventos();
      this.initializeViews();
      
      appEvents.emit('ui:initialized');
    } catch (error) {
      console.error('Error al crear interfaz:', error);
      appEvents.emit('ui:error', { error, context: 'createInterface' });
    }
  }

  /**
   * Inicializa las vistas
   */
  initializeViews() {
    // Inicializar barra de estado
    AppStatusView.init();
    
    // Inicializar formulario
    this.inicializarFormulario();
    
    // Configurar SongListView con el manejador de selección
    SongListView.bindSelect(id => {
      this.app.songManager.setCurrentSong(id);
      this.mostrarModal(this.app.songManager.getCurrentSong());
    });

    appEvents.emit('ui:views_initialized');
  }

  /**
   * Actualiza la lista de canciones
   */
  updateSongList() {
    const canciones = this.app.songManager.getAllSongs();
    const listaFiltrada = this.aplicarFiltrosEtiquetas(canciones);
    
    SongListView.render(listaFiltrada);
    this.generarBotonesEtiquetas();
    
    appEvents.emit('ui:song_list_updated', { count: listaFiltrada.length });
  }

  /**
   * MÉTODO CORREGIDO: Muestra el modal con la información de la canción
   * Maneja correctamente el HTML en los campos apropiados
   */
  mostrarModal(cancion) {
    if (!cancion) {
      console.warn('No se puede mostrar modal: canción no encontrada');
      return;
    }

    const modal = this.elementosUI.modal;
    
    try {
      // Actualizar contenido del modal
      const tituloModal = document.getElementById('modal-title');
      if (tituloModal) {
        tituloModal.textContent = cancion.titulo;
      }

      // CORRECCIÓN: Mostrar letra con HTML renderizado
      const tabLetra = document.getElementById('tab-letra');
      if (tabLetra) {
        // La letra puede contener HTML como <strong>, <em>, <br>, etc.
        // La mostramos como HTML, no como texto plano
        const letraHTML = cancion.letra || 'Sin letra disponible';
        tabLetra.innerHTML = `<div class="letra-content" style="white-space: pre-wrap; font-family: var(--font-mono); line-height: 1.6;">${letraHTML}</div>`;
      }

      // Procesar acordes
      const tabAcordes = document.getElementById('tab-acordes');
      if (tabAcordes) {
        try {
          tabAcordes.innerHTML = procesarCancion(cancion.acordes || '');
          
          const contenedorDiagramas = document.createElement('div');
          contenedorDiagramas.className = 'diagram-container';
          tabAcordes.appendChild(contenedorDiagramas);
          
          if (cancion.acordes) {
            mostrarAcordesUtilizados(cancion.acordes, contenedorDiagramas);
          }
        } catch (error) {
          console.error('Error al procesar acordes:', error);
          tabAcordes.innerHTML = '<p class="error-audio">Error al procesar los acordes</p>';
        }
      }
      
      // CORRECCIÓN: Mostrar melodía con HTML renderizado
      const tabMelodia = document.getElementById('tab-melodia');
      if (tabMelodia) {
        const melodiaHTML = cancion.melodia || 'Sin información de melodía';
        tabMelodia.innerHTML = `<div class="melodia-content" style="white-space: pre-wrap; font-family: var(--font-mono); line-height: 1.6;">${melodiaHTML}</div>`;
      }
      
      // Mostrar audios (ya manejaba HTML correctamente)
      this.mostrarAudios(cancion);

      // Resetear pestañas
      this.cambiarPestanaModal('letra');
      
      // Mostrar modal
      modal.classList.remove('hidden');
      
      // Enfocar para accesibilidad
      const botonCerrar = modal.querySelector('.modal-close');
      if (botonCerrar) {
        botonCerrar.focus();
      }

      appEvents.emit('ui:modal:open', { modalType: 'song', song: cancion });
      
    } catch (error) {
      console.error('Error al mostrar modal:', error);
      notificacionService.error(
        'Error al mostrar canción',
        'No se pudo cargar toda la información de la canción'
      );
      appEvents.emit('ui:modal:error', { error, song: cancion });
    }
  }

  /**
   * Cierra el modal
   */
  cerrarModal() {
    this.elementosUI.modal.classList.add('hidden');
    this.app.songManager.cancionActual = null;
    
    // Devolver el foco al elemento que activó el modal si es posible
    const cancionActivaEnLista = document.querySelector('.song-btn[data-id]');
    if (cancionActivaEnLista) {
      cancionActivaEnLista.focus();
    }

    appEvents.emit('ui:modal:close', { modalType: 'song' });
  }

  /**
   * Muestra el formulario para nueva canción
   */
  mostrarFormularioNuevaCancion() {
    const tituloFormulario = document.getElementById('form-title');
    if (tituloFormulario) {
      tituloFormulario.textContent = 'Nueva Canción';
    }
    
    SongFormView.populate({});
    this.elementosUI.contenedorFormulario.classList.remove('hidden');
    
    // Enfocar primer campo después de un pequeño delay para que se renderice
    setTimeout(() => {
      const primerCampo = document.getElementById('titulo');
      if (primerCampo) {
        primerCampo.focus();
      }
    }, 100);

    appEvents.emit('ui:form:open', { formType: 'create' });
  }

  /**
   * Muestra el formulario para editar canción
   */
  mostrarFormularioEditarCancion() {
    const cancionActual = this.app.songManager.getCurrentSong();
    if (!cancionActual) return;
    
    this.cerrarModal();
    
    const tituloFormulario = document.getElementById('form-title');
    if (tituloFormulario) {
      tituloFormulario.textContent = 'Editar Canción';
    }
    
    SongFormView.populate(cancionActual);
    this.elementosUI.contenedorFormulario.classList.remove('hidden');
    
    // Enfocar primer campo
    setTimeout(() => {
      const primerCampo = document.getElementById('titulo');
      if (primerCampo) {
        primerCampo.focus();
      }
    }, 100);

    appEvents.emit('ui:form:open', { formType: 'edit', song: cancionActual });
  }

  /**
   * Cierra el formulario
   */
  cerrarFormulario() {
    this.elementosUI.contenedorFormulario.classList.add('hidden');
    
    if (SongFormView.form) {
      SongFormView.form.reset();
    }
    
    // Devolver el foco al botón de agregar canción
    setTimeout(() => {
      this.elementosUI.botonAgregar.focus();
    }, 100);

    appEvents.emit('ui:form:close');
  }

  // =================================
// Actualización para src/controllers/UIManager.js 
// Método generarBotonesEtiquetas mejorado con botón limpiar
// =================================

/**
 * MÉTODO MEJORADO: Genera botones de filtro por etiquetas con funcionalidades adicionales
 */
generarBotonesEtiquetas() {
  const contenedor = document.getElementById('filter-container');
  if (!contenedor) {
    console.warn('No se encontró el contenedor de filtros');
    return;
  }
  
  contenedor.innerHTML = '';
  
  const todasLasEtiquetas = this.app.songManager.getAllTags();
  
  if (todasLasEtiquetas.length === 0) {
    contenedor.style.display = 'none';
    return;
  }
  
  contenedor.style.display = 'flex';
  
  // AÑADIR botón "Limpiar filtros" si hay etiquetas seleccionadas
  if (this.etiquetasSeleccionadas.size > 0) {
    const botonLimpiar = document.createElement('button');
    botonLimpiar.textContent = `✕ Limpiar (${this.etiquetasSeleccionadas.size})`;
    botonLimpiar.className = 'filter-btn filter-clear';
    botonLimpiar.setAttribute('title', 'Limpiar todos los filtros');
    botonLimpiar.setAttribute('aria-label', `Limpiar ${this.etiquetasSeleccionadas.size} filtros activos`);
    
    botonLimpiar.addEventListener('click', () => {
      this.limpiarFiltros();
    });
    
    contenedor.appendChild(botonLimpiar);
  }
  
  // Generar botones para cada etiqueta
  todasLasEtiquetas.forEach((etiqueta, index) => {
    const boton = document.createElement('button');
    const estaActiva = this.etiquetasSeleccionadas.has(etiqueta);
    
    // Texto del botón con contador si está activa
    boton.textContent = etiqueta;
    if (estaActiva) {
      const contador = document.createElement('span');
      contador.className = 'filter-counter';
      contador.textContent = '✓';
      contador.setAttribute('aria-label', 'Filtro activo');
      boton.appendChild(contador);
    }
    
    boton.className = estaActiva ? 'filter-btn active' : 'filter-btn';
    boton.setAttribute('aria-pressed', estaActiva);
    boton.setAttribute('title', `Filtrar por: ${etiqueta}`);
    boton.setAttribute('data-etiqueta', etiqueta);
    
    // Añadir delay de animación escalonada
    boton.style.animationDelay = `${index * 0.05}s`;
    
    boton.addEventListener('click', () => {
      this.alternarEtiqueta(etiqueta);
    });
    
    // Mejorar accesibilidad con teclado
    boton.addEventListener('keydown', (evento) => {
      if (evento.key === 'Enter' || evento.key === ' ') {
        evento.preventDefault();
        this.alternarEtiqueta(etiqueta);
      }
    });
    
    contenedor.appendChild(boton);
  });

  // Emitir evento para estadísticas
  appEvents.emit('ui:filters_updated', { 
    tags: todasLasEtiquetas,
    selectedCount: this.etiquetasSeleccionadas.size,
    totalCount: todasLasEtiquetas.length
  });
}

/**
 * MÉTODO NUEVO: Limpia todos los filtros activos
 */
limpiarFiltros() {
  const etiquetasAnteriores = new Set(this.etiquetasSeleccionadas);
  
  this.etiquetasSeleccionadas.clear();
  this.generarBotonesEtiquetas();
  this.updateSongList();
  
  // Mostrar notificación de confirmación
  notificacionService.informacion(
    'Filtros limpiados',
    `Se quitaron ${etiquetasAnteriores.size} filtro(s) activo(s)`
  );
  
  appEvents.emit('ui:filters_cleared', { 
    previousTags: Array.from(etiquetasAnteriores) 
  });
}

/**
 * MÉTODO MEJORADO: Alterna el estado de una etiqueta de filtro
 */
alternarEtiqueta(etiqueta) {
  const estabaActiva = this.etiquetasSeleccionadas.has(etiqueta);
  
  if (estabaActiva) {
    this.etiquetasSeleccionadas.delete(etiqueta);
  } else {
    this.etiquetasSeleccionadas.add(etiqueta);
  }
  
  // Regenerar botones con animación
  this.generarBotonesEtiquetas();
  this.updateSongList();
  
  // Feedback al usuario
  const mensaje = estabaActiva 
    ? `Filtro "${etiqueta}" desactivado`
    : `Filtro "${etiqueta}" activado`;
    
  // Solo mostrar notificación en modo debug o si hay muchos filtros
  if (this.etiquetasSeleccionadas.size > 3) {
    notificacionService.informacion('Filtro actualizado', mensaje);
  }

  appEvents.emit('ui:filter_changed', { 
    etiqueta,
    accion: estabaActiva ? 'removed' : 'added',
    selectedTags: Array.from(this.etiquetasSeleccionadas),
    totalSelected: this.etiquetasSeleccionadas.size
  });
}

/**
 * MÉTODO NUEVO: Obtiene estadísticas de filtros
 */
obtenerEstadisticasFiltros() {
  const todasLasEtiquetas = this.app.songManager.getAllTags();
  const cancionesFiltradas = this.aplicarFiltrosEtiquetas(this.app.songManager.getAllSongs());
  
  return {
    totalEtiquetas: todasLasEtiquetas.length,
    etiquetasSeleccionadas: this.etiquetasSeleccionadas.size,
    cancionesTotales: this.app.songManager.getAllSongs().length,
    cancionesFiltradas: cancionesFiltradas.length,
    porcentajeFiltrado: Math.round((cancionesFiltradas.length / this.app.songManager.getAllSongs().length) * 100)
  };
}

/**
 * MÉTODO NUEVO: Aplicar filtro rápido por etiqueta específica
 */
aplicarFiltroRapido(etiqueta) {
  // Limpiar filtros anteriores
  this.etiquetasSeleccionadas.clear();
  
  // Aplicar solo esta etiqueta
  if (etiqueta && etiqueta.trim()) {
    this.etiquetasSeleccionadas.add(etiqueta.trim());
  }
  
  this.generarBotonesEtiquetas();
  this.updateSongList();
  
  appEvents.emit('ui:quick_filter_applied', { etiqueta });
}

/**
 * MÉTODO NUEVO: Obtener sugerencias de etiquetas basadas en canciones visibles
 */
obtenerSugerenciasEtiquetas() {
  const cancionesVisibles = this.aplicarFiltrosEtiquetas(this.app.songManager.getAllSongs());
  const etiquetasSugeridas = new Set();
  
  cancionesVisibles.forEach(cancion => {
    cancion.tags.forEach(tag => {
      if (!this.etiquetasSeleccionadas.has(tag)) {
        etiquetasSugeridas.add(tag);
      }
    });
  });
  
  return Array.from(etiquetasSugeridas).sort();
}

  /**
   * Muestra notificaciones de éxito
   */
  showSuccess(titulo, mensaje) {
    notificacionService.exito(titulo, mensaje);
  }

  /**
   * Muestra notificaciones de error
   */
  showError(titulo, mensaje) {
    notificacionService.error(titulo, mensaje);
  }

  // ======= MÉTODOS PRIVADOS =======

  async crearElementosUIAdaptados() {
    // Verificar si los elementos ya existen del HTML original
    this.elementosUI.modal = document.getElementById('song-modal') || this.crearModal();
    this.elementosUI.botonAgregar = document.getElementById('btn-add-song') || this.crearBotonAgregar();
    this.elementosUI.contenedorFormulario = document.getElementById('form-container') || this.crearContenedorFormulario();
  }

  crearModal() {
    const modal = document.createElement('div');
    modal.id = 'song-modal';
    modal.className = 'modal hidden';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'modal-title');
    
    modal.innerHTML = `
      <div class="modal-content">
        <button class="modal-close" aria-label="Cerrar modal">&times;</button>
        <h2 id="modal-title"></h2>
        
        <div class="modal-tabs" role="tablist">
          <button class="tab-btn active" data-tab="letra" role="tab" aria-selected="true" aria-controls="tab-letra">
            Letra
          </button>
          <button class="tab-btn" data-tab="acordes" role="tab" aria-selected="false" aria-controls="tab-acordes">
            Acordes
          </button>
          <button class="tab-btn" data-tab="melodia" role="tab" aria-selected="false" aria-controls="tab-melodia">
            Melodía
          </button>
          <button class="tab-btn" data-tab="audios" role="tab" aria-selected="false" aria-controls="tab-audios">
            Audios
          </button>
        </div>
        
        <div class="modal-body">
          <div class="tab-content active" id="tab-letra" role="tabpanel" aria-labelledby="tab-letra"></div>
          <div class="tab-content" id="tab-acordes" role="tabpanel" aria-labelledby="tab-acordes"></div>
          <div class="tab-content" id="tab-melodia" role="tabpanel" aria-labelledby="tab-melodia"></div>
          <div class="tab-content" id="tab-audios" role="tabpanel" aria-labelledby="tab-audios"></div>
        </div>
        
        <div class="modal-actions">
          <button id="btn-edit-song" class="btn-action btn-edit">
            <span>✏️</span> Editar
          </button>
          <button id="btn-delete-song" class="btn-action btn-delete">
            <span>🗑️</span> Eliminar
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    return modal;
  }

  crearBotonAgregar() {
    const boton = document.createElement('button');
    boton.id = 'btn-add-song';
    boton.className = 'btn-add-floating';
    boton.setAttribute('aria-label', 'Agregar nueva canción');
    boton.innerHTML = `
      <span class="add-icon">+</span>
      <span class="add-text">Nueva Canción</span>
    `;
    
    document.body.appendChild(boton);
    return boton;
  }

  crearContenedorFormulario() {
    const contenedor = document.createElement('div');
    contenedor.id = 'form-container';
    contenedor.className = 'form-container hidden';
    contenedor.setAttribute('role', 'dialog');
    contenedor.setAttribute('aria-modal', 'true');
    
    contenedor.innerHTML = `
      <div class="form-header">
        <h3 id="form-title">Nueva Canción</h3>
        <button id="btn-close-form" class="btn-close-form" aria-label="Cerrar formulario">&times;</button>
      </div>
      <div id="form-content"></div>
    `;
    
    document.body.insertBefore(contenedor, this.elementosUI.botonAgregar || document.body.lastChild);
    return contenedor;
  }

  configurarEventos() {
    // Eventos del modal
    this.configurarEventosModal();
    
    // Eventos del formulario
    this.configurarEventosFormulario();
  }

  configurarEventosModal() {
    const modal = this.elementosUI.modal;
    
    // Cerrar modal
    const botonCerrar = modal.querySelector('.modal-close');
    if (botonCerrar) {
      botonCerrar.addEventListener('click', () => {
        this.cerrarModal();
      });
    }
    
    // Cerrar modal con Escape
    modal.addEventListener('keydown', (evento) => {
      if (evento.key === 'Escape') {
        this.cerrarModal();
      }
    });
    
    // Gestión de pestañas
    modal.querySelectorAll('.tab-btn').forEach(boton => {
      boton.addEventListener('click', () => {
        this.cambiarPestanaModal(boton.dataset.tab);
      });
    });
    
    // Botones de acción
    const botonEditar = modal.querySelector('#btn-edit-song');
    const botonEliminar = modal.querySelector('#btn-delete-song');
    
    if (botonEditar) {
      botonEditar.addEventListener('click', () => {
        this.mostrarFormularioEditarCancion();
      });
    }
    
    if (botonEliminar) {
      botonEliminar.addEventListener('click', async () => {
        const cancionActual = this.app.songManager.getCurrentSong();
        if (!cancionActual) return;
        
        const confirmar = await this.mostrarDialogoConfirmacion(
          '¿Eliminar canción?',
          `¿Estás seguro de que quieres eliminar "${cancionActual.titulo}"? Esta acción no se puede deshacer.`
        );
        
        if (confirmar) {
          try {
            await this.app.songManager.delete(cancionActual.id);
            this.cerrarModal();
            this.updateSongList();
          } catch (error) {
            // El error ya se maneja en SongManager
          }
        }
      });
    }
  }

  configurarEventosFormulario() {
    // Botón agregar canción
    this.elementosUI.botonAgregar.addEventListener('click', () => {
      this.mostrarFormularioNuevaCancion();
    });
    
    // Cerrar formulario
    const botonCerrar = this.elementosUI.contenedorFormulario.querySelector('#btn-close-form');
    if (botonCerrar) {
      botonCerrar.addEventListener('click', () => {
        this.cerrarFormulario();
      });
    }
  }

  inicializarFormulario() {
    const contenidoFormulario = document.getElementById('form-content');
    if (!contenidoFormulario) {
      console.error('No se encontró el contenedor del formulario');
      return;
    }
    
    SongFormView.init(contenidoFormulario);
    
    // Configurar callbacks del formulario
    SongFormView.bindCreate(async (datos) => {
      try {
        await this.app.songManager.create(datos);
        this.cerrarFormulario();
        this.updateSongList();
      } catch (error) {
        // El error ya se maneja en SongManager
      }
    });
    
    SongFormView.bindEdit(async (datos) => {
      try {
        await this.app.songManager.update(datos.id, datos);
        this.cerrarFormulario();
        this.updateSongList();
      } catch (error) {
        // El error ya se maneja en SongManager
      }
    });
  }

  mostrarAudios(cancion) {
    const tabAudios = document.getElementById('tab-audios');
    if (!tabAudios) return;
    
    tabAudios.innerHTML = '';
    
    if (!cancion.audios || !cancion.audios.trim()) {
      tabAudios.innerHTML = '<p class="no-content">No hay audios disponibles para esta canción.</p>';
      return;
    }
    
    try {
      // Detectar si contiene configuración de reproductor multipista
      const tieneReproductor = /\[reproductor:\s*(\[[\s\S]*?\])\]/.test(cancion.audios);
      
      if (tieneReproductor) {
        // Procesamiento para reproductor multipista (como antes)
        const partes = cancion.audios.split(/\[reproductor:\s*(\[[\s\S]*?\])\]/);
        
        partes.forEach((parte, indice) => {
          if (indice % 2 === 0) {
            // Texto normal - RENDERIZAR COMO HTML
            if (parte.trim()) {
              const div = document.createElement('div');
              div.className = 'audio-text';
              // CAMBIO CLAVE: usar innerHTML en lugar de textContent con <br>
              div.innerHTML = parte.trim().replace(/\n/g, '<br>');
              tabAudios.appendChild(div);
            }
          } else {
            // Configuración del reproductor multipista
            let configuracion;
            try {
              configuracion = JSON.parse(parte);
            } catch (error) {
              console.error('JSON inválido en configuración de audios:', error);
              const mensajeError = document.createElement('p');
              mensajeError.textContent = 'Error: Configuración de reproductor inválida';
              mensajeError.className = 'error-audio';
              tabAudios.appendChild(mensajeError);
              return;
            }
            
            const contenedorReproductor = document.createElement('div');
            contenedorReproductor.className = 'multiTrackPlayer';
            tabAudios.appendChild(contenedorReproductor);
            
            try {
              crearReproductorMultipista(configuracion, contenedorReproductor);
            } catch (error) {
              console.error('Error al crear reproductor:', error);
              contenedorReproductor.innerHTML = '<p class="error-audio">Error al cargar el reproductor de audio</p>';
            }
          }
        });
      } else {
        // No hay reproductor multipista, mostrar todo como HTML
        const div = document.createElement('div');
        div.className = 'audio-text';
        // CAMBIO CLAVE: usar innerHTML para renderizar tags HTML como <audio>
        div.innerHTML = cancion.audios.replace(/\n/g, '<br>');
        tabAudios.appendChild(div);
      }
      
    } catch (error) {
      console.error('Error al procesar audios:', error);
      tabAudios.innerHTML = '<p class="error-audio">Error al procesar los audios de la canción</p>';
    }
  }

  cambiarPestanaModal(nombrePestana) {
    const modal = this.elementosUI.modal;
    
    // Actualizar botones de pestañas
    modal.querySelectorAll('.tab-btn').forEach(boton => {
      const esActiva = boton.dataset.tab === nombrePestana;
      boton.classList.toggle('active', esActiva);
      boton.setAttribute('aria-selected', esActiva);
    });

    // Actualizar contenido de pestañas
    modal.querySelectorAll('.tab-content').forEach(contenido => {
      const esActiva = contenido.id === `tab-${nombrePestana}`;
      contenido.classList.toggle('active', esActiva);
    });
  }

  aplicarFiltrosEtiquetas(canciones) {
    if (this.etiquetasSeleccionadas.size === 0) {
      return canciones;
    }

    return canciones.filter(cancion =>
      Array.from(this.etiquetasSeleccionadas).every(etiqueta =>
        cancion.tags.includes(etiqueta)
      )
    );
  }

  mostrarDialogoConfirmacion(titulo, mensaje) {
    return new Promise((resolve) => {
      notificacionService.mostrar({
        tipo: 'advertencia',
        titulo,
        mensaje,
        persistente: true,
        acciones: [
          {
            texto: 'Cancelar',
            callback: () => resolve(false)
          },
          {
            texto: 'Confirmar',
            callback: () => resolve(true)
          }
        ]
      });
    });
  }

  destroy() {
    this.subscriptions.forEach(unsub => unsub());
    this.subscriptions = [];
    
    // Limpiar elementos UI
    Object.values(this.elementosUI).forEach(elemento => {
      if (elemento && elemento.parentNode) {
        elemento.parentNode.removeChild(elemento);
      }
    });
    
    this.elementosUI = {};
    this.etiquetasSeleccionadas.clear();
  }
}