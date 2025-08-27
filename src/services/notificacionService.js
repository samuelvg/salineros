// =================================
// Archivo: /src/services/notificacionService.js
// Sistema de notificaciones mejorado con diferentes tipos y persistencia
// =================================

export class NotificacionService {
  constructor() {
    this.contenedorNotificaciones = null;
    this.notificacionesActivas = new Map();
    this.contadorId = 0;
    this.configuracion = {
      duracionPorDefecto: 4000,
      maxNotificaciones: 5,
      posicion: 'bottom-center',
      animacionEntrada: 'slideUp',
      animacionSalida: 'slideDown'
    };
    
    this.inicializar();
  }

  /**
   * Inicializa el contenedor de notificaciones
   */
  inicializar() {
    this.contenedorNotificaciones = document.createElement('div');
    this.contenedorNotificaciones.id = 'contenedor-notificaciones';
    this.contenedorNotificaciones.className = 'contenedor-notificaciones';
    this.contenedorNotificaciones.setAttribute('aria-live', 'polite');
    this.contenedorNotificaciones.setAttribute('aria-label', 'Notificaciones');
    
    // Estilos CSS integrados
    this.inyectarEstilos();
    
    document.body.appendChild(this.contenedorNotificaciones);
  }

  /**
   * Inyecta estilos CSS para las notificaciones
   */
  inyectarEstilos() {
    const estilos = document.createElement('style');
    estilos.id = 'estilos-notificaciones';
    estilos.textContent = `
      .contenedor-notificaciones {
        position: fixed;
        bottom: 2rem;
        left: 50%;
        transform: translateX(-50%);
        z-index: 10000;
        pointer-events: none;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        max-width: 90vw;
        width: auto;
      }

      .notificacion {
        pointer-events: auto;
        background: var(--bg-surface, #1a1a1a);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: var(--radius-md, 12px);
        padding: 1rem 1.25rem;
        box-shadow: var(--shadow-strong, 0 8px 32px rgba(0, 0, 0, 0.5));
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        min-width: 300px;
        max-width: 500px;
        
        opacity: 0;
        transform: translateY(100px);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .notificacion.visible {
        opacity: 1;
        transform: translateY(0);
      }

      .notificacion.saliendo {
        opacity: 0;
        transform: translateY(-20px) scale(0.95);
      }

      .icono-notificacion {
        flex-shrink: 0;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.8rem;
        font-weight: bold;
        margin-top: 0.1rem;
      }

      .contenido-notificacion {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .titulo-notificacion {
        font-weight: 600;
        font-size: 0.9rem;
        line-height: 1.3;
        margin: 0;
      }

      .mensaje-notificacion {
        font-size: 0.85rem;
        line-height: 1.4;
        opacity: 0.9;
        margin: 0;
      }

      .acciones-notificacion {
        display: flex;
        gap: 0.5rem;
        margin-top: 0.5rem;
      }

      .boton-notificacion {
        background: transparent;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 6px;
        padding: 0.25rem 0.75rem;
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .boton-notificacion:hover {
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.3);
      }

      .boton-cerrar {
        position: absolute;
        top: 0.5rem;
        right: 0.75rem;
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.6);
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0.25rem;
        line-height: 1;
        transition: color 0.2s ease;
      }

      .boton-cerrar:hover {
        color: rgba(255, 255, 255, 0.9);
      }

      .barra-progreso {
        position: absolute;
        bottom: 0;
        left: 0;
        height: 3px;
        background: var(--accent-primary, #00d4aa);
        border-radius: 0 0 12px 12px;
        transition: width linear;
      }

      /* Tipos de notificación */
      .notificacion.exito {
        border-left: 4px solid var(--success, #4caf50);
      }
      .notificacion.exito .icono-notificacion {
        background: var(--success, #4caf50);
        color: white;
      }

      .notificacion.error {
        border-left: 4px solid var(--error, #f44336);
      }
      .notificacion.error .icono-notificacion {
        background: var(--error, #f44336);
        color: white;
      }

      .notificacion.advertencia {
        border-left: 4px solid var(--warning, #ff9800);
      }
      .notificacion.advertencia .icono-notificacion {
        background: var(--warning, #ff9800);
        color: white;
      }

      .notificacion.info {
        border-left: 4px solid var(--info, #2196f3);
      }
      .notificacion.info .icono-notificacion {
        background: var(--info, #2196f3);
        color: white;
      }

      .notificacion.cargando {
        border-left: 4px solid var(--accent-primary, #00d4aa);
      }
      .notificacion.cargando .icono-notificacion {
        background: var(--accent-primary, #00d4aa);
        color: white;
        animation: girar 1s linear infinite;
      }

      @keyframes girar {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      /* Responsive */
      @media (max-width: 640px) {
        .contenedor-notificaciones {
          bottom: 1rem;
          left: 1rem;
          right: 1rem;
          transform: none;
          max-width: none;
        }
        
        .notificacion {
          min-width: auto;
          max-width: none;
        }
      }
    `;
    
    if (!document.getElementById('estilos-notificaciones')) {
      document.head.appendChild(estilos);
    }
  }

  /**
   * Muestra una notificación
   * @param {Object} opciones - Configuración de la notificación
   */
  mostrar({
    tipo = 'info',
    titulo = '',
    mensaje = '',
    duracion = this.configuracion.duracionPorDefecto,
    persistente = false,
    acciones = [],
    callback = null
  }) {
    const id = ++this.contadorId;

    // Limitar número de notificaciones
    if (this.notificacionesActivas.size >= this.configuracion.maxNotificaciones) {
      const primeraNotificacion = this.notificacionesActivas.keys().next().value;
      this.cerrar(primeraNotificacion);
    }

    const elementoNotificacion = this.crearElementoNotificacion({
      id,
      tipo,
      titulo,
      mensaje,
      acciones,
      persistente
    });

    this.contenedorNotificaciones.appendChild(elementoNotificacion);
    this.notificacionesActivas.set(id, {
      elemento: elementoNotificacion,
      timeout: null,
      callback
    });

    // Mostrar con animación
    requestAnimationFrame(() => {
      elementoNotificacion.classList.add('visible');
    });

    // Auto-cerrar si no es persistente
    if (!persistente && duracion > 0) {
      const timeout = setTimeout(() => {
        this.cerrar(id);
      }, duracion);

      this.notificacionesActivas.get(id).timeout = timeout;
      
      // Agregar barra de progreso
      this.agregarBarraProgreso(elementoNotificacion, duracion);
    }

    return id;
  }

  /**
   * Crea el elemento DOM de la notificación
   */
  crearElementoNotificacion({ id, tipo, titulo, mensaje, acciones, persistente }) {
    const elemento = document.createElement('div');
    elemento.className = `notificacion ${tipo}`;
    elemento.setAttribute('data-id', id);
    elemento.setAttribute('role', 'alert');

    const iconos = {
      exito: '✓',
      error: '✕',
      advertencia: '⚠',
      info: 'ℹ',
      cargando: '⟳'
    };

    elemento.innerHTML = `
      <div class="icono-notificacion">
        ${iconos[tipo] || iconos.info}
      </div>
      <div class="contenido-notificacion">
        ${titulo ? `<h4 class="titulo-notificacion">${titulo}</h4>` : ''}
        ${mensaje ? `<p class="mensaje-notificacion">${mensaje}</p>` : ''}
        ${acciones.length > 0 ? this.crearAcciones(acciones, id) : ''}
      </div>
      ${!persistente ? `<button class="boton-cerrar" aria-label="Cerrar notificación">&times;</button>` : ''}
    `;

    // Event listeners
    const botonCerrar = elemento.querySelector('.boton-cerrar');
    if (botonCerrar) {
      botonCerrar.addEventListener('click', () => this.cerrar(id));
    }

    // Event listeners para acciones
    const botonesAccion = elemento.querySelectorAll('[data-accion]');
    botonesAccion.forEach(boton => {
      boton.addEventListener('click', (e) => {
        const nombreAccion = e.target.getAttribute('data-accion');
        const accion = acciones.find(a => a.texto === nombreAccion);
        if (accion && accion.callback) {
          accion.callback();
        }
        if (accion && accion.cerrarDespues !== false) {
          this.cerrar(id);
        }
      });
    });

    return elemento;
  }

  /**
   * Crea HTML para las acciones de la notificación
   */
  crearAcciones(acciones, idNotificacion) {
    const accionesHTML = acciones.map(accion => 
      `<button class="boton-notificacion" data-accion="${accion.texto}">
        ${accion.texto}
      </button>`
    ).join('');

    return `<div class="acciones-notificacion">${accionesHTML}</div>`;
  }

  /**
   * Agrega barra de progreso a la notificación
   */
  agregarBarraProgreso(elemento, duracion) {
    const barraProgreso = document.createElement('div');
    barraProgreso.className = 'barra-progreso';
    barraProgreso.style.width = '100%';
    barraProgreso.style.transitionDuration = `${duracion}ms`;
    
    elemento.appendChild(barraProgreso);

    requestAnimationFrame(() => {
      barraProgreso.style.width = '0%';
    });
  }

  /**
   * Cierra una notificación específica
   */
  cerrar(id) {
    const notificacion = this.notificacionesActivas.get(id);
    if (!notificacion) return;

    const { elemento, timeout, callback } = notificacion;

    // Limpiar timeout si existe
    if (timeout) {
      clearTimeout(timeout);
    }

    // Ejecutar callback si existe
    if (callback) {
      callback();
    }

    // Animación de salida
    elemento.classList.add('saliendo');

    setTimeout(() => {
      if (elemento.parentNode) {
        elemento.parentNode.removeChild(elemento);
      }
      this.notificacionesActivas.delete(id);
    }, 300);
  }

  /**
   * Cierra todas las notificaciones
   */
  cerrarTodas() {
    const ids = Array.from(this.notificacionesActivas.keys());
    ids.forEach(id => this.cerrar(id));
  }

  /**
   * Métodos de conveniencia para diferentes tipos
   */
  exito(titulo, mensaje, opciones = {}) {
    return this.mostrar({
      tipo: 'exito',
      titulo,
      mensaje,
      ...opciones
    });
  }

  error(titulo, mensaje, opciones = {}) {
    return this.mostrar({
      tipo: 'error',
      titulo,
      mensaje,
      duracion: 6000, // Errores duran más
      ...opciones
    });
  }

  advertencia(titulo, mensaje, opciones = {}) {
    return this.mostrar({
      tipo: 'advertencia',
      titulo,
      mensaje,
      duracion: 5000,
      ...opciones
    });
  }

  informacion(titulo, mensaje, opciones = {}) {
    return this.mostrar({
      tipo: 'info',
      titulo,
      mensaje,
      ...opciones
    });
  }

  cargando(titulo, mensaje, opciones = {}) {
    return this.mostrar({
      tipo: 'cargando',
      titulo,
      mensaje,
      persistente: true, // Los mensajes de carga son persistentes por defecto
      ...opciones
    });
  }

  /**
   * Actualiza una notificación existente
   */
  actualizar(id, nuevasOpciones) {
    const notificacion = this.notificacionesActivas.get(id);
    if (!notificacion) return;

    // Cerrar la notificación actual
    this.cerrar(id);

    // Crear nueva notificación con las opciones actualizadas
    return this.mostrar(nuevasOpciones);
  }

  /**
   * Destruye el servicio de notificaciones
   */
  destruir() {
    this.cerrarTodas();
    
    if (this.contenedorNotificaciones && this.contenedorNotificaciones.parentNode) {
      this.contenedorNotificaciones.parentNode.removeChild(this.contenedorNotificaciones);
    }

    const estilos = document.getElementById('estilos-notificaciones');
    if (estilos && estilos.parentNode) {
      estilos.parentNode.removeChild(estilos);
    }

    this.notificacionesActivas.clear();
  }
}

// Crear instancia global
const notificacionService = new NotificacionService();
export default notificacionService;