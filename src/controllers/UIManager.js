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
   * Muestra el modal con la información de la canción
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

      // Mostrar letra
      const tabLetra = document.getElementById('tab-letra');
      if (tabLetra) {
        tabLetra.innerHTML = `<pre style="white-space: pre-wrap;">${cancion.letra || 'Sin letra disponible'}</pre>`;
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
      
      // Mostrar melodía
      const tabMelodia = document.getElementById('tab-melodia');
      if (tabMelodia) {
        tabMelodia.innerHTML = `<pre>${cancion.melodia || 'Sin información de melodía'}</pre>`;
      }
      
      // Mostrar audios
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

  /**
   * Genera botones de filtro por etiquetas
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
    
    todasLasEtiquetas.forEach(etiqueta => {
      const boton = document.createElement('button');
      boton.textContent = etiqueta;
      boton.className = this.etiquetasSeleccionadas.has(etiqueta) 
        ? 'filter-btn active' 
        : 'filter-btn';
      boton.setAttribute('aria-pressed', this.etiquetasSeleccionadas.has(etiqueta));
      boton.setAttribute('title', `Filtrar por: ${etiqueta}`);
      
      boton.addEventListener('click', () => {
        this.alternarEtiqueta(etiqueta);
      });
      
      contenedor.appendChild(boton);
    });

    appEvents.emit('ui:filters_updated', { tags: todasLasEtiquetas });
  }

  /**
   * Alterna el estado de una etiqueta de filtro
   */
  alternarEtiqueta(etiqueta) {
    if (this.etiquetasSeleccionadas.has(etiqueta)) {
      this.etiquetasSeleccionadas.delete(etiqueta);
    } else {
      this.etiquetasSeleccionadas.add(etiqueta);
    }
    
    this.generarBotonesEtiquetas();
    this.updateSongList();

    appEvents.emit('ui:filter_changed', { 
      selectedTags: Array.from(this.etiquetasSeleccionadas) 
    });
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
      // Separar secciones de texto y JSON de reproductor
      const partes = cancion.audios.split(/\[reproductor:\s*(\[[\s\S]*?\])\]/);
      
      partes.forEach((parte, indice) => {
        if (indice % 2 === 0) {
          // Texto normal
          if (parte.trim()) {
            const div = document.createElement('div');
            div.className = 'audio-text';
            div.innerHTML = parte.trim().replace(/\n/g, '<br>');
            tabAudios.appendChild(div);
          }
        } else {
          // Configuración del reproductor
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
      
      // Si no se procesó nada, mostrar el texto tal como está
      if (tabAudios.children.length === 0) {
        const div = document.createElement('div');
        div.className = 'audio-text';
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