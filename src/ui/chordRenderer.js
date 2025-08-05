// src/ui/chordRenderer.js

/**
 * Obtiene la definición (posición, barras, etc.) de un acorde
 * @param {string} acorde Nombre limpio, e.g. "Am7"
 * @returns {object|null}
 */
export function obtenerPosicionesAcorde(acorde) {
  return acordesDefinidos[acorde] || null;
}

/**
 * A partir del texto con corchetes [A-G…], extrae los acordes únicos
 * y los dibuja en el contenedor dado.
 * @param {string} textoAcordes Texto con etiquetas [C],[G#m7],…
 * @param {HTMLElement} contenedor Nodo donde insertar los diagramas
 */
export function mostrarAcordesUtilizados(textoAcordes, contenedor) {
  // Limpiar contenedor primero
  contenedor.innerHTML = '';
  
  if (!textoAcordes || !textoAcordes.trim()) {
    // No mostrar error, simplemente no hacer nada si no hay acordes
    return;
  }

  // Regex: busca [A-G](#|b)?(maj7|dim|aug|m7|m|7)?
  const acordeRegex = /\[([A-G](#|b)?(maj7|dim|aug|m7|m|7)?)\]/g;
  const encontrados = new Set();
  let match;
  while ((match = acordeRegex.exec(textoAcordes))) {
    encontrados.add(match[1]);
  }

  // Si no se encontraron acordes, no mostrar nada
  if (encontrados.size === 0) {
    return;
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

    // Usa Raphael + ChordBox como en scripts.js
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

  // Añadir al DOM
  contenedor.appendChild(wrapper);
}