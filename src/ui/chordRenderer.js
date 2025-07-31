// src/ui/chordRenderer.js
/**
 * Obtiene la definición (posición, barras, etc.) de un acorde
 * @param {string} acorde Nombre limpio, e.g. "Am7"
 * @returns {object|null}
 */
export function obtenerPosicionesAcorde(acorde) {
  return acordesDefinidos[acorde] || null;              // idéntico a scripts.js :contentReference[oaicite:3]{index=3}
}

/**
 * A partir del texto con corchetes [A-G…], extrae los acordes únicos
 * y los dibuja en el contenedor dado.
 * @param {string} textoAcordes Texto con etiquetas [C],[G#m7],…
 * @param {HTMLElement} contenedor Nodo donde insertar los diagramas
 */
export function mostrarAcordesUtilizados(textoAcordes, contenedor) {
  if (!textoAcordes) return console.error("No hay texto de acordes");  // :contentReference[oaicite:4]{index=4}

  // Regex: busca [A-G](#|b)?(maj7|dim|aug|m7|m|7)?
  const acordeRegex = /\[([A-G](#|b)?(maj7|dim|aug|m7|m|7)?)\]/g;
  const encontrados = new Set();
  let match;
  while ((match = acordeRegex.exec(textoAcordes))) {
    encontrados.add(match[1]);
  }

  // Contenedor base
  const wrapper = document.createElement('div');
  wrapper.className = 'contenedor-acordes';
  wrapper.innerHTML = '<h3>Acordes usados:</h3>';

  encontrados.forEach((acordeLimpio) => {
    const pos = obtenerPosicionesAcorde(acordeLimpio);
    if (!pos) {
      console.warn(`Acorde no definido: ${acordeLimpio}`);
      return;
    }

    const diagrama = document.createElement('div');
    diagrama.className = 'diagrama-acorde';

    // Usa Raphael + ChordBox como en scripts.js :contentReference[oaicite:5]{index=5}
    const paper = Raphael(diagrama, 80, 125);
    const chord = new ChordBox(paper, 0, 5, 60, 80);
    chord.setChord(pos.chord, pos.position, pos.bars);
    chord.draw();

    const label = document.createElement('div');
    label.className = 'nombre-acorde';
    label.textContent = acordeLimpio;

    diagrama.appendChild(label);
    wrapper.appendChild(diagrama);
  });

  // Limpia y añade al DOM
  contenedor.innerHTML = '';
  contenedor.appendChild(wrapper);
}
