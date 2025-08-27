// Archivo: src/ui/multiTrackPlayer.js
// Versión compacta con sincronización corregida y regiones

/**
 * Crea un reproductor multipista usando WaveSurfer global.
 * @param {Array<{id: string, archivo: string, nombre?: string, color?: string}>} audios
 * @param {HTMLElement} contenedor
 * @param {Object} opciones - Configuración adicional
 */
export function crearReproductorMultipista(audios, contenedor, opciones = {}) {
  const config = {
    alturaOnda: 40,
    permitirSolo: true,
    permitirMute: true,
    ...opciones
  };

  contenedor.innerHTML = '';
  contenedor.className = 'multitrack-player';

  // Estado del reproductor
  let isPlayingGlobal = false;
  let isSeeking = false;
  
  // Crear controles principales
  const mainControls = crearControlesPrincipales();
  contenedor.appendChild(mainControls);

  // Crear pistas
  const tracks = audios.map((audio, index) => crearPista(audio, index));
  
  // Configurar sincronización después de que todas las pistas estén listas
  configurarSincronizacion();

  // Funciones principales
  function crearControlesPrincipales() {
    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'main-controls';

    // Botón Play/Pause
    const playBtn = document.createElement('button');
    playBtn.className = 'play-btn';
    playBtn.innerHTML = '▶️';
    playBtn.addEventListener('click', togglePlayPause);
    controlsDiv.appendChild(playBtn);

    // Botón Stop
    const stopBtn = document.createElement('button');
    stopBtn.className = 'stop-btn';
    stopBtn.innerHTML = '⏹️';
    stopBtn.addEventListener('click', stopAll);
    controlsDiv.appendChild(stopBtn);

    // Timer
    const timer = document.createElement('div');
    timer.className = 'timer';
    timer.innerHTML = '<span class="current-time">00:00</span> / <span class="total-time">00:00</span>';
    controlsDiv.appendChild(timer);

    return controlsDiv;
  }

  function crearPista(audio, index) {
    const trackDiv = document.createElement('div');
    trackDiv.className = 'track-container';
    contenedor.appendChild(trackDiv);

    // Header compacto de la pista
    const header = document.createElement('div');
    header.className = 'track-header';

    // Nombre de la pista
    const nombre = document.createElement('div');
    nombre.className = 'track-name';
    nombre.textContent = audio.nombre || `Pista ${index + 1}`;
    header.appendChild(nombre);

    // Controles compactos
    const trackControls = document.createElement('div');
    trackControls.className = 'track-controls';

    // Botón Solo
    if (config.permitirSolo) {
      const soloBtn = document.createElement('button');
      soloBtn.className = 'solo-btn';
      soloBtn.textContent = 'S';
      trackControls.appendChild(soloBtn);
    }

    // Botón Mute
    if (config.permitirMute) {
      const muteBtn = document.createElement('button');
      muteBtn.className = 'mute-btn';
      muteBtn.textContent = 'M';
      trackControls.appendChild(muteBtn);
    }

    // Control de volumen inline
    const volumeSlider = document.createElement('input');
    volumeSlider.type = 'range';
    volumeSlider.min = 0;
    volumeSlider.max = 1;
    volumeSlider.step = 0.01;
    volumeSlider.value = 1;
    volumeSlider.className = 'volume-slider';
    volumeSlider.title = 'Volumen';
    trackControls.appendChild(volumeSlider);

    header.appendChild(trackControls);
    trackDiv.appendChild(header);

    // Área de forma de onda
    const waveDiv = document.createElement('div');
    waveDiv.className = 'waveform';
    trackDiv.appendChild(waveDiv);

    // Crear instancia WaveSurfer con regiones si está habilitado
    const wsOptions = {
      container: waveDiv,
      waveColor: audio.color || `hsl(${index * 50}, 70%, 50%)`,
      progressColor: audio.color ? darkenColor(audio.color) : `hsl(${index * 50}, 70%, 30%)`,
      cursorColor: '#fff',
      height: config.alturaOnda,
      responsive: true,
      normalize: true,
      backend: 'WebAudio',
      scrollParent: false
    };

    const ws = WaveSurfer.create(wsOptions);

    // Cargar archivo
    ws.load(audio.archivo);

    // Añadir plugin de regiones si está disponible y habilitado
    if (config.mostrarRegiones && window.WaveSurfer.regions) {
      ws.addPlugin(WaveSurfer.regions.create({
        regionsMinLength: 0.5,
        regions: [],
        dragSelection: {
          slop: 5
        }
      })).initPlugin('regions');
    }

    // Configurar propiedades adicionales del track
    const track = {
      ws,
      element: trackDiv,
      volumeSlider,
      soloBtn: trackControls.querySelector('.solo-btn'),
      muteBtn: trackControls.querySelector('.mute-btn'),
      volume: 1,
      isMuted: false,
      isSolo: false,
      id: audio.id,
      index
    };

    // Configurar eventos de la pista
    configurarEventosPista(track);

    return track;
  }

  function configurarEventosPista(track) {
    const { ws, volumeSlider, soloBtn, muteBtn } = track;

    // Control de volumen
    volumeSlider.addEventListener('input', (e) => {
      track.volume = parseFloat(e.target.value);
      updateTrackVolume(track);
    });

    // Botón Solo
    if (soloBtn) {
      soloBtn.addEventListener('click', () => toggleSolo(track));
    }

    // Botón Mute
    if (muteBtn) {
      muteBtn.addEventListener('click', () => toggleMute(track));
    }

    // Eventos de WaveSurfer
    ws.on('ready', () => {
      updateTotalTime();
    });

    // CORREGIDO: Seek sincronizado - capturar tanto click como drag
    ws.on('seek', (progress) => {
      sincronizarPistas(track, progress);
    });

    ws.on('interaction', () => {
      // Este evento se dispara durante el drag, asegurar sincronización
      const progress = ws.getCurrentTime() / ws.getDuration();
      sincronizarPistas(track, progress);
    });

    // Actualizar tiempo durante reproducción
    ws.on('audioprocess', (time) => {
      if (track === tracks[0] && !isSeeking) {
        updateCurrentTime(time);
      }
    });

    // Control de play/pause individual
    ws.on('play', () => {
      if (!isPlayingGlobal) {
        isPlayingGlobal = true;
        updatePlayButton();
        // Sincronizar otras pistas al tiempo actual
        const currentTime = ws.getCurrentTime();
        tracks.forEach(otherTrack => {
          if (otherTrack !== track) {
            const duration = otherTrack.ws.getDuration();
            if (duration > 0) {
              otherTrack.ws.seekTo(currentTime / duration);
              otherTrack.ws.play();
            }
          }
        });
      }
    });

    ws.on('pause', () => {
      pauseAll();
    });

    ws.on('finish', () => {
      const allFinished = tracks.every(t => t.ws.getCurrentTime() >= t.ws.getDuration());
      if (allFinished) {
        isPlayingGlobal = false;
        updatePlayButton();
      }
    });
  }

  function sincronizarPistas(sourceTrac, progress) {
    if (isSeeking) return;
    
    isSeeking = true;
    const sourceTime = progress * sourceTrac.ws.getDuration();
    
    // Sincronizar todas las otras pistas
    tracks.forEach(track => {
      if (track !== sourceTrac) {
        const duration = track.ws.getDuration();
        if (duration > 0) {
          const targetProgress = Math.min(sourceTime / duration, 1);
          track.ws.seekTo(targetProgress);
        }
      }
    });

    updateCurrentTime(sourceTime);
    
    // Mantener estado de reproducción
    if (isPlayingGlobal) {
      setTimeout(() => {
        tracks.forEach(track => {
          if (!track.ws.isPlaying()) {
            track.ws.play();
          }
        });
      }, 10);
    }
    
    setTimeout(() => {
      isSeeking = false;
    }, 50);
  }

  function configurarSincronizacion() {
    // La sincronización se maneja individualmente en cada pista
  }

  function togglePlayPause() {
    if (isPlayingGlobal) {
      pauseAll();
    } else {
      playAll();
    }
  }

  function playAll() {
    const referenceTime = tracks[0]?.ws.getCurrentTime() || 0;
    
    tracks.forEach(track => {
      const duration = track.ws.getDuration();
      if (duration > 0) {
        const progress = Math.min(referenceTime / duration, 1);
        track.ws.seekTo(progress);
        track.ws.play();
      }
    });
    
    isPlayingGlobal = true;
    updatePlayButton();
  }

  function pauseAll() {
    tracks.forEach(track => track.ws.pause());
    isPlayingGlobal = false;
    updatePlayButton();
  }

  function stopAll() {
    tracks.forEach(track => {
      track.ws.stop();
      track.ws.seekTo(0);
    });
    isPlayingGlobal = false;
    updatePlayButton();
    updateCurrentTime(0);
  }

  function toggleSolo(targetTrack) {
    targetTrack.isSolo = !targetTrack.isSolo;
    const hasSolo = tracks.some(t => t.isSolo);
    
    tracks.forEach(track => {
      updateTrackVolume(track);
      if (track.soloBtn) {
        track.soloBtn.classList.toggle('active', track.isSolo);
      }
    });
  }

  function toggleMute(track) {
    track.isMuted = !track.isMuted;
    updateTrackVolume(track);
    
    if (track.muteBtn) {
      track.muteBtn.classList.toggle('active', track.isMuted);
    }
  }

  function updateTrackVolume(track) {
    const hasSolo = tracks.some(t => t.isSolo);
    let volume = 0;
    
    if (!track.isMuted) {
      if (hasSolo) {
        volume = track.isSolo ? track.volume : 0;
      } else {
        volume = track.volume;
      }
    }
    
    track.ws.setVolume(volume);
  }

  // Funciones auxiliares
  function updatePlayButton() {
    const playBtn = contenedor.querySelector('.play-btn');
    playBtn.innerHTML = isPlayingGlobal ? '⏸️' : '▶️';
  }

  function updateCurrentTime(time) {
    const currentTimeEl = contenedor.querySelector('.current-time');
    if (currentTimeEl) {
      currentTimeEl.textContent = formatTime(time);
    }
  }

  function updateTotalTime() {
    const maxDuration = Math.max(...tracks.map(t => t.ws.getDuration()).filter(d => d > 0));
    const totalTimeEl = contenedor.querySelector('.total-time');
    if (totalTimeEl) {
      totalTimeEl.textContent = formatTime(maxDuration);
    }
  }

  function formatTime(sec) {
    if (isNaN(sec) || sec < 0) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function darkenColor(color) {
    if (color.startsWith('hsl')) {
      return color.replace(/(\d+)%\)/, (match, p1) => `${Math.max(0, parseInt(p1) - 20)}%)`);
    }
    return color;
  }

  // API pública
  return {
    play: playAll,
    pause: pauseAll,
    stop: stopAll,
    getTracks: () => tracks
  };
}