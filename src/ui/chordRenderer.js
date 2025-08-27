// ============================================
// ACTUALIZACIÓN: src/ui/chordRenderer.js - Mejor responsivo móvil
// 

/**
 * Obtiene la definición (posición, barras, etc.) de un acorde
 * @param {string} acorde Nombre limpio, e.g. "Am7"
 * @returns {object|null}
 */
export function obtenerPosicionesAcorde(acorde) {
  return acordesDefinidos[acorde] || null;
}

/**
 * MEJORADO: A partir del texto con corchetes [A-G…], extrae los acordes únicos
 * y los dibuja en el contenedor dado con mejor estructura responsiva.
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

  // MEJORADO: Contenedor base con estructura responsiva
  const wrapper = document.createElement('div');
  wrapper.className = 'contenedor-acordes';
  
  const titulo = document.createElement('h3');
  titulo.textContent = 'Acordes de guitarra usados:';
  wrapper.appendChild(titulo);

  // NUEVO: Grid container para mejor organización en móvil
  const gridContainer = document.createElement('div');
  gridContainer.className = 'acordes-grid';
  wrapper.appendChild(gridContainer);

  encontrados.forEach((acordeLimpio) => {
    const pos = obtenerPosicionesAcorde(acordeLimpio);
    if (!pos) {
      console.warn(`Acorde no definido: ${acordeLimpio}`);
      return;
    }

    const diagrama = document.createElement('div');
    diagrama.className = 'diagrama-acorde';

    // MEJORADO: Tamaños más apropiados para móvil
    const isMobile = window.innerWidth <= 640;
    const svgWidth = isMobile ? 60 : 80;
    const svgHeight = isMobile ? 78 : 105;

    // Usa Raphael + ChordBox como en scripts.js
    const paper = Raphael(diagrama, svgWidth, svgHeight);
    const chord = new ChordBox(paper, 0, 5, svgWidth * 0.75, svgHeight * 0.76);
    chord.setChord(pos.chord, pos.position, pos.bars);
    chord.draw();

    const label = document.createElement('div');
    label.className = 'nombre-acorde';
    label.textContent = acordeLimpio;
    label.title = acordeLimpio; // Tooltip para acordes largos

    diagrama.appendChild(label);
    
    // CAMBIO: Agregar al grid en lugar de directamente al wrapper
    gridContainer.appendChild(diagrama);
  });

  // Añadir al DOM
  contenedor.appendChild(wrapper);
}