// Archivo: src/ui/multiTrackPlayer.js
// Esta versión asume que WaveSurfer está cargado globalmente (vía <script> en index.html)
// por lo que no usamos import.

/**
 * Crea un reproductor multipista usando WaveSurfer global.
 * @param {Array<{id: string, archivo: string, nombre?: string}>} audios
 * @param {HTMLElement} contenedor
 */
export function crearReproductorMultipista(audios, contenedor) {
  contenedor.innerHTML = ''; // limpiar contenedor

  const tracks = audios.map(audio => {
    const trackDiv = document.createElement('div');
    trackDiv.className = 'track-container';
    contenedor.appendChild(trackDiv);

    const nombre = document.createElement('div');
    nombre.className = 'track-name';
    nombre.textContent = audio.nombre || audio.id;
    trackDiv.appendChild(nombre);

    const waveDiv = document.createElement('div');
    waveDiv.className = 'waveform';
    trackDiv.appendChild(waveDiv);

    const volCtrl = document.createElement('input');
    volCtrl.type = 'range';
    volCtrl.min = 0;
    volCtrl.max = 1;
    volCtrl.step = 0.01;
    volCtrl.value = 1;
    trackDiv.appendChild(volCtrl);

    // Usar WaveSurfer global (window.WaveSurfer)
    const ws = WaveSurfer.create({
      container: waveDiv,
      waveColor: '#AAA',
      progressColor: '#555',
      height: 60,
      responsive: true
    });
    ws.load(audio.archivo);

    volCtrl.addEventListener('input', e => ws.setVolume(e.target.value));
    return ws;
  });

  // Botón de Play/Pause global
  const btn = document.createElement('button');
  btn.textContent = '▶️/⏸️';
  btn.addEventListener('click', () => {
    const playing = tracks.some(t => t.isPlaying());
    if (playing) tracks.forEach(t => t.pause());
    else tracks.forEach(t => t.play());
  });
  contenedor.prepend(btn);

  // Sincronizar reproducción entre pistas
  tracks.forEach(t => {
    t.on('play', () => {
      const time = t.getCurrentTime();
      tracks.forEach(o => {
        if (o !== t) {
          o.seekTo(time / (o.getDuration()||1));
          o.play();
        }
      });
    });
    t.on('pause', () => {
      tracks.forEach(o => o.pause());
    });
  });
}
